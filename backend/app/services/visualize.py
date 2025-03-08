from typing import Optional, List, Union
from pydantic import BaseModel
from typing_extensions import Literal
import concurrent.futures

from .analysis import InsightsReponse, Section, Insight
from .vector_store import query_top_k
from .embeddings import get_embedding
from .clients import get_openai_client

class ChartBase(BaseModel):
    """
    Base class containing shared fields for all chart types.
    LLM will output `chart_type` to identify which subclass to use.
    """
    chart_type: str  # e.g., "bar_chart", "pie_chart", etc.
    title: Optional[str] = None
    commentary: Optional[str] = None

class TextCard(ChartBase):
    chart_type: Literal["text_card"]

class BarChart(ChartBase):
    chart_type: Literal["bar_chart"]
    # The labels along the horizontal axis
    x_labels: List[str]
    # The values for each bar
    y_values: List[float]
    # Optional label for the Y-axis
    y_label: Optional[str] = None


class PieChart(ChartBase):
    chart_type: Literal["pie_chart"]
    # Each slice label
    labels: List[str]
    # Corresponding slice values
    values: List[float]
    # Optional total if needed (or LLM might calculate the sum of values)
    total: Optional[float] = None


class GaugeChart(ChartBase):
    chart_type: Literal["gauge_chart"]
    # Minimum value (e.g., 0)
    min_value: float
    # Maximum value (e.g., 100)
    max_value: float
    # Current value
    current_value: float
    # Optional label for the unit (%, millions, etc.)
    unit_label: Optional[str] = None


class SingleStatCard(ChartBase):
    chart_type: Literal["single_stat"]
    # Primary numeric value (e.g. 60.9)
    value: float
    # Label or unit for that value (e.g. "$ billions", "%", etc.)
    value_label: Optional[str] = None
    # A secondary label or short text
    sublabel: Optional[str] = None


class LineChart(ChartBase):
    chart_type: Literal["line_chart"]
    # X-axis labels
    x_labels: List[str]
    # A single data series or multiple
    y_values: List[float]
    # Optional label for y-axis
    y_label: Optional[str] = None


class DataSeries(BaseModel):
    name: str
    values: List[float]


class MultiSeriesBarChart(ChartBase):
    chart_type: Literal["multi_series_bar"]
    x_labels: List[str]
    series: List[DataSeries]


ChartSpec = Union[BarChart, PieChart, GaugeChart, SingleStatCard, LineChart, MultiSeriesBarChart, TextCard]

class _ChartSpecAdapter(BaseModel):
    # Adapter for parsing the LLM output into a ChartSpec. In this format since OAI endpoint
    # doesn't seem to accept Union or Pydantic v2 RootModels directly.
    # TODO: See if there are other ways to create root models that OAI endpoint accepts
    chart: ChartSpec

class VisualModule(BaseModel):
    module_id: str # Unique identifier for this module
    
    # The type of visualization (BarChart, PieChart, GaugeChart, SingleStatCard, LineChart, MultiSeriesBarChart)
    chart: ChartSpec

class VisualSection(BaseModel):
    section_id: str # Unique identifier for this section
    name: str  # e.g. "overview", "risk_factors"
    summary: str  # textual summary from LLM response
    main_module: VisualModule
    side_module_1: VisualModule
    side_module_2: VisualModule

class VisualResponse(BaseModel):
    response_id: str # Unique identifier for this response
    company_name: str
    overview: VisualSection
    operational_performance: VisualSection
    risk_factors: VisualSection
    market_position: VisualSection


def make_chart_spec(
    insight: Insight,
    section_name: str,
    section_summary: str,
    doc_id: str,
    model: str = 'o3-mini'
) -> Optional[ChartSpec]:

    # System Prompt
    chart_schema_explanation = """
    You have access to the following chart models. Below is the schema, with an explanation of each field:

    1. BarChart
    - chart_type: "bar_chart"
    - title (optional): Title of the chart
    - description (optional): A short description of what the chart shows
    - x_labels: List of strings for the horizontal axis categories
    - y_values: List of floats for the values corresponding to x_labels
    - y_label (optional): Label for the Y-axis (like "Revenue (billions)")

    2. PieChart
    - chart_type: "pie_chart"
    - title (optional)
    - description (optional)
    - labels: List of strings, each one is a slice label
    - values: List of floats, each corresponding to the slice values
    - total (optional): A float representing the total if you want to show an explicit sum

    3. GaugeChart
    - chart_type: "gauge_chart"
    - title (optional)
    - description (optional)
    - min_value: float (e.g., 0)
    - max_value: float (e.g., 100)
    - current_value: float (the current reading on the gauge)
    - unit_label (optional): e.g., "%" or "billions"

    4. SingleStatCard
    - chart_type: "single_stat"
    - title (optional)
    - description (optional)
    - value: float (the main numeric value)
    - value_label (optional): e.g., "billion USD", "%"
    - sublabel (optional): short text or detail

    5. LineChart
    - chart_type: "line_chart"
    - title (optional)
    - description (optional)
    - x_labels: list of strings (the points or categories along the X-axis)
    - y_values: list of floats (the data points along the line)
    - y_label (optional): label for the Y-axis

    6. MultiSeriesBarChart
    - chart_type: "multi_series_bar"
    - title (optional)
    - description (optional)
    - x_labels: list of strings (horizontal axis categories)
    - series: list of DataSeries (each DataSeries has:
        - name: string (the label for that data series)
        - values: list of floats corresponding to x_labels
        )

    7. TextCard
    # Only use this if there is no data associated with the insight to display.
    - chart_type: "text_card"
    - title (optional)
    - description (optional)
    """

    system_message = f"""
    You are a data visualization expert. You will be given an 'Insight' from a 10-K.
    Use the provided relevant text to decide on an appropriate chart type and data.
    {chart_schema_explanation}
    """

    # Get embeddings for insight text
    emb = get_embedding([insight.name + ' ' + insight.insight_summary])[0]
    relevant_text = query_top_k(emb, doc_id=doc_id, top_k=3)
    relevant_text = "\n\n".join([f"<excerpt_{i+1}>\n{t['metadata']['text']} </excerpt_{i+1}>" for i, t in enumerate(relevant_text)])


    # User Prompt

    user_message = f"""
    Relevant 10-K Excerpts:
    {relevant_text}

    Section:
    Name: {section_name}
    Summary {section_summary}

    Insight:
    Name: {insight.name}
    Summary: {insight.insight_summary}

    Your task:
    1. Select the best chart type from the available ones for displaying the insight in a visually appealing manner for investors.
        Investors will be looking at this chart to make decisions about the company - so it should be clear and informative.
    2. Fill out all required data fields using information from the excerpts.
    """

    client = get_openai_client()

    response = client.beta.chat.completions.parse(
        model=model,
        messages=[
            {
                "role": "user",
                "content": system_message + '\n\n' + user_message
            }
        ],
        response_format=_ChartSpecAdapter
    )

    print(response)
    message = response.choices[0].message
    if message.parsed:
        chart_spec = message.parsed.chart
    else:
        print("[ERROR]: No parsed response from model completion.")
        print(message)
        return

    return chart_spec

def create_visual_module(
    insight: Insight, 
    section_name: str, 
    section_summary: str, 
    doc_id: str,
    module_id: str,
    model: str = 'o3-mini'
) -> VisualModule:
    chart = make_chart_spec(insight, section_name, section_summary, doc_id=doc_id, model=model)
    # If LLM fails or returns None, we can fallback to a simple text card:
    if not chart:
        print('[ERROR]: Language model failed to generate a chart spec. Fallback to TextCard.')
        chart = TextCard(
            chart_type="text_card",
            title=insight.name,
            description=insight.insight_summary
        )
    return VisualModule(module_id=module_id, chart=chart)


def make_visualization(
    insights: InsightsReponse,
    doc_id: str,
    model: str = 'o3-mini'
) -> VisualResponse:

    def process_section(section_name: str, section: Section, section_id: str, doc_id: str, model: str = 'o3-mini') -> VisualSection:
        # Do LLM visualization creation in parallel for the Section
        with concurrent.futures.ThreadPoolExecutor(max_workers=3) as executor:
            future_main = executor.submit(
                create_visual_module,
                insight = section.main_insight,
                section_name = section_name,
                section_summary = section.summary,
                doc_id = doc_id,
                module_id = f"{section_id}-main",
                model=model
            )
            future_side1 = executor.submit(
                create_visual_module,
                insight = section.side_insight_1,
                section_name = section_name,
                section_summary = section.summary,
                doc_id = doc_id,
                module_id = f"{section_id}-side1",
                model=model
            )
            future_side2 = executor.submit(
                create_visual_module,
                insight = section.side_insight_2,
                section_name = section_name,
                section_summary = section.summary,
                doc_id = doc_id,
                module_id = f"{section_id}-side2",
                model=model
            )

            # Get results
            main_module = future_main.result()
            side_module_1 = future_side1.result()
            side_module_2 = future_side2.result()

        return VisualSection(
            section_id=section_id,
            name=section_name,
            summary=section.summary,
            main_module=main_module,
            side_module_1=side_module_1,
            side_module_2=side_module_2
        )

    # Process each of the sections
    overview_sec = process_section("Overview", insights.overview, f'{doc_id}-overview', doc_id=doc_id, model=model)
    op_perf_sec = process_section("Operational Performance", insights.operational_performance, f'{doc_id}-op_perf', doc_id=doc_id, model=model)
    risk_factors_sec = process_section("Risk Factors", insights.risk_factors, f'{doc_id}-risk_factors', doc_id=doc_id, model=model)
    market_pos_sec = process_section("Market Position", insights.market_position, f'{doc_id}-market_pos', doc_id=doc_id, model=model)

    # Construct the final VisualResponse
    return VisualResponse(
        response_id=doc_id,
        company_name=insights.company_name,
        overview=overview_sec,
        operational_performance=op_perf_sec,
        risk_factors=risk_factors_sec,
        market_position=market_pos_sec
    )