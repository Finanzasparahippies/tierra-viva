import { create } from "zustand";
import { persist } from "zustand/middleware";
import { CartItem, Product } from "@/lib/types";
import { useAuthStore } from "./useAuthStore";
import { apiAddToCart, apiRemoveFromCart, apiClearCart, apiGetCart } from "@/lib/api";

interface CartState {
    items: CartItem[];
    addItem: (product: Product) => Promise<void>;
    removeItem: (productId: number) => Promise<void>;
    updateQuantity: (productId: number, quantity: number) => Promise<void>;
    clearCart: () => Promise<void>;
    fetchCart: () => Promise<void>;
    total: () => number;
}

export const useCartStore = create<CartState>()(
    persist(
        (set, get) => ({
            items: [],
            fetchCart: async () => {
                const { isAuthenticated } = useAuthStore.getState();
                if (!isAuthenticated) return;
                try {
                    const data = await apiGetCart();
                    // Map backend CartItem to frontend Type
                    const items = data.items.map((item: any) => ({
                        ...item.product,
                        quantity: item.quantity
                    }));
                    set({ items });
                } catch (error: any) {
                    if (error.response?.status === 401) {
                        useAuthStore.getState().logout();
                    }
                    console.error("Error fetching cart:", error);
                }
            },
            addItem: async (product) => {
                const { isAuthenticated } = useAuthStore.getState();
                const items = get().items;
                const existingItem = items.find((item) => item.id === product.id);
                
                let newItems;
                if (existingItem) {
                    newItems = items.map((item) =>
                        item.id === product.id
                            ? { ...item, quantity: item.quantity + 1 }
                            : item
                    );
                } else {
                    newItems = [...items, { ...product, quantity: 1 }];
                }
                
                set({ items: newItems });

                if (isAuthenticated) {
                    try {
                        await apiAddToCart(product.id, 1);
                    } catch (error) {
                        console.error("Error syncing addItem to backend:", error);
                    }
                }
            },
            removeItem: async (productId) => {
                const { isAuthenticated } = useAuthStore.getState();
                set({ items: get().items.filter((item) => item.id !== productId) });
                
                if (isAuthenticated) {
                    try {
                        await apiRemoveFromCart(productId);
                    } catch (error) {
                        console.error("Error syncing removeItem to backend:", error);
                    }
                }
            },
            updateQuantity: async (productId, quantity) => {
                const { isAuthenticated } = useAuthStore.getState();
                const currentQuantity = get().items.find(i => i.id === productId)?.quantity || 0;
                const diff = quantity - currentQuantity;

                set({
                    items: get().items.map((item) =>
                        item.id === productId ? { ...item, quantity } : item
                    ),
                });

                if (isAuthenticated && diff !== 0) {
                    try {
                        await apiAddToCart(productId, diff);
                    } catch (error) {
                        console.error("Error syncing updateQuantity to backend:", error);
                    }
                }
            },
            clearCart: async () => {
                const { isAuthenticated } = useAuthStore.getState();
                set({ items: [] });
                if (isAuthenticated) {
                    try {
                        await apiClearCart();
                    } catch (error) {
                        console.error("Error syncing clearCart to backend:", error);
                    }
                }
            },
            total: () => {
                return get().items.reduce(
                    (acc, item) => acc + item.price * item.quantity,
                    0
                );
            },
        }),
        {
            name: "cart-storage",
        }
    )
);
