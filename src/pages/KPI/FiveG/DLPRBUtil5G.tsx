import KPIDualAxisChart from "../../../components/kpi/KPIDualAxisChart";

export default function DLPRBUtil5G() {
  return (
    <div className="p-6">
      <KPIDualAxisChart
        title="DL PRB Utilization 5G"
        csvPath="/kpi_data/data_5g.csv"
        leftParameter="g5_dlprb_util"
        rightParameter="dl_prb_util_5g_count_gt_085"
        leftLabel="DL PRB Util"
        rightLabel="#Cells >85%"
        leftTransformPercent={true}
        intervalDays={2}
        leftColor="#1f77b4"
        rightColor="#ff7f0e"
      />
    </div>
  );
}
