import { t } from '../utils/i18n.js';
import { Dialog } from './Dialog.js';

let asbabDataCache = null;

export async function preloadAsbabData() {
  if (asbabDataCache) return;
  try {
    const res = await fetch('/src/assets/data/asbab_al_nuzul.json');
    if (res.ok) {
      asbabDataCache = await res.json();
    } else {
      asbabDataCache = {};
    }
  } catch (e) {
    asbabDataCache = {};
  }
}

export function hasAsbabForAyah(surahNum, ayahNum) {
  if (!asbabDataCache) return false;
  return !!asbabDataCache[`${surahNum}_${ayahNum}`];
}

export function AsbabAlNuzulModal() {
  const container = document.createElement('div');
  container.id = 'asbab-modal-container';
  return container;
}

export async function openAsbabModal(surahNum, ayahNumInSurah, ayahText) {
  let container = document.getElementById('asbab-modal-container');
  if (!container) {
    // Inject if not present
    container = AsbabAlNuzulModal();
    document.body.appendChild(container);
  }

  // Show loading Dialog
  container.innerHTML = '';
  const dialogContent = document.createElement('div');
  dialogContent.innerHTML = `
    <div style="font-family: var(--quran-font); font-size: 1.5rem; text-align: right; color: var(--text-primary); margin-bottom: 1.5rem; line-height: 2;">${ayahText}</div>
    <div id="asbab-content" style="font-family: var(--font-arabic); color: var(--text-secondary); line-height: 1.8; text-align: justify; font-size: 1rem; max-height: 50vh; overflow-y: auto; padding: 0.5rem; background: var(--bg-main); border-radius: 8px; position: relative;">
      <div style="text-align: center;">${t('loading') || 'جاري التحميل...'}</div>
    </div>
  `;

  const dialog = Dialog({
    title: 'سبب النزول',
    content: dialogContent,
    confirmText: t('back') || 'رجوع',
    cancelText: '', // No cancel button
    onConfirm: () => closeAsbabModal()
  });
  
  container.appendChild(dialog);

  const contentDiv = dialogContent.querySelector('#asbab-content');

  try {
    await preloadAsbabData();
    const cacheKey = `${surahNum}_${ayahNumInSurah}`;
    const asbabText = asbabDataCache[cacheKey];

    if (asbabText) {
      // It is Causal Revelation (نزول سببي)
      contentDiv.innerHTML = `
        <div style="display: flex; align-items: center; justify-content: center; margin-bottom: 1rem;">
          <span style="background: rgba(255, 152, 0, 0.2); color: #ff9800; padding: 4px 12px; border-radius: 20px; font-size: 0.85rem; font-weight: bold; border: 1px solid rgba(255, 152, 0, 0.4);">
            نزول سببي
          </span>
        </div>
        <p style="margin: 0; text-align: justify; padding: 10px; background: rgba(255, 255, 255, 0.05); border-radius: 8px; border-right: 3px solid #ff9800;">
          ${asbabText}
        </p>
      `;
    } else {
      contentDiv.innerHTML = `<p style="color: var(--text-secondary); text-align: center;">لا يوجد سبب نزول مسجل لهذه الآية.</p>`;
    }
  } catch (err) {
    contentDiv.innerHTML = `<p style="color: red; text-align: center;">حدث خطأ أثناء تحميل البيانات.</p>`;
  }
}

export function closeAsbabModal() {
  const container = document.getElementById('asbab-modal-container');
  if (container) {
    container.innerHTML = '';
  }
}
