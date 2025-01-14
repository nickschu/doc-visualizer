import { ChartSpec } from "../charts/chartTypes";

export interface VisualModule {
  module_id: string;
  chart: ChartSpec;
}

export interface VisualSection {
  section_id: string;
  name: string;
  summary: string;
  main_module: VisualModule;
  side_module_1: VisualModule;
  side_module_2: VisualModule;
}

export interface VisualResponse {
  response_id: string;
  company_name: string;
  overview: VisualSection;
  operational_performance: VisualSection;
  risk_factors: VisualSection;
  market_position: VisualSection;
}
