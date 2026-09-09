import React, { useState, useEffect } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { api } from "../services/api";
import { 
  Save, ArrowLeft, Sparkles, Building2, ShoppingBag, 
  GraduationCap, Wrench, Key, BookOpen, Check, Wand2, X 
} from "lucide-react";

export default function BotConstructor() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const initialCategory = searchParams.get("category") || "clinic";
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [templates, setTemplates] = useState({});
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [showAIPromptModal, setShowAIPromptModal] = useState(false);
  const [aiPromptDesc, setAiPromptDesc] = useState("");
  const [generatingPrompt, setGeneratingPrompt] = useState(false);
  const [customCategoryName, setCustomCategoryName] = useState("");
  
  const [formData, setFormData] = useState({
    name: "",
    category: initialCategory,
    bot_token: "",
    company_name: "",
    phone_number: "+998 ",
    address: "",
    working_hours: "09:00 - 18:00 (Dush-Shan)",
    system_prompt: "",
    welcome_message: ""
  });

  const categories = [
    { id: "clinic", label: "Klinika", icon: Building2 },
    { id: "shop", label: "Do‘kon", icon: ShoppingBag },
    { id: "education", label: "O‘quv Markaz", icon: GraduationCap },
    { id: "craftsman", label: "Servis", icon: Wrench },
    { id: "custom", label: "Maxsus / Oʻz Sohangiz", icon: Wand2 },
  ];

  useEffect(() => {
    loadTemplates();
    if (id && id !== "new") {
      loadAgent(id);
    }
  }, [id]);

  const loadTemplates = async () => {
    try {
      const data = await api.getTemplates();
      setTemplates(data);
      if (!id || id === "new") {
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
        name: agent.name || "",
        category: agent.category || "clinic",
        bot_token: agent.bot_token || "",
        company_name: agent.company_name || "",
        phone_number: agent.phone_number || "",
        address: agent.address || "",
        working_hours: agent.working_hours || "",
        system_prompt: agent.system_prompt || "",
        welcome_message: agent.welcome_message || ""
      });
      if (!["clinic", "shop", "education", "craftsman"].includes(agent.category)) {
        setCustomCategoryName(agent.category);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCategorySelect = (catId) => {
    setFormData(prev => {
      const tpl = templates[catId];
      return {
        ...prev,
        category: catId === "custom" ? (customCategoryName || "Maxsus Biznes") : catId,
        name: (!id || id === "new") && tpl ? tpl.name : prev.name,
        system_prompt: (!id || id === "new") && tpl ? tpl.system_prompt : prev.system_prompt,
        welcome_message: (!id || id === "new") && tpl ? tpl.welcome_message : prev.welcome_message
      };
    });
  };

  const handleGeneratePromptWithAI = async (e) => {
    e.preventDefault();
    if (!aiPromptDesc.trim()) return;

    try {
      setGeneratingPrompt(true);
      const res = await api.generateAIPrompt(aiPromptDesc.trim(), formData.category);
      setFormData(prev => ({
        ...prev,
        name: res.suggested_name || prev.name,
        system_prompt: res.system_prompt || prev.system_prompt,
        welcome_message: res.welcome_message || prev.welcome_message
      }));
      setShowAIPromptModal(false);
      setAiPromptDesc("");
    } catch (err) {
      alert(err.message || "AI prompt yaratishda xatolik yuz berdi");
    } finally {
      setGeneratingPrompt(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      let targetAgentId = id;
      if (id && id !== "new") {
        const res = await api.updateAgent(id, formData);
        targetAgentId = res.id || res.agent_id || id;
      } else {
        const res = await api.createAgent(formData);
        targetAgentId = res.id || res.agent_id;
      }
      setSavedSuccess(true);
      setTimeout(() => {
        if (targetAgentId) {
          navigate(`/agents/${targetAgentId}/knowledge`);
        } else {
          navigate("/agents");
        }
      }, 700);
    } catch (err) {
      alert(err.message || "Saqlashda xatolik yuz berdi");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12 text-slate-400">
        <div className="w-8 h-8 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-32">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <button 
            type="button"
            onClick={() => navigate(-1)}
            className="p-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] active:scale-95 border border-white/[0.08] text-slate-300 transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h2 className="text-base sm:text-lg font-extrabold text-white tracking-tight">
              {id && id !== "new" ? "Agent Sozlamalari" : "Yangi AI Agent Yaratish"}
            </h2>
            <p className="text-xs text-slate-400">
              Istalgan soha uchun erkin, qoliplarga cheklanmagan AI operator yarating
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowAIPromptModal(true)}
          className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white border border-purple-400/30 text-xs font-semibold shadow-lg shadow-purple-500/20 active:scale-95 transition-all"
        >
          <Sparkles className="w-3.5 h-3.5 animate-pulse" />
          <span>✨ AI Bilan Yaratish</span>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Category Segmented Control */}
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
            Soha / Biznes Yoʻnalishi
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {categories.map((cat) => {
              const Icon = cat.icon;
              const isSelected = formData.category === cat.id || (cat.id === "custom" && !["clinic", "shop", "education", "craftsman"].includes(formData.category));
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => handleCategorySelect(cat.id)}
                  className={
                    "flex items-center space-x-2.5 p-3 rounded-xl border transition-all text-left " +
                    (isSelected
                      ? "bg-blue-600/15 border-blue-500/40 text-white shadow-[0_0_15px_rgba(59,130,246,0.2)]"
                      : "bg-[#0E121B]/80 border-white/[0.07] text-slate-400 hover:text-white hover:border-white/[0.14]")
                  }
                >
                  <Icon className={"w-4 h-4 " + (isSelected ? "text-blue-400" : "text-slate-400")} />
                  <span className="text-xs font-semibold truncate">{cat.label}</span>
                </button>
              );
            })}
          </div>

          {!["clinic", "shop", "education", "craftsman"].includes(formData.category) && (
            <div className="pt-1.5 animate-fade-in">
              <input
                type="text"
                value={customCategoryName}
                onChange={(e) => {
                  setCustomCategoryName(e.target.value);
                  setFormData(prev => ({ ...prev, category: e.target.value || "custom" }));
                }}
                placeholder="Oʻz sohangiz nomini kiriting (masalan: Restoran, Avtosalon, Mehmonxona, Mebel ishlab chiqarish...)"
                className="w-full bg-[#07080D] border border-blue-500/40 focus:border-blue-500 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 outline-none"
              />
            </div>
          )}
        </div>

        {/* Basic Info */}
        <div className="rounded-2xl bg-[#0E121B]/90 backdrop-blur-xl border border-white/[0.07] p-4 sm:p-5 space-y-4 shadow-[0_4px_24px_rgba(0,0,0,0.4)]">
          <h3 className="text-xs font-bold uppercase tracking-wider text-blue-400 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Asosiy Maʻlumotlar</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300">Agent Nomi</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Masalan: Samarqand Oshxona AI"
                className="w-full bg-[#07080D] border border-white/[0.08] focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 transition-all outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300">Tashkilot / Kompaniya Nomi</label>
              <input
                type="text"
                value={formData.company_name}
                onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                placeholder="Masalan: Samarqand Oshxonasi MCHJ"
                className="w-full bg-[#07080D] border border-white/[0.08] focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 transition-all outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300">Telefon Raqam</label>
              <input
                type="text"
                value={formData.phone_number}
                onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                placeholder="+998 90 123 45 67"
                className="w-full bg-[#07080D] border border-white/[0.08] focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 transition-all outline-none font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300">Manzil</label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Toshkent sh., Chilonzor 9"
                className="w-full bg-[#07080D] border border-white/[0.08] focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 transition-all outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300">Ish Vaqti</label>
              <input
                type="text"
                value={formData.working_hours}
                onChange={(e) => setFormData({ ...formData, working_hours: e.target.value })}
                placeholder="09:00 - 22:00 (Har kuni)"
                className="w-full bg-[#07080D] border border-white/[0.08] focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 transition-all outline-none"
              />
            </div>
          </div>
        </div>

        {/* Telegram Bot Token */}
        <div className="rounded-2xl bg-[#0E121B]/90 backdrop-blur-xl border border-white/[0.07] p-4 sm:p-5 space-y-3 shadow-[0_4px_24px_rgba(0,0,0,0.4)]">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
              <Key className="w-3.5 h-3.5" />
              <span>Telegram Bot Tokeni (Ixtiyoriy)</span>
            </h3>
            <span className="text-[11px] text-slate-400">@BotFather orqali olinadi</span>
          </div>

          <input
            type="text"
            value={formData.bot_token}
            onChange={(e) => setFormData({ ...formData, bot_token: e.target.value })}
            placeholder="123456789:ABCdefGHIjklMNOpqrSTUvwxYZ..."
            className="w-full bg-[#07080D] border border-white/[0.08] focus:border-amber-500/50 focus:ring-4 focus:ring-amber-500/10 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 transition-all outline-none font-mono"
          />
          <p className="text-[11px] text-slate-400">
            Alohida mijoz boti tokenini kiritsangiz, mijozlar toʻgʻridan-toʻgʻri oʻsha botingizga yozishadi va AI javob qaytaradi.
          </p>
        </div>

        {/* AI Personality & System Prompt */}
        <div className="rounded-2xl bg-[#0E121B]/90 backdrop-blur-xl border border-white/[0.07] p-4 sm:p-5 space-y-4 shadow-[0_4px_24px_rgba(0,0,0,0.4)]">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-purple-400 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>AI Xarakteri & Koʻrsatmalar</span>
            </h3>

            <button
              type="button"
              onClick={() => setShowAIPromptModal(true)}
              className="text-xs font-semibold text-purple-400 hover:text-purple-300 flex items-center gap-1"
            >
              <Wand2 className="w-3.5 h-3.5" />
              <span>AI bilan avtomatik yozish</span>
            </button>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-300">Salomlashish Xabari (/start)</label>
            <input
              type="text"
              value={formData.welcome_message}
              onChange={(e) => setFormData({ ...formData, welcome_message: e.target.value })}
              placeholder="Assalomu alaykum! Xizmatimizga xush kelibsiz..."
              className="w-full bg-[#07080D] border border-white/[0.08] focus:border-purple-500/50 focus:ring-4 focus:ring-purple-500/10 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 transition-all outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-300">Tizim Koʻrsatmasi (System Prompt)</label>
            <textarea
              rows={4}
              value={formData.system_prompt}
              onChange={(e) => setFormData({ ...formData, system_prompt: e.target.value })}
              placeholder="Siz kompaniyaning aqlli va xushmuomala AI konsultantisiz..."
              className="w-full bg-[#07080D] border border-white/[0.08] focus:border-purple-500/50 focus:ring-4 focus:ring-purple-500/10 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 transition-all outline-none leading-relaxed"
            />
          </div>
        </div>

        {/* Submit Action Button */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={saving}
            className="w-full inline-flex items-center justify-center space-x-2 py-3.5 px-6 rounded-xl bg-gradient-to-b from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500 text-white font-bold text-sm shadow-[0_0_25px_-4px_rgba(59,130,246,0.6),inset_0_1px_0_rgba(255,255,255,0.3)] active:scale-98 transition-all duration-150 disabled:opacity-50"
          >
            {savedSuccess ? (
              <>
                <Check className="w-5 h-5 text-white" />
                <span>Muvaffaqiyatli Saqlandi!</span>
              </>
            ) : saving ? (
              <>
                <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                <span>Saqlanmoqda...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Agentni Saqlash & Bilimlar Bazasi</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* AI Prompt Generator Modal */}
      {showAIPromptModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-lg rounded-2xl bg-[#0E121B] border border-white/[0.12] p-5 sm:p-6 space-y-4 shadow-2xl animate-scale-up">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
              <h3 className="font-bold text-base text-white flex items-center gap-2">
                <Wand2 className="w-5 h-5 text-purple-400" />
                <span>AI Prompt Generator (Erkin Soha)</span>
              </h3>
              <button 
                onClick={() => setShowAIPromptModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleGeneratePromptWithAI} className="space-y-4">
              <p className="text-xs text-slate-300 leading-relaxed">
                Biznesingiz haqida 1-2 jumlada yozing. Gemini AI siz uchun mukammal agent nomi, salomlashish matni va professional tizim koʻrsatmasini tuzib beradi.
              </p>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300">Biznesingiz Tavsifi</label>
                <textarea
                  rows={4}
                  required
                  value={aiPromptDesc}
                  onChange={(e) => setAiPromptDesc(e.target.value)}
                  placeholder="Masalan: Biz Toshkentda mebel ishlab chiqaramiz va buyurtma asosida oshxona garniturlarini yasaymiz. Bepul o'lchov olish mavjud..."
                  className="w-full bg-[#07080D] border border-white/[0.08] focus:border-purple-500/50 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 outline-none leading-relaxed"
                />
              </div>

              <div className="pt-2 flex items-center justify-end space-x-2.5">
                <button
                  type="button"
                  onClick={() => setShowAIPromptModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 text-xs font-semibold"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  disabled={generatingPrompt}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-b from-purple-600 to-indigo-600 text-white text-xs font-semibold shadow-md active:scale-95 disabled:opacity-50 flex items-center gap-1.5"
                >
                  <Sparkles className={"w-3.5 h-3.5 " + (generatingPrompt ? "animate-spin" : "")} />
                  <span>{generatingPrompt ? "Generatsiya qilinmoqda..." : "Promptni Yaratish"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
