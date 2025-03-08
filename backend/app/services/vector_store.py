import os
from typing import List, Dict

from .clients import get_pinecone_client

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

    index = get_pinecone_client()

    # Upsert into Pinecone
    index.upsert(vectors=vectors_to_upsert)

def query_top_k(
    query_embedding: List[float],
    doc_id: str,
    top_k: int = 5,
) -> List[Dict]:
    """
    Query Pinecone for the top-k most similar vectors that belong to a specific document.
    :param query_embedding: The embedding of the user query or content to match.
    :param doc_id: The document ID to filter vectors by.
    :param top_k: How many matches to retrieve.
    :return: A list of matches, each match is a dict containing { id, score, metadata }.
    """
    index = get_pinecone_client()

    response = index.query(
        vector=query_embedding,
        top_k=top_k,
        include_metadata=True,
        filter={"doc_id": doc_id},
    )
    return response["matches"]