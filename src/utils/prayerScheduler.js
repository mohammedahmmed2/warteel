import { state } from '../app.js';
import { calculatePrayerTimes, getUserLocation } from './prayerTimes.js';
import { triggerNotification } from './notifications.js';
import { t } from './i18n.js';

let schedulerTimeout = null;

export async function initPrayerScheduler() {
    if (schedulerTimeout) {
        clearTimeout(schedulerTimeout);
    }

    try {
        const loc = await getUserLocation();
        
        const scheduleNext = () => {
            if (!state.prayerNotifications) return;

            const now = new Date();
            const times = calculatePrayerTimes(loc.lat, loc.lng, now, state.timeFormat);
            
            // Find the next prayer
            const prayers = ['fajr', 'sunrise', 'dhuhr', 'asr', 'maghrib', 'isha'];
            let nextPrayerId = null;
            let nextPrayerDate = null;
            let nextPrayerName = '';

            for (let prayer of prayers) {
                if (prayer === 'sunrise') continue; // Don't notify for sunrise
                if (times[prayer].date > now) {
                    nextPrayerId = prayer;
                    nextPrayerDate = times[prayer].date;
                    nextPrayerName = times[prayer].name;
                    break;
                }
            }

            // If no next prayer today, schedule for Fajr tomorrow
            if (!nextPrayerDate) {
                const tomorrow = new Date(now);
                tomorrow.setDate(tomorrow.getDate() + 1);
                const tomorrowTimes = calculatePrayerTimes(loc.lat, loc.lng, tomorrow, state.timeFormat);
                nextPrayerDate = tomorrowTimes.fajr.date;
                nextPrayerName = tomorrowTimes.fajr.name;
            }

            const timeToWait = nextPrayerDate.getTime() - new Date().getTime();
            
            if (timeToWait > 0) {
                schedulerTimeout = setTimeout(() => {
                    if (state.prayerNotifications) {
                        triggerNotification(
                            t('prayer_time_title') || 'حان موعد الصلاة',
                            `${t('prayer_time_body') || 'حان الآن موعد صلاة'} ${t(nextPrayerId) || nextPrayerName}`
                        );
                    }
                    // Schedule the next one right after this triggers
                    scheduleNext();
                }, timeToWait);
            } else {
                // If something goes wrong (e.g. time is in the past), retry in 1 minute
                schedulerTimeout = setTimeout(scheduleNext, 60000);
            }
        };

        scheduleNext();

    } catch (err) {
        console.error('Failed to init prayer scheduler', err);
    }
}
