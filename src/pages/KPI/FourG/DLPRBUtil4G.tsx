import KPIDualAxisChart from "../../../components/kpi/KPIDualAxisChart";

export default function DLPRBUtil4G() {
  return (
    <div className="p-6">
      <KPIDualAxisChart
        title="DL PRB Utilization 4G"
        csvPath="/kpi_data/data_4g.csv"
        leftParameter="dl_prb_util"
        rightParameter="dl_prb_util_count_gt_09"
        leftLabel="DL PRB Util"
        rightLabel="#Cells >90%"
        leftTransformPercent={true}
        showAllDays={true}
        leftColor="#1f77b4"
        rightColor="#ff7f0e"
      />
    </div>
  );
}
