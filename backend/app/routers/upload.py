import os
import uuid
import hashlib
from datetime import datetime
from fastapi import APIRouter, File, UploadFile, HTTPException, BackgroundTasks
import glob

from ..services.parsing import chunk_text_from_pdf
from ..services.embeddings import get_embedding
from ..services.vector_store import upsert_embeddings

router = APIRouter()

TEMP_DIRECTORY = os.getenv("TEMP_DIRECTORY", "/tmp")

@router.post("/upload-doc")
async def upload_doc(file: UploadFile = File(...), background_tasks: BackgroundTasks = None):
    if file.content_type != "application/pdf":
        raise HTTPException(status_code=400, detail="Only PDF files are supported.")

    # Generate a deterministic document ID based solely on content hash
    file_content = await file.read()
    # Using the full MD5 hash for better uniqueness
    content_hash = hashlib.md5(file_content).hexdigest()
    
    # Create an ID that depends only on the content
    doc_id = f"doc_{content_hash}"
    
    # Check if a file with this hash already exists
    file_path = f"{TEMP_DIRECTORY}/{doc_id}.pdf"
    
    # Skip processing if the file already exists
    if os.path.exists(file_path):
        return {"message": "File already exists", "doc_id": doc_id}
    
    # Otherwise, save the file
    with open(file_path, "wb") as f:
        f.write(file_content)

    # Blocking, so that we don't try to make the visualization until the document is uploaded
    parse_and_store_document(doc_id, file_path)
    # background_tasks.add_task(parse_and_store_document, doc_id, file_path)

    return {"message": "File uploaded successfully", "doc_id": doc_id}

def parse_and_store_document(doc_id: str, file_path: str):
    """Parse a PDF document and store its embeddings in Pinecone."""

    # Extract text from PDF
    text_chunks = chunk_text_from_pdf(file_path)

    # Convert text chunks to embeddings
    embeddings = get_embedding(text_chunks, model="text-embedding-3-small")

    # Store in Pinecone
    upsert_embeddings(doc_id, text_chunks, embeddings)
