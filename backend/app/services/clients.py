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

# TODO: Handle index creation / deletion
INDEX_NAME = "doc-visualizer-index"

pc = Pinecone(api_key=os.getenv("PINECONE_API_KEY"))

def init_pinecone():
    """Initialize Pinecone (call once at startup)."""
    if INDEX_NAME not in pc.list_indexes().names():
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

# Create global index object
init_pinecone()  # Initialize once
host = pc.describe_index(INDEX_NAME).host
pc_index = pc.Index(INDEX_NAME, host)

def get_pinecone_client():
    """
    Returns the Pinecone index client.
    """
    return pc_index