"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";

function UnsubscribeContent() {
    const searchParams = useSearchParams();
    const token = searchParams.get("token");
    const [status, setStatus] = useState<"loading" | "success" | "already" | "error">("loading");
    const [email, setEmail] = useState("");

    useEffect(() => {
        if (!token) {
            setStatus("error");
            return;
        }

        const doUnsubscribe = async () => {
            try {
                const apiBase = process.env.NEXT_PUBLIC_API_URL
                    ? process.env.NEXT_PUBLIC_API_URL.replace("/api", "")
                    : "";
                const res = await fetch(
                    `${apiBase}/api/newsletter/unsubscribe/${token}/`,
                    { method: "POST" }
                );
                const data = await res.json();

                if (res.ok) {
                    if (data.detail?.includes("Ya te habías")) {
                        setStatus("already");
                    } else {
                        setStatus("success");
                    }
                    setEmail(data.email || "");
                } else {
                    setStatus("error");
                }
            } catch {
                setStatus("error");
            }
        };

        doUnsubscribe();
    }, [token]);

    return (
        <div className="min-h-[60vh] flex items-center justify-center">
            <div className="max-w-md w-full bg-card border rounded-3xl p-10 shadow-sm text-center space-y-6">
                {status === "loading" && (
                    <>
                        <div className="text-5xl animate-pulse">📧</div>
                        <h1 className="text-2xl font-bold">Procesando...</h1>
                        <p className="text-muted-foreground">
                            Estamos cancelando tu suscripción al boletín.
                        </p>
                    </>
                )}

                {status === "success" && (
                    <>
                        <div className="text-5xl">✅</div>
                        <h1 className="text-2xl font-bold text-primary">
                            ¡Listo!
                        </h1>
                        <p className="text-muted-foreground">
                            {email ? (
                                <>
                                    El correo <strong className="text-foreground">{email}</strong> ha sido dado de baja del boletín de Tierra Viva.
                                </>
                            ) : (
                                "Te has dado de baja exitosamente del boletín."
                            )}
                        </p>
                        <p className="text-sm text-muted-foreground">
                            Lamentamos verte partir. Siempre serás bienvenido(a) de regreso. 🌿
                        </p>
                    </>
                )}

                {status === "already" && (
                    <>
                        <div className="text-5xl">ℹ️</div>
                        <h1 className="text-2xl font-bold">Ya estás dado de baja</h1>
                        <p className="text-muted-foreground">
                            {email ? (
                                <>
                                    El correo <strong className="text-foreground">{email}</strong> ya había sido dado de baja anteriormente.
                                </>
                            ) : (
                                "Esta suscripción ya fue cancelada anteriormente."
                            )}
                        </p>
                    </>
                )}

                {status === "error" && (
                    <>
                        <div className="text-5xl">❌</div>
                        <h1 className="text-2xl font-bold text-destructive">
                            Error
                        </h1>
                        <p className="text-muted-foreground">
                            {!token
                                ? "El enlace de desuscripción es inválido. Asegúrate de usar el enlace completo que recibiste en tu correo."
                                : "No pudimos procesar tu solicitud. El enlace puede ser inválido o haber expirado."}
                        </p>
                    </>
                )}

                <div className="pt-4">
                    <a
                        href="/"
                        className="text-primary font-medium hover:underline transition-colors"
                    >
                        ← Volver al inicio
                    </a>
                </div>
            </div>
        </div>
    );
}

export default function UnsubscribePage() {
    return (
        <Suspense
            fallback={
                <div className="min-h-[60vh] flex items-center justify-center">
                    <div className="max-w-md w-full bg-card border rounded-3xl p-10 shadow-sm text-center space-y-6">
                        <div className="text-5xl animate-pulse">📧</div>
                        <h1 className="text-2xl font-bold">Cargando...</h1>
                    </div>
                </div>
            }
        >
            <UnsubscribeContent />
        </Suspense>
    );
}
