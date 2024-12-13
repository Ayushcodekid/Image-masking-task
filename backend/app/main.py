from fastapi import FastAPI, File, UploadFile, HTTPException
from pydantic import BaseModel
from pymongo import MongoClient
from bson.objectid import ObjectId
from fastapi.responses import StreamingResponse
import gridfs
import io

# Initialize FastAPI
app = FastAPI()

# MongoDB setup
MONGO_URI = "mongodb+srv://admin:admin%40123@ses-serverless.4pphg.mongodb.net/rule_engine?retryWrites=true&w=majority&appName=ses-serverless"
DATABASE_NAME = "image_mask_db"
client = MongoClient(MONGO_URI)
db = client[DATABASE_NAME]
fs = gridfs.GridFS(db)

# Helper function to store file in GridFS
def store_file(file_data, filename, content_type):
    return fs.put(file_data, filename=filename, content_type=content_type)

# Helper function to retrieve file from GridFS
def retrieve_file(file_id):
    try:
        file = fs.get(ObjectId(file_id))
        return file.read(), file.content_type
    except gridfs.errors.NoFile:
        return None, None

# Model for response
class ImageResponse(BaseModel):
    original_image_id: str
    mask_image_id: str

@app.post("/upload/")
async def upload_images(
    original_image: UploadFile = File(...), mask_image: UploadFile = File(...)
):
    try:
        ALLOWED_EXTENSIONS = {"image/png", "image/jpeg"}

        # Validate file types
        if original_image.content_type not in ALLOWED_EXTENSIONS:
            raise HTTPException(status_code=400, detail="Invalid file type for original image")
        if mask_image.content_type not in ALLOWED_EXTENSIONS:
            raise HTTPException(status_code=400, detail="Invalid file type for mask image")

        # Store original image in GridFS
        original_image_data = await original_image.read()
        original_image_id = store_file(original_image_data, original_image.filename, original_image.content_type)

        # Store mask image in GridFS
        mask_image_data = await mask_image.read()
        mask_image_id = store_file(mask_image_data, mask_image.filename, mask_image.content_type)

        return ImageResponse(
            original_image_id=str(original_image_id),
            mask_image_id=str(mask_image_id),
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/images/{image_id}")
async def get_image(image_id: str):
    try:
        image_data, content_type = retrieve_file(image_id)
        if image_data is None:
            raise HTTPException(status_code=404, detail="Image not found")

        return StreamingResponse(io.BytesIO(image_data), media_type=content_type)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# To run the FastAPI app
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)
