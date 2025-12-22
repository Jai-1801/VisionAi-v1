from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from typing import List
import shutil
import os
from analyzer import detect_defects

app = FastAPI()
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

@app.post("/reconstruct-room")
async def reconstruct_room(files: List[UploadFile] = File(...)):
    per_image_results = []
    all_spatial = []
    calibration_status = False
    
    for file in files:
        temp_path = f"temp_{file.filename}"
        with open(temp_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        try:
            detections, spatial, calibrated, img_size = detect_defects(temp_path)
            per_image_results.append({
                "detections": detections,
                "img_size": img_size # [h, w]
            })
            all_spatial.append(spatial)
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
        "analysis_results": per_image_results,
        "spatial_data": fused_spatial,
        "is_calibrated": calibration_status
    }