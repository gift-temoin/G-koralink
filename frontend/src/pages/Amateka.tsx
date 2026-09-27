import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { SavingsTransaction, LoanOut, LoanRepayment } from '../types';
import { EmptyState } from '../components/EmptyState';
import { TableSkeleton } from '../components/Skeleton';
import { History, Wallet, HandCoins, CheckCircle2, Clock, AlertCircle } from 'lucide-react';

export const Amateka: React.FC = () => {
  const [savings, setSavings] = useState<SavingsTransaction[]>([]);
  const [loans, setLoans] = useState<LoanOut[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'savings' | 'repayments'>('savings');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [savRes, loanRes] = await Promise.all([
          api.get('/savings/my'),
          api.get('/loans/my'),
        ]);
        setSavings(savRes.data);
        setLoans(loanRes.data);
      } catch (err) {
        console.error('Error fetching history:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const formatFrw = (val: number) => `${val.toLocaleString()} Frw`;

  // Flatten repayments from loans
  const allRepayments = loans.flatMap((l) =>
    l.repayments.map((r: LoanRepayment) => ({
      ...r,
      loan_reason: l.reason,
    }))
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-100 rounded-full text-xs font-bold text-slate-700 mb-2">
            <History className="w-3.5 h-3.5" /> Amateka y'Ibyakozwe
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Amateka yo Kwizigama no Kwishyura
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Reba urutonde rw'amafaranga yose wazigamye n'ayo wishyuye ku nguzanyo.
          </p>
        </div>

        {/* Tab Selector */}
        <div className="flex items-center bg-slate-100 p-1 rounded-2xl w-full sm:w-auto">
          <button
            onClick={() => setActiveTab('savings')}
            className={`flex-1 sm:flex-initial px-4 py-2 rounded-xl text-xs font-bold transition ${
              activeTab === 'savings'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Kwizigama ({savings.length})
          </button>
          <button
            onClick={() => setActiveTab('repayments')}
            className={`flex-1 sm:flex-initial px-4 py-2 rounded-xl text-xs font-bold transition ${
              activeTab === 'repayments'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Kwishyura Umwenda ({allRepayments.length})
          </button>
        </div>
      </div>

      {loading ? (
        <TableSkeleton />
      ) : activeTab === 'savings' ? (
        savings.length === 0 ? (
          <EmptyState title="Nta mafaranga urigama kugeza ubu." description="Kanda kuri Kwizigama mu menu yo hasi ubone ibibina." />
        ) : (
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    <th className="py-4 px-6">Itariki</th>
                    <th className="py-4 px-6">Ikibina</th>
                    <th className="py-4 px-6">Amafaranga</th>
                    <th className="py-4 px-6">Uburyo & Reference</th>
                    <th className="py-4 px-6">Imiterere</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {savings.map((s) => (
                    <tr key={s.id} className="hover:bg-slate-50/60 transition">
                      <td className="py-4 px-6 text-slate-500 font-medium">
                        {new Date(s.created_at).toLocaleDateString()}
                      </td>
                      <td className="py-4 px-6 font-bold text-slate-900">
                        {s.group_name}
                      </td>
                      <td className="py-4 px-6 font-black text-slate-900">
                        {formatFrw(s.amount)}
                      </td>
                      <td className="py-4 px-6 text-slate-600">
                        <span className="font-semibold block">{s.payment_method}</span>
                        <span className="font-mono text-[11px] text-slate-400">{s.payment_reference}</span>
                      </td>
                      <td className="py-4 px-6">
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold ${
                            s.status === 'Byemejwe'
                              ? 'bg-emerald-100 text-emerald-800'
                              : s.status === 'Byanzwe'
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {s.status === 'Byemejwe' ? <CheckCircle2 className="w-3.5 h-3.5" /> :
                           s.status === 'Byanzwe' ? <AlertCircle className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
                          {s.status}
                        </span>
                        {s.rejection_reason && (
                          <p className="text-[10px] text-rose-500 mt-1 font-medium">{s.rejection_reason}</p>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card List View */}
            <div className="md:hidden divide-y divide-slate-100">
              {savings.map((s) => (
                <div key={s.id} className="p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-slate-900">{s.group_name}</span>
                    <span className="text-[10px] text-slate-400">{new Date(s.created_at).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-base font-black text-slate-900">{formatFrw(s.amount)}</span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        s.status === 'Byemejwe'
                          ? 'bg-emerald-100 text-emerald-800'
                          : s.status === 'Byanzwe'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {s.status}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 font-mono">Ref: {s.payment_reference}</div>
                  {s.rejection_reason && (
                    <p className="text-[10px] text-rose-500 font-medium">Impamvu: {s.rejection_reason}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )
      ) : (
        allRepayments.length === 0 ? (
          <EmptyState title="Nta bwishyu bw'inguzanyo buhari." description="Ntiwigera utanga ubwishyu bwigize ku nguzanyo." />
        ) : (
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    <th className="py-4 px-6">Itariki</th>
                    <th className="py-4 px-6">Impamvu y'Inguzanyo</th>
                    <th className="py-4 px-6">Amafaranga Wishyuye</th>
                    <th className="py-4 px-6">Reference</th>
                    <th className="py-4 px-6">Imiterere</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {allRepayments.map((r) => (
                    <tr key={r.id} className="hover:bg-slate-50/60 transition">
                      <td className="py-4 px-6 text-slate-500 font-medium">
                        {new Date(r.created_at).toLocaleDateString()}
                      </td>
                      <td className="py-4 px-6 font-bold text-slate-900">
                        {r.loan_reason}
                      </td>
                      <td className="py-4 px-6 font-black text-slate-900">
                        {formatFrw(r.amount)}
                      </td>
                      <td className="py-4 px-6 font-mono text-[11px] text-slate-500">
                        {r.payment_reference}
                      </td>
                      <td className="py-4 px-6">
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold ${
                            r.status === 'Byemejwe'
                              ? 'bg-emerald-100 text-emerald-800'
                              : r.status === 'Byanzwe'
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {r.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="md:hidden divide-y divide-slate-100">
              {allRepayments.map((r) => (
                <div key={r.id} className="p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-slate-900">{r.loan_reason}</span>
                    <span className="text-[10px] text-slate-400">{new Date(r.created_at).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-base font-black text-slate-900">{formatFrw(r.amount)}</span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        r.status === 'Byemejwe'
                          ? 'bg-emerald-100 text-emerald-800'
                          : r.status === 'Byanzwe'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {r.status}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 font-mono">Ref: {r.payment_reference}</div>
                </div>
              ))}
            </div>
          </div>
        )
      )}
    </div>
  );
};
