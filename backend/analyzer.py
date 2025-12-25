import cv2
import torch
import numpy as np
from ultralytics import YOLO
import os

# Room type detection (CLIP/ViT zero-shot)
from transformers import CLIPProcessor, CLIPModel

# Floor segmentation (ADE20K, SegFormer)
from transformers import SegformerFeatureExtractor, SegformerForSemanticSegmentation

# Load SegFormer model for ADE20K segmentation (only once)
segformer_processor = SegformerFeatureExtractor.from_pretrained(
    "nvidia/segformer-b0-finetuned-ade-512-512")
segformer_model = SegformerForSemanticSegmentation.from_pretrained(
    "nvidia/segformer-b0-finetuned-ade-512-512")

# Load CLIP model for room type detection (only once)
clip_model = CLIPModel.from_pretrained("openai/clip-vit-base-patch16")
clip_processor = CLIPProcessor.from_pretrained("openai/clip-vit-base-patch16")

# Room type labels for zero-shot
ROOM_TYPE_LABELS = [
    "a bedroom",
    "a living room",
    "a kitchen",
    "a bathroom",
    "an office"
]

# Reference object dimensions in meters (width, height) - using typical sizes
# These are used to estimate scale when detected in images
REFERENCE_OBJECTS = {
    "bed": {"width": 1.9, "height": 0.5, "priority": 1},
    "couch": {"width": 2.0, "height": 0.85, "priority": 2},
    "sofa": {"width": 2.0, "height": 0.85, "priority": 2},
    "chair": {"width": 0.45, "height": 0.9, "priority": 4},
    "dining table": {"width": 1.2, "height": 0.75, "priority": 3},
    "refrigerator": {"width": 0.7, "height": 1.7, "priority": 2},
    "tv": {"width": 1.2, "height": 0.7, "priority": 5},
    "door": {"width": 0.9, "height": 2.1, "priority": 1},
    "toilet": {"width": 0.4, "height": 0.4, "priority": 3},
    "oven": {"width": 0.6, "height": 0.9, "priority": 4},
    "sink": {"width": 0.6, "height": 0.2, "priority": 5},
}

# Average room sizes in square meters by room type (for fallback estimation)
AVERAGE_ROOM_SIZES = {
    "bedroom": {"small": 9, "medium": 14, "large": 20},
    "living room": {"small": 15, "medium": 22, "large": 35},
    "kitchen": {"small": 8, "medium": 12, "large": 18},
    "bathroom": {"small": 4, "medium": 6, "large": 10},
    "office": {"small": 9, "medium": 14, "large": 20},
}

# Load Vision Models
obj_model = YOLO('yolov8n.pt')
crack_model = YOLO('crack.pt')

# Load MiDaS for Depth
model_type = "MiDaS_small"
device = torch.device("cuda") if torch.cuda.is_available() else torch.device("cpu")
midas = torch.hub.load("intel-isl/MiDaS", model_type, trust_repo=True).to(device).eval()
midas_transforms = torch.hub.load("intel-isl/MiDaS", "transforms", trust_repo=True)


def find_a4_calibration(img):
    """
    Detects ONLY the A4 sheet by verifying it is a 4-sided polygon 
    with a specific aspect ratio (~1.41).
    """
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    blurred = cv2.bilateralFilter(gray, 9, 75, 75)
    thresh = cv2.adaptiveThreshold(blurred, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C,
                                   cv2.THRESH_BINARY_INV, 11, 2)
    kernel = np.ones((5, 5), np.uint8)
    closed = cv2.morphologyEx(thresh, cv2.MORPH_CLOSE, kernel)
    contours, _ = cv2.findContours(closed, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

    candidates = []
    for cnt in contours:
        area = cv2.contourArea(cnt)
        if area < 3000:
            continue

        peri = cv2.arcLength(cnt, True)
        approx = cv2.approxPolyDP(cnt, 0.02 * peri, True)

        if len(approx) == 4:
            rect = cv2.minAreaRect(cnt)
            (cx, cy), (rw, rh), angle = rect
            if min(rw, rh) == 0:
                continue

            aspect = max(rw, rh) / min(rw, rh)
            if 1.2 < aspect < 1.7:
                score = 1.0 - abs(aspect - 1.414)
                candidates.append({'approx': approx, 'score': score, 'rect': rect})

    if not candidates:
        return None, None

    best = max(candidates, key=lambda x: x['score'])
    rect = best['rect']
    pixel_length = max(rect[1])
    m_per_px = 0.297 / pixel_length

    x, y, w, h = cv2.boundingRect(best['approx'])
    return float(m_per_px), [float(x), float(y), float(w), float(h)]


def estimate_scale_from_reference_objects(detections, img_width, img_height):
    """
    Estimate meters-per-pixel using detected reference objects.
    Returns (m_per_px, reference_object_used, confidence)
    """
    best_reference = None
    best_priority = 999
    best_m_per_px = None
    
    for det in detections:
        label = det.get("label", "").lower()
        bbox = det.get("bbox", [])
        
        if len(bbox) < 4:
            continue
            
        # Check if this object is a known reference
        for ref_name, ref_data in REFERENCE_OBJECTS.items():
            if ref_name in label:
                bbox_width_px = bbox[2]  # width in pixels
                bbox_height_px = bbox[3]  # height in pixels
                
                # Use the larger dimension for more reliable estimation
                if bbox_width_px > bbox_height_px:
                    # Object appears wider - use width for scale
                    m_per_px = ref_data["width"] / bbox_width_px
                else:
                    # Object appears taller - use height for scale
                    m_per_px = ref_data["height"] / bbox_height_px
                
                # Check if this is a better (higher priority) reference
                if ref_data["priority"] < best_priority:
                    best_priority = ref_data["priority"]
                    best_reference = ref_name
                    best_m_per_px = m_per_px
                break
    
    if best_m_per_px is not None:
        # Confidence based on priority (1 = highest confidence)
        confidence = max(0.5, 1.0 - (best_priority - 1) * 0.1)
        return best_m_per_px, best_reference, confidence
    
    return None, None, 0.0


def estimate_room_size_category(floor_pixel_ratio, room_type):
    """
    Estimate if room is small/medium/large based on floor coverage in image.
    floor_pixel_ratio: ratio of floor pixels to total image pixels
    """
    # Higher floor ratio usually means smaller room (camera captures more of floor)
    if floor_pixel_ratio > 0.4:
        return "small"
    elif floor_pixel_ratio > 0.2:
        return "medium"
    else:
        return "large"


def detect_defects(img_path):
    img = cv2.imread(img_path)
    if img is None:
        return [], {
            "width": 0.0, "height": 0.0, "length": 0.0, "area": 0.0,
            "room_type": "unknown", "room_confidence": 0.0,
            "area_confidence": 0.0, "estimation_method": "none"
        }, False, [0, 0]

    h_orig, w_orig = img.shape[:2]
    img_rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
    total_pixels = h_orig * w_orig

    # --- Floor Segmentation (ADE20K, SegFormer) ---
    seg_inputs = segformer_processor(images=img_rgb, return_tensors="pt")
    with torch.no_grad():
        seg_outputs = segformer_model(**seg_inputs)
        seg_logits = seg_outputs.logits.cpu().numpy()[0]
        seg_mask = np.argmax(seg_logits, axis=0)
    floor_mask = (seg_mask == 3).astype(np.uint8)
    floor_pixel_count = int(np.sum(floor_mask))
    floor_pixel_ratio = floor_pixel_count / (seg_mask.shape[0] * seg_mask.shape[1])

    # --- Room Type Detection (CLIP/ViT zero-shot) ---
    from PIL import Image
    pil_img = Image.fromarray(img_rgb)
    inputs = clip_processor(text=ROOM_TYPE_LABELS, images=pil_img, return_tensors="pt", padding=True)
    with torch.no_grad():
        outputs = clip_model(**inputs)
        logits_per_image = outputs.logits_per_image
        probs = logits_per_image.softmax(dim=1).cpu().numpy()[0]
    best_idx = int(np.argmax(probs))
    room_type_raw = ROOM_TYPE_LABELS[best_idx]
    room_type = room_type_raw.replace("a ", "").replace("an ", "").strip().title()
    room_type_key = room_type.lower()
    room_confidence = float(probs[best_idx])

    # --- MiDaS Depth Estimation ---
    input_batch = midas_transforms.small_transform(img_rgb).to(device)
    with torch.no_grad():
        prediction = midas(input_batch)
        prediction = torch.nn.functional.interpolate(
            prediction.unsqueeze(1), size=(h_orig, w_orig), mode="bicubic"
        ).squeeze()
    depth_map = prediction.cpu().numpy()
    depth_range = float(np.max(depth_map) - np.min(depth_map))

    # --- 1. Calibration (A4 first, then reference objects) ---
    m_per_px, a4_bbox = find_a4_calibration(img)
    is_a4_calibrated = m_per_px is not None

    all_results = []
    if is_a4_calibrated:
        all_results.append({
            "label": "A4 Reference",
            "confidence": 1.0,
            "bbox": a4_bbox,
            "isCrack": False,
            "isCalibration": True
        })

    # Add room type result
    all_results.append({
        "label": "Room Type",
        "room_type": room_type,
        "confidence": room_confidence,
        "isRoomType": True
    })

    # Add floor segmentation result
    all_results.append({
        "label": "Floor Segmentation",
        "floor_pixel_count": floor_pixel_count,
        "floor_ratio": round(floor_pixel_ratio, 3),
        "isFloorMask": True
    })

    # --- 2. Object Detections (YOLO) ---
    obj_res = obj_model(img)
    object_detections = []
    for r in obj_res:
        for box in r.boxes:
            b = box.xyxy[0].tolist()
            det = {
                "label": str(obj_model.names[int(box.cls)]),
                "confidence": float(box.conf[0]),
                "bbox": [b[0], b[1], b[2]-b[0], b[3]-b[1]],
                "isCrack": False,
                "isCalibration": False
            }
            object_detections.append(det)
            all_results.append(det)

    # --- 3. Crack Detections (Custom Model) ---
    crack_res = crack_model.predict(source=img, conf=0.15)
    total_crack_pixel_area = 0
    max_crack_dim_px = 0

    for r in crack_res:
        for box in r.boxes:
            b = box.xyxy[0].tolist()
            bw, bh = b[2]-b[0], b[3]-b[1]
            total_crack_pixel_area += (bw * bh)
            max_crack_dim_px = max(max_crack_dim_px, bw, bh)

            all_results.append({
                "label": "Structural Crack",
                "confidence": float(box.conf[0]),
                "bbox": [b[0], b[1], bw, bh],
                "isCrack": True,
                "isCalibration": False
            })

    # --- 4. Scale Estimation (Reference Objects if no A4) ---
    reference_object_used = None
    ref_confidence = 0.0
    
    if not is_a4_calibrated:
        ref_m_per_px, reference_object_used, ref_confidence = estimate_scale_from_reference_objects(
            object_detections, w_orig, h_orig
        )
        if ref_m_per_px is not None:
            m_per_px = ref_m_per_px

    # --- 5. Area Calculation ---
    spatial_data = {
        "width": 0.0,
        "height": 0.0,
        "length": 0.0,
        "area": 0.0,
        "room_type": room_type,
        "room_confidence": round(room_confidence * 100, 1),
        "area_confidence": 0.0,
        "estimation_method": "none",
        "reference_object": reference_object_used
    }

    is_calibrated = m_per_px is not None

    if is_calibrated and floor_pixel_count > 0:
        # Best case: We have scale AND floor segmentation
        # Scale up the segmentation mask to original image size
        seg_h, seg_w = seg_mask.shape
        scale_factor = (h_orig / seg_h) * (w_orig / seg_w)
        scaled_floor_pixels = floor_pixel_count * scale_factor
        
        area_sq_m = scaled_floor_pixels * (m_per_px ** 2)
        
        # Sanity check: room areas typically 4-100 sq.m
        if area_sq_m < 2:
            area_sq_m *= 10  # Likely underestimated
        elif area_sq_m > 200:
            area_sq_m /= 10  # Likely overestimated
        
        # Estimate dimensions as sqrt for roughly square rooms
        side = np.sqrt(area_sq_m)
        
        spatial_data["area"] = round(float(area_sq_m), 2)
        spatial_data["width"] = round(float(side * 1.1), 2)  # Slightly wider
        spatial_data["length"] = round(float(side * 0.9), 2)  # Slightly shorter
        spatial_data["height"] = 2.7  # Standard ceiling height
        
        if is_a4_calibrated:
            spatial_data["estimation_method"] = "a4_calibration"
            spatial_data["area_confidence"] = 85.0
        else:
            spatial_data["estimation_method"] = "reference_object"
            spatial_data["area_confidence"] = round(ref_confidence * 80, 1)
            
    elif floor_pixel_count > 0:
        # Fallback: Use room type averages with floor ratio hint
        size_category = estimate_room_size_category(floor_pixel_ratio, room_type_key)
        
        if room_type_key in AVERAGE_ROOM_SIZES:
            avg_area = AVERAGE_ROOM_SIZES[room_type_key][size_category]
        else:
            avg_area = AVERAGE_ROOM_SIZES["bedroom"][size_category]
        
        side = np.sqrt(avg_area)
        
        spatial_data["area"] = round(float(avg_area), 2)
        spatial_data["width"] = round(float(side * 1.1), 2)
        spatial_data["length"] = round(float(side * 0.9), 2)
        spatial_data["height"] = 2.7
        spatial_data["estimation_method"] = f"room_average_{size_category}"
        spatial_data["area_confidence"] = 40.0  # Low confidence for averages
        
    else:
        # Worst case: No floor detected, use very rough estimate
        if room_type_key in AVERAGE_ROOM_SIZES:
            avg_area = AVERAGE_ROOM_SIZES[room_type_key]["medium"]
        else:
            avg_area = 14.0  # Default medium room
        
        side = np.sqrt(avg_area)
        
        spatial_data["area"] = round(float(avg_area), 2)
        spatial_data["width"] = round(float(side * 1.1), 2)
        spatial_data["length"] = round(float(side * 0.9), 2)
        spatial_data["height"] = 2.7
        spatial_data["estimation_method"] = "room_type_default"
        spatial_data["area_confidence"] = 25.0

    return all_results, spatial_data, is_calibrated, [h_orig, w_orig]
