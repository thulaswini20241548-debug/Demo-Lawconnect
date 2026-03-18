/**
 * LawConnect — Voice Input
 * File: js/voice.js
 *
 * Uses the Web Speech API to let users speak their legal question.
 * Gracefully degrades if the browser doesn't support it.
 */

const VoiceInput = (() => {

  let _recognition = null;
  let _isListening = false;

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

  function isSupported() { return !!SpeechRecognition; }

  function init(micBtn) {
    if (!isSupported()) {
      if (micBtn) { micBtn.style.display = 'none'; }
      return;
    }

    _recognition = new SpeechRecognition();
    _recognition.lang          = 'en-US';
    _recognition.continuous    = false;
    _recognition.interimResults = true;
    _recognition.maxAlternatives = 1;

    _recognition.onstart = () => {
      _isListening = true;
      if (micBtn) { micBtn.classList.add('listening'); micBtn.title = 'Listening… click to stop'; }
      _showVoiceStatus('🎙 Listening…');
    };

    _recognition.onresult = (event) => {
      let interim = '';
      let final   = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const t = event.results[i][0].transcript;
        if (event.results[i].isFinal) { final += t; } else { interim += t; }
      }
      const input = document.getElementById('chatInput');
      if (input) {
        input.value = final || interim;
        input.style.height = 'auto';
        input.style.height = Math.min(input.scrollHeight, 120) + 'px';
      }
      if (final) { _hideVoiceStatus(); }
    };

    _recognition.onerror = (event) => {
      _isListening = false;
      if (micBtn) { micBtn.classList.remove('listening'); micBtn.title = 'Voice input'; }
      _hideVoiceStatus();
      if (event.error === 'not-allowed') {
        _showVoiceStatus('⚠ Microphone permission denied', true);
      } else if (event.error !== 'no-speech') {
        _showVoiceStatus('⚠ Voice input error', true);
      }
    };

    _recognition.onend = () => {
      _isListening = false;
      if (micBtn) { micBtn.classList.remove('listening'); micBtn.title = 'Voice input'; }
      _hideVoiceStatus();
    };
  }

  function toggle(micBtn) {
    if (!_recognition) return;
    if (_isListening) {
      _recognition.stop();
    } else {
      const input = document.getElementById('chatInput');
      if (input) input.value = '';
      _recognition.start();
    }
  }

  function _showVoiceStatus(msg, isError) {
    let el = document.getElementById('voiceStatus');
    if (!el) {
      el = document.createElement('div');
      el.id = 'voiceStatus';
      el.className = 'voice-status';
      const inputArea = document.querySelector('.chat-input-area');
      if (inputArea) inputArea.insertAdjacentElement('beforebegin', el);
    }
    el.textContent = msg;
    el.className   = 'voice-status' + (isError ? ' error' : '');
    el.style.display = 'block';
    if (isError) setTimeout(_hideVoiceStatus, 3000);
  }

  function _hideVoiceStatus() {
    const el = document.getElementById('voiceStatus');
    if (el) el.style.display = 'none';
  }

  return { isSupported, init, toggle };

})();
