import KPIDualLineChart from "../../../components/kpi/KPIDualLineChart";

export default function EUTvsDLThp5G() {
  return (
    <div className="p-6">
      <KPIDualLineChart
        title="EUT vs DL User Throughput 5G"
        csvPath="/kpi_data/data_5g.csv"
        line1Parameter="g5_eut_bhv"
        line2Parameter="g5_userdl_thp"
        line1Label="EUT"
        line2Label="DL User Thp"
        showAllDays={true}
        line1Color="#1f77b4"
        line2Color="#ff7f0e"
      />
    </div>
  );
}
