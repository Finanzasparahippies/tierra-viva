
"use client";

import { useAuthStore } from "@/store/useAuthStore";
import { useEffect, useState } from "react";
import { getRanchFolders } from "@/lib/api";
import { AnimalContentFolder } from "@/lib/types";
import AnimalFolders from "@/components/animals/AnimalFolders";
import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardPage() {
    const user = useAuthStore((state) => state.user);
    const [ranchFolders, setRanchFolders] = useState<AnimalContentFolder[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchFolders = async () => {
            try {
                const folders = await getRanchFolders();
                setRanchFolders(folders);
            } catch (error) {
                console.error("Error fetching ranch folders:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchFolders();
    }, []);

    const joinDate = user?.date_joined ? new Date(user.date_joined).toLocaleDateString('es-MX', {
        year: 'numeric',
        month: 'long'
    }) : "Miembro activo";

    const totalContributions = user?.total_contributions !== undefined ? `$${user.total_contributions.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} MXN` : "$0.00 MXN";

    return (
        <div className="space-y-12">
            <div>
                <h1 className="text-4xl font-black tracking-tight mb-2">Bienvenido, {user?.first_name || "Usuario"}</h1>
                <p className="text-muted-foreground text-lg">Aquí puedes ver tu impacto y contenido exclusivo del santuario.</p>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
                <div className="p-6 border rounded-lg bg-card">
                    <h2 className="text-lg font-semibold mb-2">Estado de Cuenta</h2>
                    <p className="text-muted-foreground">Miembro activo desde {joinDate}</p>
                </div>
                <div className="p-6 border rounded-lg bg-card">
                    <h2 className="text-lg font-semibold mb-2">Impacto Total</h2>
                    <p className="text-3xl font-bold text-primary">{totalContributions}</p>
                    <p className="text-sm text-muted-foreground">Donado a la causa</p>
                </div>
            </div>

            {loading ? (
                <div className="space-y-4">
                    <Skeleton className="h-8 w-64" />
                    <div className="grid md:grid-cols-3 gap-6">
                        <Skeleton className="h-48 rounded-3xl" />
                        <Skeleton className="h-48 rounded-3xl" />
                        <Skeleton className="h-48 rounded-3xl" />
                    </div>
                </div>
            ) : (
                <AnimalFolders folders={ranchFolders} title="Contenido General del Rancho" />
            )}
        </div>
    );
}
