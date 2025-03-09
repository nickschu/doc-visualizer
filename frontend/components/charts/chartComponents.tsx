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

// Modern color palette
const CHART_COLORS = {
  primary: [
    'rgba(59, 130, 246, 0.8)',   // Blue
    'rgba(239, 68, 68, 0.8)',     // Red
    'rgba(245, 158, 11, 0.8)',    // Amber
    'rgba(16, 185, 129, 0.8)',    // Green
    'rgba(139, 92, 246, 0.8)',    // Purple
    'rgba(249, 115, 22, 0.8)',    // Orange
    'rgba(20, 184, 166, 0.8)',    // Teal
    'rgba(236, 72, 153, 0.8)',    // Pink
  ],
  secondary: [
    'rgba(59, 130, 246, 0.2)',   
    'rgba(239, 68, 68, 0.2)',    
    'rgba(245, 158, 11, 0.2)',    
    'rgba(16, 185, 129, 0.2)',    
    'rgba(139, 92, 246, 0.2)',   
    'rgba(249, 115, 22, 0.2)',   
    'rgba(20, 184, 166, 0.2)',    
    'rgba(236, 72, 153, 0.2)',    
  ],
  gradientStart: [
    'rgba(59, 130, 246, 0.1)',
    'rgba(239, 68, 68, 0.1)',
    'rgba(245, 158, 11, 0.1)',
    'rgba(16, 185, 129, 0.1)',
    'rgba(139, 92, 246, 0.1)',
    'rgba(249, 115, 22, 0.1)',
  ],
  gradientEnd: [
    'rgba(59, 130, 246, 0.0)',
    'rgba(239, 68, 68, 0.0)',
    'rgba(245, 158, 11, 0.0)',
    'rgba(16, 185, 129, 0.0)',
    'rgba(139, 92, 246, 0.0)',
    'rgba(249, 115, 22, 0.0)',
  ],
  text: '#374151',
  border: '#e5e7eb',
  background: '#ffffff',
};

// Common card component structure for consistency
const ChartCard = ({ title, commentary, children }: { title?: string, commentary?: string, children: React.ReactNode }) => (
  <div className="p-5 h-full">
    {title && <h3 className="text-xl font-bold mb-3 text-gray-800">{title}</h3>}
    {commentary && <p className="text-gray-600 mb-4 text-sm">{commentary}</p>}
    <div className="mt-2">{children}</div>
  </div>
);

// 1. TextCardComponent - Made more visually appealing
export function TextCardComponent({ chart }: { chart: TextCard }) {
  const content = chart.commentary || "No additional information available.";
  
  return (
    <ChartCard title={chart.title || ""} commentary="">
      <div className="bg-gradient-to-r from-blue-50 to-white p-5 rounded-md border-l-4 border-blue-500">
        <p className="text-gray-700 leading-relaxed">{content}</p>
      </div>
    </ChartCard>
  );
}

// 2. BarChartComponent
export function BarChartComponent({ chart }: { chart: BarChart }) {
  // Calculate chart height based on number of data points
  const dynamicHeight = Math.max(240, Math.min(350, chart.x_labels.length * 30));
  
  // Prepare data for Chart.js
  const data = {
    labels: chart.x_labels,
    datasets: [
      {
        label: chart.y_label || chart.title || "Value",
        data: chart.y_values,
        backgroundColor: CHART_COLORS.primary[0],
        borderColor: CHART_COLORS.primary[0],
        borderWidth: 1,
        borderRadius: 6,
        barThickness: 'flex',
        maxBarThickness: 50,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: !!chart.y_label,
        position: 'top' as const,
        labels: {
          usePointStyle: true,
          boxWidth: 8,
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#fff',
        bodyColor: '#fff',
        bodyFont: {
          size: 14,
        },
        padding: 12,
        cornerRadius: 6,
        displayColors: false,
      },
    },
    scales: {
      y: { 
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
        },
        ticks: {
          color: CHART_COLORS.text,
          padding: 10,
          font: {
            size: 12,
          }
        }
      },
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: CHART_COLORS.text,
          maxRotation: 45,
          minRotation: 0,
          autoSkip: true,
          font: {
            size: 12,
          }
        }
      },
    },
    animation: {
      duration: 1000,
      easing: 'easeOutQuart',
    },
  };

  return (
    <ChartCard title={chart.title || ""} commentary={chart.commentary || ""}>
      <div style={{ height: `${dynamicHeight}px` }} className="w-full">
        <Bar data={data as any} options={options as any} />
      </div>
    </ChartCard>
  );
}

// 3. PieChartComponent
export function PieChartComponent({ chart }: { chart: PieChart }) {
  // Calculate optimal chart size based on number of segments
  const segmentCount = chart.labels.length;
  const isComplex = segmentCount > 5;
  
  const data = {
    labels: chart.labels,
    datasets: [
      {
        data: chart.values,
        backgroundColor: CHART_COLORS.primary.slice(0, Math.max(segmentCount, 8)),
        borderColor: CHART_COLORS.background,
        borderWidth: 2,
        hoverOffset: 15,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: isComplex ? 'bottom' as const : 'right' as const,
        labels: {
          boxWidth: 12,
          padding: 15,
          font: {
            size: 12,
          },
          usePointStyle: true,
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#fff',
        bodyColor: '#fff',
        bodyFont: {
          size: 14,
        },
        padding: 12,
        cornerRadius: 6,
        callbacks: {
          label: function(context: any) {
            const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
            const value = context.raw as number;
            const percentage = ((value / total) * 100).toFixed(1);
            return `${context.label}: ${value.toLocaleString()} (${percentage}%)`;
          }
        }
      }
    },
    cutout: '45%', // More of a pie than a donut
    animation: {
      animateRotate: true,
      animateScale: true,
      duration: 1000,
    }
  };

  const dynamicHeight = isComplex ? 350 : 280;

  return (
    <ChartCard title={chart.title || ""} commentary={chart.commentary || ""}>
      <div style={{ height: `${dynamicHeight}px` }} className="w-full">
        <Pie data={data as any} options={options as any} />
      </div>
    </ChartCard>
  );
}

// 4. GaugeChartComponent (Doughnut)
export function GaugeChartComponent({ chart }: { chart: GaugeChart }) {
  const { min_value, max_value, current_value, title, commentary, unit_label } = chart;

  const range = max_value - min_value;
  const adjustedCurrent = current_value - min_value;
  const percentage = Math.round((adjustedCurrent / range) * 100);

  // Determine color based on percentage
  let colorIndex = Math.min(Math.floor(percentage / 25), 3);
  let color = CHART_COLORS.primary[colorIndex]; 
  
  // For a gauge, we do something like:
  // [adjustedCurrent, range - adjustedCurrent] => so the portion is "filled vs unfilled"
  const data = {
    labels: ["Value", "Remainder"],
    datasets: [
      {
        data: [adjustedCurrent, range - adjustedCurrent],
        backgroundColor: [color, 'rgba(229, 231, 235, 0.7)'],
        hoverBackgroundColor: [color, 'rgba(229, 231, 235, 0.7)'],
        borderWidth: 0,
        circumference: 180, // 180 for half circle
        rotation: 270, // Start drawing from top
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: "75%", // Make it look like a gauge
    plugins: {
      legend: { display: false },
      tooltip: { enabled: false },
    },
    elements: {
      arc: {
        borderWidth: 0,
        borderRadius: 5, // Rounded edges on the gauge
      }
    },
    animation: {
      animateRotate: true,
      animateScale: true,
      duration: 1000,
    }
  };

  return (
    <ChartCard title={chart.title || ""} commentary={chart.commentary || ""}>
      <div className="flex flex-col items-center py-2">
        <div className="h-[160px] w-[240px] relative">
          <Pie data={data as any} options={options as any} />
          <div className="absolute bottom-0 left-0 right-0 text-center">
            <div className="font-bold text-3xl text-gray-800">{current_value.toLocaleString()}</div>
            <div className="text-sm text-gray-600">{unit_label || ''}</div>
          </div>
        </div>
        <div className="flex justify-between w-full mt-2 px-8 text-sm text-gray-600">
          <span>{min_value.toLocaleString()}{unit_label ? ` ${unit_label}` : ""}</span>
          <span>{max_value.toLocaleString()}{unit_label ? ` ${unit_label}` : ""}</span>
        </div>
      </div>
    </ChartCard>
  );
}

// 5. SingleStatComponent
export function SingleStatComponent({ chart }: { chart: SingleStatCard }) {
  const { title, commentary, value, value_label, sublabel } = chart;

  // Function to select a color based on context from title or commentary
  const selectColorClass = () => {
    const text = (title || '') + (commentary || '');
    if (/increase|growth|higher|improved|positive|up|better/i.test(text)) {
      return "text-green-600";
    } else if (/decrease|decline|lower|reduced|negative|down|worse/i.test(text)) {
      return "text-red-600";
    }
    return "text-blue-600";
  };

  const colorClass = selectColorClass();

  return (
    <ChartCard title={title || ""} commentary={commentary || ""}>
      <div className="flex flex-col items-center justify-center p-6 bg-gradient-to-b from-gray-50 to-white rounded-lg border border-gray-100">
        <div className={`text-6xl font-bold ${colorClass} transition-all duration-300 hover:scale-105`}>
          {value.toLocaleString()}
          {value_label && <span className="text-xl ml-1 text-gray-600">{value_label}</span>}
        </div>
        {sublabel && <div className="mt-3 text-gray-600 text-lg">{sublabel}</div>}
      </div>
    </ChartCard>
  );
}

// 6. LineChartComponent
export function LineChartComponent({ chart }: { chart: LineChart }) {
  // Create gradient fill
  const getGradient = (ctx: any) => {
    if (!ctx) return null;
    
    const gradient = ctx.createLinearGradient(0, 0, 0, 250);
    gradient.addColorStop(0, CHART_COLORS.gradientStart[0]);
    gradient.addColorStop(1, CHART_COLORS.gradientEnd[0]);
    return gradient;
  };

  const data = {
    labels: chart.x_labels,
    datasets: [
      {
        label: chart.y_label || chart.title || "Value",
        data: chart.y_values,
        borderColor: CHART_COLORS.primary[0],
        backgroundColor: function(context: any) {
          const chart = context.chart;
          const {ctx, chartArea} = chart;
          if (!chartArea) {
            return null;
          }
          return getGradient(ctx);
        },
        tension: 0.3,
        fill: true,
        pointRadius: 4,
        pointBackgroundColor: CHART_COLORS.primary[0],
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointHoverRadius: 6,
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: CHART_COLORS.primary[0],
        pointHoverBorderWidth: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: !!chart.y_label,
        position: 'top' as const,
        labels: {
          usePointStyle: true,
          boxWidth: 8,
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#fff',
        bodyColor: '#fff',
        bodyFont: {
          size: 14,
        },
        padding: 12,
        cornerRadius: 6,
        displayColors: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
        },
        ticks: {
          padding: 10,
          font: {
            size: 12,
          }
        }
      },
      x: {
        grid: {
          display: false,
        },
        ticks: {
          maxRotation: 45,
          minRotation: 0,
          autoSkip: true,
          font: {
            size: 12,
          }
        }
      }
    },
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    animations: {
      tension: {
        duration: 1000,
        easing: 'linear',
        from: 0,
        to: 0.3,
      }
    },
  };

  // Dynamic height based on number of data points
  const dynamicHeight = Math.max(240, Math.min(320, chart.x_labels.length * 15));

  return (
    <ChartCard title={chart.title || ""} commentary={chart.commentary || ""}>
      <div style={{ height: `${dynamicHeight}px` }} className="w-full">
        <Line data={data as any} options={options as any} />
      </div>
    </ChartCard>
  );
}

// 7. MultiSeriesBarComponent
export function MultiSeriesBarComponent({ chart }: { chart: MultiSeriesBarChart }) {
  // Complex chart needs more height as well
  const complexity = chart.series.length * chart.x_labels.length;
  const dynamicHeight = Math.max(260, Math.min(400, complexity * 5));
  
  const datasets = chart.series.map((ds, index) => ({
    label: ds.name,
    data: ds.values,
    backgroundColor: CHART_COLORS.primary[index % CHART_COLORS.primary.length],
    borderWidth: 1,
    borderRadius: 4,
    barPercentage: 0.8,
    categoryPercentage: 0.7,
  }));

  const data = {
    labels: chart.x_labels,
    datasets,
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          usePointStyle: true,
          boxWidth: 8,
          padding: 15,
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#fff',
        bodyColor: '#fff',
        padding: 12,
        cornerRadius: 6,
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
        },
        ticks: {
          padding: 10,
          font: {
            size: 12,
          }
        }
      },
      x: {
        grid: {
          display: false,
        },
        ticks: {
          maxRotation: 45,
          minRotation: 0,
          autoSkip: true,
          font: {
            size: 12,
          }
        }
      }
    },
    animation: {
      duration: 1000,
      easing: 'easeOutQuart',
    },
  };

  return (
    <ChartCard title={chart.title || ""} commentary={chart.commentary || ""}>
      <div style={{ height: `${dynamicHeight}px` }} className="w-full">
        <Bar data={data as any} options={options as any} />
      </div>
    </ChartCard>
  );
}