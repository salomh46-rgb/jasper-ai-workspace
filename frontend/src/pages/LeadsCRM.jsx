import React, { useState, useEffect } from "react";
import { api } from "../services/api";
import { 
  Users, Phone, Sparkles, Download, Sheet, ExternalLink, 
  CheckCircle2, Clock, X, RefreshCw, Layers 
} from "lucide-react";

export default function LeadsCRM() {
  const [leads, setLeads] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [downloading, setDownloading] = useState(false);
  const [showSheetsModal, setShowSheetsModal] = useState(false);
  const [syncingSheets, setSyncingSheets] = useState(false);
  const [sheetId, setSheetId] = useState("1xmeMSCZmyoheJ9h7M-krzYo5OJkkCkpk71_LluHwb60");
  const [webhookUrl, setWebhookUrl] = useState("");
  const [syncResult, setSyncResult] = useState(null);

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
      alert(err.message || "Statusni yangilab boʻlmadi");
    }
  };

  const handleExportExcel = async () => {
    try {
      setDownloading(true);
      await api.downloadLeadsExcel(null, selectedStatus === "all" ? null : selectedStatus);
    } catch (err) {
      alert(err.message || "Excel yuklab olishda xatolik");
    } finally {
      setDownloading(false);
    }
  };

  const handleSyncSheets = async (e) => {
    e.preventDefault();
    try {
      setSyncingSheets(true);
      const res = await api.syncLeadsToSheets(sheetId, webhookUrl || null);
      setSyncResult(res.message || "Muvaffaqiyatli sinxronlandi!");
      setTimeout(() => setSyncResult(null), 4000);
    } catch (err) {
      alert(err.message || "Sinxronlashda xatolik");
    } finally {
      setSyncingSheets(false);
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
      {/* Header with Excel & Sheets action buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-base sm:text-lg font-extrabold text-white tracking-tight flex items-center gap-2">
            <Users className="w-5 h-5 text-emerald-400" />
            <span>Lidlar & Buyurtmalar CRM</span>
          </h2>
          <p className="text-xs text-slate-400">AI bot toʻplagan barcha mijozlar va buyurtmalar</p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={handleExportExcel}
            disabled={downloading}
            className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] active:scale-95 border border-white/[0.08] text-slate-200 text-xs font-semibold shadow-sm transition-all"
            title="Excel formatida yuklab olish"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            <span>{downloading ? "Yuklanmoqda..." : "Excel (.xlsx)"}</span>
          </button>

          <button
            type="button"
            onClick={() => setShowSheetsModal(true)}
            className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 active:scale-95 border border-emerald-500/25 text-emerald-400 text-xs font-semibold shadow-sm transition-all"
          >
            <Sheet className="w-3.5 h-3.5" />
            <span>Google Sheets</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-1">
        {[
          { id: "all", label: "Barchasi" },
          { id: "new", label: "Yangi Lidlar" },
          { id: "in_progress", label: "Bogʻlanilgan" },
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
                    <span>{lead.customer_phone || "Raqam yoʻq"}</span>
                  </div>
                </div>

                <div className="flex items-center space-x-1.5">
                  {lead.customer_phone && (
                    <a
                      href={"tel:" + lead.customer_phone}
                      className="p-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 transition-all active:scale-95"
                      title="Qoʻngʻiroq qilish"
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

      {/* Google Sheets Modal */}
      {showSheetsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-lg rounded-2xl bg-[#0E121B] border border-white/[0.12] p-5 sm:p-6 space-y-4 shadow-2xl animate-scale-up">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
              <h3 className="font-bold text-base text-white flex items-center gap-2">
                <Sheet className="w-5 h-5 text-emerald-400" />
                <span>Google Sheets Integratsiyasi</span>
              </h3>
              <button 
                onClick={() => setShowSheetsModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSyncSheets} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300">Google Sheets ID</label>
                <input
                  type="text"
                  value={sheetId}
                  onChange={(e) => setSheetId(e.target.value)}
                  placeholder="1xmeMSCZmyoheJ9h7M-krzYo5OJkkCkpk71_LluHwb60"
                  className="w-full bg-[#07080D] border border-white/[0.08] rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white font-mono outline-none"
                />
                <a
                  href={`https://docs.google.com/spreadsheets/d/${sheetId}/edit`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[11px] text-emerald-400 hover:underline pt-0.5"
                >
                  <span>Google Sheets Jadvalini Ochish</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300">Apps Script Webhook URL (Ixtiyoriy)</label>
                <input
                  type="text"
                  value={webhookUrl}
                  onChange={(e) => setWebhookUrl(e.target.value)}
                  placeholder="https://script.google.com/macros/s/.../exec"
                  className="w-full bg-[#07080D] border border-white/[0.08] rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white placeholder-slate-600 outline-none"
                />
                <p className="text-[11px] text-slate-400">
                  Google Apps Script webhook havolasini kiritsangiz, har bir yangi lid avtomatik ravishda jadval qatoriga qoʻshiladi.
                </p>
              </div>

              {syncResult && (
                <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{syncResult}</span>
                </div>
              )}

              <div className="pt-2 flex items-center justify-end space-x-2.5">
                <button
                  type="button"
                  onClick={() => setShowSheetsModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 text-xs font-semibold"
                >
                  Yopish
                </button>
                <button
                  type="submit"
                  disabled={syncingSheets}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-b from-emerald-500 to-teal-600 text-white text-xs font-semibold shadow-md active:scale-95 disabled:opacity-50 flex items-center gap-1.5"
                >
                  <RefreshCw className={"w-3.5 h-3.5 " + (syncingSheets ? "animate-spin" : "")} />
                  <span>{syncingSheets ? "Sinxronlanmoqda..." : "Hozir Sinxronlash"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
