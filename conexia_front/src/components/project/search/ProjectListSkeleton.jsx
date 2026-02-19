"use client";

/**
 * Skeleton loading state for ProjectList grid.
 * Shows 6 placeholder cards that match the project card layout.
 */
export default function ProjectListSkeleton({ count = 6 }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="bg-white rounded-2xl shadow-md p-2.5 sm:p-3 flex flex-col h-full items-stretch w-full animate-pulse"
        >
          {/* Spacing top */}
          <div style={{ minHeight: "8px" }} />

          {/* Image skeleton */}
          <div className="w-full aspect-[16/9] bg-gray-200 rounded-xl mb-2" />

          {/* Title skeleton */}
          <div className="px-1.5 mb-2">
            <div className="h-5 bg-gray-200 rounded w-3/4 mb-1" />
            <div className="h-4 bg-gray-200 rounded w-1/2" />
          </div>

          {/* Owner skeleton */}
          <div className="flex items-center gap-2 px-1.5 mb-3">
            <div className="w-7 h-7 bg-gray-200 rounded-full flex-shrink-0" />
            <div className="h-4 bg-gray-200 rounded flex-1" />
          </div>

          {/* Badges skeleton */}
          <div className="flex flex-wrap gap-1 px-1.5 mb-3">
            <div className="h-6 bg-gray-200 rounded w-20" />
            <div className="h-6 bg-gray-200 rounded w-24" />
            <div className="h-6 bg-gray-200 rounded w-16" />
          </div>

          {/* Button skeleton */}
          <div className="mt-auto px-1.5">
            <div className="h-10 bg-gray-200 rounded-md w-full" />
          </div>
        </div>
      ))}
    </div>
  );
}
