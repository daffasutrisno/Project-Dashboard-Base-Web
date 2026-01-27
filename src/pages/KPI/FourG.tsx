import PageMeta from "../../components/common/PageMeta";

export default function FourG() {
  return (
    <>
      <PageMeta
        title="4G KPI Monitoring | Monitoring"
        description="4G KPI Monitoring page"
      />
      <div className="grid grid-cols-12 gap-4 md:gap-6">
        <div className="col-span-12">
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
            4G KPI Monitoring
          </h1>
          <div className="rounded-2xl border border-gray-200 bg-white px-5 pb-5 pt-5 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6 sm:pt-6">
            <p className="text-gray-600 dark:text-gray-400">
              4G KPI Monitoring content will be added here.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
