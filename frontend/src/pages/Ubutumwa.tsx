import React from 'react';
import { useNotifications } from '../context/NotificationContext';
import { EmptyState } from '../components/EmptyState';
import { Bell, Check, CheckCircle2 } from 'lucide-react';

export const Ubutumwa: React.FC = () => {
  const { notifications, markAsRead, markAllAsRead } = useNotifications();

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-kora-50 rounded-full text-xs font-bold text-kora-700 mb-2">
            <Bell className="w-3.5 h-3.5" /> Ubutumwa
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Ubutumwa Bwanjye
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Reba matangazo n'ubutumwa buzana n'ibyakozwe muri konti yawe.
          </p>
        </div>

        {notifications.some((n) => !n.is_read) && (
          <button
            onClick={markAllAsRead}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl transition flex items-center gap-1.5"
          >
            <Check className="w-4 h-4 text-kora-600" /> Bwose bwasomwe
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <EmptyState title="Nta butumwa bushya ufite." description="G KORALINK izakugezaho ubutumwa bwose mu gihe kigezweho." />
      ) : (
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden divide-y divide-slate-100">
          {notifications.map((n) => (
            <div
              key={n.id}
              onClick={() => markAsRead(n.id)}
              className={`p-5 sm:p-6 transition cursor-pointer hover:bg-slate-50 flex items-start gap-4 ${
                !n.is_read ? 'bg-kora-50/30' : ''
              }`}
            >
              <div
                className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
                  !n.is_read ? 'bg-kora-500 text-white shadow-md shadow-kora-500/20' : 'bg-slate-100 text-slate-400'
                }`}
              >
                <Bell className="w-5 h-5" />
              </div>
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-extrabold text-slate-900">{n.title}</h3>
                  <span className="text-[11px] text-slate-400">
                    {new Date(n.created_at).toLocaleString()}
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">{n.message}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
