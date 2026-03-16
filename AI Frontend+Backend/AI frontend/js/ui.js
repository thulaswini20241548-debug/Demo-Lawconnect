/**
 * LawConnect — UI Controller
 * File: js/ui.js
 *
 * Handles:
 *   - Auth modal (login / signup tabs)
 *   - Nav auth button state
 *   - Scroll-reveal animations
 *   - Dynamic rendering of practice areas, how-it-works, quick replies
 */

/* ═══════════════════════════════════════════
   AUTH MODAL
═══════════════════════════════════════════ */

/**
 * openAuthModal(tab)
 * Opens the auth modal on the specified tab ('login' or 'signup').
 */
function openAuthModal(tab = 'login') {
  const modal = document.getElementById('authModal');
  if (modal) modal.classList.add('open');
  switchTab(tab);
  clearAuthForm();
}

/**
 * closeAuthModal()
 * Closes the auth modal.
 */
function closeAuthModal() {
  const modal = document.getElementById('authModal');
  if (modal) modal.classList.remove('open');
  clearAuthForm();
}

/**
 * switchTab(tab)
 * Switches between login and signup views inside the modal.
 */
function switchTab(tab) {
  document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.auth-form').forEach(f => f.classList.remove('active'));

  const tabBtn  = document.getElementById(`tab-${tab}`);
  const tabForm = document.getElementById(`form-${tab}`);
  if (tabBtn)  tabBtn.classList.add('active');
  if (tabForm) tabForm.classList.add('active');
}

/**
 * clearAuthForm()
 * Clears inputs and error messages in both forms.
 */
function clearAuthForm() {
  ['login-email','login-password','signup-email','signup-password','signup-confirm'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });
  showAuthError('');
}

/**
 * showAuthError(msg)
 * Displays an error message inside the modal.
 */
function showAuthError(msg) {
  const el = document.getElementById('authError');
  if (!el) return;
  el.textContent = msg;
  el.style.display = msg ? 'block' : 'none';
}

/**
 * setAuthLoading(loading)
 * Disables/enables submit buttons during API calls.
 */
function setAuthLoading(loading) {
  ['btnLogin','btnSignup'].forEach(id => {
    const btn = document.getElementById(id);
    if (btn) btn.disabled = loading;
  });
}

/**
 * handleLogin()
 * Reads login form, calls ApiClient.login(), updates UI.
 */
async function handleLogin() {
  const email    = document.getElementById('login-email').value.trim();
  const password = document.getElementById('login-password').value;

  if (!email || !password) return showAuthError('Please enter your email and password.');

  setAuthLoading(true);
  showAuthError('');

  try {
    const user = await ApiClient.login(email, password);
    closeAuthModal();
    updateAuthUI();
    ApiClient.clearHistory();
    addMessage('bot',
      `Welcome back! I'm **LexAI**, ready to assist you with Sri Lankan legal questions.\n\nWhat can I help you with today?`
    );
  } catch (err) {
    showAuthError(err.message || 'Login failed. Please try again.');
  } finally {
    setAuthLoading(false);
  }
}

/**
 * handleSignup()
 * Reads signup form, calls ApiClient.signup(), updates UI.
 */
async function handleSignup() {
  const email    = document.getElementById('signup-email').value.trim();
  const password = document.getElementById('signup-password').value;
  const confirm  = document.getElementById('signup-confirm').value;

  if (!email || !password) return showAuthError('Please fill in all fields.');
  if (password.length < 6)  return showAuthError('Password must be at least 6 characters.');
  if (password !== confirm)  return showAuthError('Passwords do not match.');

  setAuthLoading(true);
  showAuthError('');

  try {
    const user = await ApiClient.signup(email, password);
    closeAuthModal();
    updateAuthUI();
    ApiClient.clearHistory();
    addMessage('bot',
      `Ayubowan! Welcome to LawConnect! I'm **LexAI**, your AI legal assistant trained in Sri Lankan law. 👋\n\nI can help you understand your rights across family law, employment disputes, property issues, consumer protection, and more.\n\nWhat legal question can I help you with today?`
    );
  } catch (err) {
    showAuthError(err.message || 'Signup failed. Please try again.');
  } finally {
    setAuthLoading(false);
  }
}

/**
 * handleLogout()
 * Logs the user out and resets the chat.
 */
function handleLogout() {
  ApiClient.logout();
  updateAuthUI();

  const container = document.getElementById('chatMessages');
  if (container) container.innerHTML = '';
  addMessage('bot',
    `You've been logged out. **Log in** to continue chatting with LexAI.`
  );
}

/**
 * updateAuthUI()
 * Updates the nav button and chat header based on login state.
 */
function updateAuthUI() {
  const loggedIn    = ApiClient.isLoggedIn();
  const navAuthBtn  = document.getElementById('navAuthBtn');
  const chatAuthBtn = document.getElementById('chatAuthBtn');

  if (navAuthBtn) {
    navAuthBtn.textContent = loggedIn ? 'Log Out' : 'Log In';
    navAuthBtn.onclick     = loggedIn ? handleLogout : () => openAuthModal('login');
  }

  if (chatAuthBtn) {
    chatAuthBtn.textContent = loggedIn ? '👤 Account' : '🔑 Log In';
    chatAuthBtn.onclick     = loggedIn ? handleLogout : () => openAuthModal('login');
    chatAuthBtn.title       = loggedIn ? 'Click to log out' : 'Click to log in';
  }
}

/* ═══════════════════════════════════════════
   SCROLL UTILITIES
═══════════════════════════════════════════ */

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

function initScrollReveal() {
  const observer = new IntersectionObserver(
    (entries) => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); }),
    { threshold: 0.1 }
  );
  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
}

/* ═══════════════════════════════════════════
   DYNAMIC CARD RENDERING
═══════════════════════════════════════════ */

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
  if (ApiClient.isLoggedIn()) {
    addMessage('bot',
      `Ayubowan! I'm **LexAI**, your LawConnect legal assistant trained in Sri Lankan law. 👋\n\nWhat legal question can I help you with today?`
    );
  } else {
    addMessage('bot',
      `Ayubowan! I'm **LexAI**, your LawConnect legal assistant. 👋\n\nPlease **log in** or **sign up** to start asking legal questions about Sri Lankan law.`
    );
  }
}
