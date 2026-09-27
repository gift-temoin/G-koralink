import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogIn, Lock, Phone, AlertCircle, ArrowRight, ShieldCheck } from 'lucide-react';

export const Injira: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [phone_number, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!phone_number.trim()) {
      setError("Nyamuneka andika nimero ya telefoni.");
      return;
    }
    if (!password) {
      setError("Nyamuneka andika ijambobanga.");
      return;
    }

    try {
      setLoading(true);
      const loggedUser = await login(phone_number, password);
      if (loggedUser.role === 'ADMIN') {
        navigate('/admin');
      } else {
        navigate('/ahabanza');
      }
    } catch (err: any) {
      setError(err.message || "Nimero ya telefoni cyangwa ijambobanga ntabwo ari byo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-kora-500/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-md bg-slate-950/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl relative z-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl rwanda-gradient shadow-xl shadow-kora-500/20 text-white font-black text-2xl mb-3">
            G
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Injira muri G KORALINK
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1.5">
            Injira muri konti yawe ukoresheje nimero ya telefoni
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/30 rounded-2xl text-xs font-medium text-rose-300 flex items-start gap-2.5">
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <span className="leading-relaxed">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              Nimero ya telefoni
            </label>
            <div className="relative">
              <input
                type="tel"
                value={phone_number}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="078XXXXXXX"
                required
                className="w-full pl-10 pr-4 py-3.5 bg-slate-900 border border-slate-800 rounded-xl text-white text-sm font-mono focus:ring-2 focus:ring-kora-500 focus:border-transparent outline-none transition"
              />
              <Phone className="w-4.5 h-4.5 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Ijambobanga
              </label>
              <button
                type="button"
                onClick={() => alert("Nyamuneka vugana n'ubuyobozi bwa G KORALINK kuri 0788123456 gukosora ijambobanga.")}
                className="text-xs text-kora-400 hover:text-kora-300 font-semibold"
              >
                Wibagiwe ijambobanga?
              </button>
            </div>
            <div className="relative">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full pl-10 pr-4 py-3.5 bg-slate-900 border border-slate-800 rounded-xl text-white text-sm focus:ring-2 focus:ring-kora-500 focus:border-transparent outline-none transition"
              />
              <Lock className="w-4.5 h-4.5 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-4 bg-kora-600 hover:bg-kora-500 text-white font-bold rounded-2xl shadow-lg shadow-kora-500/25 active:scale-[0.99] transition flex items-center justify-center gap-2 text-sm disabled:opacity-50"
          >
            {loading ? (
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
            ) : (
              <>
                <LogIn className="w-5 h-5" /> Injira
              </>
            )}
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-slate-800/80 text-center space-y-3">
          <p className="text-xs text-slate-400">
            Nta konti ufite?{' '}
            <Link to="/kwiyandikisha" className="font-bold text-kora-400 hover:text-kora-300 inline-flex items-center gap-1 ml-1">
              Iyandikishe <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </p>

          <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800 text-[11px] text-slate-400 flex items-center justify-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-amber-500 shrink-0" />
            <span>Konti y'ubuyobozi: <strong>0784772228</strong></span>
          </div>
        </div>
      </div>
    </div>
  );
};
