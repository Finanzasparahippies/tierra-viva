"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { createCheckoutSession } from "@/lib/api";
import { useAuthStore } from "@/store/useAuthStore";
import { useToast } from "@/components/ui/Toast";

interface CheckoutButtonProps {
    animalId?: number;
    tierId?: number;
    is_annual?: boolean;
    disabled?: boolean;
    label?: string;
    className?: string;
}

export default function CheckoutButton({ 
    animalId, 
    tierId = 1, 
    is_annual = false,
    disabled, 
    label = "Apadrinar ❤️",
    className = ""
}: CheckoutButtonProps) {
    const [loading, setLoading] = useState(false);
    const { isAuthenticated, token } = useAuthStore();
    const { error: toastError, warning: toastWarning } = useToast();

    const handleCheckout = async () => {
        if (!isAuthenticated || !token) {
            toastWarning("Sesión requerida", "Por favor inicia sesión para apadrinar a un animal.");
            return;
        }

        try {
            setLoading(true);
            const data = await createCheckoutSession(tierId, animalId, is_annual);
            if (data?.checkout_url) {
                window.location.href = data.checkout_url;
            } else {
                toastError("Error de pago", "Ocurrió un inconveniente al generar la sesión con Stripe.");
            }
        } catch (error: any) {
            const status = error?.response?.status;
            if (status === 401) {
                toastWarning("Sesión expirada", "Tu sesión ha caducado. Inicia sesión nuevamente.");
            } else {
                const msg = error?.response?.data?.error || "Error al procesar la solicitud de pago.";
                toastError("Error de Pasarela", msg);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <Button
            onClick={handleCheckout}
            disabled={disabled || loading}
            className={`rounded-full shadow-sm hover:shadow transition-all ${className} ${disabled ? "opacity-50" : "bg-primary hover:bg-primary/90 text-primary-foreground"}`}
        >
            {loading ? "Procesando..." : label}
        </Button>
    );
}
