import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { api } from '../services/api';
import { Bot, Save, ArrowLeft, Sparkles, Building2, ShoppingBag, GraduationCap, Wrench, Key, Check } from 'lucide-react';

export default function BotConstructor() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const initialCategory = searchParams.get('category') || 'clinic';
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [templates, setTemplates] = useState({});
  const [formData, setFormData] = useState({
    name: '',
    category: initialCategory,
    bot_token: '',
    company_name: '',
    phone_number: '+998 ',
    address: '',
    working_hours: '09:00 - 18:00 (Dush-Shan)',
    system_prompt: '',
    welcome_message: ''
  });

  useEffect(() => {
    loadTemplates();
    if (id && id !== 'new') {
      loadAgent(id);
    }
  }, [id]);

  const loadTemplates = async () => {
    try {
      const data = await api.getTemplates();
      setTemplates(data);
      if (!id || id === 'new') {
        const tpl = data[initialCategory];
        if (tpl) {
          setFormData(prev => ({
            ...prev,
            name: tpl.name,
            system_prompt: tpl.system_prompt,
            welcome_message: tpl.welcome_message
          }));
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const loadAgent = async (agentId) => {
    try {
      setLoading(true);
      const agent = await api.getAgent(agentId);
      setFormData({
        name: agent.name || '',
        category: agent.category || 'clinic',
        bot_token: agent.bot_token || '',
        company_name: agent.company_name || '',
        phone_number: agent.phone_number || '',
        address: agent.address || '',
        working_hours: agent.working_hours || '',
        system_prompt: agent.system_prompt || '',
        welcome_message: agent.welcome_message || ''
      });
    } catch (err) {
      alert('Agentni yuklashda xatolik yuz berdi');
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryChange = (catKey) => {
    const tpl = templates[catKey];
    setFormData(prev => ({
      ...prev,
      category: catKey,
      name: tpl ? tpl.name : prev.name,
      system_prompt: tpl ? tpl.system_prompt : prev.system_prompt,
      welcome_message: tpl ? tpl.welcome_message : prev.welcome_message
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.bot_token) {
      alert('Iltimos, @BotFather dan olingan Bot Tokenni kiriting!');
      return;
    }

    try {
      setLoading(true);
      if (id && id !== 'new') {
        await api.updateAgent(id, formData);
        alert('Agent muvaffaqiyatli yangilandi!');
      } else {
        const res = await api.createAgent(formData);
        alert('Agent muvaffaqiyatli yaratildi!');
        navigate(`/agents/${res.agent_id}`);
        return;
      }
      navigate('/agents');
    } catch (err) {
      alert(err.message || 'Xatolik yuz berdi');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 pb-24">
      {/* Header */}
      <div className="flex items-center space-x-3">
        <button onClick={() => navigate(-1)} className="p-2 rounded-xl bg-tg-surface hover:bg-tg-surfaceHover border border-tg-border">
          <ArrowLeft className="w-5 h-5 text-tg-textSecondary" />
        </button>
        <div>
          <h2 className="text-lg font-bold text-white">
            {id && id !== 'new' ? 'Agentni Tahrirlash' : 'Yangi AI Agent Yaratish'}
          </h2>
          <p className="text-xs text-tg-textSecondary">Bot shablonini tanlang va sozlang</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Shablon Tanlash */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-tg-textSecondary uppercase tracking-wider">
            1. Soha Shablonini Tanlang
          </label>
          <div className="grid grid-cols-2 gap-2.5">
            {[
              { id: 'clinic', name: 'Klinika / Stomatologiya', icon: Building2 },
              { id: 'shop', name: 'Kiyim / Do'kon', icon: ShoppingBag },
              { id: 'education', name: 'O'quv Markazi', icon: GraduationCap },
              { id: 'craftsman', name: 'Usta / Servis', icon: Wrench },
            ].map(item => {
              const Icon = item.icon;
              const isSelected = formData.category === item.id;
              return (
                <div
                  key={item.id}
                  onClick={() => handleCategoryChange(item.id)}
                  className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center space-x-2.5 ${
                    isSelected 
                      ? 'bg-blue-600/20 border-blue-500 text-white font-semibold' 
                      : 'bg-tg-surface border-tg-border text-tg-textSecondary hover:text-white'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isSelected ? 'text-blue-400' : ''}`} />
                  <span className="text-xs">{item.name}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Asosiy ma'lumotlar */}
        <div className="bg-tg-surface border border-tg-border rounded-xl p-4 space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-white">Agent Nomi</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              placeholder="Masalan: Dental Lor Med AI"
              className="w-full bg-tg-bg border border-tg-border rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-white">Telegram Bot Token (@BotFather)</label>
              <a href="https://t.me/BotFather" target="_blank" rel="noreferrer" className="text-[11px] text-blue-400 hover:underline">
                Token olish
              </a>
            </div>
            <div className="relative">
              <Key className="w-4 h-4 text-tg-textSecondary absolute left-3.5 top-3.5" />
              <input
                type="text"
                required
                value={formData.bot_token}
                onChange={e => setFormData({ ...formData, bot_token: e.target.value })}
                placeholder="7823489123:AAH_xxxxxxxxx..."
                className="w-full bg-tg-bg border border-tg-border rounded-xl pl-10 pr-3.5 py-2.5 text-sm font-mono text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Aloqa va Tashkilot */}
        <div className="bg-tg-surface border border-tg-border rounded-xl p-4 space-y-3">
          <h3 className="text-xs font-semibold text-tg-textSecondary uppercase tracking-wider">
            2. Tashkilot va Aloqa Ma'lumotlari
          </h3>
          
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs text-tg-textSecondary">Kompaniya nomi</label>
              <input
                type="text"
                value={formData.company_name}
                onChange={e => setFormData({ ...formData, company_name: e.target.value })}
                placeholder="Dental Med Clinic"
                className="w-full bg-tg-bg border border-tg-border rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs text-tg-textSecondary">Telefon raqam</label>
              <input
                type="text"
                value={formData.phone_number}
                onChange={e => setFormData({ ...formData, phone_number: e.target.value })}
                placeholder="+998 90 123 45 67"
                className="w-full bg-tg-bg border border-tg-border rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs text-tg-textSecondary">Manzil</label>
            <input
              type="text"
              value={formData.address}
              onChange={e => setFormData({ ...formData, address: e.target.value })}
              placeholder="Toshkent sh., Yunusobod tumani, 4-mavze"
              className="w-full bg-tg-bg border border-tg-border rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs text-tg-textSecondary">Ish vaqti</label>
            <input
              type="text"
              value={formData.working_hours}
              onChange={e => setFormData({ ...formData, working_hours: e.target.value })}
              placeholder="09:00 - 19:00 (Har kuni)"
              className="w-full bg-tg-bg border border-tg-border rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        {/* AI System Prompt */}
        <div className="bg-tg-surface border border-tg-border rounded-xl p-4 space-y-3">
          <div className="flex items-center space-x-1.5">
            <Sparkles className="w-4 h-4 text-blue-400" />
            <label className="text-xs font-semibold text-white">AI Xarakteri va Asosiy Prompti</label>
          </div>
          <textarea
            rows="4"
            value={formData.system_prompt}
            onChange={e => setFormData({ ...formData, system_prompt: e.target.value })}
            className="w-full bg-tg-bg border border-tg-border rounded-xl p-3 text-xs text-white leading-relaxed focus:outline-none focus:border-blue-500 font-mono"
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-xl shadow-blue-600/30 flex items-center justify-center space-x-2 transition-all disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          <span>{loading ? 'Saqlanmoqda...' : 'Agentni Saqlash va Faollashtirish'}</span>
        </button>
      </form>
    </div>
  );
}
