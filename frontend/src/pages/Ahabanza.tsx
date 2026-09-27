import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { UserDashboardStats, SavingsTransaction } from '../types';
import { CardSkeleton } from '../components/Skeleton';
import {
  Wallet, TrendingUp, HandCoins, ArrowUpRight,
  ShieldCheck, AlertCircle, PlusCircle, CheckCircle2, Clock, MessageSquare
} from 'lucide-react';

export const Ahabanza: React.FC = () => {
  const [stats, setStats] = useState<UserDashboardStats | null>(null);
  const [recentSavings, setRecentSavings] = useState<SavingsTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [dashRes, savRes] = await Promise.all([
          api.get('/users/me/dashboard'),
          api.get('/savings/my'),
        ]);
        setStats(dashRes.data);
        setRecentSavings(savRes.data.slice(0, 5));
      } catch (err) {
        console.error('Error loading dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-slate-200 rounded w-48 animate-pulse"></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      </div>
    );
  }

  const formatFrw = (val: number) => `${val.toLocaleString()} Frw`;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome Banner */}
      <div className="rwanda-gradient rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-kora-500/10 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-64 h-64 bg-white/5 rounded-full blur-2xl pointer-events-none"></div>
        <div className="relative z-10 max-w-2xl space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-xs font-semibold text-kora-100">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-300" /> Konti Yemewe muri G KORALINK
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
            Murakaza neza, {stats?.user_name}!
          </h1>
          <p className="text-slate-200 text-sm sm:text-base font-medium">
            Ikibina arimo: <span className="font-bold text-amber-300">{stats?.current_ikibina_name || 'Nta kibina urajyamo'}</span>
          </p>

          <div className="pt-4 flex flex-wrap gap-3">
            <button
              onClick={() => navigate('/kwizigama')}
              className="px-5 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold rounded-xl shadow-md transition text-sm flex items-center gap-1.5"
            >
              <PlusCircle className="w-4.5 h-4.5" /> Kwizigama Ubu
            </button>
            <button
              onClick={() => navigate('/kuguza')}
              className="px-5 py-2.5 bg-white/15 hover:bg-white/25 text-white font-bold rounded-xl backdrop-blur-md transition text-sm flex items-center gap-1.5"
            >
              <HandCoins className="w-4.5 h-4.5" /> Saba Inguzanyo
            </button>
            <a
              href="https://wa.me/250784772228?text=Mwaramutse%20ubuyobozi%20bwa%20G%20KORALINK"
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl shadow-md transition text-sm flex items-center gap-1.5"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor" className="text-white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg> Vugana n'Ubuyobozi
            </a>
          </div>
        </div>
      </div>

      {/* Main Financial Cards Grid */}
      <div className="space-y-3">
        <h2 className="text-lg font-bold text-slate-800 tracking-tight">Inshamake y'Umutungo Wanjye</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Card 1: Total Savings */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Amwe mu mafaranga nazigamye
              </span>
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Wallet className="w-5 h-5" />
              </div>
            </div>
            <div className="text-2xl font-black text-slate-900 mb-1">
              {formatFrw(stats?.total_savings || 0)}
            </div>
            {stats?.pending_savings ? (
              <p className="text-xs font-semibold text-amber-600 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" /> {formatFrw(stats.pending_savings)} ategereje kwemezwa
              </p>
            ) : (
              <p className="text-xs font-medium text-emerald-600">Amafaranga yose yemejwe</p>
            )}
          </div>

          {/* Card 2: Earnings / Profit */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Yungutse
              </span>
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <TrendingUp className="w-5 h-5" />
              </div>
            </div>
            <div className="text-2xl font-black text-slate-900 mb-1">
              {formatFrw(stats?.total_profit || 0)}
            </div>
            <p className="text-xs font-medium text-slate-500">Inyungu yakazwe kuri konti</p>
          </div>

          {/* Card 3: Remaining Loan */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Umwenda nsigaje
              </span>
              <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
                <HandCoins className="w-5 h-5" />
              </div>
            </div>
            <div className="text-2xl font-black text-rose-600 mb-1">
              {formatFrw(stats?.remaining_loan_balance || 0)}
            </div>
            <p className="text-xs font-medium text-slate-500">
              Wishyuye: {formatFrw(stats?.total_repaid_loans || 0)}
            </p>
          </div>

          {/* Card 4: Loan Eligibility Limit */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Inguzanyo nemerewe
              </span>
              <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
            </div>
            <div className="text-2xl font-black text-slate-900 mb-1">
              {formatFrw(stats?.approved_loan_limit || 100000)}
            </div>
            <p className="text-xs font-medium text-slate-500">Hakurikijwe amafaranga wazigamye</p>
          </div>

          {/* Card 5: Total Net Worth */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Umutungo wanjye
              </span>
              <div className="w-10 h-10 rounded-xl bg-kora-50 text-kora-600 flex items-center justify-center">
                <ArrowUpRight className="w-5 h-5" />
              </div>
            </div>
            <div className="text-2xl font-black text-kora-700 mb-1">
              {formatFrw((stats?.total_savings || 0) + (stats?.total_profit || 0))}
            </div>
            <p className="text-xs font-medium text-slate-500">Kwizigama + Inyungu yose</p>
          </div>

          {/* Card 6: Pending Loans */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Inguzanyo nategereje
              </span>
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                <Clock className="w-5 h-5" />
              </div>
            </div>
            <div className="text-2xl font-black text-slate-900 mb-1">
              {stats?.pending_loans_count || 0}
            </div>
            <p className="text-xs font-medium text-slate-500">Ubusabe bw'inguzanyo muri komisiyo</p>
          </div>
        </div>
      </div>

      {/* Recent Activities Section */}
      <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-base text-slate-800">Ibyakozwe muri Konti Yawe</h3>
          <button
            onClick={() => navigate('/amateka')}
            className="text-xs font-bold text-kora-600 hover:text-kora-700 flex items-center gap-1"
          >
            Reba byose <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {recentSavings.length === 0 ? (
          <p className="text-xs text-slate-400 py-4 text-center">Nta mafaranga urazigama muri konti yawe.</p>
        ) : (
          <div className="divide-y divide-slate-100">
            {recentSavings.map((s) => (
              <div key={s.id} className="py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                    s.status === 'Byemejwe' ? 'bg-emerald-50 text-emerald-600' :
                    s.status === 'Byanzwe' ? 'bg-rose-50 text-rose-600' : 'bg-amber-50 text-amber-600'
                  }`}>
                    {s.status === 'Byemejwe' ? <CheckCircle2 className="w-4.5 h-4.5" /> :
                     s.status === 'Byanzwe' ? <AlertCircle className="w-4.5 h-4.5" /> : <Clock className="w-4.5 h-4.5" />}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900">
                      Wazigamye {formatFrw(s.amount)}
                    </p>
                    <p className="text-[11px] text-slate-400 font-mono">Ref: {s.payment_reference}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${
                    s.status === 'Byemejwe' ? 'bg-emerald-100 text-emerald-800' :
                    s.status === 'Byanzwe' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {s.status}
                  </span>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    {new Date(s.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
