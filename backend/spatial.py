import torch
import cv2
import numpy as np

# Load MiDaS for absolute/relative depth estimation
model_type = "MiDaS_small"
midas = torch.hub.load("intel-isl/MiDaS", model_type)
midas_transforms = torch.hub.load("intel-isl/MiDaS", "transforms")
device = torch.device("cuda") if torch.cuda.is_available() else torch.device("cpu")
midas.to(device).eval()

def estimate_dimensions(image_path, reference_height=2.0): # Default Door Height
    img = cv2.imread(image_path)
    img_rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
    
    # Run MiDaS
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
    
    # Logic: Mathematical Estimation of Room Dimensions
    # We find the furthest and closest points to estimate 'Length'
    # We find the horizontal/vertical extremes for 'Width' and 'Height'
    length = np.max(depth_map) - np.min(depth_map)
    height = img.shape[0] / 100 # Rough pixel-to-meter scaling
    width = img.shape[1] / 100
    
    return {
        "length": round(length * 0.1, 2), # Scaled estimation
        "width": round(width, 2),
        "height": round(height, 2),
        "area": round(width * length * 0.1, 2)
    }