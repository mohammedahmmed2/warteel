import './styles/base.css';
import { App } from './app.js';
import { initPrayerScheduler } from './utils/prayerScheduler.js';

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
  const root = document.getElementById('app');
  
  window.addEventListener('error', (e) => {
    if(root) root.innerHTML += `<div style="color:red; padding:20px; font-family:monospace; direction:ltr;">Global Error: ${e.message}<br>Line: ${e.lineno}<br>File: ${e.filename}</div>`;
  });

  window.addEventListener('unhandledrejection', (e) => {
    if(root) root.innerHTML += `<div style="color:red; padding:20px; font-family:monospace; direction:ltr;">Unhandled Promise: ${e.reason}</div>`;
  });

  if (root) {
    try {
      App(root);
      initPrayerScheduler();
    } catch(err) {
      root.innerHTML = `<div style="color:red; padding:20px; font-family:monospace; direction:ltr;">App Crash: ${err.message}<br>${err.stack}</div>`;
    }
  }
});
