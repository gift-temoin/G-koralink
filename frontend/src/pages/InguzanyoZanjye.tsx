import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { LoanOut } from '../types';
import { MoMoPaymentModal } from '../components/MoMoPaymentModal';
import { Toast, ToastType } from '../components/Toast';
import { EmptyState } from '../components/EmptyState';
import { CardSkeleton } from '../components/Skeleton';
import { HandCoins, Clock, CheckCircle2, AlertCircle, Plus, Calendar, ShieldCheck, ArrowRight } from 'lucide-react';

export const InguzanyoZanjye: React.FC = () => {
  const [loans, setLoans] = useState<LoanOut[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedLoan, setSelectedLoan] = useState<LoanOut | null>(null);
  const [modalOpen, setModalOpen] = useState<boolean>(false);

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<ToastType>('info');

  const fetchLoans = async () => {
    try {
      setLoading(true);
      const res = await api.get('/loans/my');
      setLoans(res.data);
    } catch (err: any) {
      showToast(err.message || "Habaye ikibazo mu gushaka inguzanyo.", 'error');
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

  const handleOpenRepaymentModal = (loan: LoanOut) => {
    setSelectedLoan(loan);
    setModalOpen(true);
  };

  const handleRepaymentSubmit = async (amount: number, reference: string) => {
    if (!selectedLoan) return;

    await api.post(`/loans/${selectedLoan.id}/repayment`, {
      amount,
      payment_reference: reference,
    });

    showToast(
      `Ubwishyu bwa ${amount.toLocaleString()} Frw bwakiriwe. Imiterere: Bitegereje kwemezwa n'ubuyobozi.`,
      'success'
    );
    fetchLoans();
  };

  const formatFrw = (val: number) => `${val.toLocaleString()} Frw`;

  return (
    <div className="space-y-6 animate-fade-in">
      <Toast message={toastMessage} type={toastType} onClose={() => setToastMessage(null)} />

      {/* Header Banner */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-50 rounded-full text-xs font-bold text-amber-800 mb-2">
            <HandCoins className="w-3.5 h-3.5" /> Inguzanyo Zanjye
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Urutonde rw'Inguzanyo Zanjye
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Hano ubona amakuru yose y'inguzanyo nasabye n'ibyo namaze kwishyura.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : loans.length === 0 ? (
        <EmptyState title="Nta nguzanyo ufite." description="Ntiwigera usaba inguzanyo muri G KORALINK." />
      ) : (
        <div className="space-y-6">
          {loans.map((loan) => (
            <div
              key={loan.id}
              className="bg-white rounded-3xl border border-slate-100 p-6 sm:p-7 shadow-sm hover:shadow-md transition space-y-6"
            >
              {/* Top Row: Loan Reason & Status */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Impamvu</span>
                  <h3 className="text-lg font-black text-slate-900">{loan.reason}</h3>
                </div>
                <div>
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${
                      loan.status === 'Yarangiye'
                        ? 'bg-emerald-100 text-emerald-800'
                        : loan.status === 'Iri kwishyura' || loan.status === 'Yemejwe'
                        ? 'bg-sky-100 text-sky-800'
                        : loan.status === 'Yanzwe'
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {loan.status}
                  </span>
                </div>
              </div>

              {/* Financial Metrics Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
                  <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Nasabye</span>
                  <span className="font-extrabold text-slate-900 text-base">{formatFrw(loan.requested_amount)}</span>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
                  <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Nemerewe</span>
                  <span className="font-extrabold text-emerald-700 text-base">
                    {loan.approved_amount ? formatFrw(loan.approved_amount) : 'Bitegereje'}
                  </span>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
                  <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Namaze Kwishyura</span>
                  <span className="font-extrabold text-slate-900 text-base">{formatFrw(loan.total_repaid)}</span>
                </div>

                <div className="p-3.5 bg-rose-50/50 rounded-2xl border border-rose-100">
                  <span className="block text-[10px] font-bold text-rose-800 uppercase tracking-wider">Nsigaje</span>
                  <span className="font-extrabold text-rose-700 text-base">{formatFrw(loan.remaining_balance)}</span>
                </div>
              </div>

              {/* Dates & Rejection Reason if any */}
              <div className="flex flex-wrap items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" /> Yatangiwe: {new Date(loan.created_at).toLocaleDateString()}
                </span>
                {loan.due_date && (
                  <span className="font-medium text-slate-700">
                    Itariki yo kwishyuriraho: <strong>{new Date(loan.due_date).toLocaleDateString()}</strong>
                  </span>
                )}
              </div>

              {loan.rejection_reason && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 font-medium">
                  Impamvu yo kwanga: {loan.rejection_reason}
                </div>
              )}

              {/* Action Repayment Button if approved / paying */}
              {(loan.status === 'Yemejwe' || loan.status === 'Iri kwishyura') && loan.remaining_balance > 0 && (
                <div className="pt-2">
                  <button
                    onClick={() => handleOpenRepaymentModal(loan)}
                    className="w-full py-3.5 bg-kora-600 hover:bg-kora-700 text-white font-black rounded-2xl shadow-lg shadow-kora-500/20 active:scale-[0.99] transition flex items-center justify-center gap-2 text-sm"
                  >
                    <HandCoins className="w-4.5 h-4.5" /> Wishyura Umwenda (Frw)
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Repayment Modal */}
      {selectedLoan && (
        <MoMoPaymentModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          title={`Kwishyura Umwenda (${selectedLoan.reason})`}
          defaultAmount={Math.min(10000, selectedLoan.remaining_balance)}
          onSubmit={handleRepaymentSubmit}
          buttonLabel="Emeza Ubwishyu"
        />
      )}
    </div>
  );
};
