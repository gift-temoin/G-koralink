import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { SavingsTransaction } from '../types';
import { Modal } from '../components/Modal';
import { Toast, ToastType } from '../components/Toast';
import { TableSkeleton } from '../components/Skeleton';
import { EmptyState } from '../components/EmptyState';
import { PiggyBank, Check, X, Clock, AlertCircle, Phone, Calendar } from 'lucide-react';

export const AdminKwizigama: React.FC = () => {
  const [savingsList, setSavingsList] = useState<SavingsTransaction[]>([]);
  const [loading, setLoading] = useState(true);

  const [rejectingSavings, setRejectingSavings] = useState<SavingsTransaction | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [rejectModalOpen, setRejectModalOpen] = useState(false);

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<ToastType>('info');

  const fetchSavings = async () => {
    try {
      setLoading(true);
      const res = await api.get('/savings/admin/list');
      setSavingsList(res.data);
    } catch (err: any) {
      showToast(err.message || "Habaye ikibazo mu gushaka kwizigama.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSavings();
  }, []);

  const showToast = (msg: string, type: ToastType) => {
    setToastMessage(msg);
    setToastType(type);
  };

  const handleApprove = async (id: number) => {
    try {
      const res = await api.post(`/savings/admin/${id}/approve`);
      showToast(res.data.message, "success");
      fetchSavings();
    } catch (err: any) {
      showToast(err.message || "Habaye ikibazo mu kwemeza kwizigama.", "error");
    }
  };

  const handleOpenRejectModal = (savings: SavingsTransaction) => {
    setRejectingSavings(savings);
    setRejectionReason('');
    setRejectModalOpen(true);
  };

  const handleRejectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectingSavings) return;

    try {
      await api.post(`/savings/admin/${rejectingSavings.id}/reject`, {
        status: 'Byanzwe',
        rejection_reason: rejectionReason || "Amafaranga ntabwo yagaragaye kuri konti.",
      });
      showToast("Ubusabe bwo kwizigama bwanzwe.", "success");
      setRejectModalOpen(false);
      fetchSavings();
    } catch (err: any) {
      showToast(err.message || "Habaye ikibazo mu kwanga ubusabe.", "error");
    }
  };

  const formatFrw = (val: number) => `${val.toLocaleString()} Frw`;

  return (
    <div className="space-y-6 animate-fade-in">
      <Toast message={toastMessage} type={toastType} onClose={() => setToastMessage(null)} />

      <div className="bg-slate-950 p-6 sm:p-8 rounded-3xl border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-amber-400 uppercase tracking-widest flex items-center gap-1.5 mb-1">
            <PiggyBank className="w-4 h-4" /> Savings Verification
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Emeza Kwizigama
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Soma ibisobanuro by'ubwishyu bwa MTN MoMo maze wemeze cyangwa wange kwizigama.
          </p>
        </div>
      </div>

      {loading ? (
        <TableSkeleton />
      ) : savingsList.length === 0 ? (
        <EmptyState title="Nta buzi buhari bwo kwizigama." description="Ubusabe bushya bwose bw'abakoresha buzarangirizwa hano." />
      ) : (
        <div className="bg-slate-950 rounded-3xl border border-slate-800 overflow-hidden shadow-xl">
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-900/80 border-b border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="py-4 px-6">Umukoresha</th>
                  <th className="py-4 px-6">Amafaranga</th>
                  <th className="py-4 px-6">Ikibina</th>
                  <th className="py-4 px-6">Reference</th>
                  <th className="py-4 px-6">Itariki</th>
                  <th className="py-4 px-6">Imiterere</th>
                  <th className="py-4 px-6 text-right">Igikorwa</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-xs">
                {savingsList.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-900/50 transition">
                    <td className="py-4 px-6">
                      <span className="font-bold text-white block">{s.user_name}</span>
                      <span className="text-[11px] text-amber-400 font-mono">{s.user_phone}</span>
                    </td>
                    <td className="py-4 px-6 font-black text-emerald-400 text-sm">
                      {formatFrw(s.amount)}
                    </td>
                    <td className="py-4 px-6 text-slate-300 font-medium">
                      {s.group_name}
                    </td>
                    <td className="py-4 px-6 font-mono text-slate-400">
                      {s.payment_reference}
                    </td>
                    <td className="py-4 px-6 text-slate-400">
                      {new Date(s.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-6">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold ${
                          s.status === 'Byemejwe'
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : s.status === 'Byanzwe'
                            ? 'bg-rose-500/20 text-rose-400'
                            : 'bg-amber-500/20 text-amber-400'
                        }`}
                      >
                        {s.status}
                      </span>
                      {s.rejection_reason && (
                        <p className="text-[10px] text-rose-400 mt-1">{s.rejection_reason}</p>
                      )}
                    </td>
                    <td className="py-4 px-6 text-right">
                      {s.status === 'Bitegereje kwemezwa' && (
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleApprove(s.id)}
                            className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl transition flex items-center gap-1 text-xs"
                          >
                            <Check className="w-3.5 h-3.5" /> Emeza
                          </button>
                          <button
                            onClick={() => handleOpenRejectModal(s)}
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

          {/* Mobile View */}
          <div className="md:hidden divide-y divide-slate-800">
            {savingsList.map((s) => (
              <div key={s.id} className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-bold text-sm text-white block">{s.user_name}</span>
                    <span className="text-xs text-amber-400 font-mono">{s.user_phone}</span>
                  </div>
                  <span className="text-base font-black text-emerald-400">{formatFrw(s.amount)}</span>
                </div>
                <div className="text-xs text-slate-400 flex items-center justify-between">
                  <span>Ikibina: {s.group_name}</span>
                  <span className="font-mono">Ref: {s.payment_reference}</span>
                </div>
                {s.status === 'Bitegereje kwemezwa' && (
                  <div className="flex items-center gap-2 pt-2">
                    <button
                      onClick={() => handleApprove(s.id)}
                      className="flex-1 py-2 bg-emerald-500 text-slate-950 font-black rounded-xl text-xs flex items-center justify-center gap-1"
                    >
                      <Check className="w-3.5 h-3.5" /> Emeza
                    </button>
                    <button
                      onClick={() => handleOpenRejectModal(s)}
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

      {/* Rejection Modal */}
      <Modal
        isOpen={rejectModalOpen}
        onClose={() => setRejectModalOpen(false)}
        title="Impamvu yo kwanga kwizigama"
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
              placeholder="Urugero: Amafaranga ntabwo yageze kuri MoMo ENOCK..."
              rows={3}
              required
              className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-rose-500 font-medium"
            />
          </div>
          <button
            type="submit"
            className="w-full py-3.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl transition text-sm"
          >
            Emeza Kwanga Kwizigama
          </button>
        </form>
      </Modal>
    </div>
  );
};
