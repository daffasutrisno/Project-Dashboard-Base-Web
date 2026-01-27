import { useEffect, useState } from "react";
import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";

interface KPIStackedChartProps {
  title: string;
  csvPath: string;
  bottomParameter: string;
  topParameter: string;
  bottomLabel: string;
  topLabel: string;
  yAxisFormat?: "comma" | "number";
  bottomColor?: string;
  topColor?: string;
}

interface DataPoint {
  date: string;
  bottom: number;
  top: number;
}

export default function KPIStackedChart({
  title,
  csvPath,
  bottomParameter,
  topParameter,
  bottomLabel,
  topLabel,
  yAxisFormat = "comma",
  bottomColor = "#1f77b4",
  topColor = "#ff7f0e",
}: KPIStackedChartProps) {
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
        const bottomIdx = headers.indexOf(bottomParameter);
        const topIdx = headers.indexOf(topParameter);

        if (dateIdx === -1 || bottomIdx === -1 || topIdx === -1) {
          console.error("Columns not found");
          return;
        }

        const dataMap = new Map<string, { bottom: number; top: number }>();
        lines.slice(1).forEach((line) => {
          const values = line.split(",");
          const date = values[dateIdx]?.trim();
          const bottomVal = parseFloat(values[bottomIdx]?.trim() || "0");
          const topVal = parseFloat(values[topIdx]?.trim() || "0");

          if (date && !isNaN(bottomVal) && !isNaN(topVal)) {
            const current = dataMap.get(date) || { bottom: 0, top: 0 };
            dataMap.set(date, {
              bottom: Math.max(current.bottom, bottomVal),
              top: Math.max(current.top, topVal),
            });
          }
        });

        const processed = Array.from(dataMap.entries())
          .map(([date, vals]) => ({
            date,
            bottom: vals.bottom,
            top: vals.top,
          }))
          .sort(
            (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
          );

        setData(processed);
      } catch (error) {
        console.error("Error loading stacked data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [csvPath, bottomParameter, topParameter]);

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

  const options: ApexOptions = {
    chart: {
      type: "bar",
      height: 400,
      stacked: true,
      fontFamily: "Outfit, sans-serif",
      toolbar: { show: false },
    },
    plotOptions: {
      bar: {
        borderRadius: 4,
        columnWidth: "60%",
      },
    },
    colors: [bottomColor, topColor],
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
        formatter: (value: number) =>
          yAxisFormat === "comma" ? value.toLocaleString() : value.toFixed(2),
      },
    },
    legend: {
      show: true,
      position: "top",
      horizontalAlign: "center",
      fontSize: "12px",
    },
    tooltip: {
      shared: true,
      intersect: false,
      y: {
        formatter: (value: number) =>
          yAxisFormat === "comma" ? value.toLocaleString() : value.toFixed(2),
      },
    },
  };

  const series = [
    { name: bottomLabel, data: data.map((d) => d.bottom) },
    { name: topLabel, data: data.map((d) => d.top) },
  ];

  return (
    <div className="rounded-2xl border border-gray-200 bg-white px-5 pb-5 pt-5 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6 sm:pt-6">
      <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">
        {title}
      </h3>
      <Chart options={options} series={series} type="bar" height={400} />
    </div>
  );
}
