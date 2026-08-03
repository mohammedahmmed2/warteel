import { t } from '../utils/i18n.js';
import { getQuranData } from '../utils/quranData.js';

export function HifzTrackerPage(navigate) {
  const container = document.createElement('div');
  container.className = 'hifz-tracker-page animate-fade-in';

  const style = document.createElement('style');
  style.innerHTML = `
    .ht-content {
      max-width: 800px;
      margin: 0 auto;
      padding-top: 1rem;
    }
    .ht-header-card {
      background: linear-gradient(135deg, rgba(239,68,68,0.05) 0%, rgba(239,68,68,0.1) 100%);
      border: 1px solid rgba(239,68,68,0.2);
      border-radius: var(--radius-lg);
      padding: 2.5rem 2rem;
      text-align: center;
      margin-bottom: 2rem;
      position: relative;
      overflow: hidden;
      box-shadow: 0 8px 30px rgba(0,0,0,0.04);
    }
    .ht-header-card h2 {
      color: #ef4444;
      margin-bottom: 0.5rem;
      font-weight: bold;
      font-family: var(--font-arabic);
    }
    .ht-section-title {
      color: var(--text-primary);
      margin-bottom: 1.5rem;
      font-weight: bold;
      font-family: var(--font-arabic);
      display: flex;
      align-items: center;
      gap: 0.5rem;
      border-bottom: 2px solid var(--glass-border);
      padding-bottom: 0.5rem;
    }
    .ht-card {
      background: var(--bg-card);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      border: 1px solid var(--glass-border);
      border-radius: var(--radius-md);
      padding: 1.25rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      cursor: pointer;
      transition: transform 0.3s, box-shadow 0.3s, border-color 0.3s;
    }
    .ht-card:hover {
      transform: translateY(-2px);
      box-shadow: var(--shadow-md);
      border-color: rgba(239,68,68,0.4);
    }
    .ht-card.due {
      border-left: 4px solid #ef4444;
    }
    html[dir="rtl"] .ht-card.due {
      border-left: 1px solid var(--glass-border);
      border-right: 4px solid #ef4444;
    }
    .ht-card-title {
      font-weight: bold;
      color: var(--text-primary);
      font-size: 1.1rem;
      font-family: var(--font-arabic);
      margin-bottom: 0.25rem;
    }
    .ht-card-subtitle {
      font-size: 0.85rem;
      color: var(--text-secondary);
    }
    .ht-badge {
      background: rgba(239,68,68,0.1);
      color: #ef4444;
      padding: 0.25rem 0.75rem;
      border-radius: 20px;
      font-size: 0.85rem;
      font-weight: bold;
      white-space: nowrap;
    }
    .ht-btn-review {
      background: #ef4444;
      color: white;
      border: none;
      padding: 0.5rem 1.25rem;
      border-radius: 20px;
      font-weight: bold;
      font-family: var(--font-arabic);
      cursor: pointer;
      transition: background 0.2s, transform 0.2s;
    }
    .ht-btn-review:hover {
      background: #dc2626;
      transform: scale(1.05);
    }
    .ht-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }
  `;
  container.appendChild(style);

  const appBar = `
    <div class="app-bar" style="position: sticky; top: 0; z-index: 20; background: var(--app-bar-bg); backdrop-filter: blur(12px); border-bottom: 1px solid var(--glass-border); padding: 0.75rem 0; margin-bottom: 1rem; display: flex; align-items: center; justify-content: space-between;">
      <div class="app-bar-icon" id="back-btn" style="cursor:pointer;">
        <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
      </div>
      <div class="app-title" style="font-weight: 700; font-size: 1.2rem; display: flex; align-items: center; gap: 0.5rem;">
        <img src="/logo.png" alt="Warteel" class="app-header-logo" style="height: 28px;" />
        <span>رفيق المراجعة (SRS)</span>
      </div>
      <div class="app-bar-icon" style="opacity: 0;"></div>
    </div>
  `;

  // Content wrapper
  const contentWrapper = document.createElement('div');
  contentWrapper.className = 'ht-content';
  
  const renderLists = async () => {
    try {
      const srsDataStr = localStorage.getItem('srs_data');
      const srsData = srsDataStr ? JSON.parse(srsDataStr) : {};
      
      const now = Date.now();
      const dueList = [];
      const upcomingList = [];

      for (const [pageKey, data] of Object.entries(srsData)) {
        // Supporting both page_X and surah_X for flexibility
        if (pageKey.startsWith('page_')) {
          const pageNum = parseInt(pageKey.replace('page_', ''));
          const item = { type: 'page', num: pageNum, data };
          if (now >= data.nextReview) dueList.push(item);
          else upcomingList.push(item);
        } else if (pageKey.startsWith('surah_')) {
          const surahNum = parseInt(pageKey.replace('surah_', ''));
          const item = { type: 'surah', num: surahNum, data };
          if (now >= data.nextReview) dueList.push(item);
          else upcomingList.push(item);
        }
      }

      // Sort
      dueList.sort((a, b) => a.data.nextReview - b.data.nextReview);
      upcomingList.sort((a, b) => a.data.nextReview - b.data.nextReview);

      const renderItemLabel = (item) => {
        return item.type === 'page' ? `صفحة ${item.num}` : `سورة ${item.num}`;
      };

      let dueHTML = '';
      if (dueList.length === 0) {
        dueHTML = `
          <div style="text-align: center; color: var(--text-secondary); padding: 2.5rem 1rem; background: var(--bg-card); border-radius: var(--radius-lg); border: 1px dashed var(--glass-border); box-shadow: var(--shadow-sm);">
            <div style="font-size: 2.5rem; margin-bottom: 0.5rem;">🎉</div>
            <div style="font-family: var(--font-arabic); font-weight: bold; font-size: 1.1rem; color: var(--text-primary);">أحسنت! لا توجد مراجعات مستحقة اليوم</div>
            <div style="font-size: 0.9rem; margin-top: 0.5rem;">لقد أتممت مراجعتك بنجاح.</div>
          </div>
        `;
      } else {
        dueHTML = dueList.map(item => `
          <div class="ht-card due quran-nav-btn" data-type="${item.type}" data-num="${item.num}">
            <div style="display:flex; align-items:center; gap: 1.2rem;">
              <div style="width: 45px; height: 45px; border-radius: 50%; background: rgba(239,68,68,0.1); color: #ef4444; display:flex; align-items:center; justify-content:center; flex-shrink: 0;">
                <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>
              </div>
              <div>
                <div class="ht-card-title">${renderItemLabel(item)}</div>
                <div class="ht-card-subtitle" style="color: #ef4444; font-weight: bold;">مستحقة للمراجعة الآن!</div>
              </div>
            </div>
            <button class="ht-btn-review">راجع الآن</button>
          </div>
        `).join('');
      }

      let upcomingHTML = '';
      if (upcomingList.length === 0) {
        upcomingHTML = `
          <div style="text-align: center; color: var(--text-secondary); padding: 2rem; background: var(--bg-card); border-radius: var(--radius-lg); border: 1px dashed var(--glass-border); box-shadow: var(--shadow-sm);">
            لا توجد مراجعات مجدولة للمستقبل. قم بحفظ وتثبيت صفحات وسور جديدة!
          </div>
        `;
      } else {
        upcomingHTML = upcomingList.slice(0, 10).map(item => {
          const daysLeft = Math.ceil((item.data.nextReview - now) / (1000 * 60 * 60 * 24));
          const timeText = daysLeft === 0 ? 'اليوم' : (daysLeft === 1 ? 'غداً' : `بعد ${daysLeft} أيام`);
          return `
          <div class="ht-card quran-nav-btn" data-type="${item.type}" data-num="${item.num}">
            <div style="display:flex; align-items:center; gap: 1.2rem;">
              <div style="width: 45px; height: 45px; border-radius: 50%; background: var(--glass-border); color: var(--text-secondary); display:flex; align-items:center; justify-content:center; flex-shrink: 0;">
                <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
              </div>
              <div>
                <div class="ht-card-title">${renderItemLabel(item)}</div>
                <div class="ht-card-subtitle">${timeText}</div>
              </div>
            </div>
            <div class="ht-badge">مستوى الإتقان: ${item.data.level || 1}</div>
          </div>
        `}).join('');
      }

      contentWrapper.innerHTML = `
        <div class="ht-header-card animate-fade-in">
          <h2>التكرار المتباعد للمراجعة</h2>
          <p style="color: var(--text-secondary); font-size: 0.95rem; line-height: 1.6; max-width: 90%; margin: 0 auto;">هذا النظام يساعدك على جدولة مراجعتك للقرآن بناءً على مدى قوة حفظك لكل صفحة، لضمان تثبيت الحفظ وعدم النسيان بإذن الله.</p>
        </div>

        <div style="margin-bottom: 3rem;">
          <h3 class="ht-section-title">
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="#ef4444" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
            مراجعات مستحقة (${dueList.length})
          </h3>
          <div class="ht-list">
            ${dueHTML}
          </div>
        </div>

        <div>
          <h3 class="ht-section-title">
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>
            مراجعات قادمة
          </h3>
          <div class="ht-list">
            ${upcomingHTML}
          </div>
        </div>
      `;

      // Attach events safely
      contentWrapper.querySelectorAll('.quran-nav-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const type = btn.getAttribute('data-type');
          const num = parseInt(btn.getAttribute('data-num'));
          if (type === 'page') {
            navigate('quranReader', { page: num });
          } else if (type === 'surah') {
            navigate('quranReader', { surah: num });
          }
        });
      });

    } catch (err) {
      console.error(err);
      contentWrapper.innerHTML = `<div style="text-align:center; color: var(--error); padding: 2rem;">حدث خطأ أثناء تحميل البيانات</div>`;
    }
  };

  container.innerHTML = appBar;
  container.appendChild(contentWrapper);
  
  // Attach Back event
  setTimeout(() => {
    container.querySelector('#back-btn')?.addEventListener('click', () => {
      navigate('home');
    });
  }, 0);

  renderLists();

  return container;
}

