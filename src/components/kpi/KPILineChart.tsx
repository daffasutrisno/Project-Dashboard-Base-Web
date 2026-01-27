import { useEffect, useState } from "react";
import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";

interface KPILineChartProps {
  title: string;
  csvPath: string;
  parameterColumn: string;
  transformPercent?: boolean; // Multiply by 100
  intervalDays?: number; // Sampling interval (e.g., 2 = every 2 days from END)
  showAllDays?: boolean; // Override interval, show all days
  filterPositive?: boolean; // Only show values > 0
  yAxisFormat?: "percent" | "number" | "comma"; // Y-axis format
  yAxisPadding?: number; // Padding percentage for y-axis
  fixedYRange?: [number, number]; // Fixed y-axis range
  color?: string; // Line color
}

interface DataPoint {
  date: string;
  value: number;
}

export default function KPILineChart({
  title,
  csvPath,
  parameterColumn,
  transformPercent = false,
  intervalDays = 1,
  showAllDays = false,
  filterPositive = true,
  yAxisFormat = "number",
  yAxisPadding = 20,
  fixedYRange,
  color = "#1f77b4",
}: KPILineChartProps) {
  const [data, setData] = useState<DataPoint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const response = await fetch(csvPath);
        const text = await response.text();
        const lines = text.split("\n").filter((l) => l.trim());

        // Parse CSV header
        const headers = lines[0].split(",").map((h) => h.trim());
        const dateIdx = headers.indexOf("date_column");
        const paramIdx = headers.indexOf(parameterColumn);

        if (dateIdx === -1 || paramIdx === -1) {
          console.error("Column not found:", { dateIdx, paramIdx, headers });
          return;
        }

        // Parse data and aggregate by date (MAX)
        const dataMap = new Map<string, number>();
        lines.slice(1).forEach((line) => {
          const values = line.split(",");
          const date = values[dateIdx]?.trim();
          const value = parseFloat(values[paramIdx]?.trim() || "0");

          if (date && !isNaN(value)) {
            // Filter positive if needed
            if (filterPositive && value <= 0) return;

            // Keep MAX value per date
            const current = dataMap.get(date) || 0;
            dataMap.set(date, Math.max(current, value));
          }
        });

        // Convert to array and sort by date
        let processed = Array.from(dataMap.entries())
          .map(([date, value]) => ({
            date,
            value: transformPercent ? value * 100 : value,
          }))
          .sort(
            (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
          );

        // Apply interval sampling from END
        if (!showAllDays && intervalDays > 1) {
          const reversed = [...processed].reverse();
          const sampled = reversed.filter((_, idx) => idx % intervalDays === 0);
          processed = sampled.reverse();
        }

        setData(processed);
      } catch (error) {
        console.error("Error loading KPI data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [
    csvPath,
    parameterColumn,
    transformPercent,
    intervalDays,
    showAllDays,
    filterPositive,
  ]);

  if (loading) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white px-5 pb-5 pt-5 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6 sm:pt-6">
        <div className="flex h-[400px] items-center justify-center">
          <p className="text-gray-500 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  const categories = data.map((d) => {
    const date = new Date(d.date);
    return `${String(date.getDate()).padStart(2, "0")}/${String(date.getMonth() + 1).padStart(2, "0")}/${date.getFullYear()}`;
  });
  const values = data.map((d) => d.value);

  // Calculate Y-axis range
  let yMin = Math.min(...values);
  let yMax = Math.max(...values);

  if (fixedYRange) {
    [yMin, yMax] = fixedYRange;
  } else {
    const range = yMax - yMin;
    const padding = range * (yAxisPadding / 100);
    yMin = Math.max(0, yMin - padding);
    yMax = yMax + padding;
  }

  const options: ApexOptions = {
    chart: {
      type: "line",
      height: 400,
      fontFamily: "Outfit, sans-serif",
      toolbar: { show: false },
      zoom: { enabled: false },
    },
    stroke: {
      curve: "smooth",
      width: 3,
    },
    colors: [color],
    grid: {
      borderColor: "#E5E7EB",
      strokeDashArray: 3,
      yaxis: { lines: { show: true } },
      xaxis: { lines: { show: false } },
    },
    dataLabels: { enabled: false },
    markers: {
      size: 0,
      hover: { size: 6 },
    },
    xaxis: {
      categories: categories,
      labels: {
        rotate: categories.length > 20 ? -90 : -45,
        style: {
          fontSize: "10px",
          colors: "#6B7280",
        },
      },
      axisBorder: { show: true, color: "#E5E7EB" },
      axisTicks: { show: true, color: "#E5E7EB" },
    },
    yaxis: {
      min: yMin,
      max: yMax,
      labels: {
        style: {
          fontSize: "11px",
          colors: ["#6B7280"],
        },
        formatter: (value: number) => {
          if (yAxisFormat === "percent") return `${value.toFixed(2)}%`;
          if (yAxisFormat === "comma") return value.toLocaleString();
          return value.toFixed(2);
        },
      },
    },
    tooltip: {
      enabled: true,
      y: {
        formatter: (value: number) => {
          if (yAxisFormat === "percent") return `${value.toFixed(2)}%`;
          if (yAxisFormat === "comma") return value.toLocaleString();
          return value.toFixed(2);
        },
      },
    },
    legend: { show: false },
  };

  const series = [{ name: title, data: values }];

  return (
    <div className="rounded-2xl border border-gray-200 bg-white px-5 pb-5 pt-5 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6 sm:pt-6">
      <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">
        {title}
      </h3>
      <Chart options={options} series={series} type="line" height={400} />
    </div>
  );
}
