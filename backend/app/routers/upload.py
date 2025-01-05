import os
from fastapi import APIRouter, File, UploadFile, HTTPException, BackgroundTasks
import uuid

from ..services.parsing import chunk_text_from_pdf
from ..services.embeddings import get_embedding
from ..services.vector_store import upsert_embeddings

router = APIRouter()

TEMP_DIRECTORY = os.getenv("TEMP_DIRECTORY", "/tmp")

@router.post("/upload-doc")
async def upload_doc(file: UploadFile = File(...), background_tasks: BackgroundTasks = None):
    if file.content_type != "application/pdf":
        raise HTTPException(status_code=400, detail="Only PDF files are supported.")

    # TODO: handle storing documents for multiple users
    doc_id = file.filename.split(".")[0]  # Use filename as doc_id for now

    file_path = f"{TEMP_DIRECTORY}/{doc_id}.pdf"
    with open(file_path, "wb") as f:
        f.write(await file.read())

    # TODO: Think about whether this should block
    # parse_and_store_document(doc_id, file_path)
    background_tasks.add_task(parse_and_store_document, doc_id, file_path)

    return {"message": "File uploaded successfully", "doc_id": doc_id}

def parse_and_store_document(doc_id: str, file_path: str):
    """Parse a PDF document and store its embeddings in Pinecone."""

    # Extract text from PDF
    text_chunks = chunk_text_from_pdf(file_path)

    # Convert text chunks to embeddings
    embeddings = get_embedding(text_chunks, model="text-embedding-3-small")

    # Store in Pinecone
    upsert_embeddings(doc_id, text_chunks, embeddings)
