import {
    getMessaging,
    getToken,
    subscribeToTopic,
    onMessage,
    onNotificationOpenedApp,
    getInitialNotification,
    FirebaseMessagingTypes,
} from '@react-native-firebase/messaging';
import notifee, { AndroidImportance, AndroidStyle, EventType } from '@notifee/react-native';
import { Alert, NativeModules, Platform } from 'react-native';
import EncryptedStorage from 'react-native-encrypted-storage';
import { checkNotifications, requestNotifications, RESULTS } from 'react-native-permissions';
import { Colors } from './Colors';

const CHANNEL_ID = 'cardbazar_default';

// Typed accessor for the native image compositor
const NotificationImageModule = NativeModules.NotificationImageModule as
    | { prepareNotificationImage: (url: string) => Promise<string> }
    | undefined;

// Downloads `url`, paints it contain-scaled + centered on a #44004F landscape
// canvas, saves to cache, and returns the file:// path. Falls back to the
// original URL on any error so a notification is still shown.
const prepareCardImage = async (url: string): Promise<string> => {
    try {
        return await NotificationImageModule!.prepareNotificationImage(url);
    } catch {
        return url;
    }
};
const BG_PRESS_KEY = '_pn_bg_press';
const BG_PRESS_CATEGORY_KEY = '_pn_bg_category';
const BG_PRESS_CARD_IMAGE_KEY = '_pn_bg_card_image';
const MODAL_DISMISSED_KEY = '_pn_modal_dismissed';

export type OnCategoryIdCallback = (categoryId: string, cardImage?: string) => void;

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
    | 'denied'
    | 'blocked'
    | 'unavailable';

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
        console.log({ token });
        return token;
    } catch (e) {
        console.warn('[FCM] getToken failed:', e);
        return null;
    }
};

// ── Internal helpers ──────────────────────────────────────────────────────────
const logNotification = (
    state: 'Foreground' | 'Background' | 'Quit State',
    remoteMessage: FirebaseMessagingTypes.RemoteMessage,
): void => {
    console.log(`[FCM] Notification received — state: ${state}`);
    console.log('[FCM] messageId     :', remoteMessage.messageId);
    console.log('[FCM] from          :', remoteMessage.from);
    console.log('[FCM] sentTime      :', remoteMessage.sentTime);
    console.log('[FCM] notification  :', JSON.stringify(remoteMessage.notification, null, 2));
    console.log('[FCM] data          :', JSON.stringify(remoteMessage.data, null, 2));
};

const fireCategoryId = (
    data: Record<string, any> | undefined,
    onCategoryId: OnCategoryIdCallback,
): boolean => {
    const id = data?.categoryId;
    if (typeof id === 'string' && id.length > 0) {
        const cardImage = typeof data?.cardImage === 'string' && data.cardImage.length > 0
            ? data.cardImage as string
            : undefined;
        onCategoryId(id, cardImage);
        return true;
    }
    return false;
};

const showOpenedFromAlert = (state: 'Foreground' | 'Background' | 'Quit State') => {
    Alert.alert(
        'Notification Opened',
        `App was opened from ${state}.`,
        [{ text: 'OK' }],
    );
};

const buildNotifeePayload = async (
    remoteMessage: FirebaseMessagingTypes.RemoteMessage,
): Promise<Parameters<typeof notifee.displayNotification>[0]> => {
    const rawCardImage = remoteMessage.data?.cardImage as string | undefined;
    const cardImage = rawCardImage ? await prepareCardImage(rawCardImage) : undefined;
    return {
        title: remoteMessage.notification?.title ?? 'CardBazar',
        body: remoteMessage.notification?.body ?? '',
        data: (remoteMessage.data ?? {}) as Record<string, string>,
        android: {
            channelId: CHANNEL_ID,
            importance: AndroidImportance.HIGH,
            pressAction: { id: 'default' },
            smallIcon: 'ic_launcher',
            ...(cardImage && {
                largeIcon: cardImage,
                color: Colors.PRIMARY_BG,
                style: {
                    type: AndroidStyle.BIGPICTURE,
                    picture: cardImage,
                },
            }),
        },
    };
};

// ── Display ───────────────────────────────────────────────────────────────────
const displayNotificationFromRemote = async (
    remoteMessage: FirebaseMessagingTypes.RemoteMessage,
): Promise<void> => {
    await createNotificationChannel();
    await notifee.displayNotification(await buildNotifeePayload(remoteMessage));
};

// ── Background message handler  (register in index.js) ───────────────────────
//
// Duplicate-notification guard
// ─────────────────────────────
// FCM has two display paths on Android when the app is in the background:
//
//   1. Notification-type messages  (payload has a `notification` key)
//      → The FCM SDK **automatically** renders the notification in the system
//        tray without involving JS at all.
//      → setBackgroundMessageHandler ALSO fires, reaching this handler.
//      → Calling notifee.displayNotification here would produce a SECOND,
//        identical notification — the duplicate the user sees.
//      → IMPORTANT: AndroidManifest.xml must declare
//          <meta-data
//              android:name="com.google.firebase.messaging.default_notification_channel_id"
//              android:value="cardbazar_default" />
//        Without this, FCM auto-displays on the silent system default channel
//        (low importance, no custom sound) — topic notifications appear to
//        "not arrive" even though they do. The meta-data entry routes all
//        FCM auto-displayed notifications to our custom high-importance channel.
//
//   2. Data-only messages  (payload has ONLY a `data` key, no `notification`)
//      → The FCM SDK does NOT auto-display anything.
//      → setBackgroundMessageHandler fires and this handler is the ONLY
//        display path, so we must call notifee.
//
// Rule: bail out early when `remoteMessage.notification` is present — FCM has
// already handled display on our channel (via the manifest meta-data).
// Only call notifee for data-only messages to avoid duplicates.
export const handleBackgroundMessage = async (
    remoteMessage: FirebaseMessagingTypes.RemoteMessage,
): Promise<void> => {
    logNotification('Background', remoteMessage);
    const hasCardImage = !!remoteMessage.data?.cardImage;
    if (remoteMessage.notification && !hasCardImage) {
        // FCM auto-displayed this on cardbazar_default channel (see manifest meta-data).
        // Do nothing — calling notifee here would create a duplicate notification.
        return;
    }
    // Data-only message, OR a notification-type message that carries cardImage.
    // When cardImage is present we must use notifee so the image and #44004F background
    // are shown. To avoid a duplicate the server should send data-only messages
    // (no `notification` key) whenever cardImage is included in the payload.
    await displayNotificationFromRemote(remoteMessage);
};

// ── Notifee background press handler  (register in index.js) ─────────────────
export const onNotifeeBackgroundPress = async (
    notificationData?: Record<string, string>,
): Promise<void> => {
    try {
        await EncryptedStorage.setItem(BG_PRESS_KEY, 'true');
        if (notificationData?.categoryId) {
            await EncryptedStorage.setItem(BG_PRESS_CATEGORY_KEY, notificationData.categoryId);
        }
        if (notificationData?.cardImage) {
            await EncryptedStorage.setItem(BG_PRESS_CARD_IMAGE_KEY, notificationData.cardImage);
        }
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
export const setupPushNotificationHandlers = (
    onCategoryId: OnCategoryIdCallback,
): (() => void) => {
    // Foreground: notification arrives while app is open → display + open modal if categoryId present
    const unsubFcmForeground = onMessage(getMessaging(), (remoteMessage) => {
        logNotification('Foreground', remoteMessage);
        fireCategoryId(remoteMessage.data, onCategoryId);
        return displayNotificationFromRemote(remoteMessage);
    });

    // Background: user taps an FCM auto-displayed notification → open modal if categoryId present
    const unsubFcmBackgroundOpened = onNotificationOpenedApp(getMessaging(), (remoteMessage) => {
        if (!fireCategoryId(remoteMessage.data, onCategoryId)) {
            showOpenedFromAlert('Background');
        }
    });

    // Foreground press on a notifee heads-up notification → open modal if categoryId present
    const unsubNotifeeFg = notifee.onForegroundEvent(({ type, detail }) => {
        if (type === EventType.PRESS) {
            const data = detail.notification?.data as Record<string, string> | undefined;
            if (!fireCategoryId(data, onCategoryId)) {
                showOpenedFromAlert('Foreground');
            }
        }
    });

    return () => {
        unsubFcmForeground();
        unsubFcmBackgroundOpened();
        unsubNotifeeFg();
    };
};

// ── Initial notification check  (call once on app mount) ─────────────────────
export const checkInitialNotification = async (
    onCategoryId: OnCategoryIdCallback,
): Promise<void> => {
    // Quit state — app launched by tapping an FCM notification
    const fcmInitial = await getInitialNotification(getMessaging());
    if (fcmInitial) {
        logNotification('Quit State', fcmInitial);
        if (!fireCategoryId(fcmInitial.data, onCategoryId)) {
            showOpenedFromAlert('Quit State');
        }
        return;
    }

    // Quit state — app launched by tapping a notifee-displayed notification
    const notifeeInitial = await notifee.getInitialNotification();
    if (notifeeInitial) {
        const data = notifeeInitial.notification.data as Record<string, string> | undefined;
        if (!fireCategoryId(data, onCategoryId)) {
            showOpenedFromAlert('Quit State');
        }
        return;
    }

    // Background press — categoryId was persisted by onNotifeeBackgroundPress
    try {
        const flag = await EncryptedStorage.getItem(BG_PRESS_KEY);
        if (flag) {
            await EncryptedStorage.removeItem(BG_PRESS_KEY);
            const categoryId = await EncryptedStorage.getItem(BG_PRESS_CATEGORY_KEY);
            if (categoryId) {
                await EncryptedStorage.removeItem(BG_PRESS_CATEGORY_KEY);
                const cardImage = await EncryptedStorage.getItem(BG_PRESS_CARD_IMAGE_KEY);
                if (cardImage) await EncryptedStorage.removeItem(BG_PRESS_CARD_IMAGE_KEY);
                onCategoryId(categoryId, cardImage ?? undefined);
            } else {
                showOpenedFromAlert('Background');
            }
        }
    } catch (_) { }
};
