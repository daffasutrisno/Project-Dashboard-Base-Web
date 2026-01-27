import KPIStackedChart from "../../../components/kpi/KPIStackedChart";

export default function TrafficStacked() {
  return (
    <div className="p-6">
      <KPIStackedChart
        title="Total Traffic 4G + 5G (Stacked)"
        csvPath="/kpi_data/data_4g.csv"
        bottomParameter="traffic_4g"
        topParameter="traffic_5g"
        bottomLabel="4G"
        topLabel="5G"
        yAxisFormat="comma"
        bottomColor="#1f77b4"
        topColor="#ff7f0e"
      />
    </div>
  );
}
