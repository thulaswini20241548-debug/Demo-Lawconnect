/**
 * LawConnect — Chat Engine
 * File: js/chat.js
 *
 * Description: Handles all chat functionality including:
 *   - Rendering messages (bot + user)
 *   - Showing/hiding the typing indicator
 *   - Sending messages via API or demo fallback
 *   - Markdown → HTML formatting for bot responses
 */

/* ─────────────────────────────────────
   STATE
───────────────────────────────────── */
let _isTyping = false;

/* ─────────────────────────────────────
   HELPERS
───────────────────────────────────── */

/**
 * getFormattedTime()
 * @returns {string} Current time as "HH:MM AM/PM"
 */
function getFormattedTime() {
  return new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
}

/**
 * markdownToHtml(text)
 * Converts a small subset of Markdown to safe HTML for display in chat bubbles.
 * Supported: **bold**, line breaks → <br>, bullet lines
 *
 * @param {string} text - Raw markdown string
 * @returns {string} HTML string
 */
function markdownToHtml(text) {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')   // **bold**
    .replace(/\n• /g, '<br>• ')                           // bullet points
    .replace(/\n(\d+)\./g, '<br>$1.')                     // numbered lists
    .replace(/\n/g, '<br>');                               // line breaks
}

/**
 * scrollToBottom()
 * Scrolls the chat messages container to the latest message.
 */
function scrollToBottom() {
  const container = document.getElementById('chatMessages');
  if (container) container.scrollTop = container.scrollHeight;
}

/* ─────────────────────────────────────
   MESSAGE RENDERING
───────────────────────────────────── */

/**
 * addMessage(role, text)
 * Creates and appends a message bubble to the chat window.
 *
 * @param {'bot' | 'user'} role
 * @param {string} text - Plain text or markdown
 */
function addMessage(role, text) {
  const container = document.getElementById('chatMessages');
  if (!container) return;

  const div        = document.createElement('div');
  div.className    = `msg ${role}`;
  const avatarChar = role === 'bot' ? '⚖' : '👤';
  const formatted  = markdownToHtml(text);

  div.innerHTML = `
    <div class="msg-avatar">${avatarChar}</div>
    <div>
      <div class="msg-bubble">${formatted}</div>
      <div class="msg-time">${getFormattedTime()}</div>
    </div>
  `;

  container.appendChild(div);
  scrollToBottom();
}

/**
 * showTypingIndicator()
 * Displays the animated three-dot "typing..." indicator.
 */
function showTypingIndicator() {
  const container = document.getElementById('chatMessages');
  if (!container) return;

  const div     = document.createElement('div');
  div.className = 'msg bot';
  div.id        = 'typingIndicator';

  div.innerHTML = `
    <div class="msg-avatar">⚖</div>
    <div class="typing-indicator">
      <span></span><span></span><span></span>
    </div>
  `;

  container.appendChild(div);
  scrollToBottom();
}

/**
 * hideTypingIndicator()
 * Removes the typing indicator from the DOM.
 */
function hideTypingIndicator() {
  const el = document.getElementById('typingIndicator');
  if (el) el.remove();
}

/* ─────────────────────────────────────
   SEND MESSAGE FLOW
───────────────────────────────────── */

/**
 * sendMessage()
 * Main entry point triggered by the send button or Enter key.
 * Reads input → renders user bubble → calls AI or demo → renders bot reply.
 */
async function sendMessage() {
  if (_isTyping) return;

  const input   = document.getElementById('chatInput');
  const sendBtn = document.getElementById('sendBtn');
  const text    = input.value.trim();
  if (!text) return;

  /* Clear input */
  input.value      = '';
  input.style.height = 'auto';

  /* Hide quick replies after first user message */
  const qr = document.getElementById('quickReplies');
  if (qr) qr.style.display = 'none';

  /* Disable send while processing */
  sendBtn.disabled = true;
  _isTyping        = true;

  /* Render user message */
  addMessage('user', text);
  showTypingIndicator();

  try {
    let reply;

    if (AnthropicClient.hasKey()) {
      /* ── LIVE AI MODE ── */
      reply = await AnthropicClient.send(text);
    } else {
      /* ── DEMO MODE: simulate network delay ── */
      await new Promise(r => setTimeout(r, 900 + Math.random() * 700));
      reply = getDemoResponse(text);   // from data/demo-responses.js
    }

    hideTypingIndicator();
    addMessage('bot', reply);

  } catch (err) {
    hideTypingIndicator();

    let errMsg = 'I encountered an issue processing your request. Please try again.';
    if (err.message.includes('Invalid API key'))  errMsg = '🔑 ' + err.message + ' Click the API Key button to update it.';
    if (err.message.includes('Rate limit'))       errMsg = '⏳ ' + err.message;

    addMessage('bot',
      `${errMsg}\n\nFor immediate assistance, contact the **Legal Aid Commission** at 011-2433618.`
    );
  }

  _isTyping        = false;
  sendBtn.disabled = false;
  input.focus();
}

/**
 * sendQuick(message)
 * Populates the chat input with a pre-set message and sends it.
 * Used by quick-reply chip buttons.
 *
 * @param {string} message - The message text to send
 */
function sendQuick(message) {
  const input = document.getElementById('chatInput');
  if (!input) return;
  input.value = message;
  sendMessage();
}

/**
 * askAbout(topic)
 * Scrolls to the chat section, then fires a query about a specific topic.
 * Used by practice-area cards.
 *
 * @param {string} topic - A brief description, e.g. "family law in Sri Lanka"
 */
function askAbout(topic) {
  scrollToChat();
  setTimeout(() => {
    const input = document.getElementById('chatInput');
    if (input) {
      input.value = `Tell me about ${topic}`;
      sendMessage();
    }
  }, 850);
}
