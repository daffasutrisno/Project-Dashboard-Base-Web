import { useState } from "react";
import ForecastChart from "../../components/forecast/ForecastChart";
import ComparisonTable from "../../components/forecast/ComparisonTable";
import ProvinsiComparisonChart from "../../components/forecast/ProvinsiComparisonChart";
import PageMeta from "../../components/common/PageMeta";

const PROVINSI_OPTIONS = [
  "Bali",
  "Daerah Istimewa Yogyakarta",
  "Jawa Tengah",
  "Jawa Timur",
  "Nusa Tenggara Barat",
  "Nusa Tenggara Timur",
];

export default function Provinsi() {
  const [selectedProvinsi, setSelectedProvinsi] = useState(PROVINSI_OPTIONS[0]);

  return (
    <>
      <PageMeta
        title="Provinsi Forecast | Monitoring"
        description="Provinsi Forecast Result page"
      />
      <div className="grid grid-cols-12 gap-4 md:gap-6">
        <div className="col-span-12">
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
            Provinsi Forecast
          </h1>
          <div className="grid grid-cols-12 gap-4 md:gap-6">
            <div className="col-span-12">
              <ForecastChart
                type="provinsi"
                options={PROVINSI_OPTIONS}
                selectedOption={selectedProvinsi}
                onOptionChange={setSelectedProvinsi}
              />
            </div>
            <div className="col-span-12">
              <ComparisonTable
                type="provinsi"
                selectedOption={selectedProvinsi}
              />
            </div>
            <div className="col-span-12">
              <ProvinsiComparisonChart />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
