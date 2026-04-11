import { useUserStore } from "./userStore";
import { useSwitchStackStore } from "./switchStackStore";
import { useAdminDetailsStore } from "./adminDetailsStore";

/**
 * Resets all stores to their initial state.
 * Add new stores here as the app grows.
 *
 * Persisted stores: their persisted keys are also updated to initial values.
 * Non-persisted stores: only in-memory state is cleared.
 */
export const clearAllStores = () => {
    useUserStore.getState().reset();
    useSwitchStackStore.getState().reset();
    useAdminDetailsStore.getState().reset();
};
