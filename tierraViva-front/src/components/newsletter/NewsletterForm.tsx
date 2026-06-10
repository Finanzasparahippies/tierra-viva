"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import api from "@/lib/api";

const NewsletterForm = () => {
    const [email, setEmail] = useState("");
    const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
    const [message, setMessage] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus("loading");
        setMessage("");

        try {
            await api.post("/subscribers/", { email });
            setStatus("success");
            setMessage("¡Gracias por suscribirte!");
            setEmail("");
        } catch (error: any) {
            setStatus("error");
            if (error.response && error.response.status === 400) {
                setMessage("El correo electrónico ya está registrado o es inválido.");
            } else {
                setMessage("Ocurrió un error. Por favor intenta de nuevo.");
            }
        }
    };

    return (
        <div className="max-w-md w-full">
            <h3 className="text-lg font-semibold mb-2 text-foreground">Suscríbete a nuestro boletín</h3>
            <p className="text-muted-foreground text-sm mb-4">
                Recibe noticias sobre nuestros animales y productos.
            </p>
            <form onSubmit={handleSubmit} className="flex gap-2">
                <Input
                    type="email"
                    placeholder="Tu correo electrónico"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="flex-1"
                    disabled={status === "loading" || status === "success"}
                />
                <Button type="submit" disabled={status === "loading" || status === "success"}>
                    {status === "loading" ? "..." : "Suscribirse"}
                </Button>
            </form>
            {message && (
                <p className={`mt-2 text-sm ${status === "success" ? "text-green-600" : "text-red-500"}`}>
                    {message}
                </p>
            )}
        </div>
    );
};

export default NewsletterForm;
