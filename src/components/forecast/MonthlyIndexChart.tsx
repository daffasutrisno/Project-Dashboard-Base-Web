import { useState, useEffect } from "react";
import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";

interface MonthlyData {
  month: string;
  value: number;
}

interface MonthlyIndexChartProps {
  type: "regional" | "provinsi" | "kabupaten";
  selectedOption: string;
}

export default function MonthlyIndexChart({
  type,
  selectedOption,
}: MonthlyIndexChartProps) {
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        // Load forecast data and aggregate by month
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

        // Parse and aggregate by month-year
        const monthlyAggregates: Record<string, number[]> = {};

        lines.slice(1).forEach((row) => {
          const values = row.split(",");
          const date = values[0]?.trim();
          const traffic = parseFloat(values[1]?.trim() || "0");

          if (date && !isNaN(traffic)) {
            // Extract month-year from date (format: "2025-01-15" -> "2025-01")
            const monthMatch = date.match(/(\d{4})-(\d{2})/);
            if (monthMatch) {
              const monthYear = `${monthMatch[1]}-${monthMatch[2]}`; // Format: "2025-01"
              if (!monthlyAggregates[monthYear]) {
                monthlyAggregates[monthYear] = [];
              }
              monthlyAggregates[monthYear].push(traffic);
            }
          }
        });

        // Calculate average for each month-year and prepare data
        const monthNames = [
          "Jan",
          "Feb",
          "Mar",
          "Apr",
          "May",
          "Jun",
          "Jul",
          "Aug",
          "Sep",
          "Oct",
          "Nov",
          "Dec",
        ];
        const aggregatedData: MonthlyData[] = [];

        Object.keys(monthlyAggregates)
          .sort()
          .forEach((monthYear) => {
            const [year, monthNum] = monthYear.split("-");
            const monthIndex = parseInt(monthNum) - 1;
            const monthName = monthNames[monthIndex] || monthNum;
            const values = monthlyAggregates[monthYear];
            const average =
              values.reduce((sum, val) => sum + val, 0) / values.length;

            aggregatedData.push({
              month: `${monthName} ${year}`, // Format: "Oct 2025"
              value: average,
            });
          });

        setMonthlyData(aggregatedData);
      } catch (error) {
        console.error("Error loading monthly data:", error);
        setMonthlyData([]);
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
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-5 pt-5 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6 sm:pt-6">
        <div className="flex h-[200px] items-center justify-center">
          <p className="text-gray-500 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  const options: ApexOptions = {
    colors: ["#2E86AB"],
    chart: {
      fontFamily: "Outfit, sans-serif",
      type: "bar",
      height: 180,
      toolbar: {
        show: false,
      },
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "45%",
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
      categories: monthlyData.map((d) => d.month),
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
      labels: {
        style: {
          fontSize: "11px",
          colors: "#6B7280",
        },
      },
    },
    legend: {
      show: false,
    },
    yaxis: {
      title: {
        text: undefined,
      },
      labels: {
        style: {
          fontSize: "12px",
          colors: ["#6B7280"],
        },
        formatter: (val: number) => `${val.toFixed(0)}`,
      },
    },
    grid: {
      yaxis: {
        lines: {
          show: true,
        },
      },
      borderColor: "#E5E7EB",
      strokeDashArray: 3,
    },
    fill: {
      opacity: 1,
    },
    tooltip: {
      enabled: true,
      followCursor: true,
      x: {
        show: true,
      },
      y: {
        formatter: (val: number) => `${val.toFixed(2)} TB`,
      },
    },
  };

  const series = [
    {
      name: "Traffic",
      data: monthlyData.map((d) => d.value),
    },
  ];

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-5 pt-5 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6 sm:pt-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
          Monthly Average
        </h3>
      </div>

      <div className="max-w-full overflow-x-auto custom-scrollbar">
        <div className="-ml-5 min-w-[650px] xl:min-w-full pl-2">
          <Chart options={options} series={series} type="bar" height={180} />
        </div>
      </div>
    </div>
  );
}
