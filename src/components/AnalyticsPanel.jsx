import React from 'react';
import { Activity, ShieldAlert, CheckCircle, BarChart2 } from 'lucide-react';

export default function AnalyticsPanel({ treatments = [] }) {
  // 1. Calculate Summary Metrics
  const totalTreatments = treatments.length;
  
  const activeHolds = treatments.filter(t => {
    // If your data uses 'withdrawalDays' or pre-calculated countdowns, check if it's active
    // Adjusting based on standard schema properties
    return t.withdrawal_days > 0 || t.status === 'MRL HOLD';
  }).length;

  const clearedCount = totalTreatments - activeHolds;

  // 2. Calculate Drug Utilization Percentages
  const drugCounts = treatments.reduce((acc, curr) => {
    const name = curr.drug_name || 'Unknown';
    acc[name] = (acc[name] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="space-y-6 mb-8">
      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1: Total Logs */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex items-center justify-between shadow-sm">
          <div>
            <p className="text-slate-400 text-sm font-medium">Total Ledger Records</p>
            <h3 className="text-2xl font-bold text-white mt-1">{totalTreatments}</h3>
          </div>
          <div className="bg-blue-500/10 p-3 rounded-lg text-blue-400">
            <Activity size={22} />
          </div>
        </div>

        {/* Card 2: Active Holds */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex items-center justify-between shadow-sm">
          <div>
            <p className="text-slate-400 text-sm font-medium">Active MRL Holds</p>
            <h3 className="text-2xl font-bold text-red-400 mt-1">{activeHolds}</h3>
          </div>
          <div className="bg-red-500/10 p-3 rounded-lg text-red-400">
            <ShieldAlert size={22} />
          </div>
        </div>

        {/* Card 3: Cleared Market Stock */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex items-center justify-between shadow-sm">
          <div>
            <p className="text-slate-400 text-sm font-medium">Cleared Stock</p>
            <h3 className="text-2xl font-bold text-emerald-400 mt-1">{clearedCount}</h3>
          </div>
          <div className="bg-emerald-500/10 p-3 rounded-lg text-emerald-400">
            <CheckCircle size={22} />
          </div>
        </div>
      </div>

      {/* Mini Progress Chart: Drug Utilization */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
        <div className="flex items-center gap-2 mb-4 text-slate-200 font-semibold">
          <BarChart2 size={18} className="text-blue-400" />
          <h4>Anticrobial Distribution Summary</h4>
        </div>
        
        {totalTreatments === 0 ? (
          <p className="text-slate-500 text-sm">No treatment data available to map breakdown.</p>
        ) : (
          <div className="space-y-3">
            {Object.entries(drugCounts).map(([drugName, count]) => {
              const percentage = Math.round((count / totalTreatments) * 100);
              return (
                <div key={drugName} className="space-y-1">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-slate-300">{drugName}</span>
                    <span className="text-slate-400">{count} logs ({percentage}%)</span>
                  </div>
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-indigo-500 h-full transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}