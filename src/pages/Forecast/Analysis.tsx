import EcommerceMetrics from "../../components/ecommerce/EcommerceMetrics";
import MonthlySalesChart from "../../components/ecommerce/MonthlySalesChart";
import StatisticsChart from "../../components/ecommerce/StatisticsChart";
import MonthlyTarget from "../../components/ecommerce/MonthlyTarget";
import RecentOrders from "../../components/ecommerce/RecentOrders";
import DemographicCard from "../../components/ecommerce/DemographicCard";
import PageMeta from "../../components/common/PageMeta";

export default function Analysis() {
  return (
    <>
      <PageMeta
        title="Analysis Forecast | Monitoring"
        description="Analysis Forecast Result page"
      />
      <div className="grid grid-cols-12 gap-4 md:gap-6">
        <div className="col-span-12">
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
            Analysis Forecast
          </h1>
          <div className="grid grid-cols-12 gap-4 md:gap-6">
            <div className="col-span-12 space-y-6 xl:col-span-7">
              <EcommerceMetrics />
              <MonthlySalesChart />
            </div>
            <div className="col-span-12 xl:col-span-5">
              <MonthlyTarget />
            </div>
            <div className="col-span-12">
              <StatisticsChart />
            </div>
            <div className="col-span-12 xl:col-span-5">
              <DemographicCard />
            </div>
            <div className="col-span-12 xl:col-span-7">
              <RecentOrders />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}



