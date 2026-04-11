import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { secureStorage } from "./storage/secureStorage";

type SwitchStackState = {
  isAuth: boolean;
  splashLoading: boolean;
  switchFalseStatus: boolean;

  setAuthStatus: (value: boolean) => void;
  setSplashLoading: (value: boolean) => void;
  setSwitchFalseStatus: (value: boolean) => void;
  reset: () => void;
};

const initialState = {
  isAuth: false,
  splashLoading: true,
  switchFalseStatus: false,
};

export const useSwitchStackStore = create<SwitchStackState>()(
  persist(
    (set) => ({
      ...initialState,

      setAuthStatus: (isAuth) =>
        set({ isAuth }),

      setSplashLoading: (splashLoading) =>
        set({ splashLoading }),

      setSwitchFalseStatus: (switchFalseStatus) =>
        set({ switchFalseStatus }),

      reset: () => set(initialState),
    }),
    {
      name: "switch-stack-store",

      storage: createJSONStorage(() => secureStorage),

      // Persist ONLY isAuth
      partialize: (state) => ({
        isAuth: state.isAuth,
      }),
    }
  )
);
