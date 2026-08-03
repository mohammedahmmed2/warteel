import { t } from '../utils/i18n.js';
import { getUserLocation, calculatePrayerTimes, getTimeRemaining } from '../utils/prayerTimes.js';
import { state } from '../app.js';
import { openSearchModal } from '../components/SearchModal.js';
import { openQuickSettingsModal } from '../components/QuickSettingsModal.js';

export function HomePage(navigate) {
  const container = document.createElement('div');
  container.className = 'home-page';
  
  // App Bar
  const appBar = `
    <div class="app-bar" style="justify-content: flex-end; gap: 1rem;">
      <div class="app-title" style="margin-right: auto;">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path><circle cx="15" cy="8" r="1" fill="currentColor"/></svg>
        ${t('app_title')}
      </div>
      <div class="boxed-icon-btn" id="home-search-btn" title="${t('search_quran')}">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
      </div>
      <div class="boxed-icon-btn" id="home-quick-settings-btn" title="المظهر والخطوط">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="13.5" cy="6.5" r=".5" fill="currentColor"/><circle cx="17.5" cy="10.5" r=".5" fill="currentColor"/><circle cx="8.5" cy="7.5" r=".5" fill="currentColor"/><circle cx="6.5" cy="12.5" r=".5" fill="currentColor"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"/></svg>
      </div>
      <!-- Empty space for global dropdown button to sit without overlapping -->
      <div style="width: 44px; height: 44px;"></div>
    </div>
  `;

  // Get formatted date
  const today = new Date();
  const gregOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  const hijriOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', calendar: 'islamic-umalqura' };
  
  const greg = new Intl.DateTimeFormat(state.language === 'en' ? 'en-US' : 'ar-EG', gregOptions).format(today);
  const hijri = new Intl.DateTimeFormat(state.language === 'en' ? 'en-US-u-ca-islamic-umalqura' : 'ar-SA-u-ca-islamic-umalqura', hijriOptions).format(today);
  
  let dateText = '';
  if (state.dateFormat === 'hijri') {
    dateText = `
      <div style="display: flex; justify-content: center; align-items: center; gap: 0.75rem; flex-wrap: wrap;">
        <span style="font-weight: bold; opacity: 1;">${hijri}</span>
        <span style="opacity: 0.4; font-size: 0.9em;">|</span>
        <span style="font-size: 0.95em; opacity: 0.7; font-weight: normal;">${greg}</span>
      </div>
    `;
  } else {
    // gregorian is default
    dateText = `
      <div style="display: flex; justify-content: center; align-items: center; gap: 0.75rem; flex-wrap: wrap;">
        <span style="font-size: 0.95em; opacity: 0.7; font-weight: normal;">${hijri}</span>
        <span style="opacity: 0.4; font-size: 0.9em;">|</span>
        <span style="font-weight: bold; opacity: 1;">${greg}</span>
      </div>
    `;
  }

  // Hero Card Wrapper
  const heroWrapper = document.createElement('div');
  heroWrapper.innerHTML = `
    <div style="text-align: center; margin-bottom: 1rem; font-family: var(--font-arabic); font-weight: bold; color: var(--text-primary); line-height: 1.4;">
      ${dateText}
    </div>
    <div class="hero-card" style="display: flex; justify-content: center; align-items: center; min-height: 150px;">
        <span class="loading-spinner">Loading Prayer Times...</span>
    </div>
  `;

  // Features
  const featuresHeader = `
    <div class="section-header">
      <div class="section-title">${t('top_features')}</div>
      <div class="section-action">${t('see_more')}</div>
    </div>
  `;

  const features = [
    { id: 'tasbih', label: t('tasbih'), icon: '<circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/>' },
    { id: 'adhkar', label: t('adhkar'), icon: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>' },
    { id: 'qibla', label: t('feature_qibla'), icon: '<circle cx="12" cy="12" r="10"/><path d="M16.24 7.76l-2.12 6.36-6.36 2.12 2.12-6.36 6.36-2.12z"/>' },
    { id: 'hadith', label: t('hadith'), icon: '<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>' }
  ];

  const featuresHTML = features.map(f => `
    <div class="feature-item" data-target="${f.id}" style="cursor:pointer;">
      <div class="feature-icon-wrapper">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${f.icon}</svg>
      </div>
      <div class="feature-label">${f.label}</div>
    </div>
  `).join('');

  const featuresSection = document.createElement('div');
  featuresSection.innerHTML = `
    ${featuresHeader}
    <div class="features-scroll">
      ${featuresHTML}
    </div>
  `;

  // Daily Activity
  const activityHeader = `
    <div class="section-header">
      <div class="section-title">${t('daily_activity')}</div>
      <div class="section-action" style="display:flex; align-items:center; gap:0.25rem;">
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
        ${t('add_activity')}
      </div>
    </div>
  `;

  const activitySection = document.createElement('div');
  activitySection.className = 'activity-section';
  activitySection.innerHTML = `
    ${activityHeader}
    <div id="dynamic-activity-container">
       <div style="text-align:center; padding: 20px; color: var(--text-muted); font-size: 0.9rem;">جاري تحديث الأذكار...</div>
    </div>
  `;

  // Continue Reading Section
  const getBookmarkInfo = () => {
    try {
      const detailStr = localStorage.getItem('quranBookmarkDetail');
      if (detailStr) return JSON.parse(detailStr);
    } catch (e) {}
    return null;
  };
  
  const bookmark = getBookmarkInfo();
  const continueReadingSection = document.createElement('div');
  continueReadingSection.className = 'continue-reading-container';
  if (bookmark) {
    continueReadingSection.innerHTML = `
      <div class="continue-reading-card" style="margin: 0 1.5rem 1.5rem 1.5rem; background: linear-gradient(135deg, var(--bg-card) 0%, rgba(217, 138, 68, 0.1) 100%); border: 1px solid var(--accent); border-radius: var(--radius-lg); padding: 1.25rem; display: flex; align-items: center; justify-content: space-between; cursor: pointer; box-shadow: var(--shadow-sm); transition: transform 0.2s ease;">
        <div style="display: flex; align-items: center; gap: 1rem;">
          <div style="width: 45px; height: 45px; border-radius: 50%; background: var(--accent); display: flex; align-items: center; justify-content: center; color: white;">
            <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>
          </div>
          <div>
            <div style="font-family: var(--font-arabic); font-weight: bold; color: var(--text-primary); font-size: 1.1rem; margin-bottom: 0.2rem;">تابع القراءة</div>
            <div style="font-family: var(--font-arabic); font-size: 0.9rem; color: var(--text-secondary); opacity: 0.9;">
              ${bookmark.surahName} • آية ${bookmark.ayah}
            </div>
          </div>
        </div>
        <div style="transform: ${state.language === 'en' ? 'rotate(0)' : 'rotate(180deg)'}; color: var(--accent);">
          <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 16 16 12 12 8"></polyline><line x1="8" y1="12" x2="16" y2="12"></line></svg>
        </div>
      </div>
    `;
    
    setTimeout(() => {
      const card = continueReadingSection.querySelector('.continue-reading-card');
      if (card) {
        card.addEventListener('click', () => {
          navigate('quran-reader', { surah: bookmark.surah, ayah: bookmark.ayah });
        });
      }
    }, 0);
  }

  // Assemble page
  const appBarContainer = document.createElement('div');
  appBarContainer.className = 'app-bar-container';
  appBarContainer.innerHTML = appBar;
  heroWrapper.className = 'hero-wrapper';
  featuresSection.className = 'features-section';
  container.appendChild(appBarContainer);
  container.appendChild(heroWrapper);
  if (bookmark) {
    container.appendChild(continueReadingSection);
  }
  container.appendChild(activitySection);
  container.appendChild(featuresSection);

  // Search and Settings Events
  setTimeout(() => {
    const homeSearchBtn = container.querySelector('#home-search-btn');
    if (homeSearchBtn) {
      homeSearchBtn.addEventListener('click', () => {
        openSearchModal(navigate);
      });
    }

    const homeSettingsBtn = container.querySelector('#home-quick-settings-btn');
    if (homeSettingsBtn) {
      homeSettingsBtn.addEventListener('click', () => {
        openQuickSettingsModal();
      });
    }
  }, 0);

  // Dynamic Prayer Times Logic
  let countdownInterval = null;

  const formatTimeStr = (dateObj) => {
    if (!dateObj || typeof dateObj.getTime !== 'function' || isNaN(dateObj.getTime())) return "--:--";
    let hours = dateObj.getHours();
    let minutes = dateObj.getMinutes();
    if (state.timeFormat === '12') {
        const ampm = hours >= 12 ? 'م' : 'ص';
        hours = hours % 12;
        hours = hours ? hours : 12;
        return `${hours}:${minutes.toString().padStart(2, '0')} ${ampm}`;
    }
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  };

  async function initPrayerTimes() {
      try {
          const loc = await getUserLocation();
          
          const updateTimes = () => {
              const times = calculatePrayerTimes(loc.lat, loc.lng, new Date(), state.timeFormat);
              
              let nextPrayerKey = times.nextPrayer;
              let nextPrayerTime = null;
              let nextPrayerName = 'None';
              
              if (nextPrayerKey !== 'none' && times[nextPrayerKey]) {
                  nextPrayerTime = times[nextPrayerKey].date;
                  nextPrayerName = times[nextPrayerKey].name;
              } else {
                  const tomorrow = new Date();
                  tomorrow.setDate(tomorrow.getDate() + 1);
                  const tomorrowTimes = calculatePrayerTimes(loc.lat, loc.lng, tomorrow, state.timeFormat);
                  nextPrayerTime = tomorrowTimes.fajr.date;
                  nextPrayerName = tomorrowTimes.fajr.name;
                  nextPrayerKey = 'fajr';
              }

              const timeRem = getTimeRemaining(nextPrayerTime, state.language);
              
              const buildPrayerItem = (prayerObj) => {
                  const isActive = nextPrayerKey === prayerObj.id;
                  const icon = prayerObj.id === 'fajr' ? '<path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"></path>' :
                               prayerObj.id === 'sunrise' ? '<path d="M17 18a5 5 0 0 0-10 0"></path><line x1="12" y1="2" x2="12" y2="9"></line><line x1="4.22" y1="10.22" x2="5.64" y2="11.64"></line><line x1="1" y1="18" x2="3" y2="18"></line><line x1="21" y1="18" x2="23" y2="18"></line><line x1="18.36" y1="11.64" x2="19.78" y2="10.22"></line><line x1="23" y1="22" x2="1" y2="22"></line><polyline points="8 6 12 2 16 6"></polyline>' :
                               (prayerObj.id === 'dhuhr' || prayerObj.id === 'asr') ? '<circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>' :
                               '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>';

                  return `
                    <div class="prayer-item ${isActive ? 'active' : ''}">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">${icon}</svg>
                      <div class="prayer-name">${t(prayerObj.id)}</div>
                      <div class="prayer-time">${prayerObj.time}</div>
                    </div>
                  `;
              };

              heroWrapper.innerHTML = `
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; padding: 0 0.5rem;">
                  <div style="font-family: var(--font-arabic); font-weight: bold; color: var(--text-primary); line-height: 1.4;">
                    ${dateText}
                  </div>
                  <div class="section-action" id="show-more-prayers" style="cursor:pointer; display:flex; align-items:center; gap:0.25rem; font-size: 0.9rem; font-weight: 600; color: var(--primary);">
                    ${t('see_more') || 'عرض المزيد'}
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"></polyline></svg>
                  </div>
                </div>
                <div class="hero-card" style="position: relative; overflow: hidden; padding: 1.5rem; display: flex; flex-direction: column; min-height: 140px; justify-content: center;">
                  
                  <!-- Mosque Illustration Vector (Background Right) -->
                  <svg class="hero-illustration" viewBox="0 0 200 120" style="height: 110%; z-index: 1; opacity: 0.95; pointer-events: none;" preserveAspectRatio="xMaxYMax meet">
                     <!-- Background Domes -->
                     <path d="M110 85 C110 70, 140 70, 140 85 Z" fill="var(--text-muted)" />
                     <path d="M150 85 C150 75, 170 75, 170 85 Z" fill="var(--text-muted)" />
                     <path d="M110 85 C110 65, 160 65, 160 85 Z" fill="var(--bg-card)" />
                     
                     <!-- Base Building -->
                     <rect x="110" y="85" width="50" height="40" fill="var(--bg-card)" />
                     <rect x="160" y="85" width="20" height="35" fill="var(--bg-main)" />
                     <rect x="90" y="85" width="20" height="35" fill="var(--bg-main)" />
                     
                     <!-- Doors / Arches -->
                     <path d="M125 125 L125 100 A10 10 0 0 1 145 100 L145 125 Z" fill="var(--text-primary)" />
                     <path d="M165 125 L165 105 A5 5 0 0 1 175 105 L175 125 Z" fill="var(--text-primary)" />
                     
                     <!-- Minarets -->
                     <rect x="95" y="40" width="6" height="80" fill="var(--bg-main)" />
                     <polygon points="93,40 103,40 98,25" fill="var(--primary)" />
                     
                     <rect x="180" y="50" width="6" height="70" fill="var(--text-muted)" />
                     <polygon points="178,50 188,50 183,35" fill="var(--primary)" />

                     <!-- Crescent -->
                     <path d="M140 45 A8 8 0 1 0 148 37 A10 10 0 1 1 140 45 Z" fill="var(--primary)" />
                     <!-- Stars -->
                     <circle cx="160" cy="30" r="1.5" fill="var(--primary)" opacity="0.8" />
                     <circle cx="130" cy="20" r="1" fill="var(--primary)" opacity="0.6" />
                     <circle cx="180" cy="25" r="2" fill="var(--primary)" opacity="0.7" />
                  </svg>
                  
                  <div class="hero-content" style="position: relative; z-index: 2; display: flex; flex-direction: column; align-items: flex-start; text-align: right;">
                    <div style="font-size: 0.9rem; opacity: 0.9; margin-bottom: 0.5rem; font-weight: 500;">
                      ${t('home_next_salah')}
                    </div>
                    <div style="font-family: var(--font-english); font-size: 2.8rem; font-weight: 800; line-height: 1; margin-bottom: 0.5rem; text-shadow: 0 2px 4px rgba(0,0,0,0.1); display: flex; align-items: flex-end; gap: 0.5rem; direction: ltr;">
                      <span style="direction: ltr; unicode-bidi: embed;">${nextPrayerTime ? formatTimeStr(nextPrayerTime).replace(/ (ص|م)/, '') : '--:--'}</span>
                      <span style="font-size: 1.2rem; font-weight: 500; opacity: 0.9; margin-bottom: 0.4rem;">${nextPrayerTime ? formatTimeStr(nextPrayerTime).includes('ص') ? 'ص' : (formatTimeStr(nextPrayerTime).includes('م') ? 'م' : '') : ''}</span>
                    </div>
                    <div style="font-size: 0.95rem; opacity: 0.9; font-weight: 500; display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap;">
                      <span>${state.language === 'ar' ? 'متبقي على' : 'Remaining for'} ${t(nextPrayerKey) || nextPrayerName}</span>
                      <span id="prayer-countdown" style="font-family: var(--font-english); display:inline-block; direction:ltr; font-weight: bold; background: rgba(0,0,0,0.05); padding: 2px 8px; border-radius: 4px;">${timeRem}</span>
                    </div>
                  </div>
                </div>
                
                <div class="prayer-times-row">
                  ${buildPrayerItem(times.fajr)}
                  ${buildPrayerItem(times.sunrise)}
                  ${buildPrayerItem(times.dhuhr)}
                  ${buildPrayerItem(times.asr)}
                  ${buildPrayerItem(times.maghrib)}
                  ${buildPrayerItem(times.isha)}
                </div>
              `;

              // Determine Dynamic Adhkar
              const now = new Date();
              let recommendedAdhkar = 'morning';
              let adhkarTitle = 'أذكار الصباح';
              let adhkarDesc = 'ابدأ يومك بذكر الله لحفظك وتوفيقك';
              let adhkarIcon = '<circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/>';

              let isPostPrayer = false;
              const prayerKeys = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];
              for (const p of prayerKeys) {
                 if (times[p] && times[p].date && typeof times[p].date.getTime === 'function') {
                     const diff = now.getTime() - times[p].date.getTime();
                     if (diff >= 0 && diff <= 45 * 60 * 1000) {
                         isPostPrayer = true;
                         break;
                     }
                 }
              }

              if (isPostPrayer) {
                  recommendedAdhkar = 'post_prayer';
                  adhkarTitle = 'أذكار بعد الصلاة';
                  adhkarDesc = 'أذكار ما بعد السلام من الصلاة المكتوبة';
                  adhkarIcon = '<circle cx="12" cy="12" r="10"/><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>';
              } else if (times.fajr.date && times.dhuhr.date && now >= times.fajr.date && now < times.dhuhr.date) {
                  recommendedAdhkar = 'morning';
                  adhkarTitle = 'أذكار الصباح';
                  adhkarDesc = 'ابدأ يومك بذكر الله لحفظك وتوفيقك';
                  adhkarIcon = '<circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/>';
              } else if (times.asr.date && times.isha.date && now >= times.asr.date && now < times.isha.date) {
                  recommendedAdhkar = 'evening';
                  adhkarTitle = 'أذكار المساء';
                  adhkarDesc = 'اختم نهارك بذكر الله حصناً لك';
                  adhkarIcon = '<path d="M17 18a5 5 0 0 0-10 0"></path><line x1="12" y1="2" x2="12" y2="9"></line><line x1="4.22" y1="10.22" x2="5.64" y2="11.64"></line><line x1="1" y1="18" x2="3" y2="18"></line><line x1="21" y1="18" x2="23" y2="18"></line><line x1="18.36" y1="11.64" x2="19.78" y2="10.22"></line><line x1="23" y1="22" x2="1" y2="22"></line><polyline points="8 6 12 2 16 6"></polyline>';
              } else if ((times.isha.date && now >= times.isha.date) || (times.fajr.date && now < times.fajr.date)) {
                  recommendedAdhkar = 'sleep';
                  adhkarTitle = 'أذكار النوم';
                  adhkarDesc = 'سنن وأذكار ما قبل النوم';
                  adhkarIcon = '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>';
              }

              const dynContainer = container.querySelector('#dynamic-activity-container');
              if (dynContainer) {
                  const srsDataStr = localStorage.getItem('srs_data');
                  const srsData = srsDataStr ? JSON.parse(srsDataStr) : {};
                  let srsDueCount = 0;
                  const nowMs = Date.now();
                  for (const [key, data] of Object.entries(srsData)) {
                    if (nowMs >= data.nextReview) srsDueCount++;
                  }

                  let srsCardHTML = '';
                  if (srsDueCount > 0) {
                    srsCardHTML = `
                      <div class="activity-card" data-target="hifz-tracker" style="cursor:pointer; background: linear-gradient(135deg, rgba(239,68,68,0.08) 0%, transparent 100%); border: 1px solid rgba(239,68,68,0.2);">
                        <div class="activity-icon-wrapper" style="color: #ef4444;">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
                        </div>
                        <div class="activity-info">
                          <div class="activity-title" style="color: #ef4444; font-weight: bold;">مراجعة الحفظ (${srsDueCount} صفحة مستحقة)</div>
                          <div class="activity-desc">حافظ على حفظك من النسيان</div>
                        </div>
                        <div class="activity-arrow">
                          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"></polyline></svg>
                        </div>
                      </div>
                    `;
                  }

                  dynContainer.innerHTML = `
                    ${srsCardHTML}
                    <div class="activity-card" data-target="adhkar" data-type="${recommendedAdhkar}" style="cursor:pointer; background: linear-gradient(135deg, rgba(217,138,68,0.08) 0%, transparent 100%); border: 1px solid rgba(217,138,68,0.2);">
                      <div class="activity-icon-wrapper" style="color: var(--accent);">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">${adhkarIcon}</svg>
                      </div>
                      <div class="activity-info">
                        <div class="activity-title" style="color: var(--accent); font-weight: bold;">${adhkarTitle}</div>
                        <div class="activity-desc">${adhkarDesc}</div>
                      </div>
                      <div class="activity-arrow">
                        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"></polyline></svg>
                      </div>
                    </div>
                    <div class="activity-card" data-target="quran" style="cursor:pointer;">
                      <div class="activity-icon-wrapper">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
                      </div>
                      <div class="activity-info">
                        <div class="activity-title">${t('activity_quran_time')}</div>
                        <div class="activity-desc">${t('activity_quran_time_desc')}</div>
                      </div>
                      <div class="activity-arrow">
                        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"></polyline></svg>
                      </div>
                    </div>
                  `;
                  
                  // Re-attach listeners for dynamically added cards
                  dynContainer.querySelectorAll('.activity-card').forEach(card => {
                      card.addEventListener('click', () => {
                          const target = card.getAttribute('data-target');
                          if (target === 'adhkar') {
                              const type = card.getAttribute('data-type');
                              navigate('adhkar', { type: type });
                          } else if (target) {
                              navigate(target);
                          }
                      });
                  });
              }

              const notifBtn = heroWrapper.querySelector('#toggle-prayer-notif');
              if (notifBtn) {
                  notifBtn.addEventListener('click', async () => {
                      if (!state.prayerNotifications) {
                          // Try to request permissions
                          const { checkNotificationPermission } = await import('../utils/notifications.js');
                          const granted = await checkNotificationPermission();
                          if (granted) {
                              state.prayerNotifications = true;
                              localStorage.setItem('prayerNotifications', 'true');
                              notifBtn.style.opacity = '1';
                              // Force restart scheduler
                              const { initPrayerScheduler } = await import('../utils/prayerScheduler.js');
                              initPrayerScheduler();
                          } else {
                              alert('يجب السماح بالإشعارات من إعدادات المتصفح أو النظام');
                          }
                      } else {
                          state.prayerNotifications = false;
                          localStorage.setItem('prayerNotifications', 'false');
                          notifBtn.style.opacity = '0.5';
                      }
                  });
              }
              
              if (countdownInterval) clearInterval(countdownInterval);
              countdownInterval = setInterval(() => {
                  const el = document.getElementById('prayer-countdown');
                  if (el && nextPrayerTime) {
                      const newRem = getTimeRemaining(nextPrayerTime, state.language);
                      if (newRem === "00:00:00") {
                          clearInterval(countdownInterval);
                          updateTimes();
                      } else {
                          el.textContent = newRem;
                      }
                  } else {
                      clearInterval(countdownInterval);
                  }
              }, 1000);
          };

          updateTimes();

          const showMoreBtn = heroWrapper.querySelector('#show-more-prayers');
          if (showMoreBtn) {
              showMoreBtn.addEventListener('click', () => {
                  navigate('prayer-times');
              });
          }
      } catch (err) {
          console.error("Failed to init prayer times", err);
          heroWrapper.innerHTML = `<div style="padding: 2rem; text-align: center; direction: ltr;">Error loading Prayer Times: <br/> ${err.message} <br/> ${err.stack}</div>`;
      }
  }

  initPrayerTimes();

  const originalRemove = container.remove;
  container.remove = function() {
      if (countdownInterval) clearInterval(countdownInterval);
      originalRemove.call(this);
  };

  const featureItems = container.querySelectorAll('.feature-item');
  featureItems.forEach(item => {
    item.addEventListener('click', () => {
      const target = item.getAttribute('data-target');
      if (target) {
        navigate(target);
      }
    });
  });

  return container;
}
