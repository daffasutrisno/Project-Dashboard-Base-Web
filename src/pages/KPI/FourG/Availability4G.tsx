import PageMeta from "../../../components/common/PageMeta";
import KPILineChart from "../../../components/kpi/KPILineChart";

export default function Availability4G() {
  return (
    <>
      <PageMeta
        title="4G Availability | KPI Monitoring"
        description="4G Availability KPI Chart"
      />
      <div className="grid grid-cols-12 gap-4 md:gap-6">
        <div className="col-span-12">
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
            4G KPI Monitoring - Availability
          </h1>
          <KPILineChart
            title="Availability (%)"
            csvPath="/kpi_data/data_4g.csv"
            parameterColumn="g4_avail_auto"
            transformPercent={false}
            intervalDays={3}
            filterPositive={true}
            yAxisFormat="percent"
            yAxisPadding={20}
            color="#1f77b4"
          />
        </div>
      </div>
    </>
  );
}
