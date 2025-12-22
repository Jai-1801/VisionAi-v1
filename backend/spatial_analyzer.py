import cv2
import torch
import numpy as np
from ultralytics import YOLO

# Load Vision Models
obj_model = YOLO('yolov8n.pt')
crack_model = YOLO('crack.pt')

# Load MiDaS
model_type = "MiDaS_small"
device = torch.device("cuda") if torch.cuda.is_available() else torch.device("cpu")
midas = torch.hub.load("intel-isl/MiDaS", model_type, trust_repo=True).to(device).eval()
midas_transforms = torch.hub.load("intel-isl/MiDaS", "transforms", trust_repo=True)

def find_a4_calibration(img):
    """Detects A4 paper to establish a Meters-per-Pixel scale."""
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    blurred = cv2.bilateralFilter(gray, 9, 75, 75)
    thresh = cv2.adaptiveThreshold(blurred, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, 
                                   cv2.THRESH_BINARY_INV, 11, 2)
    
    contours, _ = cv2.findContours(thresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    
    for cnt in contours:
        if cv2.contourArea(cnt) < 3000: continue
        peri = cv2.arcLength(cnt, True)
        approx = cv2.approxPolyDP(cnt, 0.02 * peri, True)
        
        if len(approx) == 4:
            rect = cv2.minAreaRect(cnt)
            _, (rw, rh), _ = rect
            aspect = max(rw, rh) / (min(rw, rh) if min(rw, rh) > 0 else 1)
            
            if 1.2 < aspect < 1.7:
                m_per_px = 0.297 / max(rw, rh)
                x, y, w, h = cv2.boundingRect(approx)
                return float(m_per_px), [float(x), float(y), float(w), float(h)]
    return None, None

def analyze_frame(img_path):
    img = cv2.imread(img_path)
    if img is None: return None
    h_orig, w_orig = img.shape[:2]
    
    # 1. Calibration
    m_per_px, a4_bbox = find_a4_calibration(img)
    
    # 2. MiDaS Depth
    img_rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
    input_batch = midas_transforms.small_transform(img_rgb).to(device)
    with torch.no_grad():
        prediction = midas(input_batch)
        prediction = torch.nn.functional.interpolate(
            prediction.unsqueeze(1), size=(h_orig, w_orig), mode="bicubic"
        ).squeeze()
    depth_map = prediction.cpu().numpy()

    # 3. Detections
    all_results = []
    if a4_bbox:
        all_results.append({"label": "A4 Reference", "bbox": a4_bbox, "isCrack": False, "isCalibration": True})

    crack_res = crack_model.predict(img, conf=0.15, verbose=False)
    max_crack_px = 0
    for r in crack_res:
        for box in r.boxes:
            b = box.xyxy[0].tolist()
            bw, bh = b[2]-b[0], b[3]-b[1]
            max_crack_px = max(max_crack_px, bw, bh)
            all_results.append({"label": "Crack", "bbox": [b[0], b[1], bw, bh], "isCrack": True, "isCalibration": False})

    # 4. Spatial Logic (Unified)
    # If we have A4, use it. Otherwise, fallback to MiDaS relative scaling.
    if m_per_px:
        width = w_orig * m_per_px
        length = (np.max(depth_map) - np.min(depth_map)) * 0.05 # Depth scaling
    else:
        width = w_orig / 100
        length = (np.max(depth_map) - np.min(depth_map)) * 0.1

    spatial_data = {
        "width": round(float(width), 2),
        "height": round(float(h_orig / 100), 2),
        "length": round(float(length), 2),
        "area": round(float(width * length), 2)
    }

    return all_results, spatial_data, m_per_px is not None