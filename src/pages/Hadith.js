import { t } from '../utils/i18n.js';
import { exportHadithToImage } from '../utils/hadithImageGenerator.js';
import { openImageThemeModal } from '../components/ImageThemeModal.js';

export function HadithPage(navigate, params = null) {
  const container = document.createElement('div');
  container.className = 'hadith-page-wrapper animate-fade-in';

  let currentBook = (params && params.book) || 'bukhari';
  let currentChapter = 'all';
  let searchQuery = (params && (params.query || params.q || params.search)) || '';
  let targetHadithId = (params && params.id) ? parseInt(params.id) : null;
  let page = 1;
  const PAGE_SIZE = 15;

  const books = [
    { id: 'bukhari', name: 'صحيح البخاري', icon: '📜' },
    { id: 'muslim', name: 'صحيح مسلم', icon: '📗' },
    { id: 'abudawud', name: 'سنن أبي داود', icon: '📘' },
    { id: 'tirmidhi', name: 'سنن الترمذي', icon: '📙' },
    { id: 'nasai', name: 'سنن النسائي', icon: '📕' },
    { id: 'ibnmajah', name: 'سنن ابن ماجه', icon: '📓' }
  ];

  // Authentic offline Hadiths fallback dataset
  const fallbackHadiths = [
    {
      book: 'bukhari',
      number: 1,
      text: 'إِنَّمَا الأَعْمَالُ بِالنِّيَّاتِ، وَإِنَّمَا لِكُلِّ امْرِئٍ مَا نَوَى، فَمَنْ كَانَتْ هِجْرَتُهُ إِلَى دُنْيَا يُصِيبُهَا، أَوْ إِلَى امْرَأَةٍ يَنْكِحُهَا، فَهِجْرَتُهُ إِلَى مَا هَاجَرَ إِلَيْهِ.',
      chapter: 'كتاب بدء الوحي',
      narrator: 'عمر بن الخطاب رضي الله عنه'
    },
    {
      book: 'bukhari',
      number: 2,
      text: 'الْمُسْلِمُ مَنْ سَلِمَ الْمُسْلِمُونَ مِنْ لِسَانِهِ وَيَدِهِ، وَالْمُهَاجِرُ مَنْ هَاجَرَ مَا نَهَى اللَّهُ عَنْهُ.',
      chapter: 'كتاب الإيمان',
      narrator: 'عبد الله بن عمرو رضي الله عنهما'
    },
    {
      book: 'bukhari',
      number: 3,
      text: 'لا يُؤْمِنُ أَحَدُكُمْ حَتَّى يُحِبَّ لأَخِيهِ مَا يُحِبُّ لِنَفْسِهِ.',
      chapter: 'كتاب الإيمان',
      narrator: 'أنس بن مالك رضي الله عنه'
    },
    {
      book: 'muslim',
      number: 1,
      text: 'مَنْ دَعَا إِلَى هُدًى، كَانَ لَهُ مِنَ الأَجْرِ مِثْلُ أُجُورِ مَنْ تَبِعَهُ، لا يَنْقُصُ ذَلِكَ مِنْ أُجُورِهِمْ شَيْئًا.',
      chapter: 'كتاب العلم',
      narrator: 'أبو هريرة رضي الله عنه'
    },
    {
      book: 'muslim',
      number: 2,
      text: 'الطُّهُورُ شَطْرُ الإِيمَانِ، وَالْحَمْدُ لِلَّهِ تَمْلأُ الْمِيزَانَ، وَسُبْحَانَ اللَّهِ وَالْحَمْدُ لِلَّهِ تَمْلآنِ أَوْ تَمْلأُ مَا بَيْنَ السَّمَاوَاتِ وَالأَرْضِ.',
      chapter: 'كتاب الطهارة',
      narrator: 'أبو مالك الأشعري رضي الله عنه'
    },
    {
      book: 'muslim',
      number: 3,
      text: 'مَنْ سَلَكَ طَرِيقًا يَلْتَمِسُ فِيهِ عِلْمًا سَهَّلَ اللَّهُ لَهُ بِهِ طَرِيقًا إِلَى الْجَنَّةِ.',
      chapter: 'كتاب الذكر والدعاء',
      narrator: 'أبو هريرة رضي الله عنه'
    },
    {
      book: 'abudawud',
      number: 1,
      text: 'الرَّاحِمُونَ يَرْحَمُهُمُ الرَّحْمَنُ، ارْحَمُوا مَنْ فِي الأَرْضِ يَرْحَمْكُمْ مَنْ فِي السَّمَاءِ.',
      chapter: 'كتاب الأدب',
      narrator: 'عبد الله بن عمرو رضي الله عنهما'
    },
    {
      book: 'tirmidhi',
      number: 1,
      text: 'اتَّقِ اللَّهَ حَيْثُمَا كُنْتَ، وَأَتْبِعِ السَّيِّئَةَ الْحَسَنَةَ تَمْحُهَا، وَخَالِقِ النَّاسَ بِخُلُقٍ حَسَنٍ.',
      chapter: 'كتاب البر والصلة',
      narrator: 'أبو ذر الغفاري ومعاذ بن جبل رضي الله عنهما'
    },
    {
      book: 'nasai',
      number: 1,
      text: 'إِنَّ اللَّهَ لا يَنْظُرُ إِلَى صُوَرِكُمْ وَأَمْوَالِكُمْ، وَلَكِنْ يَنْظُرُ إِلَى قُلُوبِكُمْ وَأَعْمَالِكُمْ.',
      chapter: 'كتاب الزهد',
      narrator: 'أبو هريرة رضي الله عنه'
    },
    {
      book: 'ibnmajah',
      number: 1,
      text: 'طَلَبُ الْعِلْمِ فَرِيضَةٌ عَلَى كُلِّ مُسْلِمٍ.',
      chapter: 'المقدمة',
      narrator: 'أنس بن مالك رضي الله عنه'
    }
  ];

  let loadedHadiths = [];
  let chapters = [];

  const chapterTranslations = {
    "Revelation": "بدء الوحي",
    "Belief": "الإيمان",
    "Knowledge": "العلم",
    "Ablutions (Wudu')": "الوضوء",
    "Bathing (Ghusl)": "الغسل",
    "Menstrual Periods": "الحيض",
    "Rubbing hands and feet with dust (Tayammum)": "التيمم",
    "Prayers (Salat)": "الصلاة",
    "Times of the Prayers": "مواقيت الصلاة",
    "Call to Prayers (Adhaan)": "الأذان",
    "Friday Prayer": "الجمعة",
    "Fear Prayer": "صلاة الخوف",
    "The Two Festivals (Eids)": "العيدين",
    "Witr Prayer": "الوتر",
    "Invoking Allah for Rain (Istisqaa)": "الاستسقاء",
    "Eclipses": "الكسوف",
    "Prostration During Recital of Qur'an": "سجود القرآن",
    "Shortening the Prayers (At-Taqseer)": "تقصير الصلاة",
    "Prayer at Night (Tahajjud)": "التهجد",
    "Virtues of Prayer at Masjid Makkah and Madinah": "فضل الصلاة في مسجد مكة والمدينة",
    "Actions while Praying": "العمل في الصلاة",
    "Forgetfulness in Prayer": "السهو",
    "Funerals (Al-Janaa'iz)": "الجنائز",
    "Obligatory Charity Tax (Zakat)": "الزكاة",
    "Hajj (Pilgrimage)": "الحج",
    "`Umrah (Minor pilgrimage)": "العمرة",
    "Pilgrims Prevented from Completing the Pilgrimage": "المحصر",
    "Penalty of Hunting while on Pilgrimage": "جزاء الصيد",
    "Virtues of Madinah": "فضائل المدينة",
    "Fasting": "الصوم",
    "Praying at Night in Ramadaan (Taraweeh)": "صلاة التراويح",
    "Virtues of the Night of Qadr": "فضل ليلة القدر",
    "Retiring to a Mosque for Remembrance of Allah (I'tikaf)": "الاعتكاف",
    "Sales and Trade": "البيوع",
    "Sales in which a Price is paid for Goods to be Delivered Later (As-Salam)": "السلم",
    "Shuf'a": "الشفعة",
    "Hiring": "الإجارة",
    "Transferance of a Debt from One Person to Another (Al-Hawaala)": "الحوالة",
    "Kafalah": "الكفالة",
    "Representation, Authorization, Business by Proxy": "الوكالة",
    "Agriculture": "المزارعة",
    "Distribution of Water": "المساقاة",
    "Loans, Payment of Loans, Freezing of Property, Bankruptcy": "الاستقراض وأداء الديون",
    "Khusoomaat": "الخصومات",
    "Lost Things Picked up by Someone (Luqatah)": "اللقطة",
    "Oppressions": "المظالم",
    "Partnership": "الشركة",
    "Mortgaging": "الرهن",
    "Manumission of Slaves": "العتق",
    "Makaatib": "المكاتب",
    "Gifts": "الهبة",
    "Witnesses": "الشهادات",
    "Peacemaking": "الصلح",
    "Conditions": "الشروط",
    "Wills and Testaments (Wasaayaa)": "الوصايا",
    "Fighting for the Cause of Allah (Jihaad)": "الجهاد والسير",
    "One-fifth of Booty to the Cause of Allah (Khumus)": "فرض الخمس",
    "Jizyah and Mawaada'ah": "الجزية والموادعة",
    "Beginning of Creation": "بدء الخلق",
    "Prophets": "أحاديث الأنبياء",
    "Virtues and Merits of the Prophet (pbuh) and his Companions": "المناقب",
    "Companions of the Prophet": "فضائل أصحاب النبي",
    "Merits of the Helpers in Madinah (Ansaar)": "مناقب الأنصار",
    "Military Expeditions led by the Prophet (pbuh) (Al-Maghaazi)": "المغازي",
    "Prophetic Commentary on the Qur'an (Tafseer of the Prophet (pbuh))": "تفسير القرآن",
    "Virtues of the Qur'an": "فضائل القرآن",
    "Wedlock, Marriage (Nikaah)": "النكاح",
    "Divorce": "الطلاق",
    "Supporting the Family": "النفقات",
    "Food, Meals": "الأطعمة",
    "Sacrifice on Occasion of Birth (`Aqiqa)": "العقيقة",
    "Hunting, Slaughtering": "الذبائح والصيد",
    "Al-Adha Festival Sacrifice (Adaahi)": "الأضاحي",
    "Drinks": "الأشربة",
    "Patients": "المرضى",
    "Medicine": "الطب",
    "Dress": "اللباس",
    "Good Manners and Form (Al-Adab)": "الأدب",
    "Asking Permission": "الاستئذان",
    "Invocations": "الدعوات",
    "To make the Heart Tender (Ar-Riqaq)": "الرقاق",
    "Divine Will (Al-Qadar)": "القدر",
    "Oaths and Vows": "الأيمان والنذور",
    "Expiation for Unfulfilled Oaths": "كفارات الأيمان",
    "Laws of Inheritance (Al-Faraa'id)": "الفرائض",
    "Limits and Punishments set by Allah (Hudood)": "الحدود",
    "Blood Money (Ad-Diyat)": "الديات",
    "Apostates": "استتابة المرتدين",
    "(Statements made under) Coercion": "الإكراه",
    "Tricks": "الحيل",
    "Interpretation of Dreams": "التعبير",
    "Afflictions and the End of the World": "الفتن",
    "Judgments (Ahkaam)": "الأحكام",
    "Wishes": "التمني",
    "Accepting Information Given by a Truthful Person": "أخبار الآحاد",
    "Holding Fast to the Qur'an and Sunnah": "الاعتصام بالكتاب والسنة",
    "Oneness, Uniqueness of Allah (Tawheed)": "التوحيد"
  };

  const getBookName = (id) => books.find(b => b.id === id)?.name || id;

  const loadBook = async () => {
    chapters = [];
    currentChapter = 'all';
    try {
      const res = await fetch(`/hadith/${currentBook}.json`);
      if (res.ok) {
        const json = await res.json();
        loadedHadiths = json.hadiths || json || [];
        
        // Parse Chapters (أبواب)
        if (json.metadata && json.metadata.sections && json.metadata.section_details) {
            const sections = json.metadata.sections;
            const details = json.metadata.section_details;
            for (const key in sections) {
                if (sections[key] && sections[key].trim() !== '') {
                    chapters.push({
                        id: key,
                        name: sections[key],
                        first: details[key].hadithnumber_first,
                        last: details[key].hadithnumber_last
                    });
                }
            }
        }
      } else {
        loadedHadiths = fallbackHadiths.filter(h => h.book === currentBook || currentBook === 'bukhari');
      }
    } catch (e) {
      loadedHadiths = fallbackHadiths.filter(h => h.book === currentBook || currentBook === 'bukhari');
    }
    page = 1;
    render();
  };

  const render = () => {
    const query = searchQuery.trim().toLowerCase();
    
    // Filter by Chapter
    let chapterFiltered = loadedHadiths;
    let selectedChapterName = '';
    
    if (currentChapter !== 'all') {
        const chapterDef = chapters.find(c => c.id === currentChapter);
        if (chapterDef) {
            selectedChapterName = chapterDef.name;
            chapterFiltered = loadedHadiths.filter(h => {
                const hNum = h.hadithnumber || h.number;
                return hNum >= chapterDef.first && hNum <= chapterDef.last;
            });
        }
    }

    // Filter by Query
    const filtered = chapterFiltered.filter(h => {
      const txt = (h.text || h.arabic || '').toLowerCase();
      const num = String(h.number || h.hadithnumber || '');
      return query === '' || txt.includes(query) || num.includes(query);
    });

    const paginated = filtered.slice(0, page * PAGE_SIZE);

    container.innerHTML = `
      <div class="app-bar" style="position: sticky; top: 0; z-index: 20; background: var(--app-bar-bg); backdrop-filter: blur(12px); border-bottom: 1px solid var(--glass-border); padding: 0.75rem 0; margin-bottom: 1rem; display: flex; align-items: center; justify-content: space-between;">
        <div class="app-bar-icon" id="back-btn" style="cursor:pointer;">
          <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
        </div>
        <div class="app-title" style="font-weight: 700; font-size: 1.2rem; display: flex; align-items: center; gap: 0.5rem;">
          <img src="/logo.png" alt="Warteel" class="app-header-logo" style="height: 28px;" />
          <span>${t('hadith')}</span>
        </div>
        <div class="app-bar-icon" style="opacity: 0;"></div>
      </div>

      <!-- Books Bar -->
      <div class="chapters-slider">
        ${books.map(b => `
          <button class="chapter-btn ${currentBook === b.id ? 'active' : ''}" data-book="${b.id}">
            <span>${b.icon}</span> <span>${b.name}</span>
          </button>
        `).join('')}
      </div>

      <!-- Chapters / Sections (أبواب) Dropdown -->
      ${chapters.length > 0 ? `
      <div class="chapters-container" style="margin-top: -0.5rem; padding-bottom: 1rem; padding-inline: 1rem;">
        <select id="chapter-select" class="chapter-dropdown" style="width: 100%; padding: 0.8rem; border-radius: var(--radius-md); border: 1px solid var(--glass-border); background: var(--bg-card); color: var(--text-primary); font-size: 0.95rem; outline: none; cursor: pointer; text-align: right;" dir="rtl">
          <option value="all" ${currentChapter === 'all' ? 'selected' : ''}>الكل (جميع الأبواب)</option>
          ${chapters.map(c => `
            <option value="${c.id}" ${currentChapter === String(c.id) ? 'selected' : ''}>
              ${chapterTranslations[c.name] || c.name}
            </option>
          `).join('')}
        </select>
      </div>
      ` : ''}

      <!-- Search Bar -->
      <div style="margin: 0.5rem 0 1.5rem 0;">
        <input type="text" id="hadith-search-input" placeholder="ابحث في الأحاديث الشريفة..." value="${searchQuery}" style="width: 100%; padding: 0.8rem 1.25rem; border-radius: var(--radius-md); border: 1px solid var(--glass-border); background: var(--bg-card); color: var(--text-primary); font-size: 0.95rem; outline: none; box-shadow: inset 0 2px 4px rgba(0,0,0,0.02);" />
      </div>

      <!-- Hadiths List (Grid) -->
      ${paginated.length === 0 ? `
        <div style="text-align: center; padding: 4rem 1rem; color: var(--text-muted);">
          <div style="font-size: 3rem; margin-bottom: 1rem;">📜</div>
          <div style="font-size: 1.1rem; font-weight: 600;">لم نجد أحاديث مطابقة</div>
        </div>
      ` : `
        <div class="hadith-grid">
          ${paginated.map(h => `
            <div class="hadith-card-premium" id="hadith-card-${h.number || h.hadithnumber || 1}">
              <div class="hadith-card-header">
                <span class="hadith-number-badge">رقم ${h.number || h.hadithnumber || 1}</span>
                ${h.narrator ? `<span class="hadith-narrator">عن ${h.narrator}</span>` : ''}
              </div>

              <div class="hadith-text-content">
                ${h.text || h.arabic || ''}
              </div>

              <div class="hadith-card-actions">
                <button class="hadith-action-btn btn-copy-hadith" data-text="${h.text || h.arabic}">
                  <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                  <span>نسخ</span>
                </button>
                <button class="hadith-action-btn story-export-btn" data-id="${h.hadithnumber || h.number}" data-narrator="${h.narrator || ''}">
                  <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                  <span>نشر كستوري</span>
                </button>
              </div>
            </div>
          `).join('')}
        </div>
      `}

      ${paginated.length > 0 && paginated.length < filtered.length ? `
        <div style="display: flex; justify-content: center; margin-top: 2.5rem;">
          <button id="load-more-btn" class="chapter-btn active" style="padding: 0.85rem 2rem; border-radius: var(--radius-full);">تحميل المزيد من الأحاديث</button>
        </div>
      ` : ''}
    `;

    // Bind events
    container.querySelector('#back-btn')?.addEventListener('click', () => navigate('home'));

    container.querySelectorAll('.chapter-btn[data-book]').forEach(btn => {
      btn.addEventListener('click', () => {
        currentBook = btn.dataset.book;
        loadBook();
      });
    });

    const chapterSelect = container.querySelector('#chapter-select');
    if (chapterSelect) {
      chapterSelect.addEventListener('change', (e) => {
        currentChapter = e.target.value;
        page = 1;
        render();
      });
    }

    const searchInput = container.querySelector('#hadith-search-input');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        searchQuery = e.target.value;
        page = 1;
        render();
      });
    }

    container.querySelector('#load-more-btn')?.addEventListener('click', () => {
      page++;
      render();
    });

    container.querySelectorAll('.btn-copy-hadith').forEach(btn => {
      btn.addEventListener('click', () => {
        navigator.clipboard.writeText(btn.dataset.text).then(() => {
          const span = btn.querySelector('span');
          const oldText = span.textContent;
          span.textContent = 'تم النسخ!';
          setTimeout(() => span.textContent = oldText, 2000);
        });
      });
    });

    container.querySelectorAll('.story-export-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = btn.dataset.id;
        const narrator = btn.dataset.narrator;
        const hadith = loadedHadiths.find(h => String(h.hadithnumber || h.number) === id);
        
        if (hadith) {
          openImageThemeModal(async (selectedTheme, options) => {
            const span = btn.querySelector('span');
            const originalText = span.textContent;
            span.textContent = 'جاري المعالجة...';
            btn.style.opacity = '0.7';
            btn.style.pointerEvents = 'none';
            
            try {
                let chapterNameForImage = '';
                if (chapters.length > 0) {
                    const chapterObj = chapters.find(c => {
                        const num = hadith.hadithnumber || hadith.number;
                        return num >= c.first && num <= c.last;
                    });
                    if (chapterObj) chapterNameForImage = chapterObj.name;
                }
                
                await exportHadithToImage(
                    hadith.text || hadith.arabic, 
                    getBookName(currentBook), 
                    chapterNameForImage, 
                    narrator,
                    hadith.hadithnumber || hadith.number,
                    selectedTheme,
                    options
                );
                
                span.textContent = 'تم الحفظ!';
            } catch (err) {
                console.error(err);
                span.textContent = 'حدث خطأ!';
            }
            
            setTimeout(() => {
                span.textContent = originalText;
                btn.style.opacity = '1';
                btn.style.pointerEvents = 'auto';
            }, 3000);
          }, { 
              text: hadith.text || hadith.arabic, 
              header: getBookName(currentBook),
              optionsList: [
                  { id: 'narrator', label: 'الراوي / السند' },
                  { id: 'chapter', label: 'اسم الباب / التخريج' }
              ]
          });
        }
      });
    });
    if (targetHadithId) {
      setTimeout(() => {
        const el = container.querySelector(`#hadith-card-${targetHadithId}`);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          el.style.border = '2px solid var(--accent)';
          el.style.boxShadow = '0 0 15px rgba(217, 138, 68, 0.4)';
        }
      }, 400);
    }
  };

  loadBook();
  return container;
}
