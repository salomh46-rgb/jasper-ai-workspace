import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bot, RefreshCw, Zap, Sparkles, Star, Globe, ChevronDown } from "lucide-react";
import { useLanguage } from "../i18n/LanguageContext";
import { RadarCoreIcon } from "./MicroIcons";

export default function Navbar({ user, stats, onRefresh }) {
  const navigate = useNavigate();
  const { lang, setLanguage, t } = useLanguage();
  const [showLangMenu, setShowLangMenu] = useState(false);

  const languages = [
    { code: "uz", label: "O'zbekcha", flag: "🇺🇿" },
    { code: "ru", label: "Русский", flag: "🇷🇺" },
    { code: "en", label: "English", flag: "🇬🇧" }
  ];

  const currentLang = languages.find(l => l.code === lang) || languages[0];

  return (
    <header className="sticky top-0 z-40 bg-[#07080D]/90 backdrop-blur-xl border-b border-white/[0.07] px-3 py-2 sm:px-4 sm:py-3 flex items-center justify-between">
      <div className="flex items-center space-x-2.5 cursor-pointer shrink-0" onClick={() => navigate("/")}>
        <div className="relative group cursor-pointer">
          <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg blur-sm opacity-60 group-hover:opacity-100 transition duration-300" />
          <div className="relative w-8 h-8 rounded-lg bg-[#0E121B] border border-white/10 flex items-center justify-center shadow-lg overflow-hidden p-1">
            <RadarCoreIcon className="w-full h-full" />
          </div>
        </div>
        <div>
          <div className="flex items-center space-x-1.5">
            <h1 className="font-bold text-xs sm:text-sm tracking-tight text-white flex items-center gap-1">
              Jasper AI
            </h1>
            <span className="text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.2 rounded-full bg-blue-500/15 text-blue-400 border border-blue-500/25">
              {t("studio")}
            </span>
          </div>
          <div className="flex items-center space-x-1 mt-0.5">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
            </span>
            <p className="text-[10px] text-slate-400 font-medium">{t("online_badge")}</p>
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-1.5 sm:space-x-2 shrink-0">
        {/* Language Switcher */}
        <div className="relative">
          <button
            onClick={() => setShowLangMenu(!showLangMenu)}
            className="flex items-center space-x-1 px-2 py-1 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] active:scale-95 border border-white/[0.08] text-[11px] font-semibold text-slate-200 transition-all"
            title="Tilni tanlash / Выбрать язык / Language"
          >
            <span className="text-xs">{currentLang.flag}</span>
            <span className="uppercase font-bold tracking-wide">{currentLang.code}</span>
            <ChevronDown className="w-2.5 h-2.5 text-slate-400" />
          </button>

          {showLangMenu && (
            <div className="absolute right-0 mt-2 w-36 rounded-2xl bg-[#0E121B] border border-white/10 shadow-2xl p-1.5 z-50 animate-fade-in space-y-1">
              {languages.map((l) => (
                <button
                  key={l.code}
                  onClick={() => {
                    setLanguage(l.code);
                    setShowLangMenu(false);
                  }}
                  className={`w-full flex items-center space-x-2 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                    lang === l.code
                      ? "bg-blue-500/20 text-blue-400 font-bold border border-blue-500/30"
                      : "text-slate-300 hover:bg-white/[0.06] hover:text-white"
                  }`}
                >
                  <span className="text-sm">{l.flag}</span>
                  <span>{l.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <button
          onClick={() => navigate("/pricing")}
          className="hidden sm:flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-400 text-[11px] font-bold transition-all active:scale-95"
        >
          <Star className="w-3 h-3 fill-amber-400" />
          <span>{t("pricing")}</span>
        </button>

        <button 
          onClick={onRefresh}
          className="p-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] active:scale-95 border border-white/[0.06] text-slate-400 hover:text-white transition-all duration-150"
          title={t("refresh")}
        >
          <RefreshCw className="w-3.5 h-3.5" />
        </button>

        {/* User Profile avatar */}
        <div 
          onClick={() => navigate("/pricing")} 
          className="flex items-center space-x-1.5 px-2 py-1 rounded-lg bg-white/[0.04] border border-white/[0.08] cursor-pointer hover:bg-white/[0.08] transition-all"
        >
          <div className="w-6 h-6 rounded-md bg-gradient-to-tr from-blue-600 to-indigo-500 text-white flex items-center justify-center font-bold text-[11px] shadow-sm shrink-0">
            {user?.full_name ? user.full_name[0] : "J"}
          </div>
          <span className="hidden sm:inline text-[11px] font-semibold text-slate-200 max-w-[80px] truncate tracking-tight">
            {user?.full_name || "Jasper"}
          </span>
        </div>
      </div>
    </header>
  );
}
