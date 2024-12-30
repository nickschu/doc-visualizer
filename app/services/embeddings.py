from tenacity import retry, wait_random_exponential, stop_after_attempt
from openai import OpenAI

client = OpenAI()

def generate_embeddings(chunks: list[str]) -> list[list[float]]:
    """
    Takes a list of text chunks and returns a list of embeddings.
    """
    embeddings = []
    for chunk in chunks:
        embeddings.append(get_embedding([chunk]))
    return embeddings

# Retry up to 6 times with exponential backoff, starting at 1 second and maxing out at 20 seconds delay
@retry(wait=wait_random_exponential(min=1, max=20), stop=stop_after_attempt(6))
def get_embedding(text: list[str], model="text-embedding-3-small") -> list[list[float]]:
    return client.embeddings.create(input=text, model=model).data[0].embedding
