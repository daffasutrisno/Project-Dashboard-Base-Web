import PageMeta from "../../../components/common/PageMeta";
import KPIAreaChart from "../../../components/kpi/KPIAreaChart";

export default function CDR5G() {
  return (
    <>
      <PageMeta
        title="5G Call Drop Rate | KPI Monitoring"
        description="5G CDR KPI Chart"
      />
      <div className="grid grid-cols-12 gap-4 md:gap-6">
        <div className="col-span-12">
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
            5G KPI Monitoring - Call Drop Rate
          </h1>
          <KPIAreaChart
            title="Call Drop Rate (%)"
            csvPath="/kpi_data/data_5g.csv"
            parameterColumn="g5_cdr"
            intervalDays={2}
            filterPositive={false}
            yAxisFormat="percent"
            color="#2ca02c"
          />
        </div>
      </div>
    </>
  );
}
