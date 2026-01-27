import { useState, useEffect } from "react";
import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";
import ChartTab from "../common/ChartTab";

interface ForecastData {
  Date: string;
  "Traffic_Total(TB)": number;
  Lower_Bound?: number;
  Upper_Bound?: number;
}

interface ForecastStatisticsChartProps {
  type: "regional" | "provinsi" | "kabupaten";
  selectedOption: string;
}

export default function ForecastStatisticsChart({
  type,
  selectedOption,
}: ForecastStatisticsChartProps) {
  const [forecastData, setForecastData] = useState<ForecastData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        let fileName = selectedOption.toLowerCase().trim();

        if (type === "regional") {
          const regionalMap: Record<string, string> = {
            "bali nusra": "bali_nusra",
            "central java": "central_java",
            "east java": "east_java",
          };
          fileName = regionalMap[fileName] || fileName.replace(/\s+/g, "_");
        } else if (type === "provinsi") {
          const provinsiMap: Record<string, string> = {
            "daerah istimewa yogyakarta": "daerah_istimewa_yogyakarta",
            "jawa tengah": "jawa_tengah",
            "jawa timur": "jawa_timur",
            "nusa tenggara barat": "nusa_tenggara_barat",
            "nusa tenggara timur": "nusa_tenggara_timur",
          };
          fileName = provinsiMap[fileName] || fileName.replace(/\s+/g, "_");
        } else {
          fileName = fileName.replace(/\s+/g, "_");
        }

        const forecastPath = `/forecast_data/${type}/${fileName}.csv`;
        const response = await fetch(forecastPath);

        if (!response.ok) {
          throw new Error(
            `Failed to load forecast data: ${response.statusText}`
          );
        }

        const text = await response.text();
        const lines = text.split("\n").filter((line) => line.trim());

        if (lines.length < 2) {
          throw new Error("CSV file is empty or invalid");
        }

        const parsed: ForecastData[] = lines.slice(1).map((row) => {
          const values = row.split(",");
          const data: ForecastData = {
            Date: values[0]?.trim() || "",
            "Traffic_Total(TB)": parseFloat(values[1]?.trim() || "0") || 0,
          };
          if (values[2])
            data.Lower_Bound = parseFloat(values[2]?.trim() || "0");
          if (values[3])
            data.Upper_Bound = parseFloat(values[3]?.trim() || "0");
          return data;
        });

        setForecastData(
          parsed.filter((d) => d.Date && !isNaN(d["Traffic_Total(TB)"]))
        );
      } catch (error) {
        console.error("Error loading forecast data:", error);
        setForecastData([]);
      } finally {
        setLoading(false);
      }
    };

    if (selectedOption) {
      loadData();
    }
  }, [selectedOption, type]);

  if (loading) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white px-5 pb-5 pt-5 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6 sm:pt-6">
        <div className="flex h-[310px] items-center justify-center">
          <p className="text-gray-500 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  // Prepare data for chart
  const dates = forecastData.map((d) => d.Date);
  const totalTraffic = forecastData.map((d) => d["Traffic_Total(TB)"]);
  const lowerBound = forecastData.map(
    (d) => d.Lower_Bound || d["Traffic_Total(TB)"] * 0.9
  );

  const options: ApexOptions = {
    legend: {
      show: false,
      position: "top",
      horizontalAlign: "left",
    },
    colors: ["#465FFF", "#9CB9FF"],
    chart: {
      fontFamily: "Outfit, sans-serif",
      height: 310,
      type: "line",
      toolbar: {
        show: false,
      },
      zoom: {
        enabled: false,
      },
    },
    stroke: {
      curve: "smooth",
      width: [2, 2],
    },
    fill: {
      type: "gradient",
      gradient: {
        opacityFrom: 0.55,
        opacityTo: 0,
      },
    },
    markers: {
      size: 0,
      strokeColors: "#fff",
      strokeWidth: 2,
      hover: {
        size: 6,
      },
    },
    grid: {
      xaxis: {
        lines: {
          show: false,
        },
      },
      yaxis: {
        lines: {
          show: true,
        },
      },
    },
    dataLabels: {
      enabled: false,
    },
    tooltip: {
      enabled: true,
      shared: true,
      intersect: false,
      x: {
        format: "dd MMM yyyy",
      },
      y: {
        formatter: (value: number) => `${value.toFixed(2)} TB`,
      },
    },
    xaxis: {
      type: "category",
      categories: dates,
      labels: {
        rotate: -45,
        rotateAlways: false,
        style: {
          fontSize: "11px",
          colors: "#6B7280",
        },
      },
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
      tooltip: {
        enabled: false,
      },
    },
    yaxis: {
      labels: {
        style: {
          fontSize: "12px",
          colors: ["#6B7280"],
        },
        formatter: (value: number) => `${value.toFixed(0)} TB`,
      },
      title: {
        text: "",
        style: {
          fontSize: "0px",
        },
      },
    },
  };

  const series = [
    {
      name: "Forecast Traffic",
      data: totalTraffic,
    },
    {
      name: "Lower Bound",
      data: lowerBound,
    },
  ];

  return (
    <div className="rounded-2xl border border-gray-200 bg-white px-5 pb-5 pt-5 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6 sm:pt-6">
      <div className="flex flex-col gap-5 mb-6 sm:flex-row sm:justify-between">
        <div className="w-full">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Forecast Statistics
          </h3>
          <p className="mt-1 text-gray-500 text-theme-sm dark:text-gray-400">
            {selectedOption} - Forecast trends and bounds
          </p>
        </div>
        <div className="flex items-start w-full gap-3 sm:justify-end">
          <ChartTab />
        </div>
      </div>

      <div className="max-w-full overflow-x-auto custom-scrollbar">
        <div className="min-w-[1000px] xl:min-w-full">
          <Chart options={options} series={series} type="area" height={310} />
        </div>
      </div>
    </div>
  );
}
