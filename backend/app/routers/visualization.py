import os
from fastapi import APIRouter, HTTPException
from typing import Dict, Any

from ..services.analysis import find_section_insights
from ..services.visualize import make_visualization

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
        generate_visualization(pdf_path, doc_id)

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    return {"message": "Visualization created successfully", "doc_id": doc_id}

def generate_visualization(path: str, doc_id: str) -> None:
    """
    Generate the visualization for a given document.
    """

    insights = find_section_insights(path, model="gpt-4o-mini")
    print(('INSIGHTS',
           insights),
           '\n\n')
    
    visualization = make_visualization(insights, doc_id)
    print(('VISUALIZATION',
              visualization),
              '\n\n')
    return


def _pdf_path_for_doc_id(doc_id: str) -> str:
    """
    Construct the path where the PDF was saved after upload.
    """
    temp_directory = os.getenv("TEMP_DIRECTORY", "/tmp")
    return os.path.join(temp_directory, f"{doc_id}.pdf")