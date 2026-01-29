import { useEffect, useState } from "react";
import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";

interface KPIDualLineChartProps {
  title: string;
  csvPath1: string;
  csvPath2: string;
  line1Label: string;
  line2Label: string;
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
  csvPath1,
  csvPath2,
  line1Label,
  line2Label,
  line1Color = "#1f77b4",
  line2Color = "#ff7f0e",
}: KPIDualLineChartProps) {
  const [data, setData] = useState<DataPoint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        console.log(`[KPIDualLineChart] Fetching: ${csvPath1} and ${csvPath2}`);
        // Fetch both pre-aggregated CSV files
        const [response1, response2] = await Promise.all([
          fetch(csvPath1),
          fetch(csvPath2),
        ]);
        
        if (!response1.ok || !response2.ok) {
          console.error(`[KPIDualLineChart] Fetch failed:`, response1.status, response2.status);
          return;
        }

        const text1 = await response1.text();
        const text2 = await response2.text();

        const lines1 = text1.split("\n").filter((l) => l.trim());
        const lines2 = text2.split("\n").filter((l) => l.trim());

        // Parse both files (date,value format)
        const data1 = new Map<string, number>();
        const data2 = new Map<string, number>();

        lines1.slice(1).forEach((line) => {
          const [date, value] = line.split(",");
          data1.set(date.trim(), parseFloat(value.trim()));
        });

        lines2.slice(1).forEach((line) => {
          const [date, value] = line.split(",");
          data2.set(date.trim(), parseFloat(value.trim()));
        });

        // Merge data by date
        const allDates = new Set([...data1.keys(), ...data2.keys()]);
        const processed = Array.from(allDates)
          .map((date) => ({
            date,
            value1: data1.get(date) || 0,
            value2: data2.get(date) || 0,
          }))
          .sort(
            (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
          );

        console.log(`[KPIDualLineChart] Loaded ${processed.length} data points`);
        setData(processed);
      } catch (error) {
        console.error("Error loading dual line data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [csvPath1, csvPath2]);

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
