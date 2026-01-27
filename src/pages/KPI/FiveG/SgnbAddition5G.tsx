import KPIBarChart from "../../../components/kpi/KPIBarChart";

export default function SgnbAddition5G() {
  return (
    <div className="p-6">
      <KPIBarChart
        title="Sgnb Addition Success Rate 5G"
        csvPath="/kpi_data/data_5g.csv"
        parameterColumn="sgnb_addition_sr"
        transformPercent={true}
        intervalDays={2}
        yAxisFormat="percent"
        color="#1f77b4"
      />
    </div>
  );
}
