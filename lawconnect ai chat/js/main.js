/**
 * LawConnect — Application Entry Point
 * File: js/main.js
 *
 * Description: Bootstraps the entire application when the DOM is ready.
 *              Calls initialisation functions from ui.js and chat.js in the
 *              correct order.
 *
 * Load order (defined in index.html):
 *   1. data/practice-areas.js    → PRACTICE_AREAS constant
 *   2. data/how-it-works.js      → HOW_IT_WORKS constant
 *   3. data/quick-replies.js     → QUICK_REPLIES constant
 *   4. data/demo-responses.js    → getDemoResponse()
 *   5. ai/legal-system-prompt.js → LEGAL_SYSTEM_PROMPT constant
 *   6. ai/anthropic-client.js    → AnthropicClient object
 *   7. js/chat.js                → sendMessage(), addMessage(), etc.
 *   8. js/ui.js                  → openModal(), renderPracticeAreas(), etc.
 *   9. js/main.js                ← THIS FILE — runs last
 */

document.addEventListener('DOMContentLoaded', () => {

  /* 1. Render dynamic content from data files */
  renderPracticeAreas();
  renderHowItWorks();
  renderQuickReplies();

  /* 2. Inject the welcome message into the empty chat window */
  injectWelcomeMessage();

  /* 3. Activate scroll-reveal animations */
  initScrollReveal();

  /* 4. Close modal when clicking the overlay background */
  const overlay = document.getElementById('apiModal');
  if (overlay) {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) closeModal();
    });
  }

  /* 5. Allow pressing Enter in the API key modal input */
  const apiInput = document.getElementById('apiKeyInput');
  if (apiInput) {
    apiInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') saveApiKey();
    });
  }

  /* 6. Log load confirmation (remove in production) */
  console.log('[LawConnect] Application initialised successfully.');
  console.log('[LawConnect] Demo mode active. Click "🔑 API Key" to enable full AI.');
});
