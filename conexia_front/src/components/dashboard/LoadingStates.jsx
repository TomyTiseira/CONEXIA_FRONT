'use client';
import { motion } from 'framer-motion';

/**
 * Skeleton loader para KPI Card
 */
export const KPICardSkeleton = () => {
  return (
    <div className="relative overflow-hidden rounded-xl border-2 border-gray-200 bg-white shadow-lg p-6">
      <div className="animate-pulse">
        {/* Icon placeholder */}
        <div className="w-12 h-12 bg-gray-200 rounded-lg mb-4" />
        
        {/* Value placeholder */}
        <div className="h-10 bg-gray-200 rounded w-24 mb-2" />
        
        {/* Title placeholder */}
        <div className="h-4 bg-gray-200 rounded w-32 mb-1" />
        
        {/* Subtitle placeholder */}
        <div className="h-3 bg-gray-200 rounded w-20" />
      </div>
    </div>
  );
};

/**
 * Skeleton loader para gráficos
 */
export const ChartSkeleton = ({ height = '300px' }) => {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-gray-200">
      <div className="animate-pulse">
        {/* Title */}
        <div className="h-6 bg-gray-200 rounded w-48 mb-6" />
        
        {/* Chart area */}
        <div 
          className="bg-gray-100 rounded-lg flex items-center justify-center"
          style={{ height }}
        >
          <div className="space-y-4 w-full px-8">
            <div className="h-4 bg-gray-200 rounded w-full" />
            <div className="h-4 bg-gray-200 rounded w-5/6" />
            <div className="h-4 bg-gray-200 rounded w-4/6" />
            <div className="h-4 bg-gray-200 rounded w-3/6" />
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Skeleton completo del dashboard
 */
export const DashboardSkeleton = ({ cards = 4 }) => {
  return (
    <div className="space-y-6">
      {/* Grid de KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: cards }).map((_, i) => (
          <KPICardSkeleton key={i} />
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartSkeleton />
        <ChartSkeleton />
      </div>

      <div className="grid grid-cols-1 gap-6">
        <ChartSkeleton height="400px" />
      </div>
    </div>
  );
};
