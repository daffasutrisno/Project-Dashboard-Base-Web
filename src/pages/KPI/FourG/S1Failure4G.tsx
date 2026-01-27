import KPILineChart from "../../../components/kpi/KPILineChart";

export default function S1Failure4G() {
  return (
    <div className="p-6">
      <KPILineChart
        title="S1 Failure Rate 4G"
        csvPath="/kpi_data/data_4g.csv"
        parameterColumn="s1_failure"
        intervalDays={3}
        yAxisFormat="number"
        color="#1f77b4"
      />
    </div>
  );
}
