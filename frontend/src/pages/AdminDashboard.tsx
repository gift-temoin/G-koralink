import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { AdminDashboardStats } from '../types';
import { CardSkeleton } from '../components/Skeleton';
import {
  Users, UsersRound, PiggyBank, HandCoins, Clock, CheckCircle2,
  TrendingUp, BarChart3, AlertCircle, ShieldAlert
} from 'lucide-react';
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, BarChart, Bar, Legend
} from 'recharts';

export const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<AdminDashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAdminStats = async () => {
      try {
        setLoading(true);
        const res = await api.get('/admin/dashboard');
        setStats(res.data);
      } catch (err) {
        console.error('Failed to fetch admin stats:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAdminStats();
  }, []);

  const formatFrw = (val: number) => `${val.toLocaleString()} Frw`;

  // Sample analytics chart data derived for trends
  const trendData = [
    { month: 'Gashyantare', Kwizigama: 450000, Inguzanyo: 200000, Repayments: 120000 },
    { month: 'Werurwe', Kwizigama: 620000, Inguzanyo: 350000, Repayments: 210000 },
    { month: 'Mata', Kwizigama: 780000, Inguzanyo: 400000, Repayments: 300000 },
    { month: 'Gicurasi', Kwizigama: 950000, Inguzanyo: 500000, Repayments: 420000 },
    { month: 'Kamena', Kwizigama: 1200000, Inguzanyo: 650000, Repayments: 550000 },
    { month: 'Uku Kwezi', Kwizigama: stats?.total_savings_approved || 1500000, Inguzanyo: stats?.total_outstanding_loans || 800000, Repayments: stats?.total_repaid_loans || 600000 },
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-slate-800 rounded w-48 animate-pulse"></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome Admin Banner */}
      <div className="bg-slate-950 p-6 sm:p-8 rounded-3xl border border-amber-500/30 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-2xl relative overflow-hidden">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden border-2 border-amber-400 shadow-xl shrink-0">
            <img src="/admin_photo.png" alt="Admin" className="w-full h-full object-cover" />
          </div>
          <div>
            <span className="text-xs font-bold text-amber-400 uppercase tracking-widest flex items-center gap-1.5 mb-1">
              <ShieldAlert className="w-4 h-4" /> G KORALINK Administration
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Murakaza neza Ubuyobozi: {user?.full_name || 'ENOCK IRADUKUNDA'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 font-mono">
              Nimero y'Ubuyobozi: <strong className="text-amber-400">+250 784 772 228</strong>
            </p>
          </div>
        </div>
      </div>

      {/* Grid of 9 Admin Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Card 1: Abakoresha bose */}
        <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Abakoresha bose</span>
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-white">{stats?.total_users || 0}</div>
          <p className="text-xs text-slate-400">Abanyamuryango biyandikishije</p>
        </div>

        {/* Card 2: Abakoresha bashya */}
        <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Abakoresha bashya</span>
            <div className="w-10 h-10 rounded-2xl bg-sky-500/10 text-sky-400 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-sky-400">+{stats?.new_users_this_month || 0}</div>
          <p className="text-xs text-slate-400">Muri uyu munsi n'ukwezi</p>
        </div>

        {/* Card 3: Ibibina biri gukora */}
        <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Ibibina biri gukora</span>
            <div className="w-10 h-10 rounded-2xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
              <UsersRound className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-purple-400">{stats?.active_ikibina_count || 0}</div>
          <p className="text-xs text-slate-400">Ibibina bifunguye</p>
        </div>

        {/* Card 4: Amafaranga yose yazigamwe */}
        <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Amafaranga yose yazigamwe</span>
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <PiggyBank className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-400">{formatFrw(stats?.total_savings_approved || 0)}</div>
          <p className="text-xs text-slate-400">Byemejwe n'ubuyobozi</p>
        </div>

        {/* Card 5: Amafaranga ategereje kwemezwa */}
        <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Kwizigama bitegereje</span>
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-amber-400">{formatFrw(stats?.pending_savings_amount || 0)}</div>
          <p className="text-xs text-slate-400">Bitegereje gushimangirwa</p>
        </div>

        {/* Card 6: Inguzanyo zitegereje */}
        <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Inguzanyo zitegereje</span>
            <div className="w-10 h-10 rounded-2xl bg-rose-500/10 text-rose-400 flex items-center justify-center">
              <HandCoins className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-rose-400">{stats?.pending_loans_count || 0}</div>
          <p className="text-xs text-slate-400">Ubusabe bw'inguzanyo bubanza</p>
        </div>

        {/* Card 7: Inguzanyo zemejwe */}
        <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Inguzanyo zemejwe</span>
            <div className="w-10 h-10 rounded-2xl bg-teal-500/10 text-teal-400 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-teal-400">{stats?.approved_loans_count || 0}</div>
          <p className="text-xs text-slate-400">Inguzanyo zatanzwe</p>
        </div>

        {/* Card 8: Amafaranga atarishyurwa */}
        <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Inguzanyo zitari zishyurwa</span>
            <div className="w-10 h-10 rounded-2xl bg-orange-500/10 text-orange-400 flex items-center justify-center">
              <AlertCircle className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-orange-400">{formatFrw(stats?.total_outstanding_loans || 0)}</div>
          <p className="text-xs text-slate-400">Umwenda wose uri mu banyamuryango</p>
        </div>

        {/* Card 9: Amafaranga amaze kwishyurwa */}
        <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Amafaranga amaze kwishyurwa</span>
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-indigo-400">{formatFrw(stats?.total_repaid_loans || 0)}</div>
          <p className="text-xs text-slate-400">Inguzanyo zasubijwe mu kigega</p>
        </div>
      </div>

      {/* Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Kwizigama Uko Byiyongera */}
        <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-base text-white">Kwizigama Uko Byiyongera</h3>
            <span className="text-xs text-emerald-400 font-mono font-bold">RWF Trends</span>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="koraGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00a86b" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#00a86b" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="month" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} tickFormatter={(v) => `${v/1000}k`} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#fff', borderRadius: '12px' }}
                  formatter={(val: number) => [`${val.toLocaleString()} Frw`, 'Kwizigama']}
                />
                <Area type="monotone" dataKey="Kwizigama" stroke="#00a86b" strokeWidth={3} fillOpacity={1} fill="url(#koraGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Inguzanyo Zatanzwe vs Repayments */}
        <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-base text-white">Inguzanyo Zatanzwe vs Zasubijwe</h3>
            <span className="text-xs text-amber-400 font-mono font-bold">Loans vs Repayments</span>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="month" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} tickFormatter={(v) => `${v/1000}k`} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#fff', borderRadius: '12px' }}
                  formatter={(val: number) => `${val.toLocaleString()} Frw`}
                />
                <Legend wrapperStyle={{ paddingTop: '10px' }} />
                <Bar dataKey="Inguzanyo" fill="#f59e0b" name="Inguzanyo" radius={[6, 6, 0, 0]} />
                <Bar dataKey="Repayments" fill="#38bdf8" name="Kwishyura" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
