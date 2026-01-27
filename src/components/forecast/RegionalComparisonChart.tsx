import { useState, useEffect } from "react";
import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";

interface RegionalStats {
  name: string;
  historical: number;
  forecast: number;
}

export default function RegionalComparisonChart() {
  const [data, setData] = useState<RegionalStats[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAllRegionalData = async () => {
      setLoading(true);
      try {
        // Load from pre-aggregated CSV
        const statsResponse = await fetch("/web_data/regional_statistics.csv");
        const comparisonResponse = await fetch(
          "/web_data/regional_comparison.csv",
        );

        if (statsResponse.ok && comparisonResponse.ok) {
          const statsText = await statsResponse.text();
          const lines = statsText.split("\n").filter((l) => l.trim());

          const stats: RegionalStats[] = [];

          // Parse CSV (skip header)
          lines.slice(1).forEach((line) => {
            const values = line.split(",");
            if (values.length >= 6) {
              stats.push({
                name: values[0].trim(),
                historical: parseFloat(values[1]) || 0, // Hist_Mean
                forecast: parseFloat(values[5]) || 0, // Fore_Mean
              });
            }
          });

          setData(stats);
        }
      } catch (error) {
        console.error("Error loading regional comparison:", error);
      } finally {
        setLoading(false);
      }
    };

    loadAllRegionalData();
  }, []);

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

  const categories = data.map((d) => d.name);
  const historicalData = data.map((d) => d.historical);
  const forecastData = data.map((d) => d.forecast);

  const chartOptions: ApexOptions = {
    chart: {
      type: "bar",
      height: 350,
      fontFamily: "Outfit, sans-serif",
      toolbar: {
        show: false,
      },
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "60%",
        borderRadius: 5,
        borderRadiusApplication: "end",
      },
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      show: true,
      width: 2,
      colors: ["transparent"],
    },
    xaxis: {
      categories: categories,
      labels: {
        style: {
          fontSize: "11px",
          colors: "#6B7280",
        },
      },
    },
    yaxis: {
      title: {
        text: "Avg Traffic (TB/hari)",
        style: {
          fontSize: "12px",
          color: "#6B7280",
        },
      },
      labels: {
        formatter: function (val: number) {
          return val.toFixed(0);
        },
      },
    },
    fill: {
      opacity: 1,
    },
    grid: {
      borderColor: "#E5E7EB",
      strokeDashArray: 3,
      yaxis: {
        lines: {
          show: true,
        },
      },
    },
    tooltip: {
      enabled: true,
      followCursor: true,
      y: {
        formatter: function (val: number) {
          return val.toFixed(2) + " TB/hari";
        },
      },
    },
    legend: {
      position: "top",
      horizontalAlign: "left",
      fontFamily: "Outfit",
      fontSize: "12px",
    },
    colors: ["#2E86AB", "#E63946"],
  };

  const series = [
    {
      name: "Historical",
      data: historicalData,
    },
    {
      name: "Forecast",
      data: forecastData,
    },
  ];

  // Calculate summary table
  const summaryData = data.map((d) => ({
    regional: d.name,
    historical: d.historical,
    forecast: d.forecast,
    change: d.forecast - d.historical,
    percentage: ((d.forecast - d.historical) / d.historical) * 100,
  }));

  const totalHist = historicalData.reduce((a, b) => a + b, 0);
  const totalFore = forecastData.reduce((a, b) => a + b, 0);
  const totalChange = totalFore - totalHist;
  const totalPercent = (totalChange / totalHist) * 100;

  return (
    <div className="rounded-2xl border border-gray-200 bg-white px-5 pb-5 pt-5 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6 sm:pt-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
          Regional Comparison
        </h3>
        <p className="mt-1 text-gray-500 text-theme-sm dark:text-gray-400">
          Average traffic comparison across all regional
        </p>
      </div>

      {/* Bar Chart */}
      <div className="mb-6">
        <Chart options={chartOptions} series={series} type="bar" height={350} />
      </div>

      {/* Summary Table */}
      <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700">
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                Regional
              </th>
              <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                Historical
              </th>
              <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                Forecast
              </th>
              <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                Change (TB)
              </th>
              <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                Change (%)
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-900/50 divide-y divide-gray-200 dark:divide-gray-700">
            {summaryData.map((row, idx) => (
              <tr
                key={idx}
                className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors"
              >
                <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-gray-100">
                  {row.regional}
                </td>
                <td className="px-6 py-4 text-sm text-right font-mono text-gray-700 dark:text-gray-300">
                  {row.historical.toFixed(2)}
                </td>
                <td className="px-6 py-4 text-sm text-right font-mono text-gray-700 dark:text-gray-300">
                  {row.forecast.toFixed(2)}
                </td>
                <td
                  className={`px-6 py-4 text-sm text-right font-mono font-semibold ${
                    row.change > 0
                      ? "text-green-600 dark:text-green-400"
                      : "text-red-600 dark:text-red-400"
                  }`}
                >
                  {row.change > 0 ? "+" : ""}
                  {row.change.toFixed(2)}
                </td>
                <td
                  className={`px-6 py-4 text-sm text-right font-mono font-semibold ${
                    row.percentage > 0
                      ? "text-green-600 dark:text-green-400"
                      : "text-red-600 dark:text-red-400"
                  }`}
                >
                  {row.percentage > 0 ? "+" : ""}
                  {row.percentage.toFixed(2)}%
                </td>
              </tr>
            ))}
            {/* Total Row */}
            <tr className="bg-blue-50 dark:bg-blue-900/20 border-t-2 border-gray-300 dark:border-gray-600">
              <td className="px-6 py-4 text-sm font-bold text-gray-900 dark:text-white">
                TOTAL
              </td>
              <td className="px-6 py-4 text-sm text-right font-mono font-bold text-gray-900 dark:text-white">
                {totalHist.toFixed(2)}
              </td>
              <td className="px-6 py-4 text-sm text-right font-mono font-bold text-gray-900 dark:text-white">
                {totalFore.toFixed(2)}
              </td>
              <td
                className={`px-6 py-4 text-sm text-right font-mono font-bold ${
                  totalChange > 0
                    ? "text-green-600 dark:text-green-400"
                    : "text-red-600 dark:text-red-400"
                }`}
              >
                {totalChange > 0 ? "+" : ""}
                {totalChange.toFixed(2)}
              </td>
              <td
                className={`px-6 py-4 text-sm text-right font-mono font-bold ${
                  totalPercent > 0
                    ? "text-green-600 dark:text-green-400"
                    : "text-red-600 dark:text-red-400"
                }`}
              >
                {totalPercent > 0 ? "+" : ""}
                {totalPercent.toFixed(2)}%
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
