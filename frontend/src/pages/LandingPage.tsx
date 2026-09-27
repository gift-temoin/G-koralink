import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Wallet, HandCoins, ShieldCheck, Phone, ArrowRight, CheckCircle2,
  UsersRound, MessageSquare, TrendingUp, Smartphone, Award, ExternalLink
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const adminPhone = "+250 784 772 228";
  const adminPhoneClean = "250784772228";
  const whatsappUrl = `https://wa.me/${adminPhoneClean}?text=Mwaramutse%20/ Make%20ubuyobozi%20bwa%20G%20KORALINK,%20nshaka%20ibisobanuro.`;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-kora-500 selection:text-white">
      {/* Top Header Navbar */}
      <header className="sticky top-0 z-50 bg-slate-950/90 backdrop-blur-md border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl rwanda-gradient flex items-center justify-center text-white font-black text-2xl shadow-xl shadow-kora-500/20">
              G
            </div>
            <div>
              <span className="font-black text-xl text-white tracking-tight block">G KORALINK</span>
              <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest block">
                IKIBINA NO KWIZIGAMA
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/injira"
              className="px-5 py-2.5 text-sm font-bold text-slate-300 hover:text-white hover:bg-slate-900 rounded-xl transition"
            >
              Injira
            </Link>
            <Link
              to="/kwiyandikisha"
              className="px-5 py-2.5 text-sm font-black bg-kora-600 hover:bg-kora-500 text-white rounded-xl shadow-lg shadow-kora-500/20 active:scale-95 transition"
            >
              Kwiyandikisha
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-12 pb-20 md:pt-20 md:pb-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto overflow-hidden w-full">
        {/* Decorative Gradients */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-kora-500/10 rounded-full blur-[140px] pointer-events-none"></div>
        <div className="absolute top-1/3 right-10 w-96 h-96 bg-amber-500/10 rounded-full blur-[120px] pointer-events-none"></div>

        <div className="text-center max-w-4xl mx-auto space-y-6 relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 border border-slate-800 rounded-full text-xs font-bold text-amber-400 shadow-md">
            <ShieldCheck className="w-4 h-4 text-emerald-400" /> Urubuga rwa Mbere rwo Kwizigama muri Ikibina mu Rwanda
          </div>

          <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight leading-[1.15]">
            Kwizigama no Kuguza mu Buryo <span className="bg-gradient-to-r from-emerald-400 via-kora-400 to-amber-400 bg-clip-text text-transparent">Bworoshye n'Bwizewe.</span>
          </h1>

          <p className="text-base sm:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed font-normal">
            G KORALINK iguha ubushobozi bwo kwinjira muri ikibina, kwizigama buri cyumweru ukoresheje MTN Mobile Money, no gusaba inguzanyo mu buryo bwihuse n'inyungu zibereye umunyamuryango.
          </p>

          <div className="pt-6 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => navigate('/kwiyandikisha')}
              className="w-full sm:w-auto px-8 py-4 bg-kora-600 hover:bg-kora-500 text-white font-black text-base rounded-2xl shadow-xl shadow-kora-500/25 active:scale-95 transition flex items-center justify-center gap-2"
            >
              Tangira Kwizigama Ubu <ArrowRight className="w-5 h-5" />
            </button>
            <button
              onClick={() => navigate('/injira')}
              className="w-full sm:w-auto px-8 py-4 bg-slate-900 hover:bg-slate-800 text-white font-bold text-base rounded-2xl border border-slate-800 transition flex items-center justify-center gap-2"
            >
              Injira muri Konti Yawe
            </button>
          </div>

          {/* Quick Metrics */}
          <div className="pt-12 grid grid-cols-2 sm:grid-cols-4 gap-4 text-left">
            <div className="p-4 bg-slate-900/60 rounded-2xl border border-slate-800/80">
              <span className="block text-2xl font-black text-emerald-400">100%</span>
              <span className="text-xs text-slate-400 font-semibold">Kinyarwanda cyo mu mutima</span>
            </div>
            <div className="p-4 bg-slate-900/60 rounded-2xl border border-slate-800/80">
              <span className="block text-2xl font-black text-amber-400">MTN MoMo</span>
              <span className="text-xs text-slate-400 font-semibold">Code: *182*8*1*412512#</span>
            </div>
            <div className="p-4 bg-slate-900/60 rounded-2xl border border-slate-800/80">
              <span className="block text-2xl font-black text-sky-400">Ikibina</span>
              <span className="text-xs text-slate-400 font-semibold">Ikora buri cyumweru/ukwezi</span>
            </div>
            <div className="p-4 bg-slate-900/60 rounded-2xl border border-slate-800/80">
              <span className="block text-2xl font-black text-purple-400">Inguzanyo</span>
              <span className="text-xs text-slate-400 font-semibold">Kuguza mu buryo bwihuse</span>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-16 bg-slate-900/40 border-y border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-bold text-kora-400 uppercase tracking-widest">Serivisi Zacu</span>
            <h2 className="text-3xl sm:text-4xl font-black text-white">Ni kuki ukwiye gukoresha G KORALINK?</h2>
            <p className="text-sm text-slate-400">Ibintu byose wageraho ukoresheje urubuga rwacu:</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-8 bg-slate-950 rounded-3xl border border-slate-800 space-y-4 hover:border-kora-500/50 transition">
              <div className="w-12 h-12 rounded-2xl bg-kora-500/10 text-kora-400 flex items-center justify-center font-black">
                <Wallet className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white">Kwizigama muri Ikibina</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Hitamo ikibina kibanoreshye, uzigame buri cyumweru cyangwa buri kwezi ukoresheje MTN Mobile Money nta nkomyi.
              </p>
            </div>

            <div className="p-8 bg-slate-950 rounded-3xl border border-slate-800 space-y-4 hover:border-amber-500/50 transition">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center font-black">
                <HandCoins className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white">Kuguza ku Nyungu Nziza</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Saba inguzanyo mu buryo bworoshye hakurikijwe amafaranga wazigamye, maze wemezwe n'ubuyobozi ku gihe.
              </p>
            </div>

            <div className="p-8 bg-slate-950 rounded-3xl border border-slate-800 space-y-4 hover:border-sky-500/50 transition">
              <div className="w-12 h-12 rounded-2xl bg-sky-500/10 text-sky-400 flex items-center justify-center font-black">
                <Smartphone className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white">MTN MoMo Integration</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Ubwishyu bukorwa ukoresheje USSD <strong className="text-amber-400">*182*8*1*412512#</strong> hamwe n'izina <strong className="text-amber-400">ENOCK</strong>.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Admin Contact / Trust Showcase Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 sm:p-12 shadow-2xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-4 flex justify-center">
            <div className="relative">
              <div className="w-48 h-48 sm:w-56 sm:h-56 rounded-3xl overflow-hidden border-4 border-amber-500/30 shadow-2xl">
                <img
                  src="/admin_photo.png"
                  alt="ENOCK IRADUKUNDA - Ubuyobozi"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-3 -right-3 bg-emerald-500 text-slate-950 font-extrabold text-[11px] px-3 py-1 rounded-full shadow-lg flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Yemejwe
              </div>
            </div>
          </div>

          <div className="lg:col-span-8 space-y-5 text-center lg:text-left">
            <span className="text-xs font-bold text-amber-400 uppercase tracking-widest">Ubuyobozi Bukuru</span>
            <h2 className="text-3xl sm:text-4xl font-black text-white">ENOCK IRADUKUNDA</h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-xl">
              Ubuyobozi bwa G KORALINK buhora bwiteguye gukorera abanyamuryango, kubasobanurira amabwiriza y'Ikibina, no kubafasha mu bwishyu n'inguzanyo.
            </p>

            <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 inline-flex flex-col sm:flex-row items-center gap-4 text-left">
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Nimero y'Ubuyobozi</span>
                <span className="text-lg font-black text-amber-400 font-mono">{adminPhone}</span>
              </div>
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs flex items-center gap-2 shadow-lg transition"
              >
                <MessageSquare className="w-4 h-4 fill-current text-white" /> Vugana n'Ubuyobozi kuri WhatsApp
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-900 bg-slate-950 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg rwanda-gradient flex items-center justify-center text-white font-bold text-xs">
              G
            </div>
            <span className="font-bold text-slate-300">G KORALINK &copy; 2026</span>
            <span>- Nimero y'Ubuyobozi: <strong className="text-amber-400 font-mono">{adminPhone}</strong></span>
          </div>

          <div className="text-right text-[11px] text-slate-500 font-mono">
            Developed by <span className="font-bold text-slate-400">Gift Temoin</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
