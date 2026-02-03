import KPIAreaChart from "../../../components/kpi/KPIAreaChart";

export default function Traffic5G() {
  return (
    <div className="p-6">
      <KPIAreaChart
        title="Total Traffic 5G"
        csvPath="/kpi_data/data_5g.csv"
        parameterColumn="traffic_5g"
        intervalDays={2}
        yAxisFormat="comma"
        color="#1f77b4"
      />
    </div>
  );
}
