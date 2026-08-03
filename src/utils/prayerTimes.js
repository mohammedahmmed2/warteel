import * as adhan from 'adhan';

import { state } from '../app.js';

/**
 * Gets the user's location via Geolocation API or IP fallback.
 * Falls back to Mecca coordinates if denied or unavailable.
 */
export async function getUserLocation() {
    return new Promise((resolve) => {
        if (!navigator.geolocation) {
            fallbackToIp(resolve);
        } else {
            try {
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        const loc = {
                            lat: position.coords.latitude,
                            lng: position.coords.longitude,
                            name: 'موقعك الحالي'
                        };
                        localStorage.setItem('lastKnownLocation', JSON.stringify(loc));
                        resolve(loc);
                    },
                    (error) => {
                        console.warn("Geolocation denied or error, falling back to IP", error);
                        fallbackToIp(resolve);
                    },
                    { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
                );
            } catch (err) {
                console.warn("Geolocation synchronous error, falling back to IP", err);
                fallbackToIp(resolve);
            }
        }
    });
}

async function fallbackToIp(resolve) {
    try {
        const response = await fetch('https://ipapi.co/json/');
        if (response.ok) {
            const data = await response.json();
            if (data.latitude && data.longitude) {
                const loc = {
                    lat: data.latitude,
                    lng: data.longitude,
                    name: data.city || 'موقعك الحالي'
                };
                localStorage.setItem('lastKnownLocation', JSON.stringify(loc));
                resolve(loc);
                return;
            }
        }
    } catch (e) {
        console.error('IP Fallback failed', e);
    }
    
    // Check if we have a last known location in cache (offline fallback)
    const cachedLoc = localStorage.getItem('lastKnownLocation');
    if (cachedLoc) {
        try {
            resolve(JSON.parse(cachedLoc));
            return;
        } catch(e) {}
    }
    
    // Mecca default
    resolve({ lat: 21.4225, lng: 39.8262, name: 'مكة المكرمة' });
}

/**
 * Calculates prayer times for a given location and date.
 */
export function calculatePrayerTimes(lat, lng, date = new Date(), timeFormat = '12') {
    const coordinates = new adhan.Coordinates(lat, lng);
    
    // Select calculation method
    let params;
    switch (state.calculationMethod) {
        case 'MuslimWorldLeague': params = adhan.CalculationMethod.MuslimWorldLeague(); break;
        case 'Egyptian': params = adhan.CalculationMethod.Egyptian(); break;
        case 'MoonsightingCommittee': params = adhan.CalculationMethod.MoonsightingCommittee(); break;
        case 'NorthAmerica': params = adhan.CalculationMethod.NorthAmerica(); break;
        case 'Kuwait': params = adhan.CalculationMethod.Kuwait(); break;
        case 'Qatar': params = adhan.CalculationMethod.Qatar(); break;
        case 'Dubai': params = adhan.CalculationMethod.Dubai(); break;
        case 'UmmAlQura':
        default: params = adhan.CalculationMethod.UmmAlQura(); break;
    }
    
    // Select Asr Madhab
    if (state.madhab === 'Hanafi') {
        params.madhab = adhan.Madhab.Hanafi;
    } else {
        params.madhab = adhan.Madhab.Shafi;
    }
    
    // Enable High Latitude Rule
    params.highLatitudeRule = adhan.HighLatitudeRule.TwilightAngle;

    const prayerTimes = new adhan.PrayerTimes(coordinates, date, params);
    
    const formatTime = (dateObj) => {
        if (!dateObj || isNaN(dateObj.getTime())) return "--:--";
        let hours = dateObj.getHours();
        let minutes = dateObj.getMinutes();
        
        if (timeFormat === '12') {
            const ampm = hours >= 12 ? 'م' : 'ص';
            hours = hours % 12;
            hours = hours ? hours : 12; // the hour '0' should be '12'
            return `${hours}:${minutes.toString().padStart(2, '0')} ${ampm}`;
        }
        
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    };

    return {
        fajr: { id: 'fajr', name: 'Fajr', time: formatTime(prayerTimes.fajr), date: prayerTimes.fajr },
        sunrise: { id: 'sunrise', name: 'Sunrise', time: formatTime(prayerTimes.sunrise), date: prayerTimes.sunrise },
        dhuhr: { id: 'dhuhr', name: 'Dhuhr', time: formatTime(prayerTimes.dhuhr), date: prayerTimes.dhuhr },
        asr: { id: 'asr', name: 'Asr', time: formatTime(prayerTimes.asr), date: prayerTimes.asr },
        maghrib: { id: 'maghrib', name: 'Maghrib', time: formatTime(prayerTimes.maghrib), date: prayerTimes.maghrib },
        isha: { id: 'isha', name: 'Isha', time: formatTime(prayerTimes.isha), date: prayerTimes.isha },
        nextPrayer: prayerTimes.nextPrayer() === 'sunrise' ? 'dhuhr' : prayerTimes.nextPrayer()
    };
}

/**
 * Formats the time remaining between now and the target date.
 */
export function getTimeRemaining(targetDate, lang = 'ar') {
    if (!targetDate) return "00:00:00";
    
    const now = new Date().getTime();
    const distance = targetDate.getTime() - now;

    if (distance < 0) return "00:00:00";

    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    const pad = (n) => n.toString().padStart(2, '0');
    return `${hours > 0 ? pad(hours) + ':' : ''}${pad(minutes)}:${pad(seconds)}`;
}
