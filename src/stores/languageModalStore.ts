import { create } from 'zustand';

type LanguageModalState = {
  isVisible: boolean;
  openModal: () => void;
  closeModal: () => void;
};

export const useLanguageModalStore = create<LanguageModalState>((set) => ({
  isVisible: false,
  openModal: () => set({ isVisible: true }),
  closeModal: () => set({ isVisible: false }),
}));
