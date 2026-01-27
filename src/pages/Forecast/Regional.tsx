import { useState } from "react";
import ForecastChart from "../../components/forecast/ForecastChart";
import ComparisonTable from "../../components/forecast/ComparisonTable";
import RegionalComparisonChart from "../../components/forecast/RegionalComparisonChart";
import PageMeta from "../../components/common/PageMeta";

const REGIONAL_OPTIONS = ["Bali Nusra", "Central Java", "East Java"];

export default function Regional() {
  const [selectedRegional, setSelectedRegional] = useState(REGIONAL_OPTIONS[0]);

  return (
    <>
      <PageMeta
        title="Regional Forecast | Monitoring"
        description="Regional Forecast Result page"
      />
      <div className="grid grid-cols-12 gap-4 md:gap-6">
        <div className="col-span-12">
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
            Regional Forecast
          </h1>
          <div className="grid grid-cols-12 gap-4 md:gap-6">
            <div className="col-span-12">
              <ForecastChart
                type="regional"
                options={REGIONAL_OPTIONS}
                selectedOption={selectedRegional}
                onOptionChange={setSelectedRegional}
              />
            </div>
            <div className="col-span-12">
              <ComparisonTable
                type="regional"
                selectedOption={selectedRegional}
              />
            </div>
            <div className="col-span-12">
              <RegionalComparisonChart />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
