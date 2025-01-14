export interface ChartBase {
    chart_type: string;
    title?: string;
    commentary?: string;
  }
  
  export interface TextCard extends ChartBase {
    chart_type: "text_card";
  }
  
  export interface BarChart extends ChartBase {
    chart_type: "bar_chart";
    x_labels: string[];
    y_values: number[];
    y_label?: string;
  }
  
  export interface PieChart extends ChartBase {
    chart_type: "pie_chart";
    labels: string[];
    values: number[];
    total?: number;
  }
  
  export interface GaugeChart extends ChartBase {
    chart_type: "gauge_chart";
    min_value: number;
    max_value: number;
    current_value: number;
    unit_label?: string;
  }
  
  export interface SingleStatCard extends ChartBase {
    chart_type: "single_stat";
    value: number;
    value_label?: string;
    sublabel?: string;
  }
  
  export interface LineChart extends ChartBase {
    chart_type: "line_chart";
    x_labels: string[];
    y_values: number[];
    y_label?: string;
  }
  
  export interface DataSeries {
    name: string;
    values: number[];
  }
  
  export interface MultiSeriesBarChart extends ChartBase {
    chart_type: "multi_series_bar";
    x_labels: string[];
    series: DataSeries[];
  }
  
  // Union
  export type ChartSpec =
    | TextCard
    | BarChart
    | PieChart
    | GaugeChart
    | SingleStatCard
    | LineChart
    | MultiSeriesBarChart;
  