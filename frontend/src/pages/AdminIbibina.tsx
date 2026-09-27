import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { IkibinaGroup } from '../types';
import { Modal } from '../components/Modal';
import { Toast, ToastType } from '../components/Toast';
import { EmptyState } from '../components/EmptyState';
import { TableSkeleton } from '../components/Skeleton';
import { UsersRound, Plus, Edit2, Power, ShieldAlert, Calendar, DollarSign } from 'lucide-react';

export const AdminIbibina: React.FC = () => {
  const [groups, setGroups] = useState<IkibinaGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<IkibinaGroup | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    contribution_amount: 9000,
    frequency: 'Buri cyumweru',
    max_members: 30,
    start_date: '2026-01-01',
    end_date: '2026-12-31',
    description: '',
    profit_enabled: false,
    profit_rate: 0.0,
  });

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<ToastType>('info');

  const fetchGroups = async () => {
    try {
      setLoading(true);
      const res = await api.get('/ikibina');
      setGroups(res.data);
    } catch (err: any) {
      showToast(err.message || "Habaye ikibazo mu gushaka ibibina.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  const showToast = (msg: string, type: ToastType) => {
    setToastMessage(msg);
    setToastType(type);
  };

  const handleOpenCreateModal = () => {
    setEditingGroup(null);
    setFormData({
      name: '',
      contribution_amount: 9000,
      frequency: 'Buri cyumweru',
      max_members: 30,
      start_date: '2026-01-01',
      end_date: '2026-12-31',
      description: '',
      profit_enabled: false,
      profit_rate: 0.0,
    });
    setModalOpen(true);
  };

  const handleOpenEditModal = (group: IkibinaGroup) => {
    setEditingGroup(group);
    setFormData({
      name: group.name,
      contribution_amount: group.contribution_amount,
      frequency: group.frequency,
      max_members: group.max_members,
      start_date: group.start_date,
      end_date: group.end_date,
      description: group.description || '',
      profit_enabled: group.profit_enabled,
      profit_rate: group.profit_rate,
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingGroup) {
        await api.put(`/admin/ikibina/${editingGroup.id}`, formData);
        showToast("Ikibina cyahinduwe neza!", "success");
      } else {
        await api.post('/admin/ikibina', formData);
        showToast("Ikibina gishya cyakozwe neza!", "success");
      }
      setModalOpen(false);
      fetchGroups();
    } catch (err: any) {
      showToast(err.message || "Habaye ikibazo mu kubika ikibina.", "error");
    }
  };

  const handleToggleActive = async (group: IkibinaGroup) => {
    try {
      await api.post(`/admin/ikibina/${group.id}/toggle`);
      showToast(group.is_active ? "Ikibina kihagaritswe." : "Ikibina cyakozwe.", "success");
      fetchGroups();
    } catch (err: any) {
      showToast(err.message || "Habaye ikibazo.", "error");
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <Toast message={toastMessage} type={toastType} onClose={() => setToastMessage(null)} />

      <div className="bg-slate-950 p-6 sm:p-8 rounded-3xl border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-amber-400 uppercase tracking-widest flex items-center gap-1.5 mb-1">
            <UsersRound className="w-4 h-4" /> Ikibina Management
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Ibibina bya G KORALINK
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Reba, rema cyangwa uhindure ibibina n'amabwiriza yabyo.
          </p>
        </div>

        <button
          onClick={handleOpenCreateModal}
          className="px-5 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-2xl shadow-lg shadow-amber-500/20 active:scale-[0.99] transition flex items-center gap-2 text-sm"
        >
          <Plus className="w-5 h-5" /> Rema Ikibina Gishya
        </button>
      </div>

      {loading ? (
        <TableSkeleton />
      ) : groups.length === 0 ? (
        <EmptyState title="Nta kibina buhari." description="Kanda kuri 'Rema Ikibina Gishya' ushyireho ikibina cha mbere." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {groups.map((g) => (
            <div
              key={g.id}
              className="bg-slate-950 rounded-3xl border border-slate-800 p-6 space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-xl font-black text-white">{g.name}</h3>
                    <span className="text-xs font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2.5 py-0.5 rounded-full mt-1 inline-block">
                      {g.frequency}
                    </span>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-[11px] font-bold ${
                      g.is_active ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                    }`}
                  >
                    {g.is_active ? 'Biri Gukora' : 'Cyahagaritswe'}
                  </span>
                </div>

                <p className="text-xs text-slate-400 leading-relaxed bg-slate-900 p-3 rounded-xl border border-slate-800">
                  {g.description || "Nta busobanuro nshingiro nshingiro buhari."}
                </p>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                    <span className="block text-[10px] text-slate-400 font-bold uppercase">Umusanzu</span>
                    <span className="text-white font-black text-sm">{g.contribution_amount.toLocaleString()} Frw</span>
                  </div>

                  <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                    <span className="block text-[10px] text-slate-400 font-bold uppercase">Abanyamuryango</span>
                    <span className="text-white font-black text-sm">{g.current_members_count} / {g.max_members}</span>
                  </div>
                </div>

                {g.profit_enabled && (
                  <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-xs text-emerald-400 font-semibold">
                    Inyungu yagenwe: {g.profit_rate}%
                  </div>
                )}
              </div>

              <div className="flex items-center gap-3 pt-3 border-t border-slate-800">
                <button
                  onClick={() => handleOpenEditModal(g)}
                  className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl text-xs transition flex items-center justify-center gap-1.5"
                >
                  <Edit2 className="w-3.5 h-3.5 text-amber-400" /> Hindura
                </button>
                <button
                  onClick={() => handleToggleActive(g)}
                  className={`py-2.5 px-4 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                    g.is_active ? 'bg-rose-500/20 text-rose-300 hover:bg-rose-500/30' : 'bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30'
                  }`}
                >
                  <Power className="w-3.5 h-3.5" /> {g.is_active ? 'Hagarika' : 'Fungura'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal for Create/Edit Ikibina */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingGroup ? `Hindura ${editingGroup.name}` : "Rema Ikibina Gishya"}
        maxWidth="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4 text-slate-900">
          <div>
            <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Izina ry'Ikibina</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Urugero: G KORALINK 2026"
              required
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Umusanzu (Frw)</label>
              <input
                type="number"
                value={formData.contribution_amount}
                onChange={(e) => setFormData({ ...formData, contribution_amount: Number(e.target.value) })}
                required
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Gusohora umusanzu</label>
              <select
                value={formData.frequency}
                onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="Buri cyumweru">Buri cyumweru</option>
                <option value="Buri kwezi">Buri kwezi</option>
                <option value="Buri minsi 15">Buri minsi 15</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Umubare w'abanyamuryango</label>
              <input
                type="number"
                value={formData.max_members}
                onChange={(e) => setFormData({ ...formData, max_members: Number(e.target.value) })}
                required
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Itariki cyatangiriye</label>
              <input
                type="date"
                value={formData.start_date}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                required
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Itariki cyagutangirira</label>
              <input
                type="date"
                value={formData.end_date}
                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                required
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Uko kwizigama bikorwa</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              placeholder="Andika amabwiriza n'uko amakarita azatangwa..."
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 space-y-3">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="profit_enabled"
                checked={formData.profit_enabled}
                onChange={(e) => setFormData({ ...formData, profit_enabled: e.target.checked })}
                className="w-4 h-4 text-amber-600 rounded focus:ring-amber-500"
              />
              <label htmlFor="profit_enabled" className="text-xs font-bold text-amber-900 cursor-pointer">
                Shyiraho inyungu kuri iki kibina
              </label>
            </div>

            {formData.profit_enabled && (
              <div>
                <label className="block text-xs font-bold text-amber-900 mb-1">Ukwezi / Inyungu (%)</label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.profit_rate}
                  onChange={(e) => setFormData({ ...formData, profit_rate: Number(e.target.value) })}
                  className="w-full px-4 py-2.5 bg-white border border-amber-300 rounded-xl text-sm font-bold"
                />
              </div>
            )}
          </div>

          <button
            type="submit"
            className="w-full py-4 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-2xl shadow-lg shadow-amber-500/20 transition text-sm"
          >
            {editingGroup ? 'Bika Impinduka' : 'Rema Ikibina'}
          </button>
        </form>
      </Modal>
    </div>
  );
};
