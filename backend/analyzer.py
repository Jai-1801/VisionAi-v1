from ultralytics import YOLO
import torch
import cv2
import numpy as np
import os

# Load Vision Models
obj_model = YOLO('yolov8n.pt')
crack_model = YOLO('crack.pt')

# Load MiDaS for Depth
model_type = "MiDaS_small"
midas = torch.hub.load("intel-isl/MiDaS", model_type, trust_repo=True)
midas_transforms = torch.hub.load("intel-isl/MiDaS", "transforms", trust_repo=True)
device = torch.device("cuda") if torch.cuda.is_available() else torch.device("cpu")
midas.to(device).eval()

def find_a4_calibration(img):
    """Detects an A4 paper and returns (meters_per_pixel, bbox_coordinates)."""
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    blur = cv2.GaussianBlur(gray, (5, 5), 0)
    # Higher threshold (230) ensures we target actual white paper, not floor glare
    _, thresh = cv2.threshold(blur, 230, 255, cv2.THRESH_BINARY)
    
    contours, _ = cv2.findContours(thresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    
    for cnt in contours:
        peri = cv2.arcLength(cnt, True)
        approx = cv2.approxPolyDP(cnt, 0.02 * peri, True)
        
        if len(approx) == 4 and cv2.contourArea(cnt) > 800:
            x, y, w, h = cv2.boundingRect(approx)
            aspect_ratio = float(max(w, h)) / min(w, h)
            
            # A4 aspect ratio is ~1.41. Validation prevents wrong object detection.
            if 1.3 < aspect_ratio < 1.6:
                pixel_length = max(w, h)
                m_per_px = 0.297 / pixel_length
                # Return m_per_px and bounding box in [x, y, w, h] format
                return float(m_per_px), [float(x), float(y), float(w), float(h)]
            
    return None, None

def detect_defects(img_path):
    all_results = []
    img = cv2.imread(img_path)
    if img is None:
        return [], {"width": 0, "height": 0, "length": 0, "area": 0}, False, [0, 0]
        
    h_orig, w_orig = img.shape[:2]
    img_rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
    
    # Check for A4 Calibration and get its box
    m_per_px, a4_bbox = find_a4_calibration(img)
    is_calibrated = m_per_px is not None

    # Add A4 detection to results for the UI
    if a4_bbox:
        all_results.append({
            "label": "A4 Reference",
            "confidence": 1.0,
            "bbox": a4_bbox,
            "isCrack": False,
            "isCalibration": True
        })

    # Standard Object Detection
    obj_res = obj_model(img_path)
    for r in obj_res:
        for box in r.boxes:
            # Convert xyxy to [x, y, w, h]
            b = box.xyxy[0].tolist()
            all_results.append({
                "label": str(obj_model.names[int(box.cls)]),
                "confidence": float(box.conf[0]),
                "bbox": [b[0], b[1], b[2]-b[0], b[3]-b[1]],
                "isCrack": False,
                "isCalibration": False
            })

    # Crack Detection
    crack_res = crack_model.predict(source=img_path, conf=0.15)
    for r in crack_res:
        for box in r.boxes:
            b = box.xyxy[0].tolist()
            all_results.append({
                "label": "Structural Crack",
                "confidence": float(box.conf[0]),
                "bbox": [b[0], b[1], b[2]-b[0], b[3]-b[1]],
                "isCrack": True,
                "isCalibration": False
            })

    # Depth Logic
    input_batch = midas_transforms.small_transform(img_rgb).to(device)
    with torch.no_grad():
        prediction = midas(input_batch)
        prediction = torch.nn.functional.interpolate(prediction.unsqueeze(1), size=(h_orig, w_orig), mode="bicubic").squeeze()
    
    depth_map = prediction.cpu().numpy()
    max_d = float(np.max(depth_map))
    rel_depth_range = float(max_d - np.min(depth_map))

    # Scaling Logic
    if is_calibrated:
        est_width = float(w_orig * m_per_px)
        est_height = float(h_orig * m_per_px)
        est_length = (rel_depth_range / max_d) * (est_width * 2.1)
    else:
        est_height = 2.6
        est_width = (w_orig / h_orig) * est_height
        est_length = (rel_depth_range / max_d) * 10.0

    spatial_data = {
        "width": round(float(est_width), 2),
        "height": round(float(est_height), 2),
        "length": round(float(est_length), 2),
        "area": round(float(est_width * est_length), 2)
    }

    return all_results, spatial_data, is_calibrated, [h_orig, w_orig]