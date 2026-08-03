import { t } from '../utils/i18n.js';
import { getUserLocation, calculatePrayerTimes, getTimeRemaining } from '../utils/prayerTimes.js';
import { state } from '../app.js';

export function PrayerTimesPage(navigate) {
    const container = document.createElement('div');
    container.className = 'prayer-times-page';

    // State for the selected date
    let currentDate = new Date();
    // Keep reference to today for logic
    const today = new Date();
    
    // UI Elements
    let timesData = null;
    let countdownInterval = null;
    let locationData = null;

    const render = async () => {
        if (!locationData) {
            container.innerHTML = `<div class="loading-spinner" style="margin-top: 5rem;">${t('loading')}...</div>`;
            try {
                locationData = await getUserLocation();
            } catch (e) {
                console.error("Location error", e);
                locationData = { lat: 21.4225, lng: 39.8262, name: 'Mecca' };
            }
        }

        // Calculate times for the selected date
        timesData = calculatePrayerTimes(locationData.lat, locationData.lng, currentDate, state.timeFormat);

        // Formats for dates
        const gregOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        const hijriOptions = { year: 'numeric', month: 'long', day: 'numeric', calendar: 'islamic-umalqura' };
        const dayOptions = { weekday: 'long' };

        const langLocale = state.language === 'en' ? 'en-US' : 'ar-SA';
        const gregStr = new Intl.DateTimeFormat(state.language === 'en' ? 'en-US' : 'ar-EG', { year: 'numeric', month: 'long', day: 'numeric' }).format(currentDate);
        const hijriStr = new Intl.DateTimeFormat(state.language === 'en' ? 'en-US-u-ca-islamic-umalqura' : 'ar-SA-u-ca-islamic-umalqura', hijriOptions).format(currentDate);
        const dayStr = new Intl.DateTimeFormat(langLocale, dayOptions).format(currentDate);

        // Check if the selected date is today
        const isToday = currentDate.toDateString() === today.toDateString();

        const appBar = `
            <div class="app-bar" style="justify-content: space-between;">
                <div class="boxed-icon-btn back-btn" style="z-index: 10;">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"></polyline></svg>
                </div>
                <div class="app-title" style="flex:1; display: flex; align-items: center; justify-content: center; gap: 0.5rem; font-size:1.2rem; font-weight:700;">
                    <img src="/logo.png" alt="Warteel" class="app-header-logo" style="height: 28px;" />
                    <span>${t('prayer_times') || 'مواقيت الصلاة'}</span>
                </div>
                <div style="width: 44px; height: 44px;"></div>
            </div>
        `;

        const dateNavigator = `
            <div class="date-navigator-card">
                <div class="date-nav-btn prev-day">
                    <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"></polyline></svg>
                </div>
                <div class="date-display">
                    <div class="day-name">${dayStr}</div>
                    <div class="hijri-date">${hijriStr}</div>
                    <div class="greg-date">${gregStr}</div>
                </div>
                <div class="date-nav-btn next-day">
                    <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"></polyline></svg>
                </div>
            </div>
        `;

        const formatTimeStr = (dateObj) => {
            if (!dateObj || typeof dateObj.getTime !== 'function' || isNaN(dateObj.getTime())) return "--:--";
            let hours = dateObj.getHours();
            let minutes = dateObj.getMinutes();
            if (state.timeFormat === '12') {
                const ampm = hours >= 12 ? 'م' : 'ص';
                hours = hours % 12;
                hours = hours ? hours : 12;
                return `${hours}:${minutes.toString().padStart(2, '0')} ${ampm}`;
            }
            return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
        };

        const getIcon = (id) => {
            if (id === 'fajr') return '<path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"></path>';
            if (id === 'sunrise') return '<path d="M17 18a5 5 0 0 0-10 0"></path><line x1="12" y1="2" x2="12" y2="9"></line><line x1="4.22" y1="10.22" x2="5.64" y2="11.64"></line><line x1="1" y1="18" x2="3" y2="18"></line><line x1="21" y1="18" x2="23" y2="18"></line><line x1="18.36" y1="11.64" x2="19.78" y2="10.22"></line><line x1="23" y1="22" x2="1" y2="22"></line><polyline points="8 6 12 2 16 6"></polyline>';
            if (id === 'dhuhr' || id === 'asr') return '<circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>';
            return '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>'; // Maghrib, Isha
        };

        const prayerKeys = ['fajr', 'sunrise', 'dhuhr', 'asr', 'maghrib', 'isha'];
        
        let nextPrayerKey = null;
        if (isToday) {
            nextPrayerKey = timesData.nextPrayer;
        }

        const prayerListHTML = prayerKeys.map(key => {
            const prayerObj = timesData[key];
            const isActive = nextPrayerKey === key;
            return `
                <div class="prayer-time-card ${isActive ? 'active-prayer' : ''}">
                    <div class="prayer-time-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">${getIcon(key)}</svg>
                    </div>
                    <div class="prayer-time-info">
                        <div class="prayer-name-large">${t(key)}</div>
                    </div>
                    <div class="prayer-time-value" style="direction: ltr;">
                        ${formatTimeStr(prayerObj.date)}
                    </div>
                </div>
            `;
        }).join('');

        const countdownSection = isToday && nextPrayerKey !== 'none' ? `
            <div class="countdown-card">
                <div class="countdown-label">متبقي على ${t(nextPrayerKey) || timesData[nextPrayerKey].name}</div>
                <div class="countdown-timer" id="pt-page-countdown">--:--:--</div>
            </div>
        ` : '';

        container.innerHTML = `
            ${appBar}
            <div class="prayer-times-content">
                ${dateNavigator}
                ${countdownSection}
                <div class="prayer-times-grid">
                    ${prayerListHTML}
                </div>
            </div>
        `;

        // Event Listeners
        const backBtn = container.querySelector('.back-btn');
        if (backBtn) {
            backBtn.addEventListener('click', () => navigate('home'));
        }

        const prevBtn = container.querySelector('.prev-day');
        if (prevBtn) {
            prevBtn.addEventListener('click', () => {
                currentDate.setDate(currentDate.getDate() - 1);
                render();
            });
        }

        const nextBtn = container.querySelector('.next-day');
        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                currentDate.setDate(currentDate.getDate() + 1);
                render();
            });
        }

        // Setup Countdown
        if (countdownInterval) clearInterval(countdownInterval);
        
        if (isToday && nextPrayerKey !== 'none') {
            const countdownEl = container.querySelector('#pt-page-countdown');
            if (countdownEl) {
                // Determine actual next prayer target date
                let targetDate = timesData[nextPrayerKey].date;
                if (!targetDate && nextPrayerKey === 'fajr') {
                    // Next fajr is tomorrow
                    const tmrw = new Date();
                    tmrw.setDate(tmrw.getDate() + 1);
                    const tTimes = calculatePrayerTimes(locationData.lat, locationData.lng, tmrw, state.timeFormat);
                    targetDate = tTimes.fajr.date;
                }

                countdownInterval = setInterval(() => {
                    if (!container.isConnected) {
                        clearInterval(countdownInterval);
                        return;
                    }
                    const newRem = getTimeRemaining(targetDate, state.language);
                    if (newRem === "00:00:00") {
                        clearInterval(countdownInterval);
                        // Refresh to get new times
                        render();
                    } else {
                        countdownEl.textContent = newRem;
                    }
                }, 1000);
                
                // Initial tick
                countdownEl.textContent = getTimeRemaining(targetDate, state.language);
            }
        }
    };

    // Cleanup when component unmounts
    const originalRemove = container.remove;
    container.remove = function() {
        if (countdownInterval) clearInterval(countdownInterval);
        originalRemove.call(this);
    };

    render();
    return container;
}
