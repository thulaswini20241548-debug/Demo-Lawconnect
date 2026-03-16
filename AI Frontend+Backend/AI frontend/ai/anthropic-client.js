/**
 * LawConnect — Anthropic API Client
 * File: ai/anthropic-client.js
 *
 * Description: Thin wrapper around the Anthropic /v1/messages endpoint.
 *              Manages the API key, conversation history, and all network
 *              calls. Import LEGAL_SYSTEM_PROMPT from legal-system-prompt.js
 *              (loaded before this file in index.html).
 *
 * Usage:
 *   AnthropicClient.setKey('sk-ant-...');
 *   const reply = await AnthropicClient.send('What are my tenant rights?');
 */

const AnthropicClient = (() => {

  /* ── Private State ── */
  let _apiKey = null;
  let _history = [];          // Stores {role, content} pairs for multi-turn chat
  const MODEL   = 'claude-sonnet-4-20250514';
  const MAX_TOK = 1024;
  const ENDPOINT = 'https://api.anthropic.com/v1/messages';

  /* ── Public API ── */
  return {

    /**
     * setKey(key)
     * Store the Anthropic API key for use in subsequent requests.
     * @param {string} key - Anthropic API key (sk-ant-...)
     */
    setKey(key) {
      _apiKey = key;
    },

    /**
     * hasKey()
     * Returns true if an API key has been configured.
     * @returns {boolean}
     */
    hasKey() {
      return !!_apiKey;
    },

    /**
     * clearHistory()
     * Resets the conversation history (starts a fresh session).
     */
    clearHistory() {
      _history = [];
    },

    /**
     * send(userMessage)
     * Sends a user message to Claude with the full legal system prompt and
     * conversation history, then returns the assistant's text reply.
     *
     * @param {string} userMessage - The user's plain-text question
     * @returns {Promise<string>} The assistant's reply text
     * @throws {Error} On network failure or non-200 response
     */
    async send(userMessage) {
      if (!_apiKey) {
        throw new Error('No API key configured. Call AnthropicClient.setKey() first.');
      }

      /* Append user turn to history */
      _history.push({ role: 'user', content: userMessage });

      const body = {
        model:      MODEL,
        max_tokens: MAX_TOK,
        system:     LEGAL_SYSTEM_PROMPT,   // Injected from legal-system-prompt.js
        messages:   _history,
      };

      const response = await fetch(ENDPOINT, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(body),
      });

      /* Handle HTTP errors */
      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        const errMsg  = errData?.error?.message || `HTTP ${response.status}`;

        /* Remove the last user turn so caller can retry */
        _history.pop();

        if (response.status === 401) throw new Error('Invalid API key. Please check your Anthropic key.');
        if (response.status === 429) throw new Error('Rate limit reached. Please wait a moment and try again.');
        throw new Error(`API error: ${errMsg}`);
      }

      const data  = await response.json();
      const reply = data?.content?.[0]?.text ?? 'I could not generate a response. Please try again.';

      /* Append assistant turn to history for multi-turn context */
      _history.push({ role: 'assistant', content: reply });

      return reply;
    },

    /**
     * getHistory()
     * Returns a copy of the current conversation history (read-only).
     * @returns {Array}
     */
    getHistory() {
      return [..._history];
    },

  };

})();
