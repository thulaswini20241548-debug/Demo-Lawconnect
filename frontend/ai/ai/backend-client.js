/**
 * LawConnect — Backend API Client (Enhanced)
 * File: ai/backend-client.js
 */

const BackendClient = (() => {

const BACKEND_URL = window.location.hostname === 'localhost'
  ? 'http://localhost:5000'
  : 'https://demo-lawconnect.onrender.com'; 

  let _history = [];

  async function _request(path, options = {}) {
    const res = await fetch(`${BACKEND_URL}${path}`, {
      ...options,
      headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data?.error || `HTTP ${res.status}`);
    return data;
  }

  return {

    async send(userMessage) {
      const data = await _request('/api/ai/chat', {
        method: 'POST',
        body: JSON.stringify({ message: userMessage, history: _history }),
      });

      const reply      = data?.reply      ?? 'I could not generate a response. Please try again.';
      const confidence = data?.confidence ?? 'medium';
      const reason     = data?.reason     ?? '';

      _history.push({ role: 'user',      content: userMessage });
      _history.push({ role: 'assistant', content: reply });

      if (_history.length > 20) _history = _history.slice(_history.length - 20);

      return { reply, confidence, reason };
    },

    async analyseDocument(documentText, filename) {
      const data = await _request('/api/ai/analyse',  {
        method: 'POST',
        body: JSON.stringify({ documentText, filename }),
      });
      return data;
    },

    clearHistory() { _history = []; },
    getHistory()   { return [..._history]; },

  };

})();
