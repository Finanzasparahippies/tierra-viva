"use client";

import { useState, useEffect } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { updateMe, getMe } from "@/lib/api";
import { User as UserIcon, Save, CheckCircle2, AlertCircle } from "lucide-react";

export default function SettingsPage() {
    const { user, login } = useAuthStore();
    const [firstName, setFirstName] = useState(user?.first_name || "");
    const [lastName, setLastName] = useState(user?.last_name || "");
    const [email, setEmail] = useState(user?.email || "");
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (user) {
            setFirstName(user.first_name);
            setLastName(user.last_name);
            setEmail(user.email);
        }
    }, [user]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setSuccess(false);
        setError(null);

        try {
            const updatedUser = await updateMe({
                first_name: firstName,
                last_name: lastName,
                email: email,
            });
            
            // Sync with store (token stays the same)
            const authStorage = localStorage.getItem("auth-storage");
            let token = "";
            if (authStorage) {
                const parsed = JSON.parse(authStorage);
                token = parsed.state?.token || "";
            }
            login(updatedUser, token);
            
            setSuccess(true);
            setTimeout(() => setSuccess(false), 3000);
        } catch (err: any) {
            console.error("Update error:", err);
            setError("Error al actualizar el perfil. Por favor intenta de nuevo.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl space-y-8">
            <div>
                <h1 className="text-2xl font-bold flex items-center gap-2">
                    <UserIcon className="h-6 w-6 text-primary" />
                    Configuración de Perfil
                </h1>
                <p className="text-muted-foreground mt-1">
                    Gestiona tu información personal y preferencias de cuenta.
                </p>
            </div>

            <div className="p-6 border rounded-xl bg-card shadow-sm">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Nombre</label>
                            <Input
                                value={firstName}
                                onChange={(e) => setFirstName(e.target.value)}
                                placeholder="Tu nombre"
                                disabled={loading}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Apellido</label>
                            <Input
                                value={lastName}
                                onChange={(e) => setLastName(e.target.value)}
                                placeholder="Tu apellido"
                                disabled={loading}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Correo Electrónico</label>
                        <Input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="tu@email.com"
                            disabled={loading}
                        />
                    </div>

                    {success && (
                        <div className="flex items-center gap-2 p-3 text-sm text-green-600 bg-green-50 border border-green-200 rounded-lg">
                            <CheckCircle2 className="h-4 w-4" />
                            Perfil actualizado exitosamente.
                        </div>
                    )}

                    {error && (
                        <div className="flex items-center gap-2 p-3 text-sm text-destructive bg-destructive/10 rounded-lg">
                            <AlertCircle className="h-4 w-4" />
                            {error}
                        </div>
                    )}

                    <div className="pt-2">
                        <Button type="submit" className="gap-2 px-6" disabled={loading}>
                            {loading ? (
                                "Guardando..."
                            ) : (
                                <>
                                    <Save className="h-4 w-4" />
                                    Guardar Cambios
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </div>

            <div className="p-6 border rounded-xl bg-muted/30">
                <h2 className="font-semibold text-lg text-destructive mb-2">Zona de Peligro</h2>
                <p className="text-sm text-muted-foreground mb-4">
                    Una vez que elimines tu cuenta, no hay vuelta atrás. Por favor ten cuidado.
                </p>
                <Button variant="outline" className="text-destructive border-destructive/20 hover:bg-destructive/10">
                    Desactivar Cuenta
                </Button>
            </div>
        </div>
    );
}
