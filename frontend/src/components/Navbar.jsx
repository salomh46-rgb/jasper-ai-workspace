import React from 'react';
import { Bot, Sparkles, User, RefreshCw } from 'lucide-react';

export default function Navbar({ user, stats, onRefresh }) {
  return (
    <header className="sticky top-0 z-40 bg-tg-surface/90 backdrop-blur-md border-b border-tg-border px-4 py-3 flex items-center justify-between">
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
          <Bot className="w-6 h-6 text-white" />
        </div>
        <div>
          <div className="flex items-center space-x-1.5">
            <h1 className="font-bold text-base tracking-tight text-white">Jasper AI</h1>
            <span className="text-[10px] uppercase font-extrabold px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30">
              Workspace
            </span>
          </div>
          <p className="text-xs text-tg-textSecondary">Telegram AI Agent Studio</p>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <button 
          onClick={onRefresh}
          className="p-2 rounded-lg bg-tg-surfaceHover hover:bg-tg-border text-tg-textSecondary hover:text-white transition-all"
          title="Yangilash"
        >
          <RefreshCw className="w-4 h-4" />
        </button>

        <div className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-tg-surfaceHover border border-tg-border">
          <div className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-xs">
            {user?.full_name ? user.full_name[0] : 'J'}
          </div>
          <span className="text-xs font-medium text-white max-w-[100px] truncate">
            {user?.full_name || 'Tadbirkor'}
          </span>
        </div>
      </div>
    </header>
  );
}
