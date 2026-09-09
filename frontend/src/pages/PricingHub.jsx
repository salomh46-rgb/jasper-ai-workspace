import React, { useState, useEffect } from "react";
import { 
  Check, Zap, Sparkles, Crown, ShieldCheck, ArrowRight, 
  CreditCard, Smartphone, Send, Copy, HelpCircle, Star, Globe, MessageSquare, Headphones, Lock, CheckCircle2, Clock
} from "lucide-react";
import { api } from "../services/api";
import { useLanguage } from "../i18n/LanguageContext";

export default function PricingHub() {
  const { t } = useLanguage();
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [copiedCard, setCopiedCard] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [senderName, setSenderName] = useState("");
  const [senderPhone, setSenderPhone] = useState("+998 ");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [mySub, setMySub] = useState(null);
  const [loadingSub, setLoadingSub] = useState(false);

  const cardNumber = "4916 9903 0500 7954";
  const cardHolder = "Javohirbek Asqarov (Visa)";
  const adminUsername = "Dr_eviluz";

  useEffect(() => {
    loadSubscription();
  }, []);

  const loadSubscription = async () => {
    try {
      setLoadingSub(true);
      const data = await api.getMySubscription();
      setMySub(data);
    } catch (err) {
      console.error("Error loading sub:", err);
    } finally {
      setLoadingSub(false);
    }
  };

  const plans = [
    {
      id: "starter",
      name: t("starter_plan"),
      price: "149,000",
      period: "oyiga",
      popular: false,
      badge: t("starter_badge"),
      badgeColor: "text-slate-400 bg-white/[0.05] border-white/10",
      desc: t("starter_desc"),
      features: [
        t("starter_f1"),
        t("starter_f2"),
        t("starter_f3"),
        t("starter_f4"),
        t("starter_f5"),
        t("starter_f6")
      ],
      cta: t("starter_cta"),
      accent: "border-white/10 hover:border-blue-500/30"
    },
    {
      id: "pro",
      name: t("pro_plan"),
      price: "349,000",
      period: "oyiga",
      popular: true,
      badge: t("pro_badge"),
      badgeColor: "text-blue-400 bg-blue-500/10 border-blue-500/20",
      desc: t("pro_desc"),
      features: [
        t("pro_f1"),
        t("pro_f2"),
        t("pro_f3"),
        t("pro_f4"),
        t("pro_f5"),
        t("pro_f6"),
        t("pro_f7"),
        t("pro_f8")
      ],
      cta: t("pro_cta"),
      accent: "border-blue-500/50 shadow-[0_0_30px_rgba(59,130,246,0.2)] bg-gradient-to-b from-[#121929] to-[#0E121B]"
    },
    {
      id: "enterprise",
      name: t("enterprise_plan"),
      price: "790,000",
      period: "oyiga",
      popular: false,
      badge: t("enterprise_badge"),
      badgeColor: "text-purple-400 bg-purple-500/10 border-purple-500/20",
      desc: t("enterprise_desc"),
      features: [
        t("enterprise_f1"),
        t("enterprise_f2"),
        t("enterprise_f3"),
        t("enterprise_f4"),
        t("enterprise_f5"),
        t("enterprise_f6"),
        t("enterprise_f7")
      ],
      cta: t("enterprise_cta"),
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
        plan_id: selectedPlan.id,
        plan_name: selectedPlan.name,
        price: selectedPlan.price,
        sender_name: senderName,
        sender_phone: senderPhone,
        payment_method: paymentMethod
      });
      setSubmitted(true);
      loadSubscription();
    } catch (err) {
      alert("Xatolik yuz berdi: " + (err.message || "Iltimos qayta urinib ko'ring"));
    } finally {
      setSubmitting(false);
    }
  };

  const currentPlanId = mySub?.subscription_plan || "free";
  const isPlanActive = mySub?.plan_status === "active";

  return (
    <div className="space-y-8 pb-20 animate-fade-in text-white max-w-5xl mx-auto">
      {/* Active Subscription Status Banner */}
      {mySub && (
        <div className="rounded-3xl bg-gradient-to-r from-blue-900/30 via-indigo-900/20 to-purple-900/30 border border-blue-500/30 p-4 sm:p-6 backdrop-blur-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl">
          <div className="flex items-center space-x-3.5">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0">
              <Crown className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{t("current_plan_badge")}:</span>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-extrabold uppercase">
                  {currentPlanId === "free" ? "Free Trial" : currentPlanId.toUpperCase()} ({t("current_plan_status_active")})
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1">
                {currentPlanId === "free" ? (
                  t("current_plan_no_sub")
                ) : (
                  <span className="flex items-center gap-1.5 text-blue-300">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{mySub.days_left !== null ? `${mySub.days_left} ${t("current_plan_days_left")}` : "30 kun"}</span>
                    <span>• {mySub.max_bots} ta Bot ruxsati</span>
                  </span>
                )}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="text-center space-y-3 pt-2">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>{t("pricing_header_badge")}</span>
        </div>
        <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white">
          {t("pricing_main_title")}
        </h2>
        <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto leading-relaxed">
          {t("pricing_main_desc")}
        </p>
      </div>

      {/* Pricing Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
        {plans.map((plan) => {
          const isCurrent = currentPlanId === plan.id;
          return (
            <div
              key={plan.id}
              className={`relative rounded-3xl p-6 flex flex-col justify-between border backdrop-blur-xl transition-all duration-300 ${plan.accent} ${
                isCurrent 
                  ? "border-emerald-500/60 shadow-[0_0_30px_rgba(16,185,129,0.25)] bg-[#0c1815]/90" 
                  : plan.popular 
                    ? "scale-105 z-10" 
                    : "bg-[#0E121B]/90 hover:bg-[#141A26]"
              }`}
            >
              {isCurrent && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3.5 py-1 rounded-full bg-emerald-500 text-[11px] font-extrabold tracking-wider uppercase text-black shadow-lg shadow-emerald-500/40 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{t("current_plan_btn_active")}</span>
                </div>
              )}
              {!isCurrent && plan.popular && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-[11px] font-bold tracking-wider uppercase text-white shadow-lg shadow-blue-500/40">
                  {t("pricing_most_popular")}
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
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">{t("pricing_features_label")}</p>
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
                  onClick={() => !isCurrent && handleSelectPlan(plan)}
                  disabled={isCurrent}
                  className={`w-full py-3 rounded-xl font-bold text-xs sm:text-sm transition-all duration-200 shadow-md active:scale-95 ${
                    isCurrent
                      ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 cursor-default opacity-90"
                      : plan.popular
                      ? "bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-400 hover:to-indigo-500 text-white shadow-blue-500/30"
                      : "bg-white/[0.08] hover:bg-white/[0.14] text-white"
                  }`}
                >
                  {isCurrent ? `✓ ${t("current_plan_btn_active")}` : plan.cta}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* No MCHJ / YaTT FAQ Alert */}
      <div className="rounded-3xl bg-[#0E121B]/90 border border-white/[0.08] p-6 sm:p-8 space-y-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-base text-white">{t("faq_title")}</h4>
            <p className="text-xs text-slate-400">{t("faq_desc")}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          <div className="p-4 rounded-2xl bg-[#07080D] border border-white/[0.05] space-y-1.5">
            <div className="text-xs font-bold text-blue-400 flex items-center gap-1.5">
              <CreditCard className="w-4 h-4" />
              <span>{t("faq_card_1_title")}</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              {t("faq_card_1_desc")}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#07080D] border border-white/[0.05] space-y-1.5">
            <div className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
              <Star className="w-4 h-4" />
              <span>{t("faq_card_2_title")}</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              {t("faq_card_2_desc")}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#07080D] border border-white/[0.05] space-y-1.5">
            <div className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4" />
              <span>{t("faq_card_3_title")}</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              {t("faq_card_3_desc")}
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
                <h3 className="font-bold text-lg text-white">{selectedPlan.name} {t("pricing_sub_title")}</h3>
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
                    <span>{t("pricing_pay_card")}</span>
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
                    <span>{t("pricing_stars_title")}</span>
                  </button>
                </div>

                {paymentMethod === "card" ? (
                  <div className="p-4 rounded-2xl bg-[#07080D] border border-white/[0.08] space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-400">{t("pricing_card_label")}</span>
                      <button
                        type="button"
                        onClick={copyCard}
                        className="text-[11px] text-blue-400 hover:underline flex items-center gap-1"
                      >
                        {copiedCard ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedCard ? t("pricing_copied") : t("pricing_copy")}</span>
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
                    <h5 className="font-bold text-xs text-white">{t("pricing_stars_title")}</h5>
                    <p className="text-[11px] text-slate-400">
                      {t("pricing_stars_desc")}
                    </p>
                  </div>
                )}

                <div className="space-y-3 pt-2">
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-300">{t("pricing_name_label")}</label>
                    <input
                      type="text"
                      required
                      value={senderName}
                      onChange={(e) => setSenderName(e.target.value)}
                      placeholder={t("pricing_name_placeholder")}
                      className="w-full bg-[#07080D] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none focus:border-blue-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-300">{t("pricing_phone_label")}</label>
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
                    <span>{t("pricing_submitting")}</span>
                  ) : (
                    <>
                      <span>{t("pricing_btn_confirm")}</span>
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
                  <h4 className="font-bold text-lg text-white">{t("pricing_success_title")}</h4>
                  <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                    {t("pricing_success_desc_1")} {selectedPlan.name} {t("pricing_success_desc_2")}
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
                    <span>{t("pricing_send_receipt")} (@{adminUsername})</span>
                  </a>

                  <button
                    onClick={() => setShowConfirmModal(false)}
                    className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs transition-all"
                  >
                    {t("close")}
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
