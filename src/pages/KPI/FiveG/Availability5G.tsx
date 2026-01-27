import PageMeta from "../../../components/common/PageMeta";
import KPILineChart from "../../../components/kpi/KPILineChart";

export default function Availability5G() {
  return (
    <>
      <PageMeta
        title="5G Availability | KPI Monitoring"
        description="5G Availability KPI Chart"
      />
      <div className="grid grid-cols-12 gap-4 md:gap-6">
        <div className="col-span-12">
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
            5G KPI Monitoring - Availability
          </h1>
          <KPILineChart
            title="Availability (%)"
            csvPath="/kpi_data/data_5g.csv"
            parameterColumn="avail_auto_5g"
            transformPercent={true}
            showAllDays={true}
            filterPositive={true}
            yAxisFormat="percent"
            yAxisPadding={20}
            fixedYRange={[96, 105]}
            color="#1f77b4"
          />
        </div>
      </div>
    </>
  );
}
