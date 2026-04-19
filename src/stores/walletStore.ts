import { create } from 'zustand';
import { IUserBalanceResponse } from '../response/module/IUserBalanceResponse';

interface WalletState {
    balance: number;
    pendingWithdrawal: number;
    pendingRequest: number;
    setWallet: (data: IUserBalanceResponse) => void;
    reset: () => void;
}

const initialState = {
    balance: 0,
    pendingWithdrawal: 0,
    pendingRequest: 0,
};

export const useWalletStore = create<WalletState>((set) => ({
    ...initialState,
    setWallet: (data) =>
        set({
            balance: data.BALANCE,
            pendingWithdrawal: data.PENDING_WITHDRAWAL,
            pendingRequest: data.PENDING_REQUEST,
        }),
    reset: () => set(initialState),
}));
