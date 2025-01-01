import os
from typing import List, Dict

from pinecone.grpc import PineconeGRPC as Pinecone
from pinecone import ServerlessSpec, Index

VECTOR_DIMENSION = 1536 # hardcoded to text-embedding-3-small OAI model for now

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
index = pc.Index(INDEX_NAME, host)

def upsert_embeddings(
    doc_id: str, 
    chunks: List[str], 
    embeddings: List[List[float]]
) -> None:
    """
    Store multiple text chunks as vectors in Pinecone.
    :param doc_id: Unique ID for the document.
    :param chunks: The text chunks from parsing the PDF.
    :param embeddings: The corresponding embeddings for each text chunk.
    """
    if len(chunks) != len(embeddings):
        raise ValueError("chunks and embeddings length mismatch")

    vectors_to_upsert = []
    for i, (chunk, embedding) in enumerate(zip(chunks, embeddings)):
        vector_id = f"{doc_id}-{i}"
        metadata = {
            "doc_id": doc_id,
            "text": chunk,
            "chunk_index": i
        }
        vectors_to_upsert.append((vector_id, embedding, metadata))

    # Upsert into Pinecone
    index.upsert(vectors=vectors_to_upsert)

def query_top_k(
    query_embedding: List[float],
    top_k: int = 5,
    filter_dict: Dict = None
) -> List[Dict]:
    """
    Query Pinecone for the top-k most similar vectors.
    :param query_embedding: The embedding of the user query or content to match.
    :param top_k: How many matches to retrieve.
    :param filter_dict: Optional filter to limit results by metadata.
    :return: A list of matches, each match is a dict containing { id, score, metadata }.
    """
    response = index.query(
        vector=query_embedding,
        top_k=top_k,
        include_metadata=True,
        filter=filter_dict,
    )
    return response["matches"]