export async function checkNotificationPermission() {
    try {
        if ('Notification' in window) {
            if (Notification.permission === 'granted') {
                return true;
            } else if (Notification.permission !== 'denied') {
                const permission = await Notification.requestPermission();
                return permission === 'granted';
            }
        }
        return false;
    } catch (error) {
        console.error('Error checking notification permission:', error);
        return false;
    }
}

export async function triggerNotification(title, body, icon = '/vite.svg') {
    try {
        const hasPermission = await checkNotificationPermission();
        if (!hasPermission) return;

        if ('Notification' in window) {
            new Notification(title, { body, icon });
        }
    } catch (error) {
        console.error('Error triggering notification:', error);
    }
}
