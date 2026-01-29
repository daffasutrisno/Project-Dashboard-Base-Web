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
            csvPath="/kpi_results/4g/availability.csv"
            fixedYRange={[0.9995, 1.0001]}
            yAxisFormat="number"
            color="#1f77b4"
          />

          {/* Chart 2: S1 Failure Rate */}
          <KPILineChart
            title="2. S1 Failure Rate 4G"
            csvPath="/kpi_results/4g/s1_failure.csv"
            yAxisFormat="number"
            color="#1f77b4"
          />

          {/* Chart 3: RRC Connection User */}
          <KPILineChart
            title="3. RRC Connection User 4G"
            csvPath="/kpi_results/4g/rrc_ue.csv"
            yAxisFormat="comma"
            color="#1f77b4"
          />

          {/* Chart 4: Total Traffic */}
          <KPIAreaChart
            title="4. Total Traffic 4G"
            csvPath="/kpi_results/4g/traffic.csv"
            yAxisFormat="comma"
            color="#1f77b4"
          />

          {/* Chart 5: EUT vs #Cells <31 Mbps */}
          <KPIDualAxisChart
            title="5. EUT vs #Cells <31 Mbps 4G"
            csvPathLeft="/kpi_results/4g/eut.csv"
            csvPathRight="/kpi_results/4g/eut_count_less_31.csv"
            leftLabel="EUT"
            rightLabel="#Cells <31"
            leftColor="#1f77b4"
            rightColor="#ff7f0e"
          />

          {/* Chart 6: DL PRB Utilization */}
          <KPIDualAxisChart
            title="6. DL PRB Utilization 4G"
            csvPathLeft="/kpi_results/4g/dl_prb_util.csv"
            csvPathRight="/kpi_results/4g/dl_prb_util_count.csv"
            leftLabel="DL PRB Util"
            rightLabel="#Cells >90%"
            leftIsPercent={true}
            leftColor="#1f77b4"
            rightColor="#ff7f0e"
          />

          {/* Chart 7: CQI */}
          <KPIDualAxisChart
            title="7. CQI 4G"
            csvPathLeft="/kpi_results/4g/cqi.csv"
            csvPathRight="/kpi_results/4g/cqi_less_7.csv"
            leftLabel="CQI"
            rightLabel="#Cells <7"
            leftColor="#1f77b4"
            rightColor="#ff7f0e"
          />

          {/* Chart 8: DL User Throughput */}
          <KPILineChart
            title="8. DL User Throughput 4G"
            csvPath="/kpi_results/4g/dl_user_thp.csv"
            yAxisFormat="number"
            color="#1f77b4"
          />

          {/* Chart 9: Total Traffic 4G + 5G (Stacked) */}
          <KPIStackedChart
            title="9. Total Traffic 4G + 5G (Stacked)"
            csvPathBottom="/kpi_results/4g/traffic.csv"
            csvPathTop="/kpi_results/4g/traffic_5g.csv"
            bottomLabel="4G"
            topLabel="5G"
            yAxisFormat="comma"
            bottomColor="#1f77b4"
            topColor="#ff7f0e"
          />

          {/* Chart 10: Ratio Traffic 4G vs 5G */}
          <KPIStackedPercentChart
            title="10. Ratio Traffic 4G vs 5G (100%)"
            csvPathBottom="/kpi_results/4g/traffic.csv"
            csvPathTop="/kpi_results/4g/traffic_5g.csv"
            bottomLabel="4G"
            topLabel="5G"
            bottomColor="#1f77b4"
            topColor="#ff7f0e"
          />

          {/* Chart 11: RRC User 4G + 5G (Stacked) */}
          <KPIStackedChart
            title="11. RRC User 4G + 5G (Stacked)"
            csvPathBottom="/kpi_results/4g/rrc_ue.csv"
            csvPathTop="/kpi_results/4g/da_5g.csv"
            bottomLabel="4G"
            topLabel="5G"
            yAxisFormat="comma"
            bottomColor="#1f77b4"
            topColor="#ff7f0e"
          />

          {/* Chart 12: Ratio RRC User 4G vs 5G */}
          <KPIStackedPercentChart
            title="12. Ratio RRC User 4G vs 5G (100%)"
            csvPathBottom="/kpi_results/4g/rrc_ue.csv"
            csvPathTop="/kpi_results/4g/da_5g.csv"
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
