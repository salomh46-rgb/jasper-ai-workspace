import React, { useState } from "react";
import { 
  Check, Zap, Sparkles, Crown, ShieldCheck, ArrowRight, 
  CreditCard, Smartphone, Send, Copy, HelpCircle, Star, Globe, MessageSquare, Headphones, Lock
} from "lucide-react";
import { api } from "../services/api";

export default function PricingHub() {
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [copiedCard, setCopiedCard] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [senderName, setSenderName] = useState("");
  const [senderPhone, setSenderPhone] = useState("+998 ");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const cardNumber = "4916 9903 0500 7954";
  const cardHolder = "Javohirbek Asqarov (Visa)";
  const adminUsername = "Dr_eviluz";

  const plans = [
    {
      id: "starter",
      name: "Boshlang'ich (Starter)",
      price: "149,000",
      period: "oyiga",
      popular: false,
      badge: "Kichik Biznes & Startap",
      badgeColor: "text-slate-400 bg-white/[0.05] border-white/10",
      desc: "Kichik do'kon va servislar uchun bitta aqlli AI yordamchi.",
      features: [
        "1 ta Telegram AI Bot",
        "1,000 ta xabar / oy",
        "Matnli AI & Smart RAG",
        "CRM Lidlar yig'uvchi",
        "Cheksiz Bilimlar bazasi",
        "24/7 Ishonchli ishlash"
      ],
      cta: "Boshlang'ichni Tanlash",
      accent: "border-white/10 hover:border-blue-500/30"
    },
    {
      id: "pro",
      name: "Professional (Pro)",
      price: "349,000",
      period: "oyiga",
      popular: true,
      badge: "Eng Ommabop & Tavsiya",
      badgeColor: "text-blue-400 bg-blue-500/10 border-blue-500/20",
      desc: "O'rta biznes, klinikalar va do'konlar uchun to'liq imkoniyatlar to'plami.",
      features: [
        "3 ta Telegram AI Bot",
        "10,000 ta xabar / oy",
        "🎙️ Ovozli xabarlarni tushunish (Voice AI)",
        "🌐 Ko'p tillilik (UZ, RU, EN)",
        "📊 Google Sheets & Excel Export",
        "👤 Live Chat & Operator Takeover",
        "⚡ 0.0s Sub-Second Ultra Tezlik",
        "Prioritetli qo'llab-quvvatlash"
      ],
      cta: "Pro Tarifni Tanlash",
      accent: "border-blue-500/50 shadow-[0_0_30px_rgba(59,130,246,0.2)] bg-gradient-to-b from-[#121929] to-[#0E121B]"
    },
    {
      id: "enterprise",
      name: "Korporativ (Enterprise)",
      price: "790,000",
      period: "oyiga",
      popular: false,
      badge: "Katta Kompaniyalar",
      badgeColor: "text-purple-400 bg-purple-500/10 border-purple-500/20",
      desc: "Katta brendlar, call-centerlar va shaxsiy integratsiya talab qiluvchilar uchun.",
      features: [
        "Cheksiz Telegram AI Botlar",
        "Cheksiz xabarlar",
        "📂 PDF / Hujjatlar RAG yuklash",
        "To'liq Kassa & Click/Payme integratsiyasi",
        "Maxsus API & Webhook sozlamalari",
        "Shaxsiy Server & Maxfiylik",
        "24/7 Shaxsiy menejer"
      ],
      cta: "Enterprise Tanlash",
      accent: "border-purple-500/30 hover:border-purple-500/50"
    }
  ];

  const handleSelectPlan = (plan) => {
    setSelectedPlan(plan);
    setShowConfirmModal(true);
    setSubmitted(false);
  };

  const copyCard = () => {
    navigator.clipboard.writeText(cardNumber.replace(/\s/g, ""));
    setCopiedCard(true);
    setTimeout(() => setCopiedCard(false), 2000);
  };

  const handleConfirmPayment = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await api.sendSubscribeRequest({
        plan_name: selectedPlan.name,
        price: selectedPlan.price,
        sender_name: senderName,
        sender_phone: senderPhone,
        payment_method: paymentMethod
      });
      setSubmitted(true);
    } catch (err) {
      alert("Xatolik yuz berdi: " + (err.message || "Iltimos qayta urinib ko'ring"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 pb-20 animate-fade-in text-white max-w-5xl mx-auto">
      {/* Header */}
      <div className="text-center space-y-3 pt-2">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Shaffof va Qulay Tariflar</span>
        </div>
        <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white">
          Biznesingizni AI Bilan Kuchaytiring
        </h2>
        <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto leading-relaxed">
          Hech qanday murakkab shartnomalarsiz — kartangiz, Click / Payme yoki Telegram Stars orqali 1 daqiqada obuna bo'ling!
        </p>
      </div>

      {/* Pricing Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className={`relative rounded-3xl p-6 flex flex-col justify-between border backdrop-blur-xl transition-all duration-300 ${plan.accent} ${
              plan.popular ? "scale-105 z-10" : "bg-[#0E121B]/90 hover:bg-[#141A26]"
            }`}
          >
            {plan.popular && (
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-[11px] font-bold tracking-wider uppercase text-white shadow-lg shadow-blue-500/40">
                Eng Ko'p Tanlangan
              </div>
            )}

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border ${plan.badgeColor}`}>
                  {plan.badge}
                </span>
              </div>

              <div>
                <h3 className="text-lg font-bold text-white">{plan.name}</h3>
                <p className="text-xs text-slate-400 mt-1">{plan.desc}</p>
              </div>

              <div className="pt-2">
                <div className="flex items-baseline space-x-1">
                  <span className="text-3xl font-extrabold text-white tracking-tight">{plan.price}</span>
                  <span className="text-xs text-slate-400 font-medium">so'm / {plan.period}</span>
                </div>
              </div>

              <div className="pt-4 border-t border-white/[0.06] space-y-2.5">
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Imkoniyatlar:</p>
                {plan.features.map((feat, idx) => (
                  <div key={idx} className="flex items-start space-x-2 text-xs text-slate-300">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-6">
              <button
                onClick={() => handleSelectPlan(plan)}
                className={`w-full py-3 rounded-xl font-bold text-xs sm:text-sm transition-all duration-200 shadow-md active:scale-95 ${
                  plan.popular
                    ? "bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-400 hover:to-indigo-500 text-white shadow-blue-500/30"
                    : "bg-white/[0.08] hover:bg-white/[0.14] text-white"
                }`}
              >
                {plan.cta}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* No MCHJ / YaTT FAQ Alert */}
      <div className="rounded-3xl bg-[#0E121B]/90 border border-white/[0.08] p-6 sm:p-8 space-y-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-base text-white">MCHJ yoki YaTT bo'lishim shartmi?</h4>
            <p className="text-xs text-slate-400">To'lovlar va daromad qabul qilish bo'yicha muhim ma'lumot</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          <div className="p-4 rounded-2xl bg-[#07080D] border border-white/[0.05] space-y-1.5">
            <div className="text-xs font-bold text-blue-400 flex items-center gap-1.5">
              <CreditCard className="w-4 h-4" />
              <span>1. P2P Karta / Click Up</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Mijozlar to'g'ridan-to'g'ri karta raqamingizga yoki Click / Payme / Uzum havolasi orqali to'lov qila oladi. MCHJ shart emas!
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#07080D] border border-white/[0.05] space-y-1.5">
            <div className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
              <Star className="w-4 h-4" />
              <span>2. Telegram Stars</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Telegram bot ichida rasmiy "Stars" orqali to'lov qabul qilib, uni to'g'ridan-to'g'ri TON/kriptoga naqdlashtirish mumkin.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#07080D] border border-white/[0.05] space-y-1.5">
            <div className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4" />
              <span>3. O'zini o'zi band qilish</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Soliq ilovasida 2 daqiqada tekin ro'yxatdan o'tib, Click Merchant va Payme Business shartnomasini 0% soliq bilan olish mumkin!
            </p>
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      {showConfirmModal && selectedPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-lg rounded-3xl bg-[#0E121B] border border-white/10 p-6 sm:p-8 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/[0.06] pb-4">
              <div>
                <h3 className="font-bold text-lg text-white">{selectedPlan.name} Obunasi</h3>
                <p className="text-xs text-blue-400 font-semibold">{selectedPlan.price} so'm / oy</p>
              </div>
              <button
                onClick={() => setShowConfirmModal(false)}
                className="w-8 h-8 rounded-full bg-white/[0.06] hover:bg-white/[0.12] text-slate-400 hover:text-white flex items-center justify-center text-sm"
              >
                ✕
              </button>
            </div>

            {!submitted ? (
              <form onSubmit={handleConfirmPayment} className="space-y-4">
                {/* Method selector */}
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("card")}
                    className={`py-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                      paymentMethod === "card"
                        ? "border-blue-500 bg-blue-500/10 text-blue-400"
                        : "border-white/10 bg-white/[0.03] text-slate-400"
                    }`}
                  >
                    <CreditCard className="w-4 h-4" />
                    <span>Karta (Click/Payme)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod("stars")}
                    className={`py-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                      paymentMethod === "stars"
                        ? "border-amber-500 bg-amber-500/10 text-amber-400"
                        : "border-white/10 bg-white/[0.03] text-slate-400"
                    }`}
                  >
                    <Star className="w-4 h-4" />
                    <span>Telegram Stars</span>
                  </button>
                </div>

                {paymentMethod === "card" ? (
                  <div className="p-4 rounded-2xl bg-[#07080D] border border-white/[0.08] space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-400">To'lov uchun karta raqami:</span>
                      <button
                        type="button"
                        onClick={copyCard}
                        className="text-[11px] text-blue-400 hover:underline flex items-center gap-1"
                      >
                        {copiedCard ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedCard ? "Nusxalandi!" : "Nusxalash"}</span>
                      </button>
                    </div>

                    <div className="p-3 rounded-xl bg-white/[0.04] border border-white/[0.08] font-mono text-base font-bold text-center tracking-wider text-white">
                      {cardNumber}
                    </div>
                    <p className="text-[11px] text-center text-slate-400">{cardHolder}</p>
                  </div>
                ) : (
                  <div className="p-4 rounded-2xl bg-[#07080D] border border-amber-500/20 text-center space-y-2">
                    <Star className="w-8 h-8 text-amber-400 mx-auto animate-bounce" />
                    <h5 className="font-bold text-xs text-white">Telegram Stars orqali to'lash</h5>
                    <p className="text-[11px] text-slate-400">
                      Telegram botingiz ichida 1 bosishda to'lov qilasiz.
                    </p>
                  </div>
                )}

                <div className="space-y-3 pt-2">
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-300">Ismingiz yoki Telegram Username</label>
                    <input
                      type="text"
                      required
                      value={senderName}
                      onChange={(e) => setSenderName(e.target.value)}
                      placeholder="Masalan: @jasper_admin yoki Javohir"
                      className="w-full bg-[#07080D] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none focus:border-blue-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-300">Bog'lanish uchun telefon</label>
                    <input
                      type="text"
                      required
                      value={senderPhone}
                      onChange={(e) => setSenderPhone(e.target.value)}
                      placeholder="+998 90 123 45 67"
                      className="w-full bg-[#07080D] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none focus:border-blue-500 font-mono"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 disabled:opacity-50 text-white font-bold text-xs sm:text-sm shadow-lg shadow-emerald-500/30 active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <span>So'rov yuborilmoqda...</span>
                  ) : (
                    <>
                      <span>To'lovni Tasdiqlash & Faollashtirish</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            ) : (
              <div className="text-center py-6 space-y-4">
                <div className="w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                  <Check className="w-8 h-8" />
                </div>
                <div>
                  <h4 className="font-bold text-lg text-white">So'rovingiz Qabul Qilindi!</h4>
                  <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                    To'lovingiz haqida adminga xabar yuborildi. {selectedPlan.name} tarifingiz 5 daqiqa ichida faollashtiriladi!
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-2 pt-2">
                  <a
                    href={`https://t.me/${adminUsername}?text=${encodeURIComponent("Salom! Men Jasper AI Workspace da " + selectedPlan.name + " tarifiga to'lov qildim. Telefon: " + senderPhone)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition-all shadow-lg shadow-blue-500/30"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Telegramda Chekni Yuborish (@{adminUsername})</span>
                  </a>

                  <button
                    onClick={() => setShowConfirmModal(false)}
                    className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs transition-all"
                  >
                    Yopish
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
