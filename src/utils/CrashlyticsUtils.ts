import {
    getCrashlytics,
    log,
    recordError,
    setCrashlyticsCollectionEnabled,
    setUserId,
    setAttribute,
    setAttributes,
} from '@react-native-firebase/crashlytics';
import { useAdminDetailsStore } from '../stores/adminDetailsStore';

export const TAGS = {
    USER_SERVICE: 'UserService',
    HOME: 'Home',
    APP: 'App',
} as const;

export type CrashlyticsTag = (typeof TAGS)[keyof typeof TAGS];

const buildPrefix = (tag: string): string => {
    const ts = new Date().toISOString();
    const adminId = useAdminDetailsStore.getState().adminDetails?.ID ?? 'unknown';
    return `[${tag} | ${ts} | admin:${adminId}]`;
};

export const initCrashlytics = async (): Promise<void> => {
    await setCrashlyticsCollectionEnabled(getCrashlytics(), true);
};

export const clLog = (tag: string, message: string): void => {
    log(getCrashlytics(), `${buildPrefix(tag)} ${message}`);
};

export const clRecordError = (
    tag: string,
    error: unknown,
    context?: string,
): void => {
    const err = error instanceof Error ? error : new Error(String(error));
    const cl = getCrashlytics();
    log(cl, `${buildPrefix(tag)}${context ? ` ${context}` : ''} — ${err.message}`);
    recordError(cl, err);
};

export const clSetUser = (userId: string): void => {
    setUserId(getCrashlytics(), userId);
};

export const clSetAttribute = (key: string, value: string): void => {
    setAttribute(getCrashlytics(), key, value);
};

export const clSetAttributes = (attrs: Record<string, string>): void => {
    setAttributes(getCrashlytics(), attrs);
};
