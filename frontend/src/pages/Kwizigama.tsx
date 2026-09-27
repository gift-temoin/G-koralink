import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { IkibinaGroup } from '../types';
import { MoMoPaymentModal } from '../components/MoMoPaymentModal';
import { Toast, ToastType } from '../components/Toast';
import { EmptyState } from '../components/EmptyState';
import { CardSkeleton } from '../components/Skeleton';
import { Wallet, Users, Calendar, ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react';

export const Kwizigama: React.FC = () => {
  const [groups, setGroups] = useState<IkibinaGroup[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedGroup, setSelectedGroup] = useState<IkibinaGroup | null>(null);
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<ToastType>('info');

  const fetchGroups = async () => {
    try {
      setLoading(true);
      const res = await api.get('/ikibina');
      setGroups(res.data);
    } catch (err: any) {
      showToast(err.message || "Habaye ikibazo mu gushaka ibibina.", 'error');
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

  const handleOpenDepositModal = (group: IkibinaGroup) => {
    setSelectedGroup(group);
    setModalOpen(true);
  };

  const handleDepositSubmit = async (amount: number, reference: string) => {
    if (!selectedGroup) return;

    await api.post('/savings', {
      group_id: selectedGroup.id,
      amount,
      payment_reference: reference,
    });

    showToast(
      `Ubusabe bwawe bwo kwizigama ${amount.toLocaleString()} Frw bwageragejwe neza. Imiterere: Bitegereje kwemezwa.`,
      'success'
    );
    fetchGroups();
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <Toast message={toastMessage} type={toastType} onClose={() => setToastMessage(null)} />

      {/* Header Banner */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-kora-50 rounded-full text-xs font-bold text-kora-700 mb-2">
            <Wallet className="w-3.5 h-3.5" /> Kwizigama mu Kibina
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Ibibina Biri Gukora
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Hitamo ikibina ushaka kwizigamamo maze ukande "Zigama" uheze ubwishyu kuri MTN MoMo.
          </p>
        </div>
      </div>

      {/* Group Cards Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : groups.length === 0 ? (
        <EmptyState title="Nta Kibina kiboneka ubu." description="Ubuyobozi buri kwitegura gushyiraho ibibina mashya." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {groups.map((g) => (
            <div
              key={g.id}
              className="bg-white rounded-3xl border border-slate-100 p-6 sm:p-7 shadow-sm hover:shadow-md transition flex flex-col justify-between space-y-6 relative overflow-hidden"
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-xl font-black text-slate-900 tracking-tight">{g.name}</h3>
                    <span className="inline-block text-xs font-semibold text-kora-700 bg-kora-50 px-2.5 py-1 rounded-full mt-1">
                      {g.frequency}
                    </span>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-kora-500/10 text-kora-600 flex items-center justify-center font-black text-lg">
                    <Wallet className="w-6 h-6" />
                  </div>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                  {g.description || "Uko kwizigama bikorwa muri iki kibina."}
                </p>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                    <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Umusanzu Usabwa</span>
                    <span className="font-extrabold text-slate-900 text-base">{g.contribution_amount.toLocaleString()} Frw</span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                    <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Abanyamuryango</span>
                    <span className="font-extrabold text-slate-900 text-base flex items-center gap-1">
                      <Users className="w-4 h-4 text-kora-600" /> {g.current_members_count} / {g.max_members}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" /> Itariki: {g.start_date}
                  </span>
                  <span>Uruhande: <strong className="text-emerald-600">Biri Gukora</strong></span>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => handleOpenDepositModal(g)}
                  className="w-full py-3.5 bg-kora-600 hover:bg-kora-700 text-white font-extrabold rounded-2xl shadow-lg shadow-kora-500/20 active:scale-[0.99] transition flex items-center justify-center gap-2 text-sm"
                >
                  <Wallet className="w-4.5 h-4.5" /> Zigama {g.contribution_amount.toLocaleString()} Frw
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MoMo Payment Modal */}
      {selectedGroup && (
        <MoMoPaymentModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          title={`Kwizigama muri ${selectedGroup.name}`}
          defaultAmount={selectedGroup.contribution_amount}
          onSubmit={handleDepositSubmit}
          buttonLabel="Emeza Kwizigama"
        />
      )}
    </div>
  );
};
