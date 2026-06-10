"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail, ArrowLeft, Loader2, CheckCircle2 } from "lucide-react";
import { requestPasswordReset } from "@/lib/api";

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            await requestPasswordReset(email);
            setSuccess(true);
        } catch (err: any) {
            console.error("Forgot password error:", err);
            setError("Ocurrió un error al procesar tu solicitud. Por favor intenta de nuevo.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
            <div className="w-full max-w-[440px] p-8 md:p-12 bg-card border border-border/40 rounded-[2.5rem] shadow-2xl shadow-primary/5 animate-in fade-in slide-in-from-bottom-8 duration-1000">
                <div className="space-y-6">
                    <div className="text-center space-y-2">
                        <h1 className="text-3xl font-black tracking-tight">Recuperar Contraseña</h1>
                        <p className="text-muted-foreground text-sm">
                            {success 
                                ? "Te hemos enviado un correo con las instrucciones."
                                : "Ingresa tu email y te enviaremos un enlace para restablecer tu contraseña."}
                        </p>
                    </div>

                    {success ? (
                        <div className="space-y-6">
                            <div className="flex justify-center">
                                <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center text-green-500 animate-bounce">
                                    <CheckCircle2 size={40} />
                                </div>
                            </div>
                            <div className="p-4 text-sm text-green-700 bg-green-50 border border-green-200 rounded-2xl text-center">
                                Revisa tu bandeja de entrada. Si no lo ves, revisa la carpeta de spam.
                            </div>
                            <Button asChild className="w-full h-14 rounded-2xl text-lg font-bold">
                                <Link href="/login">Volver al inicio de sesión</Link>
                            </Button>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-5">
                            {error && (
                                <div className="p-4 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-2xl animate-in shake-in duration-300">
                                    {error}
                                </div>
                            )}

                            <div className="space-y-2">
                                <label className="text-sm font-bold uppercase tracking-widest text-muted-foreground ml-1">Email</label>
                                <div className="relative">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                                    <Input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        placeholder="tu@email.com"
                                        disabled={loading}
                                        className="pl-12 h-14 rounded-2xl bg-muted/30 border-border/50 focus:bg-background transition-all"
                                    />
                                </div>
                            </div>

                            <Button 
                                type="submit" 
                                className="w-full h-14 rounded-2xl text-lg font-bold shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all" 
                                disabled={loading || !email}
                            >
                                {loading ? (
                                    <div className="flex items-center gap-2">
                                        <Loader2 className="animate-spin" size={20} />
                                        <span>Enviando...</span>
                                    </div>
                                ) : (
                                    <span>Enviar enlace</span>
                                )}
                            </Button>

                            <div className="text-center pt-2">
                                <Link 
                                    href="/login" 
                                    className="inline-flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-primary transition-colors"
                                >
                                    <ArrowLeft size={16} />
                                    Volver al login
                                </Link>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}
