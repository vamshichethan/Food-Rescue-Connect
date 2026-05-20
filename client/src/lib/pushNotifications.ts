// Utility: register service worker + request browser push permission
// No Firebase / FCM key required – uses Web Push API natively

export async function registerPushNotifications(): Promise<boolean> {
  if (typeof window === 'undefined') return false;
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    console.warn('[Push] Browser does not support Web Push.');
    return false;
  }

  try {
    const reg = await navigator.serviceWorker.register('/sw.js');
    const permission = await Notification.requestPermission();

    if (permission !== 'granted') {
      console.warn('[Push] Permission denied by user.');
      return false;
    }

    console.info('[Push] Service Worker registered & permission granted.', reg);
    return true;
  } catch (err) {
    console.error('[Push] Failed to register service worker:', err);
    return false;
  }
}

export async function sendLocalNotification(title: string, body: string, url = '/'): Promise<void> {
  if (typeof window === 'undefined') return;
  if (Notification.permission !== 'granted') return;

  const reg = await navigator.serviceWorker.ready;
  reg.showNotification(title, {
    body,
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    vibrate: [200, 100, 200],
    data: { url },
    actions: [
      { action: 'view', title: '🍕 View Listing' },
      { action: 'dismiss', title: 'Dismiss' },
    ],
  } as NotificationOptions);
}
