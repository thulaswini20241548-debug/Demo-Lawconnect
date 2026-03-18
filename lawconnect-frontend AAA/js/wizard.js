/**
 * LawConnect — Legal Situation Wizard
 * File: js/wizard.js
 *
 * A guided yes/no triage that identifies the user's legal area
 * and pre-fills the chat with helpful context.
 */

const LegalWizard = (() => {

  /* ── decision tree ── */
  const TREE = {
    start: {
      question: 'What is your situation about?',
      type: 'choice',
      choices: [
        { label: '💼 Work / Employment',    next: 'employment'  },
        { label: '🏠 Property / Land',       next: 'property'    },
        { label: '👨‍👩‍👧 Family / Domestic',     next: 'family'      },
        { label: '🛒 Consumer / Contract',   next: 'consumer'    },
        { label: '🚔 Arrest / Criminal',     next: 'criminal'    },
        { label: '📄 I have a document',     next: 'document'    },
      ],
    },
    employment: {
      question: 'What is the employment issue?',
      type: 'choice',
      choices: [
        { label: 'I was unfairly dismissed',     next: 'emp_dismissal' },
        { label: 'My wages are being withheld',  next: 'emp_wages'     },
        { label: 'Workplace harassment/abuse',   next: 'emp_harass'    },
        { label: 'EPF / ETF not paid',           next: 'emp_epf'       },
      ],
    },
    emp_dismissal: {
      question: 'How long have you worked there?',
      type: 'choice',
      choices: [
        { label: 'Less than 6 months',    prompt: 'I was unfairly dismissed after working less than 6 months. What are my rights under Sri Lankan employment law?' },
        { label: '6 months – 5 years',   prompt: 'I was unfairly dismissed after working between 6 months and 5 years. What are my rights under the Termination of Employment of Workmen Act (TEWA) 1971?' },
        { label: 'More than 5 years',     prompt: 'I was unfairly dismissed after working more than 5 years. What gratuity and compensation am I entitled to under TEWA 1971 and the Gratuity Act 1983?' },
      ],
    },
    emp_wages: {
      prompt: 'My employer is withholding my wages / not paying me properly. What can I do under Sri Lankan labour law, and how do I file a complaint with the Labour Tribunal?',
    },
    emp_harass: {
      prompt: 'I am experiencing harassment or abuse at my workplace in Sri Lanka. What legal protections do I have and what steps can I take?',
    },
    emp_epf: {
      prompt: 'My employer has not paid my EPF or ETF contributions in Sri Lanka. What are my legal rights and how do I recover these funds?',
    },
    property: {
      question: 'What is the property issue?',
      type: 'choice',
      choices: [
        { label: 'My landlord wants to evict me',   prompt: 'My landlord is trying to evict me from a rental property. What are my tenant rights under Sri Lankan law?' },
        { label: 'Land ownership dispute',           prompt: 'There is a dispute over land ownership or boundary in Sri Lanka. What are my legal options?' },
        { label: 'I want to buy / transfer land',    prompt: 'I want to buy or transfer land in Sri Lanka. What are the legal requirements and procedures?' },
        { label: 'Rent is being raised unfairly',    prompt: 'My landlord is raising my rent. Are there any rent control laws in Sri Lanka that protect me?' },
      ],
    },
    family: {
      question: 'What is the family issue?',
      type: 'choice',
      choices: [
        { label: 'Divorce / separation',             prompt: 'What are the grounds and procedure for divorce in Sri Lanka?' },
        { label: 'Domestic violence / abuse',        prompt: 'I am experiencing domestic violence in Sri Lanka. What legal protections are available under the Domestic Violence Act No. 34 of 2005?' },
        { label: 'Child custody / maintenance',      prompt: 'I need to understand child custody and maintenance rights in Sri Lanka. What does the law say?' },
        { label: 'Inheritance / will dispute',       prompt: 'There is a dispute over inheritance or a will in Sri Lanka. What are my legal rights?' },
      ],
    },
    consumer: {
      question: 'What is the consumer or contract issue?',
      type: 'choice',
      choices: [
        { label: 'Defective product / service',      prompt: 'I purchased a defective product or received a poor service in Sri Lanka. How do I file a complaint with the Consumer Affairs Authority?' },
        { label: 'Contract dispute',                  prompt: 'I have a contract dispute in Sri Lanka. What are my legal options and rights?' },
        { label: 'Online / e-commerce scam',          prompt: 'I was scammed by an online seller in Sri Lanka. What consumer protection laws apply and what can I do?' },
      ],
    },
    criminal: {
      question: 'What is the criminal / arrest issue?',
      type: 'choice',
      choices: [
        { label: 'I was arrested / detained',        prompt: 'I was arrested or detained in Sri Lanka. What are my constitutional rights under Article 13 of the Sri Lankan Constitution?' },
        { label: 'I received a court summons',       prompt: 'I received a court summons in Sri Lanka. What does this mean and what should I do?' },
        { label: 'Police misconduct',                prompt: 'I experienced police misconduct in Sri Lanka. What legal remedies do I have?' },
      ],
    },
    document: {
      action: 'open_analyser',
      prompt: null,
    },
  };

  let _currentNode = 'start';
  let _overlay     = null;

  /* ── open / close ── */
  function open() {
    _currentNode = 'start';
    if (!_overlay) { _overlay = _createOverlay(); document.body.appendChild(_overlay); }
    _render();
    _overlay.classList.add('open');
  }

  function close() {
    if (_overlay) _overlay.classList.remove('open');
  }

  /* ── DOM ── */
  function _createOverlay() {
    const el = document.createElement('div');
    el.id = 'wizardOverlay';
    el.className = 'wizard-overlay';
    el.innerHTML = `
      <div class="wizard-modal">
        <div class="wizard-header">
          <span class="wizard-title">⚖ Legal Situation Wizard</span>
          <button class="wizard-close" onclick="LegalWizard.close()">✕</button>
        </div>
        <div id="wizardBody" class="wizard-body"></div>
        <div class="wizard-footer">
          <span class="wizard-disclaimer">This wizard helps identify your legal issue. It does not provide legal advice.</span>
        </div>
      </div>
    `;
    el.addEventListener('click', e => { if (e.target === el) close(); });
    return el;
  }

  function _render() {
    const body = document.getElementById('wizardBody');
    if (!body) return;

    const node = TREE[_currentNode];
    if (!node) { close(); return; }

    /* terminal node with a direct prompt */
    if (node.prompt) {
      body.innerHTML = `
        <p class="wizard-question">Your situation has been identified. Click below to ask LexAI:</p>
        <div class="wizard-prompt-preview">${node.prompt}</div>
        <div class="wizard-actions">
          <button class="btn-primary wizard-ask-btn" onclick="LegalWizard._firePrompt(${JSON.stringify(node.prompt)})">
            Ask LexAI →
          </button>
          <button class="btn-ghost" onclick="LegalWizard._reset()">Start over</button>
        </div>
      `;
      return;
    }

    /* action node: open document analyser */
    if (node.action === 'open_analyser') {
      body.innerHTML = `
        <p class="wizard-question">Upload your document and LexAI will analyse it for you.</p>
        <div class="wizard-actions">
          <button class="btn-primary wizard-ask-btn" onclick="LegalWizard.close(); DocumentAnalyser.open();">
            Open Document Analyser →
          </button>
          <button class="btn-ghost" onclick="LegalWizard._reset()">Start over</button>
        </div>
      `;
      return;
    }

    /* choice node */
    body.innerHTML = `
      <p class="wizard-question">${node.question}</p>
      <div class="wizard-choices">
        ${node.choices.map((c, i) => `
          <button class="wizard-choice" onclick="LegalWizard._pick(${i})">
            ${c.label}
          </button>
        `).join('')}
      </div>
      ${_currentNode !== 'start' ? '<button class="wizard-back" onclick="LegalWizard._reset()">← Start over</button>' : ''}
    `;
  }

  function _pick(index) {
    const node = TREE[_currentNode];
    if (!node || !node.choices) return;
    const choice = node.choices[index];
    if (choice.prompt) {
      /* leaf with prompt */
      TREE['__temp'] = { prompt: choice.prompt };
      _currentNode   = '__temp';
    } else {
      _currentNode = choice.next;
    }
    _render();
  }

  function _firePrompt(prompt) {
    close();
    scrollToChat();
    setTimeout(() => {
      const input = document.getElementById('chatInput');
      if (input) { input.value = prompt; sendMessage(); }
    }, 700);
  }

  function _reset() {
    _currentNode = 'start';
    _render();
  }

  return { open, close, _pick, _reset, _firePrompt };

})();
