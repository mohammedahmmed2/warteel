// src/components/ImageThemeModal.js
import { IMAGE_THEMES } from '../utils/imageThemes.js';

export function openImageThemeModal(onSelectTheme, previewData = null) {
  const container = document.getElementById('image-theme-modal-container');
  if (!container) return;

  const themes = [
    { id: 'light', name: 'النهاري', icon: `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>` },
    { id: 'dark', name: 'الليلي', icon: `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>` },
    { id: 'emerald', name: 'الزمردي', icon: `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/></svg>` },
    { id: 'gold', name: 'الذهبي', icon: `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="2 4 5 13 12 9 19 13 22 4 17 8 12 3 7 8"/><rect x="2" y="17" width="20" height="4" rx="1"/></svg>` },
    { id: 'midnight', name: 'الليل', icon: `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="2"/><line x1="12" y1="2" x2="12" y2="4"/><line x1="12" y1="20" x2="12" y2="22"/></svg>` },
    { id: 'ocean', name: 'المحيط', icon: `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12h4l2-2 4 4 4-4 4 4h2"/><path d="M2 18h4l2-2 4 4 4-4 4 4h2"/></svg>` },
    { id: 'rose', name: 'الوردي', icon: `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22C12 22 17 17 11.5A5.5 5.5 0 0 0 6 11.5C6 17 12 22 12 22Z"/><circle cx="12" cy="11.5" r="2"/></svg>` },
    { id: 'desert', name: 'الصحراء', icon: `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 20h20"/><path d="M3 20c0-4.42 2-8 6-8s6 3.58 6 8"/><path d="M15 20c0-2.21 1.34-4 3-4s3 1.79 3 4"/></svg>` },
    { id: 'amethyst', name: 'الجمشت', icon: `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 2 12 12 22 22 12"/><line x1="2" y1="12" x2="22" y2="12"/><line x1="12" y1="2" x2="12" y2="22"/></svg>` },
    { id: 'royal', name: 'الملكي', icon: `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>` },
    { id: 'minimal', name: 'المبسط', icon: `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="9" y1="3" x2="9" y2="21"/></svg>` },
    { id: 'sakura', name: 'ساكورا', icon: `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3c-1.5 2-3 4-3 6a3 3 0 0 0 6 0c0-2-1.5-4-3-6z"/><path d="M12 21v-8"/><path d="M9 17l3-3 3 3"/></svg>` },
    { id: 'forest', name: 'الغابة', icon: `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 20H7l5-16 5 16z"/><path d="M12 13l4 7"/><path d="M12 13L8 20"/><line x1="12" y1="20" x2="12" y2="22"/></svg>` },
    { id: 'nebula', name: 'السديم', icon: `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="4"/><circle cx="12" cy="12" r="1"/></svg>` },
    { id: 'sunset', name: 'الغروب', icon: `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 18a5 5 0 0 0-10 0"/><line x1="12" y1="9" x2="12" y2="2"/><line x1="4.22" y1="10.22" x2="5.64" y2="11.64"/><line x1="1" y1="18" x2="3" y2="18"/><line x1="21" y1="18" x2="23" y2="18"/><line x1="18.36" y1="11.64" x2="19.78" y2="10.22"/><line x1="23" y1="22" x2="1" y2="22"/><polyline points="8 6 12 2 16 6"/></svg>` }
  ];

  const fonts = [
    { id: 'Amiri Quran', label: 'خط المصحف (Amiri)' },
    { id: 'KFGQPC Uthmanic Script HAFS', label: 'عثماني حفص' },
    { id: 'Noto Naskh Arabic', label: 'نسخ (Noto)' },
    { id: 'Scheherazade New', label: 'شهرزاد' },
    { id: 'Almarai', label: 'المراعي' },
    { id: 'Lateef', label: 'لطيف' },
    { id: 'Cairo', label: 'القاهرة' },
    { id: 'Tajawal', label: 'تجوّل' }
  ];

  let selectedThemeId = 'emerald';
  const defaultText = previewData?.text || 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ';
  const defaultHeader = previewData?.header || 'معاينة النص';

  const baseOptions = previewData?.optionsList || [];
  const optionsList = [...baseOptions, { id: 'watermark', label: 'علامة سراج المائية', defaultChecked: true }];

  let currentPreviewText = defaultText;
  
  const multiAyahEnabled = previewData?.multiAyah?.enabled;
  const currentAyah = previewData?.multiAyah?.currentAyah || 1;
  const totalAyahs = previewData?.multiAyah?.totalAyahs || 1;
  const maxEndAyah = Math.min(currentAyah + 10, totalAyahs);
  
  const truncateText = (txt) => txt.length > 200 ? txt.substring(0, 200) + '…' : txt;
  
  const getMultiAyahText = (endAyah) => {
    let result = '';
    for (let i = currentAyah; i <= endAyah; i++) {
      result += previewData.multiAyah.getAyahText(i) + ' ';
    }
    return result.trim();
  };

  container.innerHTML = `
    <div class="itm-overlay" id="itm-overlay-root">
      <style>
        /* ====== OVERLAY ====== */
        .itm-overlay {
          position: fixed; inset: 0; z-index: 2000;
          background: rgba(0,0,0,0.4);
          backdrop-filter: blur(4px); -webkit-backdrop-filter: blur(4px);
          display: flex; align-items: center; justify-content: center;
          opacity: 0; pointer-events: none;
          transition: opacity 0.3s ease;
          padding: 0.75rem;
          direction: rtl;
          font-family: var(--font-arabic, 'Almarai', sans-serif);
        }
        .itm-overlay.open { opacity: 1; pointer-events: auto; }

        /* ====== MODAL ====== */
        .itm-modal {
          background: var(--bg-card, #fff);
          color: var(--text-primary, #333);
          border-radius: var(--radius-lg, 28px);
          width: 100%;
          box-shadow: var(--shadow-glass, 0 10px 40px rgba(0,0,0,0.2));
          border: 1px solid var(--glass-border, rgba(128,128,128,0.12));
          transform: translateY(20px) scale(0.95);
          transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          overflow: hidden;
          display: flex; flex-direction: column;
        }
        .itm-overlay.open .itm-modal { transform: translateY(0) scale(1); }

        /* ====== HEADER ====== */
        .itm-header {
          display: flex; align-items: center; justify-content: space-between;
          padding: 1.15rem 1.25rem;
          border-bottom: 1px solid var(--glass-border, rgba(128,128,128,0.12));
          background: linear-gradient(135deg, var(--bg-gradient-start, transparent) 0%, transparent 100%);
          flex-shrink: 0;
        }
        .itm-header-title {
          display: flex; align-items: center; gap: 10px;
          font-size: 1.15rem; font-weight: 700;
          color: var(--primary, #D98A44);
        }
        .itm-header-title svg {
          width: 24px; height: 24px;
          color: var(--accent, #D98A44);
          filter: drop-shadow(0 0 6px var(--primary, #D98A44));
          transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1), color 0.3s, filter 0.3s;
        }
        .itm-header:hover .itm-header-title svg {
          transform: scale(1.15) rotate(-5deg);
        }
        .itm-close-btn {
          width: 34px; height: 34px; border-radius: 50%;
          border: none; background: rgba(128,128,128,0.1);
          color: var(--text-secondary, #999);
          cursor: pointer; display: flex; align-items: center; justify-content: center;
          transition: all 0.2s; flex-shrink: 0;
        }
        .itm-close-btn:hover {
          background: rgba(128,128,128,0.2); color: var(--text-primary, #333);
        }

        /* ====== SCROLLABLE BODY ====== */
        .itm-body {
          overflow-y: auto; overflow-x: hidden;
          flex: 1; min-height: 0;
          display: flex; flex-direction: column;
        }

        /* ====== PREVIEW WRAPPER ====== */
        .itm-preview-wrap {
          display: flex; justify-content: center; align-items: center;
          flex-shrink: 0; position: relative;
          background: linear-gradient(180deg, var(--bg-gradient-start, rgba(128,128,128,0.03)) 0%, transparent 100%);
        }

        /* Phone Frame */
        .itm-phone {
          position: relative;
          background: linear-gradient(145deg, rgba(128,128,128,0.15), rgba(128,128,128,0.05));
          box-shadow: var(--shadow-md, 0 8px 24px rgba(0,0,0,0.15));
          transition: box-shadow 0.4s ease, transform 0.3s ease;
          border: 1px solid var(--glass-border, rgba(128,128,128,0.12));
        }
        .itm-phone:hover { transform: scale(1.02); }
        .itm-phone-notch {
          position: absolute; left: 50%; transform: translateX(-50%);
          background: var(--bg-main, #f5f5f5);
          z-index: 5;
          border: 1px solid var(--glass-border, rgba(128,128,128,0.12));
          border-top: none;
        }

        /* Preview Area */
        #theme-preview-area {
          aspect-ratio: 9/16;
          overflow: hidden;
          position: relative;
          display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          transition: background 0.5s ease;
        }
        #preview-watermark {
          position: absolute; bottom: 6px; left: 0; right: 0;
          text-align: center; font-weight: 700;
          opacity: 0; transition: opacity 0.35s ease;
          display: flex; justify-content: center; align-items: center; gap: 3px;
        }

        /* ====== CONTROLS AREA ====== */
        .itm-controls {
          display: flex; flex-direction: column; gap: 1.25rem;
        }

        /* Section Title */
        .itm-sec-title {
          margin: 0 0 0.65rem 0; font-size: 0.95rem; font-weight: 600;
          color: var(--text-secondary, #666);
          display: flex; align-items: center; gap: 8px;
        }
        .itm-sec-title svg {
          width: 18px; height: 18px; opacity: 0.7;
          transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1), color 0.3s, filter 0.3s;
        }
        .itm-sec-title:hover svg {
          transform: scale(1.15) rotate(-5deg);
          color: var(--primary, #D98A44);
          filter: drop-shadow(0 2px 6px var(--primary-light, rgba(217,138,68,0.5)));
        }

        /* ====== THEME SWATCHES ====== */
        .itm-themes-scroll {
          display: flex; gap: 8px; overflow-x: auto;
          padding-bottom: 6px; scroll-behavior: smooth;
          scrollbar-width: none; -webkit-overflow-scrolling: touch;
        }
        .itm-themes-scroll::-webkit-scrollbar { display: none; }

        .itm-sw {
          min-width: 58px; display: flex; flex-direction: column;
          align-items: center; gap: 5px; cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4,0,0.2,1);
          opacity: 0.5; padding: 3px 0;
        }
        .itm-sw:hover { opacity: 0.85; transform: translateY(-3px); }
        .itm-sw.active { opacity: 1; transform: scale(1.05) translateY(-3px); }

        .itm-sw-circle {
          width: 44px; height: 44px; border-radius: 50%;
          border: 2.5px solid transparent;
          display: flex; align-items: center; justify-content: center;
          color: rgba(255,255,255,0.9);
          box-shadow: 0 3px 8px rgba(0,0,0,0.15);
          transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
          position: relative; overflow: hidden;
        }
        .itm-sw-circle svg {
          transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1), filter 0.3s;
        }
        .itm-sw:hover .itm-sw-circle svg {
          transform: scale(1.15) rotate(8deg);
        }
        .itm-sw:active .itm-sw-circle svg {
          transform: scale(0.9) rotate(-4deg);
        }
        .itm-sw-circle::after {
          content: ''; position: absolute; inset: 0; border-radius: 50%;
          background: linear-gradient(135deg, rgba(255,255,255,0.2) 0%, transparent 50%);
          pointer-events: none;
        }
        .itm-sw.active .itm-sw-circle {
          border-color: var(--accent, #D98A44);
          box-shadow: 0 0 0 3px var(--accent-bg, rgba(217,138,68,0.15)), 0 4px 12px rgba(0,0,0,0.2);
        }
        .itm-sw.active .itm-sw-circle svg {
          animation: float-icon 3s ease-in-out infinite;
          filter: drop-shadow(0 2px 6px var(--primary-light, rgba(217,138,68,0.5)));
        }
        .itm-sw-name {
          font-size: 0.65rem; font-weight: 600;
          color: var(--text-muted, #aaa); white-space: nowrap;
          transition: color 0.3s;
        }
        .itm-sw.active .itm-sw-name { color: var(--primary, #D98A44); }

        /* ====== OPTIONS LIST ====== */
        .itm-opts {
          background: var(--bg-main, #fafafa);
          border: 1px solid var(--glass-border, rgba(128,128,128,0.12));
          border-radius: var(--radius-sm, 12px);
          overflow: hidden;
        }
        .itm-opt {
          display: flex; align-items: center; justify-content: space-between;
          padding: 0.75rem 1rem; cursor: pointer;
          border-bottom: 1px solid var(--glass-border, rgba(128,128,128,0.06));
          transition: background 0.15s;
          -webkit-user-select: none; user-select: none;
        }
        .itm-opt:last-child { border-bottom: none; }
        .itm-opt:hover { background: var(--bg-card-hover, rgba(128,128,128,0.03)); }
        .itm-opt:active { background: var(--btn-icon-active-bg, rgba(128,128,128,0.06)); }
        .itm-opt-text {
          font-size: 0.92rem; font-weight: 500; color: var(--text-primary, #333);
        }

        /* Settings-style Switch */
        .itm-switch {
          position: relative; display: inline-block;
          width: 50px; height: 28px; flex-shrink: 0;
        }
        .itm-switch input { opacity: 0; width: 0; height: 0; }
        .itm-switch-slider {
          position: absolute; inset: 0; cursor: pointer;
          background: rgba(128,128,128,0.25);
          border-radius: 28px;
          transition: background 0.3s cubic-bezier(0.4,0,0.2,1);
        }
        .itm-switch-slider::before {
          content: ''; position: absolute;
          height: 20px; width: 20px; bottom: 4px; right: 4px;
          background: white; border-radius: 50%;
          transition: transform 0.3s cubic-bezier(0.4,0,0.2,1);
          box-shadow: 0 2px 5px rgba(0,0,0,0.2);
        }
        .itm-switch input:checked + .itm-switch-slider {
          background: var(--accent, #D98A44);
        }
        .itm-switch input:checked + .itm-switch-slider::before {
          transform: translateX(-22px);
        }

        /* ====== FONT SELECT ====== */
        .itm-font-select {
          width: 100%;
          padding: 0.75rem 1rem;
          font-family: inherit;
          font-size: 0.95rem;
          color: var(--text-primary, #333);
          background-color: var(--bg-main, #fafafa);
          border: 1px solid var(--glass-border, rgba(128,128,128,0.12));
          border-radius: var(--radius-sm, 12px);
          appearance: none;
          outline: none;
          cursor: pointer;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%23888' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: left 1rem center;
        }

        /* ====== LAYOUT RADIOS ====== */
        .itm-radios {
          background: var(--bg-main, #fafafa);
          border: 1px solid var(--glass-border, rgba(128,128,128,0.12));
          border-radius: var(--radius-sm, 12px);
          overflow: hidden;
        }
        .itm-radio {
          display: flex; align-items: center; justify-content: space-between;
          padding: 0.75rem 1rem; cursor: pointer;
          border-bottom: 1px solid var(--glass-border, rgba(128,128,128,0.06));
          transition: background 0.15s;
          -webkit-user-select: none; user-select: none;
        }
        .itm-radio:last-child { border-bottom: none; }
        .itm-radio:hover { background: var(--bg-card-hover, rgba(128,128,128,0.03)); }
        .itm-radio input[type="radio"] {
          width: 18px; height: 18px;
          accent-color: var(--accent, #D98A44);
          cursor: pointer; flex-shrink: 0;
        }

        /* ====== ACTION BUTTONS ====== */
        .itm-actions {
          display: flex; gap: 0.75rem; padding-top: 0.25rem;
        }
        .itm-btn-cancel {
          flex: 1; padding: 0.85rem;
          border-radius: var(--radius-sm, 12px);
          border: 1px solid var(--glass-border, rgba(128,128,128,0.15));
          background: var(--btn-secondary-bg, transparent);
          color: var(--text-secondary, #888); cursor: pointer;
          font-weight: 600; font-size: 0.95rem; font-family: inherit;
          transition: all var(--transition-fast, 0.15s);
          display: flex; align-items: center; justify-content: center; gap: 6px;
        }
        .itm-btn-cancel:hover {
          background: var(--btn-secondary-hover, rgba(128,128,128,0.06));
          color: var(--text-primary, #333); border-color: var(--primary, #D98A44);
        }
        .itm-btn-cancel:active { transform: scale(0.98); }

        .itm-btn-save {
          flex: 2; padding: 0.85rem;
          border-radius: var(--radius-sm, 12px); border: none;
          background: linear-gradient(135deg, var(--accent-light, #E6A86B), var(--accent, #D98A44));
          color: white; cursor: pointer;
          font-weight: 700; font-size: 1rem; font-family: inherit;
          transition: all var(--transition-fast, 0.15s);
          box-shadow: 0 4px 15px var(--accent-bg, rgba(217,138,68,0.3));
          display: flex; align-items: center; justify-content: center; gap: 8px;
          position: relative; overflow: hidden;
        }
        .itm-btn-save svg {
          transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        .itm-btn-save:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(0,0,0,0.15);
          filter: brightness(1.05);
        }
        .itm-btn-save:hover svg { transform: translateY(-2px) scale(1.1); }
        .itm-btn-save:active {
          transform: translateY(0) scale(0.98);
          box-shadow: 0 2px 8px rgba(0,0,0,0.15);
        }

        /* ====== SIZE SLIDER ====== */
        .itm-slider-row {
          display: flex; align-items: center; gap: 10px;
          padding: 0.5rem 0;
        }
        .itm-slider-label { font-size: 0.8rem; color: var(--text-secondary, #888); min-width: 30px; text-align: center; }
        .itm-range {
          flex: 1; height: 4px; appearance: none; -webkit-appearance: none;
          background: var(--glass-border, rgba(128,128,128,0.2));
          border-radius: 4px; outline: none;
        }
        .itm-range::-webkit-slider-thumb {
          appearance: none; -webkit-appearance: none;
          width: 18px; height: 18px; border-radius: 50%;
          background: var(--accent, #D98A44);
          box-shadow: 0 2px 6px rgba(0,0,0,0.2);
          cursor: pointer;
        }
        .itm-range::-moz-range-thumb {
          width: 18px; height: 18px; border-radius: 50%; border: none;
          background: var(--accent, #D98A44);
          box-shadow: 0 2px 6px rgba(0,0,0,0.2);
          cursor: pointer;
        }

        /* ==========================================================
           RESPONSIVE LAYOUTS
           ========================================================== */

        /* ====== LARGE DESKTOP (≥1024px) ====== */
        @media (min-width: 1024px) {
          .itm-modal { max-width: 960px; max-height: 88vh; }
          .itm-body {
            flex-direction: row; align-items: stretch;
            min-height: 520px; overflow: hidden;
          }
          .itm-preview-wrap {
            flex: 1.2; order: 2;
            border-right: 1px solid var(--glass-border, rgba(128,128,128,0.1));
            padding: 2rem;
            display: flex; align-items: center; justify-content: center;
          }
          .itm-phone { padding: 10px; border-radius: 32px; }
          .itm-phone-notch { top: 10px; width: 70px; height: 18px; border-radius: 0 0 12px 12px; }
          #theme-preview-area {
            width: auto; height: 100%; max-height: 460px;
            border-radius: 22px;
          }
          #preview-watermark { font-size: 0.55rem; bottom: 10px; }
          #preview-card { padding: 1rem !important; }
          #preview-inner-card { padding: 0.75rem !important; }
          #preview-header { font-size: 0.6rem !important; margin-bottom: 0.4rem !important; }
          #preview-text { font-size: 0.7rem !important; line-height: 1.8 !important; -webkit-line-clamp: 10 !important; }
          #preview-badges { font-size: 0.45rem !important; margin-top: 6px !important; }
          .itm-controls {
            flex: 1; order: 1;
            max-height: 100%; overflow-y: auto;
            padding: 1.5rem;
          }
        }

        /* ====== TABLET (768px - 1023px) ====== */
        @media (min-width: 768px) and (max-width: 1023px) {
          .itm-modal { max-width: 720px; max-height: 90vh; }
          .itm-body {
            flex-direction: row; align-items: stretch;
            min-height: 420px; overflow: hidden;
          }
          .itm-preview-wrap {
            flex: 1; order: 2;
            border-right: 1px solid var(--glass-border, rgba(128,128,128,0.1));
            padding: 1.5rem 1rem;
          }
          .itm-phone { padding: 8px; border-radius: 26px; }
          .itm-phone-notch { top: 8px; width: 55px; height: 14px; border-radius: 0 0 10px 10px; }
          #theme-preview-area {
            width: auto; height: 100%; max-height: 360px;
            border-radius: 18px;
          }
          #preview-watermark { font-size: 0.5rem; bottom: 8px; }
          #preview-card { padding: 0.85rem !important; }
          #preview-header { font-size: 0.55rem !important; }
          #preview-text { font-size: 0.6rem !important; -webkit-line-clamp: 8 !important; }
          #preview-badges { font-size: 0.4rem !important; }
          .itm-controls {
            flex: 1; order: 1;
            max-height: 100%; overflow-y: auto;
            padding: 1.25rem;
          }
        }

        /* ====== MOBILE (< 768px) ====== */
        @media (max-width: 767px) {
          .itm-modal {
            border-radius: var(--radius-md, 20px);
            max-height: 92vh; max-width: 100%;
          }
          .itm-body {
            flex-direction: column; overflow-y: auto;
          }
          .itm-preview-wrap {
            padding: 1.25rem 1rem 0.75rem;
            border-bottom: 1px solid var(--glass-border, rgba(128,128,128,0.08));
          }
          .itm-phone { padding: 6px; border-radius: 22px; }
          .itm-phone-notch { top: 6px; width: 46px; height: 12px; border-radius: 0 0 8px 8px; }
          #theme-preview-area {
            width: 180px;
            border-radius: 16px;
          }
          #preview-watermark { font-size: 0.45rem; }
          .itm-controls {
            padding: 1rem 1.15rem 1.25rem;
            flex-shrink: 0;
          }
          .itm-sw { min-width: 52px; }
          .itm-sw-circle { width: 40px; height: 40px; }
          .itm-sw-name { font-size: 0.6rem; }
        }

        /* ====== SMALL PHONES (< 390px) ====== */
        @media (max-width: 389px) {
          .itm-modal { border-radius: 16px; }
          .itm-header { padding: 1rem; }
          .itm-header-title { font-size: 1rem; }
          .itm-preview-wrap { padding: 0.75rem 0.5rem 0.5rem; }
          .itm-phone { padding: 4px; border-radius: 18px; }
          .itm-phone-notch { width: 36px; height: 10px; top: 4px; border-radius: 0 0 6px 6px; }
          #theme-preview-area { width: 150px; border-radius: 14px; }
          .itm-controls { padding: 0.75rem 0.85rem 1rem; gap: 1rem; }
          .itm-sw { min-width: 46px; }
          .itm-sw-circle { width: 36px; height: 36px; }
          .itm-sw-circle svg { width: 14px; height: 14px; }
          .itm-sw-name { font-size: 0.55rem; }
          .itm-sec-title { font-size: 0.88rem; }
          .itm-opt { padding: 0.6rem 0.75rem; }
          .itm-opt-text { font-size: 0.85rem; }
          .itm-switch { width: 44px; height: 24px; }
          .itm-switch-slider::before { width: 16px; height: 16px; }
          .itm-switch input:checked + .itm-switch-slider::before { transform: translateX(-20px); }
          .itm-btn-save, .itm-btn-cancel { padding: 0.7rem; font-size: 0.9rem; }
        }

        /* ====== LANDSCAPE MOBILE ====== */
        @media (max-width: 767px) and (orientation: landscape) {
          .itm-modal { max-height: 96vh; }
          .itm-body { flex-direction: row; overflow: hidden; }
          .itm-preview-wrap {
            flex: 0 0 auto; padding: 0.75rem;
            border-bottom: none;
            border-right: 1px solid var(--glass-border, rgba(128,128,128,0.08));
          }
          .itm-phone { padding: 4px; border-radius: 16px; }
          .itm-phone-notch { width: 32px; height: 8px; top: 4px; border-radius: 0 0 6px 6px; }
          #theme-preview-area { width: auto; height: 100%; max-height: 55vh; border-radius: 12px; }
          .itm-controls { flex: 1; overflow-y: auto; padding: 0.75rem 1rem; }
        }

        /* ====== KEYFRAMES ====== */
        @keyframes float-icon {
          0% { transform: translateY(0) scale(1.05); }
          50% { transform: translateY(-2px) scale(1.05); }
          100% { transform: translateY(0) scale(1.05); }
        }
      </style>

      <div class="itm-modal">
        <!-- Header -->
        <div class="itm-header">
          <div class="itm-header-title">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
            استوديو الصورة
          </div>
          <button class="itm-close-btn" id="itm-close-x">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        <div class="itm-body">
          <!-- Controls -->
          <div class="itm-controls">
            <!-- Themes -->
            <div>
              <h3 class="itm-sec-title">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"/><circle cx="7.5" cy="11.5" r="1.5"/><circle cx="10" cy="7.5" r="1.5"/><circle cx="15" cy="7.5" r="1.5"/><circle cx="17.5" cy="11.5" r="1.5"/></svg>
                المظهر
              </h3>
              <div class="itm-themes-scroll">
                ${themes.map(t => {
                  const td = IMAGE_THEMES[t.id] || IMAGE_THEMES['emerald'];
                  return `<div class="itm-sw" data-theme="${t.id}">
                    <div class="itm-sw-circle" style="background: linear-gradient(145deg, ${td.bgStart}, ${td.bgEnd});">${t.icon}</div>
                    <span class="itm-sw-name">${t.name}</span>
                  </div>`;
                }).join('')}
              </div>
            </div>

            <!-- Font -->
            <div>
              <h3 class="itm-sec-title">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="4 7 4 4 20 4 20 7"/><line x1="9" y1="20" x2="15" y2="20"/><line x1="12" y1="4" x2="12" y2="20"/></svg>
                الخط
              </h3>
              <select class="itm-font-select" id="itm-font-picker">
                ${fonts.map(f => `<option value="${f.id}" ${f.id === 'Amiri Quran' ? 'selected' : ''}>${f.label}</option>`).join('')}
              </select>
            </div>

            <!-- Multi Ayah -->
            ${multiAyahEnabled ? `
            <div>
              <h3 class="itm-sec-title">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
                نطاق الآيات
              </h3>
              <div class="itm-slider-row" style="margin-bottom:0.5rem; justify-content:center;">
                <span id="itm-multi-ayah-label" style="font-size:0.9rem;font-weight:600;color:var(--text-primary);">من آية ${currentAyah} إلى آية ${currentAyah}</span>
              </div>
              <div class="itm-slider-row">
                <span class="itm-slider-label">${currentAyah}</span>
                <input type="range" class="itm-range" id="itm-multi-ayah-slider" min="${currentAyah}" max="${maxEndAyah}" value="${currentAyah}" step="1">
                <span class="itm-slider-label">${maxEndAyah}</span>
              </div>
            </div>
            ` : ''}

            <!-- Options -->
            ${optionsList.length > 0 ? `
            <div>
              <h3 class="itm-sec-title">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>
                العناصر المضمنة
              </h3>
              <div class="itm-opts">
                ${optionsList.map(opt => opt.hidden ? '' : `
                  <label class="itm-opt">
                    <span class="itm-opt-text">${opt.label}</span>
                    <label class="itm-switch">
                      <input type="checkbox" id="opt-${opt.id}" ${opt.defaultChecked ? 'checked' : ''}>
                      <span class="itm-switch-slider"></span>
                    </label>
                  </label>
                `).join('')}
              </div>
            </div>
            ` : ''}

            <!-- Font Size -->
            <div>
              <h3 class="itm-sec-title">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="4 7 4 4 20 4 20 7"/><line x1="9" y1="20" x2="15" y2="20"/><line x1="12" y1="4" x2="12" y2="20"/></svg>
                حجم الخط
              </h3>
              <div class="itm-slider-row">
                <span class="itm-slider-label">ص</span>
                <input type="range" class="itm-range" id="itm-font-size" min="0" max="2" value="1" step="1">
                <span class="itm-slider-label" style="font-size: 1.1rem; font-weight: bold;">ك</span>
              </div>
            </div>

            <!-- Layout Mode -->
            ${defaultText.length > 350 ? `
            <div>
              <h3 class="itm-sec-title">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>
                تخطيط النص الطويل
              </h3>
              <div class="itm-radios">
                <label class="itm-radio">
                  <span class="itm-opt-text">تمديد الصورة</span>
                  <input type="radio" name="layoutMode" value="extend" checked>
                </label>
                <label class="itm-radio">
                  <span class="itm-opt-text">تصغير الخط</span>
                  <input type="radio" name="layoutMode" value="shrink">
                </label>
                <label class="itm-radio">
                  <span class="itm-opt-text">تقسيم لعدة صور</span>
                  <input type="radio" name="layoutMode" value="split">
                </label>
              </div>
            </div>
            ` : ''}

            <!-- Actions -->
            <div class="itm-actions">
              <button class="itm-btn-cancel" id="cancel-theme-btn">إلغاء</button>
              <button class="itm-btn-save" id="save-theme-btn">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                حفظ الصورة
              </button>
            </div>
          </div>

          <!-- Preview -->
          <div class="itm-preview-wrap">
            <div class="itm-phone">
              <div class="itm-phone-notch"></div>
              <div id="theme-preview-area">
                <div id="preview-circle1" style="position:absolute;top:-10%;right:-10%;width:50%;padding-bottom:50%;border-radius:50%;transition:background 0.5s ease;"></div>
                <div id="preview-circle2" style="position:absolute;bottom:-10%;left:-10%;width:60%;padding-bottom:60%;border-radius:50%;transition:background 0.5s ease;"></div>
                <div id="preview-card" style="position:relative;z-index:1;width:86%;padding:0.7rem;text-align:center;border-radius:8px;transition:all 0.5s ease;direction:rtl;max-height:82%;overflow:hidden;display:flex;flex-direction:column;justify-content:center;backdrop-filter:blur(10px);">
                  <div id="preview-inner-card" style="border:1px solid transparent;padding:0.5rem;border-radius:6px;transition:border-color 0.5s ease;max-height:100%;overflow:hidden;display:flex;flex-direction:column;">
                    <h4 id="preview-header" style="margin:0 0 0.3rem;font-size:0.45rem;transition:color 0.5s;opacity:0.9;font-weight:700;">${defaultHeader}</h4>
                    <div style="height:1px;background:currentColor;opacity:0.1;margin-bottom:0.3rem;"></div>
                    <p id="preview-text" style="margin:0;font-size:0.5rem;font-weight:bold;line-height:1.65;transition:color 0.5s;font-family:'Amiri Quran',var(--quran-font,inherit);display:-webkit-box;-webkit-line-clamp:7;-webkit-box-orient:vertical;overflow:hidden;">${truncateText(currentPreviewText)}</p>
                    <div id="preview-badges" style="margin-top:4px;display:flex;gap:2px;flex-wrap:wrap;justify-content:center;font-size:0.35rem;font-family:var(--font-arabic);"></div>
                  </div>
                </div>
                <div id="preview-watermark">
                  <svg viewBox="0 0 24 24" width="7" height="7" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/><circle cx="15" cy="8" r="1" fill="currentColor"/></svg>
                  تطبيق سراج
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  // References
  const overlay = container.querySelector('#itm-overlay-root');
  const previewArea = container.querySelector('#theme-preview-area');
  const previewCircle1 = container.querySelector('#preview-circle1');
  const previewCircle2 = container.querySelector('#preview-circle2');
  const previewCard = container.querySelector('#preview-card');
  const previewInnerCard = container.querySelector('#preview-inner-card');
  const previewHeader = container.querySelector('#preview-header');
  const previewText = container.querySelector('#preview-text');
  const previewWatermark = container.querySelector('#preview-watermark');
  const swatches = container.querySelectorAll('.itm-sw');
  const fontSizeSlider = container.querySelector('#itm-font-size');
  const fontPicker = container.querySelector('#itm-font-picker');
  const multiAyahSlider = container.querySelector('#itm-multi-ayah-slider');
  const multiAyahLabel = container.querySelector('#itm-multi-ayah-label');

  // Font size mapping
  const fontSizes = ['0.4rem', '0.5rem', '0.62rem'];
  if (fontSizeSlider) {
    fontSizeSlider.addEventListener('input', () => {
      previewText.style.fontSize = fontSizes[parseInt(fontSizeSlider.value)];
    });
  }

  // Font Picker
  if (fontPicker) {
    fontPicker.addEventListener('change', () => {
      previewText.style.fontFamily = `'${fontPicker.value}', var(--quran-font, inherit)`;
    });
  }
  
  // Multi Ayah Slider
  if (multiAyahSlider && multiAyahLabel && multiAyahEnabled) {
    multiAyahSlider.addEventListener('input', () => {
      const endVal = parseInt(multiAyahSlider.value);
      multiAyahLabel.textContent = `من آية ${currentAyah} إلى آية ${endVal}`;
      const fullText = getMultiAyahText(endVal);
      currentPreviewText = fullText;
      previewText.textContent = truncateText(currentPreviewText);
    });
  }

  const updatePreview = (themeId) => {
    const t = IMAGE_THEMES[themeId] || IMAGE_THEMES['emerald'];
    previewArea.style.background = `linear-gradient(to bottom, ${t.bgStart}, ${t.bgEnd})`;
    previewCircle1.style.background = t.circle1;
    previewCircle2.style.background = t.circle2;
    previewCard.style.background = t.cardBg;
    previewCard.style.border = `1px solid ${t.cardBorder}`;
    previewCard.style.boxShadow = `0 4px 16px ${t.cardShadow}`;
    previewInnerCard.style.borderColor = t.innerBorder;
    previewHeader.style.color = t.headerText;
    previewText.style.color = t.mainText;
    previewWatermark.style.color = t.headerText;

    swatches.forEach(swatch => {
      const circle = swatch.querySelector('.itm-sw-circle');
      if (swatch.getAttribute('data-theme') === themeId) {
        swatch.classList.add('active');
        circle.style.borderColor = 'var(--accent, #D98A44)';
      } else {
        swatch.classList.remove('active');
        circle.style.borderColor = 'transparent';
      }
    });
  };

  updatePreview(selectedThemeId);

  // Open
  requestAnimationFrame(() => { requestAnimationFrame(() => { overlay.classList.add('open'); }); });
  document.body.style.overflow = 'hidden';

  const closeModal = () => {
    overlay.classList.remove('open');
    document.body.style.overflow = '';
    setTimeout(() => { container.innerHTML = ''; }, 350);
  };

  const updateBadges = () => {
    const badges = container.querySelector('#preview-badges');
    if (!badges) return;
    badges.innerHTML = '';
    const t = IMAGE_THEMES[selectedThemeId] || IMAGE_THEMES['emerald'];

    optionsList.forEach(opt => {
      if (opt.hidden) return;
      if (opt.id === 'watermark') {
        const chk = container.querySelector('#opt-watermark');
        previewWatermark.style.opacity = (chk && chk.checked) ? '0.9' : '0';
        return;
      }
      const chk = container.querySelector(`#opt-${opt.id}`);
      if (chk && chk.checked) {
        badges.innerHTML += `<span style="background:rgba(255,255,255,0.1);padding:1.5px 5px;border-radius:4px;color:${t.mainText};border:1px solid rgba(255,255,255,0.08);font-weight:600;opacity:0.85;">+ ${opt.label}</span>`;
      }
    });
  };
  updateBadges();

  // Events
  container.querySelector('#itm-close-x').addEventListener('click', closeModal);
  container.querySelector('#cancel-theme-btn').addEventListener('click', closeModal);
  overlay.addEventListener('click', (e) => { if (e.target === overlay) closeModal(); });

  container.querySelector('#save-theme-btn').addEventListener('click', () => {
    closeModal();
    let options = {};
    optionsList.forEach(opt => {
      if (opt.hidden) return;
      const chk = container.querySelector(`#opt-${opt.id}`);
      if (chk) options[opt.id] = chk.checked;
    });
    const layoutModeInput = container.querySelector('input[name="layoutMode"]:checked');
    options.layoutMode = layoutModeInput ? layoutModeInput.value : 'extend';

    // Font size option
    if (fontSizeSlider) {
      const sizeMap = ['small', 'medium', 'large'];
      options.fontSizePreference = sizeMap[parseInt(fontSizeSlider.value)];
    }
    
    // Font family
    if (fontPicker) {
      options.fontFamily = fontPicker.value;
    }
    
    // Multi Ayah End
    if (multiAyahEnabled && multiAyahSlider) {
      options.multiAyahEnd = parseInt(multiAyahSlider.value);
    }

    if (onSelectTheme) onSelectTheme(selectedThemeId, options);
  });

  optionsList.forEach(opt => {
    if (opt.hidden) return;
    const chk = container.querySelector(`#opt-${opt.id}`);
    if (chk) chk.addEventListener('change', updateBadges);
  });

  swatches.forEach(swatch => {
    swatch.addEventListener('click', () => {
      selectedThemeId = swatch.getAttribute('data-theme');
      updatePreview(selectedThemeId);
      updateBadges();
      swatch.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    });
  });

  // ESC
  const handleKey = (e) => { if (e.key === 'Escape') { closeModal(); document.removeEventListener('keydown', handleKey); } };
  document.addEventListener('keydown', handleKey);
}
