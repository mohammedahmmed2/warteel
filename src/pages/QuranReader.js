import { state } from '../app.js';
import { t } from '../utils/i18n.js';
import { openTafsirModal } from '../components/TafsirModal.js';
import { openAsbabModal, preloadAsbabData, hasAsbabForAyah } from '../components/AsbabAlNuzulModal.js';
import { openMeaningModal } from '../components/MeaningModal.js';
import { getQuranData } from '../utils/quranData.js';
import { updateQuranSurahSEO, updateSEO } from '../utils/seo.js';

import { exportQuranToImage } from '../utils/quranImageGenerator.js';
import { openImageThemeModal } from '../components/ImageThemeModal.js';

export function QuranReaderPage(navigate, params = { surah: 1 }, openMobileSidebar) {
  const container = document.createElement('div');
  container.className = 'quran-reader-page';
  
  // Normalize params
  const p = typeof params === 'object' && params !== null ? params : { surah: parseInt(params) || 1 };
  let renderType = p.juz ? 'juz' : p.page ? 'page' : 'surah';
  let targetValue = parseInt(p.juz || p.page || p.surah) || 1;
  let targetAyah = parseInt(p.ayah) || null;
  let currentSurahNum = renderType === 'surah' ? targetValue : 1;

  let quranData = null;
  let surahData = null;

  // State
  let showTranslation = localStorage.getItem('showTranslation') === 'true';
  let translationsCache = {};
  let audioDataCache = {};
  let isPlaying = false;
  let currentAyahIndex = 0;
  let currentAyahsList = [];
  let headerVisible = true;

  // Voice Tracking State (Web Speech API primary)
  let isTracking = false;
  let trackingWordIndex = 0;
  let trackingWords = [];
  let recognition = null;
  // Professional tracking metrics
  let trackingStartTime = 0;
  let wordsReadCount = 0;
  let wpmInterval = null;
  let visualizerInterval = null;
  // Advanced tracking state
  let lastMatchTime = 0; // Timestamp of last successful match
  let matchConfidence = 0; // Current confidence 0-100
  let restartAttempts = 0; // For exponential backoff on restart
  let analyserNode = null; // For real mic visualizer
  let micDataArray = null; // Uint8Array for analyser
  let lastProcessedText = ''; // Avoid duplicate processing
  // Fallback: old worker-based system
  let trackingWorker = null;
  let isTranscribing = false;
  let audioContext = null;
  let mediaStream = null;
  let scriptProcessor = null;
  let audioBuffer = [];
  
  const hasWebSpeech = ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

  // === Advanced Phonetic Normalization ===
  const stripDiacritics = (str) => {
    if (!str) return '';
    return str
      // Remove all tashkeel/diacritics & Quranic symbols
      .replace(/[\u064B-\u065F\u0670\u0653\u06DF\u06E0\u06E1\u06E2\u06E3\u06E4\u06E5\u06E6\u06E7\u06E8\u06EA\u06EB\u06EC\u06ED\u06D6-\u06DE]/g, '')
      // Normalize hamzat (أ إ آ ٱ ؤ ئ ء -> ا)
      .replace(/[\u0671\u0623\u0625\u0622\u0672\u0673]/g, '\u0627')
      .replace(/\u0624/g, '\u0648')
      .replace(/\u0626/g, '\u064A')
      .replace(/\u0621/g, '')
      // Normalize ta marbuta and alef maqsura (ة -> ه, ى -> ي)
      .replace(/\u0629/g, '\u0647')
      .replace(/\u0649/g, '\u064A')
      // Remove tatweel (kashida)
      .replace(/\u0640/g, '')
      .trim();
  };

  // Levenshtein distance for fuzzy matching
  const levenshtein = (a, b) => {
    if (!a || !b) return Math.max((a || '').length, (b || '').length);
    if (a.length === 0) return b.length;
    if (b.length === 0) return a.length;
    if (Math.abs(a.length - b.length) > 3) return Math.max(a.length, b.length);
    
    const matrix = [];
    for (let i = 0; i <= b.length; i++) matrix[i] = [i];
    for (let j = 0; j <= a.length; j++) matrix[0][j] = j;
    for (let i = 1; i <= b.length; i++) {
      for (let j = 1; j <= a.length; j++) {
        const cost = a[j - 1] === b[i - 1] ? 0 : 1;
        matrix[i][j] = Math.min(
          matrix[i - 1][j] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j - 1] + cost
        );
      }
    }
    return matrix[b.length][a.length];
  };

  // Similarity ratio (0 to 1)
  const similarity = (a, b) => {
    if (!a && !b) return 1;
    if (!a || !b) return 0;
    const maxLen = Math.max(a.length, b.length);
    if (maxLen === 0) return 1;
    return 1 - levenshtein(a, b) / maxLen;
  };

  // Remove common Arabic prefix combinations safely
  const stripAlPrefix = (word) => {
    if (!word) return '';
    let w = word;
    if ((w.startsWith('وال') || w.startsWith('بال') || w.startsWith('فال') || w.startsWith('كال')) && w.length > 4) {
      return w.substring(3);
    }
    if (w.startsWith('لل') && w.length > 3) {
      return w.substring(2);
    }
    if (w.startsWith('ال') && w.length > 3) {
      return w.substring(2);
    }
    if ((w.startsWith('و') || w.startsWith('ف') || w.startsWith('ب')) && w.length > 3) {
      return w.substring(1);
    }
    return w;
  };

  // Precise Quranic Word Matching
  const wordsMatch = (spoken, expected) => {
    if (!spoken || !expected) return 0;
    if (spoken === expected) return 1.0;

    const sNorm = stripDiacritics(spoken);
    const eNorm = stripDiacritics(expected);
    if (sNorm === eNorm) return 0.98;

    const sBase = stripAlPrefix(sNorm);
    const eBase = stripAlPrefix(eNorm);
    if (sBase === eBase && sBase.length >= 2) return 0.92;

    // Short words (length <= 3): require exact match or exact base match
    if (sBase.length <= 3 || eBase.length <= 3) {
      if (sBase === eBase) return 0.88;
      return 0;
    }

    // Long words: check distance limit
    const dist = levenshtein(sBase, eBase);
    const maxAllowed = sBase.length <= 5 ? 1 : 2;
    if (dist > maxAllowed) return 0;

    const score = 1 - (dist / Math.max(sBase.length, eBase.length));
    return score >= 0.72 ? score : 0;
  };

  // N-gram sequence matching: match a sequence of spoken words against expected words
  const sequenceMatch = (spokenWords, expectedWords, startIdx) => {
    if (!spokenWords.length || startIdx >= expectedWords.length) return { score: 0, advance: 0 };
    let totalScore = 0;
    let matched = 0;
    const maxCheck = Math.min(spokenWords.length, expectedWords.length - startIdx, 5);
    for (let i = 0; i < maxCheck; i++) {
      const score = wordsMatch(spokenWords[i], expectedWords[startIdx + i]?.cleanText || '');
      if (score >= 0.5) {
        totalScore += score;
        matched++;
      } else {
        break;
      }
    }
    return { score: matched > 0 ? totalScore / matched : 0, advance: matched };
  };

  // Screen Wake Lock
  let wakeLock = null;
  const requestWakeLock = async () => {
    if ('wakeLock' in navigator && state.keepAwake) {
      try {
        wakeLock = await navigator.wakeLock.request('screen');
      } catch (err) {}
    }
  };
  const releaseWakeLock = () => {
    if (wakeLock !== null) {
      wakeLock.release().catch(()=>{});
      wakeLock = null;
    }
  };
  requestWakeLock();
  
  const unmountObserver = new MutationObserver(() => {
    if (!document.contains(container)) {
      releaseWakeLock();
      unmountObserver.disconnect();
    }
  });
  // Need to start observing after it's attached to DOM, so delay a bit
  setTimeout(() => {
    unmountObserver.observe(document.body, { childList: true, subtree: true });
  }, 1000);

  // ============ BUILD HTML ============
  container.innerHTML = `
    <style>
      /* Reader-specific scoped styles */
      .reader-app-bar {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        z-index: 200;
        background: var(--bg-card);
        backdrop-filter: blur(24px);
        -webkit-backdrop-filter: blur(24px);
        border-bottom: 1px solid var(--glass-border);
        box-shadow: 0 4px 30px rgba(0,0,0,0.06);
        padding: 0.75rem 1.5rem;
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 0.5rem;
        transition: transform 0.35s cubic-bezier(0.16, 1, 0.3, 1), background var(--transition-normal);
        min-height: 70px;
      }
      .reader-app-bar.hidden {
        transform: translateY(-110%);
      }

      /* Show header tap area (mobile) */
      .reader-tap-hint {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        height: 20px;
        z-index: 150;
        background: transparent;
        display: none;
      }
      .reader-app-bar.hidden ~ .reader-tap-hint {
        display: block;
      }

      .reader-bar-left {
        display: flex;
        align-items: center;
        gap: 0.35rem;
        flex-shrink: 0;
      }

      .reader-bar-right {
        display: flex;
        align-items: center;
        gap: 0.35rem;
        flex-shrink: 0;
      }

      .reader-bar-title {
        font-family: var(--font-arabic);
        font-weight: 700;
        font-size: 1.15rem;
        color: var(--text-primary);
        flex: 1;
        text-align: center;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        padding: 0 0.5rem;
      }

      /* Icon Button in reader bar */
      .rdr-btn {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 44px;
        height: 44px;
        border-radius: var(--radius-md);
        border: 1px solid var(--glass-border);
        background: var(--bg-main);
        color: var(--text-primary);
        cursor: pointer;
        transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
        flex-shrink: 0;
        -webkit-tap-highlight-color: transparent;
        box-shadow: 0 2px 8px rgba(0,0,0,0.02);
      }
      .rdr-btn:hover {
        background: var(--accent-bg);
        color: var(--accent);
        border-color: var(--accent);
        transform: translateY(-2px);
        box-shadow: 0 6px 12px rgba(0,0,0,0.05);
      }
      .rdr-btn:active {
        transform: translateY(0) scale(0.95);
      }
      .rdr-btn svg { width: 22px; height: 22px; pointer-events: none; }

      /* Play button - special style */
      .rdr-btn-play {
        width: 44px;
        height: 44px;
        border-radius: 50%;
        background: linear-gradient(135deg, var(--accent-light), var(--accent));
        color: white;
        box-shadow: 0 3px 12px var(--accent-bg);
      }
      .rdr-btn-play:hover {
        transform: scale(1.08);
        box-shadow: 0 5px 18px rgba(0,0,0,0.2);
        background: linear-gradient(135deg, var(--accent-light), var(--accent-dark));
        color: white;
      }

      /* Voice btn active state */
      .rdr-btn-voice.recording {
        background: rgba(239, 68, 68, 0.15);
        color: #EF4444;
        animation: pulse-record 1.5s ease-in-out infinite;
      }
      @keyframes pulse-record {
        0%, 100% { box-shadow: 0 0 0 0 rgba(239,68,68,0.3); }
        50% { box-shadow: 0 0 0 8px rgba(239,68,68,0); }
      }

      /* Font panel */
      .reader-font-panel {
        background: var(--bg-card);
        backdrop-filter: blur(16px);
        -webkit-backdrop-filter: blur(16px);
        border: 1px solid var(--glass-border);
        border-radius: var(--radius-lg);
        padding: 1.5rem;
        margin-bottom: 1.5rem;
        box-shadow: 0 8px 32px rgba(0,0,0,0.08);
        display: none;
        flex-direction: column;
        gap: 1.5rem;
        animation: slideDownFade 0.3s cubic-bezier(0.16, 1, 0.3, 1);
      }
      .reader-font-panel.open { display: flex; }

      @keyframes slideDownFade {
        from { opacity: 0; transform: translateY(-10px); }
        to { opacity: 1; transform: translateY(0); }
      }

      /* Premium UI Elements */
      .premium-select {
        flex: 1;
        padding: 0.6rem 1rem 0.6rem 2.5rem;
        border-radius: var(--radius-md);
        border: 1px solid var(--glass-border);
        background-color: var(--bg-main);
        color: var(--text-primary);
        font-family: var(--font-arabic);
        font-size: 0.95rem;
        outline: none;
        cursor: pointer;
        transition: all 0.2s;
        appearance: none;
        background-image: url('data:image/svg+xml;utf8,<svg fill="currentColor" height="20" viewBox="0 0 24 24" width="20" xmlns="http://www.w3.org/2000/svg"><path d="M7 10l5 5 5-5z"/></svg>');
        background-repeat: no-repeat;
        background-position: left 10px center;
      }
      .premium-select:hover, .premium-select:focus {
        border-color: var(--accent);
        box-shadow: 0 0 0 3px var(--accent-bg);
      }

      .premium-slider {
        -webkit-appearance: none;
        width: 100%;
        height: 6px;
        background: var(--glass-border);
        border-radius: 3px;
        outline: none;
        transition: background 0.3s;
      }
      .premium-slider::-webkit-slider-thumb {
        -webkit-appearance: none;
        appearance: none;
        width: 20px;
        height: 20px;
        border-radius: 50%;
        background: var(--accent);
        cursor: pointer;
        box-shadow: 0 2px 6px rgba(0,0,0,0.2);
        transition: transform 0.2s;
      }
      .premium-slider::-webkit-slider-thumb:hover {
        transform: scale(1.15);
      }

      /* Quran content wrapper */
      .reader-content-wrapper {
        padding-top: 72px; /* space for fixed bar */
        min-height: 100vh;
        padding-bottom: 5rem;
      }

      .reader-inner {
        max-width: 100%;
        margin: 0 auto;
        padding: 1.5rem 1rem;
        width: 100%;
      }

      /* Surah header card */
      .surah-hero-card {
        background: linear-gradient(135deg, var(--bg-gradient-start) 0%, var(--bg-gradient-end) 100%);
        border-radius: var(--radius-lg);
        padding: 1.5rem 2rem;
        margin-bottom: 1.5rem;
        box-shadow: var(--shadow-sm);
        display: flex;
        align-items: center;
        justify-content: space-between;
        position: relative;
        overflow: hidden;
        border: 1px solid var(--glass-border);
        min-height: 110px;
      }
      .surah-hero-text {
        position: relative;
        z-index: 2;
        display: flex;
        flex-direction: column;
        gap: 0.3rem;
      }
      .surah-hero-name {
        font-family: var(--font-arabic);
        font-size: 2rem;
        font-weight: bold;
        color: var(--accent);
        line-height: 1.2;
      }
      .surah-hero-sub {
        font-family: var(--font-arabic);
        font-size: 1rem;
        color: var(--text-primary);
        opacity: 0.8;
      }
      .surah-hero-meta {
        font-family: var(--font-arabic);
        font-size: 0.875rem;
        color: var(--text-secondary);
      }

      /* Bismillah */
      .bismillah-row {
        text-align: center;
        font-family: 'Amiri Quran', serif;
        font-size: 2.2rem;
        color: var(--primary);
        padding: 1.5rem;
        margin-bottom: 1rem;
        direction: rtl;
        letter-spacing: 1px;
      }

      /* Ayah container */
      .ayahs-container {
        background: var(--bg-card);
        border-radius: var(--radius-lg);
        border: 1px solid var(--glass-border);
        box-shadow: var(--shadow-sm);
        overflow: hidden;
      }

      /* Mushaf view (inline/contiguous) */
      .mushaf-view {
        padding: 2rem 2.5rem;
        font-family: var(--quran-font) !important;
        font-size: var(--quran-font-size, 24px);
        line-height: 2.8;
        text-align: justify;
        direction: rtl;
        color: var(--text-primary);
      }

      /* Ayah block (list/translation view) */
      .ayah-block {
        padding: 1.5rem 2rem;
        border-bottom: 1px solid var(--glass-border);
        transition: background-color 0.3s ease;
        cursor: pointer;
        position: relative;
      }
      .ayah-block:last-child { border-bottom: none; }
      .ayah-block:hover { background: var(--bg-card-hover); }
      .ayah-block.playing, .ayah-block.ayah-selected { background: var(--accent-bg) !important; transition: background 0.3s ease; }

      .ayah-arabic-text {
        font-family: var(--quran-font) !important;
        font-size: var(--quran-font-size, 24px);
        line-height: 2.2;
        color: var(--text-primary);
        text-align: right;
        direction: rtl;
        margin-bottom: 0.5rem;
      }

      .ayah-translation-text {
        font-family: var(--font-english);
        font-size: 0.95rem;
        color: var(--text-secondary);
        direction: ltr;
        text-align: left;
        line-height: 1.6;
        padding-top: 0.75rem;
        border-top: 1px dashed var(--glass-border);
        margin-top: 0.5rem;
      }

      /* Inline ayah (mushaf mode) */
      .inline-ayah {
        display: inline;
        cursor: pointer;
        border-radius: 3px;
        transition: background-color 0.2s;
      }
      .inline-ayah:hover { background: var(--accent-bg); }

      /* Trackable word */
      .trackable-word {
        display: inline;
        font-family: inherit !important;
        transition: color 0.2s, background-color 0.2s;
        border-radius: 4px;
        cursor: pointer;
      }
      .trackable-word.word-highlight-active {
        color: var(--word-highlight-active-color);
        background: var(--word-highlight-active-bg);
        border-radius: 4px;
        padding: 0 2px;
        font-weight: bold;
        box-shadow: 0 0 0 2px var(--word-highlight-active-bg);
      }
      .trackable-word.word-highlight-done {
        color: var(--word-highlight-done-color);
      }

      /* Ayah end marker */
      .ayah-end-mark {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        position: relative;
        width: 40px;
        height: 40px;
        margin: 0 0.35rem;
        vertical-align: middle;
        flex-shrink: 0;
      }
      .ayah-end-mark svg {
        position: absolute;
        width: 100%;
        height: 100%;
        top: 0; left: 0;
      }
      .ayah-end-num {
        position: relative;
        z-index: 1;
        font-size: 14px;
        font-family: var(--font-arabic);
        font-weight: bold;
        color: var(--accent);
        line-height: 1;
      }

      /* Ayah toolbar popup */
      .ayah-toolbar {
        display: inline-flex;
        flex-wrap: wrap;
        gap: 0.5rem 1rem;
        justify-content: center;
        background: var(--bg-card);
        padding: 0.5rem 1rem;
        border-radius: var(--radius-lg);
        box-shadow: var(--shadow-md);
        border: 1px solid var(--glass-border);
        position: absolute;
        z-index: 50;
        bottom: calc(100% + 5px);
        left: 50%;
        transform: translateX(-50%);
        width: max-content;
        max-width: calc(100vw - 2rem);
        backdrop-filter: blur(8px);
        animation: fadeInUp 0.2s ease;
      }
      @media (max-width: 767px) {
        .ayah-toolbar {
          gap: 0.5rem;
          padding: 0.5rem;
          border-radius: var(--radius-md);
          width: calc(100vw - 2rem);
        }
        .ayah-toolbar-btn {
          flex-direction: column;
          font-size: 0.75rem;
        }
        .ayah-toolbar-btn svg {
          margin-bottom: 2px;
        }
      }
      @keyframes fadeInUp {
        from { opacity: 0; transform: translateX(-50%) translateY(6px); }
        to { opacity: 1; transform: translateX(-50%) translateY(0); }
      }
      .ayah-toolbar-btn {
        cursor: pointer;
        color: var(--text-secondary);
        display: flex;
        align-items: center;
        gap: 4px;
        font-family: var(--font-arabic);
        font-size: 0.85rem;
        padding: 4px 6px;
        border-radius: var(--radius-sm);
        transition: all 0.15s;
        flex: 1 1 auto;
        justify-content: center;
      }
      .ayah-toolbar-btn:hover { color: var(--accent); background: var(--accent-bg); }
      .ayah-toolbar-btn svg { width: 18px; height: 18px; flex-shrink: 0; }

      /* FAB mic button (bottom right) */
      .reader-fab {
        position: fixed;
        bottom: 1.5rem;
        left: 1.5rem;
        z-index: 300;
        display: none; /* shown on mobile in quran-reader */
      }

      /* Desktop: side panel for settings */
      @media (min-width: 1024px) {
        .reader-inner { padding: 2rem 1%; }
        .mushaf-view { padding: 2rem 2rem; }
        .ayah-block { padding: 1.5rem 2rem; }
        .reader-bar-title { font-size: 1.3rem; }
      }

      /* Mobile-specific */
      @media (max-width: 767px) {
        .reader-inner { padding: 1rem 0.25rem; }
        .mushaf-view { padding: 1rem 0.5rem; font-size: calc(var(--quran-font-size, 24px) * 0.9); }
        .ayah-block { padding: 1rem 0.75rem; }
        .surah-hero-card { padding: 1.25rem; }
        .surah-hero-name { font-size: 1.6rem; }
        .reader-app-bar { padding: 0.5rem 1rem; min-height: 60px; }
        .rdr-btn { width: 40px; height: 40px; border-radius: var(--radius-sm); }
        .rdr-btn svg { width: 20px; height: 20px; }
        .rdr-btn-play { width: 44px; height: 44px; border-radius: 50%; }
      }

      /* Status bar (tracking) */
      .tracking-status-bar {
        background: rgba(239, 68, 68, 0.08);
        border-bottom: 1px solid rgba(239, 68, 68, 0.2);
        padding: 6px 1rem;
        text-align: center;
        font-family: var(--font-arabic);
        font-size: 0.85rem;
        color: #EF4444;
        display: none;
      }
      .tracking-status-bar.active { display: block; }
      
      /* Word by word translation */
      .wbw-container {
        display: inline-flex;
        flex-direction: column;
        align-items: center;
        justify-content: flex-start;
        margin: 0 0.25rem;
        vertical-align: top;
      }
      .wbw-translation {
        font-family: var(--font-english);
        font-size: 0.9rem;
        color: var(--text-secondary);
        text-align: center;
        margin-top: -0.4rem;
        line-height: 1.2;
        max-width: max-content;
        opacity: 0.8;
      }
    </style>

    <!-- Fixed App Bar -->
    <div class="reader-app-bar" id="reader-app-bar">
      <!-- Right side: back + hamburger -->
      <div class="reader-bar-right">
        <button class="rdr-btn hamburger-btn" id="reader-menu-btn" title="القائمة" style="display:none;">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
        </button>
        <button class="rdr-btn" id="back-btn" title="عودة">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
        </button>
      </div>

      <!-- Title -->
      <div class="reader-bar-title" id="reader-bar-title">جاري التحميل...</div>

      <!-- Left side: controls -->
      <div class="reader-bar-left">
        <!-- Play/Pause -->
        <button class="rdr-btn rdr-btn-play" id="play-audio-btn" title="تشغيل التلاوة">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" id="play-icon">
            <polygon points="5 3 19 12 5 21 5 3"/>
          </svg>
        </button>

        <!-- Voice tracking -->
        <div style="position:relative;" id="voice-btn-wrapper">
          <button class="rdr-btn rdr-btn-voice" id="voice-track-btn" title="التتبع الصوتي (اضغط للبدء، اضغط مطولاً للإعدادات)">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" id="voice-icon">
              <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/>
              <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
              <line x1="12" x2="12" y1="19" y2="22"/>
            </svg>
          </button>
          <!-- Model select dropdown -->
          <div id="model-dropdown" style="display:none; position:absolute; top:calc(100% + 8px); left:50%; transform:translateX(-50%); background:var(--dropdown-bg); border:1px solid var(--dropdown-border); border-radius:var(--radius-md); padding:1rem; box-shadow:var(--dropdown-shadow); z-index:300; min-width:200px; text-align:center;">
            <div style="font-size:0.85rem; font-weight:bold; color:var(--text-primary); margin-bottom:0.75rem;">نموذج التتبع الصوتي</div>
            <select id="ai-model-select" style="width:100%; padding:0.5rem 0.75rem; border-radius:var(--radius-sm); border:1px solid var(--glass-border); background:var(--bg-main); color:var(--text-primary); font-family:var(--font-arabic); font-size:0.9rem; outline:none; cursor:pointer;">
              <option value="webspeech">${hasWebSpeech ? '🎤 Web Speech (تلقائي)' : 'Web Speech (غير مدعوم)'}</option>
              <option value="faster-whisper">🖥️ Faster Whisper (محلي)</option>
              <option value="whisper-tiny-ar">🤖 Whisper Tiny AR</option>
            </select>
            <div id="speech-lang-row" style="margin-top: 0.75rem;">
              <select id="speech-lang-select" style="width:100%; padding:0.5rem 0.75rem; border-radius:var(--radius-sm); border:1px solid var(--glass-border); background:var(--bg-main); color:var(--text-primary); font-family:var(--font-arabic); font-size:0.9rem; outline:none; cursor:pointer;">
                <option value="ar-SA">العربية - السعودية</option>
                <option value="ar-EG">العربية - مصر</option>
                <option value="ar-AE">العربية - الإمارات</option>
                <option value="ar">العربية (عام)</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Translation toggle -->
        <button class="rdr-btn" id="translate-btn" title="${t('view_tafsir') || 'الترجمة'}" style="color: ${showTranslation ? 'var(--accent)' : 'var(--text-primary)'}; display: ${state.language === 'en' ? 'inline-flex' : 'none'};">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m5 8 6 6"/><path d="m4 14 6-6 2-3"/><path d="M2 5h12"/><path d="M7 2h1"/><path d="m22 22-5-10-5 10"/><path d="M14 18h6"/></svg>
        </button>

        <!-- SRS Rating -->
        <button class="rdr-btn" id="srs-rate-btn" title="تقييم الحفظ">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
        </button>

        <!-- Font settings -->
        <button class="rdr-btn" id="font-settings-btn" title="إعدادات الخط">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="4 7 4 4 20 4 20 7"></polyline>
            <line x1="9" y1="20" x2="15" y2="20"></line>
            <line x1="12" y1="4" x2="12" y2="20"></line>
          </svg>
        </button>
      </div>
    </div>

    <!-- Tap hint zone when header hidden (mobile) -->
    <div class="reader-tap-hint" id="tap-hint"></div>

    <!-- Tracking status bar -->
    <div class="tracking-status-bar" id="tracking-status" style="display:none !important; padding: 0.6rem 1rem; justify-content: space-between; align-items: center; background: var(--glass-bg, rgba(0,0,0,0.05)); backdrop-filter: blur(10px); border-radius: 10px; margin-bottom: 0.75rem; border: 1px solid var(--glass-border, rgba(255,255,255,0.1)); gap: 0.75rem;">
      <div style="display: flex; align-items: center; gap: 0.5rem; flex: 1;">
        <div id="mic-visualizer" style="display: flex; gap: 2px; height: 20px; align-items: center;">
          <div class="bar" style="width: 3px; background: var(--accent); height: 4px; border-radius: 2px; transition: height 0.08s ease;"></div>
          <div class="bar" style="width: 3px; background: var(--accent); height: 8px; border-radius: 2px; transition: height 0.08s ease;"></div>
          <div class="bar" style="width: 3px; background: var(--accent); height: 12px; border-radius: 2px; transition: height 0.08s ease;"></div>
          <div class="bar" style="width: 3px; background: var(--accent); height: 6px; border-radius: 2px; transition: height 0.08s ease;"></div>
          <div class="bar" style="width: 3px; background: var(--accent); height: 10px; border-radius: 2px; transition: height 0.08s ease;"></div>
          <div class="bar" style="width: 3px; background: var(--accent); height: 7px; border-radius: 2px; transition: height 0.08s ease;"></div>
          <div class="bar" style="width: 3px; background: var(--accent); height: 14px; border-radius: 2px; transition: height 0.08s ease;"></div>
        </div>
        <span id="tracking-status-text" style="font-size: 0.8rem; font-weight: 600; color: var(--accent); white-space: nowrap;">🎙️ جاري الاستماع...</span>
      </div>
      <div style="display: flex; align-items: center; gap: 1rem; font-size: 0.8rem; font-weight: 600; color: var(--text-secondary); flex-shrink: 0;">
        <span style="display:flex; align-items:center; gap:3px;">
          <span id="confidence-dot" style="width:8px; height:8px; border-radius:50%; background:#22c55e; display:inline-block; transition: background 0.3s;"></span>
          <span id="confidence-value" style="color: var(--accent);">100%</span>
        </span>
        <span><span id="wpm-counter" style="color: var(--accent);">0</span> ك/د</span>
      </div>
    </div>


    <!-- Main content -->
    <div class="reader-content-wrapper">
      <!-- Font panel (hidden by default) -->
      <div class="reader-inner" style="padding-bottom:0;">
        <div class="reader-font-panel" id="font-panel">
          <div style="display:flex; align-items:center; justify-content:space-between; gap:1.5rem;">
            <div style="display:flex; align-items:center; gap:0.5rem;">
              <svg viewBox="0 0 24 24" fill="none" stroke="var(--accent)" stroke-width="2" style="width:20px;height:20px;"><polyline points="4 7 4 4 20 4 20 7"></polyline><line x1="9" y1="20" x2="15" y2="20"></line><line x1="12" y1="4" x2="12" y2="20"></line></svg>
              <label style="font-family:var(--font-arabic); font-size:1rem; font-weight:600; color:var(--text-primary); white-space:nowrap;">خط القراءة</label>
            </div>
            <select id="quran-font-select" class="premium-select" style="max-width:260px;">
              <option value="'KFGQPC Uthmanic Script HAFS', 'Amiri Quran', serif">📖 مصحف المدينة (حفص الرسم العثماني)</option>
              <option value="'KFGQPC Uthman Taha Naskh', 'Amiri Quran', serif">📜 عثمان طه النسخ</option>
              <option value="'Amiri Quran', serif">📜 أميري مصحف (Amiri Quran)</option>
              <option value="'Scheherazade New', serif">✒️ شهرزاد المصحف (Scheherazade)</option>
              <option value="'Noto Naskh Arabic', serif">🖋️ النسخ الحديث (Noto Naskh)</option>
              <option value="'Noto Kufi Arabic', sans-serif">🏛️ الكوفي الحديث (Noto Kufi)</option>
              <option value="'Lateef', serif">🎨 لطيف القرآني (Lateef)</option>
              <option value="'Aref Ruqaa', serif">✒️ خط الرقعة (Aref Ruqaa)</option>
              <option value="'Tajawal', sans-serif">📱 تجول الحديث (Tajawal)</option>
              <option value="'Cairo', sans-serif">🖥️ كايرو الحديث (Cairo)</option>
              <option value="'Almarai', sans-serif">✨ المراعي الحديث (Almarai)</option>
            </select>
          </div>
          <div style="display:flex; align-items:center; gap:1.5rem;">
            <div style="display:flex; align-items:center; gap:0.5rem; min-width:100px;">
              <svg viewBox="0 0 24 24" fill="none" stroke="var(--accent)" stroke-width="2" style="width:20px;height:20px;"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="16"></line><line x1="8" y1="12" x2="16" y2="12"></line></svg>
              <label style="font-family:var(--font-arabic); font-size:1rem; font-weight:600; color:var(--text-primary); white-space:nowrap;">حجم الخط</label>
            </div>
            <input type="range" id="quran-font-size-slider" class="premium-slider" min="18" max="64" value="${state.quranFontSize || 24}">
            <div id="font-size-label" style="font-size:0.95rem; font-weight:bold; color:var(--accent); background:var(--accent-bg); padding:0.25rem 0.75rem; border-radius:var(--radius-sm); min-width:54px; text-align:center;">${state.quranFontSize || 24}px</div>
          </div>
        </div>
      </div>

      <div class="reader-inner">
        <div id="surah-header-slot"></div>
        <div id="ayahs-slot" style="display:flex; flex-direction:column; gap:0;">
          <div style="text-align:center; padding:5rem 2rem; color:var(--text-muted);">
            <div style="font-size:2rem; margin-bottom:1rem;">📖</div>
            <div style="font-family:var(--font-arabic);">جاري تحميل البيانات...</div>
          </div>
        </div>
      </div>
    </div>

    </div>

    <!-- SRS Rating Modal -->
    <div id="srs-modal" style="display:none; position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.5); z-index:1000; align-items:center; justify-content:center; backdrop-filter:blur(4px);">
      <div class="glass-panel" style="width: 90%; max-width: 400px; text-align: center; padding: 2rem; border-radius: var(--radius-lg); background: var(--bg-card); animation: slideDownFade 0.3s;">
        <h3 style="color: var(--text-primary); margin-bottom: 1rem;">كيف كان حفظك؟</h3>
        <p style="color: var(--text-secondary); margin-bottom: 2rem; font-size: 0.9rem;">سيتم جدولة مراجعتك القادمة لهذه الصفحة بناءً على تقييمك.</p>
        <div style="display: flex; flex-direction: column; gap: 1rem;">
          <button class="btn" id="srs-hard" style="background: rgba(239, 68, 68, 0.1); color: #EF4444; border: 1px solid #EF4444;">صعب (أحتاج مراجعة قريباً)</button>
          <button class="btn" id="srs-good" style="background: rgba(245, 158, 11, 0.1); color: #F59E0B; border: 1px solid #F59E0B;">جيد (تذكرت بصعوبة)</button>
          <button class="btn" id="srs-easy" style="background: rgba(16, 185, 129, 0.1); color: #10B981; border: 1px solid #10B981;">سهل (حفظ متقن)</button>
        </div>
        <button class="btn btn-outline" id="srs-cancel" style="margin-top: 1.5rem; width: 100%;">إلغاء</button>
      </div>
    </div>

    <audio id="quran-audio" style="display:none;"></audio>
  `;

  const toArabicNumeral = (num) => num.toString().replace(/\d/g, d => '٠١٢٣٤٥٦٧٨٩'[d]);

  // ============ DOM REFS ============
  const appBar = container.querySelector('#reader-app-bar');
  const barTitle = container.querySelector('#reader-bar-title');
  const playBtn = container.querySelector('#play-audio-btn');
  const playIcon = container.querySelector('#play-icon');
  const voiceBtn = container.querySelector('#voice-track-btn');
  const voiceIcon = container.querySelector('#voice-icon');
  const voiceWrapper = container.querySelector('#voice-btn-wrapper');
  const modelDropdown = container.querySelector('#model-dropdown');
  const aiModelSelect = container.querySelector('#ai-model-select');
  const speechLangSelect = container.querySelector('#speech-lang-select');
  const translateBtn = container.querySelector('#translate-btn');
  const srsRateBtn = container.querySelector('#srs-rate-btn');
  const srsModal = container.querySelector('#srs-modal');
  const srsCancel = container.querySelector('#srs-cancel');
  const srsHard = container.querySelector('#srs-hard');
  const srsGood = container.querySelector('#srs-good');
  const srsEasy = container.querySelector('#srs-easy');
  const fontSettingsBtn = container.querySelector('#font-settings-btn');
  const fontPanel = container.querySelector('#font-panel');
  const fontSelect = container.querySelector('#quran-font-select');
  const fontSlider = container.querySelector('#quran-font-size-slider');
  const fontSizeLabel = container.querySelector('#font-size-label');
  const surahHeaderSlot = container.querySelector('#surah-header-slot');
  const ayahsSlot = container.querySelector('#ayahs-slot');
  const audioEl = container.querySelector('#quran-audio');
  const trackingStatusBar = container.querySelector('#tracking-status');
  const tapHint = container.querySelector('#tap-hint');
  const menuBtn = container.querySelector('#reader-menu-btn');
  const backBtn = container.querySelector('#back-btn');

  // Init font selects
  const savedQuranFont = state.quranFont || "'KFGQPC Uthmanic Script HAFS', 'Amiri Quran', serif";
  if (Array.from(fontSelect.options).some(opt => opt.value === savedQuranFont)) {
    fontSelect.value = savedQuranFont;
  }
  document.documentElement.style.setProperty('--quran-font', savedQuranFont);

  // Init model select
  aiModelSelect.value = state.aiModel || 'webspeech';
  speechLangSelect.value = localStorage.getItem('speechLang') || 'ar-SA';

  // Show hamburger on mobile
  if (window.innerWidth < 768) {
    menuBtn.style.display = 'flex';
  }
  menuBtn.addEventListener('click', () => {
    if (openMobileSidebar) openMobileSidebar();
  });

  // ============ SRS Logic ============
  srsRateBtn.addEventListener('click', () => {
    srsModal.style.display = 'flex';
  });
  srsCancel.addEventListener('click', () => {
    srsModal.style.display = 'none';
  });

  const saveSRSRating = (easeFactor) => {
    const srsDataStr = localStorage.getItem('srs_data');
    const srsData = srsDataStr ? JSON.parse(srsDataStr) : {};
    
    // We rate the current rendered page
    // Render type is 'page', 'surah', or 'juz'. To keep it simple, we save 'page_X' or 'surah_X'.
    // We'll standardize to 'page_X' since that's what we track in HifzTracker currently.
    let pageKey = 'page_1';
    if (renderType === 'page') pageKey = 'page_' + targetValue;
    else if (renderType === 'surah') pageKey = 'surah_' + targetValue;
    else if (renderType === 'juz') pageKey = 'juz_' + targetValue;

    const now = Date.now();
    const existing = srsData[pageKey] || { interval: 0, ease: 2.5, repetitions: 0 };
    
    let interval = existing.interval;
    let ease = existing.ease;
    let repetitions = existing.repetitions;

    // Super Mario SM2 Logic simplified
    if (easeFactor < 3) {
      repetitions = 0;
      interval = 1;
    } else {
      if (repetitions === 0) interval = 1;
      else if (repetitions === 1) interval = 3;
      else interval = Math.round(interval * ease);
      repetitions++;
    }

    ease = ease + (0.1 - (5 - easeFactor) * (0.08 + (5 - easeFactor) * 0.02));
    if (ease < 1.3) ease = 1.3;

    srsData[pageKey] = {
      interval,
      ease,
      repetitions,
      nextReview: now + interval * 24 * 60 * 60 * 1000
    };

    localStorage.setItem('srs_data', JSON.stringify(srsData));
    srsModal.style.display = 'none';
    import('../utils/toast.js').then(m => m.showToast('تم حفظ التقييم وجدولة المراجعة القادمة!', 'success'));
  };

  srsHard.addEventListener('click', () => saveSRSRating(2));
  srsGood.addEventListener('click', () => saveSRSRating(4));
  srsEasy.addEventListener('click', () => saveSRSRating(5));

  // ============ HEADER TOGGLE (mobile tap) ============
  let headerHideTimeout = null;

  function showHeader() {
    appBar.classList.remove('hidden');
    headerVisible = true;
    clearTimeout(headerHideTimeout);
  }

  function hideHeader() {
    appBar.classList.add('hidden');
    headerVisible = false;
  }

  function toggleHeader() {
    if (headerVisible) hideHeader();
    else showHeader();
  }

  // Tap hint zone shows header
  tapHint.addEventListener('click', showHeader);
  tapHint.addEventListener('touchend', (e) => { e.preventDefault(); showHeader(); });

  // Touch tap detection on content area (mobile)
  let touchStartX = 0, touchStartY = 0;
  container.addEventListener('touchstart', (e) => {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
  }, { passive: true });

  container.addEventListener('touchend', (e) => {
    if (!e.changedTouches[0]) return;
    const dx = Math.abs(e.changedTouches[0].clientX - touchStartX);
    const dy = Math.abs(e.changedTouches[0].clientY - touchStartY);
    // Only toggle if it was a pure tap (not a scroll)
    if (dx < 12 && dy < 12) {
      // Only if tap is NOT on a button or interactive element
      if (!e.target.closest('button, select, input, .ayah-toolbar, .trackable-word, .rdr-btn')) {
        toggleHeader();
      }
    }
  }, { passive: true });

  // Scroll-based hide on desktop
  let lastScrollY = 0;
  const scrollEl = document.querySelector('.app-content') || window;
  const handleScroll = () => {
    const currentY = (scrollEl === window) ? window.scrollY : scrollEl.scrollTop;
    if (currentY > 120 && currentY > lastScrollY + 20) {
      if (window.innerWidth >= 768) hideHeader();
    } else if (currentY < lastScrollY - 10 || currentY < 100) {
      showHeader();
    }
    lastScrollY = currentY;
  };
  scrollEl.addEventListener('scroll', handleScroll, { passive: true });

  // ============ FONT SETTINGS ============
  fontSettingsBtn.addEventListener('click', () => {
    fontPanel.classList.toggle('open');
  });

  fontSelect.addEventListener('change', (e) => {
    const font = e.target.value;
    document.documentElement.style.setProperty('--quran-font', font);
    localStorage.setItem('quranFont', font);
    state.quranFont = font;
  });

  fontSlider.addEventListener('input', (e) => {
    const size = e.target.value;
    fontSizeLabel.textContent = size + 'px';
    document.documentElement.style.setProperty('--quran-font-size', size + 'px');
    localStorage.setItem('quranFontSize', size);
    state.quranFontSize = parseInt(size);
  });

  // ============ TRANSLATION ============
  translateBtn.addEventListener('click', () => {
    showTranslation = !showTranslation;
    localStorage.setItem('showTranslation', showTranslation);
    translateBtn.style.color = showTranslation ? 'var(--accent)' : 'var(--text-primary)';
    renderSurah();
  });

  // ============ MODEL DROPDOWN (long press) ============
  aiModelSelect.addEventListener('change', (e) => {
    state.aiModel = e.target.value;
    localStorage.setItem('aiModel', e.target.value);
    // Show/hide lang selector
    speechLangSelect.parentElement.style.display = e.target.value === 'webspeech' ? 'block' : 'none';
  });

  speechLangSelect.addEventListener('change', (e) => {
    localStorage.setItem('speechLang', e.target.value);
  });

  // Initial lang selector visibility
  speechLangSelect.parentElement.style.display = (state.aiModel === 'webspeech') ? 'block' : 'none';

  let pressTimer;
  voiceBtn.addEventListener('mousedown', (e) => {
    if (e.button !== 0) return;
    pressTimer = setTimeout(() => { modelDropdown.style.display = modelDropdown.style.display === 'none' ? 'block' : 'none'; }, 600);
  });
  voiceBtn.addEventListener('mouseup', () => clearTimeout(pressTimer));
  voiceBtn.addEventListener('mouseleave', () => clearTimeout(pressTimer));
  voiceBtn.addEventListener('touchstart', (e) => {
    pressTimer = setTimeout(() => {
      e.preventDefault();
      modelDropdown.style.display = modelDropdown.style.display === 'none' ? 'block' : 'none';
    }, 600);
  }, { passive: true });
  voiceBtn.addEventListener('touchend', () => clearTimeout(pressTimer));
  voiceBtn.addEventListener('contextmenu', (e) => { e.preventDefault(); modelDropdown.style.display = modelDropdown.style.display === 'none' ? 'block' : 'none'; });

  document.addEventListener('click', (e) => {
    if (!e.target.closest('#voice-btn-wrapper')) modelDropdown.style.display = 'none';
    if (!e.target.closest('#font-panel') && !e.target.closest('#font-settings-btn')) {
      fontPanel.classList.remove('open');
    }
  });

  // ============ AYAH END SVG ============
  const getAyahEndSvg = (num) => `
    <span class="ayah-end-mark">
      <svg viewBox="0 0 100 100">
        <path d="M50 5 C60 5,70 15,80 20 C90 25,95 40,95 50 C95 60,90 75,80 80 C70 85,60 95,50 95 C40 95,30 85,20 80 C10 75,5 60,5 50 C5 40,10 25,20 20 C30 15,40 5,50 5 Z" fill="transparent" stroke="var(--accent)" stroke-width="4"/>
        <circle cx="50" cy="50" r="28" fill="none" stroke="var(--accent)" stroke-width="1.5" opacity="0.3" stroke-dasharray="4 4"/>
      </svg>
      <span class="ayah-end-num">${toArabicNumeral(num)}</span>
    </span>
  `;

  // ============ FETCH TRANSLATION ============
  const fetchTranslation = async (surahNumber) => {
    if (translationsCache[surahNumber]) return translationsCache[surahNumber];
    try {
      window.__translationData = window.__translationData || {};
      if (!window.__translationData['en.asad']) {
        const res = await fetch('/quran/en.asad.json');
        window.__translationData['en.asad'] = await res.json();
      }
      const data = window.__translationData['en.asad'];
      const surahData = data.data.surahs[surahNumber - 1];
      translationsCache[surahNumber] = surahData.ayahs;
      return surahData.ayahs;
    } catch (e) { return []; }
  };

  // ============ FETCH WORD-BY-WORD ============
  let wbwCache = {};
  const fetchWordByWordData = async (surahNumber) => {
    const lang = state.language === 'en' ? 'en' : 'ar';
    const cacheKey = `${surahNumber}_${lang}`;
    if (wbwCache[cacheKey]) return wbwCache[cacheKey];
    try {
      const res = await fetch(`https://api.quran.com/api/v4/verses/by_chapter/${surahNumber}?words=true&word_fields=translation&language=${lang}`);
      const data = await res.json();
      wbwCache[cacheKey] = data.verses;
      return data.verses;
    } catch(e) { return null; }
  };

  // ============ FETCH AUDIO ============
  const fetchAudioData = async (surahNumber) => {
    const reciter = state.audioReciter || 'ar.alafasy';
    const cacheKey = `${surahNumber}_${reciter}`;
    if (audioDataCache[cacheKey]) return audioDataCache[cacheKey];
    try {
      const res = await fetch(`https://api.alquran.cloud/v1/surah/${surahNumber}/${reciter}`);
      const json = await res.json();
      audioDataCache[cacheKey] = json.data.ayahs;
      return json.data.ayahs;
    } catch (e) { return []; }
  };

  // ============ RENDER SURAH ============
  const renderSurah = async () => {
    if (!quranData) return;
    
    let ayahsToRender = [];
    let headerTitle = '', headerSubtitle = '', headerMeta = '';
    const isAr = state.language === 'ar' || !state.language;

    if (renderType === 'surah') {
      surahData = quranData.surahs.find(s => s.number === targetValue);
      if (!surahData) { ayahsSlot.innerHTML = `<div style="text-align:center; padding:3rem; color:var(--text-secondary);">سورة غير موجودة</div>`; return; }
      ayahsToRender = surahData.ayahs;
      headerTitle = surahData.name;
      headerSubtitle = isAr ? `${surahData.englishNameTranslation}` : surahData.englishName;
      headerMeta = `${surahData.revelationType === 'Meccan' ? 'مكية' : 'مدنية'} • ${surahData.ayahs.length} آية`;
      currentSurahNum = targetValue;
      updateQuranSurahSEO(surahData, targetAyah);
      try {
        const newUrl = targetAyah ? `?surah=${targetValue}&ayah=${targetAyah}` : `?surah=${targetValue}`;
        window.history.replaceState(null, '', newUrl);
      } catch(e) {}
    } else if (renderType === 'juz') {
      ayahsToRender = quranData.surahs.flatMap(s => s.ayahs).filter(a => a.juz === targetValue);
      headerTitle = `الجزء ${toArabicNumeral(targetValue)}`;
      headerSubtitle = `${ayahsToRender.length} آية`;
      if (ayahsToRender.length > 0) {
        const s = quranData.surahs.find(s => s.ayahs.some(a => a.number === ayahsToRender[0].number));
        if (s) currentSurahNum = s.number;
      }
    } else if (renderType === 'page') {
      ayahsToRender = quranData.surahs.flatMap(s => s.ayahs).filter(a => a.page === targetValue);
      headerTitle = `الصفحة ${toArabicNumeral(targetValue)}`;
      headerSubtitle = `${ayahsToRender.length} آية`;
      if (ayahsToRender.length > 0) {
        const s = quranData.surahs.find(s => s.ayahs.some(a => a.number === ayahsToRender[0].number));
        if (s) currentSurahNum = s.number;
      }
    }

    // Update bar title
    barTitle.textContent = headerTitle;

    // Render header card
    surahHeaderSlot.innerHTML = `
      <div class="surah-hero-card animate-slide-up">
        <div class="surah-hero-text">
          <div class="surah-hero-name">${headerTitle}</div>
          <div class="surah-hero-sub">${headerSubtitle}</div>
          <div class="surah-hero-meta">${headerMeta}</div>
        </div>
        <svg viewBox="0 0 120 90" style="position:absolute; left:0; bottom:0; height:100%; opacity:0.9; pointer-events:none; z-index:1;" preserveAspectRatio="xMinYMax meet">
          <path d="M40 65 C40 55, 65 55, 65 65 Z" fill="var(--accent-bg)"/>
          <path d="M70 68 C70 62, 85 62, 85 68 Z" fill="var(--glass-border)"/>
          <rect x="20" y="28" width="5" height="55" fill="var(--bg-card-hover)" opacity="0.6"/>
          <polygon points="18,28 27,28 22.5,16" fill="var(--accent)" opacity="0.7"/>
          <rect x="90" y="36" width="5" height="47" fill="var(--bg-card-hover)" opacity="0.5"/>
          <polygon points="88,36 97,36 92.5,24" fill="var(--accent)" opacity="0.6"/>
          <rect x="52" y="65" width="28" height="28" fill="var(--text-primary)" opacity="0.8"/>
          <rect x="52" y="72" width="28" height="4" fill="var(--accent)" opacity="0.9"/>
          <path d="M65 76 L65 93" stroke="var(--accent)" stroke-width="1.5" opacity="0.8"/>
        </svg>
      </div>
      ${(renderType === 'surah' && targetValue !== 1 && targetValue !== 9) ? `
        <div class="bismillah-row animate-fade-in">بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ</div>
      ` : ''}
    `;

    // Reset tracking
    trackingWords = [];
    trackingWordIndex = 0;

    const colorizeWord = (word, cleanWord) => {
      let result = word;
      
      // 1. Color Allah
      if (state.colorAllah) {
        if (['الله', 'لله', 'بالله', 'تالله', 'والله', 'فالله', 'ولله', 'فلله', 'اللهم', 'فاللهم'].includes(cleanWord)) {
          result = `<span style="color: var(--allah-color, #dc2626);">${result}</span>`;
        }
      }
      
      // 2. Color Tajweed (Madd \u0653, Small High Madd \u06E4)
      if (state.colorTajweed) {
        result = result.replace(/([\u0653\u06E4])/g, '<span style="color: var(--tajweed-color, #2563eb);">$1</span>');
      }
      
      // 3. Color Harakat (Tashkeel)
      if (state.colorHarakat) {
        // Harakat range: \u064B to \u0652, and \u0670 (superscript alef)
        const harakatRegex = state.colorTajweed ? /([\u064B-\u0652\u0670])/g : /([\u064B-\u0653\u0670\u06E4])/g;
        result = result.replace(harakatRegex, '<span style="color: var(--harakat-color, #D98A44);">$1</span>');
      }

      return result;
    };

    // Build words HTML helper
    const buildWordsHtml = (arabicText, wbwVerseData) => {
      const words = arabicText.split(' ').filter(w => w.trim());
      return words.map((w, index) => {
        const cleanW = stripDiacritics(w);
        const wId = `tw-${trackingWords.length}`;
        trackingWords.push({ cleanText: cleanW, id: wId });
        const coloredW = colorizeWord(w, cleanW);
        
        let transHtml = '';
        if (state.wordByWordTranslation && wbwVerseData && wbwVerseData.words && wbwVerseData.words[index]) {
          const transText = wbwVerseData.words[index].translation?.text || '';
          if (transText) {
            transHtml = `<span class="wbw-translation">${transText}</span>`;
            return `<span class="wbw-container"><span id="${wId}" class="trackable-word">${coloredW}</span>${transHtml}</span>`;
          }
        }
        
        return `<span id="${wId}" class="trackable-word">${coloredW}</span> `;
      }).join('');
    };

    // Build ayahs HTML
    let html = '';
    const getCleanText = (ayah) => {
      let txt = ayah.text;
      // Remove leading bismillah from surah starts (except Al-Fatiha which IS bismillah)
      const s = quranData.surahs.find(s => s.ayahs.some(a => a.number === ayah.number));
      const sNum = s ? s.number : currentSurahNum;
      if (ayah.numberInSurah === 1 && sNum !== 1) {
        let originalTxt = txt;
        txt = txt.replace(/^\s*بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ\s*/g, '')
                 .replace(/^\s*بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ\s*/g, '')
                 .replace(/^\s*بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ\s*/g, '')
                 .replace(/^\s*بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ\s*/g, '')
                 .replace(/^\s*بِسۡمِ ٱللَّهِ ٱلرَّحۡمَـٰنِ ٱلرَّحِيمِ\s*/g, '')
                 .replace(/^\s*بسم الله الرحمن الرحيم\s*/g, '');
        if (txt === originalTxt && txt.trim().startsWith('بِسْمِ')) {
            txt = txt.replace(/^\s*بِسْمِ.*?الرَّحِيمِ\s*/, '')
                     .replace(/^\s*بِسْمِ.*?الرَّحِيمِ\s*/, '')
                     .replace(/^\s*بِسۡمِ.*?ٱلرَّحِيمِ\s*/, '')
                     .replace(/^\s*بِسْمِ.*?ٱلرَّحِيمِ\s*/, '');
        }
        txt = txt.trim();
      }
      return { txt, sNum };
    };

    // Fetch WbW data if enabled
    let wbwData = null;
    if (state.wordByWordTranslation) {
      const uniqueSurahs = [...new Set(ayahsToRender.map(a => {
        const s = quranData.surahs.find(s => s.ayahs.some(ay => ay.number === a.number));
        return s ? s.number : currentSurahNum;
      }))];
      try {
        const wbwResults = await Promise.all(uniqueSurahs.map(sNum => fetchWordByWordData(sNum)));
        wbwData = wbwResults.flat().filter(Boolean);
      } catch (e) {
        console.error("WbW fetch failed", e);
      }
    }

    const getWbwVerseData = (sNum, aNumInSurah) => {
      if (!wbwData) return null;
      const verseKey = `${sNum}:${aNumInSurah}`;
      return wbwData.find(v => v && v.verse_key === verseKey);
    };

    if (showTranslation) {
      // List mode with translation
      ayahsToRender.forEach((ayah, idx) => {
        const { txt, sNum } = getCleanText(ayah);
        const wbwVerse = getWbwVerseData(sNum, ayah.numberInSurah);
        const wordsHtml = buildWordsHtml(txt, wbwVerse);
        let bismillahHtml = '';
        if (ayah.numberInSurah === 1 && sNum !== 1 && sNum !== 9 && renderType !== 'surah') {
          bismillahHtml = `<div class="bismillah-row" style="font-size:1.8rem; padding:1rem;">بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ</div>`;
        }
        html += `
          ${bismillahHtml}
          <div class="ayah-block" id="ayah-${ayah.number}" data-surah="${sNum}" data-ayah="${ayah.numberInSurah}">
            <div class="ayah-arabic-text">${wordsHtml}${getAyahEndSvg(ayah.numberInSurah)}</div>
            <div class="ayah-translation-text" id="trans-${ayah.number}">
              <div style="opacity:0.5; font-size:0.9rem;">جاري تحميل الترجمة...</div>
            </div>
          </div>
        `;
      });
    } else {
      // Mushaf mode (contiguous)
      html += `<div class="ayahs-container"><div class="mushaf-view">`;
      ayahsToRender.forEach(ayah => {
        const { txt, sNum } = getCleanText(ayah);
        const wbwVerse = getWbwVerseData(sNum, ayah.numberInSurah);
        const wordsHtml = buildWordsHtml(txt, wbwVerse);
        let bismillahHtml = '';
        if (ayah.numberInSurah === 1 && sNum !== 1 && sNum !== 9 && renderType !== 'surah') {
          bismillahHtml = `<div class="bismillah-row" style="font-size:1.8rem;">بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ</div>`;
        }
        html += `
          ${bismillahHtml}
          <span class="inline-ayah" id="ayah-${ayah.number}" data-surah="${sNum}" data-ayah="${ayah.numberInSurah}" title="آية ${ayah.numberInSurah}">
            <span class="ayah-arabic-text" style="display:inline;">${wordsHtml}</span>${getAyahEndSvg(ayah.numberInSurah)}
          </span>
        `;
      });
      html += `</div></div>`;
    }

    ayahsSlot.innerHTML = html;

    // Fetch translations async
    if (showTranslation) {
      const surahNums = [...new Set(ayahsToRender.map(a => {
        const s = quranData.surahs.find(s => s.ayahs.some(ay => ay.number === a.number));
        return s ? s.number : currentSurahNum;
      }))];
      Promise.all(surahNums.map(n => fetchTranslation(n))).then(results => {
        const allTrans = results.flat();
        ayahsToRender.forEach(ayah => {
          const el = container.querySelector(`#trans-${ayah.number}`);
          if (!el) return;
          const match = allTrans.find(t => t.number === ayah.number);
          el.innerHTML = match
            ? `<div style="font-size:0.95rem; color:var(--text-secondary); line-height:1.6;"><span style="font-weight:bold; opacity:0.6;">(${ayah.numberInSurah})</span> ${match.text}</div>`
            : `<div style="font-size:0.9rem; color:var(--text-muted); font-style:italic;">Translation unavailable</div>`;
        });
      }).catch(() => {});
    }

    // Bind ayah click events (toolbar)
    const ayahBlocks = ayahsSlot.querySelectorAll('.ayah-block, .inline-ayah');
    ayahBlocks.forEach(block => {
      block.addEventListener('click', (e) => {
        if (e.target.closest('.ayah-toolbar')) return;
        const sNum = parseInt(block.dataset.surah);
        const aNum = parseInt(block.dataset.ayah);
        const arabicEl = block.querySelector('.ayah-arabic-text');
        const arabicText = arabicEl ? arabicEl.innerText : '';

        // Remove existing toolbar
        const existing = document.querySelector('.ayah-toolbar');
        if (existing) {
          const wasSame = existing.dataset.id === block.id;
          existing.remove();
          if (wasSame) return;
        }

        // Build toolbar
        const toolbar = document.createElement('div');
        toolbar.className = 'ayah-toolbar';
        toolbar.dataset.id = block.id;
        
        block.classList.add('ayah-selected');
        const origRemove = toolbar.remove.bind(toolbar);
        toolbar.remove = () => {
          block.classList.remove('ayah-selected');
          origRemove();
        };

        const mkBtn = (svg, label) => {
          const b = document.createElement('div');
          b.className = 'ayah-toolbar-btn';
          b.innerHTML = `${svg}<span>${label}</span>`;
          return b;
        };

        const svgPlay = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="5 3 19 12 5 21 5 3"/></svg>`;
        const svgTafsir = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>`;
        const svgMeaning = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>`;
        const svgAsbab = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2l3 6 6 .5-4.5 4 1.5 6-6-3-6 3 1.5-6-4.5-4 6-.5z"/></svg>`;
        const svgBookmark = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>`;
        const svgCopy = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>`;

        const playB = mkBtn(svgPlay, 'تشغيل');
        playB.addEventListener('click', async (e) => {
          e.stopPropagation(); toolbar.remove();
          if (isTracking) stopTracking();
          isPlaying = true;
          playIcon.innerHTML = `<rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/>`;
          if (!currentAyahsList.length) currentAyahsList = await fetchAudioData(currentSurahNum);
          const idx = currentAyahsList.findIndex(a => a.numberInSurah === aNum);
          if (idx !== -1) { currentAyahIndex = idx; playAyah(idx); }
        });

        const tafsirB = mkBtn(svgTafsir, 'تفسير');
        tafsirB.addEventListener('click', (e) => {
          e.stopPropagation(); toolbar.remove();
          openTafsirModal(sNum, aNum, arabicText);
        });

        const meaningB = mkBtn(svgMeaning, 'المعنى');
        meaningB.addEventListener('click', (e) => {
          e.stopPropagation(); toolbar.remove();
          openMeaningModal(sNum, aNum, arabicText);
        });

        const asbabB = mkBtn(svgAsbab, 'سبب النزول');
        asbabB.addEventListener('click', (e) => {
          e.stopPropagation(); toolbar.remove();
          openAsbabModal(sNum, aNum, arabicText);
        });

        const bookmarkB = mkBtn(svgBookmark, 'فاصلة');
        bookmarkB.addEventListener('click', (e) => {
          e.stopPropagation(); toolbar.remove();
          const sData = quranData.surahs.find(s => s.number === sNum);
          localStorage.setItem('quranBookmarkDetail', JSON.stringify({ surah: sNum, ayah: aNum, surahName: sData ? sData.name : '' }));
          showToastLocal('✅ تم حفظ الفاصلة');
        });

        const copyB = mkBtn(svgCopy, 'نسخ');
        copyB.addEventListener('click', (e) => {
          e.stopPropagation(); toolbar.remove();
          const sData = quranData.surahs.find(s => s.number === sNum);
          const surahName = sData ? sData.name.replace(/سورة|سُورَةُ/g, '').trim() : '';
          
          let textToCopy = arabicText.replace(/[\u0660-\u0669\u06F0-\u06F90-9\s]+$/, '').trim();
          if (!state.copyTashkeel) {
              textToCopy = stripDiacritics(textToCopy);
          }
          
          let formattedText = textToCopy;
          const style = state.copyAyahStyle || 'modern';
          
          if (style === 'classic' || (style === undefined && state.copySymbol)) {
             formattedText += ` \u06DD${toArabicNumeral(aNum)}`;
          } else if (style === 'modern') {
             formattedText += ` (${aNum})`;
          }
          
          if (state.copyBrackets) {
             formattedText = `﴿${formattedText}﴾`;
          }
          
          if (state.copyMetadata) {
             formattedText = `قال تعالى : ${formattedText} (سورة ${surahName} - الآية ${aNum})`;
          }
          
          navigator.clipboard.writeText(formattedText).then(() => showToastLocal('📋 تم النسخ')).catch(() => {});
        });

        const shareB = mkBtn(`<svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>`, 'ستوري');
        shareB.addEventListener('click', (e) => {
          e.stopPropagation(); toolbar.remove();
          const sData = quranData.surahs.find(s => s.number === sNum);
          const surahName = sData ? sData.name.replace(/سورة|سُورَةُ/g, '').trim() : '';
          const cleanText = arabicText.replace(/[\u0660-\u0669\u06F0-\u06F90-9\s]+$/, '').trim();
          
          openImageThemeModal(async (selectedTheme, options) => {
              try {
                  const extraTexts = {};
                  if (options?.tafsir) {
                     const edition = window.appState?.tafsirEdition || 'ar.saadi';
                     window.__tafsirData = window.__tafsirData || {};
                     if (!window.__tafsirData[edition]) {
                         const res = await fetch(`/quran/${edition}.json`);
                         window.__tafsirData[edition] = await res.json();
                     }
                     const data = window.__tafsirData[edition];
                     extraTexts.tafsir = data.data.surahs[sNum - 1].ayahs[aNum - 1].text;
                  }
                  if (options?.meaning) {
                     window.__quranMuyassarData = window.__quranMuyassarData || null;
                     if (!window.__quranMuyassarData) {
                         const res = await fetch('/quran/ar.muyassar.json');
                         window.__quranMuyassarData = await res.json();
                     }
                     const data = window.__quranMuyassarData;
                     extraTexts.meaning = data.data.surahs[sNum - 1].ayahs[aNum - 1].text;
                  }
                  if (options?.asbab) {
                     try {
                        const res = await fetch('./assets/data/asbab_al_nuzul.json');
                        const asbabData = await res.json();
                        const key = `${sNum}_${aNum}`;
                        if (asbabData[key]) {
                            extraTexts.asbab = asbabData[key];
                        } else {
                            extraTexts.asbab = 'لم يرد سبب نزول صريح لهذه الآية.';
                        }
                     } catch(err) {
                         extraTexts.asbab = 'لم يرد سبب نزول صريح لهذه الآية.';
                     }
                  }

                  showToastLocal('جاري تجهيز الصورة...');
                  
                  let finalText = cleanText;
                  let finalAyahLabel = aNum;
                  if (options?.multiAyahEnd && options.multiAyahEnd > aNum) {
                      const texts = [];
                      for (let i = aNum; i <= options.multiAyahEnd; i++) {
                          const ayah = sData?.ayahs?.find(a => a.numberInSurah === i);
                          if (ayah) texts.push(ayah.text.replace(/[\u0660-\u0669\u06F0-\u06F90-9\s]+$/, '').trim());
                      }
                      finalText = texts.join(' \u06DD ');
                      finalAyahLabel = `${aNum}-${options.multiAyahEnd}`;
                  }
                  
                  await exportQuranToImage(finalText, surahName, finalAyahLabel, selectedTheme, { ...extraTexts, fontFamily: options?.fontFamily });
                  showToastLocal('✅ تم حفظ الستوري بنجاح');
              } catch (err) {
                  console.error(err);
                  showToastLocal('❌ حدث خطأ أثناء الحفظ');
              }
          }, { 
            text: cleanText, 
            header: surahName + ' - آية ' + aNum, 
            optionsList: [
                { id: 'tafsir', label: 'التفسير' },
                { id: 'meaning', label: 'المعنى (الميسر)' },
                ...(hasAsbabForAyah(sNum, aNum) ? [{ id: 'asbab', label: 'سبب النزول' }] : [])
            ],
            multiAyah: {
                enabled: true,
                currentAyah: aNum,
                surahNum: sNum,
                totalAyahs: sData ? sData.ayahs.length : 0,
                surahName: surahName,
                getAyahText: (ayahNum) => {
                    const ayah = sData?.ayahs?.find(a => a.numberInSurah === ayahNum);
                    return ayah ? ayah.text.replace(/[\u0660-\u0669\u06F0-\u06F90-9\s]+$/, '').trim() : '';
                }
            }
          });
        });

        toolbar.appendChild(playB);
        toolbar.appendChild(meaningB);
        toolbar.appendChild(tafsirB);
        if (hasAsbabForAyah(sNum, aNum)) {
          toolbar.appendChild(asbabB);

        }
        toolbar.appendChild(bookmarkB);
        toolbar.appendChild(copyB);
        toolbar.appendChild(shareB);
        block.style.position = 'relative';
        block.appendChild(toolbar);
        
        requestAnimationFrame(() => {
          const tbRect = toolbar.getBoundingClientRect();
          const padding = 10;
          
          if (tbRect.left < padding) {
            toolbar.style.marginLeft = `${padding - tbRect.left}px`;
          } else if (tbRect.right > window.innerWidth - padding) {
            toolbar.style.marginLeft = `-${tbRect.right - (window.innerWidth - padding)}px`;
          }
          
          if (tbRect.top < 70) {
            toolbar.style.bottom = 'auto';
            toolbar.style.top = 'calc(100% + 5px)';
          }
        });
      });
    });

    // Save bookmark
    if (ayahsToRender.length > 0) {
      const quranBookmarkObj = {
        surah: renderType === 'surah' ? targetValue : currentSurahNum,
        page: ayahsToRender[0].page
      };
      localStorage.setItem('quranBookmark', JSON.stringify(quranBookmarkObj));
      
      const quranStateObj = {};
      quranStateObj[renderType] = targetValue;
      localStorage.setItem('lastQuranPageState', JSON.stringify(quranStateObj));
      
      localStorage.setItem('quranBookmarkDetail', JSON.stringify({
        surahName: headerTitle,
        ayah: ayahsToRender[0].numberInSurah || 1,
        surah: currentSurahNum
      }));
    }

    // Scroll to target ayah
    if (targetAyah) {
      setTimeout(() => {
        const surah = quranData.surahs.find(s => s.number === currentSurahNum);
        if (!surah) return;
        const ayah = surah.ayahs.find(a => a.numberInSurah === targetAyah);
        if (!ayah) return;
        const el = container.querySelector(`#ayah-${ayah.number}`);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          el.style.backgroundColor = 'var(--accent-bg)';
          setTimeout(() => el.style.backgroundColor = '', 2000);
        }
      }, 600);
    }
  };

  // ============ SIMPLE TOAST ============
  const showToastLocal = (msg) => {
    const t = document.createElement('div');
    t.textContent = msg;
    t.style.cssText = `position:fixed; bottom:90px; left:50%; transform:translateX(-50%); background:var(--accent); color:white; padding:0.5rem 1.25rem; border-radius:var(--radius-full); z-index:9999; font-family:var(--font-arabic); box-shadow:var(--shadow-md); white-space:nowrap;`;
    document.body.appendChild(t);
    setTimeout(() => t.remove(), 2500);
  };

  // ============ AUDIO PLAYBACK ============
  const playAyah = (index) => {
    if (index >= currentAyahsList.length) {
      isPlaying = false;
      playIcon.innerHTML = `<polygon points="5 3 19 12 5 21 5 3"/>`;
      ayahsSlot.querySelectorAll('.ayah-block.playing').forEach(el => el.classList.remove('playing'));
      return;
    }
    ayahsSlot.querySelectorAll('.ayah-block.playing').forEach(el => el.classList.remove('playing'));
    const ayah = currentAyahsList[index];
    const block = container.querySelector(`#ayah-${ayah.number}`);
    if (block) {
      block.classList.add('playing');
      block.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    audioEl.src = ayah.audio;
    audioEl.play().catch(() => {});
  };

  audioEl.addEventListener('ended', () => {
    currentAyahIndex++;
    playAyah(currentAyahIndex);
  });

  playBtn.addEventListener('click', async () => {
    if (isPlaying) {
      audioEl.pause();
      isPlaying = false;
      playIcon.innerHTML = `<polygon points="5 3 19 12 5 21 5 3"/>`;
    } else {
      if (isTracking) stopTracking();
      isPlaying = true;
      playIcon.innerHTML = `<rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/>`;
      if (!currentAyahsList.length) {
        currentAyahsList = await fetchAudioData(currentSurahNum);
        currentAyahIndex = 0;
      }
      playAyah(currentAyahIndex);
    }
  });

  // ============ VOICE TRACKING (Streaming Greedy Engine) ============
  
  // Update confidence UI
  const updateConfidenceUI = (confidence) => {
    matchConfidence = Math.round(confidence);
    const dot = container.querySelector('#confidence-dot');
    const val = container.querySelector('#confidence-value');
    if (dot && val) {
      val.textContent = matchConfidence + '%';
      if (matchConfidence >= 70) {
        dot.style.background = '#22c55e';
      } else if (matchConfidence >= 40) {
        dot.style.background = '#f59e0b';
      } else {
        dot.style.background = '#ef4444';
      }
    }
  };

  const updateTrackingStatus = (text) => {
    const el = container.querySelector('#tracking-status-text');
    if (el) el.textContent = text;
  };

  const highlightWord = (index) => {
    container.querySelectorAll('.word-highlight-active').forEach(el => {
      el.classList.remove('word-highlight-active');
      el.classList.add('word-highlight-done');
    });
    if (index < trackingWords.length) {
      const span = container.querySelector('#' + trackingWords[index].id);
      if (span) {
        span.classList.add('word-highlight-active');
        const rect = span.getBoundingClientRect();
        const viewHeight = window.innerHeight;
        if (rect.top < viewHeight * 0.25 || rect.bottom > viewHeight * 0.75) {
          span.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }
    }
  };

  // === CORE: Sequential Frontier Word Tracker ===
  const matchTranscriptToWords = (transcript) => {
    if (!transcript || trackingWordIndex >= trackingWords.length) return;
    
    // Skip duplicate processing of identical string
    if (transcript === lastProcessedText) return;
    lastProcessedText = transcript;
    
    const spoken = stripDiacritics(transcript).split(/\s+/).filter(Boolean);
    if (!spoken.length) return;

    // Use latest spoken tokens
    const recentSpoken = spoken.slice(-8);

    // --- Backtracking Check (if reader repeated an earlier phrase) ---
    if (trackingWordIndex > 1 && recentSpoken.length >= 2) {
      const tail2 = recentSpoken.slice(-2);
      const backLimit = Math.max(0, trackingWordIndex - 12);
      for (let b = trackingWordIndex - 1; b >= backLimit; b--) {
        if (wordsMatch(tail2[0], trackingWords[b]?.cleanText || '') >= 0.7 &&
            wordsMatch(tail2[1], trackingWords[b + 1]?.cleanText || '') >= 0.7) {
          // Unmark words from b to current
          for (let i = b; i < trackingWordIndex; i++) {
            const cur = container.querySelector('#' + trackingWords[i].id);
            if (cur) cur.classList.remove('word-highlight-done', 'word-highlight-active');
          }
          trackingWordIndex = b;
          updateTrackingStatus('🔄 رجوع للمراجعة');
          highlightWord(trackingWordIndex);
          return;
        }
      }
    }

    // --- Strict Sequential Frontier Alignment ---
    let targetPtr = trackingWordIndex;

    for (let s = 0; s < recentSpoken.length && targetPtr < trackingWords.length; s++) {
      const w = recentSpoken[s];
      if (!w || w.length < 1) continue;

      const currExpected = trackingWords[targetPtr]?.cleanText || '';
      const scoreCurr = wordsMatch(w, currExpected);

      if (scoreCurr >= 0.7) {
        // Direct match with active word
        targetPtr++;
      } else {
        // Check if reader skipped 1 word (matches targetPtr + 1)
        const nextExpected = trackingWords[targetPtr + 1]?.cleanText || '';
        const scoreNext = wordsMatch(w, nextExpected);
        if (scoreNext >= 0.75) {
          targetPtr += 2; // Jump 1 skipped word
        }
      }
    }

    // If we advanced targetPtr
    if (targetPtr > trackingWordIndex) {
      for (let i = trackingWordIndex; i < targetPtr; i++) {
        const cur = container.querySelector('#' + trackingWords[i].id);
        if (cur) {
          cur.classList.remove('word-highlight-active');
          cur.classList.add('word-highlight-done');
        }
        wordsReadCount++;
      }

      trackingWordIndex = targetPtr;
      lastMatchTime = Date.now();
      updateConfidenceUI(98);
      updateTrackingStatus('🎙️ تتبع لحظي دقيق');
      highlightWord(trackingWordIndex);

      if (trackingWordIndex >= trackingWords.length) {
        stopTracking();
        showToastLocal('✅ اكتملت القراءة!');
      }
    } else {
      // Confidence decay if no match for 4 seconds
      if (Date.now() - lastMatchTime > 4000) {
        updateConfidenceUI(Math.max(20, matchConfidence - 4));
        if (Date.now() - lastMatchTime > 8000) {
          updateTrackingStatus('🔍 في انتظار القراءة...');
        }
      }
    }
  };

  // === Real Microphone Visualizer ===
  const startRealVisualizer = () => {
    if (!audioContext || !mediaStream) return;
    try {
      analyserNode = audioContext.createAnalyser();
      analyserNode.fftSize = 64;
      analyserNode.smoothingTimeConstant = 0.7;
      const source = audioContext.createMediaStreamSource(mediaStream);
      source.connect(analyserNode);
      micDataArray = new Uint8Array(analyserNode.frequencyBinCount);
      
      const bars = container.querySelectorAll('#mic-visualizer .bar');
      const animate = () => {
        if (!isTracking || !analyserNode) return;
        analyserNode.getByteFrequencyData(micDataArray);
        const binSize = Math.floor(micDataArray.length / bars.length);
        bars.forEach((bar, i) => {
          let sum = 0;
          for (let j = 0; j < binSize; j++) {
            sum += micDataArray[i * binSize + j] || 0;
          }
          const avg = sum / binSize;
          const height = Math.max(3, (avg / 255) * 20);
          bar.style.height = `${height}px`;
        });
        visualizerInterval = requestAnimationFrame(animate);
      };
      animate();
    } catch (e) {
      startFakeVisualizer();
    }
  };

  const startFakeVisualizer = () => {
    const bars = container.querySelectorAll('#mic-visualizer .bar');
    visualizerInterval = setInterval(() => {
      if (!isTracking) return;
      bars.forEach(bar => {
        bar.style.height = `${Math.max(3, Math.random() * 18)}px`;
      });
    }, 120);
  };

  // === Web Speech API (Zero-Latency Streaming) ===
  const startWebSpeechTracking = () => {
    if (!hasWebSpeech) {
      showToastLocal('⚠️ متصفحك لا يدعم التعرف الصوتي. استخدم Chrome أو Edge');
      return false;
    }
    
    // Get mic stream for visualizer
    navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
      mediaStream = stream;
      audioContext = new AudioContext();
      startRealVisualizer();
    }).catch(() => {
      startFakeVisualizer();
    });

    recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = speechLangSelect.value || 'ar-SA';
    recognition.maxAlternatives = 3;

    recognition.onstart = () => {
      isTracking = true;
      restartAttempts = 0;
      voiceBtn.classList.add('recording');
      trackingStatusBar.classList.add('active');
      highlightWord(trackingWordIndex);
      updateTrackingStatus('🎙️ جاري الاستماع...');
    };

    // ZERO-LATENCY: Process every result immediately — no debouncing
    recognition.onresult = (event) => {
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        
        if (result.isFinal) {
          // Final result: process ALL alternatives for best coverage
          for (let j = 0; j < result.length; j++) {
            const text = result[j].transcript.trim();
            if (text) matchTranscriptToWords(text);
          }
        } else {
          // Interim result: process IMMEDIATELY for real-time feel
          const text = result[0].transcript.trim();
          if (text) matchTranscriptToWords(text);
        }
      }
    };

    recognition.onerror = (e) => {
      if (e.error === 'not-allowed') {
        showToastLocal('⚠️ يرجى السماح باستخدام الميكروفون');
        stopTracking();
        return;
      }
      if (e.error === 'network') {
        updateTrackingStatus('⚠️ خطأ في الشبكة...');
      }
      if (e.error !== 'no-speech' && e.error !== 'aborted') {
        console.warn('Speech error:', e.error);
      }
    };

    recognition.onend = () => {
      // Fast restart — 100ms fixed delay (no exponential backoff)
      if (isTracking) {
        setTimeout(() => {
          try { 
            if (isTracking && recognition) recognition.start();
          } catch (e) {
            // Retry once after 500ms
            setTimeout(() => {
              try { if (isTracking && recognition) recognition.start(); } catch (e2) {}
            }, 500);
          }
        }, 100);
      }
    };

    try {
      recognition.start();
      return true;
    } catch (e) {
      showToastLocal('⚠️ خطأ في بدء التعرف الصوتي');
      return false;
    }
  };

  // === Fallback: Worker-based tracking ===
  const setupTrackingWorker = () => {
    if (!trackingWorker) {
      try {
        trackingWorker = new Worker(new URL('../ai/worker.js', import.meta.url), { type: 'module' });
        trackingWorker.postMessage({ type: 'load', modelName: state.aiModel });
        trackingWorker.onmessage = (e) => {
          const msg = e.data;
          if (msg.status === 'complete') {
            isTranscribing = false;
            matchTranscriptToWords(msg.text);
          } else if (msg.status === 'error') {
            isTranscribing = false;
          }
        };
      } catch (e) {
        console.error('Worker error:', e);
        return false;
      }
    }
    return true;
  };

  const startWorkerTracking = async () => {
    try {
      if (!setupTrackingWorker()) return;
      mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioContext = new AudioContext({ sampleRate: 16000 });
      const source = audioContext.createMediaStreamSource(mediaStream);
      scriptProcessor = audioContext.createScriptProcessor(4096, 1, 1);
      const gainNode = audioContext.createGain();
      gainNode.gain.value = 0;
      source.connect(scriptProcessor);
      scriptProcessor.connect(gainNode);
      gainNode.connect(audioContext.destination);
      startRealVisualizer();
      
      audioBuffer = [];
      let totalSamples = 0;
      let chunkCount = 0;
      scriptProcessor.onaudioprocess = (e) => {
        if (!isTracking) return;
        const channelData = e.inputBuffer.getChannelData(0);
        audioBuffer.push(new Float32Array(channelData));
        totalSamples += channelData.length;
        if (audioBuffer.length > 20) {
          totalSamples -= audioBuffer[0].length;
          audioBuffer.shift();
        }
        chunkCount++;
        if (chunkCount >= 6 && !isTranscribing && trackingWorker && audioBuffer.length > 8) {
          chunkCount = 0;
          let merged = new Float32Array(totalSamples);
          let offset = 0;
          audioBuffer.forEach(b => { merged.set(b, offset); offset += b.length; });
          isTranscribing = true;
          trackingWorker.postMessage({ type: 'transcribe', audioData: merged });
        }
      };
      isTracking = true;
      voiceBtn.classList.add('recording');
      trackingStatusBar.classList.add('active');
      highlightWord(trackingWordIndex);
    } catch (err) {
      showToastLocal('⚠️ يرجى السماح باستخدام الميكروفون');
      stopTracking();
    }
  };

  const stopTracking = () => {
    isTracking = false;
    if (wpmInterval) clearInterval(wpmInterval);
    if (visualizerInterval) {
      if (typeof visualizerInterval === 'number' && visualizerInterval > 1000) {
        cancelAnimationFrame(visualizerInterval);
      } else {
        clearInterval(visualizerInterval);
      }
    }
    wpmInterval = null;
    visualizerInterval = null;

    if (recognition) {
      try { recognition.stop(); recognition.abort(); } catch (e) {}
      recognition = null;
    }
    if (mediaStream) mediaStream.getTracks().forEach(t => t.stop());
    if (analyserNode) { try { analyserNode.disconnect(); } catch (e) {} }
    if (scriptProcessor) scriptProcessor.disconnect();
    if (audioContext) { try { audioContext.close(); } catch (e) {} }
    audioBuffer = [];
    mediaStream = null; audioContext = null; scriptProcessor = null;
    analyserNode = null; micDataArray = null;
    lastProcessedText = '';
    restartAttempts = 0;
    matchConfidence = 0;

    voiceBtn.classList.remove('recording');
    trackingStatusBar.classList.remove('active');
    voiceIcon.innerHTML = `<path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" x2="12" y1="19" y2="22"/>`;
    container.querySelectorAll('#mic-visualizer .bar').forEach(bar => {
      bar.style.height = '3px';
    });
  };

  const startTracking = () => {
    if (isPlaying) { audioEl.pause(); isPlaying = false; playIcon.innerHTML = `<polygon points="5 3 19 12 5 21 5 3"/>`; }
    trackingWordIndex = 0;
    container.querySelectorAll('.word-highlight-done, .word-highlight-active').forEach(el => {
      el.classList.remove('word-highlight-done', 'word-highlight-active');
    });

    lastMatchTime = Date.now();
    lastProcessedText = '';
    matchConfidence = 100;
    restartAttempts = 0;
    trackingStartTime = Date.now();
    wordsReadCount = 0;
    container.querySelector('#wpm-counter').textContent = '0';
    updateConfidenceUI(100);
    
    wpmInterval = setInterval(() => {
      if (!isTracking) return;
      const elapsedMinutes = (Date.now() - trackingStartTime) / 60000;
      const wpm = elapsedMinutes > 0 ? Math.round(wordsReadCount / elapsedMinutes) : 0;
      container.querySelector('#wpm-counter').textContent = wpm;
    }, 1000);

    const model = state.aiModel || 'webspeech';
    if (model === 'webspeech' || model === '') {
      if (!startWebSpeechTracking()) {
        startWorkerTracking();
      }
    } else {
      startWorkerTracking();
    }

    voiceIcon.innerHTML = `<rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/>`;
  };

  voiceBtn.addEventListener('click', (e) => {
    if (modelDropdown.style.display === 'block') return;
    if (isTracking) {
      stopTracking();
    } else {
      startTracking();
    }
  });

  // ============ LOAD QURAN DATA ============
  const loadQuran = async () => {
    try {
      quranData = await getQuranData(state.mushafEdition);
      preloadAsbabData().catch(e => console.error("Failed to preload Asbab data:", e));
      await renderSurah();
    } catch (error) {
      ayahsSlot.innerHTML = `
        <div style="text-align:center; color:var(--text-secondary); padding:3rem 2rem;">
          <div style="font-size:2rem; margin-bottom:1rem;">⚠️</div>
          <div style="font-family:var(--font-arabic); margin-bottom:1rem;">خطأ في تحميل بيانات القرآن</div>
          <div style="font-family:monospace; font-size:11px; color:var(--text-muted);">${error.message}</div>
        </div>
      `;
    }
  };

  loadQuran();

  // ============ BACK BUTTON ============
  backBtn.addEventListener('click', () => {
    if (isPlaying) { audioEl.pause(); isPlaying = false; }
    stopTracking();
    if (trackingWorker) { try { trackingWorker.terminate(); } catch (e) {} }
    scrollEl.removeEventListener('scroll', handleScroll);
    navigate('quran', { tab: renderType, target: targetValue });
  });

  // ============ MULTI-VERSE COPY SUPPORT ============
  container.addEventListener('copy', (e) => {
    const selection = window.getSelection();
    if (!selection.rangeCount) return;
    
    const ayahs = container.querySelectorAll('.ayah-block, .inline-ayah');
    const selectedAyahs = [];
    
    ayahs.forEach(ayah => {
        if (selection.containsNode(ayah, true)) {
            selectedAyahs.push(ayah);
        }
    });

    if (selectedAyahs.length > 0) {
        const firstAyah = selectedAyahs[0];
        const lastAyah = selectedAyahs[selectedAyahs.length - 1];
        
        const sNum = parseInt(firstAyah.dataset.surah);
        const fromAyah = parseInt(firstAyah.dataset.ayah);
        const toAyah = parseInt(lastAyah.dataset.ayah);
        
        const sData = (typeof quranData !== 'undefined' && quranData.surahs) ? quranData.surahs.find(s => s.number === sNum) : null;
        const surahName = sData ? sData.name.replace(/سورة|سُورَةُ/g, '').trim() : '';

        let finalText = selection.toString().trim();
        finalText = finalText.replace(/\n+/g, ' ').replace(/\s+/g, ' ');
        
        if (!state.copyTashkeel) {
            finalText = stripDiacritics(finalText);
        }
        
        const style = state.copyAyahStyle || 'modern';
        if (style === 'classic' || (style === undefined && state.copySymbol)) {
            // Add Quranic end symbol to numbers
            finalText = finalText.replace(/([\u0660-\u0669\u06F0-\u06F9]+)/g, ' \u06DD$1');
        } else if (style === 'modern') {
            // Convert arabic numerals to english numerals and wrap in parentheses
            finalText = finalText.replace(/([\u0660-\u0669\u06F0-\u06F9]+)/g, (match) => {
                const enNum = match.replace(/[\u0660-\u0669]/g, d => d.charCodeAt(0) - 1632)
                                   .replace(/[\u06F0-\u06F9]/g, d => d.charCodeAt(0) - 1776);
                return ` (${enNum})`;
            });
        }
        
        // Clean up any double spaces that might have been introduced
        finalText = finalText.replace(/\s+/g, ' ');
        
        if (state.copyBrackets) {
            if (!finalText.startsWith('﴿')) finalText = '﴿' + finalText;
            if (!finalText.endsWith('﴾')) finalText = finalText + '﴾';
        }

        let clipboardText = finalText;
        if (state.copyMetadata) {
            let metadata = `(سورة ${surahName}`;
            if (fromAyah === toAyah) {
                 metadata += ` - الآية ${fromAyah})`;
            } else {
                 metadata += ` - الآيات من ${fromAyah} إلى ${toAyah})`;
            }
            clipboardText = `قال تعالى : ${finalText} ${metadata}`;
        }

        e.clipboardData.setData('text/plain', clipboardText);
        e.preventDefault();
        
        showToastLocal('📋 تم نسخ الآيات المحددة بنجاح');
    }
  });

  return container;
}
