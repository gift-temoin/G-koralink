import React from 'react';

export const CardSkeleton: React.FC = () => (
  <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm animate-pulse">
    <div className="flex items-center justify-between mb-4">
      <div className="w-24 h-4 bg-slate-200 rounded"></div>
      <div className="w-10 h-10 bg-slate-200 rounded-xl"></div>
    </div>
    <div className="w-36 h-8 bg-slate-200 rounded mb-2"></div>
    <div className="w-20 h-3 bg-slate-200 rounded"></div>
  </div>
);

export const TableSkeleton: React.FC = () => (
  <div className="bg-white rounded-2xl border border-slate-100 p-4 space-y-4 animate-pulse">
    <div className="h-6 bg-slate-200 rounded w-1/4"></div>
    <div className="space-y-3">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="h-12 bg-slate-100 rounded"></div>
      ))}
    </div>
  </div>
);
