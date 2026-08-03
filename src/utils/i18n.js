import { state } from '../app.js';

const translations = {
  ar: {
    // App Bar / Titles
    app_title: "وَرْتِيل",
    
    // Bottom Nav & Sidebar
    nav_home: "الرئيسية",
    nav_quran: "القرآن الكريم",
    nav_adhkar: "الأذكار",
    nav_duas: "الأدعية",
    nav_hadith: "الأحاديث النبوية",
    nav_qibla: "القبلة",
    nav_tasbih: "المسبحة",
    nav_settings: "الإعدادات",
    settings: "الإعدادات",
    adhkar: "الأذكار",
    duas: "الأدعية",
    hadith: "الأحاديث النبوية",
    
    // Home Page
    home_next_salah: "الصلاة القادمة",
    home_salah_in: "متبقي", 
    fajr: "الفجر",
    sunrise: "الشروق",
    dhuhr: "الظهر",
    asr: "العصر",
    maghrib: "المغرب",
    isha: "العشاء",
    top_features: "الأقسام",
    see_more: "عرض المزيد",
    feature_ai_chat: "محادثة الذكاء الاصطناعي",
    feature_duas: "الأدعية",
    feature_qibla: "القبلة",
    feature_hifz: "التحفيظ",
    feature_donation: "التبرع",
    daily_activity: "النشاط اليومي",
    add_activity: "+ إضافة نشاط",
    activity_morning_dhikr: "أذكار الصباح",
    activity_morning_dhikr_desc: "بدء اليوم بذكر الله المستمر...",
    activity_quran_time: "١٥ إلى ٣٠ دقيقة للقرآن",
    activity_quran_time_desc: "خصص من ١٥ إلى ٣٠ دقيقة لقراءة القرآن...",
    
    // Settings Page
    settings_title: "الإعدادات",
    appearance: "المظهر",
    primary_theme: "الثيم الأساسي",
    theme_gold: "الذهبي (Warteel)",
    theme_purple: "الأرجواني (الخيالي)",
    theme_teal: "التركوازي (الأعماق)",
    dark_mode: "الوضع الليلي",
    quran_font_size: "حجم الخط (القرآن)",
    quran_font: "خط التطبيق (والقرآن)",
    font_amiri: "الأميري (قرآن)",
    font_almarai: "المراعي (Almarai)",
    font_noto: "نوتو نسخ (Noto Naskh)",
    font_cairo: "كايرو (Cairo)",
    color_harakat: "تلوين الحركات (التشكيل)",
    color_allah: "تلوين لفظ الجلالة",
    color_tajweed: "تلوين المدود (أحكام التجويد)",
    ai_teacher: "المعلم الذكي (الذكاء الاصطناعي)",
    ai_hint: "يتم تحميل النماذج للاستخدام بدون إنترنت.",
    speech_model: "نموذج التعرف على الصوت",
    model_faster_whisper: "Faster-Whisper (الافتراضي، دقيق جداً)",
    model_vosk: "Vosk (الأخف والأسرع)",
    model_whisper_tiny: "Whisper Tiny (مدمج بالمتصفح)",
    model_whisper_base: "Whisper Base (مدمج بالمتصفح)",
    ai_warning: "معلومة:",
    ai_warning_desc: "هذا الخيار يستخدم الخادم المحلي (Sidecar) لسرعة ودقة أفضل. سيتم تحميل النموذج في المرة الأولى.",
    preload_model: "تحميل النموذج مسبقاً",
    backup_restore: "النسخ الاحتياطي",
    backup_export: "نسخ احتياطي (تصدير)",
    backup_import: "استعادة (استيراد)",
    language: "اللغة",
    language_ar: "العربية",
    language_en: "English",
    
    // Qibla
    finding_qibla: "جاري تحديد القبلة",
    start_compass: "تشغيل البوصلة",
    you_are_facing_qibla: "أنت متجه نحو القبلة",
    location_error: "خطأ في تحديد الموقع",
    location_not_supported: "الموقع غير مدعوم في متصفحك",
    compass_permission_needed: "البوصلة تحتاج إذن",
    compass_permission_denied: "تم رفض إذن البوصلة",
    
    // Messages
    coming_soon: "قريباً...",
    tasbih: "المسبحة الإلكترونية",
    settings: "الإعدادات",
    not_found: "الصفحة غير موجودة أو تحت الإنشاء",
    back: "العودة",
    
    // Quran List & Reader
    last_read: "آخر قراءة",
    ayah_no: "آية رقم",
    surah: "سورة",
    juz: "جزء",
    page: "صفحة",
    loading_surahs: "جاري تحميل السور...",
    loading: "جاري التحميل...",
    ayah: "آية",
    error_loading_quran: "خطأ في تحميل بيانات القرآن.",
    view_tafsir: "تفسير",
    view_mushaf: "تلاوة (مصحف)",
    tafsir_title: "تفسير الآية",
    tafsir_saadi: "تفسير السعدي",
    tafsir_ibn_kathir: "تفسير ابن كثير",

    // Search Engine & Modal
    search_quran: "البحث الذكي في القرآن",
    search_placeholder: "ابحث عن اسم سورة أو نص آية (مثال: أهدنا الصراط، الكرسي)...",
    tab_all: "الكل",
    tab_surahs: "السور",
    tab_ayahs: "الآيات",
    tab_juz_page: "الأجزاء والصفحات",
    did_you_mean: "هل تقصد؟",
    recent_searches: "عمليات البحث الأخيرة",
    quick_search: "مقترحات سريعة",
    clear_history: "مسح السجل",
    no_results_found: "لم نجد نتائج مطابقة لبحثك.",
    no_results_tip: "جرب كتابة جزء آخر من الآية أو اسم السورة بشكل مبسط.",
    results_found: "نتيجة",
    search_shortcut: "اختصار سريع",
    
    // Adhkar & Hadith
    adhkar: "الأذكار",
    hadith: "الحديث",
    morning_adhkar: "أذكار الصباح",
    evening_adhkar: "أذكار المساء",
    post_prayer_adhkar: "أذكار بعد الصلاة",
    sahih_bukhari: "صحيح البخاري",
    sahih_muslim: "صحيح مسلم",
    
    // Splash & Welcome
    splash_title: "وَرْتِيل",
    splash_slogan: "نور القرآن بين يديك",
    welcome_title: "مرحباً بك في وَرْتِيل",
    welcome_desc: "تجربة قرآنية حديثة ومتطورة، مع ميزة المعلم الذكي لتصحيح التلاوة مباشرة.",
    start_now: "ابدأ الآن"
  },
  en: {
    // App Bar / Titles
    app_title: "Warteel",
    
    // Bottom Nav
    nav_home: "Home",
    nav_quran: "Quran",
    nav_qibla: "Qibla",
    nav_tasbih: "Tasbih",
    nav_profile: "Profile",
    
    // Home Page
    home_next_salah: "The Next Salah",
    home_salah_in: "in", 
    fajr: "Fajr",
    sunrise: "Sunrise",
    dhuhr: "Dhuhr",
    asr: "Asr",
    maghrib: "Maghrib",
    isha: "Isha",
    top_features: "Top Features",
    see_more: "See More",
    feature_ai_chat: "AI Chat",
    feature_duas: "Duas",
    feature_qibla: "Qibla",
    feature_hifz: "Hifz",
    feature_donation: "Donation",
    daily_activity: "Daily Activity",
    add_activity: "+ Add Activity",
    activity_morning_dhikr: "Morning Dhikr",
    activity_morning_dhikr_desc: "Beginning the day with constant rememb...",
    activity_quran_time: "15 to 30 minutes for the Qur'an",
    activity_quran_time_desc: "Take 15 to 30 minutes to read ayahs fro...",
    
    // Settings Page
    settings_title: "Settings",
    appearance: "Appearance",
    primary_theme: "Primary Theme",
    theme_gold: "Gold (Warteel)",
    theme_purple: "Purple (Fantasy)",
    theme_teal: "Teal (Deep Ocean)",
    dark_mode: "Dark Mode",
    quran_font_size: "Quran Font Size",
    quran_font: "App & Quran Font",
    font_amiri: "Amiri (Quran)",
    font_almarai: "Almarai",
    font_noto: "Noto Naskh",
    font_cairo: "Cairo",
    color_harakat: "Colorize Harakat",
    color_allah: "Colorize Word 'Allah'",
    color_tajweed: "Colorize Tajweed",
    ai_teacher: "AI Teacher",
    ai_hint: "Models are downloaded for offline use.",
    speech_model: "Speech Recognition Model",
    model_faster_whisper: "Faster-Whisper (Default, Highly Accurate)",
    model_vosk: "Vosk (Fastest & Lightest)",
    model_whisper_tiny: "Whisper Tiny (Browser Built-in)",
    model_whisper_base: "Whisper Base (Browser Built-in)",
    ai_warning: "Info:",
    ai_warning_desc: "This option uses the local server (Sidecar) for better speed and accuracy. The model will be downloaded on first use.",
    preload_model: "Preload Model",
    backup_restore: "Backup & Restore",
    backup_export: "Backup (Export)",
    backup_import: "Restore (Import)",
    language: "Language",
    language_ar: "العربية",
    language_en: "English",
    
    // Qibla
    finding_qibla: "Finding Qibla",
    start_compass: "Start Compass",
    you_are_facing_qibla: "You are facing Qibla",
    location_error: "Location error",
    location_not_supported: "Location not supported",
    compass_permission_needed: "Compass needs permission",
    compass_permission_denied: "Compass permission denied",
    
    // Messages
    coming_soon: "Coming Soon...",
    tasbih: "Tasbih",
    profile: "Profile",
    not_found: "Page not found or under construction",
    back: "Back",
    
    // Quran List & Reader
    last_read: "Last Read",
    ayah_no: "Ayah No.",
    surah: "Surah",
    juz: "Juz",
    page: "Page",
    loading_surahs: "Loading Surahs...",
    loading: "Loading...",
    ayah: "Ayah",
    error_loading_quran: "Error loading Quran data.",
    view_tafsir: "Tafsir",
    view_mushaf: "Mushaf (Recitation)",
    tafsir_title: "Ayah Tafsir",
    tafsir_saadi: "Tafsir As-Saadi",
    tafsir_ibn_kathir: "Tafsir Ibn Kathir",

    // Search Engine & Modal
    search_quran: "Smart Quran Search",
    search_placeholder: "Search Surah name or Ayah text...",
    tab_all: "All",
    tab_surahs: "Surahs",
    tab_ayahs: "Ayahs",
    tab_juz_page: "Juz & Pages",
    did_you_mean: "Did you mean?",
    recent_searches: "Recent Searches",
    quick_search: "Quick Suggestions",
    clear_history: "Clear History",
    no_results_found: "No matching results found.",
    no_results_tip: "Try typing another part of the Ayah or Surah name.",
    results_found: "results",
    search_shortcut: "Quick Shortcut",
    
    // Adhkar & Hadith
    adhkar: "Adhkar",
    hadith: "Hadith",
    morning_adhkar: "Morning Adhkar",
    evening_adhkar: "Evening Adhkar",
    post_prayer_adhkar: "Post-Prayer Adhkar",
    sahih_bukhari: "Sahih al-Bukhari",
    sahih_muslim: "Sahih Muslim",
    
    // Splash & Welcome
    splash_title: "Warteel",
    splash_slogan: "The light of the Quran in your hands",
    welcome_title: "Welcome to Warteel",
    welcome_desc: "A modern and advanced Quranic experience, featuring a smart teacher to correct recitation in real-time.",
    start_now: "Start Now"
  }
};

export function t(key) {
  const lang = state.language || 'ar';
  return translations[lang][key] || key;
}

export function setLanguage(lang) {
  state.language = lang;
  localStorage.setItem('language', lang);
  document.documentElement.lang = lang;
  document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
}

// Initialize on load
export function initLanguage(initialLang) {
  // Always default to Arabic unless strictly set to english
  const savedLang = localStorage.getItem('language') || initialLang || 'ar';
  state.language = savedLang;
  localStorage.setItem('language', savedLang);
  document.documentElement.lang = savedLang;
  document.documentElement.dir = savedLang === 'ar' ? 'rtl' : 'ltr';
}

