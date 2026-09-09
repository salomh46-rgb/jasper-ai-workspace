import React, { useState, useEffect } from "react";
import { api } from "../services/api";
import { Users, Phone, Sparkles, MessageCircle, Calendar, CheckCircle2, Clock, AlertCircle } from "lucide-react";

export default function LeadsCRM() {
  const [leads, setLeads] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState("all");

  useEffect(() => {
    loadLeads();
  }, [selectedStatus]);

  const loadLeads = async () => {
    try {
      const statusParam = selectedStatus === "all" ? null : selectedStatus;
      const data = await api.getLeads(null, statusParam);
      setLeads(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleStatusChange = async (leadId, newStatus) => {
    try {
      await api.updateLeadStatus(leadId, newStatus);
      loadLeads();
    } catch (err) {
      alert(err.message || "Statusni yangilab bo\'lmadi");
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "new":
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/15 text-emerald-400 border border-emerald-500/25">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>Yangi</span>
          </span>
        );
      case "in_progress":
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-500/15 text-amber-400 border border-amber-500/25">
            <Clock className="w-3 h-3 text-amber-400" />
            <span>Jarayonda</span>
          </span>
        );
      case "completed":
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-500/15 text-blue-400 border border-blue-500/25">
            <CheckCircle2 className="w-3 h-3 text-blue-400" />
            <span>Bajarildi</span>
          </span>
        );
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-white/[0.05] text-slate-400">{status}</span>;
    }
  };

  return (
    <div className="space-y-5 pb-32">
      {/* Header */}
      <div>
        <h2 className="text-base sm:text-lg font-extrabold text-white tracking-tight flex items-center gap-2">
          <Users className="w-5 h-5 text-emerald-400" />
          <span>Lidlar & Buyurtmalar CRM</span>
        </h2>
        <p className="text-xs text-slate-400">AI Agentingiz toʻplagan barcha mijozlar, qabulga yozilishlar va kontaktlar</p>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-1">
        {[
          { id: "all", label: "Barchasi" },
          { id: "new", label: "Yangi Lidlar" },
          { id: "in_progress", label: "Bog\'lanilgan" },
          { id: "completed", label: "Muvaffaqiyatli" },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setSelectedStatus(tab.id)}
            className={
              "px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all " +
              (selectedStatus === tab.id
                ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                : "bg-white/[0.04] text-slate-400 hover:text-white border border-white/[0.06]")
            }
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Leads Stream */}
      {leads.length > 0 ? (
        <div className="space-y-3">
          {leads.map((lead) => (
            <div
              key={lead.id}
              className="relative overflow-hidden rounded-2xl bg-[#0E121B]/90 backdrop-blur-xl border border-white/[0.07] p-4.5 space-y-3 shadow-[0_4px_20px_rgba(0,0,0,0.3)]"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="font-bold text-sm text-white">{lead.customer_name || "Mijoz"}</h3>
                    {getStatusBadge(lead.status)}
                  </div>
                  <div className="flex items-center space-x-2 text-xs font-mono text-slate-300 mt-1">
                    <Phone className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{lead.customer_phone || "Raqam yo\'q"}</span>
                  </div>
                </div>

                <div className="flex items-center space-x-1.5">
                  {lead.customer_phone && (
                    <a
                      href={"tel:" + lead.customer_phone}
                      className="p-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 transition-all active:scale-95"
                      title="Qo\'ng\'iroq qilish"
                    >
                      <Phone className="w-4 h-4" />
                    </a>
                  )}
                </div>
              </div>

              {lead.summary && (
                <div className="p-3 rounded-xl bg-[#07080D] border border-white/[0.05] text-xs text-slate-300 leading-relaxed">
                  <span className="text-slate-500 font-medium">AI Xulosa: </span>
                  {lead.summary}
                </div>
              )}

              <div className="pt-2 border-t border-white/[0.05] flex items-center justify-between text-xs">
                <span className="text-[11px] text-slate-500 font-mono">
                  {new Date(lead.created_at).toLocaleString("uz-UZ", { hour: "2-digit", minute: "2-digit", day: "numeric", month: "short" })}
                </span>

                <div className="flex items-center space-x-1.5">
                  <select
                    value={lead.status}
                    onChange={(e) => handleStatusChange(lead.id, e.target.value)}
                    className="bg-[#07080D] border border-white/[0.08] text-xs text-slate-300 rounded-lg px-2 py-1 outline-none font-medium"
                  >
                    <option value="new">Yangi</option>
                    <option value="in_progress">Jarayonda</option>
                    <option value="completed">Bajarildi</option>
                    <option value="canceled">Bekor</option>
                  </select>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl bg-[#0E121B]/70 border border-dashed border-white/[0.1] p-8 text-center space-y-2">
          <Users className="w-10 h-10 text-slate-400 mx-auto opacity-50" />
          <p className="text-sm font-semibold text-slate-200">Ushbu holatda lidlar topilmadi</p>
          <p className="text-xs text-slate-400">Mijozlar Telegram botingizga yozishganda, ularning kontaktlari bu yerda aks etadi.</p>
        </div>
      )}
    </div>
  );
}
