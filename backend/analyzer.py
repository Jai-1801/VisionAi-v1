import cv2
import torch
import numpy as np
from ultralytics import YOLO
import os

# Load Vision Models
# Note: Ensure these .pt files are in your project directory
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
    
    # 1. Smooth out floor texture while keeping paper edges sharp
    blurred = cv2.bilateralFilter(gray, 9, 75, 75)
    
    # 2. Thresholding - Adaptive handles shadows better than global thresholds
    thresh = cv2.adaptiveThreshold(blurred, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, 
                                   cv2.THRESH_BINARY_INV, 11, 2)
    
    # 3. Clean up mask gaps
    kernel = np.ones((5, 5), np.uint8)
    closed = cv2.morphologyEx(thresh, cv2.MORPH_CLOSE, kernel)
    
    contours, _ = cv2.findContours(closed, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    
    candidates = []
    for cnt in contours:
        area = cv2.contourArea(cnt)
        if area < 3000: continue # Skip noise
        
        # 4. Geometric Verification: Must have 4 corners
        peri = cv2.arcLength(cnt, True)
        approx = cv2.approxPolyDP(cnt, 0.02 * peri, True)
        
        if len(approx) == 4:
            rect = cv2.minAreaRect(cnt)
            (cx, cy), (rw, rh), angle = rect
            if min(rw, rh) == 0: continue
            
            aspect = max(rw, rh) / min(rw, rh)
            
            # A4 aspect ratio is 1.414. We accept a range.
            if 1.2 < aspect < 1.7:
                # Score based on how close it is to ideal A4 ratio
                score = 1.0 - abs(aspect - 1.414)
                candidates.append({'approx': approx, 'score': score, 'rect': rect})

    if not candidates:
        return None, None

    # Pick the best candidate
    best = max(candidates, key=lambda x: x['score'])
    rect = best['rect']
    
    # Standard A4 is 0.297m (Long Side)
    pixel_length = max(rect[1])
    m_per_px = 0.297 / pixel_length
    
    x, y, w, h = cv2.boundingRect(best['approx'])
    return float(m_per_px), [float(x), float(y), float(w), float(h)]

def detect_defects(img_path):
    img = cv2.imread(img_path)
    if img is None:
        return [], {"width": 0.0, "height": 0.0, "length": 0.0, "area": 0.0}, False, [0, 0]
        
    h_orig, w_orig = img.shape[:2]
    img_rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
    
    # --- 1. Calibration ---
    m_per_px, a4_bbox = find_a4_calibration(img)
    is_calibrated = m_per_px is not None
    
    all_results = []
    if is_calibrated:
        all_results.append({
            "label": "A4 Reference",
            "confidence": 1.0,
            "bbox": a4_bbox,
            "isCrack": False,
            "isCalibration": True
        })

    # --- 2. Detections ---
    # Objects (YOLO)
    obj_res = obj_model(img)
    for r in obj_res:
        for box in r.boxes:
            b = box.xyxy[0].tolist()
            all_results.append({
                "label": str(obj_model.names[int(box.cls)]),
                "confidence": float(box.conf[0]),
                "bbox": [b[0], b[1], b[2]-b[0], b[3]-b[1]],
                "isCrack": False,
                "isCalibration": False
            })

    # Cracks (Custom Model)
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

    # --- 3. Spatial Math (Fixes the KeyError) ---
    spatial_data = {
        "width": 0.0,
        "height": 0.0,
        "length": 0.0,
        "area": 0.0
    }

    if is_calibrated:
        # Calculate real world values
        # Area uses m_per_px squared
        spatial_data["area"] = float(total_crack_pixel_area * (m_per_px ** 2))
        # Length/Width approximation based on crack bounding boxes
        spatial_data["length"] = float(max_crack_dim_px * m_per_px)
        spatial_data["width"] = float((total_crack_pixel_area / max_crack_dim_px if max_crack_dim_px > 0 else 0) * m_per_px)

    return all_results, spatial_data, is_calibrated, [h_orig, w_orig]