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
        <div className="border p-4 my-2">
          <strong>Unknown chart type:</strong> {chart}
        </div>
      );
  }
}
