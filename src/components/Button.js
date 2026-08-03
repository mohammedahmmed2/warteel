export function Button({ text, onClick, variant = 'primary', className = '' }) {
  const btn = document.createElement('button');
  btn.textContent = text;
  
  // Base classes
  btn.className = `btn btn-${variant} ripple-btn hover-scale ${className}`;
  
  // Event listeners
  btn.addEventListener('click', (e) => {
    // Create ripple effect
    const ripple = document.createElement('span');
    ripple.className = 'ripple';
    
    const rect = btn.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    
    ripple.style.width = ripple.style.height = `${size}px`;
    ripple.style.left = `${e.clientX - rect.left - size / 2}px`;
    ripple.style.top = `${e.clientY - rect.top - size / 2}px`;
    
    btn.appendChild(ripple);
    
    // Remove ripple after animation
    setTimeout(() => ripple.remove(), 600);
    
    if (onClick) onClick(e);
  });
  
  return btn;
}
