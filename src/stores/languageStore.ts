import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { secureStorage } from "./storage/secureStorage";

export type LanguageEntry = {
    hindi: string;
    urdu: string;
    bengali: string;
    english: string;
};

export type LanguageData = Record<string, LanguageEntry>;

type LanguageState = {
    languages: LanguageData | null;
    selectedLanguage: keyof LanguageEntry;
    setLanguages: (data: LanguageData) => void;
    clearLanguages: () => void;
    setSelectedLanguage: (lang: keyof LanguageEntry) => void;
};

export const useLanguageStore = create<LanguageState>()(
    persist(
        (set) => ({
            languages: null,
            selectedLanguage: "english",

            setLanguages: (data) => set({ languages: data }),
            clearLanguages: () => set({ languages: null }),
            setSelectedLanguage: (lang) => set({ selectedLanguage: lang }),
        }),
        {
            name: "language-store",

            storage: createJSONStorage(() => secureStorage),

            partialize: (state) => ({
                selectedLanguage: state.selectedLanguage,
            }),
        }
    )
);
