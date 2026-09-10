import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../services/api";
import { useLanguage } from "../i18n/LanguageContext";
import { QuantumCubeIcon, SpinningGearIcon, LightningPulseIcon, IsometricLayersIcon, NeuralSynapseIcon, RadarCoreIcon } from "../components/MicroIcons";
import { 
  Bot, Users, MessageSquare, Plus, ArrowRight, Sparkles, 
  Building2, ShoppingBag, GraduationCap, Wrench, Zap, TrendingUp, 
  ShieldCheck, Play, Trash2, Headphones, Activity, Utensils, Home, Truck, RefreshCw,
  Crown, CheckCircle2, Clock, Star, AlertTriangle, X, Lock
} from "lucide-react";

export default function Dashboard({ stats, agents: initialAgents, mySub: propSub, onRefreshSub }) {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [agentsList, setAgentsList] = useState(initialAgents || []);
  const [loadingAgents, setLoadingAgents] = useState(false);
  const [localSub, setLocalSub] = useState(propSub || null);
  const [showLimitModal, setShowLimitModal] = useState(false);

  useEffect(() => {
    loadLiveAgents();
    if (!propSub) {
      loadSub();
    } else {
      setLocalSub(propSub);
    }
  }, [propSub]);

  const loadSub = async () => {
    try {
      const sub = await api.getMySubscription();
      setLocalSub(sub);
    } catch (err) {
      console.error("Error loading sub in dashboard:", err);
    }
  };

  const handleSpotlightMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty("--mouse-x", `${e.clientX - rect.left}px`);
    e.currentTarget.style.setProperty("--mouse-y", `${e.clientY - rect.top}px`);
  };

  const maxBots = localSub?.max_bots || (localSub?.subscription_plan === 'starter' ? 2 : localSub?.subscription_plan === 'pro' ? 3 : 1);
  const currentPlanName = (localSub?.subscription_plan || 'free').toUpperCase();
  const isLimitReached = (agentsList.length >= maxBots) && (localSub?.subscription_plan !== 'enterprise');

  const handleCreateAgent = (targetUrl = "/agents/new") => {
    if (isLimitReached) {
      setShowLimitModal(true);
      return;
    }
    navigate(targetUrl);
  };

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

  const currentPlanId = localSub?.subscription_plan || "free";
  const isPlanActive = localSub?.plan_status === "active";

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
    <div className="space-y-4 pb-24 sm:pb-28 text-white">
      {/* Active Subscription Status Banner - Compact & Clean */}
      {localSub && (
        <div className={`rounded-xl border p-3 sm:p-4 backdrop-blur-xl flex items-center justify-between gap-3 shadow-lg transition-all ${
          currentPlanId !== "free" 
            ? "bg-gradient-to-r from-emerald-950/40 via-[#0E1B17] to-teal-950/30 border-emerald-500/30" 
            : "bg-gradient-to-r from-blue-950/40 via-[#0E121B] to-indigo-950/30 border-blue-500/30"
        }`}>
          <div className="flex items-center space-x-2.5 sm:space-x-3 min-w-0">
            <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-lg flex items-center justify-center shrink-0 border ${
              currentPlanId !== "free" 
                ? "bg-emerald-500/20 border-emerald-500/30 text-emerald-400" 
                : "bg-blue-500/20 border-blue-500/30 text-blue-400"
            }`}>
              <Crown className="w-4 h-4" />
            </div>
            <div className="min-w-0 space-y-0.5">
              <div className="flex items-center space-x-1.5 flex-wrap">
                <span className={`px-2 py-0.5 rounded-full border text-[10px] font-extrabold uppercase flex items-center gap-1 ${
                  currentPlanId !== "free" 
                    ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/40" 
                    : "bg-blue-500/20 text-blue-400 border-blue-500/30"
                }`}>
                  <CheckCircle2 className="w-2.5 h-2.5" />
                  <span>{currentPlanId === "free" ? "Free Trial" : `${currentPlanId.toUpperCase()}`}</span>
                </span>
                <span className="text-[11px] font-medium text-slate-300 truncate">
                  {currentPlanId === "free" ? "1 Bot • 1K xabar/oy • CRM" : `30 kun • ${localSub.max_bots} Bot ruxsati`}
                </span>
              </div>
              <p className="text-[10px] text-slate-400 truncate max-w-md hidden sm:block">
                {currentPlanId === "free" ? "Golosovoy AI va ko'proq botlar uchun tarifni faollashtiring" : "Barcha imkoniyatlar 24/7 faol"}
              </p>
            </div>
          </div>
          <button
            onClick={() => navigate("/pricing")}
            className={`shrink-0 px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all border flex items-center gap-1 active:scale-95 ${
              currentPlanId !== "free"
                ? "bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border-emerald-500/30"
                : "bg-blue-600 hover:bg-blue-500 text-white border-blue-500 shadow-sm"
            }`}
          >
            <span>{currentPlanId !== "free" ? t("pricing") : "Tariflar"}</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      )}

      {/* Hero Welcome Banner with 2026 Border-Beam & Spotlight */}
      <div 
        onMouseMove={handleSpotlightMove}
        className="relative border-beam-container spotlight-card rounded-2xl bg-gradient-to-b from-[#141A26] to-[#0E121B] border border-white/[0.08] p-4 sm:p-6 shadow-2xl"
      >
        <div className="border-beam" />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-blue-500/50 to-transparent" />
        
        <div className="relative z-10 space-y-2">
          <div className="flex items-center justify-between">
            <div className="inline-flex items-center space-x-1.5 px-2 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/25 text-blue-400 text-[10px] font-semibold tracking-wide">
              <Sparkles className="w-3 h-3 animate-pulse" />
              <span>{t("hero_badge")}</span>
            </div>
            <div className="hidden sm:flex items-center space-x-1 text-[11px] text-slate-400">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>{t("hero_multi_tenant")}</span>
            </div>
          </div>

          <div>
            <h2 className="text-base sm:text-xl font-black text-white tracking-tight leading-snug">
              {t("hero_title")}
            </h2>
            <p className="text-[11px] sm:text-xs text-slate-400 mt-0.5 line-clamp-1 sm:line-clamp-none max-w-xl">
              {t("hero_subtitle")}
            </p>
          </div>

          <div className="pt-1 flex flex-wrap items-center gap-2">
            <button
              onClick={() => handleCreateAgent("/agents/new")}
              className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg bg-gradient-to-b from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500 text-white font-bold text-xs shadow-md shadow-blue-500/30 active:scale-95 transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{t("create_agent_btn")}</span>
            </button>
            <button
              onClick={() => navigate("/tester")}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-[#07080D]/80 hover:bg-white/[0.06] border border-white/[0.08] text-slate-300 hover:text-white font-medium text-xs backdrop-blur-md transition-all active:scale-95"
            >
              <Play className="w-3 h-3 text-emerald-400" />
              <span>{t("test_voice_btn")}</span>
            </button>
            <button
              onClick={() => navigate("/pricing")}
              className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 font-semibold text-xs backdrop-blur-md transition-all active:scale-95"
            >
              <span className="text-amber-400 text-xs">⭐</span>
              <span>{t("pricing_btn")}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Quick Industry Templates - 2 Column Compact Grid */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between px-1">
          <div>
            <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-300">
              {t("templates_title")}
            </h3>
            <p className="text-[10px] text-slate-500">{t("templates_subtitle")}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
          {templates.map((tpl) => {
            const IconComponent = tpl.icon;
            const localizedTitle = t(`tpl_${tpl.id}_title`) !== `tpl_${tpl.id}_title` ? t(`tpl_${tpl.id}_title`) : tpl.title;
            const localizedDesc = t(`tpl_${tpl.id}_desc`) !== `tpl_${tpl.id}_desc` ? t(`tpl_${tpl.id}_desc`) : tpl.desc;
            return (
              <div
                key={tpl.id}
                onClick={() => handleCreateAgent(`/agents/new?category=${tpl.id}`)}
                onMouseMove={handleSpotlightMove} className="group relative cursor-pointer spotlight-card rounded-2xl p-3.5 transition-all duration-200 shadow-lg flex flex-col justify-between"
              >
                <div className={`pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-gradient-to-br ${tpl.accent} blur-xl group-hover:scale-150 transition-all duration-300`} />
                
                <div className="space-y-1.5 relative z-10">
                  <div className="flex items-center justify-between">
                    <div className={`p-1.5 rounded-lg border ${tpl.iconColor} group-hover:scale-110 transition-transform duration-200`}>
                      <IconComponent className="w-3.5 h-3.5" />
                    </div>
                    <span className={`text-[9px] font-semibold px-1.5 py-0.2 rounded-full border ${tpl.badgeColor}`}>
                      {tpl.badge}
                    </span>
                  </div>

                  <div>
                    <h4 className="text-xs font-bold text-white group-hover:text-blue-300 transition-colors truncate">
                      {localizedTitle}
                    </h4>
                    <p className="text-[10px] text-slate-400 line-clamp-1 sm:line-clamp-2 leading-tight mt-0.5">
                      {localizedDesc}
                    </p>
                  </div>
                </div>

                <div className="pt-2 border-t border-white/[0.05] flex items-center justify-between text-[10px] font-semibold text-blue-400 group-hover:text-blue-300 mt-2">
                  <span>{t("use_template")}</span>
                  <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Active User Agents Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center space-x-2.5">
            <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-300">
              {t("active_agents_title")}
            </h3>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
              isLimitReached
                ? "bg-amber-500/15 text-amber-400 border-amber-500/30"
                : "bg-white/[0.04] text-slate-400 border-white/10"
            }`}>
              {agentsList.length} / {maxBots} {t("bots_limit_label")}
            </span>
            <button
              onClick={loadLiveAgents}
              className="p-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-white/50 hover:text-white transition"
              title={t("refresh")}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loadingAgents ? 'animate-spin' : ''}`} />
            </button>
          </div>
          <button
            onClick={() => handleCreateAgent("/agents/new")}
            className="text-xs font-semibold text-blue-400 hover:text-blue-300 flex items-center space-x-1 transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{t("create_agent_btn")}</span>
          </button>
        </div>

        {loadingAgents && agentsList.length === 0 ? (
          <div className="p-8 text-center text-xs text-white/40">...</div>
        ) : agentsList.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/[0.1] bg-[#0E121B]/40 p-8 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center mx-auto">
              <Bot className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-white">{t("active_agents_title")}</h4>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                {t("no_agents_text")}
              </p>
            </div>
            <button
              onClick={() => handleCreateAgent("/agents/new")}
              className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition shadow-md"
            >
              <Plus className="w-4 h-4" />
              <span>{t("create_agent_btn")}</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {agentsList.map((agent) => (
              <div
                key={agent.id}
                onClick={() => navigate(`/agents/${agent.id}`)}
                onMouseMove={handleSpotlightMove} className="group relative cursor-pointer spotlight-card rounded-2xl p-4 transition-all duration-200 shadow-lg space-y-3"
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
                        {agent.bot_token_masked || (agent.bot_token ? `${agent.bot_token.slice(0, 8)}...` : "Token")}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      ● Onlayn
                    </span>
                    <button
                      onClick={(e) => handleDeleteAgentDirect(e, agent.id)}
                      className="p-1.5 rounded-lg bg-white/[0.04] hover:bg-red-500/20 text-white/40 hover:text-red-400 border border-white/[0.06] transition"
                      title="O'chirish"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/[0.05] text-xs">
                  <div 
                    onClick={(e) => { e.stopPropagation(); navigate(`/agents/${agent.id}/knowledge`); }}
                    className="p-2 rounded-xl bg-[#07080D] border border-white/[0.04] hover:border-blue-500/30 transition text-slate-300 flex items-center justify-between"
                  >
                    <span className="text-slate-400">{t("btn_knowledge")}:</span>
                    <span className="font-bold text-blue-400">{agent.knowledge_count || 0}</span>
                  </div>

                  <div 
                    onClick={(e) => { e.stopPropagation(); navigate(`/leads?agent_id=${agent.id}`); }}
                    className="p-2 rounded-xl bg-[#07080D] border border-white/[0.04] hover:border-blue-500/30 transition text-slate-300 flex items-center justify-between"
                  >
                    <span className="text-slate-400">Lidlar:</span>
                    <span className="font-bold text-emerald-400">{agent.leads_count || 0}</span>
                  </div>
                </div>

                <div className="pt-1 flex items-center justify-between">
                  <button
                    onClick={(e) => { e.stopPropagation(); navigate(`/tester?agent_id=${agent.id}`); }}
                    className="w-full py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 hover:text-white font-medium text-xs flex items-center justify-center gap-1.5 transition"
                  >
                    <Play className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{t("btn_test")}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Subscription Limit Modal */}
      {showLimitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-md rounded-3xl bg-[#0E121B] border border-amber-500/40 p-6 sm:p-7 shadow-[0_0_50px_rgba(245,158,11,0.2)] space-y-5 animate-scale-up text-white">
            <button 
              onClick={() => setShowLimitModal(false)}
              className="absolute top-4 right-4 p-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-slate-400 hover:text-white transition"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="w-14 h-14 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-lg shadow-amber-500/10 mx-auto">
              <AlertTriangle className="w-7 h-7 animate-bounce" />
            </div>

            <div className="text-center space-y-2">
              <h3 className="text-lg sm:text-xl font-extrabold text-white">
                {t("limit_modal_title")}
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                {t("limit_modal_desc")}
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#07080D] border border-white/[0.06] space-y-2 text-xs">
              <div className="flex items-center justify-between text-slate-400">
                <span>{t("limit_modal_current_plan")}</span>
                <span className="font-bold text-amber-400 uppercase">{currentPlanName} PLAN</span>
              </div>
              <div className="flex items-center justify-between text-slate-400">
                <span>{t("limit_modal_allowed_limit")}</span>
                <span className="font-bold text-white">{maxBots} {t("bots_limit_label")}</span>
              </div>
              <div className="flex items-center justify-between text-slate-400">
                <span>{t("limit_modal_created_bots")}</span>
                <span className="font-bold text-rose-400">{agentsList.length} {t("bots_limit_label")} ({t("limit_modal_status_full")})</span>
              </div>
            </div>

            <div className="space-y-2 pt-1">
              <button
                onClick={() => {
                  setShowLimitModal(false);
                  navigate("/pricing");
                }}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-500/30 active:scale-95 transition-all"
              >
                <Crown className="w-4 h-4 text-amber-300" />
                <span>{t("limit_modal_btn_upgrade")} (3 {t("bots_limit_label")} & Voice AI)</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              
              <button
                onClick={() => setShowLimitModal(false)}
                className="w-full py-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-slate-400 hover:text-white font-semibold text-xs transition"
              >
                {t("limit_modal_btn_close")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
