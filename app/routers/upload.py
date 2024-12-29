from fastapi import APIRouter, File, UploadFile, HTTPException, BackgroundTasks
from typing import List
import uuid

router = APIRouter()

@router.post("/upload-doc")
async def upload_10k(file: UploadFile = File(...), background_tasks: BackgroundTasks = None):
    if file.content_type != "application/pdf":
        raise HTTPException(status_code=400, detail="Only PDF files are supported.")
    
    # Generate a unique ID for this document
    doc_id = str(uuid.uuid4())

    # TODO: Think about whether this should be stored
    file_path = f"/tmp/{doc_id}.pdf"
    with open(file_path, "wb") as f:
        f.write(await file.read())

    # TODO: Think about whether this should block
    # parse_and_store_document(doc_id, file_path)
    background_tasks.add_task(parse_and_store_document, doc_id, file_path)

    return {"message": "File uploaded successfully", "doc_id": doc_id}
