import React from "react";
import { NavLink } from "react-router-dom";
import { LayoutDashboard, Bot, Users, MessageSquare } from "lucide-react";

export default function BottomNav({ newLeadsCount = 0 }) {
  const navItems = [
    { to: "/", label: "Bosh sahifa", icon: LayoutDashboard },
    { to: "/agents", label: "Agentlar", icon: Bot },
    { to: "/leads", label: "Lidlar CRM", icon: Users, badge: newLeadsCount },
    { to: "/tester", label: "AI Test", icon: MessageSquare },
  ];

  return (
    <div className="fixed bottom-3 inset-x-0 z-40 flex justify-center px-4 pointer-events-none">
      <nav className="pointer-events-auto max-w-md w-full bg-[#0E121B]/90 backdrop-blur-2xl border border-white/[0.1] rounded-2xl px-2 py-2 flex items-center justify-around shadow-[0_12px_40px_rgba(0,0,0,0.8),inset_0_1px_0_rgba(255,255,255,0.12)]">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                "relative flex flex-col items-center justify-center py-1.5 px-3 rounded-xl transition-all duration-200 group active:scale-90 " +
                (isActive 
                  ? "text-blue-400 font-semibold" 
                  : "text-slate-400 hover:text-slate-200")
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <span className="absolute inset-0 bg-blue-500/10 border border-blue-500/25 rounded-xl shadow-[0_0_12px_rgba(59,130,246,0.25)] -z-10 animate-fade-in" />
                  )}
                  <div className="relative">
                    <Icon className={"w-5 h-5 mb-0.5 transition-transform duration-200 " + (isActive ? "scale-110" : "group-hover:scale-105")} />
                    {item.badge > 0 && (
                      <span className="absolute -top-1.5 -right-2 bg-gradient-to-r from-emerald-500 to-teal-400 text-white text-[10px] font-extrabold px-1.5 py-0.2 rounded-full ring-2 ring-[#0E121B] shadow-[0_0_8px_rgba(16,185,129,0.5)] animate-pulse">
                        {item.badge}
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] tracking-tight">{item.label}</span>
                </>
              )}
            </NavLink>
          );
        })}
      </nav>
    </div>
  );
}
