import React, { useState } from 'react';
import { Modal } from './Modal';
import { Smartphone, CheckCircle, AlertCircle, Copy } from 'lucide-react';

interface MoMoPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  defaultAmount?: number;
  onSubmit: (amount: number, reference: string) => Promise<void>;
  buttonLabel?: string;
}

export const MoMoPaymentModal: React.FC<MoMoPaymentModalProps> = ({
  isOpen,
  onClose,
  title,
  defaultAmount = 9000,
  onSubmit,
  buttonLabel = "Emeza ubwishyu",
}) => {
  const [amount, setAmount] = useState<number>(defaultAmount);
  const [reference, setReference] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const ussdCode = "*182*8*1*412512#";

  const handleCopyCode = () => {
    navigator.clipboard.writeText(ussdCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!amount || amount <= 0) {
      setError("Nyamuneka andika umubare w'amafaranga yemewe.");
      return;
    }
    if (!reference.trim()) {
      setError("Nyamuneka andika nimero y'igTransaction (Reference) ya MTN MoMo.");
      return;
    }

    try {
      setLoading(true);
      await onSubmit(amount, reference);
      setReference('');
      onClose();
    } catch (err: any) {
      setError(err.message || "Habaye ikibazo mu kwemeza ubwishyu.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth="md">
      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs font-medium text-rose-800 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            {error}
          </div>
        )}

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
            Igiteranyo ushaka kuzigama (Frw)
          </label>
          <div className="relative">
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              min={100}
              step={100}
              required
              className="w-full pl-4 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-bold text-lg focus:ring-2 focus:ring-kora-500 focus:bg-white outline-none transition"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-semibold text-sm">
              Frw
            </span>
          </div>
        </div>

        {/* MTN MoMo Instructions Box */}
        <div className="p-4 bg-amber-50/80 border border-amber-200/80 rounded-2xl space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-900 uppercase tracking-wider flex items-center gap-1.5">
              <Smartphone className="w-4 h-4 text-amber-600" /> Uburyo bwo kwishyura: MTN MoMo
            </span>
            <button
              type="button"
              onClick={handleCopyCode}
              className="text-xs font-semibold text-amber-800 hover:text-amber-950 flex items-center gap-1 bg-amber-100 px-2.5 py-1 rounded-lg transition"
            >
              <Copy className="w-3.5 h-3.5" />
              {copied ? 'Wagikopeye!' : 'Kopiya USSD'}
            </button>
          </div>

          <div className="p-3 bg-white/90 rounded-xl border border-amber-200 flex items-center justify-between">
            <span className="font-mono text-base font-bold text-slate-900">{ussdCode}</span>
            <span className="text-xs font-semibold px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full">
              Izina: ENOCK
            </span>
          </div>

          <div className="text-xs text-slate-700 space-y-1.5 leading-relaxed pl-1">
            <p>1. Fungura telefoni yawe</p>
            <p>2. Kanda <strong className="font-mono font-bold text-slate-900">{ussdCode}</strong></p>
            <p>3. Kurikiza amabwiriza agaragara kuri telefoni</p>
            <p>4. Reba neza izina ry'uwo woherejeho amafaranga</p>
            <p className="font-semibold text-amber-900 bg-amber-100/50 p-1.5 rounded">
              5. Niba ubonye izina <strong>ENOCK</strong>, banza urebe ko ari ryo risobanutse neza mbere yo kwemeza
            </p>
            <p>6. Emeza ubwishyu</p>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
            Nimero y'igTransaction (MTN Reference Number)
          </label>
          <input
            type="text"
            value={reference}
            onChange={(e) => setReference(e.target.value)}
            placeholder="Urugero: MOMO-9812344"
            required
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium text-sm focus:ring-2 focus:ring-kora-500 focus:bg-white outline-none transition"
          />
          <p className="text-[11px] text-slate-500 mt-1">
            Shyiramo nimero cyangwa kode wabonye muri ubutumwa bwa MTN bw'ubwishyu.
          </p>
        </div>

        <div className="pt-2">
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-kora-600 hover:bg-kora-700 text-white font-bold rounded-xl shadow-lg shadow-kora-500/20 active:scale-[0.99] transition flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <span className="inline-block w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
            ) : (
              <>
                <CheckCircle className="w-5 h-5" /> {buttonLabel}
              </>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
};
