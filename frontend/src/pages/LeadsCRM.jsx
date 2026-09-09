import React, { useState, useEffect } from "react";
import { api } from "../services/api";
import { Users, Phone, Sparkles } from "lucide-react";

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
      alert(err.message || "Statusni yangilab bo'lmadi");
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "new":
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">Yangi</span>;
      case "in_progress":
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-amber-500/20 text-amber-400 border border-amber-500/30">Jarayonda</span>;
      case "completed":
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-blue-500/20 text-blue-400 border border-blue-500/30">Bajarildi</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-tg-border text-tg-textSecondary">{status}</span>;
    }
  };

  return (
    <div className="space-y-5 pb-24">
      {/* Header */}
      <div>
        <h2 className="text-lg font-bold text-white">Lidlar & Buyurtmalar CRM</h2>
        <p className="text-xs text-tg-textSecondary">AI botingiz to'plagan barcha murojaatlar va kontaktlar</p>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center space-x-1.5 overflow-x-auto pb-1">
        {[
          { id: "all", label: "Barchasi" },
          { id: "new", label: "Yangi" },
          { id: "in_progress", label: "Jarayonda" },
          { id: "completed", label: "Bajarildi" },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setSelectedStatus(tab.id)}
            className={"px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all " + (
              selectedStatus === tab.id
                ? "bg-blue-600 text-white shadow-md"
                : "bg-tg-surface text-tg-textSecondary hover:text-white border border-tg-border"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Leads List */}
      <div className="space-y-3">
        {leads.length > 0 ? (
          leads.map((lead) => (
            <div key={lead.id} className="bg-tg-surface border border-tg-border rounded-xl p-4 space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center space-x-2">
                    <h4 className="font-bold text-sm text-white">{lead.customer_name || "Noma'lum Mijoz"}</h4>
                    {getStatusBadge(lead.status)}
                  </div>
                  <p className="text-[11px] text-tg-textSecondary mt-0.5">
                    🤖 Bot: <span className="text-blue-400">{lead.agent_name}</span> • {new Date(lead.created_at).toLocaleString("uz-UZ")}
                  </p>
                </div>

                {lead.customer_phone && (
                  <a
                    href={"tel:" + lead.customer_phone}
                    className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 text-xs font-bold transition-all"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>Qo'ng'iroq</span>
                  </a>
                )}
              </div>

              {/* Summary */}
              <div className="bg-tg-bg/60 border border-tg-border/70 rounded-lg p-2.5">
                <div className="flex items-center space-x-1.5 text-blue-400 text-[11px] font-semibold mb-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>AI Xulosasi:</span>
                </div>
                <p className="text-xs text-white leading-relaxed">{lead.summary}</p>
              </div>

              {/* Status Actions */}
              <div className="flex items-center justify-end space-x-2 pt-1 border-t border-tg-border/50">
                {lead.status === "new" && (
                  <button
                    onClick={() => handleStatusChange(lead.id, "in_progress")}
                    className="px-2.5 py-1 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[11px] font-semibold hover:bg-amber-500/30"
                  >
                    Jarayonga olish
                  </button>
                )}
                {lead.status !== "completed" && (
                  <button
                    onClick={() => handleStatusChange(lead.id, "completed")}
                    className="px-2.5 py-1 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30 text-[11px] font-semibold hover:bg-blue-500/30"
                  >
                    Bajarildi deb belgilash
                  </button>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="bg-tg-surface border border-tg-border rounded-xl p-8 text-center space-y-2">
            <Users className="w-10 h-10 text-tg-textSecondary mx-auto opacity-50" />
            <p className="text-sm text-tg-textSecondary">Ushbu filtr bo'yicha hech qanday lid topilmadi.</p>
          </div>
        )}
      </div>
    </div>
  );
}
