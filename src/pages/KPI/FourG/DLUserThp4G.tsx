import KPILineChart from "../../../components/kpi/KPILineChart";

export default function DLUserThp4G() {
  return (
    <div className="p-6">
      <KPILineChart
        title="DL User Throughput 4G"
        csvPath="/kpi_data/data_4g.csv"
        parameterColumn="dl_user_thp_bhv"
        showAllDays={true}
        yAxisFormat="number"
        color="#1f77b4"
      />
    </div>
  );
}
