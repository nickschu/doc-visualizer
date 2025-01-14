"use client";

import React from "react";
import {
    Chart as ChartJS,
    ArcElement,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    LineElement,
    PointElement,
} from "chart.js";

import { Bar, Pie, Line } from "react-chartjs-2";

ChartJS.register(
    ArcElement,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    LineElement,
    PointElement
    );

import type {
  TextCard,
  BarChart,
  PieChart,
  GaugeChart,
  SingleStatCard,
  LineChart,
  MultiSeriesBarChart
} from "./chartTypes";

// 1. TextCardComponent
export function TextCardComponent({ chart }: { chart: TextCard }) {
  return (
    <div className="border p-4 my-2">
      {chart.title && <h3 className="font-bold mb-2">{chart.title}</h3>}
      {chart.commentary && <p className="text-sm mb-2">{chart.commentary}</p>}
    </div>
  );
}

// 2. BarChartComponent
export function BarChartComponent({ chart }: { chart: BarChart }) {
  // Prepare data for Chart.js
  const data = {
    labels: chart.x_labels,
    datasets: [
      {
        label: chart.y_label || chart.title || "Bar Chart",
        data: chart.y_values,
        backgroundColor: "rgba(54, 162, 235, 0.7)",
      },
    ],
  };

  const options = {
    responsive: true,
    scales: {
      y: { beginAtZero: true },
    },
  };

  return (
    <div className="border p-4 my-2">
      {chart.title && <h3 className="font-bold mb-2">{chart.title}</h3>}
      {chart.commentary && <p className="text-sm mb-2">{chart.commentary}</p>}
      <Bar data={data} options={options} />
    </div>
  );
}

// 3. PieChartComponent
export function PieChartComponent({ chart }: { chart: PieChart }) {
  const data = {
    labels: chart.labels,
    datasets: [
      {
        data: chart.values,
        backgroundColor: [
          "#FF6384",
          "#36A2EB",
          "#FFCE56",
          "#4BC0C0",
          "#9966FF",
          "#FF9F40",
        ],
      },
    ],
  };

  const options = {
    responsive: true,
  };

  return (
    <div className="border p-4 my-2">
      {chart.title && <h3 className="font-bold mb-2">{chart.title}</h3>}
      {chart.commentary && <p className="text-sm mb-2">{chart.commentary}</p>}
      <Pie data={data} options={options} />
    </div>
  );
}

// 4. GaugeChartComponent (Doughnut)
export function GaugeChartComponent({ chart }: { chart: GaugeChart }) {
  const { min_value, max_value, current_value, title, commentary, unit_label } = chart;

  const range = max_value - min_value;
  const adjustedCurrent = current_value - min_value;

  // For a gauge, we do something like:
  // [adjustedCurrent, range - adjustedCurrent] => so the portion is "filled vs unfilled"
  const data = {
    labels: ["Value", "Remainder"],
    datasets: [
      {
        data: [adjustedCurrent, range - adjustedCurrent],
        backgroundColor: ["#36A2EB", "#E5E7EB"], // Blue vs light gray
        hoverBackgroundColor: ["#36A2EB", "#E5E7EB"],
        borderWidth: 0,
        circumference: 180, // 180 for half circle
        rotation: 270, // Start drawing from top
      },
    ],
  };

  const options = {
    circumference: 180,
    rotation: 270,
    cutout: "60%", // Make it look like a gauge
    plugins: {
      legend: { display: false },
      tooltip: { enabled: false },
    },
  };

  return (
    <div className="border p-4 my-2 flex flex-col items-center">
      {title && <h3 className="font-bold mb-2">{title}</h3>}
      {commentary && <p className="text-sm mb-2">{commentary}</p>}
      <div className="w-64">
        <Pie data={data} options={options} />
      </div>
      {/* Show the numeric value below */}
      <div className="mt-2 font-bold text-xl">
        {current_value}
        {unit_label ? ` ${unit_label}` : ""}
      </div>
      <div className="text-sm text-gray-500">
        Range: {min_value} - {max_value}
      </div>
    </div>
  );
}

// 5. SingleStatComponent
export function SingleStatComponent({ chart }: { chart: SingleStatCard }) {
  const { title, commentary, value, value_label, sublabel } = chart;

  return (
    <div className="border p-4 my-2 flex flex-col items-center">
      {title && <h3 className="font-bold mb-2">{title}</h3>}
      {commentary && <p className="text-sm mb-2">{commentary}</p>}
      <div className="text-3xl font-bold">
        {value}
        {value_label && <span className="text-lg ml-1">{value_label}</span>}
      </div>
      {sublabel && <div className="mt-1 text-gray-600">{sublabel}</div>}
    </div>
  );
}

// 6. LineChartComponent
export function LineChartComponent({ chart }: { chart: LineChart }) {
  const data = {
    labels: chart.x_labels,
    datasets: [
      {
        label: chart.title || "Line Chart",
        data: chart.y_values,
        fill: false,
        borderColor: "rgba(75,192,192,1)",
        tension: 0.1,
      },
    ],
  };

  const options = {
    responsive: true,
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  return (
    <div className="border p-4 my-2">
      {chart.title && <h3 className="font-bold mb-2">{chart.title}</h3>}
      {chart.commentary && <p className="text-sm mb-2">{chart.commentary}</p>}
      <Line data={data} options={options} />
    </div>
  );
}

// 7. MultiSeriesBarComponent
export function MultiSeriesBarComponent({ chart }: { chart: MultiSeriesBarChart }) {
  const datasets = chart.series.map((ds) => ({
    label: ds.name,
    data: ds.values,
    backgroundColor: getRandomColor(),
  }));

  const data = {
    labels: chart.x_labels,
    datasets,
  };

  const options = {
    responsive: true,
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  return (
    <div className="border p-4 my-2">
      {chart.title && <h3 className="font-bold mb-2">{chart.title}</h3>}
      {chart.commentary && <p className="text-sm mb-2">{chart.commentary}</p>}
      <Bar data={data} options={options} />
    </div>
  );
}

function getRandomColor() {
  const r = Math.floor(Math.random() * 150) + 50;
  const g = Math.floor(Math.random() * 150) + 50;
  const b = Math.floor(Math.random() * 150) + 50;
  return `rgb(${r}, ${g}, ${b})`;
}