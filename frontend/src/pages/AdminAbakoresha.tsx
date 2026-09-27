import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { User } from '../types';
import { Toast, ToastType } from '../components/Toast';
import { TableSkeleton } from '../components/Skeleton';
import { EmptyState } from '../components/EmptyState';
import { Users, Search, UserCheck, UserX, ShieldAlert, Phone, MapPin } from 'lucide-react';

export const AdminAbakoresha: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<ToastType>('info');

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/users', {
        params: { query: searchQuery || undefined },
      });
      setUsers(res.data);
    } catch (err: any) {
      showToast(err.message || "Habaye ikibazo mu gushaka abakoresha.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [searchQuery]);

  const showToast = (msg: string, type: ToastType) => {
    setToastMessage(msg);
    setToastType(type);
  };

  const handleToggleStatus = async (user: User) => {
    try {
      const res = await api.put(`/admin/users/${user.id}/status`);
      showToast(res.data.message, "success");
      fetchUsers();
    } catch (err: any) {
      showToast(err.message || "Habaye ikibazo.", "error");
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <Toast message={toastMessage} type={toastType} onClose={() => setToastMessage(null)} />

      {/* Header & Search */}
      <div className="bg-slate-950 p-6 sm:p-8 rounded-3xl border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-amber-400 uppercase tracking-widest flex items-center gap-1.5 mb-1">
            <Users className="w-4 h-4" /> Management
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Abakoresha ba G KORALINK
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Cunga abanyamuryango, shaka cyangwa ugene imiterere y'izindi konti.
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative w-full md:w-80">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Shaka mu mazina, telefoni..."
            className="w-full pl-10 pr-4 py-3 bg-slate-900 border border-slate-800 rounded-xl text-white text-sm focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition"
          />
          <Search className="w-4.5 h-4.5 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
        </div>
      </div>

      {loading ? (
        <TableSkeleton />
      ) : users.length === 0 ? (
        <EmptyState title="Nta mukoresha ubonetse." description="Gerageza guhindura amagambo urikushakisha." />
      ) : (
        <div className="bg-slate-950 rounded-3xl border border-slate-800 overflow-hidden shadow-xl">
          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-900/80 border-b border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="py-4 px-6">Amazina</th>
                  <th className="py-4 px-6">Telefoni</th>
                  <th className="py-4 px-6">Aho utuye</th>
                  <th className="py-4 px-6">Ikibina</th>
                  <th className="py-4 px-6">Imiterere</th>
                  <th className="py-4 px-6">Itariki</th>
                  <th className="py-4 px-6 text-right">Igikorwa</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-xs">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-900/50 transition">
                    <td className="py-4 px-6 font-bold text-white">
                      {u.full_name}
                    </td>
                    <td className="py-4 px-6 text-amber-400 font-mono">
                      {u.phone_number}
                    </td>
                    <td className="py-4 px-6 text-slate-300">
                      {u.location}
                    </td>
                    <td className="py-4 px-6 text-slate-300">
                      {u.current_ikibina_name || 'Nta kibina'}
                    </td>
                    <td className="py-4 px-6">
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold ${
                          u.is_active
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                        }`}
                      >
                        {u.is_active ? <UserCheck className="w-3.5 h-3.5" /> : <UserX className="w-3.5 h-3.5" />}
                        {u.is_active ? 'Gukora' : 'Yahagaritswe'}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-slate-400">
                      {new Date(u.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <button
                        onClick={() => handleToggleStatus(u)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 ml-auto ${
                          u.is_active
                            ? 'bg-rose-500/10 text-rose-300 hover:bg-rose-500/20 border border-rose-500/30'
                            : 'bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20 border border-emerald-500/30'
                        }`}
                      >
                        {u.is_active ? (
                          <>
                            <UserX className="w-3.5 h-3.5" /> Hagarika
                          </>
                        ) : (
                          <>
                            <UserCheck className="w-3.5 h-3.5" /> Koresha
                          </>
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden divide-y divide-slate-800">
            {users.map((u) => (
              <div key={u.id} className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-white">{u.full_name}</span>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      u.is_active ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                    }`}
                  >
                    {u.is_active ? 'Gukora' : 'Yahagaritswe'}
                  </span>
                </div>
                <div className="text-xs text-slate-400 space-y-1">
                  <p className="font-mono text-amber-400"><Phone className="w-3 h-3 inline mr-1" />{u.phone_number}</p>
                  <p><MapPin className="w-3 h-3 inline mr-1" />{u.location}</p>
                  <p>Ikibina: <strong className="text-white">{u.current_ikibina_name || 'Nta kibina'}</strong></p>
                </div>
                <button
                  onClick={() => handleToggleStatus(u)}
                  className={`w-full py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                    u.is_active ? 'bg-rose-500/20 text-rose-300' : 'bg-emerald-500/20 text-emerald-300'
                  }`}
                >
                  {u.is_active ? 'Hagarika Konti' : 'Fungura Konti'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
