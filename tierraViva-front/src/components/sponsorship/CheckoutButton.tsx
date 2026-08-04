"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { createCheckoutSession } from "@/lib/api";

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

    const handleCheckout = async () => {
        try {
            setLoading(true);
            const data = await createCheckoutSession(tierId, animalId, is_annual);
            if (data.checkout_url) {
                window.location.href = data.checkout_url;
            } else {
                console.error("No checkout URL returned", data);
                alert("Ocurrió un error al obtener la URL de pago.");
            }
        } catch (error) {
            console.error("Error creating checkout session:", error);
            alert("Debes iniciar sesión para poder apadrinar.");
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
