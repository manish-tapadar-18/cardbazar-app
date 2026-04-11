import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { secureStorage } from "./storage/secureStorage";
import { IAdminDetailsResponse } from "../response/module/IAdminDetailsResponse";

type AdminDetailsState = {
    adminDetails: IAdminDetailsResponse | null;
    setAdminDetails: (admin: IAdminDetailsResponse) => void;
    clearAdminDetails: () => void;
    reset: () => void;
};

const initialState = {
    adminDetails: null,
};

export const useAdminDetailsStore = create<AdminDetailsState>()(
    persist(
        (set) => ({
            ...initialState,

            setAdminDetails: (adminDetails) =>
                set({ adminDetails }),
            clearAdminDetails: () =>
                set({ adminDetails: null }),
            reset: () => set(initialState),
        }),
        {
            name: "admin-details-secure-store",

            storage: createJSONStorage(() => secureStorage),

            partialize: (state) => ({
                adminDetails: state.adminDetails,
            }),
        }
    )
);
