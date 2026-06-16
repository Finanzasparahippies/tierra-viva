"use client";

import { useEffect, useState } from "react";
import { getSystemMetrics } from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";
import { 
    Cpu, 
    HardDrive, 
    Database, 
    Activity, 
    Clock, 
    RefreshCw,
    CheckCircle2,
    XCircle
} from "lucide-react";

interface HardwareStat {
    percent: number;
    used?: number;
    total?: number;
    cores?: number;
    total_gb?: number;
    used_gb?: number;
}

interface SystemMetricsData {
    cpu: HardwareStat;
    memory: HardwareStat;
    disk: HardwareStat;
    database: {
        status: string;
    };
    system: {
        uptime: string;
    };
}

export default function TelemetryPage() {
    const [metrics, setMetrics] = useState<SystemMetricsData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [pollingActive, setPollingActive] = useState(true);
    const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

    const fetchMetrics = async () => {
        try {
            const data = await getSystemMetrics();
            setMetrics(data);
            setLastUpdated(new Date());
            setError(null);
        } catch (err: any) {
            console.error("Error fetching system metrics:", err);
            setError("Error al leer la telemetría del servidor.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMetrics();

        // Real-time polling every 5 seconds (Nectar Labs performance control)
        const interval = setInterval(() => {
            if (pollingActive) {
                fetchMetrics();
            }
        }, 5000);

        return () => clearInterval(interval);
    }, [pollingActive]);

    if (loading) {
        return (
            <div className="space-y-8">
                <div className="space-y-2">
                    <Skeleton className="h-8 w-48 rounded-xl" />
                    <Skeleton className="h-4 w-72 rounded-xl" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Skeleton className="h-44 rounded-3xl" />
                    <Skeleton className="h-44 rounded-3xl" />
                    <Skeleton className="h-44 rounded-3xl" />
                </div>
            </div>
        );
    }

    if (error && !metrics) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-center space-y-6">
                <div className="w-16 h-16 bg-destructive/10 text-destructive rounded-full flex items-center justify-center text-3xl font-black">!</div>
                <h2 className="text-2xl font-black text-foreground">{error}</h2>
                <p className="text-muted-foreground text-sm max-w-md">No se pudo establecer conexión con el endpoint de métricas de Django.</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black tracking-tight mb-2 text-foreground">Telemetría del Sistema</h1>
                    <p className="text-muted-foreground text-sm">Monitorea el rendimiento de hardware y la base de datos de Tierra Viva.</p>
                </div>
                <div className="flex items-center gap-3 bg-secondary/10 px-4 py-2.5 rounded-2xl border border-border/50 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                    <RefreshCw className={`w-3.5 h-3.5 text-primary ${pollingActive ? "animate-spin" : ""}`} />
                    <span>Última actualización: {lastUpdated.toLocaleTimeString()}</span>
                </div>
            </div>

            {/* Live Hardware Telemetry Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* CPU Card */}
                <div className="p-6 border border-border/80 rounded-3xl bg-card/40 backdrop-blur-sm shadow-xl relative overflow-hidden group hover:border-primary/20 transition-all duration-300">
                    <div className="flex justify-between items-center mb-6">
                        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Procesador (CPU)</span>
                        <Cpu className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex items-baseline gap-2 mb-4">
                        <span className="text-4xl font-black tracking-tighter text-foreground">
                            {metrics?.cpu?.percent?.toFixed(1) || "0.0"}%
                        </span>
                        <span className="text-[10px] text-muted-foreground font-bold">
                            {metrics?.cpu?.cores || 2} Cores
                        </span>
                    </div>
                    <div className="w-full bg-border/40 h-2 rounded-full overflow-hidden">
                        <div 
                            className="bg-gradient-to-r from-primary to-orange-500 h-full rounded-full transition-all duration-500"
                            style={{ width: `${metrics?.cpu?.percent || 0}%` }}
                        ></div>
                    </div>
                </div>

                {/* RAM Card */}
                <div className="p-6 border border-border/80 rounded-3xl bg-card/40 backdrop-blur-sm shadow-xl relative overflow-hidden group hover:border-primary/20 transition-all duration-300">
                    <div className="flex justify-between items-center mb-6">
                        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Memoria RAM</span>
                        <Activity className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex items-baseline gap-2 mb-4">
                        <span className="text-4xl font-black tracking-tighter text-foreground">
                            {metrics?.memory?.percent?.toFixed(1) || "0.0"}%
                        </span>
                        <span className="text-[10px] text-muted-foreground font-bold">
                            {metrics?.memory?.used_gb?.toFixed(2) || "0.00"} GB / {metrics?.memory?.total_gb?.toFixed(1) || "0.0"} GB
                        </span>
                    </div>
                    <div className="w-full bg-border/40 h-2 rounded-full overflow-hidden">
                        <div 
                            className="bg-gradient-to-r from-primary to-orange-500 h-full rounded-full transition-all duration-500"
                            style={{ width: `${metrics?.memory?.percent || 0}%` }}
                        ></div>
                    </div>
                </div>

                {/* Disk Card */}
                <div className="p-6 border border-border/80 rounded-3xl bg-card/40 backdrop-blur-sm shadow-xl relative overflow-hidden group hover:border-primary/20 transition-all duration-300">
                    <div className="flex justify-between items-center mb-6">
                        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Almacenamiento (SSD)</span>
                        <HardDrive className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex items-baseline gap-2 mb-4">
                        <span className="text-4xl font-black tracking-tighter text-foreground">
                            {metrics?.disk?.percent?.toFixed(1) || "0.0"}%
                        </span>
                        <span className="text-[10px] text-muted-foreground font-bold">
                            {metrics?.disk?.used_gb?.toFixed(1) || "0.0"} GB / {metrics?.disk?.total_gb?.toFixed(0) || "0"} GB
                        </span>
                    </div>
                    <div className="w-full bg-border/40 h-2 rounded-full overflow-hidden">
                        <div 
                            className="bg-gradient-to-r from-primary to-orange-500 h-full rounded-full transition-all duration-500"
                            style={{ width: `${metrics?.disk?.percent || 0}%` }}
                        ></div>
                    </div>
                </div>
            </div>

            {/* Infrastructure Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Database Connection */}
                <div className="p-6 border border-border/80 rounded-3xl bg-card/40 backdrop-blur-sm shadow-xl flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="bg-primary/10 text-primary p-3 rounded-2xl">
                            <Database className="h-6 w-6" />
                        </div>
                        <div>
                            <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Base de Datos</span>
                            <h4 className="font-bold text-lg text-foreground mt-0.5">PostgreSQL Engine</h4>
                        </div>
                    </div>
                    <div>
                        {metrics?.database?.status === 'Conectado' ? (
                            <span className="bg-green-500/10 text-green-500 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 border border-green-500/20">
                                <CheckCircle2 className="w-4 h-4" /> Conectado
                            </span>
                        ) : (
                            <span className="bg-red-500/10 text-red-500 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 border border-red-500/20">
                                <XCircle className="w-4 h-4" /> Error
                            </span>
                        )}
                    </div>
                </div>

                {/* System Uptime */}
                <div className="p-6 border border-border/80 rounded-3xl bg-card/40 backdrop-blur-sm shadow-xl flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="bg-primary/10 text-primary p-3 rounded-2xl">
                            <Clock className="h-6 w-6" />
                        </div>
                        <div>
                            <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Tiempo de Actividad</span>
                            <h4 className="font-bold text-lg text-foreground mt-0.5">Host Server Uptime</h4>
                        </div>
                    </div>
                    <span className="font-mono font-black text-primary text-lg px-4 py-1.5 bg-primary/10 rounded-2xl border border-primary/10">
                        {metrics?.system?.uptime || "Uptime indisponible"}
                    </span>
                </div>
            </div>
        </div>
    );
}
