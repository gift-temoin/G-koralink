import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { Toast, ToastType } from '../components/Toast';
import { User, Phone, MapPin, Calendar, Lock, ShieldCheck, Save, KeyRound, AlertCircle } from 'lucide-react';

export const Umwirondoro: React.FC = () => {
  const { user, refreshUser } = useAuth();

  const [amazina_ya_mbere, setAmazinaMb] = useState(user?.amazina_ya_mbere || '');
  const [izina_rya_kabiri, setIzinaKb] = useState(user?.izina_rya_kabiri || '');
  const [location, setLocation] = useState(user?.location || '');
  const [updateLoading, setUpdateLoading] = useState(false);

  const [old_password, setOldPassword] = useState('');
  const [new_password, setNewPassword] = useState('');
  const [confirm_new_password, setConfirmNewPassword] = useState('');
  const [passLoading, setPassLoading] = useState(false);

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<ToastType>('info');

  const showToast = (msg: string, type: ToastType) => {
    setToastMessage(msg);
    setToastType(type);
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setUpdateLoading(true);
      await api.put('/users/me', {
        amazina_ya_mbere,
        izina_rya_kabiri,
        location,
      });
      await refreshUser();
      showToast("Umwirondoro wawe wahinduwe neza!", "success");
    } catch (err: any) {
      showToast(err.message || "Habaye ikibazo mu guhindura umwirondoro.", "error");
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (new_password !== confirm_new_password) {
      showToast("Amajambobanga mashya ntabwo ahura.", "error");
      return;
    }
    try {
      setPassLoading(true);
      await api.put('/users/me/password', {
        old_password,
        new_password,
        confirm_new_password,
      });
      setOldPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
      showToast("Ijambobanga ryahinduwe neza!", "success");
    } catch (err: any) {
      showToast(err.message || "Habaye ikibazo mu guhindura ijambobanga.", "error");
    } finally {
      setPassLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      <Toast message={toastMessage} type={toastType} onClose={() => setToastMessage(null)} />

      {/* Profile Header */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-sm flex flex-col sm:flex-row items-start sm:items-center gap-6">
        <div className="w-20 h-20 rounded-3xl rwanda-gradient flex items-center justify-center text-white font-black text-3xl shadow-xl shadow-kora-500/20 shrink-0">
          {user?.amazina_ya_mbere?.[0]}
        </div>
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-kora-50 text-kora-700 font-bold text-xs rounded-full">
            <ShieldCheck className="w-3.5 h-3.5" /> Konti Yemewe
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            {user?.full_name}
          </h1>
          <p className="text-xs text-slate-500 flex items-center gap-3 flex-wrap">
            <span className="flex items-center gap-1">
              <Phone className="w-3.5 h-3.5 text-slate-400" /> {user?.phone_number}
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-slate-400" /> {user?.location}
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-slate-400" /> Yiyandikishije: {user?.created_at ? new Date(user.created_at).toLocaleDateString() : ''}
            </span>
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Profile Info Update Form */}
        <div className="bg-white rounded-3xl border border-slate-100 p-6 sm:p-8 shadow-sm space-y-5">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-4">
            <User className="w-5 h-5 text-kora-600" />
            <h3 className="font-extrabold text-base text-slate-900">Guhindura Umwirondoro</h3>
          </div>

          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                Amazina ya mbere
              </label>
              <input
                type="text"
                value={amazina_ya_mbere}
                onChange={(e) => setAmazinaMb(e.target.value)}
                required
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-semibold text-sm focus:ring-2 focus:ring-kora-500 focus:bg-white outline-none transition"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                Izina rya kabiri
              </label>
              <input
                type="text"
                value={izina_rya_kabiri}
                onChange={(e) => setIzinaKb(e.target.value)}
                required
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-semibold text-sm focus:ring-2 focus:ring-kora-500 focus:bg-white outline-none transition"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                Nimero ya telefoni (Iragereranywa)
              </label>
              <input
                type="text"
                value={user?.phone_number || ''}
                disabled
                className="w-full px-4 py-3 bg-slate-100 border border-slate-200 rounded-xl text-slate-500 font-mono text-sm cursor-not-allowed"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Ntabwo nimero ya telefoni ihindurwa nawe gusa; vugana n'ubuyobozi gukora impinduka.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                Aho utuye
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                required
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-semibold text-sm focus:ring-2 focus:ring-kora-500 focus:bg-white outline-none transition"
              />
            </div>

            <button
              type="submit"
              disabled={updateLoading}
              className="w-full py-3.5 bg-kora-600 hover:bg-kora-700 text-white font-bold rounded-xl shadow-md transition flex items-center justify-center gap-2 text-sm disabled:opacity-50"
            >
              {updateLoading ? (
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
              ) : (
                <>
                  <Save className="w-4.5 h-4.5" /> Bika Impinduka
                </>
              )}
            </button>
          </form>
        </div>

        {/* Change Password Form */}
        <div className="bg-white rounded-3xl border border-slate-100 p-6 sm:p-8 shadow-sm space-y-5">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-4">
            <KeyRound className="w-5 h-5 text-amber-600" />
            <h3 className="font-extrabold text-base text-slate-900">Guhindura Ijambobanga</h3>
          </div>

          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                Ijambobanga rya kera
              </label>
              <input
                type="password"
                value={old_password}
                onChange={(e) => setOldPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:ring-2 focus:ring-amber-500 focus:bg-white outline-none transition"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                Ijambobanga rishya
              </label>
              <input
                type="password"
                value={new_password}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:ring-2 focus:ring-amber-500 focus:bg-white outline-none transition"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                Ongera wandike ijambobanga rishya
              </label>
              <input
                type="password"
                value={confirm_new_password}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:ring-2 focus:ring-amber-500 focus:bg-white outline-none transition"
              />
            </div>

            <button
              type="submit"
              disabled={passLoading}
              className="w-full py-3.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl shadow-md transition flex items-center justify-center gap-2 text-sm disabled:opacity-50"
            >
              {passLoading ? (
                <span className="w-4 h-4 border-2 border-slate-950/30 border-t-slate-950 rounded-full animate-spin"></span>
              ) : (
                <>
                  <Lock className="w-4.5 h-4.5" /> Hindura Ijambobanga
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
