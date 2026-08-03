export function Dialog({ title, content, onConfirm, onCancel, confirmText = 'موافق', cancelText = 'إلغاء' }) {
  const overlay = document.createElement('div');
  overlay.className = 'dialog-overlay animate-fade-in';
  
  const dialog = document.createElement('div');
  dialog.className = 'dialog-content glass-panel animate-scale-in';
  
  dialog.innerHTML = `
    <h3 class="dialog-title">${title || ''}</h3>
    <div class="dialog-body">${typeof content === 'string' ? content : ''}</div>
    <div class="dialog-actions">
      ${cancelText ? `<button class="btn btn-secondary" id="dialog-cancel">${cancelText}</button>` : ''}
      ${confirmText ? `<button class="btn btn-primary" id="dialog-confirm">${confirmText}</button>` : ''}
    </div>
  `;
  
  if (typeof content !== 'string') {
    dialog.querySelector('.dialog-body').appendChild(content);
  }
  
  overlay.appendChild(dialog);
  
  const close = () => overlay.remove();
  
  const cancelBtn = dialog.querySelector('#dialog-cancel');
  if (cancelBtn) {
    cancelBtn.addEventListener('click', () => {
      if (onCancel) onCancel();
      close();
    });
  }
  
  const confirmBtn = dialog.querySelector('#dialog-confirm');
  if (confirmBtn) {
    confirmBtn.addEventListener('click', () => {
      if (onConfirm) onConfirm();
      close();
    });
  }
  
  // Close on outside click
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) close();
  });
  
  return overlay;
}
