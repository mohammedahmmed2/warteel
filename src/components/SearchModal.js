import { t } from '../utils/i18n.js';
import { getQuranData } from '../utils/quranData.js';
import { state } from '../app.js';
import { searchQuran, highlightMatches } from '../utils/quranSearch.js';
import { openTafsirModal } from './TafsirModal.js';

let modalElement = null;
let navigateFn = null;
let cachedQuranData = null;
let activeTab = 'all';
let debounceTimer = null;

const RECENT_SEARCHES_KEY = 'quran_recent_searches';

function getRecentSearches() {
  try {
    return JSON.parse(localStorage.getItem(RECENT_SEARCHES_KEY) || '[]');
  } catch (e) {
    return [];
  }
}

function addRecentSearch(query) {
  if (!query || !query.trim()) return;
  const q = query.trim();
  let list = getRecentSearches().filter(item => item !== q);
  list.unshift(q);
  if (list.length > 8) list = list.slice(0, 8);
  localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(list));
}

function clearRecentSearches() {
  localStorage.removeItem(RECENT_SEARCHES_KEY);
}

export function openSearchModal(navigate) {
  navigateFn = navigate;
  if (!modalElement) {
    createSearchModal();
  }
  
  modalElement.classList.add('open');
  document.body.style.overflow = 'hidden';
  
  const searchInput = modalElement.querySelector('#quran-search-modal-input');
  if (searchInput) {
    searchInput.value = '';
    setTimeout(() => searchInput.focus(), 150);
  }

  // Pre-fetch quran data
  getQuranData(state.mushafEdition).then(data => {
    cachedQuranData = data;
    renderDefaultView();
  }).catch(() => {});

  renderDefaultView();
}

export function closeSearchModal() {
  if (modalElement) {
    modalElement.classList.remove('open');
    document.body.style.overflow = '';
  }
}

function createSearchModal() {
  modalElement = document.createElement('div');
  modalElement.className = 'quran-search-modal-backdrop';
  
  const toArabicNumeral = (num) => num.toString().replace(/\d/g, d => '٠١٢٣٤٥٦٧٨٩'[d]);

  modalElement.innerHTML = `
    <div class="quran-search-modal-container" style="border-radius: var(--radius-lg); background: var(--bg-card); overflow: hidden; display: flex; flex-direction: column; max-height: 90vh;">
      <!-- Modal Header -->
      <div class="quran-search-modal-header" style="padding: 1rem; display: flex; align-items: center; gap: 0.5rem; border-bottom: 1px solid var(--glass-border);">
        <button type="button" class="search-modal-close-btn" id="quran-search-modal-close" style="padding: 0.5rem; background: transparent; border: none; color: var(--text-secondary); cursor: pointer;">
          <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"></polyline></svg>
        </button>
        <div class="search-input-wrapper" style="flex: 1; display: flex; align-items: center; background: var(--bg-main); border-radius: 12px; padding: 0 0.75rem;">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="var(--text-muted)" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          <input 
            type="text" 
            id="quran-search-modal-input" 
            placeholder="${t('search_placeholder')}" 
            autocomplete="off" 
            style="flex: 1; height: 44px; border: none; background: transparent; font-size: 1rem; color: var(--text-primary); outline: none; padding: 0 0.5rem;"
          />
          <button type="button" id="quran-search-clear-btn" style="display: none; background: none; border: none; color: var(--text-muted); padding: 0.25rem; cursor: pointer;">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
          <button type="button" id="quran-voice-search-btn" style="background: none; border: none; color: var(--accent); padding: 0.25rem; margin-right: 0.25rem; cursor: pointer;">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" x2="12" y1="19" y2="22"/></svg>
          </button>
        </div>
      </div>

      <!-- Results Body -->
      <div class="quran-search-modal-body" id="quran-search-modal-results" style="flex: 1; overflow-y: auto; padding: 1rem;">
        <!-- Will be populated dynamically -->
      </div>
    </div>
  `;

  document.body.appendChild(modalElement);

  // Backdrop click to close
  modalElement.addEventListener('click', (e) => {
    if (e.target === modalElement) {
      closeSearchModal();
    }
  });

  const closeBtn = modalElement.querySelector('#quran-search-modal-close');
  if (closeBtn) closeBtn.addEventListener('click', closeSearchModal);

  const searchInput = modalElement.querySelector('#quran-search-modal-input');
  const clearBtn = modalElement.querySelector('#quran-search-clear-btn');

  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      const val = e.target.value;
      if (clearBtn) clearBtn.style.display = val.trim() ? 'flex' : 'none';

      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        performSearch(val);
      }, 150);
    });

    searchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        clearTimeout(debounceTimer);
        performSearch(searchInput.value);
      }
    });
  }

  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      if (searchInput) {
        searchInput.value = '';
        searchInput.focus();
      }
      clearBtn.style.display = 'none';
      renderDefaultView();
    });
  }

  // Tabs listener removed

  // Voice Search Logic
  const voiceBtn = modalElement.querySelector('#quran-voice-search-btn');
  if (voiceBtn) {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.lang = 'ar-SA';
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      let isRecording = false;

      recognition.onstart = () => {
        isRecording = true;
        voiceBtn.style.color = '#EF4444';
        voiceBtn.innerHTML = `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><rect x="9" y="9" width="6" height="6"></rect></svg>`;
        if (searchInput) searchInput.placeholder = "تحدث الآن للاستماع...";
      };

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        if (searchInput) {
          searchInput.value = transcript;
          if (clearBtn) clearBtn.style.display = 'flex';
          
          performSearch(transcript);
          
          // Smart Jump Logic
          setTimeout(() => {
             // Check if user is currently reading a surah
             const firstAyahEl = document.querySelector('.ayah-block, .inline-ayah');
             const currentSurahContext = firstAyahEl ? parseInt(firstAyahEl.getAttribute('data-surah')) : null;

             const results = searchQuran(transcript.trim(), cachedQuranData, { limit: 20 });
             if (results.surahs && results.surahs.length > 0) {
                const firstSurah = results.surahs[0];
                const cleanTranscript = transcript.replace(/سورة/g, '').trim();
                // If it matches a surah name closely, ignore current context and jump
                if (firstSurah.name.includes(cleanTranscript) || cleanTranscript.includes(firstSurah.name)) {
                   window.navigateFromSearch({surah: firstSurah.number});
                   return; // Stop here if it's a Surah match
                }
             } 
             
             if (results.ayahs && results.ayahs.length > 0) {
                let bestMatch = results.ayahs[0];
                
                // If we are currently reading a specific surah, restrict jump to that surah if the ayah exists there
                if (currentSurahContext) {
                    const matchInContext = results.ayahs.find(a => a.surahNumber === currentSurahContext);
                    if (matchInContext) {
                        bestMatch = matchInContext;
                    }
                }
                
                window.navigateFromSearch({surah: bestMatch.surahNumber, ayah: bestMatch.numberInSurah});
             }
          }, 300);
        }
      };

      recognition.onend = () => {
        isRecording = false;
        voiceBtn.style.color = 'var(--text-secondary)';
        voiceBtn.innerHTML = `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" x2="12" y1="19" y2="22"/></svg>`;
        if (searchInput) searchInput.placeholder = t('search_placeholder');
      };

      recognition.onerror = (e) => {
        console.warn('Speech recognition error:', e.error);
        try { recognition.stop(); } catch(err){}
      };

      voiceBtn.addEventListener('click', () => {
        if (isRecording) {
           recognition.stop();
        } else {
           recognition.start();
        }
      });
    } else {
      voiceBtn.style.display = 'none'; // Not supported
    }
  }
}

function renderDefaultView() {
  const container = modalElement.querySelector('#quran-search-modal-results');
  if (!container) return;

  const recent = getRecentSearches();

  const quickChips = [
    { label: 'آية الكرسي', query: 'آية الكرسي' },
    { label: 'سورة الكهف', query: 'سورة الكهف' },
    { label: 'سورة يس', query: 'سورة يس' },
    { label: 'إن مع العسر يسراً', query: 'ان مع العسر يسرا' },
    { label: 'الله نور السماوات والأرض', query: 'الله نور السماوات والارض' },
    { label: 'سورة الرحمن', query: 'سورة الرحمن' }
  ];

  let quickHTML = `
    <div style="margin-top: 1rem;">
      <div style="font-size: 0.9rem; font-weight: bold; color: var(--text-secondary); margin-bottom: 0.75rem;">${t('quick_search') || 'عمليات بحث شائعة'}</div>
      <div style="display: flex; flex-wrap: wrap; gap: 0.5rem;">
        ${quickChips.map(c => `<button class="search-chip" data-query="${c.query}" style="background: var(--bg-main); border: none; padding: 0.5rem 1rem; border-radius: 20px; font-size: 0.85rem; color: var(--text-primary); cursor: pointer;">${c.label}</button>`).join('')}
      </div>
    </div>
  `;

  let recentHTML = '';
  if (recent.length > 0) {
    recentHTML = `
      <div style="margin-bottom: 1.5rem;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem;">
          <div style="font-size: 0.9rem; font-weight: bold; color: var(--text-secondary);">${t('recent_searches') || 'عمليات البحث الأخيرة'}</div>
          <button id="clear-search-history" style="background: none; border: none; color: var(--accent); font-size: 0.8rem; cursor: pointer;">مسح</button>
        </div>
        <div style="display: flex; flex-wrap: wrap; gap: 0.5rem;">
          ${recent.map(item => `<button class="search-chip" data-query="${item}" style="background: rgba(217,138,68,0.1); border: 1px solid rgba(217,138,68,0.2); padding: 0.4rem 0.8rem; border-radius: 8px; font-size: 0.85rem; color: var(--text-primary); cursor: pointer;">${item}</button>`).join('')}
        </div>
      </div>
    `;
  }

  container.innerHTML = `
    <div style="padding: 0.5rem;">
      ${recentHTML}
      ${quickHTML}
    </div>
  `;

  // Add click listeners to chips
  container.querySelectorAll('.search-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      const q = chip.getAttribute('data-query');
      const input = modalElement.querySelector('#quran-search-modal-input');
      const clearBtn = modalElement.querySelector('#quran-search-clear-btn');
      if (input) {
        input.value = q;
        if (clearBtn) clearBtn.style.display = 'flex';
        performSearch(q);
      }
    });
  });

  const clearBtn = container.querySelector('#clear-search-history');
  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      clearRecentSearches();
      renderDefaultView();
    });
  }
}

async function performSearch(query) {
  const container = modalElement.querySelector('#quran-search-modal-results');
  if (!container) return;

  if (!query || !query.trim()) {
    renderDefaultView();
    return;
  }

  const trimmed = query.trim();
  container.innerHTML = `
    <div style="text-align: center; padding: 2.5rem; color: var(--text-secondary);">
      <div class="loading-spinner" style="margin-bottom: 0.5rem;"></div>
      <div>${t('loading')}</div>
    </div>
  `;

  try {
    if (!cachedQuranData) {
      cachedQuranData = await getQuranData(state.mushafEdition);
    }

    const searchResults = searchQuran(trimmed, cachedQuranData, { limit: 60 });
    addRecentSearch(trimmed);

    renderSearchResults(searchResults, trimmed);
  } catch (err) {
    container.innerHTML = `<div style="text-align:center; padding: 2rem; color: red;">${t('error_loading_quran')}</div>`;
  }
}

function renderSearchResults(results, query) {
  const container = modalElement.querySelector('#quran-search-modal-results');
  if (!container) return;

  const toArabicNumeral = (num) => num.toString().replace(/\d/g, d => '٠١٢٣٤٥٦٧٨٩'[d]);

  const totalResults = results.surahs.length + results.ayahs.length + results.shortcuts.length + results.juzPages.length;

  if (totalResults === 0) {
    let didYouMeanHTML = '';
    if (results.didYouMean && results.didYouMean.length > 0) {
      didYouMeanHTML = `
        <div class="did-you-mean-box">
          <div class="did-you-mean-title">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
            ${t('did_you_mean')}
          </div>
          <div class="search-chips-wrapper">
            ${results.didYouMean.map(s => `<button class="search-chip suggestion-chip" data-query="${s}">${s}</button>`).join('')}
          </div>
        </div>
      `;
    }

    container.innerHTML = `
      <div class="search-no-results">
        <div class="no-results-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line><line x1="8" y1="11" x2="14" y2="11"></line></svg>
        </div>
        <div class="no-results-title">${t('no_results_found')}</div>
        <div class="no-results-tip">${t('no_results_tip')}</div>
        ${didYouMeanHTML}
      </div>
    `;

    container.querySelectorAll('.suggestion-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        const q = chip.getAttribute('data-query');
        const input = modalElement.querySelector('#quran-search-modal-input');
        if (input) {
          input.value = q;
          performSearch(q);
        }
      });
    });
    return;
  }

  let html = '';

  // Suggestions bar if present (e.g. typos corrected)
  if (results.didYouMean && results.didYouMean.length > 0 && results.ayahs.length > 0) {
    html += `
      <div class="did-you-mean-bar">
        <span style="font-weight: bold; margin-left: 0.5rem;">${t('did_you_mean')}</span>
        ${results.didYouMean.map(s => `<button class="search-chip suggestion-chip-sm" data-query="${s}">${s}</button>`).join('')}
      </div>
    `;
  }

  // Famous Shortcuts Card
  if (results.shortcuts.length > 0) {
    results.shortcuts.forEach(sc => {
      html += `
        <div class="search-result-card shortcut-card" onclick="window.navigateFromSearch({surah: ${sc.surah}, ayah: ${sc.ayah}})" style="background: linear-gradient(to right, rgba(217, 138, 68, 0.1), transparent); border-right: 3px solid var(--accent); padding: 1rem; border-radius: 8px; margin-bottom: 0.75rem; cursor: pointer;">
          <div style="font-weight: bold; color: var(--text-primary); font-size: 1.1rem; margin-bottom: 0.25rem;">${sc.title}</div>
          <div style="color: var(--text-secondary); font-size: 0.85rem;">${sc.subtitle}</div>
        </div>
      `;
    });
  }

  // Juz & Page Cards
  if ((activeTab === 'all' || activeTab === 'juz_page') && results.juzPages.length > 0) {
    results.juzPages.forEach(jp => {
      const targetParam = jp.type === 'juz' ? `{juz: ${jp.number}}` : `{page: ${jp.number}}`;
      html += `
        <div class="search-result-card surah-result-card" onclick="window.navigateFromSearch(${targetParam})">
          <div class="result-card-header" style="display: flex; align-items: center; gap: 0.75rem;">
            <span class="ayah-end-svg" style="display: inline-flex; align-items: center; justify-content: center; position: relative; width: 36px; height: 36px; vertical-align: middle;">
              <svg viewBox="0 0 100 100" style="position: absolute; width: 100%; height: 100%; top: 0; left: 0;">
                <path d="M50 5 C60 5, 70 15, 80 20 C90 25, 95 40, 95 50 C95 60, 90 75, 80 80 C70 85, 60 95, 50 95 C40 95, 30 85, 20 80 C10 75, 5 60, 5 50 C5 40, 10 25, 20 20 C30 15, 40 5, 50 5 Z" fill="var(--bg-main)" stroke="var(--accent)" stroke-width="4"></path>
                <circle cx="50" cy="50" r="30" fill="none" stroke="var(--accent)" stroke-width="2" opacity="0.4" stroke-dasharray="3 3"></circle>
              </svg>
              <span style="position: relative; z-index: 1; font-size: 13px; font-family: var(--font-arabic); font-weight: bold; color: var(--accent); margin-top: 2px;">${toArabicNumeral(jp.number)}</span>
            </span>
            <div class="surah-result-titles">
              <div class="surah-result-ar">${jp.title}</div>
              <div class="surah-result-en">${jp.subtitle}</div>
            </div>
          </div>
        </div>
      `;
    });
  }

  // Surahs Section
  if (results.surahs.length > 0) {
    html += `<div style="font-weight: bold; font-size: 0.9rem; color: var(--text-muted); margin: 1rem 0 0.5rem 0;">السور</div>`;
    results.surahs.forEach(s => {
      const highlightedName = highlightMatches(s.name, query);
      html += `
        <div onclick="window.navigateFromSearch({surah: ${s.number}})" style="display: flex; align-items: center; justify-content: space-between; padding: 0.75rem; background: var(--bg-card); border-bottom: 1px solid var(--glass-border); cursor: pointer; border-radius: 8px; margin-bottom: 0.25rem;">
          <div style="display: flex; align-items: center; gap: 0.75rem;">
            <span class="ayah-end-svg" style="display: inline-flex; align-items: center; justify-content: center; position: relative; width: 36px; height: 36px; vertical-align: middle;">
              <svg viewBox="0 0 100 100" style="position: absolute; width: 100%; height: 100%; top: 0; left: 0;">
                <path d="M50 5 C60 5, 70 15, 80 20 C90 25, 95 40, 95 50 C95 60, 90 75, 80 80 C70 85, 60 95, 50 95 C40 95, 30 85, 20 80 C10 75, 5 60, 5 50 C5 40, 10 25, 20 20 C30 15, 40 5, 50 5 Z" fill="var(--bg-main)" stroke="var(--accent)" stroke-width="4"></path>
                <circle cx="50" cy="50" r="30" fill="none" stroke="var(--accent)" stroke-width="2" opacity="0.4" stroke-dasharray="3 3"></circle>
              </svg>
              <span style="position: relative; z-index: 1; font-size: 13px; font-family: var(--font-arabic); font-weight: bold; color: var(--accent); margin-top: 2px;">${toArabicNumeral(s.number)}</span>
            </span>
            <div>
              <div style="font-weight: bold; color: var(--text-primary); font-size: 1.1rem;">${highlightedName}</div>
              <div style="font-size: 0.75rem; color: var(--text-secondary);">${s.revelationType === 'Meccan' ? 'مكية' : 'مدنية'} • ${s.ayahs.length} آية</div>
            </div>
          </div>
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="var(--text-muted)" stroke-width="2"><polyline points="15 18 9 12 15 6"></polyline></svg>
        </div>
      `;
    });
  }

  // Ayahs Section
  if (results.ayahs.length > 0) {
    html += `<div style="font-weight: bold; font-size: 0.9rem; color: var(--text-muted); margin: 1rem 0 0.5rem 0;">الآيات</div>`;
    results.ayahs.forEach(a => {
      const highlightedText = highlightMatches(a.text, query);
      html += `
        <div onclick="window.navigateFromSearch({surah: ${a.surahNumber}, ayah: ${a.numberInSurah}})" style="padding: 1rem; background: var(--bg-card); border: 1px solid var(--glass-border); border-radius: 12px; margin-bottom: 0.75rem; cursor: pointer; transition: background 0.2s;">
          <div style="font-family: var(--font-arabic); font-size: 1.25rem; line-height: 1.8; color: var(--text-primary); text-align: right; margin-bottom: 0.75rem;">
            ${highlightedText}
          </div>
          <div style="display: flex; justify-content: space-between; align-items: center; font-size: 0.8rem; color: var(--text-secondary);">
            <div style="background: var(--bg-main); padding: 0.2rem 0.5rem; border-radius: 6px;">
              <span style="color: var(--accent); font-weight: bold;">${a.surahName}</span> • آية ${toArabicNumeral(a.numberInSurah)}
            </div>
            <div style="display: flex; align-items: center; gap: 0.25rem; color: var(--accent);">
              عرض <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"></polyline></svg>
            </div>
          </div>
        </div>
      `;
    });
  }

  container.innerHTML = html;

  // Add click listeners to did you mean chips
  container.querySelectorAll('.suggestion-chip-sm').forEach(chip => {
    chip.addEventListener('click', (e) => {
      e.stopPropagation();
      const q = chip.getAttribute('data-query');
      const input = modalElement.querySelector('#quran-search-modal-input');
      if (input) {
        input.value = q;
        performSearch(q);
      }
    });
  });
}

// Global Nav Handlers
window.navigateFromSearch = function(params) {
  closeSearchModal();
  if (navigateFn) {
    navigateFn('quran-reader', params);
  }
};

window.openSearchTafsir = function(surahName, surahNum, ayahNum, ayahText) {
  closeSearchModal();
  openTafsirModal({
    surahName,
    surah: surahNum,
    ayah: ayahNum,
    text: ayahText
  });
};
