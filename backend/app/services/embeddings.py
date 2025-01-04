from tenacity import retry, wait_random_exponential, stop_after_attempt
from typing import List

from .clients import get_openai_client

# Retry up to 6 times with exponential backoff, starting at 1 second and maxing out at 20 seconds delay
@retry(wait=wait_random_exponential(min=1, max=20), stop=stop_after_attempt(6))
def get_embedding(text: List[str], model="text-embedding-3-small") -> List[List[float]]:
    """
    Takes a list of text chunks and returns a list of embeddings.
    """
    client = get_openai_client()
    return [chunk.embedding for chunk in client.embeddings.create(input=text, model=model).data]
