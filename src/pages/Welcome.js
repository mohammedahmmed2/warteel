import { Button } from '../components/Button.js';
import { t } from '../utils/i18n.js';

export function WelcomeScreen(navigate) {
  const container = document.createElement('div');
  container.className = 'welcome-screen animate-fade-in';
  
  container.innerHTML = `
    <div class="welcome-content glass-panel stagger-1">
      <h1 class="welcome-title animate-slide-up stagger-2">${t('welcome_title')}</h1>
      <p class="welcome-desc animate-slide-up stagger-3">
        ${t('welcome_desc')}
      </p>
      <div class="welcome-actions animate-slide-up stagger-4" id="welcome-btn-container"></div>
    </div>
  `;

  // Append button using our reusable component
  const btnContainer = container.querySelector('#welcome-btn-container');
  const startBtn = Button({
    text: t('start_now'),
    variant: 'primary',
    onClick: () => {
      // In a real app, we might check if this is the first time, 
      // then navigate to 'home'
      navigate('home');
    }
  });
  
  btnContainer.appendChild(startBtn);

  return container;
}
