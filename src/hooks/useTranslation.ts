import { useLanguageStore } from '../stores/languageStore';

export const useTranslation = () => {
  const { languages, selectedLanguage } = useLanguageStore();

  const t = (key: string, fallback?: string): string => {
    if (!languages || !languages[key]) return fallback ?? key;
    return languages[key][selectedLanguage] ?? languages[key].english ?? fallback ?? key;
  };

  return { t, selectedLanguage };
};
