import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
// import BootSplash from "react-native-bootsplash";
import { ToastProvider } from 'react-native-toast-notifications';
import ToastInitializer from './src/components/ToastInitializer';
import AppNavigator from './src/navigation/AppNavigator';
import SecurityBlockModal from './src/components/SecurityBlockModal';
import PushNotificationPermissionModal from './src/components/PushNotificationPermissionModal';
import {
    checkInitialNotification,
    createNotificationChannel,
    getFCMToken,
    getNotificationPermissionStatus,
    hasUserDismissedPermissionModal,
    requestNotificationPermission,
    setupPushNotificationHandlers,
    storePermissionModalDismissed,
    subscribeToAppTopic,
} from './src/utils/PushNotificationUtils';
import { initCrashlytics } from './src/utils/CrashlyticsUtils';
import { runSecurityChecks } from './src/utils/SecurityCheck';
import { AppState } from 'react-native';

// Module-level flag: persists across Strict Mode double-mounts so the custom
// permission modal is shown at most once per JS bundle lifetime.
let _permissionPromptShown = false;

export default function App() {
    const [violationReasons, setViolationReasons] = React.useState<string[]>([]);
    const [showPermissionModal, setShowPermissionModal] = React.useState(false);

    React.useEffect(() => {
        initCrashlytics();
    }, []);


    const checkSecurity = async () => {
        runSecurityChecks().then(({ violated, reasons }) => {
            if (violated) setViolationReasons(reasons);
        });
    };

    React.useEffect(() => {
        checkSecurity();
        const subscription = AppState.addEventListener('change', nextState => {
            if (nextState === 'active') {
                checkSecurity();
            }
        });
        return () => subscription.remove();
    }, []);

    React.useEffect(() => {
        createNotificationChannel();
        initPushNotifications();
        const cleanupHandlers = setupPushNotificationHandlers();
        return cleanupHandlers;
    }, []);

    const initPushNotifications = async () => {
        const status = await getNotificationPermissionStatus();

        if (status === 'granted' || status === 'unavailable') {
            // Already granted, or Android < 13 where no runtime permission is needed
            const token = await getFCMToken();
            if (token) console.log('[FCM] Token:', token);
            await subscribeToAppTopic();
        } else if (status === 'denied') {
            // Can still ask — but only if user hasn't previously pressed "Not Now"
            const dismissed = await hasUserDismissedPermissionModal();
            if (!dismissed && !_permissionPromptShown) {
                _permissionPromptShown = true;
                setTimeout(() => setShowPermissionModal(true), 1200);
            }
        }
        // status === 'blocked': permanently denied, nothing we can do without Settings

        await checkInitialNotification();
    };

    const handlePermissionDeny = async () => {
        setShowPermissionModal(false);
        // Persist so the modal never appears again on future app opens
        await storePermissionModalDismissed();
    };

    const handlePermissionAllow = async () => {
        setShowPermissionModal(false);
        // Trigger the native OS permission dialog
        const granted = await requestNotificationPermission();
        if (granted) {
            const token = await getFCMToken();
            if (token) console.log('[FCM] Token:', token);
            await subscribeToAppTopic();
        }
    };

    return (
        <ToastProvider
            placement="top"
            duration={3000}
            animationType="slide-in"
        >
            <ToastInitializer />
            <NavigationContainer
            // onReady={async () => await BootSplash.hide({ fade: true })}
            >
                <AppNavigator />
            </NavigationContainer>

            <SecurityBlockModal
                visible={violationReasons.length > 0}
                reasons={violationReasons}
            />

            <PushNotificationPermissionModal
                visible={showPermissionModal}
                onDeny={handlePermissionDeny}
                onAllow={handlePermissionAllow}
            />
        </ToastProvider>
    );
}
