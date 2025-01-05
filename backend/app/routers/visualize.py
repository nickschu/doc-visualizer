import os
from fastapi import APIRouter, HTTPException
from typing import Dict, Any

from ..services.analysis import find_section_insights

router = APIRouter()

@router.post("/generate-visualization")
def visualize_doc(doc_id: str) -> Dict[str, Any]:
    """
    Produces frontend visualization for a given document ID.
    """

    # Locate PDF file path based on doc_id
    pdf_path = _pdf_path_for_doc_id(doc_id)
    if not pdf_path or not os.path.exists(pdf_path):
        raise HTTPException(status_code=404, detail="Document not found.")

    try:
        generate_visualization(pdf_path)

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    return {"message": "Visualization created successfully", "doc_id": doc_id}

def generate_visualization(path: str) -> None:
    """
    Generate the visualization for a given document.
    """

    insights = find_section_insights(path, model="gpt-4o-mini")

    return


def _pdf_path_for_doc_id(doc_id: str) -> str:
    """
    Construct the path where the PDF was saved after upload.
    This matches your upload.py logic. Adjust to your actual storage scheme.
    """
    temp_directory = os.getenv("TEMP_DIRECTORY", "/tmp")
    return os.path.join(temp_directory, f"{doc_id}.pdf")