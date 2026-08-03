import { t } from '../utils/i18n.js';
import { getQuranData } from '../utils/quranData.js';
import { state } from '../app.js';
import { searchQuran, highlightMatches } from '../utils/quranSearch.js';
import { openSearchModal } from '../components/SearchModal.js';

export function QuranListPage(navigate, params = null) {
  const container = document.createElement('div');
  container.className = 'quran-list-page';

  const toArabicNumeral = (num) => num.toString().replace(/\d/g, d => '٠١٢٣٤٥٦٧٨٩'[d]);

  // App Bar
  const appBar = `
    <div class="app-bar">
      <div class="app-bar-icon" onclick="window.navigateHome()">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
      </div>
      <div class="app-title" style="display: flex; align-items: center; gap: 0.5rem;">
        <img src="/logo.png" alt="Warteel" class="app-header-logo" style="height: 32px;" />
        <span>${t('nav_quran')}</span>
      </div>
      <div class="app-bar-icon" id="search-surah-btn" style="cursor: pointer;" title="${t('search_quran')}">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
      </div>
    </div>
  `;

  // Search Bar
  const searchBar = `
    <div class="search-bar-container" style="display: none; padding: 0 1rem 1rem 1rem; max-width: var(--page-max-width, 100%); margin: 0 auto;">
      <input type="text" id="surah-search-input" placeholder="${t('search_placeholder')}" style="width: 100%; padding: 0.8rem 1rem; border-radius: 8px; border: 1px solid var(--glass-border); background: var(--bg-card); color: var(--text-primary); font-family: var(--font-arabic); font-size: 1rem; outline: none; box-shadow: var(--shadow-sm);">
    </div>
  `;

  // Last Read Card
  let lastReadCard = '';
  const savedBookmark = JSON.parse(localStorage.getItem('quranBookmark') || 'null');
  
  if (savedBookmark) {
    lastReadCard = `
      <div class="last-read-banner" onclick="window.navigateQuranReaderBookmark()" id="dynamic-last-read">
        <div class="last-read-content">
          <div class="last-read-subtitle">${t('last_read')}</div>
          <div class="last-read-title" id="last-read-surah-title">${document.documentElement.lang === 'ar' ? 'سورة ' : 'Surah '}${savedBookmark.surah}</div>
          <div class="last-read-desc">${t('ayah_no')} ${document.documentElement.lang === 'ar' ? toArabicNumeral(savedBookmark.ayah || 1) : (savedBookmark.ayah || 1)}</div>
        </div>
        <div class="last-read-illustration">
          <svg viewBox="0 0 100 100" fill="none">
            <path d="M20 70 L50 80 L80 70 L80 40 L50 50 L20 40 Z" fill="var(--primary)" opacity="0.8"/>
            <path d="M20 40 L50 50 L80 40 L50 30 Z" fill="var(--bg-card)"/>
            <path d="M50 30 L50 50" stroke="var(--text-primary)" stroke-width="2"/>
          </svg>
        </div>
      </div>
    `;
  }

  let currentTab = params?.tab || 'surah';
  
  const tabs = `
    <div class="quran-tabs">
      <div class="quran-tab ${currentTab === 'surah' ? 'active' : ''}" data-tab="surah">${t('surah')}</div>
      <div class="quran-tab ${currentTab === 'juz' ? 'active' : ''}" data-tab="juz">${t('juz')}</div>
      <div class="quran-tab ${currentTab === 'page' ? 'active' : ''}" data-tab="page">${t('page')}</div>
    </div>
  `;

  container.innerHTML = `
    ${appBar}
    ${searchBar}
    ${lastReadCard}
    ${tabs}
    <div class="surahs-list" id="surahs-list-container">
      <div style="text-align:center; padding: 2rem;">${t('loading')}</div>
    </div>
  `;

  let cachedQuranData = null;

  const renderList = (searchQuery = '') => {
    if (!cachedQuranData) return;
    const listContainer = container.querySelector('#surahs-list-container');
    const query = searchQuery.trim();
    
    if (query) {
      const searchRes = searchQuran(query, cachedQuranData, { limit: 40 });
      let html = '';

      if (searchRes.didYouMean && searchRes.didYouMean.length > 0 && searchRes.ayahs.length === 0 && searchRes.surahs.length === 0) {
        html += `
          <div class="did-you-mean-box" style="margin-bottom: 1rem;">
            <div class="did-you-mean-title">${t('did_you_mean')}</div>
            <div class="search-chips-wrapper">
              ${searchRes.didYouMean.map(s => `<button class="search-chip inline-suggestion-chip" data-query="${s}">${s}</button>`).join('')}
            </div>
          </div>
        `;
      }

      if (searchRes.surahs.length > 0) {
        html += `<div style="font-weight:bold; color:var(--accent); margin:0.5rem 0;">${t('tab_surahs')} (${searchRes.surahs.length})</div>`;
        html += searchRes.surahs.map(s => `
          <div class="surah-item" onclick="window.navigateQuranReader({surah: ${s.number}})">
            <div class="surah-number-wrapper">
              <span class="ayah-end-svg" style="display: inline-flex; align-items: center; justify-content: center; position: relative; width: 42px; height: 42px; vertical-align: middle;">
                <svg viewBox="0 0 100 100" style="position: absolute; width: 100%; height: 100%; top: 0; left: 0;">
                  <path d="M50 5 C60 5, 70 15, 80 20 C90 25, 95 40, 95 50 C95 60, 90 75, 80 80 C70 85, 60 95, 50 95 C40 95, 30 85, 20 80 C10 75, 5 60, 5 50 C5 40, 10 25, 20 20 C30 15, 40 5, 50 5 Z" fill="var(--bg-main)" stroke="var(--accent)" stroke-width="4"></path>
                </svg>
                <span class="surah-number" style="position: relative; z-index: 1; font-size: 14px; font-family: var(--font-arabic); font-weight: bold; color: var(--accent); margin-top: 2px;">${toArabicNumeral(s.number)}</span>
              </span>
            </div>
            <div class="surah-info">
              <div class="surah-name-en">${s.englishName}</div>
              <div class="surah-meta">${s.revelationType === 'Meccan' ? 'مكية' : 'مدنية'} • ${toArabicNumeral(s.ayahs.length)} ${t('ayah')}</div>
            </div>
            <div class="surah-name-ar">${highlightMatches(s.name, query)}</div>
          </div>
        `).join('');
      }

      if (searchRes.ayahs.length > 0) {
        html += `<div style="font-weight:bold; color:var(--accent); margin:1rem 0 0.5rem 0;">${t('tab_ayahs')} (${searchRes.ayahs.length})</div>`;
        html += searchRes.ayahs.map(a => `
          <div class="search-result-card ayah-result-card" onclick="window.navigateQuranReader({surah: ${a.surahNumber}, ayah: ${a.numberInSurah}})">
            <div class="ayah-result-top">
              <div class="ayah-surah-tag">
                <span class="surah-tag-name">${a.surahName}</span>
                <span class="ayah-tag-no">آية ${toArabicNumeral(a.numberInSurah)}</span>
              </div>
              <div class="ayah-location-meta">جزء ${toArabicNumeral(a.juz)} • صفحة ${toArabicNumeral(a.page)}</div>
            </div>
            <div class="ayah-result-text">${highlightMatches(a.text, query)}</div>
          </div>
        `).join('');
      }

      listContainer.innerHTML = html || `<div style="text-align:center; padding: 2rem;">${t('no_results_found')}</div>`;

      listContainer.querySelectorAll('.inline-suggestion-chip').forEach(chip => {
        chip.addEventListener('click', () => {
          const q = chip.getAttribute('data-query');
          const input = container.querySelector('#surah-search-input');
          if (input) {
            input.value = q;
            renderList(q);
          }
        });
      });
      return;
    }
    
    if (currentTab === 'surah') {
      const html = cachedQuranData.surahs.map(s => {
        let isActive = params && params.tab === 'surah' && params.target === s.number;
        let activeStyle = isActive ? 'background: var(--accent-bg); border-color: var(--accent);' : '';
        return `
        <div class="surah-item" style="${activeStyle}" id="surah-item-${s.number}" onclick="window.navigateQuranReader({surah: ${s.number}})">
          <div class="surah-number-wrapper">
            <span class="ayah-end-svg" style="display: inline-flex; align-items: center; justify-content: center; position: relative; width: 42px; height: 42px; vertical-align: middle;">
              <svg viewBox="0 0 100 100" style="position: absolute; width: 100%; height: 100%; top: 0; left: 0;">
                <path d="M50 5 C60 5, 70 15, 80 20 C90 25, 95 40, 95 50 C95 60, 90 75, 80 80 C70 85, 60 95, 50 95 C40 95, 30 85, 20 80 C10 75, 5 60, 5 50 C5 40, 10 25, 20 20 C30 15, 40 5, 50 5 Z" fill="var(--bg-main)" stroke="var(--accent)" stroke-width="4"></path>
              </svg>
              <span class="surah-number" style="position: relative; z-index: 1; font-size: 14px; font-family: var(--font-arabic); font-weight: bold; color: var(--accent); margin-top: 2px;">${toArabicNumeral(s.number)}</span>
            </span>
          </div>
          <div class="surah-info">
            <div class="surah-name-en">${s.englishName}</div>
            <div class="surah-meta">${s.revelationType === 'Meccan' ? 'مكية' : 'مدنية'} • ${toArabicNumeral(s.ayahs.length)} ${t('ayah')}</div>
          </div>
          <div class="surah-name-ar">${s.name}</div>
        </div>
      `}).join('');
      listContainer.innerHTML = html;
    } else if (currentTab === 'juz') {
      let html = '';
      for (let i = 1; i <= 30; i++) {
        let isActive = params && params.tab === 'juz' && params.target === i;
        let activeStyle = isActive ? 'background: var(--accent-bg); border-color: var(--accent);' : '';
        html += `
          <div class="surah-item" style="${activeStyle}" id="juz-item-${i}" onclick="window.navigateQuranReader({juz: ${i}})">
            <div class="surah-number-wrapper">
              <span class="ayah-end-svg" style="display: inline-flex; align-items: center; justify-content: center; position: relative; width: 42px; height: 42px; vertical-align: middle;">
                <svg viewBox="0 0 100 100" style="position: absolute; width: 100%; height: 100%; top: 0; left: 0;">
                  <path d="M50 5 C60 5, 70 15, 80 20 C90 25, 95 40, 95 50 C95 60, 90 75, 80 80 C70 85, 60 95, 50 95 C40 95, 30 85, 20 20 C30 15, 40 5, 50 5 Z" fill="var(--bg-main)" stroke="var(--accent)" stroke-width="4"></path>

                </svg>
                <span class="surah-number" style="position: relative; z-index: 1; font-size: 14px; font-family: var(--font-arabic); font-weight: bold; color: var(--accent); margin-top: 2px;">${toArabicNumeral(i)}</span>
              </span>
            </div>
            <div class="surah-info">
              <div class="surah-name-en">Juz ${i}</div>
              <div class="surah-meta">الجزء ${toArabicNumeral(i)}</div>
            </div>
            <div class="surah-name-ar">الجزء ${toArabicNumeral(i)}</div>
          </div>
        `;
      }
      listContainer.innerHTML = html;
    } else if (currentTab === 'page') {
      let html = '';
      for (let i = 1; i <= 604; i++) {
        let isActive = params && params.tab === 'page' && params.target === i;
        let activeStyle = isActive ? 'background: var(--accent-bg); border-color: var(--accent);' : '';
        html += `
          <div class="surah-item" style="${activeStyle}" id="page-item-${i}" onclick="window.navigateQuranReader({page: ${i}})">
            <div class="surah-number-wrapper">
              <span class="ayah-end-svg" style="display: inline-flex; align-items: center; justify-content: center; position: relative; width: 42px; height: 42px; vertical-align: middle;">
                <svg viewBox="0 0 100 100" style="position: absolute; width: 100%; height: 100%; top: 0; left: 0;">
                  <path d="M50 5 C60 5, 70 15, 80 20 C90 25, 95 40, 95 50 C95 60, 90 75, 80 80 C70 85, 60 95, 50 95 C40 95, 30 85, 20 20 C30 15, 40 5, 50 5 Z" fill="var(--bg-main)" stroke="var(--accent)" stroke-width="4"></path>

                </svg>
                <span class="surah-number" style="position: relative; z-index: 1; font-size: 14px; font-family: var(--font-arabic); font-weight: bold; color: var(--accent); margin-top: 2px;">${toArabicNumeral(i)}</span>
              </span>
            </div>
            <div class="surah-info">
              <div class="surah-name-en">Page ${i}</div>
              <div class="surah-meta">الصفحة ${toArabicNumeral(i)}</div>
            </div>
            <div class="surah-name-ar">الصفحة ${toArabicNumeral(i)}</div>
          </div>
        `;
      }
      listContainer.innerHTML = html;
    }

    if (params && params.target) {
      setTimeout(() => {
        let el = null;
        if (currentTab === 'juz') el = listContainer.querySelector('#juz-item-' + params.target);
        else if (currentTab === 'page') el = listContainer.querySelector('#page-item-' + params.target);
        else if (currentTab === 'surah') el = listContainer.querySelector('#surah-item-' + params.target);
        
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        params = null; // clear params after first render scroll so tab switching doesn't scroll
      }, 50);
    }
  };

  const loadData = async () => {
    try {
      cachedQuranData = await getQuranData(state.mushafEdition);
      renderList();
      
      if (savedBookmark) {
        const bookmarkedSurah = cachedQuranData.surahs.find(s => s.number == savedBookmark.surah);
        if (bookmarkedSurah) {
          const titleEl = container.querySelector('#last-read-surah-title');
          if (titleEl) {
            const isAr = document.documentElement.lang === 'ar';
            titleEl.textContent = isAr ? `سورة ${bookmarkedSurah.name}` : `Surah ${bookmarkedSurah.englishName}`;
          }
        }
      }
      
    } catch (error) {
      container.querySelector('#surahs-list-container').innerHTML = 
        `<p style="text-align:center; color:red;">${t('error_loading_quran')}</p>`;
    }
  };

  loadData();

  // Tab click listeners & Search modal trigger
  setTimeout(() => {
    const tabEls = container.querySelectorAll('.quran-tab');
    const searchInput = container.querySelector('#surah-search-input');
    
    tabEls.forEach(tab => {
      tab.addEventListener('click', (e) => {
        tabEls.forEach(t => t.classList.remove('active'));
        e.target.classList.add('active');
        currentTab = e.target.getAttribute('data-tab');
        renderList(searchInput ? searchInput.value : '');
      });
    });

    const searchBtn = container.querySelector('#search-surah-btn');
    
    if (searchBtn) {
      searchBtn.addEventListener('click', () => {
        openSearchModal(navigate);
      });
    }

    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        renderList(e.target.value);
      });
    }
  }, 0);

  // Attach a global helper to navigate
  window.navigateQuranReader = (params) => {
    navigate('quran-reader', params);
  };
  
  window.navigateQuranReaderBookmark = () => {
    if (savedBookmark && savedBookmark.surah) {
      navigate('quran-reader', { surah: savedBookmark.surah });
    } else {
      navigate('quran-reader', { surah: 1 });
    }
  };

  window.navigateHome = () => {
    navigate('home');
  };

  return container;
}
