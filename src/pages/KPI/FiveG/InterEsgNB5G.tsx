import KPILineChart from "../../../components/kpi/KPILineChart";

export default function InterEsgNB5G() {
  return (
    <div className="p-6">
      <KPILineChart
        title="Inter esgNB Handover Success Rate 5G"
        csvPath="/kpi_data/data_5g.csv"
        parameterColumn="inter_esgnb"
        transformPercent={true}
        intervalDays={2}
        yAxisFormat="percent"
        color="#1f77b4"
      />
    </div>
  );
}
