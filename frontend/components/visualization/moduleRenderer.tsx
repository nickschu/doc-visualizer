import React from "react";
import type { ChartSpec } from "../charts/chartTypes";
import { VisualModule } from "./visualTypes";

import {
  TextCardComponent,
  BarChartComponent,
  PieChartComponent,
  GaugeChartComponent,
  SingleStatComponent,
  LineChartComponent,
  MultiSeriesBarComponent,
} from "../charts/chartComponents";

export function ModuleRenderer({ module }: { module: VisualModule }) {
  const chart = module.chart as ChartSpec;

  // Create a wrapper div that can handle animations and styling
  return (
    <div className="module-container h-full transition-all duration-300 ease-in-out">
      {renderChart(chart)}
    </div>
  );
}

// Separate function to render the specific chart type
function renderChart(chart: ChartSpec) {
  switch (chart.chart_type) {
    case "text_card":
      return <TextCardComponent chart={chart} />;
    case "bar_chart":
      return <BarChartComponent chart={chart} />;
    case "pie_chart":
      return <PieChartComponent chart={chart} />;
    case "gauge_chart":
      return <GaugeChartComponent chart={chart} />;
    case "single_stat":
      return <SingleStatComponent chart={chart} />;
    case "line_chart":
      return <LineChartComponent chart={chart} />;
    case "multi_series_bar":
      return <MultiSeriesBarComponent chart={chart} />;
    default:
      return (
        <div className="p-4 border border-red-200 bg-red-50 rounded-md">
          <p className="text-red-500 font-medium">Unknown chart type</p>
          <pre className="mt-2 text-xs overflow-auto p-2 bg-white rounded border">
            {JSON.stringify(chart, null, 2)}
          </pre>
        </div>
      );
  }
}
