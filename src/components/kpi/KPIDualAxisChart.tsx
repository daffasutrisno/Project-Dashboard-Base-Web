import { useEffect, useState } from "react";
import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";

interface KPIDualAxisChartProps {
  title: string;
  csvPath: string;
  leftParameter: string;
  rightParameter: string;
  leftLabel: string;
  rightLabel: string;
  leftTransformPercent?: boolean;
  intervalDays?: number;
  showAllDays?: boolean;
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
  csvPath,
  leftParameter,
  rightParameter,
  leftLabel,
  rightLabel,
  leftTransformPercent = false,
  intervalDays = 1,
  showAllDays = false,
  leftColor = "#1f77b4",
  rightColor = "#ff7f0e",
}: KPIDualAxisChartProps) {
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
        const leftIdx = headers.indexOf(leftParameter);
        const rightIdx = headers.indexOf(rightParameter);

        if (dateIdx === -1 || leftIdx === -1 || rightIdx === -1) {
          console.error("Columns not found");
          return;
        }

        const dataMap = new Map<
          string,
          { leftValue: number; rightValue: number }
        >();
        lines.slice(1).forEach((line) => {
          const values = line.split(",");
          const date = values[dateIdx]?.trim();
          const leftVal = parseFloat(values[leftIdx]?.trim() || "0");
          const rightVal = parseFloat(values[rightIdx]?.trim() || "0");

          if (date && !isNaN(leftVal) && !isNaN(rightVal)) {
            if (leftVal > 0 || rightVal > 0) {
              const current = dataMap.get(date) || {
                leftValue: 0,
                rightValue: 0,
              };
              dataMap.set(date, {
                leftValue: Math.max(current.leftValue, leftVal),
                rightValue: Math.max(current.rightValue, rightVal),
              });
            }
          }
        });

        let processed = Array.from(dataMap.entries())
          .map(([date, vals]) => ({
            date,
            leftValue: leftTransformPercent
              ? vals.leftValue * 100
              : vals.leftValue,
            rightValue: vals.rightValue,
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
        console.error("Error loading dual axis data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [
    csvPath,
    leftParameter,
    rightParameter,
    leftTransformPercent,
    intervalDays,
    showAllDays,
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
            leftTransformPercent ? `${value.toFixed(2)}%` : value.toFixed(2),
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
