from fastapi import FastAPI, UploadFile, File
from fastapi.responses import FileResponse
import shutil
import os
from engine import generate_synthetic_data

app = FastAPI()

os.makedirs("temp_uploads", exist_ok=True)

@app.post("/generate")
async def generate(file: UploadFile = File(...), rows: int = 100):
    file_location = f"temp_uploads/{file.filename}"
    with open(file_location, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    try:
        csv_output = generate_synthetic_data(file_location, num_rows=rows)
        
        output_file = f"temp_uploads/synthetic_{file.filename}"
        with open(output_file, "w") as f:
            f.write(csv_output)
            
        return FileResponse(output_file, media_type='text/csv', filename=f"synthetic_{file.filename}")
    
    except Exception as e:
        return {"error": str(e)}