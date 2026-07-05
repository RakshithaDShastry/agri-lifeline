import React, { useEffect, useState } from 'react';
import { ShieldCheck, ShieldAlert, Clock, CheckCircle } from 'lucide-react';
import { calculateBlockHash } from '../utils/cryptoChain';

export default function DashboardTable({ treatments, loading }) {
  const [corruptedRows, setCorruptedRows] = useState({});

  // Real-time verification loop to check if database logs have been tampered with
  useEffect(() => {
    if (!treatments || treatments.length === 0) return;

    const newCorruptedRows = {};
    
    // Scan every entry in reverse chronological order to verify sequential hashes
    treatments.forEach((record) => {
      const recalculated = calculateBlockHash(
        record.animal_id,
        record.drug_name,
        record.dosage,
        record.prev_hash
      );

      // If the recalculated hash doesn't match what is in the DB row, the data was tampered with!
      if (recalculated !== record.block_hash) {
        newCorruptedRows[record.id] = true;
      }
    });

    setCorruptedRows(newCorruptedRows);
  }, [treatments]);

  // Logic to calculate active MRL Alerts based on administration timeframes
  const getComplianceStatus = (administeredAt, withdrawalDays) => {
    const adminDate = new Date(administeredAt);
    const safeReleaseDate = new Date(adminDate.getTime() + withdrawalDays * 24 * 60 * 60 * 1000);
    const currentDate = new Date();

    if (currentDate < safeReleaseDate) {
      const daysRemaining = Math.ceil((safeReleaseDate - currentDate) / (1000 * 60 * 60 * 24));
      return {
        label: `MRL HOLD (${daysRemaining}d remaining)`,
        className: 'bg-red-500/10 text-red-400 border border-red-500/20',
        icon: <Clock className="w-3.5 h-3.5" />
      };
    }

    return {
      label: 'CLEARED FOR MARKET',
      className: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
      icon: <CheckCircle className="w-3.5 h-3.5" />
    };
  };

  if (loading) {
    return (
      <div className="w-full max-w-4xl mx-auto p-8 text-center text-slate-400 text-sm animate-pulse">
        Fetching real-time livestock records from the PostgreSQL ledger...
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      <div className="bg-slate-800 border border-slate-700 rounded-xl shadow-lg overflow-hidden">
        <div className="p-5 border-b border-slate-700 bg-slate-800/50 flex justify-between items-center">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-300">
            Active Livestock MRL Audit Log
          </h3>
          <span className="text-xs text-slate-400">
            Total Logs Secured: <strong className="text-slate-200">{treatments.length}</strong>
          </span>
        </div>

        {treatments.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-sm">
            No active compliance logs recorded. Speak a treatment to initialize the chain.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-700 bg-slate-900/40 text-slate-400 text-xs font-semibold uppercase">
                  <th className="p-4">Batch ID</th>
                  <th className="p-4">Treatment Spec</th>
                  <th className="p-4">Regulatory Status</th>
                  <th className="p-4">Data Integrity Seal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/60 bg-slate-800/20">
                {treatments.map((log) => {
                  const status = getComplianceStatus(log.administered_at, log.withdrawal_days_meat);
                  const isTampered = corruptedRows[log.id];

                  return (
                    <tr key={log.id} className="hover:bg-slate-700/30 transition-colors">
                      <td className="p-4 font-bold text-slate-200">
                        {log.animals?.batch_tag || 'Batch'}
                      </td>
                      <td className="p-4">
                        <div className="text-slate-100 font-medium">{log.drug_name}</div>
                        <div className="text-xs text-slate-400">{log.dosage} administered</div>
                      </td>
                      <td className="p-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium ${status.className}`}>
                          {status.icon}
                          {status.label}
                        </span>
                      </td>
                      <td className="p-4">
                        {isTampered ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold bg-red-600/20 text-red-400 border border-red-600/40">
                            <ShieldAlert className="w-3.5 h-3.5" /> DAMAGED BLOCK
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs text-emerald-400 font-mono tracking-tight bg-slate-900/60 px-2 py-1 rounded border border-slate-700">
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                            {log.block_hash.substring(0, 8)}...
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}