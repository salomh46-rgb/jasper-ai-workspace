import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Bot, Database, Users, MessageSquare } from 'lucide-react';

export default function BottomNav({ newLeadsCount = 0 }) {
  const navItems = [
    { to: '/', label: 'Bosh sahifa', icon: LayoutDashboard },
    { to: '/agents', label: 'Agentlar', icon: Bot },
    { to: '/leads', label: 'Lidlar CRM', icon: Users, badge: newLeadsCount },
    { to: '/tester', label: 'AI Test', icon: MessageSquare },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-tg-surface/95 backdrop-blur-lg border-t border-tg-border px-2 py-2 flex items-center justify-around shadow-2xl">
      {navItems.map((item) => {
        const Icon = item.icon;
        return (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => `
              flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all relative
              ${isActive ? 'text-blue-400 font-semibold scale-105' : 'text-tg-textSecondary hover:text-white'}
            `}
          >
            <div className="relative">
              <Icon className="w-5 h-5 mb-0.5" />
              {item.badge > 0 && (
                <span className="absolute -top-1.5 -right-2 bg-emerald-500 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full ring-2 ring-tg-surface animate-pulse">
                  {item.badge}
                </span>
              )}
            </div>
            <span className="text-[11px]">{item.label}</span>
          </NavLink>
        );
      })}
    </nav>
  );
}
