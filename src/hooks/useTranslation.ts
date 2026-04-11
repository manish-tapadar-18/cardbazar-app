import { useLanguageStore } from '../stores/languageStore';

export const useTranslation = () => {
  const { languages, selectedLanguage } = useLanguageStore();

  const t = (key: string): string => {
    if (!languages || !languages[key]) return key;
    return languages[key][selectedLanguage] ?? languages[key].english ?? key;
  };

  return { t, selectedLanguage };
};
