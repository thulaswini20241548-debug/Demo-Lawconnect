/**
 * LawConnect — Document Analyser
 * File: js/analyser.js
 *
 * Lets users upload a PDF or TXT legal document.
 * Extracts text in the browser and sends to the backend for LexAI analysis.
 * Requires PDF.js (loaded via CDN in index.html) for PDF parsing.
 */

const DocumentAnalyser = (() => {

  let _overlay = null;

  /* ── open / close ── */
  function open() {
    if (!_overlay) { _overlay = _createOverlay(); document.body.appendChild(_overlay); }
    _resetUI();
    _overlay.classList.add('open');
  }

  function close() {
    if (_overlay) _overlay.classList.remove('open');
  }

  /* ── DOM ── */
  function _createOverlay() {
    const el = document.createElement('div');
    el.id = 'analyserOverlay';
    el.className = 'analyser-overlay';
    el.innerHTML = `
      <div class="analyser-modal">
        <div class="analyser-header">
          <span class="analyser-title">📄 Document Analyser</span>
          <button class="analyser-close" onclick="DocumentAnalyser.close()">✕</button>
        </div>
        <div id="analyserBody" class="analyser-body">
          <div class="analyser-drop-zone" id="dropZone">
            <div class="drop-icon">📄</div>
            <p class="drop-title">Drop your legal document here</p>
            <p class="drop-sub">Supports PDF and TXT files · Max 5MB</p>
            <label class="btn-primary analyser-file-label">
              Browse File
              <input type="file" id="docFileInput" accept=".pdf,.txt" style="display:none" onchange="DocumentAnalyser._handleFile(this.files[0])">
            </label>
            <p class="drop-examples">Examples: lease, employment contract, court notice, eviction letter</p>
          </div>
        </div>
        <div class="analyser-footer">
          <span class="analyser-disclaimer">⚠ Documents are not stored. Analysis is for information only, not legal advice.</span>
        </div>
      </div>
    `;
    el.addEventListener('click', e => { if (e.target === el) close(); });

    /* drag-and-drop */
    setTimeout(() => {
      const dz = el.querySelector('#dropZone');
      if (!dz) return;
      dz.addEventListener('dragover',  e => { e.preventDefault(); dz.classList.add('dragover'); });
      dz.addEventListener('dragleave', () => dz.classList.remove('dragover'));
      dz.addEventListener('drop', e => {
        e.preventDefault(); dz.classList.remove('dragover');
        const file = e.dataTransfer.files[0];
        if (file) _handleFile(file);
      });
    }, 100);

    return el;
  }

  function _resetUI() {
    const body = document.getElementById('analyserBody');
    if (!body) return;
    body.innerHTML = `
      <div class="analyser-drop-zone" id="dropZone">
        <div class="drop-icon">📄</div>
        <p class="drop-title">Drop your legal document here</p>
        <p class="drop-sub">Supports PDF and TXT files · Max 5MB</p>
        <label class="btn-primary analyser-file-label">
          Browse File
          <input type="file" id="docFileInput" accept=".pdf,.txt" style="display:none" onchange="DocumentAnalyser._handleFile(this.files[0])">
        </label>
        <p class="drop-examples">Examples: lease, employment contract, court notice, eviction letter</p>
      </div>
    `;
    const dz = document.getElementById('dropZone');
    if (dz) {
      dz.addEventListener('dragover',  e => { e.preventDefault(); dz.classList.add('dragover'); });
      dz.addEventListener('dragleave', () => dz.classList.remove('dragover'));
      dz.addEventListener('drop', e => {
        e.preventDefault(); dz.classList.remove('dragover');
        const file = e.dataTransfer.files[0];
        if (file) _handleFile(file);
      });
    }
  }

  /* ── file handling ── */
  async function _handleFile(file) {
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      _showError('File is too large. Please upload a file under 5MB.'); return;
    }

    const ext = file.name.split('.').pop().toLowerCase();
    if (!['pdf', 'txt'].includes(ext)) {
      _showError('Unsupported file type. Please upload a PDF or TXT file.'); return;
    }

    _showLoading(file.name);

    try {
      let text = '';
      if (ext === 'pdf') {
        text = await _extractPdfText(file);
      } else {
        text = await file.text();
      }

      if (!text || text.trim().length < 50) {
        _showError('Could not extract enough text from this document. It may be a scanned image — please use a text-based PDF.'); return;
      }

      _showAnalysing(file.name);

      const result = await BackendClient.analyseDocument(text, file.name);
      _showResult(result, file.name);

    } catch (err) {
      _showError(err.message || 'An error occurred. Please try again.');
    }
  }

  /* ── PDF.js text extraction ── */
  async function _extractPdfText(file) {
    if (typeof pdfjsLib === 'undefined') {
      /* PDF.js not loaded — fallback message */
      throw new Error('PDF parsing library is not loaded. Please try a TXT file or contact support.');
    }

    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    let fullText = '';

    for (let p = 1; p <= Math.min(pdf.numPages, 15); p++) {
      const page    = await pdf.getPage(p);
      const content = await page.getTextContent();
      fullText += content.items.map(i => i.str).join(' ') + '\n';
    }
    return fullText;
  }

  /* ── UI states ── */
  function _showLoading(filename) {
    const body = document.getElementById('analyserBody');
    if (!body) return;
    body.innerHTML = `
      <div class="analyser-loading">
        <div class="analyser-spinner"></div>
        <p class="analyser-loading-title">Reading document…</p>
        <p class="analyser-loading-sub">${filename}</p>
      </div>
    `;
  }

  function _showAnalysing(filename) {
    const body = document.getElementById('analyserBody');
    if (!body) return;
    body.innerHTML = `
      <div class="analyser-loading">
        <div class="analyser-spinner"></div>
        <p class="analyser-loading-title">LexAI is analysing your document…</p>
        <p class="analyser-loading-sub">This may take 10–20 seconds</p>
      </div>
    `;
  }

  function _showResult(result, filename) {
    const body = document.getElementById('analyserBody');
    if (!body) return;

    const badge = _buildBadge(result.confidence, result.reason);
    const formatted = (result.analysis || '').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br>');

    body.innerHTML = `
      <div class="analyser-result">
        <div class="analyser-result-file">📄 ${result.filename || filename}</div>
        ${badge}
        <div class="analyser-result-content">${formatted}</div>
        <div class="analyser-result-actions">
          <button class="btn-primary" onclick="DocumentAnalyser._askFollowUp()">Ask a follow-up question →</button>
          <button class="btn-ghost"   onclick="DocumentAnalyser._resetUI()">Analyse another document</button>
        </div>
      </div>
    `;
  }

  function _buildBadge(confidence, reason) {
    const map = {
      high:   { cls: 'conf-high',   icon: '✦', label: 'High confidence' },
      medium: { cls: 'conf-medium', icon: '◈', label: 'Moderate confidence' },
      low:    { cls: 'conf-low',    icon: '⚠', label: 'Consult a lawyer' },
    };
    const c = map[confidence] || map.medium;
    const tip = reason ? ` — ${reason}` : '';
    return `<div class="conf-badge ${c.cls}">${c.icon} ${c.label}${tip}</div>`;
  }

  function _showError(msg) {
    const body = document.getElementById('analyserBody');
    if (!body) return;
    body.innerHTML = `
      <div class="analyser-error">
        <div class="analyser-error-icon">⚠</div>
        <p class="analyser-error-msg">${msg}</p>
        <button class="btn-ghost" onclick="DocumentAnalyser._resetUI()">Try again</button>
      </div>
    `;
  }

  function _askFollowUp() {
    close();
    scrollToChat();
    setTimeout(() => {
      const input = document.getElementById('chatInput');
      if (input) { input.focus(); input.placeholder = 'Ask a follow-up question about your document…'; }
    }, 600);
  }

  return { open, close, _handleFile, _resetUI };

})();
