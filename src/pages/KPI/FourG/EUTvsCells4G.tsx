import KPIDualAxisChart from "../../../components/kpi/KPIDualAxisChart";

export default function EUTvsCells4G() {
  return (
    <div className="p-6">
      <KPIDualAxisChart
        title="EUT vs #Cells <31 Mbps 4G"
        csvPath="/kpi_data/data_4g.csv"
        leftParameter="eut_4g_bh"
        rightParameter="eut_4g_bh_count_less_31"
        leftLabel="EUT"
        rightLabel="#Cells <31"
        intervalDays={3}
        leftColor="#1f77b4"
        rightColor="#ff7f0e"
      />
    </div>
  );
}
