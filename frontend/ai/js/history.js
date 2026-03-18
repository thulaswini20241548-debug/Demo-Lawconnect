/**
 * LawConnect — Chat History & PDF Export
 * File: js/history.js
 *
 * Saves every message to localStorage.
 * Renders a slide-in history panel.
 * Exports the current session as a printable PDF.
 */

const ChatHistory = (() => {

  const STORAGE_KEY = 'lawconnect_chat_history';
  let _session = [];

  /* ── persist ── */
  function save(role, text) {
    _session.push({ role, text, time: new Date().toISOString() });
    try {
      const all = _load();
      all.push({ role, text, time: new Date().toISOString() });
      /* keep last 200 messages total */
      const trimmed = all.slice(-200);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
    } catch (_) { /* storage full — silently skip */ }
  }

  function _load() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); } catch (_) { return []; }
  }

  function clearAll() {
    _session = [];
    localStorage.removeItem(STORAGE_KEY);
    const panel = document.getElementById('historyPanel');
    if (panel) _renderPanel(panel, []);
  }

  /* ── panel ── */
  function togglePanel() {
    let overlay = document.getElementById('historyOverlay');
    if (!overlay) { overlay = _createOverlay(); document.body.appendChild(overlay); }
    const isOpen = overlay.classList.contains('open');
    if (isOpen) {
      overlay.classList.remove('open');
    } else {
      _renderPanel(overlay.querySelector('#historyPanel'), _load());
      overlay.classList.add('open');
    }
  }

  function _createOverlay() {
    const overlay = document.createElement('div');
    overlay.id = 'historyOverlay';
    overlay.className = 'history-overlay';
    overlay.innerHTML = `
      <div class="history-panel">
        <div class="history-header">
          <span class="history-title">Chat History</span>
          <div class="history-header-actions">
            <button class="history-btn" onclick="ChatHistory.exportPDF()" title="Export PDF">⬇ Export PDF</button>
            <button class="history-btn danger" onclick="ChatHistory.clearAll()" title="Clear all">✕ Clear</button>
            <button class="history-close" onclick="ChatHistory.togglePanel()">✕</button>
          </div>
        </div>
        <div id="historyPanel" class="history-body"></div>
      </div>
    `;
    overlay.addEventListener('click', e => {
      if (e.target === overlay) overlay.classList.remove('open');
    });
    return overlay;
  }

  function _renderPanel(container, messages) {
    if (!container) return;
    if (!messages.length) {
      container.innerHTML = '<p class="history-empty">No chat history yet. Start a conversation!</p>';
      return;
    }
    container.innerHTML = messages.map((m, i) => {
      const time = m.time ? new Date(m.time).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '';
      const preview = (m.text || '').replace(/<[^>]*>/g, '').slice(0, 120);
      const cls = m.role === 'user' ? 'hist-user' : 'hist-bot';
      const avatar = m.role === 'user' ? '👤' : '⚖';
      return `
        <div class="hist-item ${cls}" onclick="ChatHistory.replayFrom(${i})">
          <div class="hist-avatar">${avatar}</div>
          <div class="hist-content">
            <div class="hist-preview">${preview}${m.text.length > 120 ? '…' : ''}</div>
            <div class="hist-time">${time}</div>
          </div>
        </div>
      `;
    }).join('');
    container.scrollTop = container.scrollHeight;
  }

  /* ── replay ── */
  function replayFrom(index) {
    const all = _load();
    const msg = all[index];
    if (!msg || msg.role !== 'user') return;
    document.getElementById('historyOverlay').classList.remove('open');
    scrollToChat();
    setTimeout(() => {
      const input = document.getElementById('chatInput');
      if (input) { input.value = msg.text; sendMessage(); }
    }, 600);
  }

  /* ── PDF export ── */
  function exportPDF() {
    const messages = _load();
    if (!messages.length) { alert('No chat history to export.'); return; }

    const printWindow = window.open('', '_blank');
    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>LawConnect — Chat Export</title>
  <style>
    body { font-family: Georgia, serif; max-width: 680px; margin: 40px auto; color: #2a2416; font-size: 14px; line-height: 1.7; }
    .export-header { border-bottom: 2px solid #c9a84c; padding-bottom: 16px; margin-bottom: 24px; }
    .export-title { font-size: 24px; font-weight: 600; color: #2a2416; }
    .export-title span { color: #c9a84c; }
    .export-meta { font-size: 12px; color: #888; margin-top: 4px; }
    .disclaimer { background: #fdf8ef; border: 1px solid #c9a84c; border-radius: 6px; padding: 12px 16px; font-size: 12px; color: #7a6a4a; margin-bottom: 24px; }
    .msg { margin-bottom: 16px; display: flex; gap: 12px; }
    .msg-label { font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 4px; }
    .user .msg-label { color: #c9a84c; }
    .bot  .msg-label { color: #6b7db3; }
    .msg-text { background: #f5f0e8; padding: 10px 14px; border-radius: 8px; font-size: 13px; }
    .user .msg-text { background: #fdf3d0; }
    .msg-time { font-size: 10px; color: #aaa; margin-top: 4px; }
    .footer { margin-top: 40px; border-top: 1px solid #ddd; padding-top: 16px; font-size: 11px; color: #aaa; text-align: center; }
    @media print { body { margin: 20px; } }
  </style>
</head>
<body>
  <div class="export-header">
    <div class="export-title">Law<span>Connect</span> — Chat Export</div>
    <div class="export-meta">Exported on ${new Date().toLocaleString('en-US', { dateStyle: 'long', timeStyle: 'short' })}</div>
  </div>
  <div class="disclaimer">
    ⚠ This export is for informational purposes only and does not constitute legal advice.
    For serious legal matters, consult a qualified Sri Lankan lawyer.
    Legal Aid Commission: 011-2433618
  </div>
  ${messages.map(m => `
    <div class="msg ${m.role}">
      <div>
        <div class="msg-label">${m.role === 'user' ? 'You' : 'LexAI'}</div>
        <div class="msg-text">${(m.text || '').replace(/\n/g, '<br>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')}</div>
        <div class="msg-time">${m.time ? new Date(m.time).toLocaleString() : ''}</div>
      </div>
    </div>
  `).join('')}
  <div class="footer">
    LawConnect · SDGP Group CS-165 · Informatics Institute of Technology, affiliated with the University of Westminster<br>
    This document was generated automatically and is not a substitute for professional legal counsel.
  </div>
  <script>window.onload = () => { window.print(); }<\/script>
</body>
</html>`;
    printWindow.document.write(html);
    printWindow.document.close();
  }

  return { save, clearAll, togglePanel, replayFrom, exportPDF };

})();
