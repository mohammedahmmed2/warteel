import { t } from '../utils/i18n.js';

export function WorshipTrackerPage(navigate) {
  const container = document.createElement('div');
  container.className = 'worship-tracker-page animate-fade-in';

  // Responsive Styles
  const style = document.createElement('style');
  style.innerHTML = `
    .wt-content {
      max-width: 1000px;
      margin: 0 auto;
      padding-top: 1rem;
    }
    
    .wt-grid {
      display: grid;
      gap: 1.5rem;
      grid-template-columns: 1fr;
    }

    @media (min-width: 768px) {
      .wt-grid {
        grid-template-columns: repeat(2, 1fr);
      }
      .hero-card-full {
        grid-column: 1 / -1;
      }
    }

    @media (min-width: 1024px) {
      .wt-grid {
        grid-template-columns: repeat(3, 1fr);
      }
      .wt-col-span-2 {
        grid-column: span 2;
      }
    }

    .level-card {
      background: linear-gradient(135deg, var(--bg-gradient-start) 0%, rgba(217,138,68,0.05) 100%);
      border-radius: var(--radius-lg);
      padding: 2.5rem 2rem;
      text-align: center;
      border: 1px solid var(--accent-border);
      box-shadow: 0 8px 30px rgba(0,0,0,0.04);
      position: relative;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    .level-badge {
      width: 80px;
      height: 80px;
      border-radius: 50%;
      background: var(--accent);
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 2.5rem;
      margin: 0 auto 1.5rem auto;
      box-shadow: 0 4px 15px var(--accent-bg);
      border: 4px solid var(--bg-main);
      z-index: 2;
      transition: transform 0.3s ease;
    }

    .level-card:hover .level-badge {
      transform: scale(1.1) rotate(5deg);
    }

    .progress-bar-container {
      width: 100%;
      max-width: 300px;
      height: 12px;
      background: var(--glass-border);
      border-radius: 6px;
      margin-top: 1.5rem;
      overflow: hidden;
      box-shadow: inset 0 1px 3px rgba(0,0,0,0.1);
    }
    
    .progress-bar-fill {
      height: 100%;
      background: linear-gradient(90deg, var(--accent), #eab308);
      border-radius: 6px;
      transition: width 0.8s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .task-card {
      background: var(--bg-card);
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      border: 1px solid var(--glass-border);
      border-radius: var(--radius-lg);
      padding: 1.5rem;
      box-shadow: var(--shadow-sm);
      display: flex;
      flex-direction: column;
      transition: transform 0.3s, box-shadow 0.3s;
    }
    .task-card:hover {
      transform: translateY(-2px);
      box-shadow: var(--shadow-md);
      border-color: rgba(217,138,68,0.2);
    }

    .task-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0.8rem 0;
      border-bottom: 1px dashed var(--glass-border);
      transition: all 0.2s;
      cursor: pointer;
    }
    .task-item:hover {
      background: rgba(0,0,0,0.02);
      padding-right: 0.5rem;
      border-radius: var(--radius-sm);
    }
    .task-item:last-child {
      border-bottom: none;
    }
    
    /* Custom Checkbox */
    .task-checkbox {
      appearance: none;
      -webkit-appearance: none;
      width: 24px;
      height: 24px;
      border: 2px solid var(--glass-border);
      border-radius: 6px;
      background: var(--bg-main);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s ease;
      flex-shrink: 0;
    }
    .task-checkbox:checked {
      background: var(--accent);
      border-color: var(--accent);
    }
    .task-checkbox:checked::after {
      content: '✓';
      color: white;
      font-size: 14px;
      font-weight: bold;
    }
    
    .task-info {
      flex: 1;
      margin-right: 1rem; /* RTL */
    }
    
    .task-title {
      font-family: var(--font-arabic);
      font-weight: bold;
      color: var(--text-primary);
      font-size: 1rem;
      transition: color 0.2s;
    }
    .task-pts {
      font-size: 0.8rem;
      color: var(--accent);
      font-family: var(--font-english);
      font-weight: bold;
      background: var(--accent-bg);
      padding: 2px 6px;
      border-radius: 4px;
    }

    .task-item.completed .task-title {
      text-decoration: line-through;
      color: var(--text-muted);
    }
    .task-item.completed {
      opacity: 0.7;
    }

    .badges-container {
      display: flex;
      gap: 1.2rem;
      flex-wrap: wrap;
      justify-content: center;
      margin-top: 1.5rem;
    }
    .achievement-badge {
      width: 65px;
      height: 65px;
      border-radius: 50%;
      background: var(--bg-main);
      border: 2px solid var(--glass-border);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      opacity: 0.3;
      filter: grayscale(100%);
      transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
      position: relative;
    }
    .achievement-badge svg {
      width: 28px;
      height: 28px;
      color: var(--text-secondary);
      margin-bottom: 2px;
    }
    .badge-name {
      font-size: 0.6rem;
      font-weight: bold;
      color: var(--text-secondary);
      font-family: var(--font-arabic);
    }
    .achievement-badge.unlocked {
      opacity: 1;
      filter: grayscale(0%);
      border-color: #F59E0B; /* Gold */
      background: linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, transparent 100%);
      box-shadow: 0 4px 15px rgba(245, 158, 11, 0.2);
      transform: translateY(-5px);
    }
    .achievement-badge.unlocked svg {
      color: #F59E0B;
    }
    .achievement-badge.unlocked .badge-name {
      color: #F59E0B;
    }
  `;
  container.appendChild(style);

  const appBar = `
    <div class="app-bar" style="position: sticky; top: 0; z-index: 20; background: var(--app-bar-bg); backdrop-filter: blur(12px); border-bottom: 1px solid var(--glass-border); padding: 0.75rem 0; margin-bottom: 1rem; display: flex; align-items: center; justify-content: space-between;">
      <div class="app-bar-icon" id="back-btn" style="cursor:pointer;">
        <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
      </div>
      <div class="app-title" style="font-weight: 700; font-size: 1.2rem;">متتبع العبادات</div>
      <div class="app-bar-icon" style="opacity: 0;"></div>
    </div>
  `;

  // Data Management
  const getTodayDateStr = () => {
    const d = new Date();
    return `${d.getFullYear()}-${d.getMonth()+1}-${d.getDate()}`;
  };
  const todayStr = getTodayDateStr();

  let worshipData = JSON.parse(localStorage.getItem('worship_data') || '{}');
  if (!worshipData[todayStr]) {
    worshipData[todayStr] = {
      fajr: false, dhuhr: false, asr: false, maghrib: false, isha: false,
      qiyam: false, duha: false, quran: false, adhkarM: false, adhkarE: false
    };
  }
  let totalPoints = parseInt(localStorage.getItem('worship_total_points') || '0');
  
  // Leveling logic
  const getLevelInfo = (pts) => {
    const level = Math.floor(Math.sqrt(pts / 50)) + 1;
    const nextLevelPts = Math.pow(level, 2) * 50;
    const prevLevelPts = Math.pow(level - 1, 2) * 50;
    const progress = ((pts - prevLevelPts) / (nextLevelPts - prevLevelPts)) * 100;
    return { level, nextLevelPts, progress };
  };

  const contentWrapper = document.createElement('div');
  contentWrapper.className = 'wt-content';

  const renderUI = () => {
    const d = worshipData[todayStr];
    const { level, nextLevelPts, progress } = getLevelInfo(totalPoints);

    contentWrapper.innerHTML = `
      <div class="wt-grid">
        
        <!-- Hero / Level Card -->
        <div class="level-card hero-card-full">
          <h2 style="color: var(--text-primary); font-family: var(--font-arabic); margin-bottom: 1rem; font-weight: bold;">ملفي الإيماني</h2>
          <div class="level-badge">🏆</div>
          <h3 style="color: var(--accent); font-family: var(--font-arabic); font-size: 1.5rem; margin-bottom: 0.5rem; font-weight: bold;">المستوى ${level}</h3>
          <p style="color: var(--text-secondary); font-family: var(--font-english); font-weight: bold; font-size: 1.2rem;">${totalPoints} <span style="font-family: var(--font-arabic); font-size: 0.9rem; font-weight: normal;">نقطة</span></p>
          
          <div class="progress-bar-container">
            <div class="progress-bar-fill" style="width: ${progress}%"></div>
          </div>
          <p style="color: var(--text-muted); font-size: 0.85rem; margin-top: 0.75rem;">${totalPoints} / ${nextLevelPts} للوصول للمستوى ${level + 1}</p>
        </div>

        <!-- Faraid (Obligatory Prayers) -->
        <div class="task-card">
          <h3 style="color: var(--text-primary); margin-bottom: 1.5rem; display: flex; align-items: center; gap: 0.5rem; font-weight: bold; border-bottom: 2px solid var(--glass-border); padding-bottom: 0.5rem;">
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="var(--accent)" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>
            الصلوات الخمس (+10)
          </h3>
          <div class="task-list">
            ${['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'].map(p => `
              <label class="task-item ${d[p] ? 'completed' : ''}">
                <input type="checkbox" class="task-checkbox" data-task="${p}" data-pts="10" ${d[p] ? 'checked' : ''}>
                <div class="task-info">
                  <div class="task-title">${t(p)}</div>
                </div>
                <div class="task-pts">+10</div>
              </label>
            `).join('')}
          </div>
        </div>

        <!-- Sunnah & Nawafil -->
        <div class="task-card">
          <h3 style="color: var(--text-primary); margin-bottom: 1.5rem; display: flex; align-items: center; gap: 0.5rem; font-weight: bold; border-bottom: 2px solid var(--glass-border); padding-bottom: 0.5rem;">
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="var(--accent)" stroke-width="2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
            السنن والنوافل
          </h3>
          <div class="task-list">
            <label class="task-item ${d.qiyam ? 'completed' : ''}">
              <input type="checkbox" class="task-checkbox" data-task="qiyam" data-pts="15" ${d.qiyam ? 'checked' : ''}>
              <div class="task-info"><div class="task-title">قيام الليل / الوتر</div></div>
              <div class="task-pts">+15</div>
            </label>
            <label class="task-item ${d.duha ? 'completed' : ''}">
              <input type="checkbox" class="task-checkbox" data-task="duha" data-pts="10" ${d.duha ? 'checked' : ''}>
              <div class="task-info"><div class="task-title">صلاة الضحى</div></div>
              <div class="task-pts">+10</div>
            </label>
            <label class="task-item ${d.quran ? 'completed' : ''}">
              <input type="checkbox" class="task-checkbox" data-task="quran" data-pts="20" ${d.quran ? 'checked' : ''}>
              <div class="task-info"><div class="task-title">ورد القرآن</div></div>
              <div class="task-pts">+20</div>
            </label>
            <label class="task-item ${d.adhkarM ? 'completed' : ''}">
              <input type="checkbox" class="task-checkbox" data-task="adhkarM" data-pts="5" ${d.adhkarM ? 'checked' : ''}>
              <div class="task-info"><div class="task-title">أذكار الصباح</div></div>
              <div class="task-pts">+5</div>
            </label>
            <label class="task-item ${d.adhkarE ? 'completed' : ''}">
              <input type="checkbox" class="task-checkbox" data-task="adhkarE" data-pts="5" ${d.adhkarE ? 'checked' : ''}>
              <div class="task-info"><div class="task-title">أذكار المساء</div></div>
              <div class="task-pts">+5</div>
            </label>
          </div>
        </div>

        <!-- Badges & Achievements -->
        <div class="task-card wt-col-span-2" style="align-items: center;">
          <h3 style="color: var(--text-primary); margin-bottom: 0.5rem; text-align: center; font-weight: bold;">الأوسمة والإنجازات</h3>
          <p style="text-align: center; color: var(--text-muted); font-size: 0.85rem; margin-bottom: 1.5rem;">استمر في العبادة لفتح المزيد من الأوسمة</p>
          
          <div class="badges-container">
            <div class="achievement-badge ${totalPoints >= 100 ? 'unlocked' : ''}" title="المبتدئ: 100 نقطة">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
              <span class="badge-name">المبتدئ</span>
            </div>
            <div class="achievement-badge ${totalPoints >= 500 ? 'unlocked' : ''}" title="المواظب: 500 نقطة">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
              <span class="badge-name">المواظب</span>
            </div>
            <div class="achievement-badge ${totalPoints >= 1000 ? 'unlocked' : ''}" title="المجتهد: 1000 نقطة">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
              <span class="badge-name">المجتهد</span>
            </div>
            <div class="achievement-badge ${totalPoints >= 2500 ? 'unlocked' : ''}" title="المحب: 2500 نقطة">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
              <span class="badge-name">المحب</span>
            </div>
            <div class="achievement-badge ${totalPoints >= 5000 ? 'unlocked' : ''}" title="السابق: 5000 نقطة">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 12h20M12 2v20M4.93 4.93l14.14 14.14M19.07 4.93L4.93 19.07"></path></svg>
              <span class="badge-name">السابق</span>
            </div>
          </div>
        </div>

      </div>
    `;

    // Attach event listeners
    const checkboxes = contentWrapper.querySelectorAll('.task-checkbox');
    checkboxes.forEach(cb => {
      cb.addEventListener('change', (e) => {
        const task = e.target.getAttribute('data-task');
        const pts = parseInt(e.target.getAttribute('data-pts'));
        const isChecked = e.target.checked;

        // Update local memory
        worshipData[todayStr][task] = isChecked;
        if (isChecked) {
          totalPoints += pts;
          import('../utils/toast.js').then(m => m.showToast(`+${pts} نقاط! تقبل الله طاعتك`, 'success'));
          if (navigator.vibrate) navigator.vibrate(50);
        } else {
          totalPoints -= pts;
        }

        // Save
        localStorage.setItem('worship_data', JSON.stringify(worshipData));
        localStorage.setItem('worship_total_points', totalPoints);

        // Re-render UI to update progress bar and classes smoothly
        renderUI();
      });
    });
  };

  container.innerHTML = appBar;
  container.appendChild(contentWrapper);
  
  // Initial render
  renderUI();
  
  setTimeout(() => {
    container.querySelector('#back-btn')?.addEventListener('click', () => {
      navigate('home');
    });
  }, 0);

  return container;
}

