import PageMeta from "../../../components/common/PageMeta";
import KPIAreaChart from "../../../components/kpi/KPIAreaChart";

export default function Traffic4G() {
  return (
    <>
      <PageMeta
        title="4G Traffic | KPI Monitoring"
        description="4G Traffic KPI Chart"
      />
      <div className="grid grid-cols-12 gap-4 md:gap-6">
        <div className="col-span-12">
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
            4G KPI Monitoring - Traffic
          </h1>
          <KPIAreaChart
            title="Traffic 4G (GB)"
            csvPath="/kpi_data/data_4g.csv"
            parameterColumn="traffic_4g"
            intervalDays={3}
            filterPositive={true}
            yAxisFormat="comma"
            color="#2ca02c"
          />
        </div>
      </div>
    </>
  );
}
