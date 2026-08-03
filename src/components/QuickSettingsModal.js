import { t } from '../utils/i18n.js';
import { state } from '../app.js';

let modalElement = null;

export function openQuickSettingsModal() {
  if (!modalElement) {
    createModal();
  }
  modalElement.classList.add('open');
  document.body.style.overflow = 'hidden';
}

export function closeQuickSettingsModal() {
  if (modalElement) {
    modalElement.classList.remove('open');
    document.body.style.overflow = '';
  }
}

function createModal() {
  modalElement = document.createElement('div');
  modalElement.className = 'quick-settings-modal-backdrop';
  
  // Create styles specific to this modal if not in CSS
  const style = document.createElement('style');
  style.textContent = `
    .quick-settings-modal-backdrop {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: rgba(0, 0, 0, 0.4);
      backdrop-filter: blur(4px);
      z-index: 9999;
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0;
      pointer-events: none;
      transition: opacity 0.3s ease;
    }
    .quick-settings-modal-backdrop.open {
      opacity: 1;
      pointer-events: auto;
    }
    .quick-settings-modal-container {
      background: var(--bg-card);
      border-radius: 20px;
      width: 90%;
      max-width: 400px;
      max-height: 90vh;
      overflow-y: auto;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
      transform: translateY(20px) scale(0.95);
      transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
      border: 1px solid var(--glass-border);
      padding: 1.5rem;
      direction: rtl;
    }
    .quick-settings-modal-backdrop.open .quick-settings-modal-container {
      transform: translateY(0) scale(1);
    }
    .quick-settings-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;
      border-bottom: 1px solid var(--glass-border);
      padding-bottom: 1rem;
    }
    .quick-settings-title {
      font-size: 1.25rem;
      font-weight: bold;
      color: var(--text-primary);
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    .quick-settings-close-btn {
      background: rgba(128, 128, 128, 0.1);
      border: none;
      color: var(--text-secondary);
      cursor: pointer;
      width: 32px;
      height: 32px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s;
    }
    .quick-settings-close-btn:hover {
      background: rgba(128, 128, 128, 0.2);
      color: var(--text-primary);
    }
    .qs-section {
      margin-bottom: 1.5rem;
    }
    .qs-label {
      font-size: 0.95rem;
      font-weight: 600;
      color: var(--text-secondary);
      margin-bottom: 0.75rem;
      display: block;
    }
    .qs-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.75rem;
      background: var(--bg-main);
      border-radius: 12px;
      border: 1px solid var(--glass-border);
    }
    .qs-row-title {
      font-size: 1rem;
      color: var(--text-primary);
      font-weight: 500;
    }
    
    /* Theme Options Grid */
    .qs-theme-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 0.75rem;
    }
    .qs-theme-btn {
      background: var(--bg-main);
      border: 2px solid transparent;
      border-radius: 12px;
      padding: 0.75rem 0.5rem;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.5rem;
      cursor: pointer;
      transition: all 0.2s;
      color: var(--text-primary);
    }
    .qs-theme-btn:hover {
      background: var(--hover-bg, rgba(0,0,0,0.02));
    }
    .qs-theme-btn.active {
      border-color: var(--accent);
      background: rgba(217, 138, 68, 0.05); /* Soft accent */
    }
    .qs-theme-color-circle {
      width: 24px;
      height: 24px;
      border-radius: 50%;
    }
    
    /* Font Selection */
    .qs-font-select {
      width: 100%;
      padding: 0.75rem;
      border-radius: 12px;
      border: 1px solid var(--glass-border);
      background: var(--bg-main);
      color: var(--text-primary);
      font-family: inherit;
      font-size: 1rem;
      outline: none;
      cursor: pointer;
      appearance: none;
      -webkit-appearance: none;
      background-image: url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%23888%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E");
      background-repeat: no-repeat;
      background-position: left 0.75rem center; /* RTL adjustment */
      background-size: 16px;
    }
  `;
  document.head.appendChild(style);

  modalElement.innerHTML = `
    <div class="quick-settings-modal-container">
      <div class="quick-settings-header">
        <div class="quick-settings-title">
          <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
          المظهر والإعدادات
        </div>
        <button class="quick-settings-close-btn" id="qs-close-btn">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>
      </div>

      <div class="qs-section">
        <div class="qs-row">
          <div class="qs-row-title">الوضع الليلي</div>
          <label class="settings-switch">
            <input type="checkbox" id="qs-dark-toggle" ${state.theme === 'dark' ? 'checked' : ''}>
            <span class="switch-slider"></span>
          </label>
        </div>
      </div>

      <div class="qs-section">
        <label class="qs-label">اللون الأساسي</label>
        <div class="qs-theme-grid">
          <div class="qs-theme-btn ${state.colorTheme === 'muslimeen' ? 'active' : ''}" data-theme="muslimeen">
            <div class="qs-theme-color-circle" style="background: #D98A44;"></div>
            <span style="font-size: 0.85rem; font-weight: 500;">ذهبي</span>
          </div>
          <div class="qs-theme-btn ${state.colorTheme === 'purple' ? 'active' : ''}" data-theme="purple">
            <div class="qs-theme-color-circle" style="background: #9333ea;"></div>
            <span style="font-size: 0.85rem; font-weight: 500;">بنفسجي</span>
          </div>
          <div class="qs-theme-btn ${state.colorTheme === 'teal' ? 'active' : ''}" data-theme="teal">
            <div class="qs-theme-color-circle" style="background: #0d9488;"></div>
            <span style="font-size: 0.85rem; font-weight: 500;">تركواز</span>
          </div>
        </div>
      </div>

      <div class="qs-section">
        <label class="qs-label">خط التطبيق</label>
        <select id="qs-app-font" class="qs-font-select">
          <option value="'Almarai', 'Tajawal', sans-serif" ${(state.appFont || "'Almarai', 'Tajawal', sans-serif") === "'Almarai', 'Tajawal', sans-serif" ? 'selected' : ''}>المراعي (Almarai)</option>
          <option value="'Tajawal', sans-serif" ${state.appFont === "'Tajawal', sans-serif" ? 'selected' : ''}>تجوال (Tajawal)</option>
          <option value="'Cairo', sans-serif" ${state.appFont === "'Cairo', sans-serif" ? 'selected' : ''}>كايرو (Cairo)</option>
          <option value="'IBM Plex Arabic', sans-serif" ${state.appFont === "'IBM Plex Arabic', sans-serif" ? 'selected' : ''}>آي بي إم (IBM Plex Arabic)</option>
        </select>
      </div>

    </div>
  `;

  document.body.appendChild(modalElement);

  // Event Listeners
  modalElement.addEventListener('click', (e) => {
    if (e.target === modalElement) {
      closeQuickSettingsModal();
    }
  });

  modalElement.querySelector('#qs-close-btn').addEventListener('click', closeQuickSettingsModal);

  // Dark Mode Toggle
  modalElement.querySelector('#qs-dark-toggle').addEventListener('change', (e) => {
    state.theme = e.target.checked ? 'dark' : 'light';
    localStorage.setItem('theme', state.theme);
    if (state.theme === 'dark') {
      document.documentElement.classList.add('dark-mode');
    } else {
      document.documentElement.classList.remove('dark-mode');
    }
  });

  // Color Theme Logic
  const themeBtns = modalElement.querySelectorAll('.qs-theme-btn');
  themeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const selectedTheme = btn.getAttribute('data-theme');
      
      // Update state & local storage
      state.colorTheme = selectedTheme;
      localStorage.setItem('colorTheme', state.colorTheme);
      document.documentElement.setAttribute('data-theme', state.colorTheme);
      
      // Update UI active class
      themeBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });

  // App Font Logic
  modalElement.querySelector('#qs-app-font').addEventListener('change', (e) => {
    state.appFont = e.target.value;
    localStorage.setItem('appFont', state.appFont);
    document.documentElement.style.setProperty('--font-arabic', state.appFont);
    document.documentElement.style.setProperty('--font-english', state.appFont);
  });
}
