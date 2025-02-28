import os
from fastapi import APIRouter, HTTPException, Body

from ..services.analysis import find_section_insights
from ..services.visualize import make_visualization, VisualResponse

router = APIRouter()

@router.post("/generate-visualization")
def visualize_doc(doc_id: str = Body(..., embed=True)) -> VisualResponse:
    """
    Produces a VisualResponse for the given document ID.
    """
    if not doc_id:
        raise HTTPException(status_code=400, detail="Missing doc_id")

    pdf_path = _pdf_path_for_doc_id(doc_id)
    if not pdf_path or not os.path.exists(pdf_path):
        raise HTTPException(status_code=404, detail="Document not found.")

    try:
        insights = find_section_insights(pdf_path, model="o3-mini")
        visualization = make_visualization(insights, doc_id, model="o3-mini")
        return visualization
    except Exception as e:
        print(e)
        raise HTTPException(status_code=500, detail=str(e))

def _pdf_path_for_doc_id(doc_id: str) -> str:
    """
    Construct the path where the PDF was saved after upload.
    """
    temp_directory = os.getenv("TEMP_DIRECTORY", "/tmp")
    return os.path.join(temp_directory, f"{doc_id}.pdf")