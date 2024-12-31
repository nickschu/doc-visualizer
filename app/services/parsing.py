import pdfplumber # markitdown?
from tiktoken import get_encoding

def num_tokens_from_string(string: str, encoding_name: str = "cl100k_base") -> int:
    """Returns the number of tokens in a text string."""
    encoding = get_encoding(encoding_name)
    num_tokens = len(encoding.encode(string))
    return num_tokens

# TODO: This function should be more sophisticated. Instead of chunking by page, should be by section
#       determined by extracted document formatting.
def chunk_text_from_pdf(file_path: str) -> str:
    text_chunks = []
    with pdfplumber.open(file_path) as pdf:
        for page in pdf.pages:
            text = page.extract_text()
            if text:
                # TODO: Check embedding size limits via tiktoken. OAI embeddings allow up to 8191 tokens.
                text_chunks.append(text)
    return text_chunks