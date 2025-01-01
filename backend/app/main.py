from fastapi import FastAPI

from .routers import upload

app = FastAPI(
    title="doc-visualizer-backend",
    version="0.1.0"
)

app.include_router(upload.router, tags=["upload"])

# Start the FastAPI server
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app", 
        host="0.0.0.0", 
        port=8000, 
        reload=True
    )