import { SplashScreen } from './pages/Splash.js';
import { WelcomeScreen } from './pages/Welcome.js';
import { HomePage } from './pages/Home.js';
import { QuranListPage } from './pages/QuranList.js';
import { QuranReaderPage } from './pages/QuranReader.js';
import { QiblaPage } from './pages/Qibla.js';
import { TasbihPage } from './pages/Tasbih.js';
import { SettingsPage } from './pages/Settings.js';
import { AdhkarPage } from './pages/Adhkar.js';
import { HadithPage } from './pages/Hadith.js';
import { DuasPage } from './pages/Duas.js';
import { HifzTrackerPage } from './pages/HifzTracker.js';
import { WorshipTrackerPage } from './pages/WorshipTracker.js';
import { PrayerTimesPage } from './pages/PrayerTimes.js';
import { TafsirModal } from './components/TafsirModal.js';
import { initLanguage, t } from './utils/i18n.js';

// Simple State Management for routing and settings
export const state = {
  currentPage: localStorage.getItem('lastPageState') || 'home',
  currentQuranPage: (() => {
    try {
      const raw = localStorage.getItem('lastQuranPageState');
      if (raw && raw.startsWith('{')) return JSON.parse(raw);
      if (raw) return parseInt(raw) || 1;
    } catch(e) {}
    return 1;
  })(),
  theme: localStorage.getItem('theme') || 'light',
  colorTheme: localStorage.getItem('colorTheme') || 'muslimeen',
  // App font (Almarai by default) - separate from Quran font
  appFont: localStorage.getItem('appFont') || "'Almarai', 'Tajawal', sans-serif",
  // Quran font - stays Amiri by default
  quranFont: localStorage.getItem('quranFont') || "'KFGQPC Uthmanic Script HAFS', 'Amiri Quran', serif",
  quranFontSize: parseInt(localStorage.getItem('quranFontSize')) || 24,
  aiModel: localStorage.getItem('aiModel') || 'webspeech',
  colorHarakat: localStorage.getItem('colorHarakat') !== 'false',
  harakatColor: localStorage.getItem('harakatColor') || '#ef4444',
  colorAllah: localStorage.getItem('colorAllah') !== 'false',
  colorTajweed: localStorage.getItem('colorTajweed') !== 'false',
  wordByWordTranslation: localStorage.getItem('wordByWordTranslation') === 'true',
  copyBrackets: localStorage.getItem('copyBrackets') !== 'false',
  copyAyahStyle: localStorage.getItem('copyAyahStyle') || 'modern',
  copyTashkeel: localStorage.getItem('copyTashkeel') !== 'false',
  copyMetadata: localStorage.getItem('copyMetadata') !== 'false',
  language: localStorage.getItem('language') || 'ar',
  timeFormat: localStorage.getItem('timeFormat') || '12',
  dateFormat: localStorage.getItem('dateFormat') || 'gregorian',
  prayerNotifications: localStorage.getItem('prayerNotifications') === 'true',
  keepAwake: localStorage.getItem('keepAwake') === 'true',
  tafsirEdition: localStorage.getItem('tafsirEdition') || 'ar.saadi',
  calculationMethod: localStorage.getItem('calculationMethod') || 'UmmAlQura',
  madhab: localStorage.getItem('madhab') || 'Shafi',
  mushafEdition: localStorage.getItem('mushafEdition') || 'default',
  audioReciter: localStorage.getItem('audioReciter') || 'ar.alafasy'
};

// Parse URL parameters for direct deep-linking from Google / Social Shares
(function parseURLParameters() {
  try {
    const searchString = window.location.search || (window.location.hash.includes('?') ? window.location.hash.substring(window.location.hash.indexOf('?')) : '');
    const urlParams = new URLSearchParams(searchString);
    
    const surahParam = urlParams.get('surah');
    const ayahParam = urlParams.get('ayah');
    const juzParam = urlParams.get('juz');
    const pageParam = urlParams.get('page');
    const hadithParam = urlParams.get('hadith');
    const bookParam = urlParams.get('book');
    const hadithIdParam = urlParams.get('id') || urlParams.get('hadith_id');
    const searchQuery = urlParams.get('q') || urlParams.get('search');
    const adhkarParam = urlParams.get('adhkar');

    if (surahParam) {
      state.currentPage = 'quran-reader';
      state.currentQuranPage = {
        surah: parseInt(surahParam) || 1,
        ayah: ayahParam ? parseInt(ayahParam) : null
      };
    } else if (juzParam) {
      state.currentPage = 'quran-reader';
      state.currentQuranPage = { juz: parseInt(juzParam) || 1 };
    } else if (pageParam) {
      state.currentPage = 'quran-reader';
      state.currentQuranPage = { page: parseInt(pageParam) || 1 };
    } else if (hadithParam || bookParam) {
      state.currentPage = 'hadith';
      state.hadithParams = {
        book: bookParam || (isNaN(hadithParam) ? hadithParam : 'bukhari'),
        id: hadithIdParam || (!isNaN(hadithParam) ? hadithParam : null)
      };
    } else if (adhkarParam) {
      state.currentPage = 'adhkar';
      state.currentAdhkarType = adhkarParam;
    }

    if (searchQuery) {
      state.initialSearchQuery = searchQuery;
    }
  } catch (e) {}
})();

// Ensure we don't start on splash, welcome, or deprecated profile page
if (['splash', 'welcome', 'profile'].includes(state.currentPage)) {
  state.currentPage = 'home';
}

export let forceReRender = null;

export const openMobileSidebar = () => {
  const trigger = document.getElementById('global-menu-trigger');
  if (trigger) trigger.click();
};

export function App(rootElement) {
  // Initialize language first
  initLanguage(state.language);

  // Apply initial settings
  applyThemeSettings();

  rootElement.innerHTML = `
    <div id="global-dropdown-container"></div>
    <div id="image-theme-modal-container"></div>
    <main id="router-view" class="app-main-area" style="width: 100%;"></main>
    <div id="global-modals-container"></div>
  `;

  const routerView = document.getElementById('router-view');
  const dropdownContainer = document.getElementById('global-dropdown-container');
  const modalsContainer = document.getElementById('global-modals-container');

  modalsContainer.appendChild(TafsirModal());

  // Simple Router
  const render = () => {
    routerView.innerHTML = '';
    dropdownContainer.innerHTML = '';

    const hiddenPages = ['splash', 'welcome'];
    const showNav = !hiddenPages.includes(state.currentPage);

    if (showNav) {
      import('./components/DropdownMenu.js').then(module => {
        dropdownContainer.appendChild(module.DropdownMenu(navigate, state.currentPage));
      });
      rootElement.classList.add('has-nav');
    } else {
      rootElement.classList.remove('has-nav');
    }

    switch (state.currentPage) {
      case 'splash':
        routerView.appendChild(SplashScreen(navigate));
        break;
      case 'welcome':
        routerView.appendChild(WelcomeScreen(navigate));
        break;
      case 'home':
        routerView.appendChild(HomePage(navigate));
        break;
      case 'quran':
        routerView.appendChild(QuranListPage(navigate, state.quranListParams));
        state.quranListParams = null; // consume it
        break;
      case 'quran-reader':
        routerView.appendChild(QuranReaderPage(navigate, state.currentQuranPage, openMobileSidebar));
        break;
      case 'qibla':
        routerView.appendChild(QiblaPage(navigate));
        break;
      case 'tasbih':
        routerView.appendChild(TasbihPage(navigate));
        break;
      case 'adhkar':
        routerView.appendChild(AdhkarPage(navigate, state.currentAdhkarType || 'morning'));
        break;
      case 'duas':
        routerView.appendChild(DuasPage(navigate));
        break;
      case 'hadith':
        routerView.appendChild(HadithPage(navigate, state.hadithParams));
        state.hadithParams = null;
        break;
      case 'settings':
      case 'profile':
        routerView.appendChild(SettingsPage(navigate));
        break;
      case 'hifz-tracker':
        routerView.appendChild(HifzTrackerPage(navigate));
        break;
      case 'worship-tracker':
        routerView.appendChild(WorshipTrackerPage(navigate));
        break;
      case 'prayer-times':
        routerView.appendChild(PrayerTimesPage(navigate));
        break;
      default:
        routerView.innerHTML = `
          <div style="text-align:center; padding: 5rem;">
            <h1>404</h1>
            <p>${t('not_found')}</p>
            <button class="btn btn-primary" onclick="window.location.reload()">${t('back')}</button>
          </div>
        `;
    }

    if (state.initialSearchQuery) {
      const q = state.initialSearchQuery;
      state.initialSearchQuery = null;
      setTimeout(() => {
        import('./components/SearchModal.js').then(m => {
          m.openSearchModal(navigate, q);
        });
      }, 200);
    }
  };

  forceReRender = render;

  const navigate = (page, data = null) => {
    if (page === 'quran-reader' && data) {
      if (data.surah) {
        state.currentQuranPage = data;
        localStorage.setItem('lastQuranPageState', JSON.stringify(data));
      } else if (data.page) {
        state.currentQuranPage = data;
        localStorage.setItem('lastQuranPageState', JSON.stringify(data));
      } else if (data.juz) {
        state.currentQuranPage = data;
        localStorage.setItem('lastQuranPageState', JSON.stringify(data));
      } else if (typeof data === 'number') {
        state.currentQuranPage = data;
        localStorage.setItem('lastQuranPageState', data);
      }
    } else if (page === 'quran' && data) {
      state.quranListParams = data;
    } else if (page === 'adhkar' && data) {
      state.currentAdhkarType = data.type || (typeof data === 'string' ? data : 'morning');
    }
    state.currentPage = page === 'profile' ? 'settings' : page;
    localStorage.setItem('lastPageState', state.currentPage);
    render();
  };

  // Global Keyboard Shortcut (Ctrl+K or Cmd+K) for Quran Search
  window.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      import('./components/SearchModal.js').then(m => {
        m.openSearchModal(navigate);
      });
    }
  });

  // Initial render
  render();
}

// Helper: Apply all theme settings to DOM
export function applyThemeSettings() {
  // App font (Almarai for UI)
  document.documentElement.style.setProperty('--font-arabic', state.appFont);
  document.documentElement.style.setProperty('--font-english', state.appFont);
  // Quran font stays separate
  document.documentElement.style.setProperty('--quran-font', state.quranFont);
  document.documentElement.style.setProperty('--quran-font-size', (state.quranFontSize || 24) + 'px');
  document.documentElement.style.setProperty('--harakat-color', state.harakatColor || '#ef4444');
  // Theme color
  document.documentElement.setAttribute('data-theme', state.colorTheme);
  // Dark/light
  if (state.theme === 'dark') {
    document.documentElement.classList.add('dark-mode');
  } else {
    document.documentElement.classList.remove('dark-mode');
  }
}
