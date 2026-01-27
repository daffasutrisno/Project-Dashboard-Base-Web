import PageMeta from "../components/common/PageMeta";

export default function ForecastResult() {
  return (
    <>
      <PageMeta
        title="Forecast Result | Monitoring"
        description="Forecast Result page for Monitoring Dashboard"
      />
      <div className="grid grid-cols-12 gap-4 md:gap-6">
        <div className="col-span-12">
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
            Forecast Result
          </h1>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-theme-sm p-6">
            <p className="text-gray-700 dark:text-gray-300">
              Forecast Result content will be displayed here.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

