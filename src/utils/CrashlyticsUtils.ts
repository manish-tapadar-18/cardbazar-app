import crashlytics from '@react-native-firebase/crashlytics';
import { useAdminDetailsStore } from '../stores/adminDetailsStore';

// Named tag constants — import TAGS to prefix every log so Firebase console
// entries are filterable by module (e.g. "[UserService] getUserBalance — start").
export const TAGS = {
    USER_SERVICE: 'UserService',
    HOME: 'Home',
    APP: 'App',
} as const;

export type CrashlyticsTag = (typeof TAGS)[keyof typeof TAGS];

// Builds the metadata prefix attached to every log line.
// Uses Zustand's getState() so it works outside React components.
// Format: [TAG | 2024-01-01T12:00:00.000Z | admin:ADMIN_ID]
const buildPrefix = (tag: string): string => {
    const ts = new Date().toISOString();
    const adminId = useAdminDetailsStore.getState().adminDetails?.ID ?? 'unknown';
    return `[${tag} | ${ts} | admin:${adminId}]`;
};

// Call once at app startup. Programmatically enables collection on top of the
// firebase.json native flag, so collection is guaranteed even if the native
// config is stripped by a build variant.
export const initCrashlytics = async (): Promise<void> => {
    await crashlytics().setCrashlyticsCollectionEnabled(true);
};

// Append a tagged breadcrumb to the log trail visible in the Crashlytics console.
// These logs are sent only when a crash or recorded error follows them.
export const clLog = (tag: string, message: string): void => {
    crashlytics().log(`${buildPrefix(tag)} ${message}`);
};

// Record a non-fatal error. Logs a contextual breadcrumb immediately before
// recording so the trail shows exactly which call site threw.
// Accepts `unknown` so callers can pass raw catch-clause values safely.
export const clRecordError = (
    tag: string,
    error: unknown,
    context?: string,
): void => {
    const err = error instanceof Error ? error : new Error(String(error));
    crashlytics().log(
        `${buildPrefix(tag)}${context ? ` ${context}` : ''} — ${err.message}`,
    );
    crashlytics().recordError(err);
};

// Associate a user identifier with all subsequent crash reports for this session.
export const clSetUser = (userId: string): void => {
    crashlytics().setUserId(userId);
};

// Attach a single custom key-value pair to crash reports.
export const clSetAttribute = (key: string, value: string): void => {
    crashlytics().setAttribute(key, value);
};

// Attach multiple custom key-value pairs to crash reports in one call.
export const clSetAttributes = (attrs: Record<string, string>): void => {
    crashlytics().setAttributes(attrs);
};
