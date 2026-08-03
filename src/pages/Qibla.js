import { t } from '../utils/i18n.js';
import { showToast } from '../utils/toast.js';
import { getUserLocation } from '../utils/prayerTimes.js';
import * as adhan from 'adhan';
export function QiblaPage(navigate) {
  const container = document.createElement('div');
  container.className = 'qibla-page animate-fade-in';

  // Countries and cities will be loaded from public/countries.json
  let countriesData = [];

  container.innerHTML = `
    <div class="app-bar animate-slide-up stagger-1">
      <div class="app-bar-icon" id="qibla-back-btn" style="cursor: pointer;">
        <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"></polyline></svg>
      </div>
      <div class="app-title" style="display: flex; align-items: center; gap: 0.5rem;">
        <img src="/logo.png" alt="Warteel" class="app-header-logo" style="height: 28px;" />
        <span>${t('nav_qibla')}</span>
      </div>
      <div class="app-bar-icon" style="opacity: 0;"></div>
    </div>
    
    <div class="qibla-content" style="display: flex; flex-direction: column; align-items: center; gap: 1.5rem; margin-top: 1rem;">
      
      <!-- City selector for Desktop/Manual -->
      <div style="width: 100%; max-width: 380px; background: var(--bg-card); padding: 1rem; border-radius: var(--radius-md); border: 1px solid var(--glass-border); display: flex; flex-direction: column; gap: 0.85rem; box-shadow: var(--shadow-sm);">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <span style="font-size: 0.9rem; font-weight: bold; color: var(--text-primary);">تحديد الموقع:</span>
          <button id="qibla-auto-btn" style="background: var(--accent); color: white; border: none; padding: 0.4rem 0.8rem; border-radius: var(--radius-sm); font-size: 0.85rem; cursor: pointer; display: flex; align-items: center; gap: 0.3rem;">
            📍 تلقائي (GPS)
          </button>
        </div>
        <div style="display: flex; gap: 0.5rem; flex-direction: column;">
          <select id="qibla-country-select" style="width: 100%; padding: 0.6rem; border-radius: var(--radius-sm); border: 1px solid var(--glass-border); background: var(--bg-main); color: var(--text-primary); font-size: 0.9rem; outline: none; cursor: pointer;">
            <option value="">-- جاري التحميل... --</option>
          </select>
          <select id="qibla-city-select" disabled style="width: 100%; padding: 0.6rem; border-radius: var(--radius-sm); border: 1px solid var(--glass-border); background: var(--bg-main); color: var(--text-primary); font-size: 0.9rem; outline: none; cursor: pointer;">
            <option value="">-- اختر المدينة --</option>
          </select>
        </div>
      </div>

      <div class="new-compass-wrapper animate-scale-in stagger-2">
        <div class="static-top-marker">
          <svg viewBox="0 0 24 24" width="24" height="24" fill="#F08A5D"><path d="M12 18L5 8H19L12 18Z"/></svg>
        </div>
        
        <div class="new-compass-dial" id="compass-rose">
          <div class="new-compass-mark n">N</div>
          <div class="new-compass-mark e">E</div>
          <div class="new-compass-mark s">S</div>
          <div class="new-compass-mark w">W</div>
          <div class="new-compass-dot d1"></div>
          <div class="new-compass-dot d2"></div>
          <div class="new-compass-dot d3"></div>
          <div class="new-compass-dot d4"></div>
          
          <div class="new-kaaba-pointer" id="kaaba-pointer">
            <div class="kaaba-icon-bg">
              <svg viewBox="0 0 24 24" fill="none" width="20" height="20">
                <path d="M5 8V20C5 20.5523 5.44772 21 6 21H18C18.5523 21 19 20.5523 19 20V8" fill="#1A1A1A"/>
                <path d="M5 8L12 4L19 8H5Z" fill="#262626"/>
                <rect x="5" y="10" width="14" height="2" fill="#D98A44"/>
                <path d="M11 16H13V21H11V16Z" fill="#D98A44"/>
              </svg>
            </div>
          </div>
        </div>
        
        <div class="new-compass-needle" id="compass-needle">
          <svg viewBox="0 0 40 120" width="40" height="120" fill="none">
            <circle cx="20" cy="100" r="12" fill="url(#needle-grad)"/>
            <circle cx="20" cy="100" r="14" stroke="#fff" stroke-width="2"/>
            <path d="M20 20 L14 90 L26 90 Z" fill="url(#needle-grad)"/>
            <defs>
              <linearGradient id="needle-grad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stop-color="#F5A623"/>
                <stop offset="100%" stop-color="#F05A28"/>
              </linearGradient>
            </defs>
          </svg>
        </div>
      </div>
      
      <div class="new-qibla-info animate-slide-up stagger-3" style="text-align: center;">
        <div class="qibla-degree" id="qibla-degree" style="font-size: 2.5rem; font-weight: 800; color: var(--accent);">--°</div>
        <div class="qibla-degree-label" id="qibla-degree-label" style="font-size: 0.9rem; color: var(--text-secondary); margin-bottom: 0.5rem;">اتجاه القبلة من الشمال</div>
        <div class="qibla-action-badge" id="qibla-action-badge" style="padding: 0.75rem 1.5rem; border-radius: var(--radius-full); background: var(--bg-card); color: var(--text-primary); border: 1px solid var(--glass-border);">${t('finding_qibla')}...</div>
        <button class="btn btn-primary" id="start-compass-btn" style="display:none; margin: 1rem auto; padding: 0.75rem 1.5rem; border-radius: var(--radius-full); border: none; background: var(--accent); color: white;">${t('start_compass')}</button>
      </div>
    </div>
  `;

  const backBtn = container.querySelector('#qibla-back-btn');
  backBtn.addEventListener('click', () => navigate('home'));

  const compassRose = container.querySelector('#compass-rose');
  const kaabaPointer = container.querySelector('#kaaba-pointer');
  const compassNeedle = container.querySelector('#compass-needle');
  const degreeEl = container.querySelector('#qibla-degree');
  const degreeLabel = container.querySelector('#qibla-degree-label');
  const badgeEl = container.querySelector('#qibla-action-badge');
  const startBtn = container.querySelector('#start-compass-btn');
  const countrySelect = container.querySelector('#qibla-country-select');
  const citySelect = container.querySelector('#qibla-city-select');
  const autoBtn = container.querySelector('#qibla-auto-btn');

  let userHeading = 0;
  let qiblaBearing = null;
  let qiblaToastShown = false;
  let hasCompass = false;
  let checkCompassTimeout = null;
  let qiblaLat = 21.422487;
  let qiblaLng = 39.826206;
  let userLat = null;
  let userLng = null;

  function calculateQibla(lat, lng) {
    const coords = new adhan.Coordinates(lat, lng);
    return adhan.Qibla(coords);
  }

  function updateCompass() {
    if (qiblaBearing !== null) {
      if (hasCompass) {
        compassRose.style.transform = `rotate(${-userHeading}deg)`;
        kaabaPointer.style.transform = `translate(-50%, -50%) rotate(${qiblaBearing}deg) translateY(-145px) rotate(${-qiblaBearing + userHeading}deg)`;
        
        let diff = Math.round((qiblaBearing - userHeading + 360) % 360);
        if (diff > 180) diff -= 360;
        const absDiff = Math.abs(diff);
        
        degreeEl.innerText = `${Math.round(userHeading)}°`;
        degreeLabel.innerText = "زاوية الجهاز لاتجاه القبلة";
        
        if (absDiff < 5) {
          badgeEl.innerText = "أنت متجه نحو القبلة الشريفة 🎉";
          badgeEl.style.background = "var(--accent)";
          badgeEl.style.color = "white";
          if(navigator.vibrate) navigator.vibrate(50);
          if(!qiblaToastShown) {
            showToast('أنت تواجه القبلة الآن!', 'success');
            qiblaToastShown = true;
          }
        } else {
          const dirText = diff > 0 ? "لليمين" : "لليسار";
          badgeEl.innerText = `قم بتدوير الهاتف ${absDiff}° ${dirText}`;
          badgeEl.style.background = "var(--bg-card)";
          badgeEl.style.color = "var(--text-secondary)";
          qiblaToastShown = false;
        }
      } else {
        // Desktop Static Mode
        compassRose.style.transform = `rotate(0deg)`;
        kaabaPointer.style.transform = `translate(-50%, -50%) rotate(${qiblaBearing}deg) translateY(-145px) rotate(${-qiblaBearing}deg)`;
        compassNeedle.style.opacity = '0.3';
        
        degreeEl.innerText = `${Math.round(qiblaBearing)}°`;
        degreeLabel.innerText = "زاوية القبلة من الشمال الجغرافي";
        
        // Build map URL
        const mapUrl = `https://www.google.com/maps/dir/${userLat},${userLng}/21.4225,39.8262/`;
        
        badgeEl.innerHTML = `
          <div>اتجاه القبلة من موقعك: ${Math.round(qiblaBearing)}° من الشمال</div>
          <a href="${mapUrl}" target="_blank" style="display: inline-block; margin-top: 10px; background: var(--accent); color: white; padding: 0.5rem 1rem; border-radius: var(--radius-full); text-decoration: none; font-size: 0.9rem; font-weight: bold; transition: opacity 0.2s;">
            🗺️ عرض الاتجاه على الخريطة
          </a>
        `;
        badgeEl.style.background = "var(--bg-card)";
        badgeEl.style.color = "var(--text-primary)";
      }
    }
  }

  function setCoords(lat, lng, name = '') {
    userLat = lat;
    userLng = lng;
    qiblaBearing = calculateQibla(lat, lng);
    if (name) showToast(`تم ضبط الموقع: ${name}`, 'success');
    updateCompass();
  }

  const regionNames = new Intl.DisplayNames(['ar'], { type: 'region' });

  // Load countries JSON
  fetch('/countries.json')
    .then(res => res.json())
    .then(data => {
      countriesData = data;
      countrySelect.innerHTML = '<option value="">-- اختر الدولة --</option>';
      countriesData.forEach((country, index) => {
        let arName = country.name;
        try {
          arName = regionNames.of(country.id) || country.name;
        } catch (e) {}
        countrySelect.innerHTML += `<option value="${index}">${arName}</option>`;
      });
    })
    .catch(err => {
      console.error('Error loading countries:', err);
      countrySelect.innerHTML = '<option value="">خطأ في التحميل</option>';
    });

  countrySelect.addEventListener('change', (e) => {
    const index = e.target.value;
    if (index === "") {
      citySelect.innerHTML = '<option value="">-- اختر المدينة --</option>';
      citySelect.disabled = true;
      return;
    }
    const country = countriesData[index];
    citySelect.innerHTML = '<option value="">-- اختر المدينة --</option>';
    country.cities.forEach((city, cityIndex) => {
      citySelect.innerHTML += `<option value="${cityIndex}">${city.n}</option>`;
    });
    citySelect.disabled = false;
  });

  citySelect.addEventListener('change', (e) => {
    const cityIndex = e.target.value;
    const countryIndex = countrySelect.value;
    if (cityIndex !== "" && countryIndex !== "") {
      const city = countriesData[countryIndex].cities[cityIndex];
      let arName = countriesData[countryIndex].name;
      try {
        arName = regionNames.of(countriesData[countryIndex].id) || arName;
      } catch (e) {}
      setCoords(city.lat, city.lng, `${city.n} (${arName})`);
    }
  });

  autoBtn.addEventListener('click', startSensors);

  async function startSensors() {
    startBtn.style.display = 'none';
    
    try {
        const loc = await getUserLocation();
        setCoords(loc.lat, loc.lng, loc.name === 'Mecca' ? 'مكة المكرمة (افتراضي)' : '');
        checkCompassTimeout = setTimeout(() => {
            if (!hasCompass) updateCompass();
        }, 1500);
    } catch (error) {
        setCoords(21.4225, 39.8262, 'مكة المكرمة (افتراضي)');
    }

    const handleOrientation = (event) => {
      let heading = null;
      if (event.webkitCompassHeading) {
        heading = event.webkitCompassHeading;
      } else if (event.alpha !== null) {
        heading = 360 - event.alpha;
      }
      
      if (heading !== null && !isNaN(heading)) {
        if (!hasCompass) {
          hasCompass = true;
          if (checkCompassTimeout) clearTimeout(checkCompassTimeout);
          compassNeedle.style.opacity = '1';
        }
        userHeading = heading;
        updateCompass();
      }
    };

    if ('ondeviceorientationabsolute' in window) {
      window.addEventListener('deviceorientationabsolute', handleOrientation);
    } else {
      window.addEventListener('deviceorientation', handleOrientation);
    }
  }

  if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
    startBtn.style.display = 'block';
    badgeEl.innerText = t('compass_permission_needed') || "Permission needed";
    startBtn.addEventListener('click', () => {
      DeviceOrientationEvent.requestPermission()
        .then(response => {
          if (response == 'granted') startSensors();
          else showToast('تم رفض صلاحية البوصلة', 'error');
        })
        .catch(console.error);
    });
  } else {
    setTimeout(startSensors, 300);
  }
  
  return container;
}
