import React from "react";
import { useNavigate } from "react-router-dom";
import { Bot, Users, MessageSquare, Plus, ArrowRight, Sparkles, Building2, ShoppingBag, GraduationCap, Wrench } from "lucide-react";

export default function Dashboard({ stats, agents, onSelectAgent }) {
  const navigate = useNavigate();

  const templates = [
    { id: "clinic", title: "Stomatologiya & Klinika", icon: Building2, desc: "Qabulga yozish, narxlar va maslahat", color: "from-cyan-500 to-blue-600" },
    { id: "shop", title: "Kiyim & Do'kon", icon: ShoppingBag, desc: "Katalog, o'lchamlar va buyurtma", color: "from-pink-500 to-rose-600" },
    { id: "education", title: "O'quv Markazi", icon: GraduationCap, desc: "Kurslar, narxlar va sinov darsi", color: "from-amber-500 to-orange-600" },
    { id: "craftsman", title: "Usta Bozor / Servis", icon: Wrench, desc: "Ta'mirlash, usta chaqirish va diagnostika", color: "from-emerald-500 to-teal-600" }
  ];

  return (
    <div className="space-y-6 pb-20">
      {/* Hero Welcome Card */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-900/60 via-indigo-900/40 to-slate-900/80 border border-blue-500/20 p-5 shadow-xl">
        <div className="relative z-10 space-y-2">
          <div className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-blue-500/20 border border-blue-500/30 text-blue-300 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Google Gemini 2.5 Flash Bilan Kuchaytirilgan</span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            Telegram Biznesingiz Uchun Aqlli AI Agentlar
          </h2>
          <p className="text-sm text-tg-textSecondary max-w-lg">
            Mijozlaringiz bilan 24/7 o'zbek tilida tabiiy suhbatlashuvchi, buyurtma oluvchi va qabulga yozuvchi AI xodimlaringiz.
          </p>
          <div className="pt-2 flex items-center space-x-3">
            <button
              onClick={() => navigate("/agents/new")}
              className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm transition-all shadow-lg shadow-blue-600/30"
            >
              <Plus className="w-4 h-4" />
              <span>Yangi AI Agent Yaratish</span>
            </button>
            <button
              onClick={() => navigate("/tester")}
              className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-tg-surfaceHover hover:bg-tg-border text-white text-sm transition-all"
            >
              <MessageSquare className="w-4 h-4 text-blue-400" />
              <span>AI Sinov</span>
            </button>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-tg-surface border border-tg-border rounded-xl p-3.5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-tg-textSecondary mb-1">
            <span className="text-xs font-medium">Agentlar</span>
            <Bot className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-bold text-white">{stats?.total_agents || 0}</div>
          <div className="text-[10px] text-emerald-400 font-medium mt-1">● Faol holatda</div>
        </div>

        <div className="bg-tg-surface border border-tg-border rounded-xl p-3.5 flex flex-col justify-between cursor-pointer hover:border-emerald-500/40 transition-all" onClick={() => navigate("/leads")}>
          <div className="flex items-center justify-between text-tg-textSecondary mb-1">
            <span className="text-xs font-medium">Yangi Lidlar</span>
            <Users className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-400">{stats?.new_leads || 0}</div>
          <div className="text-[10px] text-tg-textSecondary mt-1">Jami: {stats?.total_leads || 0} ta</div>
        </div>

        <div className="bg-tg-surface border border-tg-border rounded-xl p-3.5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-tg-textSecondary mb-1">
            <span className="text-xs font-medium">Muloqotlar</span>
            <MessageSquare className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-bold text-white">{stats?.total_conversations || 0}</div>
          <div className="text-[10px] text-purple-300 font-medium mt-1">Avtomatik AI</div>
        </div>
      </div>

      {/* Tayyor Shablonlar */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-base text-white">Tayyor Soha Shablonlari</h3>
          <span className="text-xs text-tg-textSecondary">1 daqiqada ishga tushiring</span>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {templates.map((tpl) => {
            const Icon = tpl.icon;
            return (
              <div
                key={tpl.id}
                onClick={() => navigate("/agents/new?category=" + tpl.id)}
                className="group relative overflow-hidden bg-tg-surface hover:bg-tg-surfaceHover border border-tg-border hover:border-blue-500/40 rounded-xl p-3.5 cursor-pointer transition-all duration-200"
              >
                <div className={"w-8 h-8 rounded-lg bg-gradient-to-tr " + tpl.color + " flex items-center justify-center mb-2.5 shadow-md"}>
                  <Icon className="w-4 h-4 text-white" />
                </div>
                <h4 className="font-semibold text-sm text-white group-hover:text-blue-400 transition-colors">{tpl.title}</h4>
                <p className="text-[11px] text-tg-textSecondary mt-1 line-clamp-2">{tpl.desc}</p>
                <div className="mt-2.5 flex items-center space-x-1 text-xs font-semibold text-blue-400">
                  <span>Yaratish</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Faol Agentlar Ro'yxati */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-base text-white">Mening AI Agentlarim</h3>
          <button onClick={() => navigate("/agents")} className="text-xs text-blue-400 hover:underline">Barchasini ko'rish</button>
        </div>

        {agents && agents.length > 0 ? (
          <div className="space-y-2.5">
            {agents.slice(0, 3).map((agent) => (
              <div
                key={agent.id}
                onClick={() => {
                  if (onSelectAgent) onSelectAgent(agent);
                  navigate("/agents/" + agent.id);
                }}
                className="bg-tg-surface hover:bg-tg-surfaceHover border border-tg-border rounded-xl p-3.5 flex items-center justify-between cursor-pointer transition-all"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                    <Bot className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm text-white">{agent.name}</h4>
                    <p className="text-xs text-tg-textSecondary">
                      {agent.company_name || "Kompaniya"} • {agent.knowledge_count} ta bilim • {agent.leads_count} ta lid
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    Online
                  </span>
                  <ArrowRight className="w-4 h-4 text-tg-textSecondary" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-tg-surface border border-tg-border rounded-xl p-6 text-center space-y-3">
            <Bot className="w-10 h-10 text-tg-textSecondary mx-auto opacity-50" />
            <p className="text-sm text-tg-textSecondary">Sizda hali faol agentlar yo'q.</p>
            <button
              onClick={() => navigate("/agents/new")}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold"
            >
              Birinchi Agentni Yaratish
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
