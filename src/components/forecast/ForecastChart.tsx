import { useState, useEffect } from "react";
import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";

interface ForecastData {
  Date: string;
  "Traffic_Total(TB)": number;
  Lower_Bound?: number;
  Upper_Bound?: number;
}

interface ForecastChartProps {
  type: "regional" | "provinsi" | "kabupaten";
  options: string[];
  selectedOption: string;
  onOptionChange: (option: string) => void;
}

type ViewMode = "both" | "forecast";

export default function ForecastChart({
  type,
  options,
  selectedOption,
  onOptionChange,
}: ForecastChartProps) {
  const [forecastData, setForecastData] = useState<ForecastData[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>("both");
  const [showForecastLine, setShowForecastLine] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        let forecastFileName = selectedOption
          .toUpperCase()
          .trim()
          .replace(/\s+/g, "_");

        if (type === "regional") {
          const regionalMap: Record<string, string> = {
            BALI_NUSRA: "BALI_NUSRA",
            CENTRAL_JAVA: "CENTRAL_JAVA",
            EAST_JAVA: "EAST_JAVA",
          };
          forecastFileName = regionalMap[forecastFileName] || forecastFileName;
        } else if (type === "provinsi") {
          const provinsiMap: Record<string, string> = {
            DAERAH_ISTIMEWA_YOGYAKARTA: "DAERAH_ISTIMEWA_YOGYAKARTA",
            JAWA_TENGAH: "JAWA_TENGAH",
            JAWA_TIMUR: "JAWA_TIMUR",
            NUSA_TENGGARA_BARAT: "NUSA_TENGGARA_BARAT",
            NUSA_TENGGARA_TIMUR: "NUSA_TENGGARA_TIMUR",
          };
          forecastFileName = provinsiMap[forecastFileName] || forecastFileName;
        } else if (type === "kabupaten") {
          const kabupatenMap: Record<string, string> = {
            SEMARANG: "KOTA_SEMARANG",
            SURABAYA: "KOTA_SURABAYA",
            DENPASAR: "KOTA_DENPASAR",
            MALANG: "MALANG",
            YOGYAKARTA: "KOTA_YOGYAKARTA",
            SURAKARTA: "KOTA_SURAKARTA",
            KEDIRI: "KEDIRI",
            BLITAR: "BLITAR",
            MADIUN: "MADIUN",
            MAGELANG: "MAGELANG",
            PEKALONGAN: "PEKALONGAN",
            TEGAL: "TEGAL",
            CILACAP: "CILACAP",
            BANYUMAS: "BANYUMAS",
            KUDUS: "KUDUS",
            JEPARA: "JEPARA",
            REMBANG: "REMBANG",
            PATI: "PATI",
            GRESIK: "GRESIK",
            SIDOARJO: "SIDOARJO",
          };
          forecastFileName = kabupatenMap[forecastFileName] || forecastFileName;
        }

        // Use merged_outputs folder structure
        const folderMap = {
          regional: "by_region",
          provinsi: "by_province",
          kabupaten: "by_kabupaten",
        };
        const folder = folderMap[type];

        const forecastPath = `/merged_outputs/${folder}/${forecastFileName}.csv`;
        const forecastResponse = await fetch(forecastPath);
        if (!forecastResponse.ok) {
          throw new Error(
            `Failed to load forecast data: ${forecastResponse.statusText}`,
          );
        }

        const forecastText = await forecastResponse.text();
        const lines = forecastText.split("\n").filter((line) => line.trim());
        if (lines.length < 2) {
          throw new Error("CSV file is empty or invalid");
        }

        const forecastParsed: ForecastData[] = lines.slice(1).map((row) => {
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
          forecastParsed.filter(
            (d) => d.Date && !isNaN(d["Traffic_Total(TB)"]),
          ),
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
        <div className="flex h-[400px] items-center justify-center">
          <p className="text-gray-500 dark:text-gray-400">
            Loading chart data...
          </p>
        </div>
      </div>
    );
  }

  if (forecastData.length === 0) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white px-5 pb-5 pt-5 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6 sm:pt-6">
        <div className="flex h-[400px] items-center justify-center">
          <p className="text-red-500 dark:text-red-400">
            No forecast data available for {selectedOption}
          </p>
        </div>
      </div>
    );
  }

  const allDates: string[] = [];
  const trafficData: (number | null)[] = [];
  const upperBoundData: (number | null)[] = [];
  const lowerBoundData: (number | null)[] = [];

  let forecastStartIndex = -1;

  forecastData.forEach((d, index) => {
    allDates.push(d.Date);
    trafficData.push(d["Traffic_Total(TB)"]);

    const lower = d.Lower_Bound || 0;
    const upper = d.Upper_Bound || 0;

    // Only add bounds if they are non-zero
    if (lower !== 0 && upper !== 0) {
      upperBoundData.push(upper);
      lowerBoundData.push(lower);

      // Mark forecast start when bounds become non-zero
      if (forecastStartIndex === -1) {
        forecastStartIndex = index;
      }
    } else {
      upperBoundData.push(null);
      lowerBoundData.push(null);
    }
  });
  let xAxisMin: number | undefined = undefined;
  let xAxisMax: number | undefined = undefined;

  if (viewMode === "forecast" && forecastStartIndex >= 0) {
    xAxisMin = new Date(allDates[forecastStartIndex]).getTime();
    xAxisMax = new Date(allDates[allDates.length - 1]).getTime();
  }

  const chartOptions: ApexOptions = {
    legend: {
      show: true,
      position: "top",
      horizontalAlign: "left",
      fontFamily: "Outfit",
      fontSize: "12px",
      markers: { width: 8, height: 8, radius: 2 },
      itemMargin: { horizontal: 8, vertical: 5 },
      onItemClick: {
        toggleDataSeries: true,
      },
      onItemHover: {
        highlightDataSeries: true,
      },
    },
    colors: ["#2E86AB", "#E63946", "#F4A261"],
    chart: {
      fontFamily: "Outfit, sans-serif",
      height: 350,
      type: "line",
      toolbar: { show: false },
      zoom: { enabled: false },
    },
    stroke: { curve: "smooth", width: [2, 1.5, 1.5], dashArray: [0, 3, 3] },
    fill: {
      type: ["gradient", "solid", "solid"],
      gradient: { opacityFrom: 0.5, opacityTo: 0.1 },
      opacity: [1, 0.4, 0.4],
    },
    markers: {
      size: 0,
      strokeColors: "#fff",
      strokeWidth: 2,
      hover: { size: 5, sizeOffset: 3 },
    },
    grid: {
      xaxis: { lines: { show: false } },
      yaxis: { lines: { show: true } },
      borderColor: "#E5E7EB",
      strokeDashArray: 3,
    },
    dataLabels: { enabled: false },
    tooltip: {
      enabled: true,
      shared: true,
      intersect: false,
      followCursor: true,
      x: {
        format: "dd MMM yyyy",
      },
      y: {
        formatter: (value: number, { seriesIndex, dataPointIndex, w }: any) => {
          if (value === null || value === undefined) return "";
          const seriesName = w.config.series[seriesIndex].name;
          return `${value.toFixed(2)} TB`;
        },
      },
      custom: function ({ series, seriesIndex, dataPointIndex, w }: any) {
        const date = new Date(w.globals.seriesX[seriesIndex][dataPointIndex]);
        const dateStr = date.toLocaleDateString("en-US", {
          day: "numeric",
          month: "short",
          year: "numeric",
        });

        let html = `<div class="apexcharts-tooltip-custom" style="padding: 8px 12px; background: rgba(0,0,0,0.85); border-radius: 6px;">`;
        html += `<div style="font-weight: 600; margin-bottom: 6px; color: #fff; font-size: 12px;">${dateStr}</div>`;

        // Traffic
        const trafficValue = series[0][dataPointIndex];
        if (trafficValue !== null && trafficValue !== undefined) {
          html += `<div style="display: flex; align-items: center; margin: 4px 0;">`;
          html += `<span style="width: 10px; height: 10px; background: #2E86AB; border-radius: 2px; margin-right: 6px;"></span>`;
          html += `<span style="color: #E5E7EB; font-size: 11px;">Traffic: <strong style="color: #fff;">${trafficValue.toFixed(2)} TB</strong></span>`;
          html += `</div>`;
        }

        // Upper Bound
        if (series.length > 1) {
          const upperValue = series[1][dataPointIndex];
          if (upperValue !== null && upperValue !== undefined) {
            html += `<div style="display: flex; align-items: center; margin: 4px 0;">`;
            html += `<span style="width: 10px; height: 10px; background: #E63946; border-radius: 2px; margin-right: 6px;"></span>`;
            html += `<span style="color: #E5E7EB; font-size: 11px;">Upper Bound: <strong style="color: #fff;">${upperValue.toFixed(2)} TB</strong></span>`;
            html += `</div>`;
          }
        }

        // Lower Bound
        if (series.length > 2) {
          const lowerValue = series[2][dataPointIndex];
          if (lowerValue !== null && lowerValue !== undefined) {
            html += `<div style="display: flex; align-items: center; margin: 4px 0;">`;
            html += `<span style="width: 10px; height: 10px; background: #F4A261; border-radius: 2px; margin-right: 6px;"></span>`;
            html += `<span style="color: #E5E7EB; font-size: 11px;">Lower Bound: <strong style="color: #fff;">${lowerValue.toFixed(2)} TB</strong></span>`;
            html += `</div>`;
          }
        }

        html += `</div>`;
        return html;
      },
    },
    xaxis: {
      type: "datetime",
      min: xAxisMin,
      max: xAxisMax,
      labels: {
        rotate: -45,
        rotateAlways: false,
        hideOverlappingLabels: true,
        trim: true,
        style: { fontSize: "11px", colors: "#6B7280" },
        datetimeUTC: false,
        format: "MMM yyyy",
      },
      axisBorder: { show: true, color: "#E5E7EB" },
      axisTicks: { show: true, color: "#E5E7EB" },
      tooltip: { enabled: true },
    },
    yaxis: {
      labels: {
        style: { fontSize: "12px", colors: ["#6B7280"] },
        formatter: (value: number) => `${value.toFixed(0)}`,
      },
      title: { text: "", style: { fontSize: "0px" } },
    },
    annotations:
      forecastStartIndex >= 0 && showForecastLine
        ? {
            xaxis: [
              {
                x: new Date(allDates[forecastStartIndex]).getTime(),
                strokeDashArray: 5,
                borderColor: "#10B981",
                borderWidth: 2,
                label: {
                  borderColor: "#10B981",
                  style: {
                    color: "#fff",
                    background: "#10B981",
                    fontSize: "10px",
                    fontWeight: 600,
                  },
                  text: "Forecast Start",
                  offsetY: -10,
                  orientation: "horizontal",
                },
              },
            ],
          }
        : { xaxis: [] },
  };

  const series: any[] = [
    {
      name: "Traffic",
      type: "area",
      data: allDates.map((date, index) => ({
        x: new Date(date).getTime(),
        y: trafficData[index],
      })),
    },
    {
      name: "Upper Bound",
      type: "line",
      data: allDates
        .map((date, index) => ({
          x: new Date(date).getTime(),
          y: upperBoundData[index],
        }))
        .filter((d) => d.y !== null),
    },
    {
      name: "Lower Bound",
      type: "line",
      data: allDates
        .map((date, index) => ({
          x: new Date(date).getTime(),
          y: lowerBoundData[index],
        }))
        .filter((d) => d.y !== null),
    },
  ];

  return (
    <div className="rounded-2xl border border-gray-200 bg-white px-5 pb-5 pt-5 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6 sm:pt-6">
      <div className="flex flex-col gap-5 mb-6 sm:flex-row sm:justify-between">
        <div className="w-full">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Traffic Forecast Analysis
          </h3>
          <p className="mt-1 text-gray-500 text-theme-sm dark:text-gray-400">
            {selectedOption} - Daily traffic prediction
          </p>
        </div>
        <div className="flex flex-wrap items-start w-full gap-2 sm:justify-end">
          {forecastStartIndex >= 0 && (
            <button
              onClick={() => setShowForecastLine(!showForecastLine)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${showForecastLine ? "bg-emerald-500 text-white hover:bg-emerald-600" : "bg-gray-100 dark:bg-gray-900 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-800"}`}
            >
              Forecast Line: {showForecastLine ? "ON" : "OFF"}
            </button>
          )}
          <div className="flex gap-1 p-1 rounded-lg bg-gray-100 dark:bg-gray-900">
            <button
              onClick={() => setViewMode("both")}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${viewMode === "both" ? "bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm" : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"}`}
            >
              All Data
            </button>
            <button
              onClick={() => setViewMode("forecast")}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${viewMode === "forecast" ? "bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm" : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"}`}
            >
              Forecast Only
            </button>
          </div>
          <select
            value={selectedOption}
            onChange={(e) => onOptionChange(e.target.value)}
            className="px-4 py-2 text-sm font-medium rounded-lg bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            {options.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="max-w-full overflow-x-auto custom-scrollbar">
        <div className="min-w-[1000px] xl:min-w-full">
          <Chart
            options={chartOptions}
            series={series}
            type="area"
            height={350}
          />
        </div>
      </div>
    </div>
  );
}
