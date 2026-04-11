import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { secureStorage } from "./storage/secureStorage";
import { ILoginResponse } from "../response/module/ILoginResponse";
import { IUserDetailsResponse } from "../response/module/IUserDetailsResponse";

export type IUserSession = ILoginResponse & IUserDetailsResponse;

type UserState = {
    userDetails: IUserSession | null;
    token: string | null;
    isAuthenticated: boolean;
    setUserSession: (user: IUserSession) => void;
    setAuthenticationStatus: (status: boolean) => void;
    setToken: (token: string) => void;
    clearUser: () => void;
    reset: () => void;
};

const initialState = {
    userDetails: null,
    isAuthenticated: false,
    token: null
};

export const useUserStore = create<UserState>()(
    persist(
        (set) => ({
            ...initialState,

            setUserSession: (userDetails) =>
                set({ userDetails }),
            setAuthenticationStatus: (status) =>
                set({ isAuthenticated: status }),
            setToken: (token) => set({ token }),

            clearUser: () =>
                set({ userDetails: null }),
            reset: () => set(initialState),
        }),
        {
            name: "user-secure-store",

            storage: createJSONStorage(() => secureStorage),

            partialize: (state) => ({
                userDetails: state.userDetails,
                isAuthenticated: state.isAuthenticated,
                token:state.token
            }),
        }
    )
);
