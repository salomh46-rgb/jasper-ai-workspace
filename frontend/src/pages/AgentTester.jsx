import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Bot, Send, User, Sparkles, AlertCircle } from 'lucide-react';

export default function AgentTester({ agents }) {
  const [selectedAgentId, setSelectedAgentId] = useState(agents?.[0]?.id || null);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (agents && agents.length > 0 && !selectedAgentId) {
      setSelectedAgentId(agents[0].id);
    }
  }, [agents]);

  useEffect(() => {
    // Reset conversation on agent change
    if (selectedAgentId) {
      const curAgent = agents?.find(a => a.id === Number(selectedAgentId));
      setMessages([
        {
          sender: 'ai',
          text: curAgent?.welcome_message || 'Assalomu alaykum! Sizga qanday yordam bera olaman?'
        }
      ]);
    }
  }, [selectedAgentId]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!inputText.trim() || !selectedAgentId || loading) return;

    const userMsg = inputText.trim();
    setInputText('');
    setMessages(prev => [...prev, { sender: 'customer', text: userMsg }]);

    try {
      setLoading(true);
      const res = await api.testAgent(selectedAgentId, userMsg);
      setMessages(prev => [
        ...prev,
        {
          sender: 'ai',
          text: res.reply,
          lead_data: res.lead_data
        }
      ]);
    } catch (err) {
      setMessages(prev => [
        ...prev,
        { sender: 'ai', text: 'Kechirasiz, javob olishda xatolik yuz berdi: ' + err.message }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 pb-24 h-[calc(100vh-140px)] flex flex-col">
      {/* Top selector */}
      <div className="flex items-center justify-between bg-tg-surface border border-tg-border rounded-xl p-3">
        <div className="flex items-center space-x-2">
          <Bot className="w-5 h-5 text-blue-400" />
          <span className="text-xs font-semibold text-white">Sinov Agenti:</span>
        </div>
        <select
          value={selectedAgentId || ''}
          onChange={e => setSelectedAgentId(e.target.value)}
          className="bg-tg-bg border border-tg-border rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500 font-medium"
        >
          {agents?.map(a => (
            <option key={a.id} value={a.id}>{a.name}</option>
          ))}
        </select>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto space-y-3 p-2">
        {messages.map((m, idx) => (
          <div
            key={idx}
            className={`flex items-start space-x-2.5 ${m.sender === 'customer' ? 'flex-row-reverse space-x-reverse' : ''}`}
          >
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs shrink-0 ${
              m.sender === 'customer' ? 'bg-blue-600 text-white' : 'bg-tg-surface border border-blue-500/30 text-blue-400'
            }`}>
              {m.sender === 'customer' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
            </div>

            <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-xs leading-relaxed space-y-2 ${
              m.sender === 'customer'
                ? 'bg-blue-600 text-white rounded-tr-none'
                : 'bg-tg-surface border border-tg-border text-white rounded-tl-none shadow-md'
            }`}>
              <p className="whitespace-pre-wrap">{m.text}</p>
              
              {m.lead_data && (
                <div className="p-2 rounded bg-emerald-500/10 border border-emerald-500/30 text-[11px] text-emerald-300 space-y-0.5">
                  <div className="font-bold flex items-center space-x-1">
                    <Sparkles className="w-3 h-3 text-emerald-400" />
                    <span>Lid Aniqlindi!</span>
                  </div>
                  {m.lead_data.customer_name && <div>Ism: {m.lead_data.customer_name}</div>}
                  {m.lead_data.customer_phone && <div>Tel: {m.lead_data.customer_phone}</div>}
                </div>
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex items-center space-x-2 text-tg-textSecondary text-xs p-2">
            <Bot className="w-4 h-4 animate-bounce text-blue-400" />
            <span>AI javob yozmoqda...</span>
          </div>
        )}
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="flex items-center space-x-2 pt-2">
        <input
          type="text"
          value={inputText}
          onChange={e => setInputText(e.target.value)}
          placeholder="AI agentga savol bering (masalan: Narxlar qancha?)..."
          className="flex-1 bg-tg-surface border border-tg-border rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-blue-500 placeholder:text-tg-textSecondary"
        />
        <button
          type="submit"
          disabled={!inputText.trim() || loading}
          className="p-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-xl shadow-lg shadow-blue-600/30 transition-all"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
