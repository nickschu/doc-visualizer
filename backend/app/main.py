from dotenv import load_dotenv
from contextlib import asynccontextmanager
load_dotenv()

from fastapi import FastAPI

from .routers import upload, visualization
from .services.clients import init_pinecone, cleanup_pinecone
from .services.cache import visualization_cache

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize Pinecone index
    init_pinecone()

    yield # Server starts

    # Clean up resources when the server shuts down
    cleanup_pinecone()
    visualization_cache.clear_cache()
    print("All cleanup operations completed.")

app = FastAPI(
    title="doc-visualizer-backend",
    version="0.1.0",
    lifespan=lifespan
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