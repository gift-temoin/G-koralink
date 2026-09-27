import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import {
  Home, Wallet, HandCoins, History, User as UserIcon,
  Bell, LogOut, ShieldAlert, Check, MessageSquare
} from 'lucide-react';

export const UserLayout: React.FC = () => {
  const { user, logout, isAdmin } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const navigate = useNavigate();

  const adminPhoneClean = "250784772228";
  const whatsappUrl = `https://wa.me/${adminPhoneClean}?text=Mwaramutse%20/ Make%20ubuyobozi%20bwa%20G%20KORALINK,%20nshaka%20ibisobanuro.`;

  const navItems = [
    { path: '/ahabanza', label: 'Ahabanza', icon: <Home className="w-5 h-5" /> },
    { path: '/kwizigama', label: 'Kwizigama', icon: <Wallet className="w-5 h-5" /> },
    { path: '/kuguza', label: 'Kuguza', icon: <HandCoins className="w-5 h-5" /> },
    { path: '/amateka', label: 'Amateka', icon: <History className="w-5 h-5" /> },
    { path: '/umwirondoro', label: 'Umwirondoro', icon: <UserIcon className="w-5 h-5" /> },
  ];

  return (
    <div className="min-h-screen bg-slate-50 pb-20 md:pb-8 flex flex-col justify-between">
      <div>
        {/* Top Header */}
        <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <NavLink to="/ahabanza" className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl rwanda-gradient flex items-center justify-center text-white font-black text-xl shadow-md shadow-kora-500/20">
                  G
                </div>
                <div>
                  <span className="font-extrabold text-lg text-slate-900 tracking-tight">G KORALINK</span>
                  <span className="block text-[10px] font-bold text-kora-600 uppercase tracking-wider">IKIBINA & KWIZIGAMA</span>
                </div>
              </NavLink>
            </div>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-1">
              {navItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `px-3.5 py-2 rounded-xl text-sm font-semibold transition flex items-center gap-2 ${
                      isActive
                        ? 'bg-kora-50 text-kora-700 font-bold'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/60'
                    }`
                  }
                >
                  {item.icon}
                  {item.label}
                </NavLink>
              ))}
            </nav>

            {/* Right Header Actions */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* WhatsApp Admin Direct Link */}
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold shadow-sm transition"
                title="Vugana n'Ubuyobozi kuri WhatsApp (+250 784 772 228)"
              >
                <MessageSquare className="w-4 h-4 fill-current text-white" />
                <span className="hidden sm:inline">Vugana n'Ubuyobozi</span>
              </a>

              {isAdmin && (
                <NavLink
                  to="/admin"
                  className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl text-xs font-bold hover:bg-amber-100 transition"
                >
                  <ShieldAlert className="w-4 h-4 text-amber-600" /> Ubuyobozi
                </NavLink>
              )}

              {/* Notification Dropdown Trigger */}
              <div className="relative">
                <button
                  onClick={() => setShowNotifMenu(!showNotifMenu)}
                  className="relative p-2 text-slate-600 hover:text-slate-900 rounded-xl hover:bg-slate-100 transition"
                  aria-label="Ubutumwa"
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-4 h-4 bg-rose-500 text-white font-bold text-[10px] rounded-full flex items-center justify-center animate-pulse">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>

                {/* Notifications Menu */}
                {showNotifMenu && (
                  <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden z-50 animate-scale-up">
                    <div className="flex items-center justify-between p-4 bg-slate-50 border-b border-slate-100">
                      <h4 className="font-bold text-sm text-slate-800">Ubutumwa ({notifications.length})</h4>
                      {unreadCount > 0 && (
                        <button
                          onClick={markAllAsRead}
                          className="text-xs font-semibold text-kora-600 hover:text-kora-700 flex items-center gap-1"
                        >
                          <Check className="w-3.5 h-3.5" /> Bwose bwasomwe
                        </button>
                      )}
                    </div>
                    <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                      {notifications.length === 0 ? (
                        <div className="p-6 text-center text-xs text-slate-400">Nta butumwa bushya ufite.</div>
                      ) : (
                        notifications.slice(0, 10).map((n) => (
                          <div
                            key={n.id}
                            onClick={() => markAsRead(n.id)}
                            className={`p-3.5 cursor-pointer hover:bg-slate-50 transition ${
                              !n.is_read ? 'bg-kora-50/40' : ''
                            }`}
                          >
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-bold text-xs text-slate-900">{n.title}</span>
                              <span className="text-[10px] text-slate-400">
                                {new Date(n.created_at).toLocaleDateString()}
                              </span>
                            </div>
                            <p className="text-xs text-slate-600 leading-relaxed">{n.message}</p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Logout Button */}
              <button
                onClick={() => {
                  logout();
                  navigate('/injira');
                }}
                className="p-2 text-slate-400 hover:text-rose-600 rounded-xl hover:bg-rose-50 transition"
                title="Sohoka"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </header>

        {/* Main Page Content */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Outlet />
        </main>
      </div>

      {/* Footer */}
      <footer className="mt-8 border-t border-slate-200 bg-white py-4 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
          <div>
            <span>G KORALINK &copy; 2026 - Ubuyobozi: <strong className="text-slate-800 font-mono">+250 784 772 228</strong></span>
          </div>
          <div className="text-right text-[11px] font-mono text-slate-400">
            Developed by <span className="font-bold text-slate-600">Gift Temoin</span>
          </div>
        </div>
      </footer>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-2 py-1.5 flex items-center justify-around shadow-lg">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition text-[11px] font-semibold ${
                isActive
                  ? 'text-kora-600 font-bold bg-kora-50'
                  : 'text-slate-500 hover:text-slate-800'
              }`
            }
          >
            {item.icon}
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
};
