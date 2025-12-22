from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from typing import List
import shutil
import os
from analyzer import detect_defects

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/reconstruct-room")
async def reconstruct_room(files: List[UploadFile] = File(...)):
    all_spatial = []
    all_detections = []
    calibration_status = False
    
    for file in files:
        temp_path = f"temp_{file.filename}"
        with open(temp_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        try:
            # Now returns 3 values
            detections, spatial, calibrated = detect_defects(temp_path)
            all_spatial.append(spatial)
            all_detections.extend(detections)
            if calibrated: calibration_status = True
        finally:
            if os.path.exists(temp_path):
                os.remove(temp_path)

    fused_spatial = {
        "width": float(max(s["width"] for s in all_spatial)),
        "height": float(max(s["height"] for s in all_spatial)),
        "length": float(max(s["length"] for s in all_spatial)),
    }
    fused_spatial["area"] = round(fused_spatial["width"] * fused_spatial["length"], 2)

    return {
        "status": "Verified",
        "analysis_results": all_detections,
        "spatial_data": fused_spatial,
        "is_calibrated": calibration_status
    }