/**
 * LawConnect — Application Entry Point (Enhanced)
 * File: js/main.js
 */

document.addEventListener('DOMContentLoaded', () => {

  renderPracticeAreas();
  renderHowItWorks();
  renderQuickReplies();
  injectWelcomeMessage();
  initScrollReveal();
  initChatToolbar();

  console.log('[LawConnect] Application initialised — enhanced features active.');
});
