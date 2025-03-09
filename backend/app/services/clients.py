import os
from openai import OpenAI
from pinecone.grpc import PineconeGRPC as Pinecone
from pinecone import ServerlessSpec

### OpenAI
openai_client = OpenAI()

def get_openai_client():
    """
    Returns the OpenAI client.
    """
    return openai_client

### Pinecone

VECTOR_DIMENSION = 1536 # hardcoded to text-embedding-3-small OAI model size for now

INDEX_NAME = os.getenv("PINECONE_INDEX_NAME", "doc-visualizer-index")

pc = Pinecone(api_key=os.getenv("PINECONE_API_KEY"))

def init_pinecone():
    """Initialize Pinecone (call once at startup).
    
    If an index already exists, it will be emptied.
    If an index doesn't exist, it will be created.
    """
    # Check if index exists
    if INDEX_NAME in pc.list_indexes().names():
        # Index exists, empty it
        host = pc.describe_index(INDEX_NAME).host
        index = pc.Index(INDEX_NAME, host)
        # Delete all vectors in the index
        try:
            index.delete(delete_all=True)
            print(f"Emptied existing index: {INDEX_NAME}")
        except Exception as e:
            if "Namespace not found" in str(e):
                print(f"No vectors to delete in index {INDEX_NAME} (namespace not found)")
            else:
                raise  # Re-raise if it's a different error
    else:
        # Create new index
        pc.create_index(
            name=INDEX_NAME, 
            dimension=VECTOR_DIMENSION,
            metric="cosine",
            spec=ServerlessSpec(
                cloud=os.getenv("PINECONE_CLOUD", "aws"),
                region=os.getenv("PINECONE_REGION", "us-east-1")
            ),
            deletion_protection="disabled"
        )
        print(f"Created new index: {INDEX_NAME}")

# Create global index object
# Initialize Pinecone index
init_pinecone()
host = pc.describe_index(INDEX_NAME).host
pc_index = pc.Index(INDEX_NAME, host)

def get_pinecone_client():
    """
    Returns the Pinecone index client.
    """
    return pc_index

def cleanup_pinecone():
    """Clean up Pinecone index on server shutdown.
    
    This empties the index but doesn't delete it to avoid rate limiting issues
    with frequent index creation/deletion.
    """
    try:
        # Empty the index by deleting all vectors
        pc_index.delete(delete_all=True)
        print(f"Emptied index {INDEX_NAME} on shutdown")
    except Exception as e:
        print(f"Error cleaning up Pinecone index: {e}")