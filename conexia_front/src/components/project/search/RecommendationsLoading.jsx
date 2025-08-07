'use client';

export default function RecommendationsLoading() {
  return (
    <div className="w-full">
      {/* Título del carrusel skeleton */}
      <div className="flex items-center justify-between mb-6">
        <div className="h-8 bg-gray-200 rounded w-64 animate-pulse"></div>
        <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
      </div>

      {/* Carrusel Desktop Skeleton */}
      <div className="hidden md:block">
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 items-stretch w-full">
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className="bg-white rounded-2xl shadow-md p-3 sm:p-4 flex flex-col h-full animate-pulse"
            >
              {/* Imagen skeleton */}
              <div className="flex flex-col xs:flex-row items-start gap-2 xs:gap-3 mb-3 w-full">
                <div className="relative w-full flex justify-center items-center">
                  <div className="w-32 h-32 sm:w-36 sm:h-36 bg-gray-200 rounded-xl mx-auto"></div>
                </div>
                <div className="flex flex-col flex-1 justify-between w-full min-w-0">
                  <div className="h-12 mb-2 flex items-start justify-center">
                    <div className="h-6 bg-gray-200 rounded w-full"></div>
                  </div>
                </div>
              </div>

              {/* Owner skeleton */}
              <div className="flex items-center gap-2 mb-3 min-w-0 px-2">
                <div className="w-7 h-7 bg-gray-200 rounded-full"></div>
                <div className="h-4 bg-gray-200 rounded flex-1"></div>
              </div>

              {/* Badges skeleton */}
              <div className="flex flex-col gap-1 mb-4 w-full px-2">
                <div className="flex gap-1 w-full">
                  <div className="h-6 bg-gray-200 rounded flex-1"></div>
                  <div className="h-6 bg-gray-200 rounded flex-1"></div>
                </div>
                <div className="h-6 bg-gray-200 rounded w-full"></div>
              </div>

              {/* Button skeleton */}
              <div className="w-full mt-auto px-2">
                <div className="h-10 bg-gray-200 rounded-md w-full"></div>
              </div>
            </div>
          ))}
        </div>

        {/* Navigation skeleton */}
        <div className="flex items-center justify-center gap-4 mt-6">
          <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
          <div className="flex gap-2">
            {[1, 2, 3, 4].map((dot) => (
              <div key={dot} className="w-3 h-3 bg-gray-200 rounded-full"></div>
            ))}
          </div>
          <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
        </div>
      </div>

      {/* Carrusel Mobile Skeleton */}
      <div className="block md:hidden">
        <div className="w-full">
          <div className="bg-white rounded-2xl shadow-md p-3 sm:p-4 flex flex-col h-full animate-pulse">
            {/* Imagen skeleton */}
            <div className="flex flex-col items-start gap-2 mb-3 w-full">
              <div className="relative w-full flex justify-center items-center">
                <div className="w-32 h-32 bg-gray-200 rounded-xl mx-auto"></div>
              </div>
              <div className="flex flex-col flex-1 justify-between w-full min-w-0">
                <div className="h-12 mb-2 flex items-start justify-center">
                  <div className="h-6 bg-gray-200 rounded w-full"></div>
                </div>
              </div>
            </div>

            {/* Owner skeleton */}
            <div className="flex items-center gap-2 mb-3 min-w-0 px-2">
              <div className="w-7 h-7 bg-gray-200 rounded-full"></div>
              <div className="h-4 bg-gray-200 rounded flex-1"></div>
            </div>

            {/* Badges skeleton */}
            <div className="flex flex-col gap-1 mb-4 w-full px-2">
              <div className="flex gap-1 w-full">
                <div className="h-6 bg-gray-200 rounded flex-1"></div>
                <div className="h-6 bg-gray-200 rounded flex-1"></div>
              </div>
              <div className="h-6 bg-gray-200 rounded w-full"></div>
            </div>

            {/* Button skeleton */}
            <div className="w-full mt-auto px-2">
              <div className="h-10 bg-gray-200 rounded-md w-full"></div>
            </div>
          </div>
        </div>

        {/* Navigation skeleton mobile */}
        <div className="flex items-center justify-center gap-4 mt-6">
          <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
          <div className="h-4 bg-gray-200 rounded w-16"></div>
          <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
        </div>
      </div>
    </div>
  );
}
