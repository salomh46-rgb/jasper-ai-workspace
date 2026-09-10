import React, { useState, useEffect } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { api } from "../services/api";
import { useLanguage } from "../i18n/LanguageContext";
import { 
  Save, ArrowLeft, Sparkles, Building2, ShoppingBag, 
  GraduationCap, Wrench, Key, BookOpen, Check, Wand2, X, Trash2,
  Activity, Utensils, Home, ArrowRight, ShieldCheck, CheckCircle2,
  AlertCircle, Bot, Phone, MapPin, Clock, CreditCard, ExternalLink,
  ChevronRight, RefreshCw, Layers
} from "lucide-react";

export default function BotConstructor() {
  const { t } = useLanguage();
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const initialCategory = searchParams.get("category") || "clinic";
  const navigate = useNavigate();

  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [templates, setTemplates] = useState({});
  const [savedSuccess, setSavedSuccess] = useState(false);
  
  // AI Wizard State
  const [generatingPack, setGeneratingPack] = useState(false);
  const [generatedKnowledge, setGeneratedKnowledge] = useState([]);
  const [aiGeneratedSuccess, setAiGeneratedSuccess] = useState(false);
  
  // Token Validation State
  const [validatingToken, setValidatingToken] = useState(false);
  const [tokenValidation, setTokenValidation] = useState(null);

  const [customCategoryName, setCustomCategoryName] = useState("");
  const [showAdvancedPayments, setShowAdvancedPayments] = useState(false);
  
  const [formData, setFormData] = useState({
    name: "",
    category: initialCategory,
    bot_token: "",
    company_name: "",
    phone_number: "+998 ",
    address: "",
    working_hours: "09:00 - 18:00 (Dush-Shan)",
    system_prompt: "",
    welcome_message: "",
    click_service_id: "",
    click_merchant_id: "",
    payme_merchant_id: "",
    uzum_card_number: ""
  });

  const categories = [
    { id: "clinic", label: t("cat_clinic") || "Klinika & Stomatologiya", icon: Building2, color: "from-blue-500/20 to-cyan-500/20" },
    { id: "shop", label: t("cat_shop") || "Kiyim & Do'kon", icon: ShoppingBag, color: "from-purple-500/20 to-pink-500/20" },
    { id: "restaurant", label: t("cat_restaurant") || "Restoran & Kafe", icon: Utensils, color: "from-amber-500/20 to-orange-500/20" },
    { id: "education", label: t("cat_education") || "O'quv Markaz & IT", icon: GraduationCap, color: "from-emerald-500/20 to-teal-500/20" },
    { id: "emergency", label: t("cat_emergency") || "Tez Yordam (103)", icon: Activity, color: "from-red-500/20 to-rose-500/20" },
    { id: "craftsman", label: t("cat_craftsman") || "Usta & Servis", icon: Wrench, color: "from-yellow-500/20 to-amber-500/20" },
    { id: "realestate", label: t("cat_realestate") || "Ko'chmas Mulk", icon: Home, color: "from-indigo-500/20 to-blue-500/20" },
    { id: "custom", label: t("cat_custom") || "O'z Sohangiz", icon: Wand2, color: "from-violet-500/20 to-fuchsia-500/20" },
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
            name: prev.name || tpl.name,
            system_prompt: prev.system_prompt || tpl.system_prompt,
            welcome_message: prev.welcome_message || tpl.welcome_message
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
        welcome_message: agent.welcome_message || "",
        click_service_id: agent.click_service_id || "",
        click_merchant_id: agent.click_merchant_id || "",
        payme_merchant_id: agent.payme_merchant_id || "",
        uzum_card_number: agent.uzum_card_number || ""
      });
      if (agent.bot_token) {
        validateTelegramToken(agent.bot_token);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const validateTelegramToken = async (token) => {
    const clean = (token || "").trim();
    if (!clean || clean.length < 15 || !clean.includes(":")) {
      setTokenValidation(null);
      return;
    }
    try {
      setValidatingToken(true);
      const res = await api.validateToken(clean);
      setTokenValidation(res);
    } catch (e) {
      setTokenValidation({ valid: false, error: "Tekshirishda xatolik" });
    } finally {
      setValidatingToken(false);
    }
  };

  const handleCategorySelect = (catId) => {
    setFormData(prev => {
      const tpl = templates[catId];
      return {
        ...prev,
        category: catId,
        name: prev.company_name ? `${prev.company_name} AI Xodimi` : (tpl ? tpl.name : prev.name),
        system_prompt: tpl ? tpl.system_prompt : prev.system_prompt,
        welcome_message: tpl ? tpl.welcome_message : prev.welcome_message
      };
    });
  };

  const handleOneClickAIGenerate = async () => {
    const bName = formData.company_name.trim() || formData.name.trim() || "Mening Biznesim";
    try {
      setGeneratingPack(true);
      setAiGeneratedSuccess(false);
      const res = await api.generateAIWizard({
        business_name: bName,
        category: formData.category === "custom" && customCategoryName ? customCategoryName : formData.category,
        phone: formData.phone_number,
        address: formData.address
      });

      if (res) {
        setFormData(prev => ({
          ...prev,
          name: res.name || `${bName} AI Xodimi`,
          company_name: prev.company_name || bName,
          system_prompt: res.system_prompt || prev.system_prompt,
          welcome_message: res.welcome_message || prev.welcome_message
        }));

        if (res.knowledge_items && Array.isArray(res.knowledge_items)) {
          setGeneratedKnowledge(res.knowledge_items);
        }
        setAiGeneratedSuccess(true);
      }
    } catch (err) {
      alert("AI generatsiyasida xatolik: " + (err.message || "Qayta urinib ko'ring"));
    } finally {
      setGeneratingPack(false);
    }
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!formData.name.trim()) {
      setCurrentStep(1);
      alert("Iltimos, biznesingiz nomini kiriting!");
      return;
    }

    try {
      setSaving(true);
      const payload = {
        ...formData,
        category: formData.category === "custom" && customCategoryName ? customCategoryName : formData.category,
        custom_knowledge_items: generatedKnowledge.length > 0 ? generatedKnowledge : undefined
      };

      if (id && id !== "new") {
        await api.updateAgent(id, payload);
      } else {
        const res = await api.createAgent(payload);
        if (res.id || res.agent_id) {
          const newAgentId = res.id || res.agent_id;
          setSavedSuccess(true);
          setTimeout(() => {
            navigate(`/knowledge/${newAgentId}`);
          }, 1000);
          return;
        }
      }
      setSavedSuccess(true);
      setTimeout(() => {
        navigate("/");
      }, 1000);
    } catch (err) {
      alert(err.message || "Saqlashda xatolik yuz berdi");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-400 font-medium">Yuklanmoqda...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-24 max-w-4xl mx-auto px-2">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <button 
            onClick={() => navigate(-1)}
            className="p-2.5 rounded-xl bg-gray-900/80 border border-gray-800 text-gray-400 hover:text-white hover:bg-gray-800 transition active:scale-95 shadow-sm"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-white flex items-center gap-2">
              <Bot className="w-6 h-6 text-indigo-400" />
              {id && id !== "new" ? (t("constructor_header_edit") || "Agent Sozlamalari") : "Yangi AI Xodim Yaratish"}
            </h1>
            <p className="text-xs text-gray-400">
              Oddiy 3 qadamda biznesingiz uchun 24/7 ishlaydigan aqlli yordamchi
            </p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-medium">
          <span className="w-2 h-2 rounded-full bg-indigo-400 animate-ping"></span>
          2026 AI Engine
        </div>
      </div>

      {/* 3-Step Wizard Progress Bar */}
      <div className="relative bg-gray-900/60 backdrop-blur-xl border border-gray-800/80 rounded-2xl p-3 sm:p-4 shadow-xl">
        <div className="grid grid-cols-3 gap-2">
          {/* Step 1 */}
          <button
            onClick={() => setCurrentStep(1)}
            className={`flex items-center gap-2 sm:gap-3 p-2 sm:p-2.5 rounded-xl transition text-left ${
              currentStep === 1 
                ? "bg-indigo-600/20 border border-indigo-500/40 text-white" 
                : currentStep > 1 
                  ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-300"
                  : "bg-gray-800/40 border border-transparent text-gray-400"
            }`}
          >
            <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
              currentStep === 1 
                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/30" 
                : currentStep > 1
                  ? "bg-emerald-500 text-black font-extrabold"
                  : "bg-gray-800 text-gray-400"
            }`}>
              {currentStep > 1 ? <Check className="w-4 h-4" /> : "1"}
            </div>
            <div className="overflow-hidden">
              <div className="text-xs font-semibold truncate">1. Biznesingiz</div>
              <div className="text-[10px] text-gray-400 truncate hidden sm:block">Soha & Nomi</div>
            </div>
          </button>

          {/* Step 2 */}
          <button
            onClick={() => setCurrentStep(2)}
            className={`flex items-center gap-2 sm:gap-3 p-2 sm:p-2.5 rounded-xl transition text-left ${
              currentStep === 2 
                ? "bg-indigo-600/20 border border-indigo-500/40 text-white" 
                : currentStep > 2 
                  ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-300"
                  : "bg-gray-800/40 border border-transparent text-gray-400"
            }`}
          >
            <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
              currentStep === 2 
                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/30" 
                : currentStep > 2
                  ? "bg-emerald-500 text-black font-extrabold"
                  : "bg-gray-800 text-gray-400"
            }`}>
              {currentStep > 2 ? <Check className="w-4 h-4" /> : "2"}
            </div>
            <div className="overflow-hidden">
              <div className="text-xs font-semibold truncate">2. AI Xarakteri</div>
              <div className="text-[10px] text-gray-400 truncate hidden sm:block">1-Click AI Yaratish</div>
            </div>
          </button>

          {/* Step 3 */}
          <button
            onClick={() => setCurrentStep(3)}
            className={`flex items-center gap-2 sm:gap-3 p-2 sm:p-2.5 rounded-xl transition text-left ${
              currentStep === 3 
                ? "bg-indigo-600/20 border border-indigo-500/40 text-white" 
                : "bg-gray-800/40 border border-transparent text-gray-400"
            }`}
          >
            <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
              currentStep === 3 
                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/30" 
                : "bg-gray-800 text-gray-400"
            }`}>
              3
            </div>
            <div className="overflow-hidden">
              <div className="text-xs font-semibold truncate">3. Telegram & Karta</div>
              <div className="text-[10px] text-gray-400 truncate hidden sm:block">Ulanish va To'lov</div>
            </div>
          </button>
        </div>
      </div>

      {/* STEP 1: BIZNES SOHASI VA ASOSIY MA'LUMOTLAR */}
      {currentStep === 1 && (
        <div className="space-y-6">
          {/* Category Selection Grid */}
          <div className="bg-gray-900/60 backdrop-blur-xl border border-gray-800/80 rounded-2xl p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-semibold text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-indigo-400" />
                Biznesingiz Yo'nalishini Tanlang:
              </label>
              <span className="text-[11px] text-gray-400">Kerakli sohani bosing</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {categories.map((cat) => {
                const Icon = cat.icon;
                const isSelected = formData.category === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => handleCategorySelect(cat.id)}
                    className={`relative p-3.5 rounded-xl border text-left flex flex-col justify-between transition-all duration-200 active:scale-95 group overflow-hidden ${
                      isSelected
                        ? "bg-gradient-to-b from-indigo-900/40 to-gray-900 border-indigo-500 shadow-lg shadow-indigo-500/20"
                        : "bg-gray-900/70 border-gray-800/80 hover:border-gray-700 hover:bg-gray-800/50 text-gray-300"
                    }`}
                  >
                    {isSelected && (
                      <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-indigo-400 shadow-[0_0_8px_#818cf8]"></div>
                    )}
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-2.5 bg-gradient-to-br ${cat.color} ${isSelected ? "text-indigo-300" : "text-gray-400 group-hover:text-white"}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-medium text-white line-clamp-1">{cat.label}</span>
                  </button>
                );
              })}
            </div>

            {formData.category === "custom" && (
              <div className="pt-2">
                <input
                  type="text"
                  value={customCategoryName}
                  onChange={(e) => setCustomCategoryName(e.target.value)}
                  placeholder="O'z biznesingiz sohasini yozing (masalan: Avtosalon, Mehmonxona, Mebel do'koni...)"
                  className="w-full px-4 py-3 bg-gray-950/80 border border-indigo-500/40 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            )}
          </div>

          {/* Business Info Inputs */}
          <div className="bg-gray-900/60 backdrop-blur-xl border border-gray-800/80 rounded-2xl p-5 shadow-xl space-y-4">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <Building2 className="w-4 h-4 text-indigo-400" />
              Tashkilotingiz Ma'lumotlari
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1.5">
                  Biznesingiz / Do'koningiz Nomi *
                </label>
                <input
                  type="text"
                  required
                  value={formData.company_name}
                  onChange={(e) => {
                    const val = e.target.value;
                    setFormData(prev => ({
                      ...prev,
                      company_name: val,
                      name: val ? `${val} AI Xodimi` : prev.name
                    }));
                  }}
                  placeholder="Masalan: Rayhon Milliy Taomlar yoki Dental Med"
                  className="w-full px-3.5 py-2.5 bg-gray-950/80 border border-gray-800 rounded-xl text-white text-sm focus:outline-none focus:border-indigo-500 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1.5">
                  Bog'lanish uchun Telefon Raqam
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-gray-500 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={formData.phone_number}
                    onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                    placeholder="+998 90 123 45 67"
                    className="w-full pl-9 pr-3.5 py-2.5 bg-gray-950/80 border border-gray-800 rounded-xl text-white text-sm focus:outline-none focus:border-indigo-500 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1.5">
                  Manzil / Lokatsiya (Mijozlar so'raganda aytish uchun)
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-gray-500 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="Masalan: Toshkent sh., Chilonzor 9-mavze, 12-uy"
                    className="w-full pl-9 pr-3.5 py-2.5 bg-gray-950/80 border border-gray-800 rounded-xl text-white text-sm focus:outline-none focus:border-indigo-500 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1.5">
                  Ish Vaqti
                </label>
                <div className="relative">
                  <Clock className="w-4 h-4 text-gray-500 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={formData.working_hours}
                    onChange={(e) => setFormData({ ...formData, working_hours: e.target.value })}
                    placeholder="Har kuni 09:00 dan 22:00 gacha"
                    className="w-full pl-9 pr-3.5 py-2.5 bg-gray-950/80 border border-gray-800 rounded-xl text-white text-sm focus:outline-none focus:border-indigo-500 transition"
                  />
                </div>
              </div>
            </div>

            {/* Step 1 CTA */}
            <div className="pt-4 flex justify-end">
              <button
                type="button"
                onClick={() => {
                  if (!formData.company_name.trim()) {
                    alert("Iltimos, biznesingiz nomini kiriting!");
                    return;
                  }
                  setCurrentStep(2);
                }}
                className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm rounded-xl shadow-lg shadow-indigo-600/30 flex items-center gap-2 transition active:scale-95"
              >
                2-Bosqich: AI Xarakteri & Bilimlar
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STEP 2: AI XARAKTERI VA 1-CLICK AI AVTO-GENERATSIYA */}
      {currentStep === 2 && (
        <div className="space-y-6">
          {/* 1-Click AI Generation Hero Box */}
          <div className="relative overflow-hidden bg-gradient-to-r from-indigo-950/80 via-purple-950/60 to-gray-900 border border-indigo-500/40 rounded-2xl p-5 sm:p-6 shadow-2xl">
            <div className="absolute top-0 right-0 -mt-8 -mr-8 w-48 h-48 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none"></div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-medium border border-indigo-500/30">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                  Gemini Flash 1-Click Sehrgar
                </div>
                <h3 className="text-base sm:text-lg font-bold text-white">
                  Biznesingiz uchun butun botni 1-bosishda tayyorlash
                </h3>
                <p className="text-xs text-gray-300 max-w-xl">
                  AI avtomatik ravishda salomlashish xabari, muomala qoidalari va 4 ta asosiy bilimlar bazasini (narxlar, FAQ, yetkazish) shakllantirib beradi.
                </p>
              </div>

              <button
                type="button"
                disabled={generatingPack}
                onClick={handleOneClickAIGenerate}
                className="w-full sm:w-auto shrink-0 px-5 py-3.5 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white font-bold text-sm rounded-xl shadow-lg shadow-indigo-500/40 flex items-center justify-center gap-2 transition active:scale-95 disabled:opacity-50"
              >
                {generatingPack ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    AI Tayyorlamoqda...
                  </>
                ) : (
                  <>
                    <Wand2 className="w-4 h-4" />
                    ✨ AI Bilan Yaratish
                  </>
                )}
              </button>
            </div>

            {aiGeneratedSuccess && (
              <div className="mt-4 p-3 bg-emerald-950/60 border border-emerald-500/40 rounded-xl flex items-center gap-2.5 text-emerald-300 text-xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>AI biznesingiz uchun barcha ma'lumotlarni muvaffaqiyatli shakllantirdi!</span>
              </div>
            )}
          </div>

          {/* Generated Knowledge Items Preview (if available) */}
          {generatedKnowledge.length > 0 && (
            <div className="bg-gray-900/60 backdrop-blur-xl border border-gray-800/80 rounded-2xl p-5 shadow-xl space-y-3">
              <h4 className="text-xs font-semibold text-indigo-300 uppercase tracking-wider flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-indigo-400" />
                AI Tomonidan Tayyorlangan Bilimlar Bazasi ({generatedKnowledge.length} ta mavzu)
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {generatedKnowledge.map((k, idx) => (
                  <div key={idx} className="p-3 bg-gray-950/70 border border-gray-800 rounded-xl space-y-1">
                    <div className="text-xs font-bold text-white flex items-center justify-between">
                      <span>{k.title}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-gray-800 text-gray-400">{k.category}</span>
                    </div>
                    <p className="text-[11px] text-gray-400 line-clamp-2">{k.content}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Greeting and Rules Customization */}
          <div className="bg-gray-900/60 backdrop-blur-xl border border-gray-800/80 rounded-2xl p-5 shadow-xl space-y-4">
            <div>
              <label className="block text-xs font-semibold text-white mb-1.5 flex items-center gap-2">
                👋 Boshlang'ich Salomlashish Xabari (/start)
              </label>
              <textarea
                rows={3}
                value={formData.welcome_message}
                onChange={(e) => setFormData({ ...formData, welcome_message: e.target.value })}
                placeholder="Assalomu alaykum! Bizning xizmatimizga xush kelibsiz..."
                className="w-full px-3.5 py-2.5 bg-gray-950/80 border border-gray-800 rounded-xl text-white text-sm focus:outline-none focus:border-indigo-500 transition"
              />
              <p className="text-[11px] text-gray-500 mt-1">Mijoz Telegram botingizni ochganda chiqadigan birinchi xabar.</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-white mb-1.5 flex items-center gap-2">
                🤖 Botga Beriladigan Vazifa & Muomala Qoidalari
              </label>
              <textarea
                rows={4}
                value={formData.system_prompt}
                onChange={(e) => setFormData({ ...formData, system_prompt: e.target.value })}
                placeholder="Siz kompaniyaning xushmuomala, savdoni oshiruvchi AI konsultantisiz..."
                className="w-full px-3.5 py-2.5 bg-gray-950/80 border border-gray-800 rounded-xl text-white text-sm focus:outline-none focus:border-indigo-500 transition"
              />
              <p className="text-[11px] text-gray-500 mt-1">Bot qanday tilda va ohangda javob berishi haqidagi umumiy qoidalar.</p>
            </div>

            {/* Navigation buttons */}
            <div className="pt-4 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className="px-4 py-2.5 bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs font-medium rounded-xl transition"
              >
                ← 1-Bosqichga qaytish
              </button>

              <button
                type="button"
                onClick={() => setCurrentStep(3)}
                className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm rounded-xl shadow-lg shadow-indigo-600/30 flex items-center gap-2 transition active:scale-95"
              >
                3-Bosqich: Telegram & To'lov
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STEP 3: TELEGRAM BOT VA TO'LOVLAR */}
      {currentStep === 3 && (
        <div className="space-y-6">
          {/* Telegram Bot Connection Card */}
          <div className="bg-gray-900/60 backdrop-blur-xl border border-gray-800/80 rounded-2xl p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center">
                  <Key className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white">Telegram Bot Ulanishi (Ixtiyoriy)</h3>
                  <p className="text-xs text-gray-400">O'z shaxsiy botingizga ulasangiz, mijozlar to'g'ridan-to'g'ri unga yozishadi</p>
                </div>
              </div>

              <a
                href="https://t.me/BotFather"
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1.5 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 text-blue-300 rounded-xl text-xs font-medium flex items-center gap-1.5 transition"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                @BotFather ni ochish
              </a>
            </div>

            {/* Quick 3-step guide */}
            <div className="p-3 bg-blue-950/30 border border-blue-500/20 rounded-xl text-xs text-blue-200/90 space-y-1">
              <div className="font-semibold text-blue-300 mb-1">💡 Token olish 30 soniya oladi:</div>
              <div>1. Telegramda <b>@BotFather</b> ga kiring va <code>/newbot</code> yozing.</div>
              <div>2. Botingiz nomini va oxiri <code>_bot</code> bilan tugaydigan username bering.</div>
              <div>3. BotFather bergan uzun qizil tokenni nusxalab, pastga qo'ying:</div>
            </div>

            {/* Token Input with Live Validation */}
            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1.5">
                BotFather Bergan Maxfiy Token (API Token)
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={formData.bot_token}
                  onChange={(e) => {
                    const val = e.target.value;
                    setFormData({ ...formData, bot_token: val });
                    validateTelegramToken(val);
                  }}
                  placeholder="Masalan: 7123456789:AAFlKj_xYz1234567890..."
                  className="w-full px-3.5 py-2.5 bg-gray-950/80 border border-gray-800 rounded-xl text-white text-sm focus:outline-none focus:border-indigo-500 font-mono transition"
                />
                {validatingToken && (
                  <RefreshCw className="w-4 h-4 text-indigo-400 absolute right-3 top-3 animate-spin" />
                )}
              </div>

              {/* Token Validation Status Box */}
              {tokenValidation && (
                <div className={`mt-2.5 p-3 rounded-xl border text-xs flex items-center justify-between ${
                  tokenValidation.valid 
                    ? "bg-emerald-950/50 border-emerald-500/40 text-emerald-300"
                    : "bg-red-950/50 border-red-500/40 text-red-300"
                }`}>
                  <div className="flex items-center gap-2">
                    {tokenValidation.valid ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                    )}
                    <span>
                      {tokenValidation.valid 
                        ? `✅ Botingiz topildi: @${tokenValidation.bot_username} (${tokenValidation.bot_name})`
                        : (tokenValidation.error || "Token yaroqsiz")}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Payment Settings Card */}
          <div className="bg-gray-900/60 backdrop-blur-xl border border-gray-800/80 rounded-2xl p-5 shadow-xl space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <CreditCard className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white">To'lovlar Qayerga Tushsin? (Karta / Kassa)</h3>
                <p className="text-xs text-gray-400">Mijoz to'lov qilganda bot ushbu karta yoki havolani yuboradi</p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1.5">
                Plastik Karta Raqami (P2P / Click Up / Uzum)
              </label>
              <input
                type="text"
                value={formData.uzum_card_number}
                onChange={(e) => setFormData({ ...formData, uzum_card_number: e.target.value })}
                placeholder="8600 0000 0000 0000 (Ism Familiya)"
                className="w-full px-3.5 py-2.5 bg-gray-950/80 border border-gray-800 rounded-xl text-white text-sm focus:outline-none focus:border-indigo-500 font-mono transition"
              />
              <p className="text-[11px] text-gray-500 mt-1">MCHJ bo'lishingiz shart emas — oddiy shaxsiy kartangizni yozsangiz kifoya.</p>
            </div>

            {/* Advanced Merchant Toggle */}
            <div className="pt-1">
              <button
                type="button"
                onClick={() => setShowAdvancedPayments(!showAdvancedPayments)}
                className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
              >
                {showAdvancedPayments ? "▲ Rasmiy Click / Payme kassa sozlamalarini yopish" : "▼ Click Merchant yoki Payme Kassa shartnomangiz bormi? (Ixtiyoriy)"}
              </button>

              {showAdvancedPayments && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3">
                  <div>
                    <label className="block text-[11px] text-gray-400 mb-1">Click Service ID</label>
                    <input
                      type="text"
                      value={formData.click_service_id}
                      onChange={(e) => setFormData({ ...formData, click_service_id: e.target.value })}
                      placeholder="Masalan: 12345"
                      className="w-full px-3 py-2 bg-gray-950/80 border border-gray-800 rounded-xl text-white text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-gray-400 mb-1">Click Merchant ID</label>
                    <input
                      type="text"
                      value={formData.click_merchant_id}
                      onChange={(e) => setFormData({ ...formData, click_merchant_id: e.target.value })}
                      placeholder="Masalan: 67890"
                      className="w-full px-3 py-2 bg-gray-950/80 border border-gray-800 rounded-xl text-white text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-gray-400 mb-1">Payme Kassa ID</label>
                    <input
                      type="text"
                      value={formData.payme_merchant_id}
                      onChange={(e) => setFormData({ ...formData, payme_merchant_id: e.target.value })}
                      placeholder="Masalan: 64a1b2..."
                      className="w-full px-3 py-2 bg-gray-950/80 border border-gray-800 rounded-xl text-white text-xs"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Final Launch Action Box */}
          <div className="p-5 bg-gradient-to-b from-gray-900 to-gray-950 border border-indigo-500/30 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
            <button
              type="button"
              onClick={() => setCurrentStep(2)}
              className="w-full sm:w-auto px-4 py-2.5 bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs font-medium rounded-xl transition"
            >
              ← 2-Bosqichga qaytish
            </button>

            <button
              type="button"
              disabled={saving}
              onClick={handleSubmit}
              className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-indigo-600 hover:from-emerald-400 hover:to-indigo-500 text-white font-bold text-sm rounded-xl shadow-xl shadow-emerald-500/25 flex items-center justify-center gap-2 transition active:scale-95 disabled:opacity-50"
            >
              {saving ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Saqlanmoqda...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  🚀 Xodimni Saqlash & Ishga Tushirish
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Success Toast */}
      {savedSuccess && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-600 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5" />
          <span className="font-semibold text-sm">Muvaffaqiyatli Saqlandi! Bilimlar bazasiga o'tilmoqda...</span>
        </div>
      )}
    </div>
  );
}
