import { t } from '../utils/i18n.js';
import { exportAdhkarToImage } from '../utils/adhkarImageGenerator.js';
import { openImageThemeModal } from '../components/ImageThemeModal.js';

export function DuasPage(navigate) {
  const container = document.createElement('div');
  container.className = 'duas-page animate-fade-in';

  let currentCategory = 'all';
  let searchQuery = '';

  const categories = [
    { id: 'all', name: 'الكل', icon: '🤲' },
    { id: 'quran', name: 'أدعية قرآنية', icon: '📖' },
    { id: 'prophets', name: 'أدعية الأنبياء', icon: '🕊️' },
    { id: 'prophet', name: 'أدعية نبوية', icon: '✨' },
    { id: 'ahlalbayt', name: 'أدعية أهل البيت', icon: '🕌' },
    { id: 'companions', name: 'أدعية الصحابة', icon: '🌟' },
    { id: 'daily', name: 'أدعية يومية', icon: '🌅' },
    { id: 'relief', name: 'الكرب والفرَج', icon: '💚' },
    { id: 'travel', name: 'السفر والترحال', icon: '🚗' },
  ];

  const duasList = [
    // الأدعية القرآنية والأنبياء
    { id: 1, category: 'quran', title: 'دعاء الهداية والصراط المستقيم', arabic: 'رَبَّنَا لا تُزِغْ قُلُوبَنَا بَعْدَ إِذْ هَدَيْتَنَا وَهَبْ لَنَا مِنْ لَدُنْكَ رَحْمَةً إِنَّكَ أَنْتَ الْوَهَّابُ', source: 'سورة آل عمران - الآية ٨', benefit: 'يدعى به للثبات على الحق وعصمة القلب من الفتن' },
    { id: 2, category: 'quran', title: 'دعاء خيري الدنيا والآخرة', arabic: 'رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ', source: 'سورة البقرة - الآية ٢٠١', benefit: 'من أجمع الأدعية لخيري الدنيا والآخرة' },
    { id: 3, category: 'prophets', title: 'دعاء آدم عليه السلام', arabic: 'رَبَّنَا ظَلَمْنَا أَنْفُسَنَا وَإِنْ لَمْ تَغْفِرْ لَنَا وَتَرْحَمْنَا لَنَكُونَنَّ مِنَ الْخَاسِرِينَ', source: 'سورة الأعراف - الآية ٢٣', benefit: 'دعاء آدم وحواء عليهما السلام للتوبة والاستغفار' },
    { id: 4, category: 'prophets', title: 'دعاء يونس عليه السلام (ذي النون)', arabic: 'لا إِلَهَ إِلاَّ أَنْتَ سُبْحَانَكَ إِنِّي كُنتُ مِنَ الظَّالِمِينَ', source: 'سورة الأنبياء - الآية ٨٧', benefit: 'لم يدع بها مسلم في شيء قط إلا استجاب الله له' },
    { id: 5, category: 'prophets', title: 'دعاء نوح عليه السلام', arabic: 'رَبِّ اغْفِرْ لِي وَلِوَالِدَيَّ وَلِمَنْ دَخَلَ بَيْتِيَ مُؤْمِنًا وَلِلْمُؤْمِنِينَ وَالْمُؤْمِنَاتِ', source: 'سورة نوح - الآية ٢٨', benefit: 'دعاء جامع لطلب المغفرة للنفس والوالدين وللمسلمين' },
    { id: 6, category: 'prophets', title: 'دعاء إبراهيم عليه السلام', arabic: 'رَبِّ اجْعَلْنِي مُقِيمَ الصَّلَاةِ وَمِنْ ذُرِّيَّتِي ۚ رَبَّنَا وَتَقَبَّلْ دُعَاءِ', source: 'سورة إبراهيم - الآية ٤٠', benefit: 'لإقامة الصلاة وحفظ الذرية' },
    { id: 7, category: 'prophets', title: 'دعاء أيوب عليه السلام', arabic: 'أَنِّي مَسَّنِيَ الضُّرُّ وَأَنْتَ أَرْحَمُ الرَّاحِمِينَ', source: 'سورة الأنبياء - الآية ٨٣', benefit: 'للشفاء من المرض وكشف الضر' },
    { id: 8, category: 'prophets', title: 'دعاء موسى عليه السلام', arabic: 'رَبِّ اشْرَحْ لِي صَدْرِي * وَيَسِّرْ لِي أَمْرِي * وَاحْلُلْ عُقْدَةً مِنْ لِسَانِي * يَفْقَهُوا قَوْلِي', source: 'سورة طه - الآية ٢٥-٢٨', benefit: 'لتيسير الأمور وشرح الصدر وانطلاق اللسان' },
    { id: 9, category: 'prophets', title: 'دعاء زكريا عليه السلام', arabic: 'رَبِّ لَا تَذَرْنِي فَرْدًا وَأَنْتَ خَيْرُ الْوَارِثِينَ', source: 'سورة الأنبياء - الآية ٨٩', benefit: 'لطلب الذرية الصالحة' },
    { id: 10, category: 'prophets', title: 'دعاء سليمان عليه السلام', arabic: 'رَبِّ أَوْزِعْنِي أَنْ أَشْكُرَ نِعْمَتَكَ الَّتِي أَنْعَمْتَ عَلَيَّ وَعَلَى وَالِدَيَّ وَأَنْ أَعْمَلَ صَالِحًا تَرْضَاهُ وَأَدْخِلْنِي بِرَحْمَتِكَ فِي عِبَادِكَ الصَّالِحِينَ', source: 'سورة النمل - الآية ١٩', benefit: 'لشكر النعم وطلب التوفيق للعمل الصالح' },
    { id: 11, category: 'quran', title: 'دعاء طلب العلم والحكمة', arabic: 'رَّبِّ زِدْنِي عِلْمًا', source: 'سورة طه - الآية ١١٤', benefit: 'لفتح الفهم والتوفيق في طلب العلم' },

    // أدعية نبوية (النبي محمد ﷺ)
    { id: 12, category: 'prophet', title: 'سيد الاستغفار', arabic: 'اللَّهُمَّ أَنْتَ رَبِّي لا إِلَهَ إِلاَّ أَنْتَ، خَلَقْتَنِي وَأَنَا عَبْدُكَ، وَأَنَا عَلَى عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ، أَعُوذُ بِكَ مِنْ شَرِّ مَا صَنَعْتُ، أَبُوءُ لَكَ بِنِعْمَتِكَ عَلَيَّ، وَأَبُوءُ بِذَنْبِي فَاغْفِرْ لِي فَإِنَّهُ لا يَغْفِرُ الذُّنُوبَ إِلاَّ أَنْتَ', source: 'صحيح البخاري', benefit: 'من قالها موقناً بها ومات في يومه أو ليلته دخل الجنة' },
    { id: 13, category: 'prophet', title: 'دعاء صلاح الدين والدنيا', arabic: 'اللَّهُمَّ أَصْلِحْ لِي دِينِي الَّذِي هُوَ عِصْمَةُ أَمْرِي، وَأَصْلِحْ لِي دُنْيَايَ الَّتِي فِيهَا مَعَاشِي، وَأَصْلِحْ لِي آخِرَتِي الَّتِي فِيهَا مَعَادِي، وَاجْعَلِ الْحَيَاةَ زِيَادَةً لِي فِي كُلِّ خَيْرٍ، وَاجْعَلِ الْمَوْتَ رَاحَةً لِي مِنْ كُلِّ شَرٍّ', source: 'صحيح مسلم', benefit: 'دعاء جامع لصلاح الحياة والدين' },
    { id: 14, category: 'prophet', title: 'الثبات على الدين', arabic: 'يَا مُقَلِّبَ الْقُلُوبِ ثَبِّتْ قَلْبِي عَلَى دِينِكَ', source: 'سنن الترمذي', benefit: 'أكثر دعاء كان يدعو به النبي ﷺ' },
    { id: 15, category: 'prophet', title: 'دعاء الهدى والتقى', arabic: 'اللَّهُمَّ إِنِّي أَسْأَلُكَ الْهُدَى وَالتُّقَى وَالْعَفَافَ وَالْغِنَى', source: 'صحيح مسلم', benefit: 'يجمع خصال الخير كلها' },
    { id: 16, category: 'prophet', title: 'الاستعاذة من الهم والحزن', arabic: 'اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْهَمِّ وَالْحَزَنِ، وَالْعَجْزِ وَالْكَسَلِ، وَالْبُخْلِ وَالْجُبْنِ، وَضَلَعِ الدَّيْنِ، وَغَلَبَةِ الرِّجَالِ', source: 'صحيح البخاري', benefit: 'تفريج الكروب والهموم والديون' },
    { id: 17, category: 'prophet', title: 'تزكية النفس', arabic: 'اللَّهُمَّ آتِ نَفْسِي تَقْوَاهَا، وَزَكِّهَا أَنْتَ خَيْرُ مَنْ زَكَّاهَا، أَنْتَ وَلِيُّهَا وَمَوْلَاهَا', source: 'صحيح مسلم', benefit: 'لطهارة النفس وصلاحها' },
    { id: 18, category: 'prophet', title: 'دعاء المغفرة الشاملة', arabic: 'اللَّهُمَّ اغْفِرْ لِي خَطِيئَتِي وَجَهْلِي وَإِسْرَافِي فِي أَمْرِي، وَمَا أَنْتَ أَعْلَمُ بِهِ مِنِّي', source: 'صحيح مسلم', benefit: 'لغفران كل الذنوب والزلات' },

    // أدعية أهل البيت
    { id: 19, category: 'ahlalbayt', title: 'دعاء السيدة فاطمة الزهراء', arabic: 'يَا حَيُّ يَا قَيُّومُ بِرَحْمَتِكَ أَسْتَغِيثُ، أَصْلِحْ لِي شَأْنِي كُلَّهُ، وَلَا تَكِلْنِي إِلَى نَفْسِي طَرْفَةَ عَيْنٍ', source: 'مستدرك الحاكم (علمه إياها النبي ﷺ)', benefit: 'يقال للتوكل الكامل على الله وطلب إصلاح الأحوال' },
    { id: 20, category: 'ahlalbayt', title: 'دعاء الإمام علي بن أبي طالب', arabic: 'اللَّهُمَّ صُنْ وَجْهِي بِالْيَسَارِ، وَلَا تَبْذُلْ جَاهِيَ بِالْإِقْتَارِ، فَأَسْتَرْزِقَ طَالِبِي رِزْقِكَ، وَأَسْتَعْطِفَ شِرَارَ خَلْقِكَ', source: 'نهج البلاغة / مأثورات الإمام علي', benefit: 'لطلب الغنى عن الناس والكرامة والعزة' },
    { id: 21, category: 'ahlalbayt', title: 'دعاء الإمام الحسين بن علي', arabic: 'اللَّهُمَّ اجْعَلْنِي أَخْشَاكَ كَأَنِّي أَرَاكَ، وَأَسْعِدْنِي بِتَقْوَاكَ، وَلَا تُشْقِنِي بِمَعْصِيَتِكَ', source: 'دعاء عرفة', benefit: 'للوصول لمرتبة الإحسان واستشعار مراقبة الله' },
    { id: 22, category: 'ahlalbayt', title: 'من دعاء الإمام زين العابدين (علي بن الحسين)', arabic: 'اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنْ هَيَجَانِ الْحِرْصِ وَسَوْرَةِ الْغَضَبِ، وَغَلَبَةِ الْحَسَدِ وَضَعْفِ الصَّبْرِ، وَقِلَّةِ الْقَنَاعَةِ', source: 'الصحيفة السجادية', benefit: 'للاستعاذة من مكارم الأخلاق السيئة' },

    // أدعية الصحابة
    { id: 23, category: 'companions', title: 'دعاء أبي بكر الصديق', arabic: 'اللَّهُمَّ إِنِّي ظَلَمْتُ نَفْسِي ظُلْمًا كَثِيرًا، وَلاَ يَغْفِرُ الذُّنُوبَ إِلَّا أَنْتَ، فَاغْفِرْ لِي مَغْفِرَةً مِنْ عِنْدِكَ، وَارْحَمْنِي، إِنَّكَ أَنْتَ الغَفُورُ الرَّحِيمُ', source: 'صحيح البخاري (علمه النبي ﷺ)', benefit: 'دعاء عظيم للمغفرة يقال في الصلاة وقبل السلام' },
    { id: 24, category: 'companions', title: 'دعاء عمر بن الخطاب', arabic: 'اللَّهُمَّ إِنِّي أَسْأَلُكَ صِحَّةً فِي إِيمَانٍ، وَإِيمَانًا فِي حُسْنِ خُلُقٍ، وَنَجَاحًا يَتْبَعُهُ فَلاَحٌ، وَرَحْمَةً مِنْكَ وَعَافِيَةً وَمَغْفِرَةً مِنْكَ وَرِضْوَانًا', source: 'المعجم الأوسط للطبراني', benefit: 'لطلب خيري الدنيا والآخرة' },
    { id: 25, category: 'companions', title: 'دعاء عثمان بن عفان', arabic: 'بِسْمِ اللَّهِ الَّذِي لَا يَضُرُّ مَعَ اسْمِهِ شَيْءٌ فِي الْأَرْضِ وَلَا فِي السَّمَاءِ وَهُوَ السَّمِيعُ الْعَلِيمُ', source: 'سنن أبي داود (مرفوع عن النبي ﷺ)', benefit: 'من قالها ثلاثاً لم تصبه فجأة بلاء' },
    { id: 26, category: 'companions', title: 'دعاء عبد الله بن مسعود', arabic: 'اللَّهُمَّ إِنِّي أَسْأَلُكَ إِيمَانًا لاَ يَرْتَدُّ، وَنَعِيمًا لاَ يَنْفَدُ، وَمُرَافَقَةَ النَّبِيِّ صَلَّى اللَّهُ عَلَيْهِ وَسَلَّمَ فِي أَعْلَى غُرَفِ الجَنَّةِ', source: 'مسند أحمد / صحيح ابن حبان', benefit: 'لطلب الثبات على الإيمان ونعيم الجنة' },
    { id: 27, category: 'companions', title: 'دعاء أبي الدرداء', arabic: 'اللَّهُمَّ أَنْتَ رَبِّي لَا إِلَهَ إِلَّا أَنْتَ عَلَيْكَ تَوَكَّلْتُ وَأَنْتَ رَبُّ الْعَرْشِ الْعَظِيمِ مَا شَاءَ اللَّهُ كَانَ وَمَا لَمْ يَشَأْ لَمْ يَكُنْ', source: 'عمل اليوم والليلة لابن السني', benefit: 'للتحصين والحفظ من كل مكروه وسوء' },

    // أدعية الفرج والكرب اليومية والسفر
    { id: 28, category: 'relief', title: 'دعاء الهم والحزن', arabic: 'اللَّهُمَّ إِنِّي عَبْدُكَ، وَابْنُ عَبْدِكَ، وَابْنُ أَمَتِكَ، نَاصِيَتِي بِيَدِكَ، مَاضٍ فِيَّ حُكْمُكَ، عَدْلٌ فِيَّ قَضَاؤُكَ، أَسْأَلُكَ بِكُلِّ اسْمٍ هُوَ لَكَ سَمَّيْتَ بِهِ نَفْسَكَ، أَوْ أَنْزَلْتَهُ فِي كِتَابِكَ، أَوْ عَلَّمْتَهُ أَحَدًا مِنْ خَلْقِكَ، أَوْ اسْتَأْثَرْتَ بِهِ فِي عِلْمِ الْغَيْبِ عِنْدَكَ، أَنْ تَجْعَلَ الْقُرْآنَ رَبِيعَ قَلْبِي، وَنُورَ صَدْرِي، وَجَلاءَ حُزْنِي، وَذَهَابَ هَمِّي', source: 'مسند أحمد - صححه الألباني', benefit: 'يذهب الله به الهم والحزن ويبدله مكانه فرجاً' },
    { id: 29, category: 'relief', title: 'دعاء العافية والمعافاة', arabic: 'اللَّهُمَّ إِنِّي أَسْأَلُكَ الْعَفْوَ وَالْعَافِيَةَ فِي الدُّنْيَا وَالآخِرَةِ، اللَّهُمَّ إِنِّي أَسْأَلُكَ الْعَفْوَ وَالْعَافِيَةَ فِي دِينِي وَدُنْيَايَ وَأَهْلِي وَمَالِي', source: 'سنن أبي داود', benefit: 'كان النبي ﷺ لا يدع هؤلاء الدعوات حين يمسي وحين يصبح' },
    { id: 30, category: 'daily', title: 'دعاء الخروج من المنزل', arabic: 'بِسْمِ اللَّهِ، تَوَكَّلْتُ عَلَى اللَّهِ، وَلا حَوْلَ وَلا قُوَّةَ إِلاَّ بِاللَّهِ', source: 'سنن الترمذي', benefit: 'يقال له: كُفِيتَ وَوُقِيتَ وَهُدِيتَ، وَتَنَحَّى عَنْهُ الشَّيْطَانُ' },
    { id: 31, category: 'daily', title: 'دعاء دخول المسجد', arabic: 'اللَّهُمَّ افْتَحْ لِي أَبْوَابَ رَحْمَتِكَ', source: 'صحيح مسلم', benefit: 'عند دخول المسجد بقدّم الرجل اليمنى' },
    { id: 32, category: 'travel', title: 'دعاء ركوب الدابة والسفر', arabic: 'سُبْحَانَ الَّذِي سَخَّرَ لَنَا هَذَا وَمَا كُنَّا لَهُ مُقْرِنِينَ * وَإِنَّا إِلَى رَبِّنَا لَمُنْقَلِبُونَ، اللَّهُمَّ إِنَّا نَسْأَلُكَ فِي سَفَرِنَا هَذَا الْبِرَّ وَالتَّقْوَى، وَمِنَ الْعَمَلِ مَا تَرْضَى', source: 'صحيح مسلم', benefit: 'يحفظ المسافر في طريقه ورجوعه' },
    { id: 33, category: 'relief', title: 'دعاء الكرب العظيم', arabic: 'لا إِلَهَ إِلَّا اللَّهُ الْعَظِيمُ الْحَلِيمُ، لا إِلَهَ إِلَّا اللَّهُ رَبُّ الْعَرْشِ الْعَظِيمِ، لا إِلَهَ إِلَّا اللَّهُ رَبُّ السَّمَوَاتِ وَرَبُّ الْأَرْضِ وَرَبُّ الْعَرْشِ الْكَرِيمِ', source: 'صحيح البخاري', benefit: 'دعاء الفرج والنجاة من المهالك' }
  ];

  const render = () => {
    const filtered = duasList.filter(d => {
      const matchCat = currentCategory === 'all' || d.category === currentCategory;
      const matchSearch = searchQuery === '' || d.title.includes(searchQuery) || d.arabic.includes(searchQuery);
      return matchCat && matchSearch;
    });

    container.innerHTML = `
      <div class="app-bar" style="position: sticky; top: 0; z-index: 20; background: var(--app-bar-bg); backdrop-filter: blur(12px); border-bottom: 1px solid var(--glass-border); padding: 0.75rem 0; margin-bottom: 1rem; display: flex; align-items: center; justify-content: space-between;">
        <div class="app-bar-icon" id="back-btn" style="cursor:pointer;" onclick="window.navigateHome()">
          <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
        </div>
        <div class="app-title" style="font-weight: 700; font-size: 1.2rem; display: flex; align-items: center; gap: 0.5rem;">
          <img src="/logo.png" alt="Warteel" class="app-header-logo" style="height: 28px;" />
          <span>الأدعية المأثورة</span>
        </div>
        <div class="app-bar-icon" style="opacity: 0;"></div>
      </div>

      <header style="margin-bottom: 1.5rem; text-align: center;">
        <h2 style="font-size: 1.8rem; font-weight: 700; color: var(--text-primary); margin-bottom: 0.5rem;">الأدعية الأثرية والمأثورة 🤲</h2>
        <p style="color: var(--text-secondary); font-size: 0.95rem;">أدعية جامعة من القرآن الكريم والسنة النبوية الصحيحة</p>
      </header>

      <!-- Search bar -->
      <div style="margin-bottom: 1.5rem; position: relative;">
        <input type="text" id="dua-search" placeholder="ابحث عن دعاء أو كلمة..." value="${searchQuery}" style="width: 100%; padding: 0.85rem 1.25rem; padding-right: 2.75rem; border-radius: var(--radius-md); border: 1px solid var(--glass-border); background: var(--bg-card); color: var(--text-primary); font-size: 1rem; outline: none; transition: border-color 0.2s;" />
        <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="2" fill="none" style="position: absolute; right: 0.85rem; top: 50%; transform: translateY(-50%); color: var(--text-muted);"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
      </div>

      <!-- Categories tabs -->
      <div style="display: flex; gap: 0.5rem; overflow-x: auto; padding-bottom: 0.75rem; margin-bottom: 1.5rem; scrollbar-width: none;">
        ${categories.map(cat => `
          <button class="dua-cat-btn ${currentCategory === cat.id ? 'active' : ''}" data-cat="${cat.id}" style="padding: 0.6rem 1.2rem; border-radius: var(--radius-full); border: 1px solid var(--glass-border); background: ${currentCategory === cat.id ? 'var(--accent)' : 'var(--bg-card)'}; color: ${currentCategory === cat.id ? 'white' : 'var(--text-primary)'}; font-weight: 600; font-size: 0.9rem; cursor: pointer; white-space: nowrap; transition: all 0.2s; display: flex; align-items: center; gap: 0.4rem;">
            <span>${cat.icon}</span> <span>${cat.name}</span>
          </button>
        `).join('')}
      </div>

      <!-- Duas List -->
      <div style="display: flex; flex-direction: column; gap: 1.25rem;">
        ${filtered.length === 0 ? `
          <div style="text-align: center; padding: 4rem 1rem; color: var(--text-muted);">
            <div style="font-size: 3rem; margin-bottom: 1rem;">🔍</div>
            <div>لم نجد أدعية مطابقة لبحثك</div>
          </div>
        ` : filtered.map(dua => `
          <div class="glass-panel" style="padding: 1.5rem; border-radius: var(--radius-lg); position: relative;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
              <span style="font-size: 0.95rem; font-weight: 700; color: var(--accent);">${dua.title}</span>
              <span style="font-size: 0.75rem; background: var(--accent-bg); color: var(--accent); padding: 0.2rem 0.6rem; border-radius: var(--radius-full); font-weight: 600;">${dua.source}</span>
            </div>
            
            <div style="font-family: var(--quran-font); font-size: calc(var(--quran-font-size, 24px) * 0.95); line-height: 2.2; color: var(--text-primary); text-align: right; direction: rtl; margin-bottom: 1rem;">
              ${dua.arabic}
            </div>

            ${dua.benefit ? `
              <div style="font-size: 0.85rem; color: var(--text-secondary); background: var(--bg-main); padding: 0.6rem 0.85rem; border-radius: var(--radius-sm); margin-bottom: 1rem; border-right: 3px solid var(--accent);">
                💡 ${dua.benefit}
              </div>
            ` : ''}

            <div style="display: flex; justify-content: flex-end; gap: 0.75rem; border-top: 1px solid var(--glass-border); padding-top: 0.75rem;">
              <button class="btn-copy" data-text="${dua.arabic}" style="background: none; border: none; color: var(--text-secondary); cursor: pointer; display: flex; align-items: center; gap: 0.3rem; font-size: 0.85rem; padding: 0.3rem 0.6rem; border-radius: var(--radius-sm); transition: background 0.15s;">
                <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                <span>نسخ</span>
              </button>
              <button class="dua-story-export-btn" data-id="${dua.id}" style="background: none; border: none; color: var(--text-secondary); cursor: pointer; display: flex; align-items: center; gap: 0.3rem; font-size: 0.85rem; padding: 0.3rem 0.6rem; border-radius: var(--radius-sm); transition: background 0.15s;">
                <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                <span>ستوري</span>
              </button>
            </div>
          </div>
        `).join('')}
      </div>
    `;

    // Event handlers
    container.querySelectorAll('.dua-cat-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        currentCategory = btn.dataset.cat;
        render();
      });
    });

    const searchInput = container.querySelector('#dua-search');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        searchQuery = e.target.value.trim();
        render();
      });
    }

    container.querySelectorAll('.btn-copy').forEach(btn => {
      btn.addEventListener('click', () => {
        const text = btn.dataset.text;
        navigator.clipboard.writeText(text).then(() => {
          btn.style.color = 'var(--accent)';
          btn.querySelector('span').textContent = 'تم النسخ!';
          setTimeout(() => {
            btn.style.color = 'var(--text-secondary)';
            btn.querySelector('span').textContent = 'نسخ';
          }, 2000);
        });
      });
    });

    container.querySelectorAll('.dua-story-export-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        const duaId = parseInt(btn.dataset.id);
        const dua = duasList.find(d => d.id === duaId);
        
        if (dua) {
            openImageThemeModal(async (selectedTheme, options) => {
                const span = btn.querySelector('span');
                const originalText = span.textContent;
                span.textContent = 'جاري...';
                btn.style.opacity = '0.7';
                btn.style.pointerEvents = 'none';
                
                try {
                    await exportAdhkarToImage(
                        dua.arabic,
                        dua.title,
                        dua.source,
                        null,
                        selectedTheme,
                        options
                    );
                    
                    span.textContent = 'تم!';
                } catch (err) {
                    console.error(err);
                    span.textContent = 'خطأ!';
                } finally {
                    setTimeout(() => {
                        span.textContent = originalText;
                        btn.style.opacity = '1';
                        btn.style.pointerEvents = 'auto';
                    }, 3000);
                }
            }, { 
                text: dua.arabic, 
                header: dua.title,
                optionsList: [
                    { id: 'source', label: 'المصدر' }
                ]
            });
        }
      });
    });
  };

  render();
  return container;
}
