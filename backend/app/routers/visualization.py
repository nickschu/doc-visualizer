import os
from fastapi import APIRouter, HTTPException, Body

from ..services.analysis import find_section_insights
from ..services.visualize import make_visualization, VisualResponse
from ..services.cache import visualization_cache

router = APIRouter()

@router.post("/generate-visualization")
def visualize_doc(doc_id: str = Body(..., embed=True)) -> VisualResponse:
    """
    Produces a VisualResponse for the given document ID.
    Uses a caching system to avoid regeneration.
    """
    if not doc_id:
        raise HTTPException(status_code=400, detail="Missing doc_id")

    pdf_path = _pdf_path_for_doc_id(doc_id)
    if not pdf_path or not os.path.exists(pdf_path):
        raise HTTPException(status_code=404, detail="Document not found.")

    # Default model to use
    model = os.getenv("OAI_MODEL", "o3-mini")
    
    # Try to get the visualization from cache
    cached_visualization = visualization_cache.get(doc_id, model)
    if cached_visualization:
        return cached_visualization
    
    # If not in cache, generate the visualization
    try:
        insights = find_section_insights(pdf_path, model=model)
        visualization = make_visualization(insights, doc_id, model=model)
        
        # Cache the visualization for future use
        visualization_cache.set(doc_id, model, visualization)
        
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