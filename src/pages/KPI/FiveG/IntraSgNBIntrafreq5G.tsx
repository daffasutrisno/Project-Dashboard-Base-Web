import KPILineChart from "../../../components/kpi/KPILineChart";

export default function IntraSgNBIntrafreq5G() {
  return (
    <div className="p-6">
      <KPILineChart
        title="Intra sgNB Intrafreq Handover Success Rate 5G"
        csvPath="/kpi_data/data_5g.csv"
        parameterColumn="intra_sgnb_intrafreq"
        transformPercent={true}
        intervalDays={2}
        yAxisFormat="percent"
        color="#1f77b4"
      />
    </div>
  );
}
