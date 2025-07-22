
const DashboardLoading = () => {
  return (
    <div className="w-full h-full rounded-tl-3xl rounded-bl-3xl p-8">
      {/* Header Skeleton */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <div className="h-8 w-40 bg-gray-200 rounded-lg animate-pulse mb-2"></div>
          <div className="h-4 w-60 bg-gray-200 rounded animate-pulse"></div>
        </div>
        <div className="h-10 w-10 bg-gray-200 rounded-full animate-pulse"></div>
      </div>

      {/* Stats Cards Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {[1, 2, 3].map((item) => (
          <div
            key={item}
            className="bg-white p-6 rounded-xl shadow-sm border border-gray-100"
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="h-4 w-32 bg-gray-200 rounded animate-pulse mb-3"></div>
                <div className="h-8 w-24 bg-gray-200 rounded-lg animate-pulse"></div>
              </div>
              <div className="h-12 w-12 bg-gray-200 rounded-lg animate-pulse"></div>
            </div>
            <div className="mt-4">
              <div className="h-4 w-full bg-gray-200 rounded animate-pulse"></div>
            </div>
          </div>
        ))}
      </div>

      {/* Upcoming Appointments Skeleton */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8">
        <div className="flex items-center justify-between mb-6">
          <div className="h-6 w-40 bg-gray-200 rounded-lg animate-pulse"></div>
          <div className="h-4 w-20 bg-gray-200 rounded animate-pulse"></div>
        </div>

        <div className="space-y-4">
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className="group relative flex flex-col md:flex-row md:items-center justify-between p-6 rounded-xl border border-gray-200"
            >
              <div className="flex items-start md:items-center space-x-5 w-full md:w-auto">
                <div className="flex flex-col items-center min-w-[60px]">
                  <div className="h-4 w-12 bg-gray-200 rounded animate-pulse mb-1"></div>
                  <div className="h-8 w-8 bg-gray-200 rounded-lg animate-pulse mb-1"></div>
                  <div className="h-3 w-12 bg-gray-200 rounded animate-pulse"></div>
                </div>

                <div className="h-12 w-12 bg-gray-200 rounded-xl animate-pulse"></div>

                <div className="flex-1 min-w-0 space-y-2">
                  <div className="h-5 w-3/4 bg-gray-200 rounded animate-pulse"></div>
                  <div className="flex space-x-4">
                    <div className="h-4 w-20 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between md:justify-end mt-4 md:mt-0 space-x-5">
                <div className="text-right min-w-[130px] space-y-2">
                  <div className="h-4 w-20 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-3 w-16 bg-gray-200 rounded animate-pulse"></div>
                </div>
                <div className="h-10 w-24 bg-gray-200 rounded-lg animate-pulse"></div>
                <div className="h-10 w-10 bg-gray-200 rounded-full animate-pulse"></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Section Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Recent Earnings Skeleton */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="h-6 w-40 bg-gray-200 rounded-lg animate-pulse mb-6"></div>
          <div className="space-y-4">
            {[1, 2, 3].map((item) => (
              <div key={item} className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="h-10 w-10 bg-gray-200 rounded-lg animate-pulse"></div>
                  <div className="space-y-1">
                    <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-3 w-32 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                </div>
                <div className="h-4 w-20 bg-gray-200 rounded animate-pulse"></div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions Skeleton */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="h-6 w-40 bg-gray-200 rounded-lg animate-pulse mb-6"></div>
          <div className="grid grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((item) => (
              <div key={item} className="p-4 rounded-lg border border-gray-200">
                <div className="h-8 w-8 bg-gray-200 rounded-full animate-pulse mx-auto mb-2"></div>
                <div className="h-4 w-16 bg-gray-200 rounded animate-pulse mx-auto"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardLoading;
