import PageMeta from "../../components/common/PageMeta";
import KPILineChart from "../../components/kpi/KPILineChart";
import KPIAreaChart from "../../components/kpi/KPIAreaChart";
import KPIBarChart from "../../components/kpi/KPIBarChart";
import KPIDualLineChart from "../../components/kpi/KPIDualLineChart";
import KPIDualAxisChart from "../../components/kpi/KPIDualAxisChart";

export default function FiveG() {
  return (
    <>
      <PageMeta
        title="5G KPI Monitoring | Monitoring"
        description="5G KPI Monitoring page"
      />
      <div className="space-y-6 p-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
          KPI Monitoring 5G
        </h1>

        <div className="grid grid-cols-1 gap-6">
          {/* Chart 1: Availability */}
          <KPILineChart
            title="1. Availability 5G"
            csvPath="/kpi_results/5g/availability.csv"
            fixedYRange={[96, 105]}
            yAxisFormat="percent"
            color="#1f77b4"
            simplifyXAxis={true}
          />

          {/* Chart 2: Accessibility */}
          <KPILineChart
            title="2. Accessibility 5G"
            csvPath="/kpi_results/5g/accessibility.csv"
            yAxisFormat="percent"
            color="#1f77b4"
            simplifyXAxis={true}
          />

          {/* Chart 3: Call Drop Rate */}
          <KPIAreaChart
            title="3. Call Drop Rate 5G"
            csvPath="/kpi_results/5g/cdr.csv"
            yAxisFormat="percent"
            color="#1f77b4"
            simplifyXAxis={true}
          />

          {/* Chart 4: Sgnb Addition Success Rate */}
          <KPIBarChart
            title="4. Sgnb Addition Success Rate 5G"
            csvPath="/kpi_results/5g/sgnb_addition.csv"
            yAxisFormat="percent"
            color="#1f77b4"
            simplifyXAxis={true}
          />

          {/* Chart 5: Total Traffic */}
          <KPIAreaChart
            title="5. Total Traffic 5G"
            csvPath="/kpi_results/5g/traffic.csv"
            yAxisFormat="comma"
            color="#1f77b4"
            simplifyXAxis={true}
          />

          {/* Chart 6: EUT vs DL User Throughput */}
          <KPIDualLineChart
            title="6. EUT vs DL User Throughput 5G"
            csvPath1="/kpi_results/5g/eut.csv"
            csvPath2="/kpi_results/5g/dl_user_thp.csv"
            line1Label="EUT"
            line2Label="DL User Thp"
            line1Color="#1f77b4"
            line2Color="#ff7f0e"
            simplifyXAxis={true}
          />

          {/* Chart 7: User 5G */}
          <KPIBarChart
            title="7. User 5G"
            csvPath="/kpi_results/5g/user.csv"
            yAxisFormat="comma"
            color="#1f77b4"
            simplifyXAxis={true}
          />

          {/* Chart 8: DL PRB Utilization */}
          <KPIDualAxisChart
            title="8. DL PRB Utilization 5G"
            csvPathLeft="/kpi_results/5g/dl_prb_util.csv"
            csvPathRight="/kpi_results/5g/dl_prb_util_count.csv"
            leftLabel="DL PRB Util"
            rightLabel="#Cells >85%"
            leftIsPercent={true}
            leftColor="#1f77b4"
            rightColor="#ff7f0e"
            simplifyXAxis={true}
            filterLeftGreaterThanZero={true}
          />

          {/* Chart 9: Inter esgNB Handover SR */}
          <KPILineChart
            title="9. Inter esgNB Handover Success Rate 5G"
            csvPath="/kpi_results/5g/inter_esgnb.csv"
            yAxisFormat="percent"
            color="#1f77b4"
            simplifyXAxis={true}
          />

          {/* Chart 10: Intra esgNB Handover SR */}
          <KPILineChart
            title="10. Intra esgNB Handover Success Rate 5G"
            csvPath="/kpi_results/5g/intra_esgnb.csv"
            yAxisFormat="percent"
            color="#1f77b4"
            simplifyXAxis={true}
          />

          {/* Chart 11: Intra sgNB Intrafreq HO SR */}
          <KPILineChart
            title="11. Intra sgNB Intrafreq Handover Success Rate 5G"
            csvPath="/kpi_results/5g/intra_sgnb_intrafreq.csv"
            yAxisFormat="percent"
            color="#1f77b4"
            simplifyXAxis={true}
          />

          {/* Chart 12: Inter sgNB Intrafreq HO SR */}
          <KPILineChart
            title="12. Inter sgNB Intrafreq Handover Success Rate 5G"
            csvPath="/kpi_results/5g/inter_sgnb_intrafreq.csv"
            yAxisFormat="percent"
            color="#1f77b4"
            simplifyXAxis={true}
          />
        </div>
      </div>
    </>
  );
}
