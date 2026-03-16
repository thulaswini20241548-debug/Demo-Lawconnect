/**
 * LawConnect — Application Entry Point
 * File: js/main.js
 */

document.addEventListener('DOMContentLoaded', () => {

  /* 1. Render dynamic content */
  renderPracticeAreas();
  renderHowItWorks();
  renderQuickReplies();

  /* 2. Inject welcome message (varies based on login state) */
  injectWelcomeMessage();

  /* 3. Update nav/chat auth buttons to reflect current login state */
  updateAuthUI();

  /* 4. Scroll-reveal animations */
  initScrollReveal();

  /* 5. Close auth modal when clicking the overlay background */
  const overlay = document.getElementById('authModal');
  if (overlay) {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) closeAuthModal();
    });
  }

  /* 6. Allow Enter key in auth forms */
  document.getElementById('login-password')?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') handleLogin();
  });
  document.getElementById('signup-confirm')?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') handleSignup();
  });

  console.log('[LawConnect] Initialised. Auth state:', ApiClient.isLoggedIn() ? 'logged in' : 'logged out');
});
