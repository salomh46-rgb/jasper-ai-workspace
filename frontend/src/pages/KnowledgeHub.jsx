import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "../services/api";
import { Plus, Trash2, ArrowLeft, BookOpen } from "lucide-react";

export default function KnowledgeHub() {
  const { agentId } = useParams();
  const navigate = useNavigate();
  
  const [knowledge, setKnowledge] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newItem, setNewItem] = useState({
    title: "",
    content: "",
    category: "service"
  });

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
      await api.addKnowledge({ agent_id: Number(agentId), ...newItem });
      setShowAddModal(false);
      setNewItem({ title: "", content: "", category: "service" });
      loadKnowledge();
    } catch (err) {
      alert(err.message || "Xatolik yuz berdi");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Ushbu ma'lumotni o'chirmoqchimisiz?")) return;
    try {
      await api.deleteKnowledge(id);
      loadKnowledge();
    } catch (err) {
      alert(err.message || "Xatolik");
    }
  };

  return (
    <div className="space-y-6 pb-24">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <button onClick={() => navigate(-1)} className="p-2 rounded-xl bg-tg-surface hover:bg-tg-surfaceHover border border-tg-border">
            <ArrowLeft className="w-5 h-5 text-tg-textSecondary" />
          </button>
          <div>
            <h2 className="text-lg font-bold text-white">Bilimlar Bazasi (RAG Hub)</h2>
            <p className="text-xs text-tg-textSecondary">AI aynan shu ma'lumotlar asosida javob beradi</p>
          </div>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs flex items-center space-x-1.5 shadow-lg shadow-blue-600/30"
        >
          <Plus className="w-4 h-4" />
          <span>Qo'shish</span>
        </button>
      </div>

      {/* Ro'yxat */}
      <div className="space-y-3">
        {knowledge.length > 0 ? (
          knowledge.map((item) => (
            <div key={item.id} className="bg-tg-surface border border-tg-border rounded-xl p-4 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-blue-500/20 text-blue-400 border border-blue-500/30">
                    {item.category}
                  </span>
                  <h4 className="font-semibold text-sm text-white">{item.title}</h4>
                </div>
                <button onClick={() => handleDelete(item.id)} className="text-red-400 hover:text-red-300 p-1">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <p className="text-xs text-tg-textSecondary leading-relaxed whitespace-pre-wrap">{item.content}</p>
            </div>
          ))
        ) : (
          <div className="bg-tg-surface border border-tg-border rounded-xl p-8 text-center space-y-3">
            <BookOpen className="w-10 h-10 text-tg-textSecondary mx-auto opacity-50" />
            <p className="text-sm text-tg-textSecondary">Hozircha bilimlar bazasi bo'sh.</p>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-semibold"
            >
              Yangi Ma'lumot Kiritish
            </button>
          </div>
        )}
      </div>

      {/* Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-tg-surface border border-tg-border rounded-2xl w-full max-w-md p-5 space-y-4">
            <h3 className="text-base font-bold text-white">Yangi Bilim / Narx Qo'shish</h3>
            <form onSubmit={handleAdd} className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs text-tg-textSecondary">Sarlavha</label>
                <input
                  type="text"
                  required
                  value={newItem.title}
                  onChange={e => setNewItem({ ...newItem, title: e.target.value })}
                  placeholder="Masalan: Tish plombalash narxlari"
                  className="w-full bg-tg-bg border border-tg-border rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-tg-textSecondary">Kategoriya</label>
                <select
                  value={newItem.category}
                  onChange={e => setNewItem({ ...newItem, category: e.target.value })}
                  className="w-full bg-tg-bg border border-tg-border rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="service">Xizmat (Service)</option>
                  <option value="price">Narxlar (Price)</option>
                  <option value="faq">FAQ (Savol-Javob)</option>
                  <option value="policy">Qoidalar & Yetkazish</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs text-tg-textSecondary">Batafsil matn / faktlar</label>
                <textarea
                  rows={5}
                  required
                  value={newItem.content}
                  onChange={e => setNewItem({ ...newItem, content: e.target.value })}
                  placeholder="Xizmat haqida to'liq narxlar, shartlar va tavsiflar..."
                  className="w-full bg-tg-bg border border-tg-border rounded-xl p-3 text-xs text-white leading-relaxed focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="pt-2 flex items-center space-x-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2.5 rounded-xl bg-tg-surfaceHover text-tg-textSecondary hover:text-white text-xs font-semibold"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold"
                >
                  Saqlash
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
