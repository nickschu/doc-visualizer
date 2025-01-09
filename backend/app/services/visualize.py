from typing import Optional, List, Dict, Union
from pydantic import BaseModel
from typing_extensions import Literal

from .analysis import InsightsReponse
from .clients import get_openai_client, get_pinecone_client

"""class Insight(BaseModel):
    name: str
    insight_summary: str
    data: Optional[Dict[str, Union[List[str], str]]]

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
    market_position: Section"""



class ChartBase(BaseModel):
    """
    Base class containing shared fields for all chart types.
    GPT will output `chart_type` to identify which subclass to use.
    """
    chart_type: str  # e.g., "bar_chart", "pie_chart", etc.
    title: Optional[str] = None
    description: Optional[str] = None


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
    # Optional total if needed (or GPT might calculate the sum of values)
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


ChartSpec = Union[BarChart, PieChart, GaugeChart, SingleStatCard, LineChart, MultiSeriesBarChart]


class VisualModule(BaseModel):
    # Unique identifier for this module
    module_id: str
    
    # The type of visualization (BarChart, PieChart, GaugeChart, SingleStatCard, LineChart, MultiSeriesBarChart)
    chart_type: ChartSpec

class VisualSection(BaseModel):
    name: str  # e.g. "overview", "risk_factors"
    summary: str  # textual summary from the original GPT response
    main_module: VisualModule
    side_module_1: VisualModule
    side_module_2: VisualModule

class VisualResponse(BaseModel):
    company_name: str
    overview: VisualSection
    operational_performance: VisualSection
    risk_factors: VisualSection
    market_position: VisualSection

