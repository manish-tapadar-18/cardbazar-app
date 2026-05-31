/**
 * @format
 */

import { AppRegistry, LogBox } from 'react-native';
import App from './App';
import { name as appName } from './app.json';
import { getMessaging, setBackgroundMessageHandler } from '@react-native-firebase/messaging';
import notifee, { EventType } from '@notifee/react-native';
import {
    handleBackgroundMessage,
    onNotifeeBackgroundPress,
} from './src/utils/PushNotificationUtils';

// Handles FCM messages when the app is in background or quit state.
// Displays the notification via notifee so we have full control over the UI.
setBackgroundMessageHandler(getMessaging(), handleBackgroundMessage);

// Handles notifee events (press, dismiss, actions) when app is in background.
// On PRESS we persist a flag so App.tsx can show the correct "opened from
// Background" alert when the app comes to the foreground.
notifee.onBackgroundEvent(async ({ type, detail }) => {
    if (type === EventType.PRESS) {
        await onNotifeeBackgroundPress(detail.notification?.data);
    }
});
// LogBox.ignoreLogs()
AppRegistry.registerComponent(appName, () => App);
