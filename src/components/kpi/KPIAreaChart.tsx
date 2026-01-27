import { useEffect, useState } from "react";
import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";

interface KPIAreaChartProps {
  title: string;
  csvPath: string;
  parameterColumn: string;
  intervalDays?: number;
  filterPositive?: boolean;
  yAxisFormat?: "percent" | "number" | "comma";
  color?: string;
}

interface DataPoint {
  date: string;
  value: number;
}

export default function KPIAreaChart({
  title,
  csvPath,
  parameterColumn,
  intervalDays = 1,
  filterPositive = true,
  yAxisFormat = "number",
  color = "#2ca02c",
}: KPIAreaChartProps) {
  const [data, setData] = useState<DataPoint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const response = await fetch(csvPath);
        const text = await response.text();
        const lines = text.split("\n").filter((l) => l.trim());

        const headers = lines[0].split(",").map((h) => h.trim());
        const dateIdx = headers.indexOf("date_column");
        const paramIdx = headers.indexOf(parameterColumn);

        if (dateIdx === -1 || paramIdx === -1) return;

        const dataMap = new Map<string, number>();
        lines.slice(1).forEach((line) => {
          const values = line.split(",");
          const date = values[dateIdx]?.trim();
          const value = parseFloat(values[paramIdx]?.trim() || "0");

          if (date && !isNaN(value)) {
            if (filterPositive && value < 0) return; // Include 0 for area charts
            const current = dataMap.get(date) || 0;
            dataMap.set(date, Math.max(current, value));
          }
        });

        let processed = Array.from(dataMap.entries())
          .map(([date, value]) => ({ date, value }))
          .sort(
            (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
          );

        if (intervalDays > 1) {
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
  }, [csvPath, parameterColumn, intervalDays, filterPositive]);

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

  const options: ApexOptions = {
    chart: {
      type: "area",
      height: 400,
      fontFamily: "Outfit, sans-serif",
      toolbar: { show: false },
      zoom: { enabled: false },
    },
    stroke: {
      curve: "smooth",
      width: 2,
    },
    fill: {
      type: "gradient",
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.5,
        opacityTo: 0.1,
      },
    },
    colors: [color],
    grid: {
      borderColor: "#E5E7EB",
      strokeDashArray: 3,
      yaxis: { lines: { show: true } },
    },
    dataLabels: { enabled: false },
    xaxis: {
      categories: categories,
      labels: {
        rotate: categories.length > 20 ? -90 : -45,
        style: { fontSize: "10px", colors: "#6B7280" },
      },
    },
    yaxis: {
      labels: {
        style: { fontSize: "11px", colors: ["#6B7280"] },
        formatter: (value: number) => {
          if (yAxisFormat === "percent") return `${value.toFixed(2)}%`;
          if (yAxisFormat === "comma") return value.toLocaleString();
          return value.toFixed(2);
        },
      },
    },
    tooltip: {
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
      <Chart options={options} series={series} type="area" height={400} />
    </div>
  );
}
