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
    """Detects an A4 paper (29.7cm x 21.0cm) to find the pixels-per-meter scale."""
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    blur = cv2.GaussianBlur(gray, (5, 5), 0)
    # Target bright white objects (the paper)
    _, thresh = cv2.threshold(blur, 220, 255, cv2.THRESH_BINARY)
    
    contours, _ = cv2.findContours(thresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    
    for cnt in contours:
        # Approximate the shape
        peri = cv2.arcLength(cnt, True)
        approx = cv2.approxPolyDP(cnt, 0.02 * peri, True)
        
        # If it has 4 corners and isn't too small
        if len(approx) == 4 and cv2.contourArea(cnt) > 500:
            # Get the bounding box
            x, y, w, h = cv2.boundingRect(approx)
            pixel_length = max(w, h)
            # A4 long side is 0.297 meters
            meters_per_pixel = 0.297 / pixel_length
            return float(meters_per_pixel)
            
    return None

def detect_defects(img_path):
    all_results = []
    img = cv2.imread(img_path)
    if img is None:
        return [], {"width": 0, "height": 0, "length": 0, "area": 0}, False
        
    img_rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
    
    # Check for A4 Calibration
    m_per_px = find_a4_calibration(img)
    is_calibrated = m_per_px is not None

    # 1. Detection Logic
    obj_res = obj_model(img_path)
    for r in obj_res:
        for box in r.boxes:
            all_results.append({
                "label": str(obj_model.names[int(box.cls)]),
                "confidence": float(box.conf[0]),
                "bbox": [float(x) for x in box.xyxy[0].tolist()],
                "isCrack": False
            })

    crack_res = crack_model.predict(source=img_path, conf=0.15)
    for r in crack_res:
        for box in r.boxes:
            all_results.append({
                "label": "Structural Crack",
                "confidence": float(box.conf[0]),
                "bbox": [float(x) for x in box.xyxy[0].tolist()],
                "isCrack": True
            })

    # 2. Depth Logic
    input_batch = midas_transforms.small_transform(img_rgb).to(device)
    with torch.no_grad():
        prediction = midas(input_batch)
        prediction = torch.nn.functional.interpolate(
            prediction.unsqueeze(1),
            size=img.shape[:2],
            mode="bicubic",
            align_corners=False,
        ).squeeze()
    
    depth_map = prediction.cpu().numpy()
    max_d = float(np.max(depth_map))
    rel_depth_range = float(max_d - np.min(depth_map))

    # 3. Scaling Logic (The Fix)
    if is_calibrated and m_per_px:
        # Real-world width/height based on A4 scale
        est_width = float(img.shape[1] * m_per_px)
        est_height = float(img.shape[0] * m_per_px)
        # Length is scaled relative to the room proportions
        est_length = (rel_depth_range / max_d) * (est_width * 1.8)
    else:
        # Fallback to defaults if no paper found
        est_height = 2.7
        est_width = (img.shape[1] / img.shape[0]) * est_height
        est_length = (rel_depth_range / max_d) * 11.0

    spatial_data = {
        "width": round(float(est_width), 2),
        "height": round(float(est_height), 2),
        "length": round(float(est_length), 2),
        "area": round(float(est_width * est_length), 2)
    }

    return all_results, spatial_data, is_calibrated