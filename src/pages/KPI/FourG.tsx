import PageMeta from "../../components/common/PageMeta";
import KPILineChart from "../../components/kpi/KPILineChart";
import KPIAreaChart from "../../components/kpi/KPIAreaChart";
import KPIDualAxisChart from "../../components/kpi/KPIDualAxisChart";
import KPIStackedChart from "../../components/kpi/KPIStackedChart";
import KPIStackedPercentChart from "../../components/kpi/KPIStackedPercentChart";

export default function FourG() {
  return (
    <>
      <PageMeta
        title="4G KPI Monitoring | Monitoring"
        description="4G KPI Monitoring page"
      />
      <div className="space-y-6 p-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
          KPI Monitoring 4G
        </h1>

        <div className="grid grid-cols-1 gap-6">
          {/* Chart 1: Availability */}
          <KPILineChart
            title="1. Availability 4G"
            csvPath="/kpi_data/data_4g.csv"
            parameterColumn="g4_avail_auto"
            intervalDays={3}
            yAxisFormat="number"
            color="#1f77b4"
          />

          {/* Chart 2: S1 Failure Rate */}
          <KPILineChart
            title="2. S1 Failure Rate 4G"
            csvPath="/kpi_data/data_4g.csv"
            parameterColumn="s1_failure"
            intervalDays={3}
            yAxisFormat="number"
            color="#1f77b4"
          />

          {/* Chart 3: RRC Connection User */}
          <KPILineChart
            title="3. RRC Connection User 4G"
            csvPath="/kpi_data/data_4g.csv"
            parameterColumn="rrc_ue"
            intervalDays={3}
            yAxisFormat="comma"
            color="#1f77b4"
          />

          {/* Chart 4: Total Traffic */}
          <KPIAreaChart
            title="4. Total Traffic 4G"
            csvPath="/kpi_data/data_4g.csv"
            parameterColumn="traffic_4g"
            intervalDays={3}
            yAxisFormat="comma"
            color="#1f77b4"
          />

          {/* Chart 5: EUT vs #Cells <31 Mbps */}
          <KPIDualAxisChart
            title="5. EUT vs #Cells <31 Mbps 4G"
            csvPath="/kpi_data/data_4g.csv"
            leftParameter="eut_4g_bh"
            rightParameter="eut_4g_bh_count_less_31"
            leftLabel="EUT"
            rightLabel="#Cells <31"
            intervalDays={3}
            leftColor="#1f77b4"
            rightColor="#ff7f0e"
          />

          {/* Chart 6: DL PRB Utilization */}
          <KPIDualAxisChart
            title="6. DL PRB Utilization 4G"
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

          {/* Chart 7: CQI */}
          <KPIDualAxisChart
            title="7. CQI 4G"
            csvPath="/kpi_data/data_4g.csv"
            leftParameter="cqi_bh"
            rightParameter="cqi_less_than_7"
            leftLabel="CQI"
            rightLabel="#Cells <7"
            showAllDays={true}
            leftColor="#1f77b4"
            rightColor="#ff7f0e"
          />

          {/* Chart 8: DL User Throughput */}
          <KPILineChart
            title="8. DL User Throughput 4G"
            csvPath="/kpi_data/data_4g.csv"
            parameterColumn="dl_user_thp_bhv"
            showAllDays={true}
            yAxisFormat="number"
            color="#1f77b4"
          />

          {/* Chart 9: Total Traffic 4G + 5G (Stacked) */}
          <KPIStackedChart
            title="9. Total Traffic 4G + 5G (Stacked)"
            csvPath="/kpi_data/data_4g.csv"
            bottomParameter="traffic_4g"
            topParameter="traffic_5g"
            bottomLabel="4G"
            topLabel="5G"
            yAxisFormat="comma"
            bottomColor="#1f77b4"
            topColor="#ff7f0e"
          />

          {/* Chart 10: Ratio Traffic 4G vs 5G */}
          <KPIStackedPercentChart
            title="10. Ratio Traffic 4G vs 5G (100%)"
            csvPath="/kpi_data/data_4g.csv"
            bottomParameter="traffic_4g"
            topParameter="traffic_5g"
            bottomLabel="4G"
            topLabel="5G"
            bottomColor="#1f77b4"
            topColor="#ff7f0e"
          />

          {/* Chart 11: RRC User 4G + 5G (Stacked) */}
          <KPIStackedChart
            title="11. RRC User 4G + 5G (Stacked)"
            csvPath="/kpi_data/data_4g.csv"
            bottomParameter="rrc_ue"
            topParameter="da_5g"
            bottomLabel="4G"
            topLabel="5G"
            yAxisFormat="comma"
            bottomColor="#1f77b4"
            topColor="#ff7f0e"
          />

          {/* Chart 12: Ratio RRC User 4G vs 5G */}
          <KPIStackedPercentChart
            title="12. Ratio RRC User 4G vs 5G (100%)"
            csvPath="/kpi_data/data_4g.csv"
            bottomParameter="rrc_ue"
            topParameter="da_5g"
            bottomLabel="4G"
            topLabel="5G"
            bottomColor="#1f77b4"
            topColor="#ff7f0e"
          />
        </div>
      </div>
    </>
  );
}
