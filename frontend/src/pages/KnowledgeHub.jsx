import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "../services/api";
import { 
  Plus, Trash2, ArrowLeft, BookOpen, Sparkles, 
  Search, FileText, CheckCircle2, X 
} from "lucide-react";

export default function KnowledgeHub() {
  const { agentId } = useParams();
  const navigate = useNavigate();
  
  const [knowledge, setKnowledge] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [saving, setSaving] = useState(false);
  const [newItem, setNewItem] = useState({
    title: "",
    content: "",
    category: "service"
  });

  const categories = [
    { id: "service", label: "Xizmatlar & Narxlar" },
    { id: "faq", label: "Savol-Javob (FAQ)" },
    { id: "promo", label: "Aksiya & Chegirma" },
    { id: "policy", label: "Qoidalar & Manzil" },
  ];

  useEffect(() => {
    if (agentId) loadKnowledge();
  }, [agentId]);

  const loadKnowledge = async () => {
    try {
      const data = await api.getKnowledge(agentId);
      setKnowledge(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!newItem.title || !newItem.content) return;
    try {
      setSaving(true);
      await api.addKnowledge({ agent_id: Number(agentId), ...newItem });
      setShowAddModal(false);
      setNewItem({ title: "", content: "", category: "service" });
      loadKnowledge();
    } catch (err) {
      alert(err.message || "Xatolik yuz berdi");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Ushbu ma\'lumotni o\'chirmoqchimisiz?")) return;
    try {
      await api.deleteKnowledge(id);
      loadKnowledge();
    } catch (err) {
      alert(err.message || "Xatolik");
    }
  };

  const filteredKnowledge = knowledge.filter(k => 
    k.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    k.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-32">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <button 
            onClick={() => navigate(-1)} 
            className="p-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] active:scale-95 border border-white/[0.08] text-slate-300 transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h2 className="text-base sm:text-lg font-extrabold text-white tracking-tight flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-blue-400" />
              <span>Bilimlar Bazasi (RAG)</span>
            </h2>
            <p className="text-xs text-slate-400">AI faqat shu kiritilgan ma\'lumotlar asosida mijozlarga javob beradi</p>
          </div>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-b from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500 text-white font-semibold text-xs shadow-md shadow-blue-600/30 active:scale-95 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Yangi Qoʻshish</span>
        </button>
      </div>

      {/* Search & Stats Bar */}
      <div className="flex items-center space-x-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Bilimlardan qidirish..."
            className="w-full bg-[#0E121B]/90 border border-white/[0.08] focus:border-blue-500/50 rounded-xl pl-9 pr-4 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 outline-none transition-all"
          />
        </div>
        <div className="px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-xs font-mono text-slate-300">
          {knowledge.length} ta mavzu
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
                  <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-line mt-2 pl-0.5">
                    {item.content}
                  </p>
                </div>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="p-2 rounded-lg bg-white/[0.02] hover:bg-rose-500/15 text-slate-400 hover:text-rose-400 border border-transparent hover:border-rose-500/30 transition-all active:scale-90"
                  title="O\'chirish"
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
              Xizmatlar narxlari, manzillar va aksiyalar haqida ma\'lumot qo\'shing. AI ularni o\'rganib oladi.
            </p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md active:scale-95"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Birinchi Bilimni Qoʻshish</span>
          </button>
        </div>
      )}

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl bg-[#0E121B] border border-white/[0.12] p-5 sm:p-6 space-y-4 shadow-2xl animate-scale-up">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
              <h3 className="font-bold text-base text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-blue-400" />
                <span>Yangi Bilim Qo\'shish</span>
              </h3>
              <button 
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
                <label className="text-xs font-medium text-slate-300">Batafsil Ma\'lumot</label>
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
                  {saving ? "Qo'shilmoqda..." : "Saqlash"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
