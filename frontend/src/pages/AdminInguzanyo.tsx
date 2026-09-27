import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { LoanOut, LoanRepayment } from '../types';
import { Toast, ToastType } from '../components/Toast';
import { TableSkeleton } from '../components/Skeleton';
import { EmptyState } from '../components/EmptyState';
import { Coins, Check, Clock, AlertCircle, Phone, CheckCircle2 } from 'lucide-react';

export const AdminInguzanyo: React.FC = () => {
  const [loans, setLoans] = useState<LoanOut[]>([]);
  const [loading, setLoading] = useState(true);

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<ToastType>('info');

  const fetchLoans = async () => {
    try {
      setLoading(true);
      const res = await api.get('/loans/admin/list');
      setLoans(res.data);
    } catch (err: any) {
      showToast(err.message || "Habaye ikibazo mu gushaka inguzanyo.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLoans();
  }, []);

  const showToast = (msg: string, type: ToastType) => {
    setToastMessage(msg);
    setToastType(type);
  };

  const handleApproveRepayment = async (repaymentId: number) => {
    try {
      const res = await api.post(`/loans/admin/repayment/${repaymentId}/approve`);
      showToast(res.data.message, "success");
      fetchLoans();
    } catch (err: any) {
      showToast(err.message || "Habaye ikibazo mu kwemeza ubwishyu.", "error");
    }
  };

  const formatFrw = (val: number) => `${val.toLocaleString()} Frw`;

  // Filter approved/active/completed loans
  const activeLoans = loans.filter((l) => ['Yemejwe', 'Iri kwishyura', 'Yarangiye'].includes(l.status));

  // Extract all pending repayments from active loans
  const pendingRepayments = activeLoans.flatMap((l) =>
    l.repayments
      .filter((r: LoanRepayment) => r.status === 'Bitegereje kwemezwa')
      .map((r: LoanRepayment) => ({ ...r, loan_reason: l.reason, loan_user: l.user_name }))
  );

  return (
    <div className="space-y-8 animate-fade-in">
      <Toast message={toastMessage} type={toastType} onClose={() => setToastMessage(null)} />

      <div className="bg-slate-950 p-6 sm:p-8 rounded-3xl border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-amber-400 uppercase tracking-widest flex items-center gap-1.5 mb-1">
            <Coins className="w-4 h-4" /> Active Loans Ledger
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Imiyingo y'Inguzanyo Zose
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Cunga inguzanyo zose zatanzwe n'ubwishyu buzamuka kuri konti.
          </p>
        </div>
      </div>

      {/* Section 1: Pending Repayments to Verify */}
      {pendingRepayments.length > 0 && (
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-3xl p-6 space-y-4">
          <h3 className="font-extrabold text-amber-400 text-base flex items-center gap-2">
            <Clock className="w-5 h-5" /> Ubwishyu Bw'inguzanyo Bitegereje Kwemezwa ({pendingRepayments.length})
          </h3>
          <div className="divide-y divide-slate-800">
            {pendingRepayments.map((r) => (
              <div key={r.id} className="py-3 flex items-center justify-between">
                <div>
                  <span className="font-bold text-white block">{r.loan_user}</span>
                  <span className="text-xs text-slate-400 font-mono">Ref: {r.payment_reference}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-emerald-400 font-black text-base">{formatFrw(r.amount)}</span>
                  <button
                    onClick={() => handleApproveRepayment(r.id)}
                    className="px-4 py-2 bg-emerald-500 text-slate-950 font-black rounded-xl text-xs hover:bg-emerald-400 transition"
                  >
                    Emeza Ubwishyu
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Section 2: Active Loans List */}
      {loading ? (
        <TableSkeleton />
      ) : activeLoans.length === 0 ? (
        <EmptyState title="Nta nguzanyo ziri kwishyurwa." description="Nta nguzanyo n'imwe ikiri mu birarane." />
      ) : (
        <div className="bg-slate-950 rounded-3xl border border-slate-800 overflow-hidden shadow-xl">
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-900/80 border-b border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="py-4 px-6">Umukoresha</th>
                  <th className="py-4 px-6">Impamvu</th>
                  <th className="py-4 px-6">Inguzanyo</th>
                  <th className="py-4 px-6">Bwishyuwe</th>
                  <th className="py-4 px-6">Nsigaje</th>
                  <th className="py-4 px-6">Imiterere</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-xs">
                {activeLoans.map((l) => (
                  <tr key={l.id} className="hover:bg-slate-900/50 transition">
                    <td className="py-4 px-6">
                      <span className="font-bold text-white block">{l.user_name}</span>
                      <span className="text-[11px] text-amber-400 font-mono">{l.user_phone}</span>
                    </td>
                    <td className="py-4 px-6 text-slate-300">
                      {l.reason}
                    </td>
                    <td className="py-4 px-6 font-black text-white text-sm">
                      {formatFrw(l.approved_amount || l.requested_amount)}
                    </td>
                    <td className="py-4 px-6 text-emerald-400 font-bold">
                      {formatFrw(l.total_repaid)}
                    </td>
                    <td className="py-4 px-6 text-rose-400 font-black text-sm">
                      {formatFrw(l.remaining_balance)}
                    </td>
                    <td className="py-4 px-6">
                      <span
                        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-bold ${
                          l.status === 'Yarangiye'
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : 'bg-sky-500/20 text-sky-400'
                        }`}
                      >
                        {l.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="md:hidden divide-y divide-slate-800">
            {activeLoans.map((l) => (
              <div key={l.id} className="p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-white">{l.user_name}</span>
                  <span className="text-xs text-rose-400 font-bold">Nsigaje: {formatFrw(l.remaining_balance)}</span>
                </div>
                <div className="text-xs text-slate-400 flex items-center justify-between">
                  <span>Yatanzwe: {formatFrw(l.approved_amount || l.requested_amount)}</span>
                  <span>Wishyuye: {formatFrw(l.total_repaid)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
