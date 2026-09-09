import React, { useState, useEffect } from "react";
import { 
  CreditCard, Plus, CheckCircle2, Clock, XCircle, ArrowUpRight, 
  ExternalLink, Copy, Check, DollarSign, Receipt, Send, Filter, RefreshCw, Smartphone
} from "lucide-react";
import { api } from "../services/api";

export default function PaymentsHub() {
  const [stats, setStats] = useState({ total_revenue: 0, pending_amount: 0, total_invoices: 0, paid_invoices: 0 });
  const [invoices, setInvoices] = useState([]);
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterAgent, setFilterAgent] = useState("all");

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const [createdInvoiceResult, setCreatedInvoiceResult] = useState(null);

  const [form, setForm] = useState({
    agent_id: "",
    customer_name: "",
    customer_phone: "+998 ",
    amount: "",
    description: "",
    provider: "click"
  });

  useEffect(() => {
    loadData();
  }, [filterStatus, filterAgent]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [agentsData, statsData, invoicesData] = await Promise.all([
        api.getAgents().catch(() => []),
        api.getPaymentStats(filterAgent !== "all" ? filterAgent : null).catch(() => ({})),
        api.getInvoices(
          filterAgent !== "all" ? filterAgent : null, 
          filterStatus !== "all" ? filterStatus : null
        ).catch(() => [])
      ]);
      setAgents(agentsData);
      setStats(statsData || {});
      setInvoices(invoicesData || []);
      if (agentsData.length > 0 && !form.agent_id) {
        setForm(prev => ({ ...prev, agent_id: agentsData[0].id }));
      }
    } catch (err) {
      console.error("Error loading payments:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateInvoice = async (e) => {
    e.preventDefault();
    if (!form.agent_id || !form.amount) {
      alert("Iltimos, agent va to'lov summasini kiriting");
      return;
    }

    try {
      setCreating(true);
      const res = await api.createInvoice({
        agent_id: parseInt(form.agent_id),
        customer_name: form.customer_name,
        customer_phone: form.customer_phone,
        amount: parseFloat(form.amount),
        description: form.description,
        provider: form.provider
      });
      setCreatedInvoiceResult(res);
      await loadData();
    } catch (err) {
      alert(err.message || "To'lov hisobini yaratishda xatolik yuz berdi");
    } finally {
      setCreating(false);
    }
  };

  const handleUpdateStatus = async (invoiceId, newStatus) => {
    try {
      await api.updateInvoiceStatus(invoiceId, newStatus);
      await loadData();
    } catch (err) {
      alert(err.message || "Holatni yangilashda xatolik");
    }
  };

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6 pb-20 animate-fade-in text-white">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/[0.06] pb-5">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mb-2">
            <CreditCard className="w-3.5 h-3.5" />
            <span>To‘lov & Kassa Integratsiyasi</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            Click, Payme & Uzum To‘lovlari
          </h1>
          <p className="text-xs text-white/50 mt-1">
            Mijozlarga avtomatik to‘lov havolalari yaratish, kassa hisob-kitobi va to‘lov monitoringi
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadData}
            className="p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.08] hover:bg-white/[0.06] transition text-white/70 hover:text-white"
            title="Yangilash"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => {
              setCreatedInvoiceResult(null);
              setShowCreateModal(true);
            }}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white text-xs font-semibold flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Yangi Invoice Yaratish</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] backdrop-blur-md relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-all pointer-events-none" />
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-white/50">Jami Tushum (To‘langan)</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-black text-white mt-2 tracking-tight">
            {(stats.total_revenue || 0).toLocaleString()} <span className="text-xs font-normal text-emerald-400">UZS</span>
          </div>
          <div className="text-[10px] text-white/40 mt-1">
            {stats.paid_invoices || 0} ta muvaffaqiyatli to‘lov
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] backdrop-blur-md relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 rounded-full blur-2xl group-hover:bg-amber-500/20 transition-all pointer-events-none" />
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-white/50">Kutilayotgan Summa</span>
            <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-black text-amber-300 mt-2 tracking-tight">
            {(stats.pending_amount || 0).toLocaleString()} <span className="text-xs font-normal text-amber-400">UZS</span>
          </div>
          <div className="text-[10px] text-white/40 mt-1">
            {(stats.total_invoices || 0) - (stats.paid_invoices || 0)} ta kutish holatida
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] backdrop-blur-md relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-white/50">Jami Hisob-fakturalar</span>
            <div className="w-7 h-7 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <Receipt className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-black text-white mt-2 tracking-tight">
            {stats.total_invoices || 0} <span className="text-xs font-normal text-white/50">dona</span>
          </div>
          <div className="text-[10px] text-white/40 mt-1">
            Click, Payme va Uzum orqali
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] backdrop-blur-md relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-white/50">Konversiya / Samaradorlik</span>
            <div className="w-7 h-7 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-black text-purple-300 mt-2 tracking-tight">
            {stats.total_invoices > 0 ? Math.round((stats.paid_invoices / stats.total_invoices) * 100) : 0}%
          </div>
          <div className="text-[10px] text-white/40 mt-1">
            Mijoz to‘lov nisbati
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white/[0.02] p-3 rounded-2xl border border-white/[0.06]">
        <div className="flex items-center gap-2 overflow-x-auto">
          {["all", "paid", "pending", "cancelled"].map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition capitalize ${
                filterStatus === st
                  ? "bg-white/15 text-white shadow-sm border border-white/20"
                  : "bg-white/[0.03] text-white/50 hover:text-white/80 border border-white/[0.04]"
              }`}
            >
              {st === "all" ? "Barchasi" : st === "paid" ? "✅ To‘langan" : st === "pending" ? "⏳ Kutilmoqda" : "❌ Bekor qilingan"}
            </button>
          ))}
        </div>

        {agents.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-white/40">Agent:</span>
            <select
              value={filterAgent}
              onChange={(e) => setFilterAgent(e.target.value)}
              className="bg-[#0e1017] border border-white/[0.08] text-white text-xs rounded-xl px-3 py-1.5 focus:outline-none focus:border-emerald-500/50"
            >
              <option value="all">Barcha Agentlar</option>
              {agents.map((a) => (
                <option key={a.id} value={a.id}>{a.name}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Invoices List */}
      <div className="space-y-3">
        {loading ? (
          <div className="p-12 text-center text-white/40 text-xs">To‘lovlar ro‘yxati yuklanmoqda...</div>
        ) : invoices.length === 0 ? (
          <div className="p-12 text-center rounded-2xl bg-white/[0.01] border border-dashed border-white/[0.08]">
            <Receipt className="w-10 h-10 text-white/20 mx-auto mb-3" />
            <h3 className="text-sm font-semibold text-white/70">Hozircha to‘lov hujjati mavjud emas</h3>
            <p className="text-xs text-white/40 mt-1 max-w-sm mx-auto">
              Yangi hisob-faktura (Invoice) yarating va mijozga Click/Payme to‘lov havolasini yuboring.
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="mt-4 px-4 py-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-semibold hover:bg-emerald-500/30 transition"
            >
              + Birinchi Invoice yaratish
            </button>
          </div>
        ) : (
          invoices.map((inv) => (
            <div
              key={inv.id}
              className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] hover:border-white/[0.12] transition flex flex-col md:flex-row md:items-center justify-between gap-4 backdrop-blur-md"
            >
              <div className="space-y-1.5">
                <div className="flex items-center gap-2.5">
                  <span className="font-mono text-xs font-bold text-white/80 bg-white/[0.05] px-2 py-0.5 rounded-lg border border-white/[0.08]">
                    {inv.invoice_number}
                  </span>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${
                    inv.status === "paid"
                      ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                      : inv.status === "pending"
                      ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                      : "bg-red-500/10 text-red-400 border-red-500/20"
                  }`}>
                    {inv.status === "paid" ? "✅ To‘langan" : inv.status === "pending" ? "⏳ Kutilmoqda" : "❌ Bekor"}
                  </span>
                  <span className="text-[11px] text-white/40">
                    {inv.agent_name}
                  </span>
                </div>

                <div className="text-sm font-semibold text-white flex items-center gap-2">
                  <span>{inv.customer_name || "Mijoz"}</span>
                  {inv.customer_phone && (
                    <span className="text-xs font-normal text-white/50">({inv.customer_phone})</span>
                  )}
                </div>

                {inv.description && (
                  <p className="text-xs text-white/50">{inv.description}</p>
                )}
              </div>

              {/* Amount & Actions */}
              <div className="flex flex-wrap items-center gap-3 justify-between md:justify-end border-t md:border-t-0 pt-3 md:pt-0 border-white/[0.04]">
                <div className="text-left md:text-right">
                  <div className="text-base font-black text-white">
                    {inv.amount.toLocaleString()} <span className="text-xs font-medium text-emerald-400">{inv.currency}</span>
                  </div>
                  <div className="text-[10px] text-white/40">
                    {new Date(inv.created_at).toLocaleString("uz-UZ", { dateStyle: "short", timeStyle: "short" })}
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  {inv.payment_url_click && (
                    <button
                      onClick={() => copyToClipboard(inv.payment_url_click, `click-${inv.id}`)}
                      className="px-2.5 py-1.5 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/20 text-xs font-medium flex items-center gap-1 transition"
                      title="Click havolasini nusxalash"
                    >
                      {copiedId === `click-${inv.id}` ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>Click</span>
                    </button>
                  )}

                  {inv.payment_url_payme && (
                    <button
                      onClick={() => copyToClipboard(inv.payment_url_payme, `payme-${inv.id}`)}
                      className="px-2.5 py-1.5 rounded-xl bg-teal-500/10 hover:bg-teal-500/20 text-teal-400 border border-teal-500/20 text-xs font-medium flex items-center gap-1 transition"
                      title="Payme havolasini nusxalash"
                    >
                      {copiedId === `payme-${inv.id}` ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>Payme</span>
                    </button>
                  )}

                  {/* Status Toggle Button */}
                  {inv.status !== "paid" ? (
                    <button
                      onClick={() => handleUpdateStatus(inv.id, "paid")}
                      className="px-2.5 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 text-xs font-medium transition"
                      title="Qo'lda to'landi deb belgilash"
                    >
                      To‘landi qilish
                    </button>
                  ) : (
                    <button
                      onClick={() => handleUpdateStatus(inv.id, "pending")}
                      className="px-2 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-white/40 text-[11px] transition"
                    >
                      Qaytarish
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal: Create Invoice */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-lg rounded-3xl bg-[#0c0d14] border border-white/[0.1] shadow-2xl overflow-hidden p-6 space-y-5">
            {!createdInvoiceResult ? (
              <form onSubmit={handleCreateInvoice} className="space-y-4">
                <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                      <CreditCard className="w-4 h-4" />
                    </div>
                    <h3 className="text-base font-bold text-white">Yangi To‘lov Hisobi (Invoice)</h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="p-1.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-white/60 hover:text-white transition"
                  >
                    ✕
                  </button>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="text-xs text-white/60 font-medium block mb-1">Agent (Biznes filiali):</label>
                    <select
                      value={form.agent_id}
                      onChange={(e) => setForm({ ...form, agent_id: e.target.value })}
                      className="w-full bg-[#12141c] border border-white/[0.08] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500/50"
                    >
                      {agents.map((a) => (
                        <option key={a.id} value={a.id}>{a.name} ({a.category})</option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-white/60 font-medium block mb-1">Mijoz Ismi:</label>
                      <input
                        type="text"
                        placeholder="Masalan: Sardor Rahimov"
                        value={form.customer_name}
                        onChange={(e) => setForm({ ...form, customer_name: e.target.value })}
                        className="w-full bg-[#12141c] border border-white/[0.08] rounded-xl px-3.5 py-2 text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-emerald-500/50"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-white/60 font-medium block mb-1">Telefon Raqami:</label>
                      <input
                        type="text"
                        placeholder="+998 90 123 45 67"
                        value={form.customer_phone}
                        onChange={(e) => setForm({ ...form, customer_phone: e.target.value })}
                        className="w-full bg-[#12141c] border border-white/[0.08] rounded-xl px-3.5 py-2 text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-emerald-500/50"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs text-white/60 font-medium block mb-1">To‘lov Summasi (so‘mda) *:</label>
                    <div className="relative">
                      <input
                        type="number"
                        placeholder="Masalan: 350000"
                        required
                        value={form.amount}
                        onChange={(e) => setForm({ ...form, amount: e.target.value })}
                        className="w-full bg-[#12141c] border border-white/[0.08] rounded-xl px-3.5 py-2.5 text-sm font-bold text-emerald-400 placeholder:text-white/30 focus:outline-none focus:border-emerald-500/50"
                      />
                      <span className="absolute right-3.5 top-2.5 text-xs text-white/40">UZS</span>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs text-white/60 font-medium block mb-1">To‘lov Maqsadi / Xizmat Nomi:</label>
                    <input
                      type="text"
                      placeholder="Masalan: Konsultatsiya va stomatologik ko'rik uchun"
                      value={form.description}
                      onChange={(e) => setForm({ ...form, description: e.target.value })}
                      className="w-full bg-[#12141c] border border-white/[0.08] rounded-xl px-3.5 py-2 text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-emerald-500/50"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-white/[0.06]">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 py-2.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-xs font-semibold text-white/70 transition"
                  >
                    Bekor qilish
                  </button>
                  <button
                    type="submit"
                    disabled={creating}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-xs font-bold text-white shadow-lg shadow-emerald-500/20 transition flex items-center gap-2"
                  >
                    {creating ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                    <span>To‘lov Havolasini Yaratish</span>
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-4">
                <div className="text-center space-y-1">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-2 border border-emerald-500/30">
                    <Check className="w-6 h-6" />
                  </div>
                  <h3 className="text-base font-bold text-white">To‘lov Hisobi Tayyor!</h3>
                  <p className="text-xs text-white/50 font-mono">{createdInvoiceResult.invoice_number}</p>
                </div>

                <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.08] space-y-3">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-white/50">Summa:</span>
                    <span className="font-bold text-emerald-400 text-sm">{createdInvoiceResult.amount?.toLocaleString()} UZS</span>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-white/[0.06]">
                    <div>
                      <span className="text-[11px] text-white/60 block mb-1">Click To‘lov Havolasi:</span>
                      <div className="flex items-center gap-2">
                        <input
                          readOnly
                          value={createdInvoiceResult.click_url}
                          className="w-full bg-[#12141c] border border-white/[0.08] rounded-xl px-3 py-1.5 text-[11px] text-white/80 font-mono"
                        />
                        <button
                          onClick={() => copyToClipboard(createdInvoiceResult.click_url, 'modal-click')}
                          className="px-3 py-1.5 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/30 text-xs font-semibold flex items-center gap-1"
                        >
                          {copiedId === 'modal-click' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <span className="text-[11px] text-white/60 block mb-1">Payme To‘lov Havolasi:</span>
                      <div className="flex items-center gap-2">
                        <input
                          readOnly
                          value={createdInvoiceResult.payme_url}
                          className="w-full bg-[#12141c] border border-white/[0.08] rounded-xl px-3 py-1.5 text-[11px] text-white/80 font-mono"
                        />
                        <button
                          onClick={() => copyToClipboard(createdInvoiceResult.payme_url, 'modal-payme')}
                          className="px-3 py-1.5 rounded-xl bg-teal-500/20 text-teal-400 border border-teal-500/30 text-xs font-semibold flex items-center gap-1"
                        >
                          {copiedId === 'modal-payme' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>

                    <div className="text-[11px] text-white/50 pt-1">
                      💳 {createdInvoiceResult.uzum_info}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    onClick={() => {
                      setCreatedInvoiceResult(null);
                      setShowCreateModal(false);
                    }}
                    className="w-full py-2.5 rounded-xl bg-white/[0.08] hover:bg-white/[0.12] text-xs font-semibold text-white transition"
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
