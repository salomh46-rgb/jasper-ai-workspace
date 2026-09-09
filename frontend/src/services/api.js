const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

class ApiService {
  constructor() {
    this.token = localStorage.getItem('jasper_token') || null;
  }

  setToken(token) {
    this.token = token;
    localStorage.setItem('jasper_token', token);
  }

  getHeaders() {
    const headers = { "Content-Type": "application/json" };
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }
    return headers;
  }

  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const headers = this.getHeaders();
    
    try {
      const response = await fetch(url, {
        ...options,
        headers: { ...headers, ...options.headers }
      });

      if (!response.ok) {
        let errMessage = `Server xatoligi: ${response.status}`;
        try {
          const errData = await response.json();
          if (typeof errData.detail === 'string') {
            errMessage = errData.detail;
          } else if (Array.isArray(errData.detail) && errData.detail.length > 0) {
            errMessage = errData.detail.map(d => d.msg || JSON.stringify(d)).join(', ');
          } else if (errData.detail) {
            errMessage = JSON.stringify(errData.detail);
          } else if (errData.message) {
            errMessage = errData.message;
          }
        } catch (e) {}
        throw new Error(errMessage);
      }

      return await response.json();
    } catch (err) {
      console.error(`API Error on ${endpoint}:`, err);
      throw err;
    }
  }

  // Auth
  async loginViaTelegram(initData) {
    const data = await this.request('/auth/telegram', {
      method: 'POST',
      body: JSON.stringify({ init_data: initData })
    });
    if (data.access_token) {
      this.setToken(data.access_token);
    }
    return data;
  }

  // Stats
  async getOverviewStats() {
    return await this.request('/stats/overview');
  }

  // Agents
  async getTemplates() {
    return await this.request('/agents/templates');
  }

  async getAgents() {
    return await this.request('/agents');
  }

  async getAgent(id) {
    return await this.request(`/agents/${id}`);
  }

  async createAgent(agentData) {
    return await this.request('/agents', {
      method: 'POST',
      body: JSON.stringify(agentData)
    });
  }

  async updateAgent(id, agentData) {
    return await this.request(`/agents/${id}`, {
      method: 'PUT',
      body: JSON.stringify(agentData)
    });
  }

  async deleteAgent(id) {
    return await this.request(`/agents/${id}`, {
      method: 'DELETE'
    });
  }

  async generateAIPrompt(description, category = "custom") {
    return await this.request('/agents/generate-prompt', {
      method: 'POST',
      body: JSON.stringify({ description, category })
    });
  }

  async testAgent(agentId, message, audioBase64 = null, mimeType = "audio/ogg") {
    return await this.request(`/agents/${agentId}/test`, {
      method: 'POST',
      body: JSON.stringify({ message, audio_base64: audioBase64, mime_type: mimeType })
    });
  }

  // Knowledge
  async getKnowledge(agentId) {
    return await this.request(`/knowledge/agent/${agentId}`);
  }

  async addKnowledge(item) {
    return await this.request('/knowledge', {
      method: 'POST',
      body: JSON.stringify(item)
    });
  }

  async deleteKnowledge(itemId) {
    return await this.request(`/knowledge/${itemId}`, {
      method: 'DELETE'
    });
  }

  // Leads
  async getLeads(agentId = null, status = null) {
    let url = '/leads';
    const params = new URLSearchParams();
    if (agentId) params.append('agent_id', agentId);
    if (status) params.append('status', status);
    const qs = params.toString();
    if (qs) url += `?${qs}`;
    return await this.request(url);
  }

  async updateLeadStatus(leadId, status) {
    return await this.request(`/leads/${leadId}`, {
      method: 'PUT',
      body: JSON.stringify({ status })
    });
  }

  async downloadLeadsExcel(agentId = null, status = null) {
    let url = `${API_BASE_URL}/leads/export/excel`;
    const params = new URLSearchParams();
    if (agentId) params.append('agent_id', agentId);
    if (status) params.append('status', status);
    const qs = params.toString();
    if (qs) url += `?${qs}`;

    const headers = {};
    if (this.token) headers['Authorization'] = `Bearer ${this.token}`;

    const response = await fetch(url, { headers });
    if (!response.ok) throw new Error('Excel faylni yuklab olishda xatolik yuz berdi');
    
    const blob = await response.blob();
    const downloadUrl = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = `Jasper_CRM_Lidlar_${new Date().toISOString().slice(0,10)}.xlsx`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(downloadUrl);
  }

  async syncLeadsToSheets(sheetId = "1xmeMSCZmyoheJ9h7M-krzYo5OJkkCkpk71_LluHwb60", webhookUrl = null) {
    return await this.request('/leads/sync-sheets', {
      method: 'POST',
      body: JSON.stringify({ sheet_id: sheetId, webhook_url: webhookUrl })
    });
  }
}

export const api = new ApiService();
