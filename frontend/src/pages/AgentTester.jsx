import React, { useState, useEffect, useRef } from "react";
import { api } from "../services/api";
import { Bot, Send, User, Sparkles, CheckCircle, Mic, MicOff, Volume2 } from "lucide-react";

export default function AgentTester({ agents }) {
  const [selectedAgentId, setSelectedAgentId] = useState(agents?.[0]?.id || null);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(false);
  const [recording, setRecording] = useState(false);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  useEffect(() => {
    if (agents && agents.length > 0 && !selectedAgentId) {
      setSelectedAgentId(agents[0].id);
    }
  }, [agents]);

  useEffect(() => {
    if (selectedAgentId) {
      const curAgent = agents?.find(a => a.id === Number(selectedAgentId));
      setMessages([
        {
          sender: "ai",
          text: curAgent?.welcome_message || "Assalomu alaykum! Sizga qanday yordam bera olaman?"
        }
      ]);
    }
  }, [selectedAgentId]);

  const handleSendText = async (e) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || !selectedAgentId || loading) return;

    const userMsg = inputText.trim();
    setInputText("");
    setMessages(prev => [...prev, { sender: "customer", text: userMsg }]);

    try {
      setLoading(true);
      const res = await api.testAgent(selectedAgentId, userMsg);
      setMessages(prev => [
        ...prev,
        {
          sender: "ai",
          text: res.reply,
          lead_data: res.lead_data
        }
      ]);
    } catch (err) {
      setMessages(prev => [
        ...prev,
        { sender: "ai", text: "Kechirasiz, javob olishda xatolik yuz berdi: " + err.message }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const startVoiceRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/ogg" });
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = async () => {
          const base64Audio = reader.result.split(",")[1];
          setMessages(prev => [...prev, { sender: "customer", text: "🎙️ [Ovozli xabar yuborildi]" }]);
          try {
            setLoading(true);
            const res = await api.testAgent(selectedAgentId, null, base64Audio, "audio/ogg");
            setMessages(prev => [
              ...prev,
              {
                sender: "ai",
                text: res.reply,
                lead_data: res.lead_data
              }
            ]);
          } catch (err) {
            setMessages(prev => [
              ...prev,
              { sender: "ai", text: "Ovozni tushunishda xatolik: " + err.message }
            ]);
          } finally {
            setLoading(false);
          }
        };
      };

      mediaRecorderRef.current.start();
      setRecording(true);
    } catch (err) {
      alert("Mikrofonga ruxsat berilmadi: " + err.message);
    }
  };

  const stopVoiceRecording = () => {
    if (mediaRecorderRef.current && recording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      setRecording(false);
    }
  };

  return (
    <div className="space-y-4 pb-28 h-[calc(100vh-140px)] flex flex-col">
      {/* Top Selector Bar */}
      <div className="flex items-center justify-between bg-[#0E121B]/90 backdrop-blur-xl border border-white/[0.07] p-3 rounded-2xl shadow-md">
        <div className="flex items-center space-x-2">
          <Bot className="w-5 h-5 text-blue-400" />
          <span className="text-xs font-bold uppercase tracking-wider text-slate-300">Agent:</span>
          <select
            value={selectedAgentId || ""}
            onChange={(e) => setSelectedAgentId(e.target.value)}
            className="bg-[#07080D] border border-white/[0.08] text-xs font-semibold text-white rounded-xl px-3 py-1.5 outline-none"
          >
            {agents && agents.map(a => (
              <option key={a.id} value={a.id}>{a.name}</option>
            ))}
          </select>
        </div>
        <div className="inline-flex items-center space-x-1.5 text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>Ovoz & Matn Faol</span>
        </div>
      </div>

      {/* Chat Stream */}
      <div className="flex-1 overflow-y-auto space-y-3 p-3 rounded-2xl bg-[#07080D]/90 border border-white/[0.06] shadow-inner">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={"flex flex-col " + (msg.sender === "customer" ? "items-end" : "items-start")}
          >
            <div
              className={
                "max-w-[85%] rounded-2xl px-4 py-2.5 text-xs sm:text-sm leading-relaxed shadow-md " +
                (msg.sender === "customer"
                  ? "bg-gradient-to-b from-blue-500 to-blue-600 text-white rounded-tr-sm"
                  : "bg-[#0E121B] text-slate-100 border border-white/[0.08] rounded-tl-sm")
              }
            >
              {msg.text}
            </div>

            {/* Simulated Lead Badge */}
            {msg.lead_data && msg.lead_data.has_lead && (
              <div className="mt-2 max-w-[85%] rounded-xl bg-emerald-950/40 border border-emerald-500/30 p-3 space-y-1 text-xs text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.15)] animate-fade-in">
                <div className="flex items-center space-x-1.5 font-bold uppercase tracking-wider text-[10px] text-emerald-400">
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>CRM ga Yangi Lid Saqlandi!</span>
                </div>
                <div className="text-slate-200">
                  <span className="font-semibold">{msg.lead_data.customer_name || "Mijoz"}</span> • 
                  <span className="font-mono text-emerald-300 ml-1">{msg.lead_data.customer_phone}</span>
                </div>
                {msg.lead_data.summary && (
                  <p className="text-[11px] text-slate-400 italic mt-0.5">{msg.lead_data.summary}</p>
                )}
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex items-center space-x-2 text-slate-400 p-2">
            <div className="w-2 h-2 rounded-full bg-blue-400 animate-bounce" />
            <div className="w-2 h-2 rounded-full bg-blue-400 animate-bounce delay-100" />
            <div className="w-2 h-2 rounded-full bg-blue-400 animate-bounce delay-200" />
            <span className="text-xs text-slate-500 font-medium ml-1">Gemini AI tahlil qilmoqda...</span>
          </div>
        )}
      </div>

      {/* Input bar */}
      <form onSubmit={handleSendText} className="flex items-center space-x-2">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder={recording ? "Ovoz yozilmoqda..." : "Matn yozing yoki mikrofon orqali gapiring..."}
          disabled={recording}
          className="flex-1 bg-[#0E121B] border border-white/[0.08] focus:border-blue-500/50 rounded-xl px-4 py-3 text-xs sm:text-sm text-white placeholder-slate-500 outline-none transition-all shadow-inner"
        />

        {recording ? (
          <button
            type="button"
            onClick={stopVoiceRecording}
            className="p-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-600/40 active:scale-95 animate-pulse"
            title="Ovozni yuborish"
          >
            <MicOff className="w-4 h-4" />
          </button>
        ) : (
          <button
            type="button"
            onClick={startVoiceRecording}
            className="p-3 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] text-slate-300 hover:text-white border border-white/[0.08] active:scale-95 transition-all"
            title="Ovozli xabar yozish"
          >
            <Mic className="w-4 h-4 text-emerald-400" />
          </button>
        )}

        <button
          type="submit"
          disabled={!inputText.trim() || loading || recording}
          className="p-3 rounded-xl bg-gradient-to-b from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500 text-white shadow-md shadow-blue-600/30 active:scale-95 disabled:opacity-40 transition-all"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
