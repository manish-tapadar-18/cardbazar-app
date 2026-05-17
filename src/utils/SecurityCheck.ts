import JailMonkey from 'jail-monkey';
import { Platform } from 'react-native';
import { getUniqueId, getModel, getManufacturer, isEmulator } from 'react-native-device-info';
import { http } from './http';
import { UriRepo } from './UriRepo';
import { useUserStore } from '../stores/userStore';

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

type SecurityCheck = {
    key: string;
    run: () => boolean | Promise<boolean>;
    reason: string;
    platforms: string[];
    gate?: () => Promise<boolean>;
};

const CHECKS: SecurityCheck[] = [
    {
        key: 'isSimulatorOrEmulator',
        run: () => {
            if (Platform.OS === 'android') return isAndroidEmulator();
            if (Platform.OS === 'ios') return __DEV__;
            return false;
        },
        reason: Platform.OS === 'ios'
            ? 'iOS Simulator detected. This app cannot run on a simulator. Please test on a real device.'
            : 'Android Emulator detected. This app cannot run on an emulator. Please test on a real device.',
        platforms: ['android'],
    },
    {
        key: 'isJailBroken',
        run: () => JailMonkey.isJailBroken(),
        reason: Platform.OS === 'ios'
            ? 'Jailbroken device detected. This app cannot run on jailbroken devices.'
            : 'Rooted device detected. This app cannot run on rooted devices.',
        platforms: ['android'],
    },
    {
        key: 'canMockLocation',
        run: () => JailMonkey.canMockLocation(),
        reason: 'Mock/fake location detected. Please disable location spoofing apps.',
        platforms: ['android'],
        gate: async () => {
            try {
                const res = await http.get<any>(UriRepo.SECURITYLOCATION);
                return res?.data?.data?.VALUE == 1;
            } catch {
                return false;
            }
        },
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
        platforms: ['android'],
        gate: async () => {
            try {
                const res = await http.get<any>(UriRepo.SECURITYDEBUG);
                return res?.data?.data?.VALUE == 1;
            } catch {
                return false;
            }
        },
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
        platforms: ['android'],
    },
];

const reportSecurityViolation = async (reason: string): Promise<void> => {
    try {
        const userDetails = useUserStore.getState().userDetails;
        const phoneNo = (userDetails as any)?.MOBILE || '0000000000';

        let deviceId = '';
        let modelNumber = '';
        let manufactured = '';
        let emulator: boolean | string = '';

        try { deviceId = (await getUniqueId()) ?? ''; } catch { }
        try { modelNumber = getModel() ?? ''; } catch { }
        try { manufactured = (await getManufacturer()) ?? ''; } catch { }
        try { emulator = (await isEmulator()) ?? ''; } catch { }

        await http.post(
            UriRepo.ADDSECURITYERRORREPORT,
            {
                PHONE_NO: phoneNo,
                ERROR_REASON: {
                    type: reason,
                    deviceid: deviceId,
                    model_number: modelNumber,
                    manufactured,
                    isEmulator: emulator,
                },
            },
            { requireAuth: false }
        );
    } catch { }
};

export type SecurityCheckResult = {
    violated: boolean;
    reasons: string[];
};

export const runSecurityChecks = async (): Promise<SecurityCheckResult> => {
    const os = Platform.OS;
    const reasons: string[] = [];

    for (const check of CHECKS) {
        if (!check.platforms.includes(os)) continue;

        if (check.gate) {
            try {
                const shouldRun = await check.gate();
                if (!shouldRun) continue;
            } catch {
                continue;
            }
        }

        try {
            const violated = await Promise.resolve(check.run());
            if (violated) {
                reasons.push(check.reason);
                await reportSecurityViolation(check.reason);
            }
        } catch { }
    }

    return { violated: reasons.length > 0, reasons };
};
