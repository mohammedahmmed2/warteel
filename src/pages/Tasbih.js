import { showToast } from '../utils/toast.js';

export function TasbihPage(navigate) {
  const container = document.createElement('div');
  container.className = 'tasbih-page animate-fade-in';

  let count = 0;
  let currentDhikrIndex = 0;
  let isModalOpen = false;

  const athkar = [
    { text: "سُبْحَانَ اللَّهِ", target: 33, category: "أذكار الصلاة" },
    { text: "الْحَمْدُ لِلَّهِ", target: 33, category: "أذكار الصلاة" },
    { text: "اللَّهُ أَكْبَرُ", target: 33, category: "أذكار الصلاة" },
    { text: "لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ، وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ", target: 1, category: "أذكار الصلاة" },
    { text: "أَسْتَغْفِرُ اللَّهَ وَأَتُوبُ إِلَيْهِ", target: 100, category: "استغفار وتوبة" },
    { text: "أَسْتَغْفِرُ اللَّهَ الَّذِي لَا إِلَهَ إِلَّا هُوَ الْحَيَّ الْقَيُّومَ وَأَتُوبُ إِلَيْهِ", target: 3, category: "استغفار وتوبة" },
    { text: "سُبْحَانَ اللَّهِ وَبِحَمْدِهِ", target: 100, category: "تسبيح وحمد" },
    { text: "سُبْحَانَ اللَّهِ الْعَظِيمِ", target: 100, category: "تسبيح وحمد" },
    { text: "سُبْحَانَ اللَّهِ وَبِحَمْدِهِ ، سُبْحَانَ اللَّهِ الْعَظِيمِ", target: 100, category: "تسبيح وحمد" },
    { text: "لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ", target: 100, category: "تسبيح وحمد" },
    { text: "اللَّهُمَّ صَلِّ وَسَلِّمْ عَلَى نَبِيِّنَا مُحَمَّدٍ", target: 100, category: "الصلاة على النبي" },
    { text: "حَسْبُنَا اللَّهُ وَنِعْمَ الْوَكِيلُ", target: 100, category: "أدعية وأذكار" },
    { text: "لَا إِلَهَ إِلَّا أَنْتَ سُبْحَانَكَ إِنِّي كُنْتُ مِنَ الظَّالِمِينَ", target: 100, category: "أدعية وأذكار" },
    { text: "سُبْحَانَ اللَّهِ وَبِحَمْدِهِ: عَدَدَ خَلْقِهِ، وَرِضَا نَفْسِهِ، وَزِنَةَ عَرْشِهِ، وَمِدَادَ كَلِمَاتِهِ", target: 3, category: "أذكار جامعة" },
    { text: "لَا إِلَهَ إِلَّا اللَّهُ", target: 100, category: "توحيد" },
    { text: "يَا حَيُّ يَا قَيُّومُ بِرَحْمَتِكَ أَسْتَغِيثُ", target: 100, category: "أدعية وأذكار" },
    { text: "اللَّهُمَّ إِنَّكَ عَفُوٌّ تُحِبُّ الْعَفْوَ فَاعْفُ عَنِّي", target: 100, category: "استغفار وتوبة" },
    { text: "رَضِيتُ بِاللَّهِ رَبًّـا، وَبِالإِسْلاَمِ دِيـنًا، وَبِمُحَمَّدٍ صَلَّى اللَّهُ عَلَيْهِ وَسَلَّمَ نَبِيًّـا", target: 3, category: "أذكار اليوم" },
    { text: "بِسْمِ اللَّهِ الَّذِي لَا يَضُرُّ مَعَ اسْمِهِ شَيْءٌ فِي الْأَرْضِ وَلَا فِي السَّمَاءِ وَهُوَ السَّمِيعُ الْعَلِيمُ", target: 3, category: "حفظ وحماية" }
  ];

  let target = athkar[currentDhikrIndex].target;

  const render = () => {
    container.innerHTML = `
      <div class="tasbih-header-card animate-slide-up stagger-1">
        <h2>المسبحة الإلكترونية 📿</h2>
        <p>ألا بذكر الله تطمئن القلوب</p>
      </div>

      <div class="tasbih-controls animate-slide-up stagger-2" style="position: relative;">
        <button class="tasbih-btn-icon reset-btn" id="reset-btn" title="تصفير العداد">
          <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
            <path d="M3 3v5h5"/>
          </svg>
        </button>

        <div class="tasbih-dhikr-container" style="flex: 1; text-align: center;">
          <button id="open-dhikr-modal-btn" style="background: var(--accent-bg); border: 1px solid var(--glass-border); padding: 0.65rem 1.25rem; border-radius: var(--radius-full); cursor: pointer; color: var(--accent); font-weight: 700; font-size: 1.05rem; display: inline-flex; align-items: center; gap: 0.5rem; max-width: 90%; text-overflow: ellipsis; overflow: hidden; white-space: nowrap; transition: all 0.2s;">
            <span>${athkar[currentDhikrIndex].text}</span>
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"></polyline></svg>
          </button>
        </div>

        <button class="tasbih-btn-icon target-btn" id="target-btn" title="تغيير الهدف">
          <span class="target-text" style="font-family: var(--font-english); font-weight: bold; font-size: 0.9rem;">${target}</span>
        </button>
      </div>

      <div class="tasbih-counter-container animate-scale-in stagger-3">
        <button class="tasbih-main-btn" id="tasbih-btn">
          <div class="tasbih-count-display">
            <span class="tasbih-count">${count}</span>
          </div>
          <div class="tasbih-ripple"></div>
        </button>
      </div>

      <div class="tasbih-progress animate-slide-up stagger-4">
        <div class="progress-bar-container">
          <div class="progress-bar-fill" style="width: ${Math.min((count / target) * 100, 100)}%; transition: width 0.3s ease;"></div>
        </div>
      </div>

      <!-- Dhikr Modal Selector -->
      <div id="dhikr-modal" style="display: ${isModalOpen ? 'flex' : 'none'}; position: fixed; inset: 0; background: rgba(0,0,0,0.6); backdrop-filter: blur(8px); z-index: 2000; align-items: center; justify-content: center; padding: 1rem; direction: rtl;">
        <div style="background: var(--bg-card); border-radius: var(--radius-lg); border: 1px solid var(--glass-border); width: 100%; max-width: 480px; max-height: 80vh; display: flex; flex-direction: column; box-shadow: var(--shadow-lg); overflow: hidden; animation: scaleIn 0.2s ease;">
          
          <div style="padding: 1.25rem; border-bottom: 1px solid var(--glass-border); display: flex; justify-content: space-between; align-items: center;">
            <span style="font-weight: 700; font-size: 1.1rem; color: var(--text-primary);">اختر ذكراً 📿</span>
            <button id="close-dhikr-modal-btn" style="background: none; border: none; font-size: 1.5rem; color: var(--text-muted); cursor: pointer; display: flex; align-items: center; justify-content: center; border-radius: 50%; width: 32px; height: 32px;">✕</button>
          </div>

          <div style="overflow-y: auto; padding: 1rem; display: flex; flex-direction: column; gap: 0.5rem; scrollbar-width: thin;">
            ${athkar.map((dhikr, index) => `
              <div class="dhikr-modal-item" data-index="${index}" style="padding: 1rem; border-radius: var(--radius-md); background: ${index === currentDhikrIndex ? 'var(--accent-bg)' : 'var(--bg-main)'}; border: 1px solid ${index === currentDhikrIndex ? 'var(--accent)' : 'var(--glass-border)'}; cursor: pointer; display: flex; justify-content: space-between; align-items: center; transition: all 0.2s;">
                <div style="display: flex; flex-direction: column; gap: 0.35rem; text-align: right; flex: 1; margin-left: 1rem;">
                  <span style="font-weight: 700; color: ${index === currentDhikrIndex ? 'var(--accent)' : 'var(--text-primary)'}; font-size: 0.95rem; line-height: 1.5;">${dhikr.text}</span>
                  <span style="font-size: 0.75rem; color: var(--text-muted);">${dhikr.category}</span>
                </div>
                <div style="font-size: 0.8rem; font-weight: 700; color: ${index === currentDhikrIndex ? 'white' : 'var(--accent)'}; background: ${index === currentDhikrIndex ? 'var(--accent)' : 'var(--accent-bg)'}; padding: 0.4rem 0.8rem; border-radius: var(--radius-full); white-space: nowrap; flex-shrink: 0;">${dhikr.target} مرة</div>
              </div>
            `).join('')}
          </div>

        </div>
      </div>
    `;

    // Event Listeners
    const tasbihBtn = container.querySelector('#tasbih-btn');
    tasbihBtn.addEventListener('click', () => {
      count++;
      if (navigator.vibrate) {
        if (count === target) navigator.vibrate([100, 50, 100]);
        else navigator.vibrate(20);
      }

      container.querySelector('.tasbih-count').textContent = count;
      container.querySelector('.progress-bar-fill').style.width = Math.min((count / target) * 100, 100) + '%';

      if (count === target) {
        showToast('اكتمل الهدف! 🎉 ممتاز', 'success');
        setTimeout(() => {
          currentDhikrIndex = (currentDhikrIndex + 1) % athkar.length;
          target = athkar[currentDhikrIndex].target;
          count = 0;
          render();
        }, 1000);
      }
    });

    container.querySelector('#reset-btn').addEventListener('click', () => {
      count = 0;
      if (navigator.vibrate) navigator.vibrate(30);
      showToast('تم تصفير العداد', 'info', 1500);
      render();
    });

    container.querySelector('#open-dhikr-modal-btn').addEventListener('click', () => {
      isModalOpen = true;
      render();
    });

    container.querySelector('#close-dhikr-modal-btn')?.addEventListener('click', () => {
      isModalOpen = false;
      render();
    });

    container.querySelectorAll('.dhikr-modal-item').forEach(item => {
      item.addEventListener('click', () => {
        currentDhikrIndex = parseInt(item.dataset.index);
        target = athkar[currentDhikrIndex].target;
        count = 0;
        isModalOpen = false;
        if (navigator.vibrate) navigator.vibrate(30);
        render();
      });
    });

    container.querySelector('#target-btn').addEventListener('click', () => {
      target = target === 33 ? 100 : (target === 100 ? 1000 : 33);
      if (navigator.vibrate) navigator.vibrate(30);
      showToast(`تم تغيير الهدف إلى ${target}`, 'info', 1500);
      render();
    });
  };

  render();
  return container;
}
