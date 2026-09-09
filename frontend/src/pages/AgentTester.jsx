import React, { useState, useEffect, useRef } from "react";
import { api } from "../services/api";
import { 
  Bot, Send, User, Sparkles, CheckCircle, Mic, MicOff, 
  Volume2, VolumeX, Play, Square, Headphones, RefreshCw 
} from "lucide-react";

export default function AgentTester({ agents }) {
  const [selectedAgentId, setSelectedAgentId] = useState(agents?.[0]?.id || null);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(false);
  const [recording, setRecording] = useState(false);
  const [selectedVoice, setSelectedVoice] = useState("uz-UZ-MadinaNeural");
  const [playingMsgIndex, setPlayingMsgIndex] = useState(null);
  const [loadingTTS, setLoadingTTS] = useState(null);

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const currentAudioRef = useRef(null);

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

  const playTTS = async (text, idx) => {
    if (playingMsgIndex === idx && currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current = null;
      setPlayingMsgIndex(null);
      return;
    }

    try {
      setLoadingTTS(idx);
      const res = await api.generateSpeech(selectedAgentId, text, selectedVoice);
      if (res && res.audio_base64) {
        if (currentAudioRef.current) {
          currentAudioRef.current.pause();
        }
        const audio = new Audio(`data:${res.mime_type || "audio/mp3"};base64,${res.audio_base64}`);
        currentAudioRef.current = audio;
        setPlayingMsgIndex(idx);

        audio.onended = () => {
          setPlayingMsgIndex(null);
          currentAudioRef.current = null;
        };

        audio.onerror = () => {
          setPlayingMsgIndex(null);
          currentAudioRef.current = null;
        };

        await audio.play();
      }
    } catch (err) {
      console.error("TTS play error:", err);
    } finally {
      setLoadingTTS(null);
    }
  };

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
    <div className="space-y-4 pb-28 h-[calc(100vh-130px)] flex flex-col animate-fade-in text-white">
      {/* Top Selector Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#0a0c13]/90 backdrop-blur-xl border border-white/[0.08] p-3.5 rounded-2xl shadow-xl">
        <div className="flex items-center gap-2">
          <Bot className="w-5 h-5 text-purple-400" />
          <span className="text-xs font-bold uppercase tracking-wider text-white/60">Agent:</span>
          <select
            value={selectedAgentId || ""}
            onChange={(e) => setSelectedAgentId(e.target.value)}
            className="bg-[#12141d] border border-white/[0.08] text-xs font-semibold text-white rounded-xl px-3 py-1.5 focus:outline-none focus:border-purple-500/50"
          >
            {agents && agents.map(a => (
              <option key={a.id} value={a.id}>{a.name}</option>
            ))}
          </select>
        </div>

        {/* Voice Selector */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-white/50 flex items-center gap-1">
            <Volume2 className="w-3.5 h-3.5 text-emerald-400" /> Ovoz:
          </span>
          <select
            value={selectedVoice}
            onChange={(e) => setSelectedVoice(e.target.value)}
            className="bg-[#12141d] border border-white/[0.08] text-xs text-white rounded-xl px-2.5 py-1.5 focus:outline-none focus:border-emerald-500/50"
          >
            <option value="uz-UZ-MadinaNeural">👩 Madina (Ayol)</option>
            <option value="uz-UZ-SardorNeural">👨 Sardor (Erkak)</option>
          </select>
        </div>
      </div>

      {/* Chat Stream */}
      <div className="flex-1 overflow-y-auto space-y-3 p-4 rounded-2xl bg-[#06070a]/80 border border-white/[0.06] shadow-inner">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={"flex flex-col " + (msg.sender === "customer" ? "items-end" : "items-start")}
          >
            <div
              className={
                "max-w-[85%] sm:max-w-[75%] rounded-2xl p-3.5 text-xs sm:text-sm leading-relaxed shadow-lg " +
                (msg.sender === "customer"
                  ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-tr-sm"
                  : "bg-[#0e111a] text-white/90 border border-white/[0.08] rounded-tl-sm")
              }
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">{msg.text}</div>
                {msg.sender === "ai" && (
                  <button
                    onClick={() => playTTS(msg.text, idx)}
                    disabled={loadingTTS === idx}
                    className={`p-1.5 rounded-lg border transition shrink-0 ${
                      playingMsgIndex === idx
                        ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30 animate-pulse"
                        : "bg-white/[0.05] hover:bg-white/[0.1] text-white/60 hover:text-white border-white/[0.08]"
                    }`}
                    title={playingMsgIndex === idx ? "To'xtatish" : "Ovozli tinglash"}
                  >
                    {loadingTTS === idx ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-400" />
                    ) : playingMsgIndex === idx ? (
                      <Square className="w-3.5 h-3.5 fill-current" />
                    ) : (
                      <Volume2 className="w-3.5 h-3.5" />
                    )}
                  </button>
                )}
              </div>
            </div>

            {/* Simulated Lead Badge */}
            {msg.lead_data && msg.lead_data.has_lead && (
              <div className="mt-2 max-w-[85%] sm:max-w-[75%] rounded-2xl bg-emerald-950/40 border border-emerald-500/30 p-3 space-y-1 text-xs text-emerald-300 shadow-xl shadow-emerald-950/20 animate-fade-in">
                <div className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-[10px] text-emerald-400">
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>CRM ga Yangi Lid Saqlandi!</span>
                </div>
                <div className="text-white/90 font-medium">
                  <span>{msg.lead_data.customer_name || "Mijoz"}</span> • 
                  <span className="font-mono text-emerald-300 ml-1">{msg.lead_data.customer_phone}</span>
                </div>
                {msg.lead_data.summary && (
                  <p className="text-[11px] text-white/50 italic mt-0.5">{msg.lead_data.summary}</p>
                )}
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-2 text-white/50 p-2">
            <div className="w-2 h-2 rounded-full bg-purple-400 animate-bounce" />
            <div className="w-2 h-2 rounded-full bg-purple-400 animate-bounce delay-100" />
            <div className="w-2 h-2 rounded-full bg-purple-400 animate-bounce delay-200" />
            <span className="text-xs font-medium ml-1">Gemini AI o'ylamoqda...</span>
          </div>
        )}
      </div>

      {/* Input bar */}
      <form onSubmit={handleSendText} className="flex items-center gap-2 bg-[#0a0c13] p-2 rounded-2xl border border-white/[0.08]">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder={recording ? "🎙️ Ovoz yozilmoqda, to'xtatish uchun qizil tugmani bosing..." : "Matn yozing yoki mikrofon orqali gapiring..."}
          disabled={recording}
          className="flex-1 bg-transparent px-3 py-2 text-xs sm:text-sm text-white placeholder:text-white/30 focus:outline-none"
        />

        {recording ? (
          <button
            type="button"
            onClick={stopVoiceRecording}
            className="p-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-600/40 active:scale-95 animate-pulse"
            title="Ovozni yuborish"
          >
            <MicOff className="w-4 h-4" />
          </button>
        ) : (
          <button
            type="button"
            onClick={startVoiceRecording}
            className="p-2.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-emerald-400 border border-white/[0.08] active:scale-95 transition"
            title="Ovozli xabar yozish"
          >
            <Mic className="w-4 h-4" />
          </button>
        )}

        <button
          type="submit"
          disabled={!inputText.trim() || loading || recording}
          className="p-2.5 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white shadow-lg shadow-purple-500/20 active:scale-95 disabled:opacity-40 transition"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
