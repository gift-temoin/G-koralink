import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Toast, ToastType } from '../components/Toast';
import { HandCoins, ShieldCheck, AlertCircle, FileText, Calendar, CheckCircle2 } from 'lucide-react';

export const Kuguza: React.FC = () => {
  const navigate = useNavigate();
  const [requestedAmount, setRequestedAmount] = useState<number>(50000);
  const [reason, setReason] = useState<string>('');
  const [repaymentMonths, setRepaymentMonths] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<ToastType>('info');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!requestedAmount || requestedAmount <= 0) {
      setError("Nyamuneka andika amafaranga usaba yemewe.");
      return;
    }
    if (!reason.trim()) {
      setError("Nyamuneka andika impamvu ukeneye inguzanyo.");
      return;
    }

    try {
      setLoading(true);
      await api.post('/loans/request', {
        requested_amount: requestedAmount,
        reason,
        repayment_months: repaymentMonths,
      });

      setToastMessage("Ubusabe bwawe bw'inguzanyo bwakiriwe. Imiterere: Bitegereje kwemezwa.");
      setToastType('success');
      setTimeout(() => {
        navigate('/inguzanyo-zanjye');
      }, 2000);
    } catch (err: any) {
      setError(err.message || "Habaye ikibazo mu gusaba inguzanyo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
      <Toast message={toastMessage} type={toastType} onClose={() => setToastMessage(null)} />

      {/* Header Banner */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-sm space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-50 rounded-full text-xs font-bold text-amber-800">
          <HandCoins className="w-3.5 h-3.5" /> Saba Inguzanyo
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          Kuguza muri G KORALINK
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed bg-amber-50/50 p-4 rounded-2xl border border-amber-100">
          Ushobora gusaba amafaranga y'inguzanyo hano. Ubusabe bwawe buzarebwa n'ubuyobozi mbere yo kwemezwa.
        </p>
      </div>

      {/* Form Card */}
      <div className="bg-white rounded-3xl border border-slate-100 p-6 sm:p-8 shadow-sm">
        {error && (
          <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-2xl text-xs font-medium text-rose-800 flex items-center gap-2.5">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              Amafaranga usaba (Frw)
            </label>
            <div className="relative">
              <input
                type="number"
                value={requestedAmount}
                onChange={(e) => setRequestedAmount(Number(e.target.value))}
                min={5000}
                step={5000}
                required
                className="w-full pl-4 pr-16 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-extrabold text-xl focus:ring-2 focus:ring-amber-500 focus:bg-white outline-none transition"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">
                Frw
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Ushobora gusaba kuva kuri 5,000 Frw kuzamura.
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              Impamvu yo kuguza
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Andika impamvu ikwaka gusaba inguzanyo (urugero: Guhaha ibikoresho, kwishyura ishuri...)"
              rows={3}
              required
              className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium text-sm focus:ring-2 focus:ring-amber-500 focus:bg-white outline-none transition"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              Igihe uteganya kwishyurira (Amezi)
            </label>
            <select
              value={repaymentMonths}
              onChange={(e) => setRepaymentMonths(Number(e.target.value))}
              className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-semibold text-sm focus:ring-2 focus:ring-amber-500 focus:bg-white outline-none transition"
            >
              <option value={1}>Ukwezi 1 (Ukwezi kumwe)</option>
              <option value={2}>Amezi 2 (Amezi abiri)</option>
              <option value={3}>Amezi 3 (Amezi atatu)</option>
              <option value={6}>Amezi 6 (Amezi atandatu)</option>
            </select>
          </div>

          <div className="pt-3">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-2xl shadow-lg shadow-amber-500/20 active:scale-[0.99] transition flex items-center justify-center gap-2 text-sm disabled:opacity-50"
            >
              {loading ? (
                <span className="w-5 h-5 border-2 border-slate-950/30 border-t-slate-950 rounded-full animate-spin"></span>
              ) : (
                <>
                  <HandCoins className="w-5 h-5" /> Saba Inguzanyo
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
