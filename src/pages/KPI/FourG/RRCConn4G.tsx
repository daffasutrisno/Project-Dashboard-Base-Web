import KPILineChart from "../../../components/kpi/KPILineChart";

export default function RRCConn4G() {
  return (
    <div className="p-6">
      <KPILineChart
        title="RRC Connection User 4G"
        csvPath="/kpi_data/data_4g.csv"
        parameterColumn="rrc_ue"
        intervalDays={3}
        yAxisFormat="comma"
        color="#1f77b4"
      />
    </div>
  );
}
