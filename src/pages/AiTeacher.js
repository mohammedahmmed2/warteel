import { state } from '../app.js';
import { Button } from '../components/Button.js';
import { showToast } from '../utils/toast.js';
import { getQuranData } from '../utils/quranData.js';

export function AiTeacherPage(navigate) {
  const container = document.createElement('div');
  container.className = 'ai-teacher-page animate-fade-in';
  
  container.innerHTML = `
    <header class="tasbih-header-card animate-slide-up stagger-1" style="margin-top: 1.5rem; margin-bottom: 1.5rem; width: auto; margin-left: 1.5rem; margin-right: 1.5rem;">
      <h2>رفيق الحفظ الذكي</h2>
      <p style="color: var(--text-secondary);">استمع إلى تلاوتك وصحح أخطاءك، واختبر حفظك</p>
    </header>

    <div class="ai-content" style="padding: 0 1.5rem; padding-bottom: 6rem; max-width: 600px; margin: 0 auto;">
      <div class="status-panel glass-panel" style="text-align: center; margin-bottom: 1.5rem;">
        <h3 id="ai-status" style="color: var(--text-primary); font-family: var(--font-arabic);">جاري التهيئة...</h3>
        <p id="ai-progress" style="color: var(--accent); font-family: var(--font-english); font-weight: bold; margin-top: 0.5rem;"></p>
      </div>
      
      <div class="recording-panel glass-panel animate-slide-up stagger-2" style="text-align: center; margin-bottom: 1.5rem;">
        <p style="color: var(--text-secondary); margin-bottom: 1rem;">اختر السورة والآية للاختبار</p>
        <div class="ayah-selector" style="display: flex; gap: 1rem; justify-content: center; margin-bottom: 1rem;">
          <select id="surah-select" class="custom-select" style="flex: 2;"><option>جاري التحميل...</option></select>
          <select id="ayah-select" class="custom-select" style="flex: 1;"><option>1</option></select>
        </div>
        
        <div style="display: flex; justify-content: center; margin-bottom: 1rem;">
          <button id="toggle-verse-btn" class="btn btn-outline" style="border-radius: 20px; font-size: 0.9rem; padding: 0.4rem 1rem;">
            👁️ إخفاء الآية (اختبار الحفظ)
          </button>
        </div>

        <div class="verse-display" style="background: var(--bg-main); padding: 1.5rem; border-radius: var(--radius-md); margin-bottom: 2rem; border: 1px solid var(--glass-border); min-height: 100px; display: flex; align-items: center; justify-content: center;">
           <h2 id="target-verse" style="font-family: var(--quran-font); color: var(--text-primary); line-height: 1.8; font-size: 1.8rem; transition: opacity 0.3s;">جاري التحميل...</h2>
        </div>

        <div class="record-controls" style="display: flex; flex-direction: column; align-items: center; gap: 1rem;">
          <button id="record-btn" class="fab-mic" style="position: static; width: 72px; height: 72px; font-size: 2rem;" disabled>🎤</button>
          <p id="record-hint" style="color: var(--text-secondary); font-family: var(--font-arabic);">انتظر تحميل النموذج</p>
        </div>
      </div>
      
      <div class="result-panel glass-panel animate-slide-up stagger-3" style="display:none; text-align: center;">
        <h3 style="color: var(--text-primary); margin-bottom: 1rem;">نتيجة التسميع:</h3>
        <p id="recognized-text" style="font-family: var(--font-arabic); font-size: 1.2rem; color: var(--text-secondary); line-height: 1.6;"></p>
        
        <div class="diff-result" style="margin-top: 1.5rem; padding-top: 1.5rem; border-top: 1px solid var(--glass-border); font-family: var(--font-arabic); font-size: 1.4rem; line-height: 1.8;">
          <!-- Diff visualization will go here -->
        </div>

        <div style="margin-top: 1.5rem; display: flex; justify-content: center; gap: 1rem;">
          <button id="next-ayah-btn" class="btn btn-primary" style="width: auto; padding: 0.8rem 2rem; border-radius: 24px;">الآية التالية ⏭️</button>
        </div>
      </div>
    </div>
  `;

  // Worker & state setup
  let worker = null;
  let isRecording = false;
  let mediaRecorder = null;
  let audioChunks = [];
  let cachedQuranData = null;
  let currentSurahObj = null;
  let verseVisible = true;

  const statusEl = container.querySelector('#ai-status');
  const progressEl = container.querySelector('#ai-progress');
  const recordBtn = container.querySelector('#record-btn');
  const recordHint = container.querySelector('#record-hint');
  const resultPanel = container.querySelector('.result-panel');
  const recognizedTextEl = container.querySelector('#recognized-text');
  const surahSelect = container.querySelector('#surah-select');
  const ayahSelect = container.querySelector('#ayah-select');
  const targetVerseEl = container.querySelector('#target-verse');
  const toggleVerseBtn = container.querySelector('#toggle-verse-btn');
  const nextAyahBtn = container.querySelector('#next-ayah-btn');

  const loadQuranData = async () => {
    try {
      cachedQuranData = await getQuranData();
      surahSelect.innerHTML = cachedQuranData.surahs.map(s => 
        `<option value="${s.number}">${s.number}. ${s.name}</option>`
      ).join('');
      
      updateAyahSelect(1);
    } catch (err) {
      console.error(err);
      targetVerseEl.textContent = 'خطأ في تحميل القرآن';
    }
  };

  const updateAyahSelect = (surahNumber) => {
    currentSurahObj = cachedQuranData.surahs.find(s => s.number == surahNumber);
    if (!currentSurahObj) return;

    ayahSelect.innerHTML = currentSurahObj.ayahs.map(a => 
      `<option value="${a.numberInSurah}">${a.numberInSurah}</option>`
    ).join('');
    
    displayCurrentVerse();
  };

  const displayCurrentVerse = () => {
    const ayahNum = parseInt(ayahSelect.value);
    const ayah = currentSurahObj.ayahs.find(a => a.numberInSurah === ayahNum);
    if (ayah) {
      targetVerseEl.textContent = ayah.text;
    }
  };

  surahSelect.addEventListener('change', (e) => {
    updateAyahSelect(e.target.value);
    resultPanel.style.display = 'none';
  });

  ayahSelect.addEventListener('change', () => {
    displayCurrentVerse();
    resultPanel.style.display = 'none';
  });

  toggleVerseBtn.addEventListener('click', () => {
    verseVisible = !verseVisible;
    targetVerseEl.style.opacity = verseVisible ? '1' : '0';
    toggleVerseBtn.innerHTML = verseVisible ? '👁️ إخفاء الآية (اختبار الحفظ)' : '🙈 إظهار الآية';
  });

  nextAyahBtn.addEventListener('click', () => {
    let currentAyahNum = parseInt(ayahSelect.value);
    if (currentAyahNum < currentSurahObj.ayahs.length) {
      ayahSelect.value = currentAyahNum + 1;
      displayCurrentVerse();
      resultPanel.style.display = 'none';
    } else {
      let currentSurahNum = parseInt(surahSelect.value);
      if (currentSurahNum < 114) {
        surahSelect.value = currentSurahNum + 1;
        updateAyahSelect(currentSurahNum + 1);
        resultPanel.style.display = 'none';
      } else {
        showToast('ختمت القرآن! مبارك لك', 'success');
      }
    }
  });

  loadQuranData();

  try {
    worker = new Worker(new URL('../ai/worker.js', import.meta.url), { type: 'module' });
    
    worker.postMessage({ type: 'load', modelName: state.aiModel });

    worker.addEventListener('message', (e) => {
      const msg = e.data;
      if (msg.status === 'loading') {
        statusEl.textContent = msg.message;
      } else if (msg.status === 'progress') {
        if (msg.info.status === 'progress') {
           progressEl.textContent = `تحميل: ${Math.round(msg.info.progress)}%`;
        }
      } else if (msg.status === 'ready') {
        statusEl.textContent = 'النموذج جاهز';
        statusEl.style.color = 'var(--primary)';
        progressEl.textContent = '';
        recordBtn.disabled = false;
        recordHint.textContent = 'اضغط على الميكروفون للبدء بالتسميع';
        showToast('نظام المعلم الذكي جاهز للاستماع', 'success');
      } else if (msg.status === 'transcribing') {
        statusEl.textContent = 'جاري تحليل تلاوتك...';
        recordHint.textContent = 'يرجى الانتظار، يتم تحليل الصوت...';
      } else if (msg.status === 'complete') {
        statusEl.textContent = 'اكتمل التحليل';
        recordHint.textContent = 'اضغط للتسميع مجدداً';
        resultPanel.style.display = 'block';
        recognizedTextEl.textContent = msg.text;
        
        // Simple diff logic
        const target = targetVerseEl.textContent.trim();
        const recognized = msg.text.trim();
        
        const diffHtml = createDiffHtml(target, recognized);
        container.querySelector('.diff-result').innerHTML = diffHtml;
      } else if (msg.status === 'error') {
        statusEl.textContent = 'حدث خطأ';
        progressEl.textContent = msg.error;
        progressEl.style.color = 'var(--error)';
        showToast('حدث خطأ أثناء تحميل النموذج', 'error');
      }
    });

  } catch(err) {
    statusEl.textContent = 'تعذر تشغيل المعلم الذكي';
    showToast('المتصفح لا يدعم تشغيل المعلم الذكي محلياً', 'warning');
    console.error(err);
  }

  // Record audio logic
  recordBtn.addEventListener('click', async () => {
    if (!isRecording) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorder = new MediaRecorder(stream);
        audioChunks = [];

        mediaRecorder.ondataavailable = e => audioChunks.push(e.data);
        mediaRecorder.onstop = async () => {
          const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
          const arrayBuffer = await audioBlob.arrayBuffer();
          const audioContext = new AudioContext({ sampleRate: 16000 });
          const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
          const audioData = audioBuffer.getChannelData(0); // Float32Array
          
          worker.postMessage({ type: 'transcribe', audioData });
        };

        mediaRecorder.start();
        isRecording = true;
        recordBtn.style.background = '#F87171'; // Red when recording
        recordBtn.innerHTML = '🛑';
        recordBtn.style.animation = 'pulse-ring 2s infinite';
        recordHint.textContent = 'جاري التسميع... اضغط للإيقاف عند الانتهاء';
        statusEl.textContent = 'أنا أستمع لك...';
        statusEl.style.color = 'var(--primary)';
        resultPanel.style.display = 'none';

        // Auto hide verse if it's shown, for testing mode
        if (verseVisible) toggleVerseBtn.click();

      } catch (err) {
        showToast('يرجى السماح بالوصول للميكروفون لبدء التسجيل', 'error', 4000);
      }
    } else {
      mediaRecorder.stop();
      isRecording = false;
      recordBtn.style.background = 'var(--primary)';
      recordBtn.innerHTML = '🎤';
      recordBtn.style.animation = 'none';
      showToast('تم إيقاف التسجيل، جاري تقييم الحفظ...', 'info');
    }
  });

  return container;
}

// Simple Word Diff Algorithm for presentation
function createDiffHtml(target, recognized) {
  // Strip diacritics for basic comparison accuracy
  const stripDiacritics = (str) => str.replace(/[\u064B-\u065F\u0670]/g, '');
  
  const tWords = target.split(' ');
  const rWords = recognized.split(' ');
  
  let html = '';
  for(let i = 0; i < tWords.length; i++) {
    const twStripped = stripDiacritics(tWords[i]);
    const rwStripped = rWords[i] ? stripDiacritics(rWords[i]) : '';
    
    if (rwStripped === twStripped || (rwStripped && twStripped.includes(rwStripped))) {
      html += \`<span style="color:var(--primary); margin:0 4px;">\${tWords[i]}</span>\`; // Correct
    } else if (rWords[i]) {
      html += \`<span style="color:#F87171; text-decoration:line-through; margin:0 4px; font-size:1.1rem;">\${rWords[i]}</span>\`; // Wrong
      html += \`<span style="color:var(--accent); margin:0 4px;">\${tWords[i]}</span>\`; // Expected
    } else {
      html += \`<span style="color:#9CA3AF; border-bottom: 2px dashed #F87171; margin:0 4px;">\${tWords[i]}</span>\`; // Missing
    }
  }
  return html;
}
