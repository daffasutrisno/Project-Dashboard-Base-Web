import { useEffect, useState } from "react";
import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";

interface KPIBarChartProps {
  title: string;
  csvPath: string;
  yAxisFormat?: "percent" | "number" | "comma";
  color?: string;
}

interface DataPoint {
  date: string;
  value: number;
}

export default function KPIBarChart({
  title,
  csvPath,
  yAxisFormat = "number",
  color = "#1f77b4",
}: KPIBarChartProps) {
  const [data, setData] = useState<DataPoint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        console.log(`[KPIBarChart] Fetching: ${csvPath}`);
        const response = await fetch(csvPath);
        
        if (!response.ok) {
          console.error(`[KPIBarChart] Fetch failed: ${response.status} ${response.statusText}`);
          return;
        }
        
        const text = await response.text();
        console.log(`[KPIBarChart] Received ${text.length} bytes`);
        const lines = text.split("\n").filter((l) => l.trim());
        console.log(`[KPIBarChart] Found ${lines.length} lines`);

        const headers = lines[0]?.split(",").map(h => h.trim()) || [];
        console.log(`[KPIBarChart] Headers:`, headers);
        
        if (headers[0] !== "date" || headers[1] !== "value") {
          console.error(`[KPIBarChart] Wrong format! Expected 'date,value' but got:`, headers);
          return;
        }

        const processed = lines.slice(1).map((line) => {
          const [date, value] = line.split(",");
          return {
            date: date.trim(),
            value: parseFloat(value.trim()),
          };
        }).filter(d => !isNaN(d.value));

        console.log(`[KPIBarChart] Processed ${processed.length} valid data points`, processed.slice(0, 3));
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
    return `${String(date.getDate()).padStart(2, "0")}/${String(date.getMonth() + 1).padStart(2, "0")}/${date.getFullYear()}`;
  });
  const values = data.map((d) => d.value);

  const options: ApexOptions = {
    chart: {
      type: "bar",
      height: 400,
      fontFamily: "Outfit, sans-serif",
      toolbar: { show: false },
    },
    plotOptions: {
      bar: {
        borderRadius: 4,
        columnWidth: "60%",
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
      <Chart options={options} series={series} type="bar" height={400} />
    </div>
  );
}
