import React from 'react';

export const LoadingSkeleton: React.FC = () => {
  return (
    <div className="space-y-6 animate-pulse">
      
      {/* Banner Skeleton */}
      <div className="bg-white border border-slate-200 rounded-xl p-8 h-40 flex items-center space-x-6 shadow-sm">
        <div className="w-24 h-24 rounded-xl bg-slate-100 shrink-0" />
        <div className="space-y-3 flex-1">
          <div className="h-6 bg-slate-100 rounded w-1/3" />
          <div className="h-4 bg-slate-100 rounded w-1/4" />
          <div className="h-4 bg-slate-100 rounded w-1/2" />
        </div>
      </div>

      {/* Cards Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white border border-slate-200 rounded-xl p-6 h-32 space-y-3 shadow-sm">
            <div className="h-4 bg-slate-100 rounded w-1/2" />
            <div className="h-8 bg-slate-100 rounded w-3/4" />
          </div>
        ))}
      </div>

      {/* Table Skeleton */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4 shadow-sm">
        <div className="h-6 bg-slate-100 rounded w-1/4" />
        <div className="space-y-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-10 bg-slate-50 rounded border border-slate-200" />
          ))}
        </div>
      </div>

    </div>
  );
};
