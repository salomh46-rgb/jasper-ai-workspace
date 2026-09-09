import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "../services/api";
import { 
  Plus, Trash2, ArrowLeft, BookOpen, Sparkles, 
  Search, FileText, CheckCircle2, X, UploadCloud, 
  FileSpreadsheet, FileCode, Image, FileType, Check, AlertCircle 
} from "lucide-react";

export default function KnowledgeHub() {
  const { agentId } = useParams();
  const navigate = useNavigate();
  
  const [agent, setAgent] = useState(null);
  const [knowledge, setKnowledge] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(null);
  const fileInputRef = useRef(null);

  const [newItem, setNewItem] = useState({
    title: "",
    content: "",
    category: "service"
  });

  const [uploadCategory, setUploadCategory] = useState("price");

  const categories = [
    { id: "service", label: "Xizmatlar & Tavsif" },
    { id: "price", label: "Narxlar & Prayst-list" },
    { id: "faq", label: "Savol-Javob (FAQ)" },
    { id: "promo", label: "Aksiya & Chegirma" },
    { id: "policy", label: "Qoidalar & Manzil" },
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

    try {
      setSaving(true);
      await api.addKnowledge({ 
        agent_id: Number(agentId), 
        title: newItem.title.trim(),
        content: newItem.content.trim(),
        category: newItem.category
      });
      setShowAddModal(false);
      setNewItem({ title: "", content: "", category: "service" });
      loadData();
    } catch (err) {
      alert(err.message || "Xatolik yuz berdi");
    } finally {
      setSaving(false);
    }
  };

  const handleFileUpload = async (file) => {
    if (!file || !agentId || agentId === "undefined") return;

    try {
      setUploading(true);
      setUploadSuccess(null);
      const res = await api.uploadKnowledgeFile(agentId, file, uploadCategory);
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
    if (!confirm("Ushbu maʻlumotni oʻchirmoqchimisiz?")) return;
    try {
      await api.deleteKnowledge(id);
      loadData();
    } catch (err) {
      alert(err.message || "Xatolik yuz berdi");
    }
  };

  const filteredKnowledge = knowledge.filter(k => 
    k.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    k.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-32">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center space-x-3">
          <button 
            type="button"
            onClick={() => navigate("/agents")} 
            className="p-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] active:scale-95 border border-white/[0.08] text-slate-300 transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h2 className="text-base sm:text-lg font-extrabold text-white tracking-tight flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-blue-400" />
              <span>Bilimlar Bazasi (Smart RAG)</span>
            </h2>
            <p className="text-xs text-slate-400">
              {agent ? `${agent.name} bilimlar arxivi` : "AI faqat shu maʻlumotlarga tayanib mijozlarga javob beradi"}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={() => setShowUploadModal(true)}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 active:scale-95 border border-purple-500/25 text-purple-300 text-xs font-semibold shadow-sm transition-all"
          >
            <UploadCloud className="w-3.5 h-3.5 text-purple-400" />
            <span>📂 Fayl Yuklash</span>
          </button>

          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-b from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500 text-white font-semibold text-xs shadow-md shadow-blue-600/30 active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Yozma Qoʻshish</span>
          </button>
        </div>
      </div>

      {/* Search & Stats Bar */}
      <div className="flex items-center space-x-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Bilimlar bazasidan qidirish..."
            className="w-full bg-[#0E121B]/90 border border-white/[0.08] focus:border-blue-500/50 rounded-xl pl-9 pr-4 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 outline-none transition-all"
          />
        </div>
        <div className="px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-xs font-mono text-slate-300 whitespace-nowrap">
          {knowledge.length} ta bilim
        </div>
      </div>

      {/* Knowledge Cards List */}
      {filteredKnowledge.length > 0 ? (
        <div className="space-y-3">
          {filteredKnowledge.map((item) => (
            <div
              key={item.id}
              className="group relative overflow-hidden rounded-2xl bg-[#0E121B]/90 backdrop-blur-xl border border-white/[0.07] hover:border-white/[0.15] p-4.5 transition-all shadow-[0_4px_20px_rgba(0,0,0,0.3)]"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1 flex-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                      {item.category || "Xizmat"}
                    </span>
                    <h4 className="font-bold text-sm text-white tracking-tight">{item.title}</h4>
                  </div>
                  <div className="text-xs text-slate-300 leading-relaxed whitespace-pre-line mt-2 pl-0.5 overflow-x-auto">
                    {item.content}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleDelete(item.id)}
                  className="p-2 rounded-lg bg-white/[0.02] hover:bg-rose-500/15 text-slate-400 hover:text-rose-400 border border-transparent hover:border-rose-500/30 transition-all active:scale-90"
                  title="Oʻchirish"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl bg-[#0E121B]/70 border border-dashed border-white/[0.1] p-8 text-center space-y-3">
          <FileText className="w-10 h-10 text-slate-400 mx-auto opacity-50" />
          <div>
            <p className="text-sm font-semibold text-slate-200">Hali hech qanday bilim kiritilmagan</p>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              PDF prayst-list, Excel jadval, menyu rasmi yoki matnli xizmatlar haqida maʻlumot qoʻshing. AI ularni bir zumda oʻrganadi.
            </p>
          </div>
          <div className="flex items-center justify-center gap-2 pt-1">
            <button
              type="button"
              onClick={() => setShowUploadModal(true)}
              className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-md active:scale-95"
            >
              <UploadCloud className="w-3.5 h-3.5" />
              <span>Fayl Yuklash (PDF / Excel / Rasm)</span>
            </button>
            <button
              type="button"
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] text-white text-xs font-semibold active:scale-95"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Matn Yozish</span>
            </button>
          </div>
        </div>
      )}

      {/* Upload File Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-lg rounded-2xl bg-[#0E121B] border border-white/[0.12] p-5 sm:p-6 space-y-4 shadow-2xl animate-scale-up">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
              <h3 className="font-bold text-base text-white flex items-center gap-2">
                <UploadCloud className="w-5 h-5 text-purple-400" />
                <span>Smart Fayl Yuklash & RAG</span>
              </h3>
              <button 
                type="button"
                onClick={() => setShowUploadModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <p className="text-xs text-slate-300 leading-relaxed">
                Klinika prayst-listi (PDF), tovarlar jadvali (Excel) yoki kafe menyusi rasmini yuklang. AI faylni avtomatik oʻqib, bilimlar bazasiga joylaydi.
              </p>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300">Kategoriya</label>
                <select
                  value={uploadCategory}
                  onChange={(e) => setUploadCategory(e.target.value)}
                  className="w-full bg-[#07080D] border border-white/[0.08] rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white outline-none"
                >
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>{c.label}</option>
                  ))}
                </select>
              </div>

              {/* Drag and Drop Zone */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className="rounded-2xl border-2 border-dashed border-purple-500/30 hover:border-purple-500/60 bg-purple-500/[0.03] hover:bg-purple-500/[0.06] p-8 text-center cursor-pointer transition-all duration-200 space-y-3 group"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.xlsx,.xls,.csv,.txt,.md,.png,.jpg,.jpeg,.webp"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleFileUpload(e.target.files[0]);
                    }
                  }}
                />
                <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 mx-auto group-hover:scale-110 transition-transform">
                  <UploadCloud className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">
                    {uploading ? "Fayl tahlil qilinmoqda..." : "Faylni tanlang yoki shu yerga tashlang"}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-1">
                    PDF, Excel (.xlsx, .csv), Word/Text (.txt), Rasm (Menyu, Prayst)
                  </p>
                </div>
              </div>

              {/* Supported Badges */}
              <div className="flex flex-wrap items-center justify-center gap-2 pt-1 text-[11px] text-slate-400">
                <span className="px-2 py-0.5 rounded-md bg-white/[0.04] border border-white/[0.06]">📄 PDF Hujjat</span>
                <span className="px-2 py-0.5 rounded-md bg-white/[0.04] border border-white/[0.06]">📊 Excel Jadval</span>
                <span className="px-2 py-0.5 rounded-md bg-white/[0.04] border border-white/[0.06]">🖼️ Rasm Menyu</span>
              </div>

              {uploadSuccess && (
                <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2 animate-fade-in">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{uploadSuccess}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Add Text Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-lg rounded-2xl bg-[#0E121B] border border-white/[0.12] p-5 sm:p-6 space-y-4 shadow-2xl animate-scale-up">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
              <h3 className="font-bold text-base text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-blue-400" />
                <span>Yozma Bilim Qoʻshish</span>
              </h3>
              <button 
                type="button"
                onClick={() => setShowAddModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAdd} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300">Kategoriya</label>
                <select
                  value={newItem.category}
                  onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                  className="w-full bg-[#07080D] border border-white/[0.08] rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white outline-none"
                >
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>{c.label}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300">Mavzu / Xizmat Nomi</label>
                <input
                  type="text"
                  required
                  value={newItem.title}
                  onChange={(e) => setNewItem({ ...newItem, title: e.target.value })}
                  placeholder="Masalan: Tish tozalash va oqartirish narxlari"
                  className="w-full bg-[#07080D] border border-white/[0.08] rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300">Batafsil Maʻlumot</label>
                <textarea
                  rows={5}
                  required
                  value={newItem.content}
                  onChange={(e) => setNewItem({ ...newItem, content: e.target.value })}
                  placeholder="Tish tozalash (Airflow) - 150 000 so'm. Oqartirish (Zoom 4) - 1 200 000 so'm..."
                  className="w-full bg-[#07080D] border border-white/[0.08] rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white outline-none leading-relaxed"
                />
              </div>

              <div className="pt-2 flex items-center justify-end space-x-2.5">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 text-xs font-semibold"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-b from-blue-500 to-blue-600 text-white text-xs font-semibold shadow-md active:scale-95 disabled:opacity-50"
                >
                  {saving ? "Qoʻshilmoqda..." : "Saqlash"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
