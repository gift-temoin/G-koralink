import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { AuditLog } from '../types';
import { TableSkeleton } from '../components/Skeleton';
import { EmptyState } from '../components/EmptyState';
import { ShieldCheck, UserCheck, Clock, FileText } from 'lucide-react';

export const AdminAuditLogs: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        setLoading(true);
        const res = await api.get('/admin/audit-logs');
        setLogs(res.data);
      } catch (err) {
        console.error('Failed to fetch audit logs:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, []);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-slate-950 p-6 sm:p-8 rounded-3xl border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-amber-400 uppercase tracking-widest flex items-center gap-1.5 mb-1">
            <ShieldCheck className="w-4 h-4" /> System Audit Trail
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Ibyakozwe n'Ubuyobozi (Audit Logs)
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Reba ibikorwa byose n'ibyemezo byafashwe n'ubuyobozi ku urubuga.
          </p>
        </div>
      </div>

      {loading ? (
        <TableSkeleton />
      ) : logs.length === 0 ? (
        <EmptyState title="Nta mateka y'ibyemezo buhari." description="Ibikorwa byose by'ubuyobozi bizabikwa hano." />
      ) : (
        <div className="bg-slate-950 rounded-3xl border border-slate-800 overflow-hidden shadow-xl">
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-900/80 border-b border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="py-4 px-6">Itariki</th>
                  <th className="py-4 px-6">Ubuyobozi (Admin)</th>
                  <th className="py-4 px-6">Igikorwa (Action)</th>
                  <th className="py-4 px-6">Target</th>
                  <th className="py-4 px-6">Ibisobanuro (New Value)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-xs">
                {logs.map((l) => (
                  <tr key={l.id} className="hover:bg-slate-900/50 transition">
                    <td className="py-4 px-6 text-slate-400 font-mono">
                      {new Date(l.timestamp).toLocaleString()}
                    </td>
                    <td className="py-4 px-6 font-bold text-amber-400">
                      {l.admin_name}
                    </td>
                    <td className="py-4 px-6">
                      <span className="px-2.5 py-1 bg-slate-900 border border-slate-800 rounded-full font-mono text-[11px] text-white">
                        {l.action}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-slate-300 font-medium">
                      {l.target_type} (#{l.target_id})
                    </td>
                    <td className="py-4 px-6 text-slate-300 max-w-sm truncate">
                      {l.new_value || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="md:hidden divide-y divide-slate-800">
            {logs.map((l) => (
              <div key={l.id} className="p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-amber-400">{l.admin_name}</span>
                  <span className="text-[10px] text-slate-400">{new Date(l.timestamp).toLocaleDateString()}</span>
                </div>
                <div className="text-xs text-white font-mono">{l.action}</div>
                <p className="text-xs text-slate-400">{l.new_value}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
