import { t } from '../utils/i18n.js';
import { Dialog } from './Dialog.js';

let meaningCache = {};

export function MeaningModal() {
  const container = document.createElement('div');
  container.id = 'meaning-modal-container';
  return container;
}

export async function openMeaningModal(surahNum, ayahNumInSurah, ayahText) {
  let container = document.getElementById('meaning-modal-container');
  if (!container) {
    container = MeaningModal();
    document.body.appendChild(container);
  }

  // Show loading Dialog
  container.innerHTML = '';
  const dialogContent = document.createElement('div');
  dialogContent.innerHTML = `
    <div style="font-family: var(--quran-font); font-size: 1.5rem; text-align: right; color: var(--text-primary); margin-bottom: 1.5rem; line-height: 2;">${ayahText}</div>
    <div id="meaning-content" style="font-family: var(--font-arabic); color: var(--text-secondary); line-height: 1.8; text-align: justify; font-size: 1rem; max-height: 50vh; overflow-y: auto; padding: 0.5rem; background: var(--bg-main); border-radius: 8px;">
      <div style="text-align: center;">${t('loading') || 'جاري التحميل...'}</div>
    </div>
  `;

  const dialog = Dialog({
    title: 'المعنى',
    content: dialogContent,
    confirmText: t('back') || 'رجوع',
    cancelText: '', // No cancel button
    onConfirm: () => closeMeaningModal()
  });
  
  container.appendChild(dialog);

  const contentDiv = dialogContent.querySelector('#meaning-content');
  const cacheKey = `${surahNum}_${ayahNumInSurah}`;

  try {
    if (meaningCache[cacheKey]) {
      contentDiv.innerHTML = `
        <div style="color: var(--accent); font-weight: bold; margin-bottom: 0.5rem; text-align: center; border-bottom: 1px solid var(--glass-border); padding-bottom: 0.5rem;">التفسير الميسر (المعنى)</div>
        <p style="margin: 0; padding: 10px; background: rgba(255, 255, 255, 0.05); border-radius: 8px;">${meaningCache[cacheKey]}</p>
      `;
    } else {
      if (!window.__quranMuyassarData) {
        const res = await fetch('/src/quran/ar.muyassar.json');
        window.__quranMuyassarData = await res.json();
      }
      const data = window.__quranMuyassarData;
      const surahData = data.data.surahs[surahNum - 1];
      const ayahData = surahData.ayahs[ayahNumInSurah - 1];
      const meaningText = ayahData.text;
      
      meaningCache[cacheKey] = meaningText;
      contentDiv.innerHTML = `
        <div style="color: var(--accent); font-weight: bold; margin-bottom: 0.5rem; text-align: center; border-bottom: 1px solid var(--glass-border); padding-bottom: 0.5rem;">التفسير الميسر (المعنى)</div>
        <p style="margin: 0; padding: 10px; background: rgba(255, 255, 255, 0.05); border-radius: 8px;">${meaningText}</p>
      `;
    }
  } catch (err) {
    contentDiv.innerHTML = `<p style="color: red; text-align: center;">حدث خطأ أثناء تحميل المعنى. يرجى التأكد من اتصالك بالإنترنت.</p>`;
  }
}

export function closeMeaningModal() {
  const container = document.getElementById('meaning-modal-container');
  if (container) {
    container.innerHTML = '';
  }
}
