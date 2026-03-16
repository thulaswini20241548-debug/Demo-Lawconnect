/**
 * LawConnect — Chat Engine
 * File: js/chat.js
 */

let _isTyping = false;

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
  const container = document.getElementById('chatMessages');
  if (container) container.scrollTop = container.scrollHeight;
}

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

async function sendMessage() {
  if (_isTyping) return;

  if (!ApiClient.isLoggedIn()) {
    openAuthModal('login');
    return;
  }

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
    const reply = await ApiClient.sendMessage(text);
    hideTypingIndicator();
    addMessage('bot', reply);

  } catch (err) {
    hideTypingIndicator();

    if (err.status === 401) {
      ApiClient.logout();
      updateAuthUI();
      addMessage('bot', '🔒 Your session has expired. Please **log in** again to continue.');
      setTimeout(() => openAuthModal('login'), 1200);
      _isTyping        = false;
      sendBtn.disabled = false;
      return;
    }

    let errMsg = 'I encountered an issue processing your request. Please try again.';
    if (err.status === 429) errMsg = '⏳ Too many messages. Please wait a moment and try again.';

    addMessage('bot',
      `${errMsg}\n\nFor immediate assistance, contact the **Legal Aid Commission** at 011-2433618.`
    );
  }

  _isTyping        = false;
  sendBtn.disabled = false;
  input.focus();
}

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
    if (input) {
      input.value = `Tell me about ${topic}`;
      sendMessage();
    }
  }, 850);
}
