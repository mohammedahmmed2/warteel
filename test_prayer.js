import * as adhan from 'adhan';

function calculatePrayerTimes(lat, lng, date = new Date(), timeFormat = '12') {
    const coordinates = new adhan.Coordinates(lat, lng);
    
    // Select calculation method
    let params;
    params = adhan.CalculationMethod.UmmAlQura();
    params.madhab = adhan.Madhab.Shafi;
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

try {
    const times = calculatePrayerTimes(21.4225, 39.8262);
    console.log("Calculated times:", times.nextPrayer);
    let nextPrayerKey = times.nextPrayer;
    
    let nextPrayerTime = null;
    let nextPrayerName = 'None';
    
    if (nextPrayerKey !== 'none' && times[nextPrayerKey]) {
        nextPrayerTime = times[nextPrayerKey].date;
        nextPrayerName = times[nextPrayerKey].name;
    } else {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const tomorrowTimes = calculatePrayerTimes(21.4225, 39.8262, tomorrow, '12');
        nextPrayerTime = tomorrowTimes.fajr.date;
        nextPrayerName = tomorrowTimes.fajr.name;
        nextPrayerKey = 'fajr';
    }
    console.log("Success! nextPrayerKey =", nextPrayerKey);
} catch (e) {
    console.error("Error:", e);
}
