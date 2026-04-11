import { create } from 'zustand';

export interface DemoCartItem {
    id: string;
    name: string;
    price: number;
    quantity: number;
    suit: string;
    description: string;
}

interface DemoState {
    isDemoMode: boolean;
    cart: DemoCartItem[];
    address: string;
    setDemoMode: (status: boolean) => void;
    addToCart: (item: Omit<DemoCartItem, 'quantity'>) => void;
    removeFromCart: (id: string) => void;
    updateQuantity: (id: string, qty: number) => void;
    setAddress: (addr: string) => void;
    clearCart: () => void;
    clearDemo: () => void;
}

export const useDemoStore = create<DemoState>((set) => ({
    isDemoMode: false,
    cart: [],
    address: '',

    setDemoMode: (status) => set({ isDemoMode: status }),

    addToCart: (item) =>
        set((state) => {
            const existing = state.cart.find((c) => c.id === item.id);
            if (existing) {
                return {
                    cart: state.cart.map((c) =>
                        c.id === item.id ? { ...c, quantity: c.quantity + 1 } : c,
                    ),
                };
            }
            return { cart: [...state.cart, { ...item, quantity: 1 }] };
        }),

    removeFromCart: (id) =>
        set((state) => ({ cart: state.cart.filter((c) => c.id !== id) })),

    updateQuantity: (id, qty) =>
        set((state) => {
            if (qty <= 0) {
                return { cart: state.cart.filter((c) => c.id !== id) };
            }
            return {
                cart: state.cart.map((c) =>
                    c.id === id ? { ...c, quantity: qty } : c,
                ),
            };
        }),

    setAddress: (address) => set({ address }),

    clearCart: () => set({ cart: [] }),

    clearDemo: () => set({ isDemoMode: false, cart: [], address: '' }),
}));
