import { state, forceReRender } from '../app.js';
import { Input } from '../components/Input.js';
import { t, setLanguage } from '../utils/i18n.js';
import { QURAN_EDITIONS, AUDIO_RECITERS } from '../utils/quranEditions.js';

export function SettingsPage(navigate) {
  const container = document.createElement('div');
  container.className = 'settings-page animate-fade-in';
  
  container.innerHTML = `
    <header class="settings-header">
      <h2>${t('settings_title')}</h2>
      <p class="settings-subtitle">قم بتخصيص التطبيق ليناسب تفضيلاتك</p>
    </header>

    <div class="settings-content">
      
      <!-- General Section -->
      <section class="settings-group">
        <div class="settings-group-header">
          <div class="settings-group-icon">
            <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
          </div>
          <h3>عام</h3>
        </div>
        <div class="settings-card">
          <div class="setting-item">
            <div class="setting-info">
              <label>${t('language')}</label>
              <span class="setting-desc">لغة واجهة التطبيق</span>
            </div>
            <div class="setting-control">
              <select id="language-select" class="settings-select">
                <option value="ar" ${state.language === 'ar' ? 'selected' : ''}>${t('language_ar')}</option>
                <option value="en" ${state.language === 'en' ? 'selected' : ''}>${t('language_en')}</option>
              </select>
            </div>
          </div>
          <div class="setting-item">
            <div class="setting-info">
              <label>تنسيق الوقت</label>
            </div>
            <div class="setting-control">
              <select id="time-format-select" class="settings-select">
                <option value="12" ${state.timeFormat === '12' ? 'selected' : ''}>12 ساعة (ص/م)</option>
                <option value="24" ${state.timeFormat === '24' ? 'selected' : ''}>24 ساعة</option>
              </select>
            </div>
          </div>
          <div class="setting-item">
            <div class="setting-info">
              <label>التاريخ الرئيسي</label>
              <span class="setting-desc">التاريخ الذي يظهر بخط غامق</span>
            </div>
            <div class="setting-control">
              <select id="date-format-select" class="settings-select">
                <option value="gregorian" ${state.dateFormat === 'gregorian' ? 'selected' : ''}>ميلادي</option>
                <option value="hijri" ${state.dateFormat === 'hijri' ? 'selected' : ''}>هجري</option>
              </select>
            </div>
          </div>
          <div class="setting-item">
            <div class="setting-info">
              <label>طريقة الحساب (مواقيت الصلاة)</label>
              <span class="setting-desc">اختر الهيئة أو المؤسسة المعتمدة</span>
            </div>
            <div class="setting-control">
              <select id="calculation-method-select" class="settings-select">
                <option value="UmmAlQura" ${state.calculationMethod === 'UmmAlQura' ? 'selected' : ''}>جامعة أم القرى (الافتراضي)</option>
                <option value="MuslimWorldLeague" ${state.calculationMethod === 'MuslimWorldLeague' ? 'selected' : ''}>رابطة العالم الإسلامي</option>
                <option value="Egyptian" ${state.calculationMethod === 'Egyptian' ? 'selected' : ''}>الهيئة المصرية العامة للمساحة</option>
                <option value="MoonsightingCommittee" ${state.calculationMethod === 'MoonsightingCommittee' ? 'selected' : ''}>لجنة رؤية الهلال</option>
                <option value="NorthAmerica" ${state.calculationMethod === 'NorthAmerica' ? 'selected' : ''}>الجمعية الإسلامية لأمريكا الشمالية (ISNA)</option>
                <option value="Kuwait" ${state.calculationMethod === 'Kuwait' ? 'selected' : ''}>الكويت</option>
                <option value="Qatar" ${state.calculationMethod === 'Qatar' ? 'selected' : ''}>قطر</option>
                <option value="Dubai" ${state.calculationMethod === 'Dubai' ? 'selected' : ''}>دبي (الإمارات)</option>
              </select>
            </div>
          </div>
          <div class="setting-item">
            <div class="setting-info">
              <label>مذهب حساب العصر</label>
              <span class="setting-desc">المذهب الفقهي المتبع</span>
            </div>
            <div class="setting-control">
              <select id="madhab-select" class="settings-select">
                <option value="Shafi" ${state.madhab === 'Shafi' ? 'selected' : ''}>شافعي، مالكي، حنبلي (أغلبية)</option>
                <option value="Hanafi" ${state.madhab === 'Hanafi' ? 'selected' : ''}>المذهب الحنفي</option>
              </select>
            </div>
          </div>
        </div>
      </section>

      <!-- Appearance Section -->
      <section class="settings-group">
        <div class="settings-group-header">
          <div class="settings-group-icon">
            <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
          </div>
          <h3>${t('appearance')}</h3>
        </div>
        <div class="settings-card">
          <div class="setting-item">
            <div class="setting-info">
              <label>${t('primary_theme')}</label>
              <span class="setting-desc">اختر لون التطبيق الأساسي</span>
            </div>
            <div class="setting-control">
              <select id="color-theme-select" class="settings-select">
                <option value="muslimeen" ${state.colorTheme === 'muslimeen' ? 'selected' : ''}>${t('theme_gold')}</option>
                <option value="purple" ${state.colorTheme === 'purple' ? 'selected' : ''}>${t('theme_purple')}</option>
                <option value="teal" ${state.colorTheme === 'teal' ? 'selected' : ''}>${t('theme_teal')}</option>
              </select>
            </div>
          </div>
          
          <div class="setting-item">
            <div class="setting-info">
              <label>${t('dark_mode')}</label>
              <span class="setting-desc">تفعيل الوضع الليلي لإراحة العين</span>
            </div>
            <div class="setting-control">
              <label class="settings-switch">
                <input type="checkbox" id="theme-toggle" ${state.theme === 'dark' ? 'checked' : ''}>
                <span class="switch-slider"></span>
              </label>
            </div>
          </div>
        </div>
      </section>

      <!-- Quran Settings Section -->
      <section class="settings-group">
        <div class="settings-group-header">
          <div class="settings-group-icon">
            <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>
          </div>
          <h3>إعدادات القراءة</h3>
        </div>
        <div class="settings-card">
          <!-- Mushaf Edition -->
          <div class="setting-item">
            <div class="setting-info">
              <label>الرواية والمصحف</label>
              <span class="setting-desc">اختر المصحف والرواية التي تفضل القراءة بها</span>
            </div>
            <div class="setting-control">
              <select id="mushaf-edition-select" class="settings-select">
                ${QURAN_EDITIONS.map(ed => `<option value="${ed.id}" ${state.mushafEdition === ed.id ? 'selected' : ''}>${ed.name}</option>`).join('')}
              </select>
            </div>
          </div>

          <!-- Audio Reciter -->
          <div class="setting-item">
            <div class="setting-info">
              <label>القارئ (التلاوة الصوتية)</label>
              <span class="setting-desc">اختر القارئ المفضل للتشغيل الصوتي</span>
            </div>
            <div class="setting-control">
              <select id="audio-reciter-select" class="settings-select">
                ${AUDIO_RECITERS.map(rec => `<option value="${rec.id}" ${state.audioReciter === rec.id ? 'selected' : ''}>${rec.name}</option>`).join('')}
              </select>
            </div>
          </div>

          <div class="setting-item-column">
            <div class="setting-info-row">
              <label>حجم خط القراءة</label>
              <span class="value-display" id="font-size-display">${state.quranFontSize || 24}px</span>
            </div>
            <div class="setting-control-full">
              <input type="range" id="font-size" min="16" max="48" value="${state.quranFontSize || 24}" class="settings-range">
            </div>
          </div>
          
          <!-- App Font (for UI) -->
          <div class="setting-item">
            <div class="setting-info">
              <label>خط التطبيق (الواجهة)</label>
              <span class="setting-desc">الخط المستخدم في واجهة التطبيق</span>
            </div>
            <div class="setting-control">
              <select id="app-font-select" class="settings-select">
                <option value="'Almarai', 'Tajawal', sans-serif" ${(state.appFont || "'Almarai', 'Tajawal', sans-serif") === "'Almarai', 'Tajawal', sans-serif" ? 'selected' : ''}>Almarai (المراعي)</option>
                <option value="'Tajawal', sans-serif" ${state.appFont === "'Tajawal', sans-serif" ? 'selected' : ''}>Tajawal (تجوال)</option>
                <option value="'Cairo', sans-serif" ${state.appFont === "'Cairo', sans-serif" ? 'selected' : ''}>Cairo (كايرو)</option>
                <option value="'IBM Plex Arabic', sans-serif" ${state.appFont === "'IBM Plex Arabic', sans-serif" ? 'selected' : ''}>IBM Plex Arabic</option>
              </select>
            </div>
          </div>

          <!-- Quran Font -->
          <div class="setting-item">
            <div class="setting-info">
              <label>${t('quran_font')} (المصحف)</label>
              <span class="setting-desc">خط عرض النص القرآني</span>
            </div>
            <div class="setting-control">
              <select id="quran-font-select" class="settings-select">
                <option value="'KFGQPC Uthmanic Script HAFS', 'Amiri Quran', serif" ${state.quranFont === "'KFGQPC Uthmanic Script HAFS', 'Amiri Quran', serif" || !state.quranFont ? 'selected' : ''}>📖 مصحف المدينة (حفص الرسم العثماني)</option>
                <option value="'KFGQPC Uthman Taha Naskh', 'Amiri Quran', serif" ${state.quranFont === "'KFGQPC Uthman Taha Naskh', 'Amiri Quran', serif" ? 'selected' : ''}>📜 عثمان طه النسخ</option>
                <option value="'Amiri Quran', serif" ${state.quranFont === "'Amiri Quran', serif" ? 'selected' : ''}>📜 أميري مصحف (Amiri Quran)</option>
                <option value="'Scheherazade New', serif" ${state.quranFont === "'Scheherazade New', serif" ? 'selected' : ''}>✒️ شهرزاد المصحف (Scheherazade)</option>
                <option value="'Noto Naskh Arabic', serif" ${state.quranFont === "'Noto Naskh Arabic', serif" ? 'selected' : ''}>🖋️ النسخ الحديث (Noto Naskh)</option>
                <option value="'Noto Kufi Arabic', sans-serif" ${state.quranFont === "'Noto Kufi Arabic', sans-serif" ? 'selected' : ''}>🏛️ الكوفي الحديث (Noto Kufi)</option>
                <option value="'Lateef', serif" ${state.quranFont === "'Lateef', serif" ? 'selected' : ''}>🎨 لطيف القرآني (Lateef)</option>
                <option value="'Aref Ruqaa', serif" ${state.quranFont === "'Aref Ruqaa', serif" ? 'selected' : ''}>✒️ خط الرقعة (Aref Ruqaa)</option>
                <option value="'Tajawal', sans-serif" ${state.quranFont === "'Tajawal', sans-serif" ? 'selected' : ''}>📱 تجول الحديث (Tajawal)</option>
                <option value="'Cairo', sans-serif" ${state.quranFont === "'Cairo', sans-serif" ? 'selected' : ''}>🖥️ كايرو الحديث (Cairo)</option>
                <option value="'Almarai', sans-serif" ${state.quranFont === "'Almarai', sans-serif" ? 'selected' : ''}>✨ المراعي الحديث (Almarai)</option>
              </select>
            </div>
          </div>

          <div class="setting-item">
            <div class="setting-info">
              <label>التفسير الافتراضي</label>
              <span class="setting-desc">اختر كتاب التفسير المفضل</span>
            </div>
            <div class="setting-control">
              <select id="tafsir-select" class="settings-select">
                <option value="ar.saadi" ${state.tafsirEdition === 'ar.saadi' ? 'selected' : ''}>تفسير السعدي</option>
                <option value="ar.muyassar" ${state.tafsirEdition === 'ar.muyassar' ? 'selected' : ''}>تفسير الميسر</option>
                <option value="ar.jalalayn" ${state.tafsirEdition === 'ar.jalalayn' ? 'selected' : ''}>تفسير الجلالين</option>
                <option value="ar.waseet" ${state.tafsirEdition === 'ar.waseet' ? 'selected' : ''}>التفسير الوسيط</option>
                <option value="ar.ibnkathir" ${state.tafsirEdition === 'ar.ibnkathir' ? 'selected' : ''}>تفسير ابن كثير</option>
                <option value="ar.qurtubi" ${state.tafsirEdition === 'ar.qurtubi' ? 'selected' : ''}>تفسير القرطبي</option>
                <option value="ar.tabari" ${state.tafsirEdition === 'ar.tabari' ? 'selected' : ''}>تفسير الطبري</option>
              </select>
            </div>
          </div>
          
          <div class="setting-item">
            <div class="setting-info">
              <label>${t('color_harakat')}</label>
            </div>
            <div class="setting-control d-flex gap-3 align-center">
              <input type="color" id="harakat-color-picker" value="${state.harakatColor || '#D98A44'}" ${!state.colorHarakat ? 'disabled' : ''} class="settings-color-picker">
              <label class="settings-switch">
                <input type="checkbox" id="color-harakat-toggle" ${state.colorHarakat ? 'checked' : ''}>
                <span class="switch-slider"></span>
              </label>
            </div>
          </div>
          
          <div class="setting-item">
            <div class="setting-info">
              <label>${t('color_allah')}</label>
            </div>
            <div class="setting-control">
              <label class="settings-switch">
                <input type="checkbox" id="color-allah-toggle" ${state.colorAllah ? 'checked' : ''}>
                <span class="switch-slider"></span>
              </label>
            </div>
          </div>

          <div class="setting-item">
            <div class="setting-info">
              <label>${t('color_tajweed') || 'أحكام التجويد الملونة'}</label>
            </div>
            <div class="setting-control">
              <label class="settings-switch">
                <input type="checkbox" id="color-tajweed-toggle" ${state.colorTajweed ? 'checked' : ''}>
                <span class="switch-slider"></span>
              </label>
            </div>
          </div>
          <div class="setting-item">
            <div class="setting-info">
              <label>ترجمة الكلمة بكلمة</label>
              <span class="setting-desc">إظهار ترجمة لكل كلمة أسفلها</span>
            </div>
            <div class="setting-control">
              <label class="settings-switch">
                <input type="checkbox" id="word-by-word-toggle" ${state.wordByWordTranslation ? 'checked' : ''}>
                <span class="switch-slider"></span>
              </label>
            </div>
          </div>
          <div class="setting-item">
            <div class="setting-info">
              <label>إبقاء الشاشة مضاءة</label>
              <span class="setting-desc">منع قفل الشاشة أثناء قراءة القرآن</span>
            </div>
            <div class="setting-control">
              <label class="settings-switch">
                <input type="checkbox" id="keep-awake-toggle" ${state.keepAwake ? 'checked' : ''}>
                <span class="switch-slider"></span>
              </label>
            </div>
          </div>
        </div>
      </section>

      <!-- AI Settings Section -->
      <section class="settings-group">
        <div class="settings-group-header">
          <div class="settings-group-icon">
            <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a10 10 0 1 0 10 10H12V2z"></path><path d="M12 12 2.1 7.1"></path><path d="M12 12l9.9-4.9"></path></svg>
          </div>
          <h3>${t('ai_teacher')}</h3>
        </div>
        <div class="settings-card">
          <div class="setting-item-column">
            <div class="setting-info-row" style="margin-bottom: 0.5rem;">
              <label>${t('speech_model')}</label>
            </div>
            <p class="setting-desc" style="margin-bottom: 1rem;">${t('ai_hint')}</p>
            <div class="setting-control-full">
              <select id="ai-model-select" class="settings-select" style="width: 100%;">
                <option value="faster-whisper" ${state.aiModel === 'faster-whisper' ? 'selected' : ''}>${t('model_faster_whisper')}</option>
                <option value="vosk" ${state.aiModel === 'vosk' ? 'selected' : ''}>${t('model_vosk')}</option>
                <option value="whisper-tiny" ${state.aiModel === 'whisper-tiny' ? 'selected' : ''}>${t('model_whisper_tiny')}</option>
                <option value="whisper-base" ${state.aiModel === 'whisper-base' ? 'selected' : ''}>${t('model_whisper_base')}</option>
              </select>
            </div>
            
            <div class="setting-info-row" style="margin-top: 1rem; background: var(--accent-bg); padding: 1rem; border-radius: var(--radius-sm); align-items: start; gap: 0.5rem;">
              <svg viewBox="0 0 24 24" width="20" height="20" stroke="var(--accent)" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink: 0; margin-top: 2px;"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
              <div>
                <strong style="color: var(--accent); font-size: 0.9rem;">${t('ai_warning')}</strong>
                <p style="font-size: 0.85rem; color: var(--text-secondary); margin-top: 0.25rem;">${t('ai_warning_desc')}</p>
              </div>
            </div>
          </div>
          
          <div class="setting-item">
            <div class="setting-info">
              <label>${t('preload_model')}</label>
            </div>
            <div class="setting-control">
              <button class="settings-btn secondary-btn" id="preload-model-btn">
                <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                تنزيل
              </button>
            </div>
          </div>
        </div>
      </section>

      <!-- Backup Section -->
      <section class="settings-group">
        <div class="settings-group-header">
          <div class="settings-group-icon">
            <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
          </div>
          <h3>إعدادات النسخ</h3>
        </div>
        <div class="settings-card">
          <div class="setting-item">
            <div class="setting-info">
              <label>الأقواس القرآنية</label>
              <span class="setting-desc">إحاطة الآية المنسوخة بـ ﴿ ﴾</span>
            </div>
            <div class="setting-control">
              <label class="settings-switch">
                <input type="checkbox" id="copy-brackets-toggle" ${state.copyBrackets ? 'checked' : ''}>
                <span class="switch-slider"></span>
              </label>
            </div>
          </div>
          <div class="setting-item">
            <div class="setting-info">
              <label>نمط الترقيم عند النسخ</label>
              <span class="setting-desc">شكل رقم الآية داخل النص المنسوخ</span>
            </div>
            <div class="setting-control">
              <select id="copy-ayah-style-select" class="premium-select" style="max-width:180px;">
                <option value="modern" ${(!state.copyAyahStyle || state.copyAyahStyle === 'modern') ? 'selected' : ''}>(1) الحديث</option>
                <option value="classic" ${(state.copyAyahStyle === 'classic' || (state.copyAyahStyle === undefined && state.copySymbol === true)) ? 'selected' : ''}>١ الكلاسيكي ۝</option>
                <option value="none" ${(state.copyAyahStyle === 'none' || state.copySymbol === false) ? 'selected' : ''}>بدون رقم</option>
              </select>
            </div>
          </div>
          <div class="setting-item">
            <div class="setting-info">
              <label>التشكيل</label>
              <span class="setting-desc">نسخ الآيات مع الحركات</span>
            </div>
            <div class="setting-control">
              <label class="settings-switch">
                <input type="checkbox" id="copy-tashkeel-toggle" ${state.copyTashkeel ? 'checked' : ''}>
                <span class="switch-slider"></span>
              </label>
            </div>
          </div>
          <div class="setting-item">
            <div class="setting-info">
              <label>معلومات الآية</label>
              <span class="setting-desc">إضافة اسم السورة ورقم الآية في النهاية</span>
            </div>
            <div class="setting-control">
              <label class="settings-switch">
                <input type="checkbox" id="copy-metadata-toggle" ${state.copyMetadata ? 'checked' : ''}>
                <span class="switch-slider"></span>
              </label>
            </div>
          </div>
        </div>
      </section>

      <section class="settings-group">
        <div class="settings-group-header">
          <div class="settings-group-icon">
            <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
          </div>
          <h3>${t('backup_restore')}</h3>
        </div>
        <div class="settings-card">
          <div class="setting-action-row">
            <button class="settings-btn primary-btn">
              <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
              ${t('backup_export')}
            </button>
            <button class="settings-btn secondary-btn">
              <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
              ${t('backup_import')}
            </button>
          </div>
        </div>
      </section>
      
    </div>
  `;

  // --- Logic Bindings ---

  // Language Toggle
  container.querySelector('#language-select').addEventListener('change', (e) => {
    setLanguage(e.target.value);
    localStorage.setItem('language', e.target.value);
    if (forceReRender) forceReRender();
  });

  // Time Format
  container.querySelector('#time-format-select').addEventListener('change', (e) => {
    state.timeFormat = e.target.value;
    localStorage.setItem('timeFormat', state.timeFormat);
    if (forceReRender) forceReRender();
  });

  // Date Format
  container.querySelector('#date-format-select').addEventListener('change', (e) => {
    state.dateFormat = e.target.value;
    localStorage.setItem('dateFormat', state.dateFormat);
    if (forceReRender) forceReRender();
  });

  // Calculation Method
  const calcMethodSelect = container.querySelector('#calculation-method-select');
  if (calcMethodSelect) {
    calcMethodSelect.addEventListener('change', (e) => {
      state.calculationMethod = e.target.value;
      localStorage.setItem('calculationMethod', state.calculationMethod);
      if (forceReRender) forceReRender();
    });
  }

  // Madhab
  const madhabSelect = container.querySelector('#madhab-select');
  if (madhabSelect) {
    madhabSelect.addEventListener('change', (e) => {
      state.madhab = e.target.value;
      localStorage.setItem('madhab', state.madhab);
      if (forceReRender) forceReRender();
    });
  }

  // Color Theme Toggle
  container.querySelector('#color-theme-select').addEventListener('change', (e) => {
    state.colorTheme = e.target.value;
    localStorage.setItem('colorTheme', state.colorTheme);
    document.documentElement.setAttribute('data-theme', state.colorTheme);
  });

  // Dark Mode Toggle
  container.querySelector('#theme-toggle').addEventListener('change', (e) => {
    state.theme = e.target.checked ? 'dark' : 'light';
    localStorage.setItem('theme', state.theme);
    if (state.theme === 'dark') {
      document.documentElement.classList.add('dark-mode');
    } else {
      document.documentElement.classList.remove('dark-mode');
    }
  });

  // Quran Font Size
  const fontSizeSlider = container.querySelector('#font-size');
  const fontSizeDisplay = container.querySelector('#font-size-display');
  fontSizeSlider.addEventListener('input', (e) => {
    state.quranFontSize = e.target.value;
    fontSizeDisplay.textContent = `${e.target.value}px`;
    document.documentElement.style.setProperty('--quran-font-size', `${state.quranFontSize}px`);
  });

  // App Font (UI interface font)
  const appFontSelect = container.querySelector('#app-font-select');
  if (appFontSelect) {
    appFontSelect.addEventListener('change', (e) => {
      state.appFont = e.target.value;
      localStorage.setItem('appFont', state.appFont);
      document.documentElement.style.setProperty('--font-arabic', state.appFont);
      document.documentElement.style.setProperty('--font-english', state.appFont);
    });
  }

  // Quran Font (only affects Quran text, NOT UI)
  container.querySelector('#quran-font-select').addEventListener('change', (e) => {
    state.quranFont = e.target.value;
    localStorage.setItem('quranFont', state.quranFont);
    document.documentElement.style.setProperty('--quran-font', state.quranFont);
    // Do NOT change --font-arabic here; that's the app UI font
  });

  // Mushaf Edition Selection
  const mushafEditionSelect = container.querySelector('#mushaf-edition-select');
  if (mushafEditionSelect) {
    mushafEditionSelect.addEventListener('change', (e) => {
      state.mushafEdition = e.target.value;
      localStorage.setItem('mushafEdition', state.mushafEdition);
    });
  }

  // Audio Reciter Selection
  const audioReciterSelect = container.querySelector('#audio-reciter-select');
  if (audioReciterSelect) {
    audioReciterSelect.addEventListener('change', (e) => {
      state.audioReciter = e.target.value;
      localStorage.setItem('audioReciter', state.audioReciter);
    });
  }

  // Tafsir Selection
  container.querySelector('#tafsir-select').addEventListener('change', (e) => {
    state.tafsirEdition = e.target.value;
    localStorage.setItem('tafsirEdition', state.tafsirEdition);
  });

  // Colorization Logic
  const hcPicker = container.querySelector('#harakat-color-picker');
  const hcToggle = container.querySelector('#color-harakat-toggle');
  
  hcToggle.addEventListener('change', (e) => {
    state.colorHarakat = e.target.checked;
    localStorage.setItem('colorHarakat', state.colorHarakat);
    hcPicker.disabled = !state.colorHarakat;
    if (forceReRender) forceReRender();
  });
  
  hcPicker.addEventListener('input', (e) => {
    state.harakatColor = e.target.value;
    localStorage.setItem('harakatColor', state.harakatColor);
    document.documentElement.style.setProperty('--harakat-color', state.harakatColor);
  });
  
  container.querySelector('#color-allah-toggle').addEventListener('change', (e) => {
    state.colorAllah = e.target.checked;
    localStorage.setItem('colorAllah', state.colorAllah);
    if (forceReRender) forceReRender();
  });
  
  container.querySelector('#color-tajweed-toggle').addEventListener('change', (e) => {
    state.colorTajweed = e.target.checked;
    localStorage.setItem('colorTajweed', state.colorTajweed);
    if (forceReRender) forceReRender();
  });

  const wbwToggle = container.querySelector('#word-by-word-toggle');
  if (wbwToggle) {
    wbwToggle.addEventListener('change', (e) => {
      state.wordByWordTranslation = e.target.checked;
      localStorage.setItem('wordByWordTranslation', state.wordByWordTranslation);
      if (forceReRender) forceReRender();
    });
  }

  const keepAwakeToggle = container.querySelector('#keep-awake-toggle');
  if (keepAwakeToggle) {
    keepAwakeToggle.addEventListener('change', (e) => {
      state.keepAwake = e.target.checked;
      localStorage.setItem('keepAwake', state.keepAwake);
    });
  }

  const copyBracketsToggle = container.querySelector('#copy-brackets-toggle');
  if (copyBracketsToggle) {
    copyBracketsToggle.addEventListener('change', (e) => {
      state.copyBrackets = e.target.checked;
      localStorage.setItem('copyBrackets', state.copyBrackets);
    });
  }

  const copyAyahStyleSelect = container.querySelector('#copy-ayah-style-select');
  if (copyAyahStyleSelect) {
    copyAyahStyleSelect.addEventListener('change', (e) => {
      state.copyAyahStyle = e.target.value;
      localStorage.setItem('copyAyahStyle', state.copyAyahStyle);
    });
  }

  const copyTashkeelToggle = container.querySelector('#copy-tashkeel-toggle');
  if (copyTashkeelToggle) {
    copyTashkeelToggle.addEventListener('change', (e) => {
      state.copyTashkeel = e.target.checked;
      localStorage.setItem('copyTashkeel', state.copyTashkeel);
    });
  }

  const copyMetadataToggle = container.querySelector('#copy-metadata-toggle');
  if (copyMetadataToggle) {
    copyMetadataToggle.addEventListener('change', (e) => {
      state.copyMetadata = e.target.checked;
      localStorage.setItem('copyMetadata', state.copyMetadata);
    });
  }

  // AI Model Selection
  const aiModelSelect = container.querySelector('#ai-model-select');
  if(aiModelSelect) {
    aiModelSelect.addEventListener('change', (e) => {
      state.aiModel = e.target.value;
      localStorage.setItem('aiModel', state.aiModel);
    });
  }

  // Preload Model Button
  const preloadBtn = container.querySelector('#preload-model-btn');
  if(preloadBtn) {
    preloadBtn.addEventListener('click', () => {
      preloadBtn.innerHTML = 'جاري التحميل...';
      preloadBtn.disabled = true;
      setTimeout(() => {
        preloadBtn.innerHTML = 'تم التحميل ✓';
        preloadBtn.classList.remove('secondary-btn');
        preloadBtn.style.background = '#10b981';
        preloadBtn.style.color = 'white';
      }, 2000);
    });
  }

  return container;
}
