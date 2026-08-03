export function Card({ title, description, icon, onClick, className = '' }) {
  const card = document.createElement('div');
  card.className = `card glass-panel hover-scale ${className}`;
  
  if (onClick) {
    card.style.cursor = 'pointer';
    card.addEventListener('click', onClick);
  }
  
  card.innerHTML = `
    <div class="card-icon">${icon || ''}</div>
    <div class="card-content">
      <h3 class="card-title">${title}</h3>
      ${description ? `<p class="card-desc">${description}</p>` : ''}
    </div>
  `;
  
  return card;
}
