from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI

from .routers import upload, visualize

app = FastAPI(
    title="doc-visualizer-backend",
    version="0.1.0"
)

app.include_router(upload.router, tags=["upload"])
app.include_router(visualize.router, tags=["visualize"])

# Start the FastAPI server
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    )