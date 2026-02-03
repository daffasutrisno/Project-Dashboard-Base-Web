import KPIBarChart from "../../../components/kpi/KPIBarChart";

export default function User5G() {
  return (
    <div className="p-6">
      <KPIBarChart
        title="User 5G"
        csvPath="/kpi_data/data_5g.csv"
        parameterColumn="sum_en_dc_user_5g_wd"
        intervalDays={2}
        yAxisFormat="comma"
        color="#1f77b4"
      />
    </div>
  );
}
