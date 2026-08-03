import { t } from '../utils/i18n.js';

export function DropdownMenu(navigate, currentPage) {
  const container = document.createElement('div');
  container.className = 'global-dropdown-wrapper';
  
  const menuItems = [
    { id: 'home', icon: '<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline>', label: t('nav_home') },
    { id: 'quran', icon: '<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>', label: t('nav_quran') },
    { id: 'qibla', icon: '<circle cx="12" cy="12" r="10"></circle><path d="M16.24 7.76l-2.12 6.36-6.36 2.12 2.12-6.36 6.36-2.12z"></path>', label: t('nav_qibla') },
    { id: 'tasbih', icon: '<circle cx="12" cy="9" r="6" stroke-dasharray="0 4.5" stroke-linecap="round"/><path d="M12 15v5M10 20h4" stroke-linecap="round"/>', label: t('nav_tasbih') },
    { id: 'adhkar', icon: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>', label: t('adhkar') },
    { id: 'hadith', icon: '<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>', label: t('hadith') },
    { id: 'worship-tracker', icon: '<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>', label: 'متتبع العبادات والمكافآت' },
    { id: 'hifz-tracker', icon: '<path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>', label: 'رفيق المراجعة (SRS)' },
    { id: 'settings', icon: '<circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>', label: t('settings') }
  ];

  container.innerHTML = `
    <div class="boxed-icon-btn" id="global-menu-trigger" ${currentPage === 'quran-reader' ? 'style="display:none !important;"' : ''}>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
        <line x1="4" y1="6" x2="16" y2="6"></line>
        <line x1="4" y1="12" x2="20" y2="12"></line>
        <line x1="4" y1="18" x2="12" y2="18"></line>
      </svg>
    </div>
    
    <div class="dropdown-menu-content" id="global-menu-content">
      <div class="dropdown-header">
        <div class="dropdown-title" style="display: flex; align-items: center; gap: 0.5rem;">
          <img src="/logo.png" alt="Warteel" class="app-header-logo" style="height: 32px;" />
          <span>${t('app_title')}</span>
        </div>
      </div>
      <div class="dropdown-items">
        ${menuItems.map(item => `
          <button class="dropdown-item ${currentPage === item.id ? 'active' : ''}" data-target="${item.id}">
            <span class="dropdown-item-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">${item.icon}</svg>
            </span>
            <span class="dropdown-item-label">${item.label}</span>
          </button>
        `).join('')}
      </div>
    </div>
    <div class="dropdown-backdrop" id="dropdown-backdrop"></div>
  `;

  // Interaction logic
  setTimeout(() => {
    const trigger = container.querySelector('#global-menu-trigger');
    const content = container.querySelector('#global-menu-content');
    const backdrop = container.querySelector('#dropdown-backdrop');
    const items = container.querySelectorAll('.dropdown-item');

    // Move trigger to app-bar if possible
    const appBar = document.querySelector('.app-bar');
    if (appBar && trigger) {
      const backBtn = appBar.querySelector('.app-bar-icon');
      if (backBtn) {
        const actionsWrapper = document.createElement('div');
        actionsWrapper.className = 'app-bar-actions-right';
        actionsWrapper.style.display = 'flex';
        actionsWrapper.style.gap = '0.5rem';
        actionsWrapper.style.alignItems = 'center';
        
        backBtn.parentNode.insertBefore(actionsWrapper, backBtn);
        
        // Put trigger on the right (first child in RTL), backBtn to its left
        actionsWrapper.appendChild(trigger);
        actionsWrapper.appendChild(backBtn);
      } else {
        // No back button (e.g. Home page)
        // Put the menu trigger on the far right (first child)
        appBar.insertBefore(trigger, appBar.firstChild);
        
        // Remove the hardcoded empty space in Home.js as it's no longer needed
        const emptySpace = appBar.querySelector('div[style*="width: 44px"]');
        if (emptySpace) {
          emptySpace.remove();
        }
      }
    }

    const toggleMenu = () => {
      if (trigger && !content.classList.contains('show')) {
        const rect = trigger.getBoundingClientRect();
        content.style.position = 'fixed';
        content.style.top = (rect.bottom + 8) + 'px';
        
        const menuWidth = 260; // From CSS
        const padding = 10;
        
        if (document.documentElement.dir === 'ltr' || document.dir === 'ltr') {
           let leftPos = rect.left;
           // Prevent overflow on the right
           if (leftPos + menuWidth > window.innerWidth - padding) {
               leftPos = window.innerWidth - menuWidth - padding;
           }
           content.style.left = Math.max(padding, leftPos) + 'px';
           content.style.right = 'auto';
        } else {
           let rightPos = window.innerWidth - rect.right;
           // Prevent overflow on the left
           if (rightPos + menuWidth > window.innerWidth - padding) {
               rightPos = window.innerWidth - menuWidth - padding;
           }
           content.style.right = Math.max(padding, rightPos) + 'px';
           content.style.left = 'auto';
        }
      }
      content.classList.toggle('show');
      backdrop.classList.toggle('show');
    };

    const closeMenu = () => {
      content.classList.remove('show');
      backdrop.classList.remove('show');
    };

    trigger.addEventListener('click', toggleMenu);
    backdrop.addEventListener('click', closeMenu);

    items.forEach(btn => {
      btn.addEventListener('click', () => {
        const target = btn.getAttribute('data-target');
        closeMenu();
        if (target) {
          navigate(target);
        }
      });
    });
  }, 0);

  return container;
}
