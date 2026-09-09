import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "../services/api";
import { useLanguage } from "../i18n/LanguageContext";
import { 
  Plus, Trash2, ArrowLeft, BookOpen, Sparkles, 
  Search, FileText, CheckCircle2, X, UploadCloud, 
  FileSpreadsheet, FileCode, Image, FileType, Check, AlertCircle,
  Save, ArrowRight, ShieldCheck, Tag, PlusCircle
} from "lucide-react";

export default function KnowledgeHub() {
  const { agentId } = useParams();
  const navigate = useNavigate();
  const { t } = useLanguage();
  
  const [agent, setAgent] = useState(null);
  const [knowledge, setKnowledge] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(null);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const fileInputRef = useRef(null);

  const [newItem, setNewItem] = useState({
    title: "",
    content: "",
    category: "service",
    custom_category: ""
  });

  const [uploadCategory, setUploadCategory] = useState("price");
  const [uploadCustomCategory, setUploadCustomCategory] = useState("");

  const categories = [
    { id: "service", label: t("kb_cat_service") },
    { id: "price", label: t("kb_cat_price") },
    { id: "policy", label: t("kb_cat_policy") },
    { id: "medical", label: t("kb_cat_medical") },
    { id: "education", label: t("kb_cat_education") },
    { id: "delivery", label: t("kb_cat_delivery") },
    { id: "faq", label: t("kb_cat_faq") },
    { id: "promo", label: t("kb_cat_promo") },
    { id: "custom", label: t("kb_cat_custom") },
  ];

  useEffect(() => {
    if (agentId && agentId !== "undefined") {
      loadData();
    }
  }, [agentId]);

  const loadData = async () => {
    try {
      const [agentData, knowledgeData] = await Promise.all([
        api.getAgent(agentId).catch(() => null),
        api.getKnowledge(agentId).catch(() => [])
      ]);
      setAgent(agentData);
      setKnowledge(knowledgeData || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!newItem.title.trim() || !newItem.content.trim()) return;
    if (!agentId || agentId === "undefined") {
      alert("Agent ID topilmadi. Iltimos, avval agentni tanlang yoki yarating.");
      return;
    }

    const finalCategory = newItem.category === "custom" 
      ? (newItem.custom_category.trim() || "Boshqa") 
      : newItem.category;

    try {
      setSaving(true);
      await api.addKnowledge({ 
        agent_id: Number(agentId), 
        title: newItem.title.trim(),
        content: newItem.content.trim(),
        category: finalCategory
      });
      setShowAddModal(false);
      setNewItem({ title: "", content: "", category: "service", custom_category: "" });
      await loadData();
    } catch (err) {
      alert(err.message || "Xatolik yuz berdi");
    } finally {
      setSaving(false);
    }
  };

  const handleFileUpload = async (file) => {
    if (!file || !agentId || agentId === "undefined") return;

    const finalCategory = uploadCategory === "custom"
      ? (uploadCustomCategory.trim() || "Hujjat")
      : uploadCategory;

    try {
      setUploading(true);
      setUploadSuccess(null);
      const res = await api.uploadKnowledgeFile(agentId, file, finalCategory);
      setUploadSuccess(res.message || "Fayl muvaffaqiyatli tahlil qilindi va saqlandi!");
      await loadData();
      setTimeout(() => {
        setShowUploadModal(false);
        setUploadSuccess(null);
      }, 1500);
    } catch (err) {
      alert(err.message || "Faylni yuklashda xatolik");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Ushbu bilimni oʻchirishni xohlaysizmi?")) return;
    try {
      await api.deleteKnowledge(id);
      loadData();
    } catch (err) {
      alert(err.message || "Oʻchirishda xatolik");
    }
  };

  const handleFinishAndSave = () => {
    setShowSuccessToast(true);
    setTimeout(() => {
      navigate("/");
    }, 1000);
  };

  const filteredKnowledge = knowledge.filter(k => 
    k.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    k.content?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    k.category?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-32 animate-fade-in text-white">
      {/* Toast */}
      {showSuccessToast && (
        <div className="fixed top-6 right-6 z-50 bg-emerald-500 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-bounce">
          <CheckCircle2 className="w-5 h-5" />
          <span className="text-sm font-bold">{t("kb_toast_success")}</span>
        </div>
      )}

      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/[0.06] pb-5">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate("/")}
            className="p-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.08] text-white/70 hover:text-white transition active:scale-95"
            title={t("back")}
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-blue-400" />
                <span>{t("kb_title")}</span>
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                {knowledge.length} {t("kb_badge_count")}
              </span>
            </div>
            <p className="text-xs text-white/50 mt-0.5">
              {agent ? `${agent.name} ${t("kb_agent_archive")}` : t("kb_subtitle")}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setShowUploadModal(true)}
            className="px-3.5 py-2 rounded-xl bg-purple-500/15 hover:bg-purple-500/25 border border-purple-500/30 text-purple-300 text-xs font-semibold flex items-center gap-2 transition active:scale-95"
          >
            <UploadCloud className="w-4 h-4 text-purple-400" />
            <span>{t("kb_btn_upload")}</span>
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            className="px-3.5 py-2 rounded-xl bg-blue-500/15 hover:bg-blue-500/25 border border-blue-500/30 text-blue-300 text-xs font-semibold flex items-center gap-2 transition active:scale-95"
          >
            <Plus className="w-4 h-4 text-blue-400" />
            <span>{t("kb_btn_manual")}</span>
          </button>

          <button
            onClick={handleFinishAndSave}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition active:scale-95"
          >
            <Check className="w-4 h-4" />
            <span>{t("kb_btn_save_launch")}</span>
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3.5 top-3 w-4 h-4 text-white/40" />
        <input
          type="text"
          placeholder={t("kb_search_placeholder")}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-[#0a0c13] border border-white/[0.08] focus:border-blue-500/50 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-white placeholder:text-white/30 focus:outline-none"
        />
      </div>

      {/* Knowledge Items Grid */}
      <div className="space-y-3">
        {filteredKnowledge.length === 0 ? (
          <div className="p-12 text-center rounded-3xl bg-white/[0.01] border border-dashed border-white/[0.08]">
            <BookOpen className="w-10 h-10 text-white/20 mx-auto mb-3" />
            <h3 className="text-sm font-semibold text-white/70">{t("kb_empty_title")}</h3>
            <p className="text-xs text-white/40 mt-1 max-w-sm mx-auto">
              {t("kb_empty_desc")}
            </p>
            <div className="mt-4 flex justify-center gap-2">
              <button
                onClick={() => setShowAddModal(true)}
                className="px-4 py-2 rounded-xl bg-blue-500/20 text-blue-300 border border-blue-500/30 text-xs font-semibold"
              >
                {t("kb_btn_manual_add")}
              </button>
              <button
                onClick={() => setShowUploadModal(true)}
                className="px-4 py-2 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-500/30 text-xs font-semibold"
              >
                {t("kb_btn_upload_add")}
              </button>
            </div>
          </div>
        ) : (
          filteredKnowledge.map((item) => (
            <div
              key={item.id}
              className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] hover:border-white/[0.12] transition space-y-2 relative group backdrop-blur-md"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-500/10 text-blue-400 border border-blue-500/20">
                    {item.category || t("all")}
                  </span>
                  <h3 className="text-sm font-bold text-white">{item.title}</h3>
                </div>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 transition opacity-80 hover:opacity-100"
                  title={t("delete")}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              <p className="text-xs text-white/70 leading-relaxed whitespace-pre-line bg-[#06070a]/60 p-3 rounded-xl border border-white/[0.03]">
                {item.content}
              </p>
            </div>
          ))
        )}
      </div>

      {/* Sticky Bottom Finalize Bar */}
      <div className="fixed bottom-20 left-4 right-4 max-w-4xl mx-auto z-30">
        <div className="p-3.5 rounded-2xl bg-[#0e121d]/95 border border-emerald-500/30 shadow-[0_10px_35px_rgba(0,0,0,0.8)] backdrop-blur-xl flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-white">{t("kb_sticky_active")}</div>
              <div className="text-[10px] text-white/50">{knowledge.length} {t("kb_sticky_count")}</div>
            </div>
          </div>

          <button
            onClick={handleFinishAndSave}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-emerald-500/20 active:scale-95 transition"
          >
            <span>{t("kb_btn_to_dashboard")}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Modal: Manual Add Knowledge */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-lg rounded-3xl bg-[#0c0d14] border border-white/[0.1] shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-blue-400" />
                <h3 className="text-base font-bold text-white">{t("kb_modal_add_title")}</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="p-1.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-white/60 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAdd} className="space-y-4">
              <div>
                <label className="text-xs text-white/60 font-medium block mb-1">{t("kb_cat_select_label")}</label>
                <select
                  value={newItem.category}
                  onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                  className="w-full bg-[#12141c] border border-white/[0.08] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500/50"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.label}</option>
                  ))}
                </select>
              </div>

              {newItem.category === "custom" && (
                <div>
                  <label className="text-xs text-emerald-400 font-medium block mb-1">{t("kb_custom_cat_label")}</label>
                  <input
                    type="text"
                    required
                    placeholder={t("kb_custom_cat_placeholder")}
                    value={newItem.custom_category}
                    onChange={(e) => setNewItem({ ...newItem, custom_category: e.target.value })}
                    className="w-full bg-[#12141c] border border-emerald-500/40 rounded-xl px-3.5 py-2 text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              )}

              <div>
                <label className="text-xs text-white/60 font-medium block mb-1">{t("kb_topic_label")}</label>
                <input
                  type="text"
                  required
                  placeholder={t("kb_topic_placeholder")}
                  value={newItem.title}
                  onChange={(e) => setNewItem({ ...newItem, title: e.target.value })}
                  className="w-full bg-[#12141c] border border-white/[0.08] rounded-xl px-3.5 py-2 text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-blue-500/50"
                />
              </div>

              <div>
                <label className="text-xs text-white/60 font-medium block mb-1">{t("kb_content_label")}</label>
                <textarea
                  required
                  rows={6}
                  placeholder={t("kb_content_placeholder")}
                  value={newItem.content}
                  onChange={(e) => setNewItem({ ...newItem, content: e.target.value })}
                  className="w-full bg-[#12141c] border border-white/[0.08] rounded-xl p-3 text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-blue-500/50 resize-none font-sans leading-relaxed"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/[0.06]">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-xs font-semibold text-white/70"
                >
                  {t("cancel")}
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-xs font-bold text-white shadow-lg shadow-blue-500/20 active:scale-95 transition"
                >
                  {saving ? t("kb_btn_saving") : t("kb_btn_save_item")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Smart File Upload */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-lg rounded-3xl bg-[#0c0d14] border border-white/[0.1] shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
              <div className="flex items-center gap-2">
                <UploadCloud className="w-5 h-5 text-purple-400" />
                <h3 className="text-base font-bold text-white">{t("kb_modal_upload_title")}</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowUploadModal(false)}
                className="p-1.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-white/60 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs text-white/60 font-medium block mb-1">{t("kb_cat_select_label")}</label>
                <select
                  value={uploadCategory}
                  onChange={(e) => setUploadCategory(e.target.value)}
                  className="w-full bg-[#12141c] border border-white/[0.08] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500/50"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.label}</option>
                  ))}
                </select>
              </div>

              {uploadCategory === "custom" && (
                <div>
                  <label className="text-xs text-emerald-400 font-medium block mb-1">{t("kb_custom_cat_label")}</label>
                  <input
                    type="text"
                    placeholder={t("kb_custom_cat_placeholder")}
                    value={uploadCustomCategory}
                    onChange={(e) => setUploadCustomCategory(e.target.value)}
                    className="w-full bg-[#12141c] border border-emerald-500/40 rounded-xl px-3.5 py-2 text-xs text-white placeholder:text-white/30 focus:outline-none"
                  />
                </div>
              )}

              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-white/[0.12] hover:border-purple-500/50 rounded-2xl p-8 text-center cursor-pointer transition bg-white/[0.01] hover:bg-white/[0.03]"
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
                  accept=".pdf,.xlsx,.csv,.txt,.docx,.png,.jpg,.jpeg"
                  className="hidden"
                />
                <UploadCloud className="w-10 h-10 text-purple-400/80 mx-auto mb-2 animate-pulse" />
                <h4 className="text-xs font-bold text-white">{t("kb_file_drag_title")}</h4>
                <p className="text-[11px] text-white/40 mt-1">{t("kb_file_drag_sub")}</p>
              </div>

              {uploading && (
                <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 text-center text-xs text-purple-300 animate-pulse">
                  {t("kb_ai_analyzing")}
                </div>
              )}

              {uploadSuccess && (
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-center text-xs text-emerald-300 font-semibold flex items-center justify-center gap-2">
                  <Check className="w-4 h-4" />
                  <span>{uploadSuccess}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
