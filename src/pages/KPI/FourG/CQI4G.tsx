import KPIDualAxisChart from "../../../components/kpi/KPIDualAxisChart";

export default function CQI4G() {
  return (
    <div className="p-6">
      <KPIDualAxisChart
        title="CQI 4G"
        csvPath="/kpi_data/data_4g.csv"
        leftParameter="cqi_bh"
        rightParameter="cqi_less_than_7"
        leftLabel="CQI"
        rightLabel="#Cells <7"
        showAllDays={true}
        leftColor="#1f77b4"
        rightColor="#ff7f0e"
      />
    </div>
  );
}
