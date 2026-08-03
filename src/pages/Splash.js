import { t } from '../utils/i18n.js';

export function SplashScreen(navigate) {
  const container = document.createElement('div');
  container.className = 'splash-screen animate-fade-in';
  
  container.innerHTML = `
    <div class="splash-logo-container animate-float">
      <div class="logo-glow"></div>
      <img src="/logo.png" alt="${t('splash_title')}" class="splash-logo" />
      <h1 class="splash-title">${t('splash_title')}</h1>
      <p class="splash-slogan">${t('splash_slogan')}</p>
    </div>
  `;

  // Navigate to welcome screen after 3 seconds
  setTimeout(() => {
    container.classList.remove('animate-fade-in');
    container.style.opacity = '0';
    container.style.transition = 'opacity var(--transition-normal)';
    
    setTimeout(() => {
      navigate('welcome');
    }, 300); // Wait for fade out
  }, 3000);

  return container;
}
