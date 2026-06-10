
"use client";

import Link from "next/link";
import { Trash2, Plus, Minus } from "lucide-react";
import { useCartStore } from "@/store/useCartStore";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { createOrder, createOrderCheckoutSession } from "@/lib/api";

export default function CartPage() {
    const { items, removeItem, updateQuantity, total, clearCart } = useCartStore();
    const { isAuthenticated } = useAuthStore();
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleCheckout = async () => {
        setError(null);
        if (!isAuthenticated) {
            router.push("/login?redirect=/shop/cart");
            return;
        }

        setIsLoading(true);
        try {
            // 1. Create the order
            const orderData = {
                items: items.map(item => ({
                    product_id: item.id,
                    quantity: item.quantity,
                    price: item.price
                }))
            };

            const order = await createOrder(orderData);

            // 2. Create the Stripe checkout session with explicit order_id in success URL
            const { checkout_url } = await createOrderCheckoutSession(order.id);

            // 3. Redirect to Stripe
            window.location.href = checkout_url;
        } catch (error: any) {
            console.error("Checkout error:", error);
            setError(error.response?.data?.error || "Error al procesar el pago. Por favor intentalo de nuevo.");
        } finally {
            setIsLoading(false);
        }
    };

    if (items.length === 0) {
        return (
            <div className="text-center py-20 space-y-4">
                <h1 className="text-2xl font-bold">Tu carrito está vacío</h1>
                <p className="text-muted-foreground">¡Agrega algunos productos para apoyar nuestra causa!</p>
                <Link href="/shop">
                    <Button variant="outline">Volver a la tienda</Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto py-8">
            <h1 className="text-2xl font-bold mb-8">Carrito de Compras</h1>
            <div className="grid md:grid-cols-3 gap-8">
                <div className="md:col-span-2 space-y-4">
                    {items.map((item) => (
                        <div key={item.id} className="flex gap-4 border p-4 rounded-lg items-center">
                            <div className="w-20 h-20 bg-muted rounded overflow-hidden flex-shrink-0">
                                {item.image_url ? (
                                    <img src={item.image_url} alt={item.name} className="object-cover w-full h-full" />
                                ) : (
                                    <div className="flex items-center justify-center h-full text-muted-foreground bg-secondary/30">
                                        📷
                                    </div>
                                )}
                            </div>
                            <div className="flex-1">
                                <h3 className="font-medium text-lg">{item.name}</h3>
                                <p className="text-primary font-bold">
                                    {formatCurrency(item.price)}
                                    {item.unit && item.unit !== "PIECE" && (
                                        <span className="text-[10px] text-muted-foreground uppercase ml-2">
                                            / {item.unit_amount} {item.unit.toLowerCase()}
                                        </span>
                                    )}
                                </p>
                            </div>
                            <div className="flex items-center gap-2">
                                <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}>
                                    <Minus className="h-3 w-3" />
                                </Button>
                                <span className="w-8 text-center">{item.quantity}</span>
                                <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => updateQuantity(item.id, item.quantity + 1)}>
                                    <Plus className="h-3 w-3" />
                                </Button>
                            </div>
                            <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10" onClick={() => removeItem(item.id)}>
                                <Trash2 className="h-5 w-5" />
                            </Button>
                        </div>
                    ))}
                </div>
                <div className="bg-muted/30 p-6 rounded-lg h-fit space-y-4">
                    <h2 className="text-xl font-bold">Resumen</h2>

                    {error && (
                        <div className="p-3 text-xs text-destructive bg-destructive/10 rounded-lg">
                            {error}
                        </div>
                    )}

                    <div className="flex justify-between text-lg">
                        <span>Total</span>
                        <span className="font-bold">{formatCurrency(total())}</span>
                    </div>
                    <Button
                        className="w-full"
                        size="lg"
                        onClick={handleCheckout}
                        disabled={isLoading}
                    >
                        {isLoading ? "Procesando..." : "Proceder al Pago"}
                    </Button>
                </div>
            </div>
        </div>
    );
}
