import * as React from 'react';
import { Platform } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
// import BootSplash from "react-native-bootsplash";
import { ToastProvider } from 'react-native-toast-notifications';
import ToastInitializer from './src/components/ToastInitializer';
import AppNavigator from './src/navigation/AppNavigator';
import SecurityBlockModal from './src/components/SecurityBlockModal';
import JailMonkey from 'jail-monkey';
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

interface SecurityViolation {
    reason: string;
}

// Detects Android emulator via build constants exposed by React Native
const isAndroidEmulator = (): boolean => {
    if (Platform.OS !== 'android') return false;
    const c = Platform.constants as any;
    const fingerprint: string = (c.Fingerprint ?? '').toLowerCase();
    const model: string = (c.Model ?? '').toLowerCase();
    const brand: string = (c.Brand ?? '').toLowerCase();
    const manufacturer: string = (c.Manufacturer ?? '').toLowerCase();
    const product: string = (c.Product ?? '').toLowerCase();
    const hardware: string = (c.Hardware ?? '').toLowerCase();
    return (
        fingerprint.startsWith('generic') ||
        fingerprint.includes('emulator') ||
        fingerprint.includes('unknown') ||
        fingerprint.includes('sdk_gphone') ||
        fingerprint.includes('vbox') ||
        model.includes('emulator') ||
        model.includes('android sdk') ||
        model.includes('sdk_gphone') ||
        brand === 'generic' ||
        product.includes('sdk') ||
        product.includes('emulator') ||
        product.includes('vbox') ||
        hardware.includes('goldfish') ||
        hardware.includes('ranchu') ||
        manufacturer.includes('genymotion')
    );
};

const CHECKS: Array<{
    key: string;
    run: () => boolean | Promise<boolean>;
    reason: string;
    platforms: string[];
}> = [
    {
        key: 'isSimulatorOrEmulator',
        run: () => {
            if (Platform.OS === 'android') return isAndroidEmulator();
            // On iOS: simulators always run __DEV__ builds; release/App Store builds are never simulators
            if (Platform.OS === 'ios') return __DEV__;
            return false;
        },
        reason: Platform.OS === 'ios'
            ? 'iOS Simulator detected. This app cannot run on a simulator. Please test on a real device.'
            : 'Android Emulator detected. This app cannot run on an emulator. Please test on a real device.',
        platforms: ['ios', 'android'],
    },
    {
        key: 'isJailBroken',
        run: () => JailMonkey.isJailBroken(),
        reason: Platform.OS === 'ios'
            ? 'Jailbroken device detected. This app cannot run on jailbroken devices.'
            : 'Rooted device detected. This app cannot run on rooted devices.',
        platforms: ['ios', 'android'],
    },
    {
        key: 'canMockLocation',
        run: () => JailMonkey.canMockLocation(),
        reason: 'Mock/fake location detected. Please disable location spoofing apps.',
        platforms: ['ios', 'android'],
    },
    {
        key: 'isDebuggedMode',
        run: () => JailMonkey.isDebuggedMode(),
        reason: 'Debug mode detected. This app cannot run while being debugged.',
        platforms: ['android'],
    },
    {
        key: 'trustFall',
        run: () => JailMonkey.trustFall(),
        reason: 'Device trust verification failed. Untrusted environment detected.',
        platforms: ['ios', 'android'],
    },
    {
        key: 'isOnExternalStorage',
        run: () => JailMonkey.isOnExternalStorage(),
        reason: 'App is installed on external storage. Please install on internal storage.',
        platforms: ['android'],
    },
    {
        key: 'AdbEnabled',
        run: () => JailMonkey.AdbEnabled(),
        reason: 'ADB (Android Debug Bridge) is enabled. Please disable USB debugging.',
        platforms: ['android'],
    },
    {
        key: 'isDevelopmentSettingsMode',
        run: () => JailMonkey.isDevelopmentSettingsMode(),
        reason: 'Developer options are enabled. Please disable developer settings.',
        platforms: ['android'],
    },
    {
        key: 'hookDetected',
        run: () => JailMonkey.hookDetected(),
        reason: 'Hooking framework detected. This app cannot run in a tampered environment.',
        platforms: ['ios', 'android'],
    },
];

// Module-level flag: persists across Strict Mode double-mounts so the custom
// permission modal is shown at most once per JS bundle lifetime.
let _permissionPromptShown = false;

export default function App() {
    const [violation, setViolation] = React.useState<SecurityViolation | null>(null);
    const [showPermissionModal, setShowPermissionModal] = React.useState(false);

    React.useEffect(() => {
        runSecurityChecks();
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

    const runSecurityChecks = async () => {
        const os = Platform.OS;
        for (const check of CHECKS) {
            if (!check.platforms.includes(os)) continue;
            try {
                const result = await Promise.resolve(check.run());
                if (result) {
                    setViolation({ reason: check.reason });
                    return;
                }
            } catch {
                // skip unavailable checks gracefully
            }
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

            {/* <SecurityBlockModal
                visible={violation !== null}
                reason={violation?.reason ?? ''}
            /> */}

            <PushNotificationPermissionModal
                visible={showPermissionModal}
                onDeny={handlePermissionDeny}
                onAllow={handlePermissionAllow}
            />
        </ToastProvider>
    );
}
