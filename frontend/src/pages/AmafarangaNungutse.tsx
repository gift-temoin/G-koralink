import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { UserDashboardStats, ProfitRecord } from '../types';
import { EmptyState } from '../components/EmptyState';
import { CardSkeleton } from '../components/Skeleton';
import { TrendingUp, Wallet, Coins, ArrowUpRight, Award, Layers } from 'lucide-react';

export const AmafarangaNungutse: React.FC = () => {
  const [stats, setStats] = useState<UserDashboardStats | null>(null);
  const [profits, setProfits] = useState<ProfitRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const dashRes = await api.get('/users/me/dashboard');
        setStats(dashRes.data);
      } catch (err) {
        console.error('Error fetching profit data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const formatFrw = (val: number) => `${val.toLocaleString()} Frw`;

  const totalSavings = stats?.total_savings || 0;
  const totalProfit = stats?.total_profit || 0;
  const totalNet = totalSavings + totalProfit;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-sm">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-50 rounded-full text-xs font-bold text-amber-800 mb-2">
          <TrendingUp className="w-3.5 h-3.5" /> Inyungu n'Inyongera
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          Amafaranga Nungutse
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Hano ubona inyungu yakazwe ku mafaranga wazigamye n'ingano y'umutungo wawe wose.
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Box 1: Amafaranga yazigamwe */}
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Amafaranga Yazigamwe
              </span>
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Wallet className="w-5 h-5" />
              </div>
            </div>
            <div className="text-2xl font-black text-slate-900">
              {formatFrw(totalSavings)}
            </div>
            <p className="text-xs text-slate-500">Igiteranyo cy'amafaranga yose yemejwe</p>
          </div>

          {/* Box 2: Inyungu yabonetse */}
          <div className="bg-white p-6 rounded-3xl border border-amber-200/80 bg-amber-50/20 shadow-sm space-y-3 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-800 uppercase tracking-wider">
                Inyungu Yabonetse
              </span>
              <div className="w-10 h-10 rounded-2xl gold-badge text-white flex items-center justify-center shadow-md">
                <Award className="w-5 h-5" />
              </div>
            </div>
            <div className="text-2xl font-black text-amber-700">
              {formatFrw(totalProfit)}
            </div>
            <p className="text-xs text-amber-800 font-medium">Inyungu yakazwe hakurikijwe amategeko y'Ikibina</p>
          </div>

          {/* Box 3: Amafaranga yose hamwe */}
          <div className="rwanda-gradient p-6 rounded-3xl text-white shadow-lg shadow-kora-500/10 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-kora-200 uppercase tracking-wider">
                Amafaranga Yose Hamwe
              </span>
              <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center">
                <Layers className="w-5 h-5 text-amber-300" />
              </div>
            </div>
            <div className="text-3xl font-black text-amber-300">
              {formatFrw(totalNet)}
            </div>
            <p className="text-xs text-slate-200">Umutungo wawe ufashe muri G KORALINK</p>
          </div>
        </div>
      )}

      {/* Breakdown Explanation */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-100 shadow-sm space-y-4">
        <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
          <Coins className="w-5 h-5 text-kora-600" /> Amabwiriza ku Nyungu
        </h3>
        <div className="text-xs text-slate-600 space-y-2 leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-100">
          <p>• Inyungu yabarwa gusa ku kibina gifite inyungu yagenwe n'ubuyobozi.</p>
          <p>• Inyungu ntabwo ihimbwa ku mbaraga; yakazwa gusa iyo ubuyobozi bwabyemeje.</p>
          <p>• Amafaranga yawe yazigamwe ahora arinzwe kandi ashobora kubikuzwa hakurikijwe amabwiriza y'Ikibina.</p>
        </div>
      </div>
    </div>
  );
};
