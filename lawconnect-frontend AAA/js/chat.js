/**
 * LawConnect — Chat Engine (Enhanced)
 * File: js/chat.js
 *
 * Features: voice input, confidence badges, message actions,
 *           chat history persistence, document analyser integration
 */

let _isTyping = false;

/* ── helpers ── */
function getFormattedTime() {
  return new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
}

function markdownToHtml(text) {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n• /g, '<br>• ')
    .replace(/\n(\d+)\./g, '<br>$1.')
    .replace(/\n/g, '<br>');
}

function scrollToBottom() {
  const c = document.getElementById('chatMessages');
  if (c) c.scrollTop = c.scrollHeight;
}

/* ── confidence badge ── */
function buildConfidenceBadge(confidence, reason) {
  if (!confidence) return '';
  const map = {
    high:   { label: 'High confidence',    cls: 'conf-high',   icon: '✦' },
    medium: { label: 'Moderate confidence', cls: 'conf-medium', icon: '◈' },
    low:    { label: 'Consult a lawyer',    cls: 'conf-low',    icon: '⚠' },
  };
  const c = map[confidence] || map.medium;
  const tip = reason ? ` — ${reason}` : '';
  return `<div class="conf-badge ${c.cls}" title="${c.label}${tip}">${c.icon} ${c.label}${tip}</div>`;
}

/* ── add message ── */
function addMessage(role, text, confidence, reason) {
  const container = document.getElementById('chatMessages');
  if (!container) return;

  const div        = document.createElement('div');
  div.className    = `msg ${role}`;
  const avatarChar = role === 'bot' ? '⚖' : '👤';
  const formatted  = markdownToHtml(text);
  const badge      = (role === 'bot' && confidence) ? buildConfidenceBadge(confidence, reason) : '';
  const msgId      = 'msg-' + Date.now() + '-' + Math.random().toString(36).slice(2, 7);

  const copyBtn = role === 'bot'
    ? `<button class="msg-action-btn" onclick="copyMessage('${msgId}')" title="Copy">⎘</button>`
    : '';

  div.innerHTML = `
    <div class="msg-avatar">${avatarChar}</div>
    <div class="msg-body">
      <div class="msg-bubble" id="${msgId}">${formatted}</div>
      ${badge}
      <div class="msg-meta">
        <span class="msg-time">${getFormattedTime()}</span>
        ${copyBtn}
      </div>
    </div>
  `;

  container.appendChild(div);
  scrollToBottom();

  /* persist to history */
  ChatHistory.save(role, text);
}

/* ── copy message ── */
function copyMessage(msgId) {
  const el = document.getElementById(msgId);
  if (!el) return;
  const text = el.innerText || el.textContent;
  navigator.clipboard.writeText(text).then(() => {
    const btn = el.closest('.msg-body').querySelector('.msg-action-btn');
    if (btn) { btn.textContent = '✓'; setTimeout(() => { btn.textContent = '⎘'; }, 1500); }
  });
}

/* ── typing indicator ── */
function showTypingIndicator() {
  const container = document.getElementById('chatMessages');
  if (!container) return;
  const div     = document.createElement('div');
  div.className = 'msg bot';
  div.id        = 'typingIndicator';
  div.innerHTML = `
    <div class="msg-avatar">⚖</div>
    <div class="typing-indicator"><span></span><span></span><span></span></div>
  `;
  container.appendChild(div);
  scrollToBottom();
}

function hideTypingIndicator() {
  const el = document.getElementById('typingIndicator');
  if (el) el.remove();
}

/* ── send message ── */
async function sendMessage() {
  if (_isTyping) return;

  const input   = document.getElementById('chatInput');
  const sendBtn = document.getElementById('sendBtn');
  const text    = input.value.trim();
  if (!text) return;

  input.value        = '';
  input.style.height = 'auto';

  const qr = document.getElementById('quickReplies');
  if (qr) qr.style.display = 'none';

  sendBtn.disabled = true;
  _isTyping        = true;

  addMessage('user', text);
  showTypingIndicator();

  try {
    const { reply, confidence, reason } = await BackendClient.send(text);
    hideTypingIndicator();
    addMessage('bot', reply, confidence, reason);
  } catch (err) {
    hideTypingIndicator();
    let errMsg = 'I encountered an issue. Please try again.';
    if (err.message.includes('429') || err.message.toLowerCase().includes('too many')) {
      errMsg = '⏳ Too many requests. Please wait a moment.';
    } else if (err.message.toLowerCase().includes('network') || err.message.includes('fetch')) {
      errMsg = '🌐 Could not reach the server. Please check your connection.';
    }
    addMessage('bot', `${errMsg}\n\nFor immediate assistance, contact the **Legal Aid Commission** at 011-2433618.`);
  }

  _isTyping        = false;
  sendBtn.disabled = false;
  input.focus();
}

/* ── quick / practice ── */
function sendQuick(message) {
  const input = document.getElementById('chatInput');
  if (!input) return;
  input.value = message;
  sendMessage();
}

function askAbout(topic) {
  scrollToChat();
  setTimeout(() => {
    const input = document.getElementById('chatInput');
    if (input) { input.value = `Tell me about ${topic}`; sendMessage(); }
  }, 850);
}
