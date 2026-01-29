import { useEffect, useState } from "react";
import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";

interface KPIDualAxisChartProps {
  title: string;
  csvPathLeft: string;
  csvPathRight: string;
  leftLabel: string;
  rightLabel: string;
  leftIsPercent?: boolean;
  leftColor?: string;
  rightColor?: string;
}

interface DataPoint {
  date: string;
  leftValue: number;
  rightValue: number;
}

export default function KPIDualAxisChart({
  title,
  csvPathLeft,
  csvPathRight,
  leftLabel,
  rightLabel,
  leftIsPercent = false,
  leftColor = "#1f77b4",
  rightColor = "#ff7f0e",
}: KPIDualAxisChartProps) {
  const [data, setData] = useState<DataPoint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        console.log(`[KPIDualAxisChart] Fetching: ${csvPathLeft} and ${csvPathRight}`);
        const [responseLeft, responseRight] = await Promise.all([
          fetch(csvPathLeft),
          fetch(csvPathRight),
        ]);
        
        if (!responseLeft.ok || !responseRight.ok) {
          console.error(`[KPIDualAxisChart] Fetch failed:`, responseLeft.status, responseRight.status);
          return;
        }

        const textLeft = await responseLeft.text();
        const textRight = await responseRight.text();

        const linesLeft = textLeft.split("\n").filter((l) => l.trim());
        const linesRight = textRight.split("\n").filter((l) => l.trim());

        const dataLeft = new Map<string, number>();
        const dataRight = new Map<string, number>();

        linesLeft.slice(1).forEach((line) => {
          const [date, value] = line.split(",");
          dataLeft.set(date.trim(), parseFloat(value.trim()));
        });

        linesRight.slice(1).forEach((line) => {
          const [date, value] = line.split(",");
          dataRight.set(date.trim(), parseFloat(value.trim()));
        });

        const allDates = new Set([...dataLeft.keys(), ...dataRight.keys()]);
        const processed = Array.from(allDates)
          .map((date) => ({
            date,
            leftValue: dataLeft.get(date) || 0,
            rightValue: dataRight.get(date) || 0,
          }))
          .sort(
            (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
          );

        console.log(`[KPIDualAxisChart] Loaded ${processed.length} data points`);
        setData(processed);
      } catch (error) {
        console.error("Error loading dual axis data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [csvPathLeft, csvPathRight]);

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

  const options: ApexOptions = {
    chart: {
      type: "line",
      height: 400,
      fontFamily: "Outfit, sans-serif",
      toolbar: { show: false },
      zoom: { enabled: false },
    },
    stroke: {
      width: [3, 0],
      curve: "smooth",
    },
    plotOptions: {
      bar: {
        columnWidth: "50%",
        borderRadius: 4,
      },
    },
    colors: [leftColor, rightColor],
    grid: {
      borderColor: "#E5E7EB",
      strokeDashArray: 3,
      yaxis: { lines: { show: true } },
    },
    dataLabels: { enabled: false },
    labels: categories,
    xaxis: {
      labels: {
        rotate: categories.length > 20 ? -90 : -45,
        style: { fontSize: "10px", colors: "#6B7280" },
      },
    },
    yaxis: [
      {
        title: {
          text: leftLabel,
          style: { color: leftColor, fontSize: "12px" },
        },
        labels: {
          style: { colors: [leftColor], fontSize: "11px" },
          formatter: (value: number) =>
            leftIsPercent ? `${value.toFixed(2)}%` : value.toFixed(2),
        },
      },
      {
        opposite: true,
        title: {
          text: rightLabel,
          style: { color: rightColor, fontSize: "12px" },
        },
        labels: {
          style: { colors: [rightColor], fontSize: "11px" },
          formatter: (value: number) => value.toFixed(0),
        },
      },
    ],
    legend: {
      show: true,
      position: "top",
      horizontalAlign: "center",
      fontSize: "12px",
    },
    tooltip: {
      shared: true,
      intersect: false,
    },
  };

  const series = [
    {
      name: leftLabel,
      type: "line",
      data: data.map((d) => d.leftValue),
    },
    {
      name: rightLabel,
      type: "column",
      data: data.map((d) => d.rightValue),
    },
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
