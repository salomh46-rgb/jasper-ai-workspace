import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { api } from './services/api';
import Navbar from './components/Navbar';
import BottomNav from './components/BottomNav';
import Dashboard from './pages/Dashboard';
import BotConstructor from './pages/BotConstructor';
import KnowledgeHub from './pages/KnowledgeHub';
import LeadsCRM from './pages/LeadsCRM';
import AgentTester from './pages/AgentTester';
import LiveChatInbox from './pages/LiveChatInbox';
import PaymentsHub from './pages/PaymentsHub';

export default function App() {
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState(null);
  const [agents, setAgents] = useState([]);
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    initApp();
  }, []);

  const initApp = async () => {
    try {
      setLoading(true);
      // Telegram WebApp initData integration
      let initData = '';
      if (window.Telegram && window.Telegram.WebApp && window.Telegram.WebApp.initData) {
        initData = window.Telegram.WebApp.initData;
        window.Telegram.WebApp.ready();
        window.Telegram.WebApp.expand();
      } else {
        // Mock initData for browser preview
        initData = "user=" + encodeURIComponent(JSON.stringify({ id: 12345678, first_name: "Jasper", username: "jasper_dev" }));
      }

      const authData = await api.loginViaTelegram(initData);
      setUser(authData.user);
      await loadData();
    } catch (err) {
      console.error('Init error:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadData = async () => {
    try {
      const [statsData, agentsData, leadsData] = await Promise.all([
        api.getOverviewStats().catch(() => null),
        api.getAgents().catch(() => []),
        api.getLeads().catch(() => [])
      ]);
      setStats(statsData);
      setAgents(agentsData);
      setLeads(leadsData);
    } catch (err) {
      console.error('Load data error:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-tg-bg flex flex-col items-center justify-center p-4 space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-blue-600 animate-pulse flex items-center justify-center shadow-lg shadow-blue-600/40">
          <span className="text-white font-extrabold text-xl">J</span>
        </div>
        <div className="text-center space-y-1">
          <h2 className="font-bold text-base text-white">Jasper AI Workspace</h2>
          <p className="text-xs text-tg-textSecondary">Telegram Mini App yuklanmoqda...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-tg-bg text-tg-text flex flex-col">
      <Navbar user={user} stats={stats} onRefresh={loadData} />
      
      <main className="flex-1 max-w-4xl w-full mx-auto p-4">
        <Routes>
          <Route path="/" element={<Dashboard stats={stats} agents={agents} leads={leads} />} />
          <Route path="/agents" element={<Dashboard stats={stats} agents={agents} leads={leads} />} />
          <Route path="/agents/new" element={<BotConstructor />} />
          <Route path="/agents/:id" element={<BotConstructor />} />
          <Route path="/agents/:agentId/knowledge" element={<KnowledgeHub />} />
          <Route path="/leads" element={<LeadsCRM />} />
          <Route path="/tester" element={<AgentTester agents={agents} />} />
          <Route path="/chat" element={<LiveChatInbox />} />
          <Route path="/payments" element={<PaymentsHub />} />
        </Routes>
      </main>

      <BottomNav newLeadsCount={stats?.new_leads || 0} />
    </div>
  );
}
