import React, { useState, useEffect, useRef } from "react";
import { api } from "../services/api";
import { 
  MessageSquare, User, Bot, Send, ShieldAlert, ToggleLeft, 
  ToggleRight, Clock, ArrowLeft, RefreshCw, Sparkles, CheckCheck, 
  Zap, Headphones, ChevronRight, Check
} from "lucide-react";

export default function LiveChatInbox() {
  const [conversations, setConversations] = useState([]);
  const [selectedConvId, setSelectedConvId] = useState(null);
  const [activeConv, setActiveConv] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [sending, setSending] = useState(false);
  const [toggling, setToggling] = useState(false);
  const [loading, setLoading] = useState(false);
  const [generatingSuggestion, setGeneratingSuggestion] = useState(false);

  const messagesEndRef = useRef(null);

  const cannedReplies = [
    "Assalomu alaykum! Sizga qanday yordam bera olaman? 😊",
    "1 daqiqa kuting, ma'lumotni aniqlashtirib aytaman ⏳",
    "Sizga lokatsiya va manzillarimizni yuboraymi? 📍",
    "Click yoki Payme orqali to'lov havolasini chiqarib beraymi? 💳",
    "Buyurtmangiz qabul qilindi, operatorlarimiz tez orada bog'lanishadi! ✅"
  ];

  useEffect(() => {
    loadConversations();
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

  const loadConversations = async (isBackground = false) => {
    try {
      const data = await api.getConversations();
      setConversations(data || []);
      if (!selectedConvId && data && data.length > 0 && !isBackground) {
        setSelectedConvId(data[0].id);
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
      alert(err.message || "Rejimni oʻzgartirib boʻlmadi");
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
      alert(err.message || "Xabar yuborishda xatolik");
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

  return (
    <div className="space-y-4 pb-28 h-[calc(100vh-125px)] flex flex-col animate-fade-in text-white">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base sm:text-lg font-black text-white tracking-tight flex items-center gap-2">
              <Headphones className="w-5 h-5 text-purple-400" />
              <span>Jonli Muloqot & Operator Rejimi</span>
            </h2>
            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              <span>Real-time Sync</span>
            </div>
          </div>
          <p className="text-xs text-white/50 mt-0.5">
            Telegram bot foydalanuvchilari bilan to‘g‘ridan-to‘g‘ri muloqot va AI nazorati
          </p>
        </div>

        <button
          onClick={() => { loadConversations(); if (selectedConvId) loadConversationDetails(selectedConvId); }}
          className="p-2 rounded-xl bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.08] text-white/60 hover:text-white transition"
          title="Yangilash"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Main Inbox Layout */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-12 gap-3 min-h-0">
        {/* Conversations List */}
        <div className={`md:col-span-4 bg-[#0a0c13]/90 backdrop-blur-xl border border-white/[0.08] rounded-2xl flex flex-col overflow-hidden shadow-2xl ${
          selectedConvId && activeConv ? "hidden md:flex" : "flex"
        }`}>
          <div className="p-3 border-b border-white/[0.06] bg-white/[0.01] flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-white/60">
              Suhbatlar ({conversations.length})
            </span>
            <span className="text-[10px] text-white/40">2.5s yangilanadi</span>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-white/[0.04] p-1.5 space-y-1">
            {conversations.length === 0 ? (
              <div className="p-8 text-center text-xs text-white/40">
                Hozircha faol suhbatlar mavjud emas
              </div>
            ) : (
              conversations.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setSelectedConvId(c.id)}
                  className={`w-full text-left p-3 rounded-xl transition flex items-start gap-3 ${
                    selectedConvId === c.id
                      ? "bg-purple-600/15 border border-purple-500/30 text-white shadow-lg"
                      : "hover:bg-white/[0.04] text-white/70 hover:text-white"
                  }`}
                >
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                    c.is_paused_for_human
                      ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                      : "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                  }`}>
                    {c.customer_name ? c.customer_name.charAt(0).toUpperCase() : "M"}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold truncate text-white">
                        {c.customer_name || "Mijoz"}
                      </span>
                      <span className="text-[9px] text-white/40">
                        {new Date(c.last_message_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>

                    <p className="text-[11px] text-white/50 truncate mt-0.5">
                      {c.last_message || "Yangi muloqot boshlandi"}
                    </p>

                    <div className="flex items-center gap-1.5 mt-1.5">
                      <span className={`px-1.5 py-0.5 rounded text-[9px] font-semibold ${
                        c.is_paused_for_human
                          ? "bg-amber-500/20 text-amber-300"
                          : "bg-emerald-500/20 text-emerald-300"
                      }`}>
                        {c.is_paused_for_human ? "👨‍💻 Operator" : "🤖 AI Javob"}
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

        {/* Chat Message Window */}
        <div className={`md:col-span-8 bg-[#0a0c13]/90 backdrop-blur-xl border border-white/[0.08] rounded-2xl flex flex-col overflow-hidden shadow-2xl ${
          !selectedConvId && !activeConv ? "hidden md:flex items-center justify-center text-white/40 text-xs" : "flex"
        }`}>
          {activeConv ? (
            <>
              {/* Chat Top Bar */}
              <div className="p-3.5 border-b border-white/[0.06] bg-white/[0.02] flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <button
                    onClick={() => setSelectedConvId(null)}
                    className="md:hidden p-1.5 rounded-lg bg-white/[0.05] text-white/70"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </button>

                  <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center justify-center font-bold text-xs">
                    {activeConv.customer_name ? activeConv.customer_name.charAt(0).toUpperCase() : "M"}
                  </div>

                  <div>
                    <div className="text-xs font-bold text-white flex items-center gap-2">
                      <span>{activeConv.customer_name || "Mijoz"}</span>
                      <span className="text-[10px] text-white/40 font-mono">ID: {activeConv.customer_tg_id}</span>
                    </div>
                    <span className="text-[10px] text-white/40">Agent: {activeConv.agent_name}</span>
                  </div>
                </div>

                {/* AI vs Human Mode Switcher */}
                <button
                  onClick={handleToggleHuman}
                  disabled={toggling}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition border ${
                    activeConv.is_paused_for_human
                      ? "bg-amber-500/20 text-amber-300 border-amber-500/30 shadow-lg shadow-amber-500/10"
                      : "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                  }`}
                >
                  {activeConv.is_paused_for_human ? (
                    <>
                      <ToggleRight className="w-4 h-4 text-amber-400" />
                      <span>👨‍💻 Operator Rejimi (AI To‘xtatilgan)</span>
                    </>
                  ) : (
                    <>
                      <ToggleLeft className="w-4 h-4 text-emerald-400" />
                      <span>🤖 AI Rejimi (Avtomatik)</span>
                    </>
                  )}
                </button>
              </div>

              {/* Messages Body */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#06070a]/40">
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
                          {m.sender === "customer" ? "👤 Mijoz" : m.sender === "ai" ? "🤖 AI Agent" : "👨‍💻 Operator"}
                        </span>
                        <span className="text-[8px] text-white/20">
                          {new Date(m.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>

                      <div
                        className={`max-w-[85%] sm:max-w-[70%] p-3 rounded-2xl text-xs leading-relaxed ${
                          m.sender === "customer"
                            ? "bg-[#141824] text-white/90 border border-white/[0.08] rounded-tl-sm"
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
                    Bu muloqotda hali xabarlar yo‘q
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Quick Canned Responses Bar */}
              <div className="px-3 pt-2 bg-[#090b11] border-t border-white/[0.04] overflow-x-auto flex items-center gap-1.5 no-scrollbar">
                <span className="text-[10px] text-white/40 font-semibold shrink-0 flex items-center gap-1">
                  <Zap className="w-3 h-3 text-amber-400" /> Shablonlar:
                </span>
                {cannedReplies.map((reply, idx) => (
                  <button
                    key={idx}
                    onClick={() => setReplyText(reply)}
                    className="px-2.5 py-1 rounded-lg bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.06] text-[10px] text-white/70 hover:text-white truncate max-w-[200px] shrink-0 transition"
                  >
                    {reply}
                  </button>
                ))}
              </div>

              {/* Input Area */}
              <form onSubmit={handleSendReply} className="p-3 bg-[#0a0c13] border-t border-white/[0.06] flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleAIAssist}
                  disabled={generatingSuggestion}
                  className="p-2 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 border border-purple-500/20 text-xs font-semibold flex items-center gap-1 transition shrink-0"
                  title="AI yordamida javob taklifini olish"
                >
                  <Sparkles className={`w-3.5 h-3.5 ${generatingSuggestion ? 'animate-spin' : ''}`} />
                  <span className="hidden sm:inline">AI Taklif</span>
                </button>

                <input
                  type="text"
                  placeholder="Mijozga operator sifatida javob yozing..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  className="flex-1 bg-[#12141d] border border-white/[0.08] focus:border-purple-500/50 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-white/30 focus:outline-none"
                />

                <button
                  type="submit"
                  disabled={sending || !replyText.trim()}
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 disabled:opacity-40 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-purple-500/20 transition active:scale-95 shrink-0"
                >
                  {sending ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                  <span>Yuborish</span>
                </button>
              </form>
            </>
          ) : (
            <div className="p-12 text-center text-xs text-white/40">
              Chap tomondan muloqotni tanlang
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
