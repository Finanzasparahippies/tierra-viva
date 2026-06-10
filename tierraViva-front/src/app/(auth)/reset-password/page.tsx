"use client";

import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Lock, Eye, EyeOff, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { confirmPasswordReset } from "@/lib/api";

function ResetPasswordForm() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const uidb64 = searchParams.get("uidb64");
    const token = searchParams.get("token");

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!uidb64 || !token) {
            setError("Enlace de recuperación inválido.");
            return;
        }

        if (password !== confirmPassword) {
            setError("Las contraseñas no coinciden.");
            return;
        }

        if (password.length < 8) {
            setError("La contraseña debe tener al menos 8 caracteres.");
            return;
        }

        setLoading(true);
        setError(null);
        try {
            await confirmPasswordReset({ uidb64, token, new_password: password });
            setSuccess(true);
            setTimeout(() => {
                router.push("/login");
            }, 3000);
        } catch (err: any) {
            console.error("Reset password error:", err);
            setError(err.response?.data?.detail || "Ocurrió un error al restablecer tu contraseña. El enlace puede haber expirado.");
        } finally {
            setLoading(false);
        }
    };

    if (!uidb64 || !token) {
        return (
            <div className="text-center space-y-6">
                <div className="flex justify-center">
                    <div className="w-20 h-20 bg-destructive/10 rounded-full flex items-center justify-center text-destructive">
                        <AlertCircle size={40} />
                    </div>
                </div>
                <h1 className="text-2xl font-bold">Enlace inválido</h1>
                <p className="text-muted-foreground">Este enlace de recuperación no es válido o ha expirado.</p>
                <Button asChild className="w-full h-14 rounded-2xl">
                    <Link href="/forgot-password">Solicitar nuevo enlace</Link>
                </Button>
            </div>
        );
    }

    if (success) {
        return (
            <div className="text-center space-y-6">
                <div className="flex justify-center">
                    <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center text-green-500 animate-bounce">
                        <CheckCircle2 size={40} />
                    </div>
                </div>
                <h1 className="text-2xl font-bold font-black">¡Todo listo!</h1>
                <p className="text-muted-foreground">Tu contraseña ha sido actualizada correctamente.</p>
                <p className="text-xs text-muted-foreground animate-pulse">Redirigiendo al inicio de sesión...</p>
                <Button asChild className="w-full h-14 rounded-2xl font-bold">
                    <Link href="/login">Ir al login ahora</Link>
                </Button>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="text-center space-y-2">
                <h1 className="text-3xl font-black tracking-tight">Nueva Contraseña</h1>
                <p className="text-muted-foreground text-sm">Ingresa tu nueva contraseña para acceder a tu cuenta.</p>
            </div>

            {error && (
                <div className="p-4 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-2xl animate-in shake-in duration-300">
                    {error}
                </div>
            )}

            <div className="space-y-4">
                <div className="space-y-2">
                    <label className="text-sm font-bold uppercase tracking-widest text-muted-foreground ml-1">Nueva Contraseña</label>
                    <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                        <Input
                            type={showPassword ? "text" : "password"}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            placeholder="••••••••"
                            disabled={loading}
                            className="pl-12 pr-12 h-14 rounded-2xl bg-muted/30 border-border/50 focus:bg-background transition-all"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
                        >
                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-bold uppercase tracking-widest text-muted-foreground ml-1">Confirmar Contraseña</label>
                    <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                        <Input
                            type={showPassword ? "text" : "password"}
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                            placeholder="••••••••"
                            disabled={loading}
                            className="pl-12 pr-12 h-14 rounded-2xl bg-muted/30 border-border/50 focus:bg-background transition-all"
                        />
                    </div>
                </div>
            </div>

            <Button 
                type="submit" 
                className="w-full h-14 rounded-2xl text-lg font-bold shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all" 
                disabled={loading || !password || !confirmPassword}
            >
                {loading ? (
                    <div className="flex items-center gap-2">
                        <Loader2 className="animate-spin" size={20} />
                        <span>Actualizando...</span>
                    </div>
                ) : (
                    <span>Actualizar contraseña</span>
                )}
            </Button>
        </form>
    );
}

export default function ResetPasswordPage() {
    return (
        <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
            <div className="w-full max-w-[440px] p-8 md:p-12 bg-card border border-border/40 rounded-[2.5rem] shadow-2xl shadow-primary/5 animate-in fade-in slide-in-from-bottom-8 duration-1000">
                <Suspense fallback={
                    <div className="flex flex-col items-center justify-center py-20 gap-4">
                        <Loader2 className="w-10 h-10 text-primary animate-spin" />
                        <p className="text-sm text-muted-foreground animate-pulse">Cargando...</p>
                    </div>
                }>
                    <ResetPasswordForm />
                </Suspense>
            </div>
        </div>
    );
}
