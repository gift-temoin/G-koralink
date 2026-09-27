import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { FinancialReport } from '../types';
import { TableSkeleton } from '../components/Skeleton';
import { BarChart3, Calendar, Layers, ShieldCheck, Printer, Download } from 'lucide-react';

export const AdminRaporo: React.FC = () => {
  const [report, setReport] = useState<FinancialReport | null>(null);
  const [period, setPeriod] = useState<string>('this_month');
  const [loading, setLoading] = useState<boolean>(true);

  const fetchReport = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/reports', { params: { period } });
      setReport(res.data);
    } catch (err) {
      console.error('Failed to fetch financial report:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [period]);

  const formatFrw = (val: number) => `${val.toLocaleString()} Frw`;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-8 animate-fade-in print:p-0">
      {/* Header & Filter Controls */}
      <div className="bg-slate-950 p-6 sm:p-8 rounded-3xl border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-amber-400 uppercase tracking-widest flex items-center gap-1.5 mb-1">
            <BarChart3 className="w-4 h-4" /> Financial Auditing & Reporting
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Raporo y'Umutungo n'Imari
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Suma n'ikora ibarura ry'ingano y'amafaranga yose yakoreshejwe ku urubuga.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Period Selector */}
          <div className="flex items-center bg-slate-900 p-1 rounded-2xl border border-slate-800 flex-1 md:flex-initial">
            <button
              onClick={() => setPeriod('today')}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition ${
                period === 'today' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'
              }`}
            >
              Umunsi
            </button>
            <button
              onClick={() => setPeriod('this_week')}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition ${
                period === 'this_week' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'
              }`}
            >
              Icyumweru
            </button>
            <button
              onClick={() => setPeriod('this_month')}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition ${
                period === 'this_month' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'
              }`}
            >
              Ukwezi
            </button>
            <button
              onClick={() => setPeriod('all')}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition ${
                period === 'all' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'
              }`}
            >
              Byose
            </button>
          </div>

          <button
            onClick={handlePrint}
            className="px-4 py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-2xl border border-slate-700 transition flex items-center gap-2 text-xs"
          >
            <Printer className="w-4 h-4 text-amber-400" /> Print Raporo
          </button>
        </div>
      </div>

      {loading ? (
        <TableSkeleton />
      ) : (
        <div className="space-y-6">
          {/* Overall Net Position Card */}
          <div className="rwanda-gradient p-8 rounded-3xl text-white shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <span className="text-xs font-bold text-amber-300 uppercase tracking-widest block mb-1">
                KIGIGA CY'URATONDA (NET FUND BALANCE)
              </span>
              <div className="text-3xl sm:text-5xl font-black text-white tracking-tight">
                {formatFrw(report?.net_fund_balance || 0)}
              </div>
              <p className="text-xs text-slate-200 mt-2">
                (Kwizigama byemejwe + Ubwishyu bw'inguzanyo) MINUS Inguzanyo zose zatanzwe
              </p>
            </div>
            <div className="p-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 text-right">
              <span className="block text-[11px] text-slate-200 uppercase font-bold">Total Ledger Transactions</span>
              <span className="text-2xl font-black text-amber-300 font-mono">{report?.transactions_count || 0}</span>
            </div>
          </div>

          {/* Breakdown Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Box 1: Approved Savings */}
            <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800 space-y-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Kwizigama Byemejwe</span>
              <div className="text-2xl font-black text-emerald-400">{formatFrw(report?.total_savings || 0)}</div>
              <p className="text-xs text-slate-500">Total approved user savings</p>
            </div>

            {/* Box 2: Pending Savings */}
            <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800 space-y-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Kwizigama Bitegereje</span>
              <div className="text-2xl font-black text-amber-400">{formatFrw(report?.pending_savings || 0)}</div>
              <p className="text-xs text-slate-500">Unconfirmed deposits in pipeline</p>
            </div>

            {/* Box 3: Approved Loans */}
            <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800 space-y-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Inguzanyo Zatanzwe</span>
              <div className="text-2xl font-black text-sky-400">{formatFrw(report?.approved_loans || 0)}</div>
              <p className="text-xs text-slate-500">Approved loan disbursements</p>
            </div>

            {/* Box 4: Pending Loans */}
            <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800 space-y-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Inguzanyo Zitegereje</span>
              <div className="text-2xl font-black text-purple-400">{formatFrw(report?.pending_loans || 0)}</div>
              <p className="text-xs text-slate-500">Requested loans awaiting review</p>
            </div>

            {/* Box 5: Loan Repayments */}
            <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800 space-y-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Inguzanyo Zasubijwe</span>
              <div className="text-2xl font-black text-teal-400">{formatFrw(report?.loan_repayments || 0)}</div>
              <p className="text-xs text-slate-500">Approved repayments received</p>
            </div>

            {/* Box 6: Outstanding Loans */}
            <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800 space-y-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Inguzanyo Zitari Zishyurwa</span>
              <div className="text-2xl font-black text-rose-400">{formatFrw(report?.outstanding_loans || 0)}</div>
              <p className="text-xs text-slate-500">Current total unpaid loan balance</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
