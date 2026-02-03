import KPIStackedPercentChart from "../../../components/kpi/KPIStackedPercentChart";

export default function RRCRatio() {
  return (
    <div className="p-6">
      <KPIStackedPercentChart
        title="Ratio RRC User 4G vs 5G (100%)"
        csvPath="/kpi_data/data_4g.csv"
        bottomParameter="rrc_ue"
        topParameter="da_5g"
        bottomLabel="4G"
        topLabel="5G"
        bottomColor="#1f77b4"
        topColor="#ff7f0e"
      />
    </div>
  );
}
