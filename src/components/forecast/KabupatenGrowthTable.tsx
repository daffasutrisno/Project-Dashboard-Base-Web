import { useState, useEffect } from "react";

interface KabupatenGrowth {
  Kabupaten: string;
  Region: string;
  Province: string;
  Hist_Mean: number;
  Fore_Mean: number;
  Absolute_Growth: number;
  Percentage_Growth: number;
  Has_Forecast: boolean;
}

export default function KabupatenGrowthTable() {
  const [data, setData] = useState<KabupatenGrowth[]>([]);
  const [loading, setLoading] = useState(true);
  const [growthType, setGrowthType] = useState<"absolute" | "percentage">(
    "absolute",
  );
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const response = await fetch("/web_data/kabupaten_all_growth.csv");
        if (!response.ok) {
          throw new Error(`Failed to load data: ${response.statusText}`);
        }

        const text = await response.text();
        const lines = text.split("\n").filter((line) => line.trim());

        // Parse CSV
        const parsed: KabupatenGrowth[] = [];
        lines.slice(1).forEach((line) => {
          const values = line.split(",");
          if (values.length >= 15) {
            parsed.push({
              Kabupaten: values[0].trim(),
              Region: values[1].trim(),
              Province: values[2].trim(),
              Hist_Mean: parseFloat(values[3]) || 0,
              Fore_Mean: parseFloat(values[7]) || 0,
              Absolute_Growth: parseFloat(values[13]) || 0,
              Percentage_Growth: parseFloat(values[14]) || 0,
              Has_Forecast: values[15]?.trim().toLowerCase() === "true",
            });
          }
        });

        // Filter only kabupaten with forecasts
        const withForecast = parsed.filter((d) => d.Has_Forecast);
        setData(withForecast);
      } catch (error) {
        console.error("Error loading kabupaten growth data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white px-5 pb-5 pt-5 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6 sm:pt-6">
        <div className="flex h-[400px] items-center justify-center">
          <p className="text-gray-500 dark:text-gray-400">
            Loading growth data...
          </p>
        </div>
      </div>
    );
  }

  // Sort data
  const sortedData = [...data].sort((a, b) => {
    const valueA =
      growthType === "absolute" ? a.Absolute_Growth : a.Percentage_Growth;
    const valueB =
      growthType === "absolute" ? b.Absolute_Growth : b.Percentage_Growth;
    return sortOrder === "desc" ? valueB - valueA : valueA - valueB;
  });

  return (
    <div className="rounded-2xl border border-gray-200 bg-white px-5 pb-5 pt-5 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6 sm:pt-6">
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
              Kabupaten Growth Rankings
            </h3>
            <p className="mt-1 text-gray-500 text-theme-sm dark:text-gray-400">
              Traffic growth forecast ranked by{" "}
              {growthType === "absolute"
                ? "absolute change"
                : "percentage change"}
            </p>
          </div>

          {/* Controls */}
          <div className="flex flex-wrap gap-2">
            {/* Growth Type Toggle */}
            <div className="flex gap-1 p-1 rounded-lg bg-gray-100 dark:bg-gray-900">
              <button
                onClick={() => setGrowthType("absolute")}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                  growthType === "absolute"
                    ? "bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm"
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                }`}
              >
                Absolute (TB)
              </button>
              <button
                onClick={() => setGrowthType("percentage")}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                  growthType === "percentage"
                    ? "bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm"
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                }`}
              >
                Percentage (%)
              </button>
            </div>

            {/* Sort Order Toggle */}
            <div className="flex gap-1 p-1 rounded-lg bg-gray-100 dark:bg-gray-900">
              <button
                onClick={() => setSortOrder("desc")}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                  sortOrder === "desc"
                    ? "bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm"
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                }`}
              >
                High to Low ↓
              </button>
              <button
                onClick={() => setSortOrder("asc")}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                  sortOrder === "asc"
                    ? "bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm"
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                }`}
              >
                Low to High ↑
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Table with fixed height and scroll */}
      <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="overflow-x-auto">
          <div className="max-h-[500px] overflow-y-auto custom-scrollbar">
            <table className="w-full text-sm border-collapse">
              <thead className="sticky top-0 bg-gray-50 dark:bg-gray-800 z-10">
                <tr className="border-b-2 border-gray-300 dark:border-gray-600">
                  <th className="px-4 py-3 text-left font-semibold text-gray-800 dark:text-white">
                    Rank
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-800 dark:text-white">
                    Kabupaten
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-800 dark:text-white">
                    Province
                  </th>
                  <th className="px-4 py-3 text-right font-semibold text-gray-800 dark:text-white">
                    Historical
                  </th>
                  <th className="px-4 py-3 text-right font-semibold text-gray-800 dark:text-white">
                    Forecast
                  </th>
                  <th className="px-4 py-3 text-right font-semibold text-gray-800 dark:text-white">
                    Growth (TB)
                  </th>
                  <th className="px-4 py-3 text-right font-semibold text-gray-800 dark:text-white">
                    Growth (%)
                  </th>
                </tr>
              </thead>
              <tbody>
                {sortedData.map((row, idx) => {
                  const isPositive =
                    growthType === "absolute"
                      ? row.Absolute_Growth > 0
                      : row.Percentage_Growth > 0;
                  const isNegative =
                    growthType === "absolute"
                      ? row.Absolute_Growth < 0
                      : row.Percentage_Growth < 0;

                  return (
                    <tr
                      key={idx}
                      className={`border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors ${
                        idx < 10 ? "bg-blue-50/30 dark:bg-blue-900/10" : ""
                      }`}
                    >
                      <td className="px-4 py-3 text-gray-700 dark:text-gray-300 font-bold">
                        #{idx + 1}
                      </td>
                      <td className="px-4 py-3 text-gray-800 dark:text-gray-200 font-medium">
                        {row.Kabupaten}
                      </td>
                      <td className="px-4 py-3 text-gray-600 dark:text-gray-400 text-xs">
                        {row.Province || "-"}
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-gray-700 dark:text-gray-300">
                        {row.Hist_Mean.toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-gray-700 dark:text-gray-300">
                        {row.Fore_Mean.toFixed(2)}
                      </td>
                      <td
                        className={`px-4 py-3 text-right font-mono font-semibold ${
                          isPositive && growthType === "absolute"
                            ? "text-green-600 dark:text-green-400"
                            : isNegative && growthType === "absolute"
                              ? "text-red-600 dark:text-red-400"
                              : "text-gray-700 dark:text-gray-300"
                        }`}
                      >
                        {row.Absolute_Growth > 0 ? "+" : ""}
                        {row.Absolute_Growth.toFixed(2)}
                      </td>
                      <td
                        className={`px-4 py-3 text-right font-mono font-semibold ${
                          isPositive && growthType === "percentage"
                            ? "text-green-600 dark:text-green-400"
                            : isNegative && growthType === "percentage"
                              ? "text-red-600 dark:text-red-400"
                              : "text-gray-700 dark:text-gray-300"
                        }`}
                      >
                        {row.Percentage_Growth > 0 ? "+" : ""}
                        {row.Percentage_Growth.toFixed(2)}%
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="mt-4 text-xs text-gray-500 dark:text-gray-400">
        Showing {sortedData.length} kabupaten with forecast data
      </div>
    </div>
  );
}
