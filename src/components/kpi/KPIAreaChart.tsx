import { useEffect, useState } from "react";
import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";

interface KPIAreaChartProps {
  title: string;
  csvPath: string;
  yAxisFormat?: "percent" | "number" | "comma";
  color?: string;
  simplifyXAxis?: boolean;
}

interface DataPoint {
  date: string;
  value: number;
}

export default function KPIAreaChart({
  title,
  csvPath,
  yAxisFormat = "number",
  color = "#2ca02c",
  simplifyXAxis = false,
}: KPIAreaChartProps) {
  const [data, setData] = useState<DataPoint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        console.log(`[KPIAreaChart] Fetching: ${csvPath}`);
        const response = await fetch(csvPath);

        if (!response.ok) {
          console.error(
            `[KPIAreaChart] Fetch failed: ${response.status} ${response.statusText}`,
          );
          return;
        }

        const text = await response.text();
        console.log(`[KPIAreaChart] Received ${text.length} bytes`);
        const lines = text.split("\n").filter((l) => l.trim());
        console.log(`[KPIAreaChart] Found ${lines.length} lines`);

        const headers = lines[0]?.split(",").map((h) => h.trim()) || [];
        console.log(`[KPIAreaChart] Headers:`, headers);

        if (headers[0] !== "date" || headers[1] !== "value") {
          console.error(
            `[KPIAreaChart] Wrong format! Expected 'date,value' but got:`,
            headers,
          );
          return;
        }

        const processed = lines
          .slice(1)
          .map((line) => {
            const [date, value] = line.split(",");
            return {
              date: date.trim(),
              value: parseFloat(value.trim()),
            };
          })
          .filter((d) => !isNaN(d.value));

        console.log(
          `[KPIAreaChart] Processed ${processed.length} valid data points`,
          processed.slice(0, 3),
        );
        setData(processed);
      } catch (error) {
        console.error("Error loading KPI data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [csvPath]);

  if (loading) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white px-5 pb-5 pt-5 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6 sm:pt-6">
        <div className="flex h-[400px] items-center justify-center">
          <p className="text-gray-500 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white px-5 pb-5 pt-5 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6 sm:pt-6">
        <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">
          {title}
        </h3>
        <div className="flex h-[400px] items-center justify-center">
          <p className="text-gray-500 dark:text-gray-400">No data available</p>
        </div>
      </div>
    );
  }

  const categories = data.map((d) => {
    const date = new Date(d.date);
    if (simplifyXAxis) {
      const monthNames = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ];
      return `${monthNames[date.getMonth()]} ${date.getFullYear()}`;
    }
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
        rotate: simplifyXAxis ? 0 : categories.length > 20 ? -90 : -45,
        style: { fontSize: "10px", colors: "#6B7280" },
      },
      tickAmount: simplifyXAxis
        ? Math.min(12, Math.ceil(categories.length / 30))
        : undefined,
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
      x: {
        formatter: (value: number, { dataPointIndex }: any) => {
          if (simplifyXAxis && data[dataPointIndex]) {
            const date = new Date(data[dataPointIndex].date);
            const monthNames = [
              "Jan",
              "Feb",
              "Mar",
              "Apr",
              "May",
              "Jun",
              "Jul",
              "Aug",
              "Sep",
              "Oct",
              "Nov",
              "Dec",
            ];
            return `${monthNames[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
          }
          return categories[dataPointIndex] || "";
        },
      },
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
