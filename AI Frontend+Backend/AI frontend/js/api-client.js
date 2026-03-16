/**
 * LawConnect — Backend API Client
 * File: js/api-client.js
 *
 * Replaces ai/anthropic-client.js.
 * All calls go to your Express backend — the Anthropic key never touches the browser.
 *
 * Set BACKEND_URL to your deployed Railway/Render URL.
 * e.g. 'https://lawconnect-api.railway.app'
 * For local development use 'http://localhost:3000'
 */

const API_BASE_URL = 'http://localhost:3000'; // ← change this to your deployed backend URL

const ApiClient = (() => {

  /* ── Private State ── */
  let _token   = localStorage.getItem('lc_token') || null;  // JWT persisted across page reloads
  let _history = [];   // conversation history for multi-turn context

  /* ── Private Helpers ── */

  /**
   * _request(path, options)
   * Base fetch wrapper. Automatically attaches JWT and handles common errors.
   */
  const _request = async (path, options = {}) => {
    const headers = { 'Content-Type': 'application/json' };
    if (_token) headers['Authorization'] = `Bearer ${_token}`;

    const res = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers: { ...headers, ...(options.headers || {}) },
    });

    const data = await res.json();

    if (!res.ok) {
      const err = new Error(data.error || `HTTP ${res.status}`);
      err.status = res.status;
      throw err;
    }

    return data;
  };

  /* ── Public API ── */
  return {

    /* ────────────────────────────────
       AUTH
    ──────────────────────────────── */

    /**
     * signup(email, password)
     * Registers a new user and stores the returned JWT.
     */
    async signup(email, password) {
      const data = await _request('/api/auth/signup', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      _token = data.token;
      localStorage.setItem('lc_token', _token);
      return data.user;
    },

    /**
     * login(email, password)
     * Authenticates user and stores the returned JWT.
     */
    async login(email, password) {
      const data = await _request('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      _token = data.token;
      localStorage.setItem('lc_token', _token);
      return data.user;
    },

    /**
     * logout()
     * Clears the JWT and conversation history.
     */
    logout() {
      _token = null;
      _history = [];
      localStorage.removeItem('lc_token');
    },

    /**
     * isLoggedIn()
     * Returns true if a JWT is stored.
     */
    isLoggedIn() {
      return !!_token;
    },

    /**
     * getMe()
     * Fetches the current user's profile from the backend.
     * Throws if token is invalid/expired.
     */
    async getMe() {
      return _request('/api/auth/me');
    },

    /* ────────────────────────────────
       CHAT
    ──────────────────────────────── */

    /**
     * sendMessage(text)
     * Sends a user message to the backend /api/chat route.
     * Maintains conversation history for multi-turn context.
     *
     * @param {string} text - The user's message
     * @returns {Promise<string>} The AI assistant's reply
     */
    async sendMessage(text) {
      if (!_token) throw new Error('Not logged in. Please log in to continue.');

      const data = await _request('/api/chat', {
        method: 'POST',
        body: JSON.stringify({ message: text, history: _history }),
      });

      /* Update history for next turn */
      _history.push({ role: 'user',      content: text });
      _history.push({ role: 'assistant', content: data.reply });

      /* Keep history to last 20 messages to avoid huge payloads */
      if (_history.length > 20) _history = _history.slice(-20);

      return data.reply;
    },

    /**
     * clearHistory()
     * Resets conversation history (new session).
     */
    clearHistory() {
      _history = [];
    },

    /**
     * getHistory()
     * Returns a copy of the current conversation history.
     */
    getHistory() {
      return [..._history];
    },

  };

})();
