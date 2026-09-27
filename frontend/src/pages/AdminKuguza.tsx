import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { LoanOut } from '../types';
import { Modal } from '../components/Modal';
import { Toast, ToastType } from '../components/Toast';
import { TableSkeleton } from '../components/Skeleton';
import { EmptyState } from '../components/EmptyState';
import { FileText, Check, X, HandCoins, AlertCircle, Phone, Calendar } from 'lucide-react';

export const AdminKuguza: React.FC = () => {
  const [loans, setLoans] = useState<LoanOut[]>([]);
  const [loading, setLoading] = useState(true);

  const [approvingLoan, setApprovingLoan] = useState<LoanOut | null>(null);
  const [approveAmount, setApproveAmount] = useState<number>(50000);
  const [repaymentMonths, setRepaymentMonths] = useState<number>(1);
  const [interestRate, setInterestRate] = useState<number>(0.0);
  const [approveModalOpen, setApproveModalOpen] = useState(false);

  const [rejectingLoan, setRejectingLoan] = useState<LoanOut | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [rejectModalOpen, setRejectModalOpen] = useState(false);

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<ToastType>('info');

  const fetchLoans = async () => {
    try {
      setLoading(true);
      const res = await api.get('/loans/admin/list');
      setLoans(res.data);
    } catch (err: any) {
      showToast(err.message || "Habaye ikibazo mu gushaka ubusabe bw'inguzanyo.", "error");
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

  const handleOpenApproveModal = (loan: LoanOut) => {
    setApprovingLoan(loan);
    setApproveAmount(loan.requested_amount);
    setRepaymentMonths(loan.repayment_months);
    setInterestRate(0.0);
    setApproveModalOpen(true);
  };

  const handleApproveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!approvingLoan) return;

    try {
      await api.post(`/loans/admin/${approvingLoan.id}/approve`, {
        approved_amount: approveAmount,
        repayment_months: repaymentMonths,
        interest_rate: interestRate,
      });
      showToast(`Inguzanyo ya ${approveAmount.toLocaleString()} Frw yemejwe neza!`, "success");
      setApproveModalOpen(false);
      fetchLoans();
    } catch (err: any) {
      showToast(err.message || "Habaye ikibazo mu kwemeza inguzanyo.", "error");
    }
  };

  const handleOpenRejectModal = (loan: LoanOut) => {
    setRejectingLoan(loan);
    setRejectionReason('');
    setRejectModalOpen(true);
  };

  const handleRejectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectingLoan) return;

    try {
      await api.post(`/loans/admin/${rejectingLoan.id}/reject`, {
        rejection_reason: rejectionReason || "Amafaranga yazigamwe ntabwo ahagije gusaba iyi nguzanyo.",
      });
      showToast("Ubusabe bw'inguzanyo bwanzwe.", "success");
      setRejectModalOpen(false);
      fetchLoans();
    } catch (err: any) {
      showToast(err.message || "Habaye ikibazo mu kwanga inguzanyo.", "error");
    }
  };

  const formatFrw = (val: number) => `${val.toLocaleString()} Frw`;

  return (
    <div className="space-y-6 animate-fade-in">
      <Toast message={toastMessage} type={toastType} onClose={() => setToastMessage(null)} />

      <div className="bg-slate-950 p-6 sm:p-8 rounded-3xl border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-amber-400 uppercase tracking-widest flex items-center gap-1.5 mb-1">
            <FileText className="w-4 h-4" /> Loan Applications
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Ubusabe bwo Kuguza
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Suma ubusabe bw'inguzanyo z'abanyamuryango uziyemeze cyangwa uziyange.
          </p>
        </div>
      </div>

      {loading ? (
        <TableSkeleton />
      ) : loans.length === 0 ? (
        <EmptyState title="Nta busabe bw'inguzanyo buhari." description="Ubusabe bushya bwose bw'abakoresha buzarangirizwa hano." />
      ) : (
        <div className="bg-slate-950 rounded-3xl border border-slate-800 overflow-hidden shadow-xl">
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-900/80 border-b border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="py-4 px-6">Umukoresha</th>
                  <th className="py-4 px-6">Nasabye</th>
                  <th className="py-4 px-6">Impamvu</th>
                  <th className="py-4 px-6">Amezi</th>
                  <th className="py-4 px-6">Imiterere</th>
                  <th className="py-4 px-6 text-right">Igikorwa</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-xs">
                {loans.map((l) => (
                  <tr key={l.id} className="hover:bg-slate-900/50 transition">
                    <td className="py-4 px-6">
                      <span className="font-bold text-white block">{l.user_name}</span>
                      <span className="text-[11px] text-amber-400 font-mono">{l.user_phone}</span>
                    </td>
                    <td className="py-4 px-6 font-black text-amber-400 text-sm">
                      {formatFrw(l.requested_amount)}
                    </td>
                    <td className="py-4 px-6 text-slate-300 max-w-xs truncate">
                      {l.reason}
                    </td>
                    <td className="py-4 px-6 text-slate-300 font-bold">
                      Amezi {l.repayment_months}
                    </td>
                    <td className="py-4 px-6">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold ${
                          l.status === 'Yemejwe' || l.status === 'Iri kwishyura'
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : l.status === 'Yanzwe'
                            ? 'bg-rose-500/20 text-rose-400'
                            : 'bg-amber-500/20 text-amber-400'
                        }`}
                      >
                        {l.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      {l.status === 'Bitegereje' && (
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleOpenApproveModal(l)}
                            className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl transition flex items-center gap-1 text-xs"
                          >
                            <Check className="w-3.5 h-3.5" /> Emeza
                          </button>
                          <button
                            onClick={() => handleOpenRejectModal(l)}
                            className="px-3 py-1.5 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 font-bold rounded-xl border border-rose-500/30 transition flex items-center gap-1 text-xs"
                          >
                            <X className="w-3.5 h-3.5" /> Byange
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="md:hidden divide-y divide-slate-800">
            {loans.map((l) => (
              <div key={l.id} className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-bold text-sm text-white block">{l.user_name}</span>
                    <span className="text-xs text-amber-400 font-mono">{l.user_phone}</span>
                  </div>
                  <span className="text-base font-black text-amber-400">{formatFrw(l.requested_amount)}</span>
                </div>
                <p className="text-xs text-slate-300">Impamvu: {l.reason}</p>
                {l.status === 'Bitegereje' && (
                  <div className="flex items-center gap-2 pt-2">
                    <button
                      onClick={() => handleOpenApproveModal(l)}
                      className="flex-1 py-2 bg-emerald-500 text-slate-950 font-black rounded-xl text-xs flex items-center justify-center gap-1"
                    >
                      <Check className="w-3.5 h-3.5" /> Emeza
                    </button>
                    <button
                      onClick={() => handleOpenRejectModal(l)}
                      className="flex-1 py-2 bg-rose-500/20 text-rose-300 font-bold rounded-xl text-xs border border-rose-500/30 flex items-center justify-center gap-1"
                    >
                      <X className="w-3.5 h-3.5" /> Byange
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Approve Modal */}
      <Modal
        isOpen={approveModalOpen}
        onClose={() => setApproveModalOpen(false)}
        title="Emeza Inguzanyo"
        maxWidth="md"
      >
        <form onSubmit={handleApproveSubmit} className="space-y-4 text-slate-900">
          <div>
            <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
              Amafaranga yemejwe (Frw)
            </label>
            <input
              type="number"
              value={approveAmount}
              onChange={(e) => setApproveAmount(Number(e.target.value))}
              required
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-lg"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                Amezi yo kwishyura
              </label>
              <input
                type="number"
                value={repaymentMonths}
                onChange={(e) => setRepaymentMonths(Number(e.target.value))}
                min={1}
                required
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                Inyungu / Fee (%)
              </label>
              <input
                type="number"
                step="0.1"
                value={interestRate}
                onChange={(e) => setInterestRate(Number(e.target.value))}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-2xl shadow-lg shadow-emerald-500/20 transition text-sm"
          >
            Emeza Gutanga Inguzanyo
          </button>
        </form>
      </Modal>

      {/* Reject Modal */}
      <Modal
        isOpen={rejectModalOpen}
        onClose={() => setRejectModalOpen(false)}
        title="Impamvu yo kwanga inguzanyo"
        maxWidth="md"
      >
        <form onSubmit={handleRejectSubmit} className="space-y-4 text-slate-900">
          <div>
            <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
              Impamvu yo kwanga
            </label>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Andika impamvu ubusabe bwanzwe..."
              rows={3}
              required
              className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-rose-500 font-medium"
            />
          </div>
          <button
            type="submit"
            className="w-full py-3.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl transition text-sm"
          >
            Emeza Kwanga Ubusabe
          </button>
        </form>
      </Modal>
    </div>
  );
};
