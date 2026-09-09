import React, { useState, useEffect } from "react";
import { api } from "../services/api";
import { 
  MessageSquare, User, Bot, Send, ShieldAlert, ToggleLeft, 
  ToggleRight, Clock, ArrowLeft, RefreshCw, Sparkles, CheckCheck 
} from "lucide-react";

export default function LiveChatInbox() {
  const [conversations, setConversations] = useState([]);
  const [selectedConvId, setSelectedConvId] = useState(null);
  const [activeConv, setActiveConv] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [sending, setSending] = useState(false);
  const [toggling, setToggling] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadConversations();
    const interval = setInterval(loadConversations, 6000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (selectedConvId) {
      loadConversationDetails(selectedConvId);
    }
  }, [selectedConvId]);

  const loadConversations = async () => {
    try {
      const data = await api.getConversations();
      setConversations(data || []);
      if (!selectedConvId && data && data.length > 0) {
        setSelectedConvId(data[0].id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const loadConversationDetails = async (convId) => {
    try {
      setLoading(true);
      const data = await api.getConversation(convId);
      setActiveConv(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleHuman = async () => {
    if (!activeConv || toggling) return;
    try {
      setToggling(true);
      const nextState = !activeConv.is_paused_for_human;
      const res = await api.toggleHumanTakeover(activeConv.id, nextState);
      setActiveConv(prev => ({ ...prev, is_paused_for_human: res.is_paused_for_human }));
      loadConversations();
    } catch (err) {
      alert(err.message || "Rejimni oʻzgartirib boʻlmadi");
    } finally {
      setToggling(false);
    }
  };

  const handleSendReply = async (e) => {
    e.preventDefault();
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
          ...prev.messages,
          { id: res.message_id || Date.now(), sender: "human_operator", text: res.text, created_at: res.created_at }
        ]
      }));
      loadConversations();
    } catch (err) {
      alert(err.message || "Xabar yuborishda xatolik");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-4 pb-28 h-[calc(100vh-130px)] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base sm:text-lg font-extrabold text-white tracking-tight flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-purple-400" />
            <span>Jonli Muloqot & Operator Rejimi</span>
          </h2>
          <p className="text-xs text-slate-400">Telegram mijozlari bilan real vaqtda jonli suhbatlashish</p>
        </div>

        <button
          onClick={loadConversations}
          className="p-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] active:scale-95 border border-white/[0.08] text-slate-300"
          title="Yangilash"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Main Grid */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-3 min-h-0">
        {/* Left column: Conversations list */}
        <div className="rounded-2xl bg-[#0E121B]/90 backdrop-blur-xl border border-white/[0.07] p-3 flex flex-col overflow-y-auto space-y-2">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-1 pb-1 border-b border-white/[0.05]">
            Muloqotlar ({conversations.length})
          </div>

          {conversations.length > 0 ? (
            conversations.map((c) => {
              const isSelected = selectedConvId === c.id;
              return (
                <div
                  key={c.id}
                  onClick={() => setSelectedConvId(c.id)}
                  className={
                    "p-3 rounded-xl cursor-pointer transition-all border " +
                    (isSelected
                      ? "bg-blue-600/15 border-blue-500/40 shadow-[0_0_15px_rgba(59,130,246,0.2)]"
                      : "bg-[#07080D]/80 border-white/[0.05] hover:border-white/[0.12]")
                  }
                >
                  <div className="flex items-start justify-between">
                    <h4 className="font-bold text-xs sm:text-sm text-white truncate max-w-[130px]">
                      {c.customer_name}
                    </h4>
                    {c.is_paused_for_human ? (
                      <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded bg-amber-500/15 text-amber-400 border border-amber-500/25 flex items-center gap-1">
                        <User className="w-2.5 h-2.5" />
                        <span>Inson</span>
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded bg-blue-500/15 text-blue-400 border border-blue-500/25 flex items-center gap-1">
                        <Bot className="w-2.5 h-2.5" />
                        <span>AI</span>
                      </span>
                    )}
                  </div>

                  <p className="text-[11px] text-slate-400 mt-1 line-clamp-1">
                    {c.last_message || "Muloqot boshlandi..."}
                  </p>

                  <div className="mt-2 pt-1 border-t border-white/[0.04] flex items-center justify-between text-[10px] text-slate-500">
                    <span className="truncate max-w-[100px]">{c.agent_name}</span>
                    <span className="font-mono">{c.messages_count} ta xabar</span>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="p-6 text-center text-xs text-slate-500 space-y-1 my-auto">
              <MessageSquare className="w-8 h-8 mx-auto opacity-30" />
              <p>Hozircha jonli muloqotlar yoʻq</p>
            </div>
          )}
        </div>

        {/* Right column: Chat Stream & Operator actions */}
        <div className="md:col-span-2 rounded-2xl bg-[#0E121B]/90 backdrop-blur-xl border border-white/[0.07] p-3.5 flex flex-col min-h-0 space-y-3">
          {activeConv ? (
            <>
              {/* Chat Stream Header with Mode Switch */}
              <div className="flex items-center justify-between border-b border-white/[0.08] pb-2.5">
                <div>
                  <h3 className="font-bold text-sm text-white flex items-center gap-1.5">
                    <User className="w-4 h-4 text-blue-400" />
                    <span>{activeConv.customer_name}</span>
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    {activeConv.agent_name} orqali Telegramda bogʻlangan
                  </p>
                </div>

                <div className="flex items-center space-x-2">
                  <span className="text-xs font-semibold text-slate-300 hidden sm:inline">
                    {activeConv.is_paused_for_human ? "👤 Inson Operatori" : "🤖 Avtomatik AI"}
                  </span>
                  <button
                    onClick={handleToggleHuman}
                    disabled={toggling}
                    className={
                      "inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all active:scale-95 " +
                      (activeConv.is_paused_for_human
                        ? "bg-amber-500/15 border-amber-500/30 text-amber-400 hover:bg-amber-500/25"
                        : "bg-blue-500/15 border-blue-500/30 text-blue-400 hover:bg-blue-500/25")
                    }
                  >
                    {activeConv.is_paused_for_human ? (
                      <>
                        <User className="w-3.5 h-3.5" />
                        <span>AI ga Oʻtkazish</span>
                      </>
                    ) : (
                      <>
                        <ShieldAlert className="w-3.5 h-3.5" />
                        <span>Operatorga Olish</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Chat messages */}
              <div className="flex-1 overflow-y-auto space-y-3 p-3 rounded-2xl bg-[#07080D]/90 border border-white/[0.05]">
                {activeConv.messages && activeConv.messages.length > 0 ? (
                  activeConv.messages.map((msg) => {
                    const isCustomer = msg.sender === "customer";
                    const isHumanOp = msg.sender === "human_operator";
                    return (
                      <div
                        key={msg.id}
                        className={"flex flex-col " + (isCustomer ? "items-start" : "items-end")}
                      >
                        <span className="text-[10px] text-slate-500 mb-0.5 px-1">
                          {isCustomer ? "👤 Mijoz" : isHumanOp ? "👨‍💼 Siz (Operator)" : "🤖 AI Bot"}
                        </span>
                        <div
                          className={
                            "max-w-[80%] rounded-2xl px-4 py-2.5 text-xs sm:text-sm leading-relaxed shadow-sm " +
                            (isCustomer
                              ? "bg-[#141A26] text-slate-100 border border-white/[0.08] rounded-tl-sm"
                              : isHumanOp
                              ? "bg-gradient-to-b from-amber-600 to-amber-700 text-white rounded-tr-sm shadow-md"
                              : "bg-gradient-to-b from-blue-600 to-indigo-600 text-white rounded-tr-sm")
                          }
                        >
                          {msg.text}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="p-8 text-center text-xs text-slate-500">
                    Suhbat tarixi boʻsh
                  </div>
                )}
              </div>

              {/* Reply Input Bar */}
              <form onSubmit={handleSendReply} className="flex items-center space-x-2">
                <input
                  type="text"
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Operator nomidan toʻgʻridan-toʻgʻri Telegram mijoziga yozing..."
                  className="flex-1 bg-[#07080D] border border-white/[0.08] focus:border-amber-500/50 rounded-xl px-4 py-3 text-xs sm:text-sm text-white placeholder-slate-500 outline-none transition-all shadow-inner"
                />
                <button
                  type="submit"
                  disabled={!replyText.trim() || sending}
                  className="px-4 py-3 rounded-xl bg-gradient-to-b from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-white font-semibold text-xs shadow-md shadow-amber-600/30 active:scale-95 disabled:opacity-40 transition-all flex items-center gap-1.5"
                >
                  <Send className="w-4 h-4" />
                  <span className="hidden sm:inline">Yuborish</span>
                </button>
              </form>
            </>
          ) : (
            <div className="p-12 text-center text-xs text-slate-500 space-y-2 my-auto">
              <User className="w-10 h-10 mx-auto opacity-30 text-purple-400" />
              <p className="font-semibold text-slate-300">Chap tomondan biror suhbatni tanlang</p>
              <p className="text-slate-500 max-w-xs mx-auto">Mijozlar bilan inson operatori sifatida bevosita yozishishingiz mumkin.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
