export function Input({ type = 'text', placeholder = '', value = '', onChange, className = '' }) {
  const container = document.createElement('div');
  container.className = `input-container ${className}`;
  
  const input = document.createElement('input');
  input.type = type;
  input.placeholder = placeholder;
  input.value = value;
  input.className = 'custom-input';
  
  if (onChange) {
    input.addEventListener('input', (e) => onChange(e.target.value));
  }
  
  container.appendChild(input);
  return container;
}
