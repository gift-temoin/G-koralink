import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard, Users, UsersRound, PiggyBank, FileText,
  Coins, BarChart3, ShieldCheck, LogOut, Menu, X, ArrowLeft
} from 'lucide-react';

export const AdminLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const adminNavItems = [
    { path: '/admin', label: 'Ahabanza', icon: <LayoutDashboard className="w-5 h-5" /> },
    { path: '/admin/abakoresha', label: 'Abakoresha', icon: <Users className="w-5 h-5" /> },
    { path: '/admin/ibibina', label: 'Ibibina', icon: <UsersRound className="w-5 h-5" /> },
    { path: '/admin/kwizigama', label: 'Kwizigama', icon: <PiggyBank className="w-5 h-5" /> },
    { path: '/admin/kuguza', label: 'Kuguza', icon: <FileText className="w-5 h-5" /> },
    { path: '/admin/inguzanyo', label: 'Inguzanyo', icon: <Coins className="w-5 h-5" /> },
    { path: '/admin/raporo', label: 'Raporo', icon: <BarChart3 className="w-5 h-5" /> },
    { path: '/admin/audit', label: 'Audit Logs', icon: <ShieldCheck className="w-5 h-5" /> },
  ];

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col md:flex-row">
      {/* Mobile Header */}
      <header className="md:hidden sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md px-4 py-3 flex items-center justify-between border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center font-black text-slate-950">
            G
          </div>
          <span className="font-extrabold text-sm text-white tracking-wider">UBUYOBOZI BWA G KORALINK</span>
        </div>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 text-slate-300 hover:text-white rounded-lg bg-slate-800"
        >
          {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </header>

      {/* Sidebar for Desktop & Mobile Overlay */}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-50 w-64 bg-slate-950 border-r border-slate-800 flex flex-col justify-between transform transition-transform duration-300 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div>
          {/* Logo Branding */}
          <div className="p-6 border-b border-slate-800/80">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-black text-xl shadow-lg shadow-amber-500/20">
                G
              </div>
              <div>
                <h1 className="font-extrabold text-base text-white tracking-tight">G KORALINK</h1>
                <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest block">
                  Imiyoborere
                </span>
              </div>
            </div>
          </div>

          {/* Nav Items */}
          <nav className="p-4 space-y-1">
            {adminNavItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/admin'}
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition ${
                    isActive
                      ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/10'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                  }`
                }
              >
                {item.icon}
                <span>{item.label}</span>
              </NavLink>
            ))}
          </nav>
        </div>

        {/* Bottom Profile & Actions */}
        <div className="p-4 border-t border-slate-800/80 space-y-3">
          <button
            onClick={() => navigate('/ahabanza')}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl transition"
          >
            <ArrowLeft className="w-4 h-4" /> Subira Ahabanza Hanjye
          </button>

          <div className="flex items-center justify-between p-2.5 bg-slate-900/80 rounded-xl border border-slate-800">
            <div className="truncate">
              <p className="text-xs font-bold text-white truncate">{user?.full_name}</p>
              <p className="text-[10px] text-amber-400 font-mono">{user?.phone_number}</p>
            </div>
            <button
              onClick={() => {
                logout();
                navigate('/injira');
              }}
              className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-slate-800 transition"
              title="Sohoka"
            >
              <LogOut className="w-4.5 h-4.5" />
            </button>
          </div>
        </div>
      </aside>

      {/* Backdrop overlay for mobile */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="md:hidden fixed inset-0 bg-black/60 backdrop-blur-xs z-40"
        ></div>
      )}

      {/* Main Admin Body */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto overflow-y-auto flex flex-col justify-between">
        <Outlet />
        <footer className="mt-8 pt-4 border-t border-slate-800 text-[11px] font-mono text-slate-500 flex items-center justify-between">
          <span>G KORALINK Administration System &copy; 2026</span>
          <span>Developed by <strong className="text-slate-400">Enock Irankunda</strong></span>
        </footer>
      </main>
    </div>
  );
};
