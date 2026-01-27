import { useEffect, useState } from "react";
import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";

interface KPIDualLineChartProps {
  title: string;
  csvPath: string;
  line1Parameter: string;
  line2Parameter: string;
  line1Label: string;
  line2Label: string;
  showAllDays?: boolean;
  intervalDays?: number;
  line1Color?: string;
  line2Color?: string;
}

interface DataPoint {
  date: string;
  value1: number;
  value2: number;
}

export default function KPIDualLineChart({
  title,
  csvPath,
  line1Parameter,
  line2Parameter,
  line1Label,
  line2Label,
  showAllDays = true,
  intervalDays = 1,
  line1Color = "#1f77b4",
  line2Color = "#ff7f0e",
}: KPIDualLineChartProps) {
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
        const param1Idx = headers.indexOf(line1Parameter);
        const param2Idx = headers.indexOf(line2Parameter);

        if (dateIdx === -1 || param1Idx === -1 || param2Idx === -1) {
          console.error("Columns not found");
          return;
        }

        const dataMap = new Map<string, { value1: number; value2: number }>();
        lines.slice(1).forEach((line) => {
          const values = line.split(",");
          const date = values[dateIdx]?.trim();
          const val1 = parseFloat(values[param1Idx]?.trim() || "0");
          const val2 = parseFloat(values[param2Idx]?.trim() || "0");

          if (date && !isNaN(val1) && !isNaN(val2)) {
            // Filter: show only if at least one value > 0
            if (val1 > 0 || val2 > 0) {
              const current = dataMap.get(date) || { value1: 0, value2: 0 };
              dataMap.set(date, {
                value1: Math.max(current.value1, val1),
                value2: Math.max(current.value2, val2),
              });
            }
          }
        });

        let processed = Array.from(dataMap.entries())
          .map(([date, vals]) => ({
            date,
            value1: vals.value1,
            value2: vals.value2,
          }))
          .sort(
            (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
          );

        if (!showAllDays && intervalDays > 1) {
          const reversed = [...processed].reverse();
          const sampled = reversed.filter((_, idx) => idx % intervalDays === 0);
          processed = sampled.reverse();
        }

        setData(processed);
      } catch (error) {
        console.error("Error loading dual line data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [csvPath, line1Parameter, line2Parameter, showAllDays, intervalDays]);

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
  const series1 = data.map((d) => d.value1);
  const series2 = data.map((d) => d.value2);

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
    colors: [line1Color, line2Color],
    grid: {
      borderColor: "#E5E7EB",
      strokeDashArray: 3,
      yaxis: { lines: { show: true } },
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
        style: { fontSize: "10px", colors: "#6B7280" },
      },
    },
    yaxis: {
      labels: {
        style: { fontSize: "11px", colors: ["#6B7280"] },
        formatter: (value: number) => value.toFixed(2),
      },
    },
    legend: {
      show: true,
      position: "top",
      horizontalAlign: "center",
      fontSize: "12px",
      fontFamily: "Outfit",
    },
    tooltip: {
      shared: true,
      intersect: false,
    },
  };

  const series = [
    { name: line1Label, data: series1 },
    { name: line2Label, data: series2 },
  ];

  return (
    <div className="rounded-2xl border border-gray-200 bg-white px-5 pb-5 pt-5 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6 sm:pt-6">
      <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">
        {title}
      </h3>
      <Chart options={options} series={series} type="line" height={400} />
    </div>
  );
}
