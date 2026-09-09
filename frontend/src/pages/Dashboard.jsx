import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../services/api";
import { 
  Bot, Users, MessageSquare, Plus, ArrowRight, Sparkles, 
  Building2, ShoppingBag, GraduationCap, Wrench, Zap, TrendingUp, 
  ShieldCheck, Play, Trash2, Headphones, Activity, Utensils, Home, Truck, RefreshCw
} from "lucide-react";

export default function Dashboard({ stats, agents: initialAgents }) {
  const navigate = useNavigate();
  const [agentsList, setAgentsList] = useState(initialAgents || []);
  const [loadingAgents, setLoadingAgents] = useState(false);

  useEffect(() => {
    loadLiveAgents();
  }, []);

  const loadLiveAgents = async () => {
    try {
      setLoadingAgents(true);
      const data = await api.getAgents();
      setAgentsList(data || []);
    } catch (err) {
      console.error("Error loading live agents:", err);
    } finally {
      setLoadingAgents(false);
    }
  };

  const handleDeleteAgentDirect = async (e, agentId) => {
    e.stopPropagation();
    if (!confirm("Ushbu AI agentni butunlay oʻchirishni tasdiqlaysizmi?")) return;
    try {
      await api.deleteAgent(agentId);
      setAgentsList(prev => prev.filter(a => a.id !== agentId));
    } catch (err) {
      alert(err.message || "Oʻchirishda xatolik");
    }
  };

  const templates = [
    { 
      id: "emergency", 
      title: "103 Tez Tibbiy Yordam & Call Center", 
      icon: Activity, 
      desc: "Shoshilinch triage, manzil aniqlash, birinchi yordam va dispetcherlik", 
      accent: "from-rose-500/20 via-red-500/10 to-transparent",
      badge: "Tez Yordam & 103",
      badgeColor: "text-rose-400 border-rose-500/20 bg-rose-500/10",
      iconColor: "text-rose-400 bg-rose-500/10 border-rose-500/20"
    },
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
      title: "Kiyim & Do‘kon", 
      icon: ShoppingBag, 
      desc: "Katalog, o‘lchamlar, yetkazib berish va tezkor buyurtma", 
      accent: "from-purple-500/20 via-pink-500/10 to-transparent",
      badge: "E-Commerce",
      badgeColor: "text-purple-400 border-purple-500/20 bg-purple-500/10",
      iconColor: "text-purple-400 bg-purple-500/10 border-purple-500/20"
    },
    { 
      id: "education", 
      title: "O‘quv Markazi & IT Kurslar", 
      icon: GraduationCap, 
      desc: "Kurslar, oylik to‘lovlar va bepul sinov darsiga yozish", 
      accent: "from-amber-500/20 via-orange-500/10 to-transparent",
      badge: "Ta‘lim & Akademiya",
      badgeColor: "text-amber-400 border-amber-500/20 bg-amber-500/10",
      iconColor: "text-amber-400 bg-amber-500/10 border-amber-500/20"
    },
    { 
      id: "restaurant", 
      title: "Restoran, Kafe & Yetkazish", 
      icon: Utensils, 
      desc: "Menyu, stol bron qilish, yetkazib berish va to‘lov qabul qilish", 
      accent: "from-orange-500/20 via-amber-500/10 to-transparent",
      badge: "Horeca & Taom",
      badgeColor: "text-orange-400 border-orange-500/20 bg-orange-500/10",
      iconColor: "text-orange-400 bg-orange-500/10 border-orange-500/20"
    },
    { 
      id: "craftsman", 
      title: "Usta Bozor / Servis", 
      icon: Wrench, 
      desc: "Ta‘mirlash, usta chaqirish va bepul diagnostika", 
      accent: "from-emerald-500/20 via-teal-500/10 to-transparent",
      badge: "Texnik Xizmat",
      badgeColor: "text-emerald-400 border-emerald-500/20 bg-emerald-500/10",
      iconColor: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
    },
    { 
      id: "realestate", 
      title: "Ko‘chmas Mulk & Rieltor", 
      icon: Home, 
      desc: "Uylar ijarasi, sotuvdagi kvartiralar va ko‘rikka yozilish", 
      accent: "from-indigo-500/20 via-blue-500/10 to-transparent",
      badge: "Ko‘chmas Mulk",
      badgeColor: "text-indigo-400 border-indigo-500/20 bg-indigo-500/10",
      iconColor: "text-indigo-400 bg-indigo-500/10 border-indigo-500/20"
    },
    { 
      id: "custom", 
      title: "✨ Maxsus / O‘z Sohangiz", 
      icon: Sparkles, 
      desc: "AI yordamida o‘zingiz istagan ixtiyoriy yo‘nalishdagi botni yarating", 
      accent: "from-purple-500/20 via-blue-500/10 to-transparent",
      badge: "Cheksiz Imkoniyat",
      badgeColor: "text-purple-400 border-purple-500/20 bg-purple-500/10",
      iconColor: "text-purple-400 bg-purple-500/10 border-purple-500/20"
    }
  ];

  return (
    <div className="space-y-6 pb-28 text-white">
      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-[#141A26] to-[#0E121B] border border-white/[0.08] p-5 sm:p-6 shadow-[0_8px_32px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.12)]">
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
              Mijozlaringiz bilan 24/7 o‘zbek tilida tabiiy suhbatlashuvchi, buyurtma oluvchi va CRM ga lid yig‘uvchi mustaqil AI operatorlaringiz.
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
              className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-[#07080D]/80 hover:bg-white/[0.06] border border-white/[0.08] text-slate-300 hover:text-white font-medium text-xs sm:text-sm backdrop-blur-md transition-all duration-150"
            >
              <Play className="w-3.5 h-3.5 text-emerald-400" />
              <span>AI Ovoz & Sinov</span>
            </button>
          </div>
        </div>
      </div>

      {/* Quick Industry Templates */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <div>
            <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-300">
              Tayyor Biznes Shablonlari (1-Bosishda Yaratish)
            </h3>
            <p className="text-[11px] text-slate-500">O‘z sohangizga mos yo‘nalishni tanlang yoki noldan yarating</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {templates.map((tpl) => {
            const IconComponent = tpl.icon;
            return (
              <div
                key={tpl.id}
                onClick={() => navigate(`/agents/new?category=${tpl.id}`)}
                className="group relative cursor-pointer overflow-hidden rounded-2xl bg-[#0E121B]/90 hover:bg-[#141A26] border border-white/[0.07] hover:border-blue-500/40 p-4 transition-all duration-200 hover:-translate-y-1 shadow-[0_4px_20px_rgba(0,0,0,0.4)] flex flex-col justify-between"
              >
                <div className={`pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-gradient-to-br ${tpl.accent} blur-2xl group-hover:scale-150 transition-all duration-300`} />
                
                <div className="space-y-2.5 relative z-10">
                  <div className="flex items-center justify-between">
                    <div className={`p-2.5 rounded-xl border ${tpl.iconColor} group-hover:scale-110 transition-transform duration-200`}>
                      <IconComponent className="w-4 h-4" />
                    </div>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${tpl.badgeColor}`}>
                      {tpl.badge}
                    </span>
                  </div>

                  <div>
                    <h4 className="text-sm font-bold text-white group-hover:text-blue-300 transition-colors">
                      {tpl.title}
                    </h4>
                    <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                      {tpl.desc}
                    </p>
                  </div>
                </div>

                <div className="pt-3 border-t border-white/[0.05] flex items-center justify-between text-xs font-semibold text-blue-400 group-hover:text-blue-300 mt-2">
                  <span>Shablonni Ishlatish</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Active User Agents Section */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-white tracking-wide">
              Mening AI Agentlarim ({agentsList.length})
            </h3>
            <button
              onClick={loadLiveAgents}
              className="p-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-white/50 hover:text-white transition"
              title="Yangilash"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loadingAgents ? 'animate-spin' : ''}`} />
            </button>
          </div>
          <button
            onClick={() => navigate("/agents/new")}
            className="text-xs font-semibold text-blue-400 hover:text-blue-300 flex items-center space-x-1 transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Yangi qo‘shish</span>
          </button>
        </div>

        {loadingAgents && agentsList.length === 0 ? (
          <div className="p-8 text-center text-xs text-white/40">Agentlar ro‘yxati yuklanmoqda...</div>
        ) : agentsList.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/[0.1] bg-[#0E121B]/40 p-8 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center mx-auto">
              <Bot className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-white">Sizda hali faol AI agentlar yo‘q</h4>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Yuqoridagi tayyor shablonlardan birini tanlang yoki o‘zingiz noldan yangi bot yarating.
              </p>
            </div>
            <button
              onClick={() => navigate("/agents/new")}
              className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition shadow-md"
            >
              <Plus className="w-4 h-4" />
              <span>Birinchi Agentni Yaratish</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {agentsList.map((agent) => (
              <div
                key={agent.id}
                onClick={() => navigate(`/agents/${agent.id}`)}
                className="group relative cursor-pointer rounded-2xl bg-[#0E121B]/90 hover:bg-[#141A26] border border-white/[0.08] hover:border-blue-500/40 p-4 transition-all duration-200 shadow-md space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400 font-bold text-sm shadow-inner">
                      {agent.name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white group-hover:text-blue-300 transition">
                        {agent.name}
                      </h4>
                      <p className="text-[11px] text-slate-400 font-mono">
                        {agent.bot_token_masked || (agent.bot_token ? `${agent.bot_token.slice(0, 8)}...` : "Token kiritilmagan")}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      Faol
                    </span>
                    <button
                      onClick={(e) => handleDeleteAgentDirect(e, agent.id)}
                      className="p-1.5 rounded-lg bg-white/[0.04] hover:bg-red-500/20 text-white/40 hover:text-red-400 border border-white/[0.06] transition"
                      title="Agentni o'chirish"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/[0.05] text-xs">
                  <div 
                    onClick={(e) => { e.stopPropagation(); navigate(`/agents/${agent.id}/knowledge`); }}
                    className="p-2 rounded-xl bg-[#07080D] border border-white/[0.04] hover:border-blue-500/30 transition text-slate-300"
                  >
                    <span className="text-[10px] text-slate-500 block">Bilimlar:</span>
                    <span className="font-bold text-white">{agent.knowledge_count || 0} ta ma'lumot</span>
                  </div>
                  <div 
                    onClick={(e) => { e.stopPropagation(); navigate("/leads"); }}
                    className="p-2 rounded-xl bg-[#07080D] border border-white/[0.04] hover:border-emerald-500/30 transition text-slate-300"
                  >
                    <span className="text-[10px] text-slate-500 block">Lidlar (CRM):</span>
                    <span className="font-bold text-emerald-400">{agent.leads_count || 0} ta lid</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
