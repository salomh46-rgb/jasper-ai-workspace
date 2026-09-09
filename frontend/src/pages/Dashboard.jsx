import React from "react";
import { useNavigate } from "react-router-dom";
import { 
  Bot, Users, MessageSquare, Plus, ArrowRight, Sparkles, 
  Building2, ShoppingBag, GraduationCap, Wrench, Zap, TrendingUp, ShieldCheck, Play, Trash2, Headphones 
} from "lucide-react";

export default function Dashboard({ stats, agents, onSelectAgent }) {

  const handleDeleteAgentDirect = async (e, agentId) => {
    e.stopPropagation();
    if (!confirm("Ushbu AI agentni oʻchirishni tasdiqlaysizmi?")) return;
    try {
      await api.deleteAgent(agentId);
      window.location.reload();
    } catch (err) {
      alert(err.message || "Oʻchirishda xatolik");
    }
  };

  const navigate = useNavigate();

  const templates = [
    { 
      id: "clinic", 
      title: "Stomatologiya & Klinika", 
      icon: Building2, 
      desc: "Qabulga yozish, narxlar jadvali va shifokor maslahati", 
      accent: "from-cyan-500/20 via-blue-500/10 to-transparent",
      badge: "Tibbiyot & Servis",
      badgeColor: "text-cyan-400 border-cyan-500/20 bg-cyan-500/10",
      iconColor: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20"
    },
    { 
      id: "shop", 
      title: "Kiyim & Do\'kon", 
      icon: ShoppingBag, 
      desc: "Katalog, o\'lchamlar, yetkazib berish va tezkor buyurtma", 
      accent: "from-purple-500/20 via-pink-500/10 to-transparent",
      badge: "E-Commerce",
      badgeColor: "text-purple-400 border-purple-500/20 bg-purple-500/10",
      iconColor: "text-purple-400 bg-purple-500/10 border-purple-500/20"
    },
    { 
      id: "education", 
      title: "O\'quv Markazi", 
      icon: GraduationCap, 
      desc: "Kurslar, oylik to\'lovlar va bepul sinov darsiga yozish", 
      accent: "from-amber-500/20 via-orange-500/10 to-transparent",
      badge: "Ta\'lim & Akademiya",
      badgeColor: "text-amber-400 border-amber-500/20 bg-amber-500/10",
      iconColor: "text-amber-400 bg-amber-500/10 border-amber-500/20"
    },
    { 
      id: "craftsman", 
      title: "Usta Bozor / Servis", 
      icon: Wrench, 
      desc: "Ta\'mirlash, usta chaqirish va bepul diagnostika", 
      accent: "from-emerald-500/20 via-teal-500/10 to-transparent",
      badge: "Texnik Xizmat",
      badgeColor: "text-emerald-400 border-emerald-500/20 bg-emerald-500/10",
      iconColor: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
    }
  ];

  return (
    <div className="space-y-6 pb-28">
      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-[#141A26] to-[#0E121B] border border-white/[0.08] p-5 sm:p-6 shadow-[0_8px_32px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.12)]">
        {/* Subtle top glow bar */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-blue-500/40 to-transparent" />
        
        <div className="relative z-10 space-y-3">
          <div className="flex items-center justify-between">
            <div className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-blue-500/10 border border-blue-500/25 text-blue-400 text-xs font-semibold tracking-wide">
              <Sparkles className="w-3.5 h-3.5 animate-pulse" />
              <span>Google Gemini 3.6 Flash Bilan Kuchaytirilgan</span>
            </div>
            <div className="hidden sm:flex items-center space-x-1.5 text-xs text-slate-400">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Multi-Tenant Himoyalangan</span>
            </div>
          </div>

          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
              Telegram Biznesingiz Uchun Aqlli AI Agentlar
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-xl leading-relaxed">
              Mijozlaringiz bilan 24/7 oʻzbek tilida tabiiy suhbatlashuvchi, buyurtma oluvchi va CRM ga lid yigʻuvchi mustaqil AI operatorlaringiz.
            </p>
          </div>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              onClick={() => navigate("/agents/new")}
              className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-gradient-to-b from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500 text-white font-semibold text-xs sm:text-sm shadow-[0_0_20px_-3px_rgba(59,130,246,0.5),inset_0_1px_0_rgba(255,255,255,0.3)] active:scale-95 transition-all duration-150"
            >
              <Plus className="w-4 h-4" />
              <span>Yangi AI Agent Yaratish</span>
            </button>
            <button
              onClick={() => navigate("/tester")}
              className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] active:scale-95 border border-white/[0.08] text-slate-200 hover:text-white text-xs sm:text-sm font-medium transition-all duration-150"
            >
              <Play className="w-3.5 h-3.5 text-blue-400 fill-blue-400/20" />
              <span>AI Jonli Sinov</span>
            </button>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-3 gap-3">
        {/* Metric 1: Agents */}
        <div className="relative overflow-hidden rounded-2xl bg-[#0E121B]/80 backdrop-blur-xl border border-white/[0.07] p-4 flex flex-col justify-between shadow-[0_4px_20px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.06)] group hover:border-white/[0.14] transition-all">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Agentlar</span>
            <div className="w-7 h-7 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <Bot className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-white font-mono tabular-nums tracking-tight">
            {stats?.total_agents || 0}
          </div>
          <div className="flex items-center space-x-1 text-[11px] text-emerald-400 font-medium mt-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>Faol holatda</span>
          </div>
        </div>

        {/* Metric 2: Leads */}
        <div 
          onClick={() => navigate("/leads")}
          className="relative overflow-hidden rounded-2xl bg-[#0E121B]/80 backdrop-blur-xl border border-white/[0.07] p-4 flex flex-col justify-between shadow-[0_4px_20px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.06)] group hover:border-emerald-500/40 cursor-pointer transition-all"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-emerald-400">Yangi Lidlar</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Users className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-emerald-400 font-mono tabular-nums tracking-tight">
            {stats?.new_leads || 0}
          </div>
          <div className="flex items-center space-x-1 text-[11px] text-slate-400 font-medium mt-2">
            <TrendingUp className="w-3 h-3 text-emerald-400" />
            <span>Jami: {stats?.total_leads || 0} ta</span>
          </div>
        </div>

        {/* Metric 3: Conversations */}
        <div 
          onClick={() => navigate("/chat")}
          className="relative overflow-hidden rounded-2xl bg-[#0E121B]/80 backdrop-blur-xl border border-white/[0.07] p-4 flex flex-col justify-between shadow-[0_4px_20px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.06)] group hover:border-purple-500/40 cursor-pointer transition-all">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Muloqotlar</span>
            <div className="w-7 h-7 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
              <MessageSquare className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-white font-mono tabular-nums tracking-tight">
            {stats?.total_conversations || 0}
          </div>
          <div className="flex items-center space-x-1 text-[11px] text-purple-300 font-medium mt-2">
            <Zap className="w-3 h-3 text-purple-400" />
            <span>100% Avtomatik</span>
          </div>
        </div>
      </div>

      {/* Tayyor Soha Shablonlari */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-sm sm:text-base text-white tracking-tight">Tayyor Soha Shablonlari</h3>
            <p className="text-[11px] text-slate-400">1 daqiqada sozlangan AI Agentni ishga tushiring</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {templates.map((tpl) => {
            const Icon = tpl.icon;
            return (
              <div
                key={tpl.id}
                onClick={() => navigate("/agents/new?category=" + tpl.id)}
                className="group relative overflow-hidden rounded-2xl bg-[#0E121B]/90 backdrop-blur-xl border border-white/[0.07] hover:border-white/[0.15] p-4 cursor-pointer transition-all duration-200 hover:-translate-y-0.5 shadow-[0_4px_20px_rgba(0,0,0,0.3)]"
              >
                {/* Gradient ambient glow in corner */}
                <div className={"pointer-events-none absolute -right-10 -bottom-10 w-32 h-32 bg-gradient-to-tl " + tpl.accent + " rounded-full blur-2xl opacity-40 group-hover:opacity-80 transition duration-300"} />

                <div className="flex items-start justify-between">
                  <div className={"w-9 h-9 rounded-xl border flex items-center justify-center shadow-sm " + tpl.iconColor}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className={"text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full border " + tpl.badgeColor}>
                    {tpl.badge}
                  </span>
                </div>

                <div className="mt-3">
                  <h4 className="font-bold text-sm text-white group-hover:text-blue-400 transition-colors">
                    {tpl.title}
                  </h4>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed line-clamp-2">
                    {tpl.desc}
                  </p>
                </div>

                <div className="mt-3 pt-2.5 border-t border-white/[0.05] flex items-center justify-between text-xs font-semibold text-blue-400">
                  <span>Shablonni Ishlatish</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1.5 transition-transform duration-200" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Faol Agentlar Ro'yxati */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-sm sm:text-base text-white tracking-tight">Mening AI Agentlarim</h3>
          <button 
            onClick={() => navigate("/agents/new")}
            className="text-xs font-semibold text-blue-400 hover:text-blue-300 flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Yangi qoʻshish</span>
          </button>
        </div>

        {agents && agents.length > 0 ? (
          <div className="space-y-2.5">
            {agents.map((agent) => (
              <div
                key={agent.id}
                onClick={() => {
                  if (onSelectAgent) onSelectAgent(agent);
                  navigate("/agents/" + agent.id);
                }}
                className="group relative overflow-hidden rounded-2xl bg-[#0E121B]/90 backdrop-blur-xl border border-white/[0.07] hover:border-blue-500/30 p-4 flex items-center justify-between cursor-pointer transition-all duration-150 hover:-translate-y-0.5 shadow-sm"
              >
                <div className="flex items-center space-x-3.5">
                  <div className="w-11 h-11 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shadow-[0_0_12px_rgba(59,130,246,0.15)]">
                    <Bot className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-white group-hover:text-blue-400 transition-colors">
                      {agent.name}
                    </h4>
                    <div className="flex items-center space-x-2 text-[11px] text-slate-400 mt-0.5">
                      <span>{agent.company_name || "Kompaniya"}</span>
                      <span>•</span>
                      <span className="text-slate-300 font-mono">{agent.knowledge_count} ta bilim</span>
                      <span>•</span>
                      <span className="text-emerald-400 font-mono">{agent.leads_count} ta lid</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span>Onlayn</span>
                  </span>
                  <button
                    type="button"
                    onClick={(e) => handleDeleteAgentDirect(e, agent.id)}
                    className="p-2 rounded-xl bg-white/[0.02] hover:bg-rose-500/15 text-slate-400 hover:text-rose-400 transition-colors"
                    title="Agentni o'chirish"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                  <div className="p-1.5 rounded-lg bg-white/[0.03] group-hover:bg-blue-500/10 text-slate-400 group-hover:text-blue-400 transition-colors">
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="relative overflow-hidden rounded-2xl bg-[#0E121B]/70 border border-dashed border-white/[0.1] p-8 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-slate-400 mx-auto">
              <Bot className="w-6 h-6 opacity-60" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-200">Sizda hali faol AI agentlar yoʻq</p>
              <p className="text-xs text-slate-400 mt-0.5 max-w-sm mx-auto">
                Yuqoridagi tayyor shablonlardan birini tanlang yoki oʻzingiz noldan yangi bot yarating.
              </p>
            </div>
            <button
              onClick={() => navigate("/agents/new")}
              className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md shadow-blue-600/30 transition-all active:scale-95"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Birinchi Agentni Yaratish</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
