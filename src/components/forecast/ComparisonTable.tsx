import { useState, useEffect } from "react";

interface ComparisonData {
  label: string;
  historical: number;
  forecast: number;
}

interface ComparisonTableProps {
  type: "regional" | "provinsi" | "kabupaten";
  selectedOption: string;
}

export default function ComparisonTable({
  type,
  selectedOption,
}: ComparisonTableProps) {
  const [comparisonData, setComparisonData] = useState<ComparisonData[]>([]);
  const [historicalStats, setHistoricalStats] = useState<any>(null);
  const [forecastStats, setForecastStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        // Use pre-aggregated CSV data
        let statsPath = "";
        let searchKey = "";

        if (type === "regional") {
          statsPath = "/web_data/regional_statistics.csv";
          const regionalMap: Record<string, string> = {
            "bali nusra": "BALI NUSRA",
            "central java": "CENTRAL JAVA",
            "east java": "EAST JAVA",
          };
          searchKey =
            regionalMap[selectedOption.toLowerCase().trim()] ||
            selectedOption.toUpperCase();
        } else if (type === "provinsi") {
          statsPath = "/web_data/provinsi_statistics.csv";
          const provinsiMap: Record<string, string> = {
            bali: "Bali",
            "daerah istimewa yogyakarta": "D.I. Yogyakarta",
            "jawa tengah": "Jawa Tengah",
            "jawa timur": "Jawa Timur",
            "nusa tenggara barat": "NTB",
            "nusa tenggara timur": "NTT",
          };
          searchKey =
            provinsiMap[selectedOption.toLowerCase().trim()] || selectedOption;
        } else if (type === "kabupaten") {
          statsPath = "/web_data/kabupaten_statistics.csv";
          searchKey = selectedOption; // Keep as is for kabupaten
        }

        const response = await fetch(statsPath);
        if (!response.ok) {
          throw new Error(`Failed to load statistics: ${response.statusText}`);
        }

        const text = await response.text();
        const lines = text.split("\n").filter((line) => line.trim());
        const headers = lines[0].split(",");

        // Find the row for selected option
        const dataRow = lines.slice(1).find((line) => {
          const firstColumn = line.split(",")[0]?.trim();
          return firstColumn?.toLowerCase() === searchKey?.toLowerCase();
        });

        if (dataRow) {
          const values = dataRow.split(",");

          const histMean = parseFloat(values[1]) || 0;
          const histStd = parseFloat(values[2]) || 0;
          const histMin = parseFloat(values[3]) || 0;
          const histMax = parseFloat(values[4]) || 0;
          const foreMean = parseFloat(values[5]) || 0;
          const foreStd = parseFloat(values[6]) || 0;
          const foreMin = parseFloat(values[7]) || 0;
          const foreMax = parseFloat(values[8]) || 0;
          const histDataPoints = parseInt(values[9]) || 0;
          const foreDataPoints = parseInt(values[10]) || 0;

          setHistoricalStats({
            dataPoints: histDataPoints,
            mean: histMean,
            std: histStd,
            min: histMin,
            max: histMax,
          });

          setForecastStats({
            dataPoints: foreDataPoints,
            mean: foreMean,
            std: foreStd,
            min: foreMin,
            max: foreMax,
          });

          setComparisonData([
            {
              label: "Data Points",
              historical: histDataPoints,
              forecast: foreDataPoints,
            },
            {
              label: "Mean Traffic (TB/hari)",
              historical: histMean,
              forecast: foreMean,
            },
            {
              label: "Std Deviation (TB)",
              historical: histStd,
              forecast: foreStd,
            },
            {
              label: "Min Traffic (TB)",
              historical: histMin,
              forecast: foreMin,
            },
            {
              label: "Max Traffic (TB)",
              historical: histMax,
              forecast: foreMax,
            },
          ]);
        }
      } catch (error) {
        console.error("Error loading comparison data:", error);
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
            Loading comparison...
          </p>
        </div>
      </div>
    );
  }

  if (!historicalStats || !forecastStats) {
    return null;
  }

  const meanChange = forecastStats.mean - historicalStats.mean;
  const percentChange = (meanChange / historicalStats.mean) * 100;

  return (
    <div className="rounded-2xl border border-gray-200 bg-white px-5 pb-5 pt-5 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6 sm:pt-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
          Statistics Summary
        </h3>
        <p className="mt-1 text-gray-500 text-theme-sm dark:text-gray-400">
          Comparison between historical and forecast data
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-700">
              <th className="pb-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                Metric
              </th>
              <th className="pb-3 text-right text-sm font-semibold text-gray-700 dark:text-gray-300">
                Historical
              </th>
              <th className="pb-3 text-right text-sm font-semibold text-gray-700 dark:text-gray-300">
                Forecast
              </th>
              <th className="pb-3 text-right text-sm font-semibold text-gray-700 dark:text-gray-300">
                Change
              </th>
            </tr>
          </thead>
          <tbody>
            {comparisonData.map((row, index) => (
              <tr
                key={index}
                className="border-b border-gray-100 dark:border-gray-800"
              >
                <td className="py-3 text-sm text-gray-600 dark:text-gray-400">
                  {row.label}
                </td>
                <td className="py-3 text-right text-sm font-mono text-gray-800 dark:text-gray-200">
                  {row.label === "Data Points"
                    ? row.historical
                    : row.historical.toFixed(2)}
                </td>
                <td className="py-3 text-right text-sm font-mono text-gray-800 dark:text-gray-200">
                  {row.label === "Data Points"
                    ? row.forecast
                    : row.forecast.toFixed(2)}
                </td>
                <td
                  className={`py-3 text-right text-sm font-mono font-semibold ${
                    row.forecast > row.historical
                      ? "text-green-600 dark:text-green-400"
                      : row.forecast < row.historical
                        ? "text-red-600 dark:text-red-400"
                        : "text-gray-600 dark:text-gray-400"
                  }`}
                >
                  {row.label === "Data Points"
                    ? "-"
                    : `${row.forecast > row.historical ? "+" : ""}${(
                        row.forecast - row.historical
                      ).toFixed(2)}`}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Comparison Summary */}
        <div className="mt-6 rounded-lg bg-blue-50 dark:bg-blue-900/20 p-4">
          <h4 className="text-sm font-semibold text-gray-800 dark:text-white mb-2">
            COMPARISON SUMMARY
          </h4>
          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">
                Mean Change:
              </span>
              <span
                className={`font-mono font-semibold ${
                  meanChange > 0
                    ? "text-green-600 dark:text-green-400"
                    : "text-red-600 dark:text-red-400"
                }`}
              >
                {meanChange > 0 ? "+" : ""}
                {meanChange.toFixed(2)} TB
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">
                Percentage:
              </span>
              <span
                className={`font-mono font-semibold ${
                  percentChange > 0
                    ? "text-green-600 dark:text-green-400"
                    : "text-red-600 dark:text-red-400"
                }`}
              >
                {percentChange > 0 ? "+" : ""}
                {percentChange.toFixed(2)}%
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
