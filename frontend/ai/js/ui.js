/**
 * LawConnect — UI Controller (Enhanced)
 * File: js/ui.js
 */

function scrollToChat() {
  const section = document.getElementById('assistant');
  if (section) {
    section.scrollIntoView({ behavior: 'smooth' });
    setTimeout(() => { const i = document.getElementById('chatInput'); if (i) i.focus(); }, 800);
  }
}

function initScrollReveal() {
  const observer = new IntersectionObserver(
    entries => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); }),
    { threshold: 0.1 }
  );
  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
}

function renderPracticeAreas() {
  const grid = document.getElementById('practiceGrid');
  if (!grid || typeof PRACTICE_AREAS === 'undefined') return;
  grid.innerHTML = PRACTICE_AREAS.map(area => `
    <div class="practice-card" onclick="askAbout('${area.query.replace(/'/g, "\\'")}')">
      <div class="practice-icon">${area.icon}</div>
      <div class="practice-name">${area.name}</div>
      <div class="practice-desc">${area.description}</div>
      <div class="practice-arrow">→</div>
    </div>
  `).join('');
}

function renderHowItWorks() {
  const grid = document.getElementById('howGrid');
  if (!grid || typeof HOW_IT_WORKS === 'undefined') return;
  grid.innerHTML = HOW_IT_WORKS.map(step => `
    <div class="how-card reveal">
      <div class="how-num">${step.step}</div>
      <div class="how-title">${step.title}</div>
      <div class="how-text">${step.text}</div>
    </div>
  `).join('');
}

function renderQuickReplies() {
  const container = document.getElementById('quickReplies');
  if (!container || typeof QUICK_REPLIES === 'undefined') return;
  container.innerHTML = QUICK_REPLIES.map(chip => `
    <button class="quick-reply" onclick="sendQuick('${chip.message.replace(/'/g, "\\'")}')">
      ${chip.label}
    </button>
  `).join('');
}

function injectWelcomeMessage() {
  addMessage('bot',
    `Ayubowan! I'm **LexAI**, your LawConnect legal assistant trained in Sri Lankan law. 👋\n\nI can help you understand your rights across family law, employment disputes, property issues, consumer protection, and criminal matters.\n\nWhat legal question can I help you with today?`
  );
}

/* ── toolbar button helpers ── */
function initChatToolbar() {
  const toolbar = document.getElementById('chatToolbar');
  if (!toolbar) return;

  /* mic button */
  const micBtn = document.getElementById('micBtn');
  if (micBtn) VoiceInput.init(micBtn);

  /* send on voice result (auto-send toggle) */
  micBtn && micBtn.addEventListener('click', () => VoiceInput.toggle(micBtn));
}
