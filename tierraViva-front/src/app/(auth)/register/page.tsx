
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { register as apiRegister } from "@/lib/api";

export default function RegisterPage() {
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        confirmPassword: "",
    });
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (formData.password !== formData.confirmPassword) {
            setError("Las contraseñas no coinciden");
            return;
        }

        setLoading(true);
        try {
            await apiRegister({
                first_name: formData.firstName,
                last_name: formData.lastName,
                email: formData.email,
                password: formData.password,
            });
            router.push("/login?registered=true");
        } catch (err: any) {
            console.error("Registration error:", err);
            setError(err.response?.data?.email?.[0] || "Error al registrar la cuenta. Intenta con otro email.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-md mx-auto mt-20 p-6 border rounded-xl shadow-sm">
            <h1 className="text-2xl font-bold mb-6 text-center">Crear Cuenta</h1>
            <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                    <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-lg">
                        {error}
                    </div>
                )}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="text-sm font-medium">Nombre</label>
                        <Input
                            name="firstName"
                            value={formData.firstName}
                            onChange={handleChange}
                            required
                            disabled={loading}
                        />
                    </div>
                    <div>
                        <label className="text-sm font-medium">Apellido</label>
                        <Input
                            name="lastName"
                            value={formData.lastName}
                            onChange={handleChange}
                            required
                            disabled={loading}
                        />
                    </div>
                </div>
                <div>
                    <label className="text-sm font-medium">Email</label>
                    <Input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        disabled={loading}
                    />
                </div>
                <div>
                    <label className="text-sm font-medium">Contraseña</label>
                    <Input
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                        disabled={loading}
                    />
                </div>
                <div>
                    <label className="text-sm font-medium">Confirmar Contraseña</label>
                    <Input
                        type="password"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        required
                        disabled={loading}
                    />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? "Registrando..." : "Registrarse"}
                </Button>
            </form>
            <div className="mt-4 text-center text-sm">
                ¿Ya tienes cuenta?{" "}
                <Link href="/login" className="text-primary hover:underline">
                    Inicia Sesión
                </Link>
            </div>
        </div>
    );
}
