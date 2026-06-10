"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { apiConfirmOrder } from "@/lib/api";
import { useCartStore } from "@/store/useCartStore";

function SuccessContent() {
    const searchParams = useSearchParams();
    const orderId = searchParams.get("order_id");
    const fetchCart = useCartStore((state) => state.fetchCart);
    const [isConfirming, setIsConfirming] = useState(!!orderId);

    useEffect(() => {
        const confirmOrder = async () => {
            if (orderId) {
                try {
                    await apiConfirmOrder(parseInt(orderId));
                    // Refresh cart to show it's now empty
                    await fetchCart();
                } catch (error) {
                    console.error("Error confirming order:", error);
                } finally {
                    setIsConfirming(false);
                }
            }
        };

        confirmOrder();
    }, [orderId, fetchCart]);

    return (
        <div className="flex flex-col items-center justify-center min-h-[70vh] text-center space-y-6 bg-white/50 backdrop-blur-sm rounded-2xl p-8 max-w-2xl mx-auto shadow-sm border mt-10 relative z-10">
            <div className="w-24 h-24 bg-primary/20 text-primary rounded-full flex items-center justify-center text-5xl mb-4 shadow-inner">
                {isConfirming ? "..." : "✓"}
            </div>
            <h1 className="text-4xl font-bold text-primary drop-shadow-sm">
                {isConfirming ? "Confirmando pedido..." : "¡Gracias por tu apoyo!"}
            </h1>
            <p className="text-lg text-muted-foreground max-w-md">
                {isConfirming 
                    ? "Estamos procesando los detalles finales de tu compra..." 
                    : "Tu pago se ha procesado exitosamente mediante Stripe. Gracias por unirte a la familia de Tierra Viva y hacer una diferencia asombrosa para nuestros rescatados."}
            </p>
            {!isConfirming && (
                <Link href="/animals">
                    <Button size="lg" className="mt-6 rounded-full font-bold shadow-sm hover:shadow-md transition-all active:scale-95">
                        Volver a los Animales
                    </Button>
                </Link>
            )}
        </div>
    );
}

export default function SuccessPage() {
    return (
        <Suspense fallback={
            <div className="flex items-center justify-center min-h-[70vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        }>
            <SuccessContent />
        </Suspense>
    );
}
