import { create } from 'zustand';

interface DeviceModalState {
    isDeviceBlockVisible: boolean;
    isMultiLoginVisible: boolean;
    openDeviceBlock: () => void;
    closeDeviceBlock: () => void;
    openMultiLogin: () => void;
    closeMultiLogin: () => void;
}

export const useDeviceModalStore = create<DeviceModalState>((set) => ({
    isDeviceBlockVisible: false,
    isMultiLoginVisible: false,
    openDeviceBlock: () => set({ isDeviceBlockVisible: true }),
    closeDeviceBlock: () => set({ isDeviceBlockVisible: false }),
    openMultiLogin: () => set({ isMultiLoginVisible: true }),
    closeMultiLogin: () => set({ isMultiLoginVisible: false }),
}));
