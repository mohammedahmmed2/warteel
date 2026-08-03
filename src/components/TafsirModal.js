import { t } from '../utils/i18n.js';
import { Dialog } from './Dialog.js';
import { state } from '../app.js';

const TAFSIR_NAMES = {
  'ar.saadi': 'تفسير السعدي',
  'ar.muyassar': 'تفسير الميسر',
  'ar.jalalayn': 'تفسير الجلالين',
  'ar.waseet': 'التفسير الوسيط',
  'ar.ibnkathir': 'تفسير ابن كثير',
  'ar.qurtubi': 'تفسير القرطبي',
  'ar.tabari': 'تفسير الطبري'
};

let tafsirCache = {};

export function TafsirModal() {
  const container = document.createElement('div');
  container.id = 'tafsir-modal-container';
  return container;
}

export async function openTafsirModal(surahNum, ayahNumInSurah, ayahText) {
  const container = document.getElementById('tafsir-modal-container');
  if (!container) return;

  // Show loading Dialog
  container.innerHTML = '';
  const dialogContent = document.createElement('div');
  dialogContent.innerHTML = `
    <div style="font-family: var(--quran-font); font-size: 1.5rem; text-align: right; color: var(--text-primary); margin-bottom: 1.5rem; line-height: 2;">${ayahText}</div>
    <div id="tafsir-content" style="font-family: var(--font-arabic); color: var(--text-secondary); line-height: 1.8; text-align: justify; font-size: 1rem; max-height: 50vh; overflow-y: auto; padding: 0.5rem; background: var(--bg-main); border-radius: 8px;">
      <div style="text-align: center;">${t('loading')}</div>
    </div>
  `;

  const dialog = Dialog({
    title: t('tafsir_title'),
    content: dialogContent,
    confirmText: t('back'),
    cancelText: '', // No cancel button
    onConfirm: () => closeTafsirModal()
  });
  
  container.appendChild(dialog);

  // Fetch Tafsir (using selected edition from state, default to As-Saadi)
  const edition = state.tafsirEdition || 'ar.saadi';
  const tafsirName = TAFSIR_NAMES[edition] || 'تفسير';
  const cacheKey = `${surahNum}_${ayahNumInSurah}_${edition}`;
  
  const contentDiv = dialogContent.querySelector('#tafsir-content');

  try {
    if (tafsirCache[cacheKey]) {
      contentDiv.innerHTML = `<div style="color: var(--accent); font-weight: bold; margin-bottom: 0.5rem; text-align: center; border-bottom: 1px solid var(--glass-border); padding-bottom: 0.5rem;">${tafsirName}</div><p>${tafsirCache[cacheKey]}</p>`;
    } else {
      window.__tafsirData = window.__tafsirData || {};
      if (!window.__tafsirData[edition]) {
        const res = await fetch(`/quran/${edition}.json`);
        window.__tafsirData[edition] = await res.json();
      }
      
      const data = window.__tafsirData[edition];
      const surahData = data.data.surahs[surahNum - 1];
      const ayahData = surahData.ayahs[ayahNumInSurah - 1];
      const tafsirText = ayahData.text;

      tafsirCache[cacheKey] = tafsirText;
      contentDiv.innerHTML = `<div style="color: var(--accent); font-weight: bold; margin-bottom: 0.5rem; text-align: center; border-bottom: 1px solid var(--glass-border); padding-bottom: 0.5rem;">${tafsirName}</div><p>${tafsirText}</p>`;
    }
  } catch (err) {
    contentDiv.innerHTML = `<p style="color: red; text-align: center;">حدث خطأ أثناء تحميل التفسير.</p>`;
  }
}

export function closeTafsirModal() {
  const container = document.getElementById('tafsir-modal-container');
  if (container) {
    container.innerHTML = '';
  }
}
