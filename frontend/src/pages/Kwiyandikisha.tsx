import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserPlus, Lock, Phone, MapPin, User as UserIcon, AlertCircle, ArrowRight } from 'lucide-react';

export const Kwiyandikisha: React.FC = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    amazina_ya_mbere: '',
    izina_rya_kabiri: '',
    phone_number: '',
    location: '',
    password: '',
    confirm_password: '',
  });

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Frontend validations
    if (!formData.amazina_ya_mbere.trim() || !formData.izina_rya_kabiri.trim()) {
      setError("Nyamuneka andika amazina yawe yose.");
      return;
    }
    const cleanPhone = formData.phone_number.replace(/\s+/g, '').replace('-','');
    if (!cleanPhone.startsWith('07') || cleanPhone.length !== 10) {
      setError("Nyamuneka andika nimero ya telefoni yemewe (urugero: 078XXXXXXX).");
      return;
    }
    if (!formData.location.trim()) {
      setError("Nyamuneka andika aho utuye.");
      return;
    }
    if (formData.password.length < 6) {
      setError("Ijambobanga rigomba kuba ririmo inyuguti no gupima nibura 6.");
      return;
    }
    if (formData.password !== formData.confirm_password) {
      setError("Amajambobanga ntabwo ahura.");
      return;
    }

    try {
      setLoading(true);
      await register({
        ...formData,
        phone_number: cleanPhone,
      });
      navigate('/ahabanza');
    } catch (err: any) {
      setError(err.message || "Habaye ikibazo mu kwiyandikisha.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Graphic Accents */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-kora-500/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-lg bg-slate-950/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl relative z-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl rwanda-gradient shadow-xl shadow-kora-500/20 text-white font-black text-2xl mb-3">
            G
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Kwiyandikisha muri G KORALINK
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1.5">
            Fungura konti yawe ubumaze kuzigama no kuguza mu buryo bwizewe
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/30 rounded-2xl text-xs font-medium text-rose-300 flex items-start gap-2.5">
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <span className="leading-relaxed">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Amazina ya mbere
              </label>
              <div className="relative">
                <input
                  type="text"
                  name="amazina_ya_mbere"
                  value={formData.amazina_ya_mbere}
                  onChange={handleChange}
                  placeholder="Urugero: Jean"
                  required
                  className="w-full pl-10 pr-4 py-3 bg-slate-900 border border-slate-800 rounded-xl text-white text-sm focus:ring-2 focus:ring-kora-500 focus:border-transparent outline-none transition"
                />
                <UserIcon className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Izina rya kabiri
              </label>
              <div className="relative">
                <input
                  type="text"
                  name="izina_rya_kabiri"
                  value={formData.izina_rya_kabiri}
                  onChange={handleChange}
                  placeholder="Urugero: MUGISHA"
                  required
                  className="w-full pl-10 pr-4 py-3 bg-slate-900 border border-slate-800 rounded-xl text-white text-sm focus:ring-2 focus:ring-kora-500 focus:border-transparent outline-none transition"
                />
                <UserIcon className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              Nimero ya telefoni
            </label>
            <div className="relative">
              <input
                type="tel"
                name="phone_number"
                value={formData.phone_number}
                onChange={handleChange}
                placeholder="078XXXXXXX"
                required
                className="w-full pl-10 pr-4 py-3 bg-slate-900 border border-slate-800 rounded-xl text-white text-sm font-mono focus:ring-2 focus:ring-kora-500 focus:border-transparent outline-none transition"
              />
              <Phone className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              Aho utuye
            </label>
            <div className="relative">
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="Urugero: Kigali, Nyarugenge"
                required
                className="w-full pl-10 pr-4 py-3 bg-slate-900 border border-slate-800 rounded-xl text-white text-sm focus:ring-2 focus:ring-kora-500 focus:border-transparent outline-none transition"
              />
              <MapPin className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Ijambobanga
              </label>
              <div className="relative">
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  required
                  className="w-full pl-10 pr-4 py-3 bg-slate-900 border border-slate-800 rounded-xl text-white text-sm focus:ring-2 focus:ring-kora-500 focus:border-transparent outline-none transition"
                />
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Ongera wandike ijambobanga
              </label>
              <div className="relative">
                <input
                  type="password"
                  name="confirm_password"
                  value={formData.confirm_password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  required
                  className="w-full pl-10 pr-4 py-3 bg-slate-900 border border-slate-800 rounded-xl text-white text-sm focus:ring-2 focus:ring-kora-500 focus:border-transparent outline-none transition"
                />
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              </div>
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
                <UserPlus className="w-5 h-5" /> Kwiyandikisha
              </>
            )}
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-slate-800/80 text-center">
          <p className="text-xs text-slate-400">
            Ufite konti?{' '}
            <Link to="/injira" className="font-bold text-kora-400 hover:text-kora-300 inline-flex items-center gap-1 ml-1">
              Injira <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
