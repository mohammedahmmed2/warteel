/**
 * Toast Notification Utility
 * Displays a popup message at the bottom of the screen.
 * 
 * @param {string} message - The message to display.
 * @param {string} type - 'info', 'success', 'error', 'warning'
 * @param {number} duration - Time in milliseconds before the toast disappears
 */
export function showToast(message, type = 'info', duration = 3000) {
  // Check if a toast container exists, if not create one
  let toastContainer = document.getElementById('toast-container');
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.id = 'toast-container';
    toastContainer.className = 'toast-container';
    document.body.appendChild(toastContainer);
  }

  // Create toast element
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  
  // Choose icon based on type
  let icon = '';
  switch(type) {
    case 'success': icon = '✅'; break;
    case 'error': icon = '❌'; break;
    case 'warning': icon = '⚠️'; break;
    default: icon = 'ℹ️'; break;
  }

  toast.innerHTML = `
    <span class="toast-icon">${icon}</span>
    <span class="toast-message">${message}</span>
  `;

  // Add to container
  toastContainer.appendChild(toast);

  // Trigger animation (next frame)
  requestAnimationFrame(() => {
    toast.classList.add('show');
  });

  // Remove toast after duration
  setTimeout(() => {
    toast.classList.remove('show');
    toast.addEventListener('transitionend', () => {
      toast.remove();
      // Remove container if empty
      if (toastContainer.childElementCount === 0) {
        toastContainer.remove();
      }
    }, { once: true });
  }, duration);
}
