import { create } from "zustand";

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

export const useLanguageStore = create<LanguageState>()((set) => ({
    languages: null,
    selectedLanguage: "english",

    setLanguages: (data) => set({ languages: data }),
    clearLanguages: () => set({ languages: null }),
    setSelectedLanguage: (lang) => set({ selectedLanguage: lang }),
}));
