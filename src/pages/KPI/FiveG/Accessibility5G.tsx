import PageMeta from "../../../components/common/PageMeta";
import KPILineChart from "../../../components/kpi/KPILineChart";

export default function Accessibility5G() {
  return (
    <>
      <PageMeta
        title="5G Accessibility | KPI Monitoring"
        description="5G Accessibility KPI Chart"
      />
      <div className="grid grid-cols-12 gap-4 md:gap-6">
        <div className="col-span-12">
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
            5G KPI Monitoring - Accessibility
          </h1>
          <KPILineChart
            title="Accessibility (%)"
            csvPath="/kpi_data/data_5g.csv"
            parameterColumn="da_5g"
            transformPercent={true}
            intervalDays={2}
            filterPositive={true}
            yAxisFormat="percent"
            yAxisPadding={10}
            color="#1f77b4"
          />
        </div>
      </div>
    </>
  );
}
