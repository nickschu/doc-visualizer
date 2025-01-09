from typing import List
from pydantic import BaseModel

from .clients import get_openai_client
from .parsing import chunk_text_from_pdf

class Insight(BaseModel):
    name: str
    insight_summary: str

class Section(BaseModel):
    summary: str
    main_insight: Insight
    side_insight_1: Insight
    side_insight_2: Insight

class InsightsReponse(BaseModel):
    company_name: str
    overview: Section
    operational_performance: Section
    risk_factors: Section
    market_position: Section

def find_section_insights(path: str, model: str = "gpt-4o-mini") -> List[str]:
    """
    Prompt model for the sections of the document and the most important insights for each section.
    :param path: The path to the document.
    :return: A list of the sections of the 10K with insights for each section.
    """

    text_chunks = chunk_text_from_pdf(path)
    full_text = "\n\n".join(text_chunks)

    client = get_openai_client()

    response = client.beta.chat.completions.parse(
        model=model,
        messages=[
            {
                "role": "system",
                "content": (
                    "You are a world-class financial analyst that "
                    "identifies the most surprising or important"
                    "parts of each section of a 10-K filing. Please"
                    "be thorough."
                ),
            },
            {
                "role": "user",
                "content": (
                    f"Here is the text of a 10-K document:\n\n{full_text}\n\n"
                    "Identify the most surprising or important pieces "
                    "of information or data that should be included in a summary for "
                    "investors for each section. Respond with a short summary of each key insight. "
                    "The main insight should be quantitative and the side insights can be quantitative or qualitative. "
                    "All insights should be supported by specific data or information from the document."
                )
            }
        ],
        temperature=0.3,
        max_tokens=50000,
        response_format=InsightsReponse
    )

    message = response.choices[0].message
    if message.parsed:
        insights = message.parsed
        print(insights)
    else:
        print(message)
        raise ValueError("No parsed response from model completion.")

    return insights