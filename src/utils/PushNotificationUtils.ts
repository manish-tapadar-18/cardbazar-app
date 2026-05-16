import {
    getMessaging,
    getToken,
    subscribeToTopic,
    onMessage,
    onNotificationOpenedApp,
    getInitialNotification,
    FirebaseMessagingTypes,
} from '@react-native-firebase/messaging';
import notifee, { AndroidImportance, EventType } from '@notifee/react-native';
import { Alert, Platform } from 'react-native';
import EncryptedStorage from 'react-native-encrypted-storage';
import { checkNotifications, requestNotifications, RESULTS } from 'react-native-permissions';

const CHANNEL_ID = 'cardbazar_default';
const BG_PRESS_KEY = '_pn_bg_press';
const MODAL_DISMISSED_KEY = '_pn_modal_dismissed';

// ── Android notification channel ──────────────────────────────────────────────
export const createNotificationChannel = async (): Promise<void> => {
    if (Platform.OS !== 'android') return;
    await notifee.createChannel({
        id: CHANNEL_ID,
        name: 'CardBazar Notifications',
        importance: AndroidImportance.HIGH,
        sound: 'notification_sound',
    });
};

// ── Permission via react-native-permissions ───────────────────────────────────

export type NotificationPermissionStatus =
    | 'granted'
    | 'denied'     // can still request
    | 'blocked'    // permanently denied — must go to Settings
    | 'unavailable'; // Android < 13: no runtime permission needed

export const getNotificationPermissionStatus =
    async (): Promise<NotificationPermissionStatus> => {
        const { status } = await checkNotifications();
        switch (status) {
            case RESULTS.GRANTED: return 'granted';
            case RESULTS.DENIED: return 'denied';
            case RESULTS.BLOCKED: return 'blocked';
            case RESULTS.UNAVAILABLE: // Android < 13 — no runtime permission needed
            default: return 'unavailable';
        }
    };

// Triggers the native OS permission dialog.
export const requestNotificationPermission = async (): Promise<boolean> => {
    const { status } = await requestNotifications([]);
    return status === RESULTS.GRANTED;
};

// ── "Not Now" preference ──────────────────────────────────────────────────────

export const hasUserDismissedPermissionModal = async (): Promise<boolean> => {
    try {
        const val = await EncryptedStorage.getItem(MODAL_DISMISSED_KEY);
        return val === 'true';
    } catch {
        return false;
    }
};

export const storePermissionModalDismissed = async (): Promise<void> => {
    try {
        await EncryptedStorage.setItem(MODAL_DISMISSED_KEY, 'true');
    } catch (_) { }
};

// ── FCM Token ─────────────────────────────────────────────────────────────────

export const getFCMToken = async (): Promise<string | null> => {
    try {
        const status = await getNotificationPermissionStatus();
        // 'unavailable' means Android < 13 — notifications work without a grant
        if (status !== 'granted' && status !== 'unavailable') return null;
        const token = await getToken(getMessaging());
        return token;
    } catch (e) {
        console.warn('[FCM] getToken failed:', e);
        return null;
    }
};

// ── Internal helpers ──────────────────────────────────────────────────────────
const showOpenedFromAlert = (state: 'Foreground' | 'Background' | 'Quit State') => {
    Alert.alert(
        'Notification Opened',
        `App was opened from ${state}.`,
        [{ text: 'OK' }],
    );
};

const buildNotifeePayload = (
    remoteMessage: FirebaseMessagingTypes.RemoteMessage,
): Parameters<typeof notifee.displayNotification>[0] => ({
    title: remoteMessage.notification?.title ?? 'CardBazar',
    body: remoteMessage.notification?.body ?? '',
    data: (remoteMessage.data ?? {}) as Record<string, string>,
    android: {
        channelId: CHANNEL_ID,
        importance: AndroidImportance.HIGH,
        pressAction: { id: 'default' },
        smallIcon: 'ic_launcher',
    },
});

// ── Display ───────────────────────────────────────────────────────────────────
const displayNotificationFromRemote = async (
    remoteMessage: FirebaseMessagingTypes.RemoteMessage,
): Promise<void> => {
    await createNotificationChannel();
    await notifee.displayNotification(buildNotifeePayload(remoteMessage));
};

// ── Background message handler  (register in index.js) ───────────────────────
export const handleBackgroundMessage = async (
    remoteMessage: FirebaseMessagingTypes.RemoteMessage,
): Promise<void> => {
    await displayNotificationFromRemote(remoteMessage);
};

// ── Notifee background press handler  (register in index.js) ─────────────────
export const onNotifeeBackgroundPress = async (): Promise<void> => {
    try {
        await EncryptedStorage.setItem(BG_PRESS_KEY, 'true');
    } catch (_) { }
};

// ── Topic subscription ────────────────────────────────────────────────────────
export const subscribeToAppTopic = async (): Promise<void> => {
    try {
        await subscribeToTopic(getMessaging(), 'cardbazar-notify');
        console.log('[FCM] Subscribed to topic: cardbazar-notify');
    } catch (e) {
        console.warn('[FCM] Topic subscription failed:', e);
    }
};

// ── Setup foreground handlers  (call inside App useEffect) ───────────────────
export const setupPushNotificationHandlers = (): (() => void) => {
    const unsubFcmForeground = onMessage(getMessaging(), displayNotificationFromRemote);

    const unsubFcmBackgroundOpened = onNotificationOpenedApp(getMessaging(), () => {
        showOpenedFromAlert('Background');
    });

    const unsubNotifeeFg = notifee.onForegroundEvent(({ type }) => {
        if (type === EventType.PRESS) {
            showOpenedFromAlert('Foreground');
        }
    });

    return () => {
        unsubFcmForeground();
        unsubFcmBackgroundOpened();
        unsubNotifeeFg();
    };
};

// ── Initial notification check  (call once on app mount) ─────────────────────
export const checkInitialNotification = async (): Promise<void> => {
    const fcmInitial = await getInitialNotification(getMessaging());
    if (fcmInitial) {
        showOpenedFromAlert('Quit State');
        return;
    }

    const notifeeInitial = await notifee.getInitialNotification();
    if (notifeeInitial) {
        showOpenedFromAlert('Quit State');
        return;
    }

    try {
        const flag = await EncryptedStorage.getItem(BG_PRESS_KEY);
        if (flag) {
            await EncryptedStorage.removeItem(BG_PRESS_KEY);
            showOpenedFromAlert('Background');
        }
    } catch (_) { }
};
