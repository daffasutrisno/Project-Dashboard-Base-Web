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
            csvPath="/kpi_data/data_5g.csv"
            parameterColumn="avail_auto_5g"
            transformPercent={true}
            showAllDays={true}
            fixedYRange={[96, 105]}
            yAxisFormat="percent"
            color="#1f77b4"
          />

          {/* Chart 2: Accessibility */}
          <KPILineChart
            title="2. Accessibility 5G"
            csvPath="/kpi_data/data_5g.csv"
            parameterColumn="da_5g"
            transformPercent={true}
            intervalDays={2}
            yAxisFormat="percent"
            color="#1f77b4"
          />

          {/* Chart 3: Call Drop Rate */}
          <KPIAreaChart
            title="3. Call Drop Rate 5G"
            csvPath="/kpi_data/data_5g.csv"
            parameterColumn="g5_cdr"
            intervalDays={2}
            filterPositive={false}
            yAxisFormat="number"
            color="#1f77b4"
          />

          {/* Chart 4: Sgnb Addition Success Rate */}
          <KPIBarChart
            title="4. Sgnb Addition Success Rate 5G"
            csvPath="/kpi_data/data_5g.csv"
            parameterColumn="sgnb_addition_sr"
            transformPercent={true}
            intervalDays={2}
            yAxisFormat="percent"
            color="#1f77b4"
          />

          {/* Chart 5: Total Traffic */}
          <KPIAreaChart
            title="5. Total Traffic 5G"
            csvPath="/kpi_data/data_5g.csv"
            parameterColumn="traffic_5g"
            intervalDays={2}
            yAxisFormat="comma"
            color="#1f77b4"
          />

          {/* Chart 6: EUT vs DL User Throughput */}
          <KPIDualLineChart
            title="6. EUT vs DL User Throughput 5G"
            csvPath="/kpi_data/data_5g.csv"
            line1Parameter="g5_eut_bhv"
            line2Parameter="g5_userdl_thp"
            line1Label="EUT"
            line2Label="DL User Thp"
            showAllDays={true}
            line1Color="#1f77b4"
            line2Color="#ff7f0e"
          />

          {/* Chart 7: User 5G */}
          <KPIBarChart
            title="7. User 5G"
            csvPath="/kpi_data/data_5g.csv"
            parameterColumn="sum_en_dc_user_5g_wd"
            intervalDays={2}
            yAxisFormat="comma"
            color="#1f77b4"
          />

          {/* Chart 8: DL PRB Utilization */}
          <KPIDualAxisChart
            title="8. DL PRB Utilization 5G"
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

          {/* Chart 9: Inter esgNB Handover SR */}
          <KPILineChart
            title="9. Inter esgNB Handover Success Rate 5G"
            csvPath="/kpi_data/data_5g.csv"
            parameterColumn="inter_esgnb"
            transformPercent={true}
            intervalDays={2}
            yAxisFormat="percent"
            color="#1f77b4"
          />

          {/* Chart 10: Intra esgNB Handover SR */}
          <KPILineChart
            title="10. Intra esgNB Handover Success Rate 5G"
            csvPath="/kpi_data/data_5g.csv"
            parameterColumn="intra_esgnb"
            transformPercent={true}
            intervalDays={2}
            yAxisFormat="percent"
            color="#1f77b4"
          />

          {/* Chart 11: Intra sgNB Intrafreq HO SR */}
          <KPILineChart
            title="11. Intra sgNB Intrafreq Handover Success Rate 5G"
            csvPath="/kpi_data/data_5g.csv"
            parameterColumn="intra_sgnb_intrafreq"
            transformPercent={true}
            intervalDays={2}
            yAxisFormat="percent"
            color="#1f77b4"
          />

          {/* Chart 12: Inter sgNB Intrafreq HO SR */}
          <KPILineChart
            title="12. Inter sgNB Intrafreq Handover Success Rate 5G"
            csvPath="/kpi_data/data_5g.csv"
            parameterColumn="inter_sgnb_intrafreq"
            transformPercent={true}
            intervalDays={2}
            yAxisFormat="percent"
            color="#1f77b4"
          />
        </div>
      </div>
    </>
  );
}
