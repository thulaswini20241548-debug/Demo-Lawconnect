/**
 * LawConnect — UI Controller
 * File: js/ui.js
 *
 * Description: Handles all UI interactions that are not chat-related:
 *   - API key modal (open, close, save)
 *   - Scroll-reveal animations via IntersectionObserver
 *   - Dynamic rendering of practice area cards and how-it-works steps
 *   - Scroll-to-chat utility
 */

/* ═══════════════════════════════════════════
   API KEY MODAL
═══════════════════════════════════════════ */

/**
 * openModal()
 * Opens the API key input modal overlay.
 */
function openModal() {
  const modal = document.getElementById('apiModal');
  if (modal) modal.classList.add('open');
}

/**
 * closeModal()
 * Closes the API key modal overlay.
 */
function closeModal() {
  const modal = document.getElementById('apiModal');
  if (modal) modal.classList.remove('open');
}

/**
 * saveApiKey()
 * Reads the API key from the modal input, validates it, and stores it
 * via AnthropicClient.setKey(). Shows error state on invalid format.
 */
function saveApiKey() {
  const input = document.getElementById('apiKeyInput');
  const key   = input.value.trim();

  /* Basic format check — Anthropic keys start with sk-ant- or sk- */
  if (!key.startsWith('sk-ant-') && !key.startsWith('sk-')) {
    input.classList.add('error');
    input.placeholder = 'Key must start with sk-ant- …';
    setTimeout(() => {
      input.classList.remove('error');
      input.placeholder = 'sk-ant-...';
    }, 2500);
    return;
  }

  AnthropicClient.setKey(key);
  AnthropicClient.clearHistory();   // Fresh session with the new key
  closeModal();

  addMessage('bot',
    '🔑 **API key connected!** I now have full AI capabilities to answer your legal questions with the most accurate and detailed responses.\n\nWhat would you like to know about Sri Lankan law?'
  );
}

/* ═══════════════════════════════════════════
   SCROLL UTILITIES
═══════════════════════════════════════════ */

/**
 * scrollToChat()
 * Smoothly scrolls the page to the AI assistant section and focuses the input.
 */
function scrollToChat() {
  const section = document.getElementById('assistant');
  if (section) {
    section.scrollIntoView({ behavior: 'smooth' });
    setTimeout(() => {
      const input = document.getElementById('chatInput');
      if (input) input.focus();
    }, 800);
  }
}

/* ═══════════════════════════════════════════
   SCROLL-REVEAL OBSERVER
═══════════════════════════════════════════ */

/**
 * initScrollReveal()
 * Attaches an IntersectionObserver to all .reveal elements.
 * When an element enters the viewport, the 'visible' class is added,
 * triggering the CSS fade-up animation defined in styles.css.
 */
function initScrollReveal() {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    },
    { threshold: 0.1 }
  );

  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
}

/* ═══════════════════════════════════════════
   DYNAMIC CARD RENDERING
═══════════════════════════════════════════ */

/**
 * renderPracticeAreas()
 * Reads PRACTICE_AREAS from data/practice-areas.js and injects cards
 * into #practiceGrid.
 */
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

/**
 * renderHowItWorks()
 * Reads HOW_IT_WORKS from data/how-it-works.js and injects step cards
 * into #howGrid.
 */
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

/**
 * renderQuickReplies()
 * Reads QUICK_REPLIES from data/quick-replies.js and injects chip buttons
 * into #quickReplies.
 */
function renderQuickReplies() {
  const container = document.getElementById('quickReplies');
  if (!container || typeof QUICK_REPLIES === 'undefined') return;

  container.innerHTML = QUICK_REPLIES.map(chip => `
    <button class="quick-reply" onclick="sendQuick('${chip.message.replace(/'/g, "\\'")}')">
      ${chip.label}
    </button>
  `).join('');
}

/**
 * injectWelcomeMessage()
 * Adds the initial bot greeting into the empty chat window on page load.
 */
function injectWelcomeMessage() {
  addMessage('bot',
    `Ayubowan! I'm **LexAI**, your LawConnect legal assistant trained in Sri Lankan law. 👋\n\nI can help you understand your rights across family law, employment disputes, property issues, consumer protection, and criminal matters.\n\nWhat legal question can I help you with today?`
  );
}
