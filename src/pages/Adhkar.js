import { t } from '../utils/i18n.js';
import { exportAdhkarToImage } from '../utils/adhkarImageGenerator.js';
import { adhkarData as comprehensiveAdhkarData } from '../utils/adhkarData.js';
import { openImageThemeModal } from '../components/ImageThemeModal.js';

export function AdhkarPage(navigate, type = 'morning') {
  const container = document.createElement('div');
  container.className = 'adhkar-page-wrapper animate-fade-in';

  let currentType = type;
  let adhkarData = [];

  const tabNames = {
    'morning': 'أذكار الصباح',
    'evening': 'أذكار المساء',
    'post_prayer': 'أذكار الصلاة',
    'sleep': 'أذكار النوم',
    'wake_up': 'أذكار الاستيقاظ',
    'wudu': 'أذكار الوضوء',
    'mosque': 'أذكار المسجد',
    'adhan': 'أذكار الأذان',
    'food': 'أذكار الطعام'
  };

  const renderHeader = () => {
    return `
      <div class="app-bar" style="position: sticky; top: 0; z-index: 20; background: var(--app-bar-bg); backdrop-filter: blur(12px); border-bottom: 1px solid var(--glass-border); padding: 0.75rem 0; margin-bottom: 1rem; display: flex; align-items: center; justify-content: space-between;">
        <div class="app-bar-icon" id="back-btn" style="cursor:pointer;">
          <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
        </div>
        <div class="app-title" style="font-weight: 700; font-size: 1.2rem;">${t('adhkar')}</div>
        <div class="app-bar-icon" style="opacity: 0;"></div>
      </div>
      
      <!-- Adhkar Categories Slider -->
      <div class="chapters-slider" style="margin-bottom: 1.5rem;">
        <button class="chapter-btn ${currentType === 'morning' ? 'active' : ''}" data-type="morning">🌅 أذكار الصباح</button>
        <button class="chapter-btn ${currentType === 'evening' ? 'active' : ''}" data-type="evening">🌆 أذكار المساء</button>
        <button class="chapter-btn ${currentType === 'post_prayer' ? 'active' : ''}" data-type="post_prayer">🕌 أذكار الصلاة</button>
        <button class="chapter-btn ${currentType === 'sleep' ? 'active' : ''}" data-type="sleep">🌙 أذكار النوم</button>
        <button class="chapter-btn ${currentType === 'wake_up' ? 'active' : ''}" data-type="wake_up">☀️ أذكار الاستيقاظ</button>
        <button class="chapter-btn ${currentType === 'wudu' ? 'active' : ''}" data-type="wudu">💧 أذكار الوضوء</button>
        <button class="chapter-btn ${currentType === 'mosque' ? 'active' : ''}" data-type="mosque">🏛️ أذكار المسجد</button>
        <button class="chapter-btn ${currentType === 'adhan' ? 'active' : ''}" data-type="adhan">🗣️ أذكار الأذان</button>
        <button class="chapter-btn ${currentType === 'food' ? 'active' : ''}" data-type="food">🍽️ أذكار الطعام</button>
      </div>
    `;
  };

  const renderContent = () => {
    if (!adhkarData || adhkarData.length === 0) {
      return `<div style="text-align:center; padding: 4rem 1rem; color: var(--text-muted);"><div style="font-size: 3rem; margin-bottom: 1rem;">🤲</div><div style="font-size: 1.1rem; font-weight: 600;">جاري التحميل...</div></div>`;
    }

    return `
      <div class="adhkar-grid">
        ${adhkarData.map((dhikr, index) => `
          <div class="adhkar-card-premium" data-index="${index}">
            <div class="adhkar-text-content">
              ${dhikr.ARABIC_TEXT}
            </div>
            
            <div class="adhkar-card-footer">
              <div class="adhkar-action-row">
                <button class="hadith-action-btn story-export-btn" data-index="${index}">
                  <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                  <span>ستوري</span>
                </button>
                <span class="adhkar-source">📖 ${dhikr.SOURCE || 'سراج'}</span>
              </div>
              
              <button class="dhikr-counter-btn" data-count="${dhikr.REPEAT}" data-original="${dhikr.REPEAT}">
                ${dhikr.REPEAT}
              </button>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  };

  const loadData = () => {
    adhkarData = comprehensiveAdhkarData[currentType] || comprehensiveAdhkarData['morning'];
    render();
  };

  const render = () => {
    container.innerHTML = renderHeader() + renderContent();
    
    container.querySelector('#back-btn')?.addEventListener('click', () => {
      navigate('home');
    });

    // Handle Tab clicks
    container.querySelectorAll('.chapter-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        currentType = btn.getAttribute('data-type');
        loadData();
      });
    });

    // Handle Counter clicks
    container.querySelectorAll('.dhikr-counter-btn').forEach(counterBtn => {
      counterBtn.addEventListener('click', () => {
        let current = parseInt(counterBtn.getAttribute('data-count'));
        if (current > 0) {
          current--;
          counterBtn.setAttribute('data-count', current);
          counterBtn.innerText = current;
          counterBtn.style.transform = 'scale(0.92)';
          setTimeout(() => counterBtn.style.transform = 'scale(1)', 150);
          if (navigator.vibrate) navigator.vibrate(25);
          
          if (current === 0) {
            counterBtn.classList.add('completed');
            counterBtn.innerHTML = '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="white" stroke-width="3"><polyline points="20 6 9 17 4 12"></polyline></svg>';
            if (navigator.vibrate) navigator.vibrate([40, 60, 40]);
          }
        }
      });
    });

    // Handle Export Story clicks
    container.querySelectorAll('.story-export-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        const index = parseInt(btn.getAttribute('data-index'));
        const dhikr = adhkarData[index];
        
        if (dhikr) {
            openImageThemeModal(async (selectedTheme, options) => {
                const span = btn.querySelector('span');
                const originalText = span.textContent;
                span.textContent = 'جاري...';
                btn.style.opacity = '0.7';
                btn.style.pointerEvents = 'none';
                
                try {
                    await exportAdhkarToImage(
                        dhikr.ARABIC_TEXT,
                        tabNames[currentType] || 'أذكار',
                        dhikr.SOURCE,
                        dhikr.REPEAT,
                        selectedTheme,
                        options
                    );
                    showToastLocal('✅ تم حفظ الستوري بنجاح');
                } catch (err) {
                    console.error(err);
                    showToastLocal('❌ حدث خطأ أثناء الحفظ');
                } finally {
                    span.textContent = originalText;
                    btn.style.opacity = '1';
                    btn.style.pointerEvents = 'auto';
                }
            }, { 
                text: dhikr.ARABIC_TEXT, 
                header: tabNames[currentType] || 'أذكار',
                optionsList: [
                    { id: 'source', label: 'المصدر / الفضل' },
                    { id: 'repeat', label: 'عدد التكرار' }
                ]
            });
        }
      });
    });
  };

  loadData();
  return container;
}
