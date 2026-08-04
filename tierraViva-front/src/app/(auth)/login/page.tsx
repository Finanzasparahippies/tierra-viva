
"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuthStore } from "@/store/useAuthStore";
import { login as apiLogin, getMe as apiGetMe } from "@/lib/api";
import { LogIn, Mail, Lock, Loader2, Eye, EyeOff } from "lucide-react";

function LoginForm() {
    const searchParams = useSearchParams();
    const isRegistered = searchParams.get("registered") === "true";
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const loginStore = useAuthStore((state) => state.login);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);
        
        try {
            const { access } = await apiLogin({ email, password });
            const userData = await apiGetMe(access);
            loginStore(userData, access);
            router.push("/dashboard");
        } catch (err: any) {
            console.error("Login error:", err);
            setError("Credenciales inválidas. Por favor intenta de nuevo.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="text-center space-y-2">
                <h1 className="text-4xl font-black tracking-tight">¡Bienvenido de nuevo!</h1>
                <p className="text-muted-foreground">Ingresa tus credenciales para continuar.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
                {isRegistered && !error && (
                    <div className="p-4 text-sm text-green-700 bg-green-50 border border-green-200 rounded-2xl animate-in fade-in zoom-in duration-500">
                        ¡Registro exitoso! Por favor inicia sesión con tu nueva cuenta.
                    </div>
                )}
                
                {error && (
                    <div className="p-4 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-2xl animate-in shake-in duration-300">
                        {error}
                    </div>
                )}

                <div className="space-y-4">
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

                    <div className="space-y-2">
                        <div className="flex items-center justify-between ml-1">
                            <label className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Contraseña</label>
                            <Link 
                                href="/forgot-password" 
                                className="text-xs font-bold text-primary hover:underline underline-offset-4"
                            >
                                ¿Olvidaste tu contraseña?
                            </Link>
                        </div>
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
                </div>

                <Button 
                    type="submit" 
                    className="w-full h-14 rounded-2xl text-lg font-bold shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all" 
                    disabled={loading}
                >
                    {loading ? (
                        <div className="flex items-center gap-2">
                            <Loader2 className="animate-spin" size={20} />
                            <span>Iniciando...</span>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2">
                            <LogIn size={20} />
                            <span>Entrar</span>
                        </div>
                    )}
                </Button>
            </form>

            <div className="pt-4 text-center text-sm font-medium">
                <span className="text-muted-foreground">¿No tienes cuenta todavía?</span>{" "}
                <Link href="/register" className="text-primary font-bold hover:underline underline-offset-4">
                    Regístrate aquí
                </Link>
            </div>
        </div>
    );
}

export default function LoginPage() {
    return (
        <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
            <div className="w-full max-w-[440px] p-8 md:p-12 bg-card border border-border/40 rounded-[2.5rem] shadow-2xl shadow-primary/5 animate-in fade-in slide-in-from-bottom-8 duration-1000">
                <Suspense fallback={
                    <div className="flex flex-col items-center justify-center py-20 gap-4">
                        <Loader2 className="w-10 h-10 text-primary animate-spin" />
                        <p className="text-sm text-muted-foreground animate-pulse">Cargando...</p>
                    </div>
                }>
                    <LoginForm />
                </Suspense>
            </div>
        </div>
    );
}
