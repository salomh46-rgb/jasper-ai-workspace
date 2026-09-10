import React, { useState, useEffect, useRef } from "react";
import { api } from "../services/api";
import { useLanguage } from "../i18n/LanguageContext";
import { 
  MessageSquare, User, Bot, Send, ShieldAlert, ToggleLeft, 
  ToggleRight, Clock, ArrowLeft, RefreshCw, Sparkles, CheckCheck, 
  Zap, Headphones, ChevronRight, Check, Copy, ExternalLink,
  UserPlus, Search, Phone, Bell, Volume2, ShieldCheck, Star
} from "lucide-react";
import { RadarCoreIcon, NeuralSynapseIcon, QuantumCubeIcon, LightningPulseIcon } from "../components/MicroIcons";

export default function LiveChatInbox() {
  const { t } = useLanguage();
  const [conversations, setConversations] = useState([]);
  const [agents, setAgents] = useState([]);
  const [selectedConvId, setSelectedConvId] = useState(null);
  const [activeConv, setActiveConv] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [sending, setSending] = useState(false);
  const [toggling, setToggling] = useState(false);
  const [loading, setLoading] = useState(false);
  const [generatingSuggestion, setGeneratingSuggestion] = useState(false);
  
  // New features state
  const [filterType, setFilterType] = useState("all"); // all, human, ai
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedLink, setCopiedLink] = useState(false);
  const [savedLeadSuccess, setSavedLeadSuccess] = useState(false);
  const [savingLead, setSavingLead] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const messagesEndRef = useRef(null);
  const prevConvsRef = useRef([]);

  const cannedReplies = [
    "👋 Assalomu alaykum! Sizga qanday yordam bera olamiz?",
    "📦 Mahsulotlarimiz narxi va yetkazib berish shartlari bilan tanishdingizmi?",
    "📍 Manzilimiz va ish vaqtimiz haqida ma'lumot yuboraymi?",
    "💳 To'lovni Click, Payme yoki karta orqali amalga oshirishingiz mumkin.",
    "👨‍💻 Mutaxassisimiz 5 daqiqada siz bilan to'liq bog'lanadi!"
  ];

  // Web Audio Chime Notification
  const playChime = () => {
    if (!soundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const now = ctx.currentTime;

      // Note 1: 587.33 Hz (D5)
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = "sine";
      osc1.frequency.setValueAtTime(587.33, now);
      gain1.gain.setValueAtTime(0.12, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.25);

      // Note 2: 880 Hz (A5)
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = "sine";
      osc2.frequency.setValueAtTime(880, now + 0.1);
      gain2.gain.setValueAtTime(0.18, now + 0.1);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(now + 0.1);
      osc2.stop(now + 0.45);
    } catch (e) {
      console.log("Audio notification error:", e);
    }
  };

  useEffect(() => {
    loadInitial();
    const interval = setInterval(() => {
      loadConversations(true);
      if (selectedConvId) {
        loadConversationDetails(selectedConvId, true);
      }
    }, 2500);
    return () => clearInterval(interval);
  }, [selectedConvId]);

  useEffect(() => {
    if (selectedConvId) {
      loadConversationDetails(selectedConvId);
    }
  }, [selectedConvId]);

  useEffect(() => {
    scrollToBottom();
  }, [activeConv?.messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const loadInitial = async () => {
    try {
      const [convsData, agentsData] = await Promise.all([
        api.getConversations().catch(() => []),
        api.getAgents().catch(() => [])
      ]);
      setConversations(convsData || []);
      setAgents(agentsData || []);
      prevConvsRef.current = convsData || [];
      if (convsData && convsData.length > 0 && !selectedConvId) {
        setSelectedConvId(convsData[0].id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const loadConversations = async (isBackground = false) => {
    try {
      const data = await api.getConversations();
      const newConvs = data || [];
      
      // Check for incoming new customer messages to trigger sound chime
      if (isBackground && prevConvsRef.current.length > 0) {
        const hasNew = newConvs.some(nc => {
          const old = prevConvsRef.current.find(oc => oc.id === nc.id);
          return !old || old.last_message_at !== nc.last_message_at;
        });
        if (hasNew) {
          playChime();
        }
      }

      setConversations(newConvs);
      prevConvsRef.current = newConvs;
      if (!selectedConvId && newConvs.length > 0 && !isBackground) {
        setSelectedConvId(newConvs[0].id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const loadConversationDetails = async (convId, isBackground = false) => {
    try {
      if (!isBackground) setLoading(true);
      const data = await api.getConversation(convId);
      setActiveConv(data);
    } catch (err) {
      console.error(err);
    } finally {
      if (!isBackground) setLoading(false);
    }
  };

  const handleToggleHuman = async () => {
    if (!activeConv || toggling) return;
    try {
      setToggling(true);
      const nextState = !activeConv.is_paused_for_human;
      const res = await api.toggleHumanTakeover(activeConv.id, nextState);
      setActiveConv(prev => ({ ...prev, is_paused_for_human: res.is_paused_for_human }));
      loadConversations(true);
    } catch (err) {
      alert(err.message || "Xatolik yuz berdi");
    } finally {
      setToggling(false);
    }
  };

  const handleSendReply = async (e) => {
    if (e) e.preventDefault();
    if (!replyText.trim() || !activeConv || sending) return;

    const text = replyText.trim();
    setReplyText("");
    try {
      setSending(true);
      const res = await api.sendOperatorReply(activeConv.id, text);
      setActiveConv(prev => ({
        ...prev,
        is_paused_for_human: true,
        messages: [
          ...(prev?.messages || []),
          { id: res.message_id || Date.now(), sender: "human_operator", text: res.text, created_at: res.created_at }
        ]
      }));
      loadConversations(true);
    } catch (err) {
      alert(err.message || "Xatolik yuz berdi");
    } finally {
      setSending(false);
    }
  };

  const handleAIAssist = async () => {
    if (!activeConv || generatingSuggestion) return;
    try {
      setGeneratingSuggestion(true);
      const lastCustMsg = [...(activeConv.messages || [])].reverse().find(m => m.sender === "customer");
      const prompt = lastCustMsg ? lastCustMsg.text : "Mijozga xushmuomala javob bering";
      
      const res = await api.generateAIPrompt(`Mijozning ushbu savoliga do'stona, qisqa va professional javob tayyorlab ber: "${prompt}"`, "custom");
      if (res && res.welcome_message) {
        setReplyText(res.welcome_message);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setGeneratingSuggestion(false);
    }
  };

  // Convert customer to Lead in CRM
  const handleSaveToCRM = async () => {
    if (!activeConv || savingLead) return;
    try {
      setSavingLead(true);
      await api.createLead({
        agent_id: activeConv.agent_id || (agents[0]?.id || 1),
        customer_name: activeConv.customer_name || "Mijoz",
        customer_phone: "+998 ",
        status: "new",
        notes: `Jonli suhbatdan saqlandi (Telegram ID: ${activeConv.customer_tg_id})`
      });
      setSavedLeadSuccess(true);
      setTimeout(() => setSavedLeadSuccess(false), 2500);
    } catch (err) {
      alert(err.message || "Lidni saqlashda xatolik");
    } finally {
      setSavingLead(false);
    }
  };

  const handleCopyBotLink = (botUsername) => {
    const link = `https://t.me/${botUsername.replace("@", "")}`;
    navigator.clipboard.writeText(link);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  // Filter & Search conversations
  const filteredConversations = conversations.filter(c => {
    if (filterType === "human" && !c.is_paused_for_human) return false;
    if (filterType === "ai" && c.is_paused_for_human) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = (c.customer_name || "").toLowerCase().includes(q);
      const matchMsg = (c.last_message || "").toLowerCase().includes(q);
      if (!matchName && !matchMsg) return false;
    }
    return true;
  });

  const primaryAgent = agents.find(a => a.bot_token) || agents[0];
  const botUsername = primaryAgent?.bot_token_masked || (primaryAgent?.name ? primaryAgent.name.toLowerCase().replace(/\s+/g, "_") + "_bot" : "jasper_ai_bot");

  return (
    <div className="space-y-3 pb-28 h-[calc(100vh-120px)] flex flex-col animate-fade-in text-white">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/[0.06] pb-2.5">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base sm:text-lg font-black text-white tracking-tight flex items-center gap-2">
              <Headphones className="w-5 h-5 text-purple-400" />
              <span>{t("chat_main_title") || "Jonli Suhbatlar"}</span>
            </h2>
            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              <span>{t("chat_sync_badge") || "Jonli Ulanish"}</span>
            </div>
          </div>
          <p className="text-[11px] sm:text-xs text-white/50 mt-0.5">
            {t("chat_main_subtitle") || "Telegram bot foydalanuvchilari bilan to'g'ridan-to'g'ri real-vaqtda muloqot"}
          </p>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`p-2 rounded-xl border transition text-xs flex items-center gap-1 ${
              soundEnabled ? "bg-purple-500/15 border-purple-500/30 text-purple-300" : "bg-white/[0.04] border-white/[0.08] text-white/40"
            }`}
            title={soundEnabled ? "Ovozli signal yoqilgan" : "Ovozli signal o'chirilgan"}
          >
            <Volume2 className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => { loadConversations(); if (selectedConvId) loadConversationDetails(selectedConvId); }}
            className="p-2 rounded-xl bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.08] text-white/60 hover:text-white transition"
            title={t("refresh") || "Yangilash"}
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Layout */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-12 gap-3 min-h-0">
        
        {/* Left: Conversations List & Filters */}
        <div className={`md:col-span-4 bg-[#0a0c13]/90 backdrop-blur-xl border border-white/[0.08] rounded-2xl flex flex-col overflow-hidden shadow-2xl ${
          selectedConvId && activeConv ? "hidden md:flex" : "flex"
        }`}>
          {/* Filter Pills */}
          <div className="p-2.5 border-b border-white/[0.06] bg-white/[0.01] space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold uppercase tracking-wider text-white/70 text-[11px]">
                {t("chat_conv_list_title") || "Muloqotlar"} ({conversations.length})
              </span>
              <span className="text-[10px] text-emerald-400 font-medium">● 2.5s yangilanadi</span>
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-white/30" />
              <input
                type="text"
                placeholder="Mijoz nomi yoki xabar..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#12141d] border border-white/[0.06] rounded-xl pl-8 pr-3 py-1.5 text-[11px] text-white placeholder:text-white/30 focus:outline-none focus:border-purple-500/40"
              />
            </div>

            {/* Filter Tabs */}
            <div className="grid grid-cols-3 gap-1 pt-0.5">
              <button
                onClick={() => setFilterType("all")}
                className={`py-1 rounded-lg text-[10px] font-bold transition ${
                  filterType === "all" ? "bg-purple-600 text-white shadow-sm" : "bg-white/[0.04] text-white/50 hover:text-white"
                }`}
              >
                Barchasi
              </button>
              <button
                onClick={() => setFilterType("human")}
                className={`py-1 rounded-lg text-[10px] font-bold transition ${
                  filterType === "human" ? "bg-amber-600 text-white shadow-sm" : "bg-white/[0.04] text-white/50 hover:text-white"
                }`}
              >
                👤 Operator
              </button>
              <button
                onClick={() => setFilterType("ai")}
                className={`py-1 rounded-lg text-[10px] font-bold transition ${
                  filterType === "ai" ? "bg-emerald-600 text-white shadow-sm" : "bg-white/[0.04] text-white/50 hover:text-white"
                }`}
              >
                🤖 AI
              </button>
            </div>
          </div>

          {/* List Content */}
          <div className="flex-1 overflow-y-auto divide-y divide-white/[0.04] p-1.5 space-y-1">
            {filteredConversations.length === 0 ? (
              <div className="p-6 text-center text-xs text-white/40 space-y-1">
                <p>Hozircha muloqotlar yo'q</p>
                <p className="text-[10px] text-white/30">Mijozlar yozganda shu yerda chiqadi</p>
              </div>
            ) : (
              filteredConversations.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setSelectedConvId(c.id)}
                  className={`w-full text-left p-2.5 rounded-xl transition flex items-start gap-2.5 ${
                    selectedConvId === c.id
                      ? "bg-purple-600/20 border border-purple-500/40 text-white shadow-lg"
                      : "hover:bg-white/[0.04] text-white/70 hover:text-white border border-transparent"
                  }`}
                >
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                    c.is_paused_for_human
                      ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                      : "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                  }`}>
                    {c.customer_name ? c.customer_name.charAt(0).toUpperCase() : "M"}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold truncate text-white">
                        {c.customer_name || "Telegram Foydalanuvchisi"}
                      </span>
                      <span className="text-[9px] text-white/40 font-mono">
                        {new Date(c.last_message_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>

                    <p className="text-[11px] text-white/50 truncate mt-0.5">
                      {c.last_message || "Muloqot boshlandi..."}
                    </p>

                    <div className="flex items-center gap-1.5 mt-1">
                      <span className={`px-1.5 py-0.2 rounded text-[9px] font-semibold ${
                        c.is_paused_for_human
                          ? "bg-amber-500/20 text-amber-300"
                          : "bg-emerald-500/20 text-emerald-300"
                      }`}>
                        {c.is_paused_for_human ? "👤 Operator" : "🤖 AI Rejim"}
                      </span>
                      <span className="text-[9px] text-white/30 truncate">
                        {c.agent_name}
                      </span>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Right: Active Chat Window OR Elite Empty State Guide */}
        <div className={`md:col-span-8 bg-[#0a0c13]/90 backdrop-blur-xl border border-white/[0.08] rounded-2xl flex flex-col overflow-hidden shadow-2xl ${
          !selectedConvId && !activeConv ? "flex" : "flex"
        }`}>
          {activeConv ? (
            <>
              {/* Chat Top Bar & Customer Profile */}
              <div className="p-3 border-b border-white/[0.06] bg-white/[0.02] flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5 min-w-0">
                  <button
                    onClick={() => setSelectedConvId(null)}
                    className="md:hidden p-1.5 rounded-lg bg-white/[0.05] text-white/70 shrink-0"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </button>

                  <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-500/20 to-blue-500/20 border border-purple-500/30 text-purple-300 flex items-center justify-center font-bold text-xs shrink-0 shadow-inner">
                    {activeConv.customer_name ? activeConv.customer_name.charAt(0).toUpperCase() : "M"}
                  </div>

                  <div className="min-w-0">
                    <div className="text-xs font-bold text-white flex items-center gap-1.5 truncate">
                      <span className="truncate">{activeConv.customer_name || "Mijoz"}</span>
                      <span className="text-[10px] text-white/40 font-mono shrink-0">ID: {activeConv.customer_tg_id}</span>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
                      <span className="text-blue-400 truncate">Bot: {activeConv.agent_name}</span>
                    </div>
                  </div>
                </div>

                {/* Actions: Save to CRM & Toggle Mode */}
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={handleSaveToCRM}
                    disabled={savingLead}
                    className={`px-2.5 py-1.5 rounded-xl text-[11px] font-bold border flex items-center gap-1 transition active:scale-95 ${
                      savedLeadSuccess
                        ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                        : "bg-white/[0.04] hover:bg-white/[0.08] text-slate-200 border-white/[0.08]"
                    }`}
                    title="Mijozni CRM (Lidlar) bazasiga saqlash"
                  >
                    {savedLeadSuccess ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <UserPlus className="w-3.5 h-3.5 text-blue-400" />}
                    <span className="hidden sm:inline">{savedLeadSuccess ? "Saqlandi!" : "CRM ga olish"}</span>
                  </button>

                  <button
                    onClick={handleToggleHuman}
                    disabled={toggling}
                    className={`px-3 py-1.5 rounded-xl text-[11px] font-bold flex items-center gap-1.5 transition border active:scale-95 ${
                      activeConv.is_paused_for_human
                        ? "bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-lg shadow-amber-500/10"
                        : "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                    }`}
                  >
                    {activeConv.is_paused_for_human ? (
                      <>
                        <ToggleRight className="w-4 h-4 text-amber-400" />
                        <span>Operator</span>
                      </>
                    ) : (
                      <>
                        <ToggleLeft className="w-4 h-4 text-emerald-400" />
                        <span>AI Rejim</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Messages Body */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#06070a]/50">
                {loading && (
                  <div className="text-center text-xs text-white/30 py-2">Xabarlar yuklanmoqda...</div>
                )}
                {activeConv.messages && activeConv.messages.length > 0 ? (
                  activeConv.messages.map((m) => (
                    <div
                      key={m.id}
                      className={`flex flex-col ${
                        m.sender === "customer" ? "items-start" : "items-end"
                      }`}
                    >
                      <div className="flex items-center gap-1.5 mb-1 px-1">
                        <span className="text-[9px] font-semibold text-white/40">
                          {m.sender === "customer" ? "👤 Mijoz" : m.sender === "ai" ? "🤖 AI Yordamchi" : "👨‍💻 Operator (Siz)"}
                        </span>
                        <span className="text-[8px] text-white/20">
                          {new Date(m.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>

                      <div
                        className={`max-w-[85%] sm:max-w-[70%] p-3 rounded-2xl text-xs leading-relaxed ${
                          m.sender === "customer"
                            ? "bg-[#141824] text-white/90 border border-white/[0.08] rounded-tl-sm shadow-md"
                            : m.sender === "human_operator"
                            ? "bg-gradient-to-r from-amber-600 to-amber-700 text-white font-medium rounded-tr-sm shadow-md"
                            : "bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-tr-sm shadow-md"
                        }`}
                      >
                        {m.text}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-xs text-white/40 py-8">
                    Ushbu muloqotda hali xabarlar yo'q
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Quick Canned Responses Bar */}
              <div className="px-3 py-1.5 bg-[#090b11] border-t border-white/[0.04] overflow-x-auto flex items-center gap-1.5 no-scrollbar">
                <span className="text-[10px] text-amber-400 font-semibold shrink-0 flex items-center gap-1">
                  <Zap className="w-3 h-3" /> Tayyor:
                </span>
                {cannedReplies.map((reply, idx) => (
                  <button
                    key={idx}
                    onClick={() => setReplyText(reply)}
                    className="px-2.5 py-1 rounded-lg bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.06] text-[10px] text-white/70 hover:text-white truncate max-w-[180px] shrink-0 transition"
                  >
                    {reply}
                  </button>
                ))}
              </div>

              {/* Reply Input Area */}
              <form onSubmit={handleSendReply} className="p-2.5 sm:p-3 bg-[#0a0c13] border-t border-white/[0.06] flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleAIAssist}
                  disabled={generatingSuggestion}
                  className="p-2 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 border border-purple-500/20 text-xs font-semibold flex items-center gap-1 transition shrink-0"
                  title="AI javob maslahati"
                >
                  <Sparkles className={`w-3.5 h-3.5 ${generatingSuggestion ? 'animate-spin' : ''}`} />
                  <span className="hidden sm:inline">AI Maslahat</span>
                </button>

                <input
                  type="text"
                  placeholder="Mijozga to'g'ridan-to'g'ri Telegram orqali javob yozish..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  className="flex-1 bg-[#12141d] border border-white/[0.08] focus:border-purple-500/50 rounded-xl px-3.5 py-2 text-xs text-white placeholder:text-white/30 focus:outline-none"
                />

                <button
                  type="submit"
                  disabled={sending || !replyText.trim()}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 disabled:opacity-40 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-purple-500/20 transition active:scale-95 shrink-0"
                >
                  {sending ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                  <span>Yuborish</span>
                </button>
              </form>
            </>
          ) : (
            /* 2026 Elite Empty State & Onboarding Guide */
            <div className="flex-1 flex flex-col items-center justify-center p-6 sm:p-8 text-center space-y-5">
              <div className="relative border-beam-container spotlight-card rounded-3xl bg-gradient-to-b from-[#141A26] to-[#0E121B] border border-blue-500/30 p-6 sm:p-8 max-w-lg w-full space-y-4 shadow-2xl">
                <div className="border-beam" />
                
                <div className="flex justify-center mb-2">
                  <div className="w-14 h-14 rounded-2xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center shadow-lg">
                    <RadarCoreIcon className="w-10 h-10" />
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                    <span>Botingiz 24/7 Mijozlarni Kutmoqda</span>
                  </div>
                  <h3 className="text-base sm:text-lg font-black text-white tracking-tight">
                    Hozircha yangi muloqotlar yo'q
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed max-w-md mx-auto">
                    Mijozlar Telegram botingizga yozgan zahoti ularning savollari va buyurtmalari mana shu ekranda real-vaqtda ko'rinadi.
                  </p>
                </div>

                {/* Bot Link Box */}
                <div className="p-3.5 rounded-2xl bg-[#07080D] border border-white/[0.08] flex items-center justify-between gap-2 text-xs">
                  <div className="text-left min-w-0">
                    <span className="text-[10px] text-slate-400 block">Sizning faol botingiz:</span>
                    <span className="font-bold text-blue-400 truncate block">@{botUsername}</span>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => handleCopyBotLink(botUsername)}
                      className="px-3 py-1.5 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 font-bold text-xs flex items-center gap-1 active:scale-95 transition"
                    >
                      {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedLink ? "Nusxalandi!" : "Linkni olish"}</span>
                    </button>

                    <a
                      href={`https://t.me/${botUsername.replace("@", "")}`}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs flex items-center gap-1 active:scale-95 transition shadow-md"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Sinab ko'rish</span>
                    </a>
                  </div>
                </div>

                {/* 3 Steps Guide */}
                <div className="grid grid-cols-3 gap-2 pt-2 text-left">
                  <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.05] space-y-1">
                    <span className="text-[10px] font-bold text-blue-400">1. Havola</span>
                    <p className="text-[10px] text-slate-400 leading-tight">Botingiz linkini mijozlaringizga yuboring.</p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.05] space-y-1">
                    <span className="text-[10px] font-bold text-emerald-400">2. AI Javob</span>
                    <p className="text-[10px] text-slate-400 leading-tight">AI 24/7 barcha savollarga javob beradi.</p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.05] space-y-1">
                    <span className="text-[10px] font-bold text-purple-400">3. Operator</span>
                    <p className="text-[10px] text-slate-400 leading-tight">Istalgan payt suhbatga qo'shiling.</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
