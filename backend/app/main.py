from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI

from .routers import upload, visualization

app = FastAPI(
    title="doc-visualizer-backend",
    version="0.1.0"
)

@app.get("/")
def read_root():
    return "doc-visualizer-backend is running"

app.include_router(upload.router, tags=["upload"])
app.include_router(visualization.router, tags=["visualization"])

# Start the FastAPI server
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    )