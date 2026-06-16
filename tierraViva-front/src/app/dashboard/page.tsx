"use client";

import { useAuthStore } from "@/store/useAuthStore";
import { useEffect, useState } from "react";
import { getRanchFolders, getAnalyticsOverview } from "@/lib/api";
import { AnimalContentFolder, AnalyticsOverviewData } from "@/lib/types";
import AnimalFolders from "@/components/animals/AnimalFolders";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { 
    TrendingUp, 
    Heart, 
    ShoppingBag, 
    ShieldAlert, 
    DollarSign, 
    Calendar, 
    ArrowUpRight, 
    Award,
    Activity,
    Compass
} from "lucide-react";

export default function DashboardPage() {
    const user = useAuthStore((state) => state.user);
    const isAdmin = user?.role === 'ADMIN' || user?.is_staff;

    if (isAdmin) {
        return <AdminDashboard />;
    }
    return <ClientDashboard />;
}

// ==========================================
// CLIENT DASHBOARD
// ==========================================
function ClientDashboard() {
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

    const totalContributions = user?.total_contributions !== undefined 
        ? `$${user.total_contributions.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} MXN` 
        : "$0.00 MXN";

    return (
        <div className="space-y-12">
            {/* Hero Welcome */}
            <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-primary/10 via-secondary/5 to-background p-8 md:p-12 border border-primary/10 shadow-2xl">
                <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-primary/10 rounded-full blur-3xl pointer-events-none"></div>
                <div className="relative z-10 space-y-4 max-w-2xl">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/20 text-primary font-black text-[10px] uppercase tracking-wider">
                        <Award className="w-3.5 h-3.5" /> Miembro del Santuario
                    </span>
                    <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-2 text-foreground">
                        Bienvenido, <span className="text-primary">{user?.first_name || user?.username || "Amigo"}</span>
                    </h1>
                    <p className="text-muted-foreground text-lg font-medium leading-relaxed">
                        Gracias por formar parte de la familia Tierra Viva. Aquí puedes ver tu impacto directo y acceder al contenido exclusivo que haces posible.
                    </p>
                </div>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-8 border border-border/80 rounded-3xl bg-card/40 backdrop-blur-sm shadow-xl hover:border-primary/20 transition-all duration-300 relative overflow-hidden group">
                    <div className="absolute top-4 right-4 bg-primary/10 text-primary p-3 rounded-2xl group-hover:scale-110 transition-transform">
                        <Calendar className="h-6 w-6" />
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Membresía</p>
                    <h2 className="text-xl font-black text-foreground">Estado de Cuenta</h2>
                    <p className="text-primary font-bold mt-2 flex items-center gap-1">
                        Miembro activo desde <span className="underline">{joinDate}</span>
                    </p>
                </div>

                <div className="p-8 border border-border/80 rounded-3xl bg-card/40 backdrop-blur-sm shadow-xl hover:border-primary/20 transition-all duration-300 relative overflow-hidden group">
                    <div className="absolute top-4 right-4 bg-primary/10 text-primary p-3 rounded-2xl group-hover:scale-110 transition-transform">
                        <Heart className="h-6 w-6 text-primary animate-pulse" />
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Tu Impacto</p>
                    <h2 className="text-xl font-black text-foreground">Contribución Total</h2>
                    <p className="text-4xl font-black tracking-tighter text-primary mt-2">{totalContributions}</p>
                    <p className="text-[10px] text-muted-foreground font-medium mt-1">Donaciones destinadas a rescate, alimento y medicina</p>
                </div>
            </div>

            {/* Exclusive Ranch updates & content */}
            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b pb-4 border-border/50">
                    <div>
                        <h2 className="text-2xl font-black tracking-tight text-foreground">Contenido General del Rancho</h2>
                        <p className="text-sm text-muted-foreground">Fotos y videos exclusivos de las especies del santuario.</p>
                    </div>
                    <Link href="/animals" className="mt-4 sm:mt-0 inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-primary hover:text-primary/80 transition-colors">
                        Ver Animales <ArrowUpRight className="w-4 h-4" />
                    </Link>
                </div>

                {loading ? (
                    <div className="space-y-4">
                        <Skeleton className="h-8 w-64 rounded-xl" />
                        <div className="grid md:grid-cols-3 gap-6">
                            <Skeleton className="h-56 rounded-[2rem]" />
                            <Skeleton className="h-56 rounded-[2rem]" />
                            <Skeleton className="h-56 rounded-[2rem]" />
                        </div>
                    </div>
                ) : ranchFolders.length > 0 ? (
                    <AnimalFolders folders={ranchFolders} title="Carpetas Exclusivas" />
                ) : (
                    <div className="text-center py-16 border rounded-[2rem] bg-muted/20 space-y-4">
                        <Compass className="w-12 h-12 mx-auto text-muted-foreground/60 animate-spin" style={{ animationDuration: '8s' }} />
                        <h3 className="text-lg font-black">No hay carpetas de contenido todavía</h3>
                        <p className="text-muted-foreground text-sm max-w-md mx-auto">
                            Estamos preparando actualizaciones especiales. ¡Vuelve pronto para ver fotos y videos de nuestro santuario!
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}

// ==========================================
// ADMIN DASHBOARD
// ==========================================
function AdminDashboard() {
    const [analytics, setAnalytics] = useState<AnalyticsOverviewData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeHoverData, setActiveHoverData] = useState<any | null>(null);

    useEffect(() => {
        const fetchAdminData = async () => {
            try {
                const data = await getAnalyticsOverview();
                setAnalytics(data);
                if (data?.charts?.daily_sales?.length > 0) {
                    // Set last item as default hover info
                    setActiveHoverData(data.charts.daily_sales[data.charts.daily_sales.length - 1]);
                }
            } catch (err: any) {
                console.error("Error fetching admin analytics:", err);
                setError("No se pudo cargar la información analítica. Verifica tus permisos.");
            } finally {
                setLoading(false);
            }
        };
        fetchAdminData();
    }, []);

    if (loading) {
        return (
            <div className="space-y-12">
                <div className="space-y-4">
                    <Skeleton className="h-12 w-64 rounded-xl" />
                    <Skeleton className="h-6 w-96 rounded-xl" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    <Skeleton className="h-32 rounded-[2rem]" />
                    <Skeleton className="h-32 rounded-[2rem]" />
                    <Skeleton className="h-32 rounded-[2rem]" />
                    <Skeleton className="h-32 rounded-[2rem]" />
                </div>
                <Skeleton className="h-96 rounded-[2.5rem]" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-center space-y-6">
                <div className="w-16 h-16 bg-destructive/10 text-destructive rounded-full flex items-center justify-center text-3xl font-black">!</div>
                <h2 className="text-2xl font-black text-foreground">{error}</h2>
                <p className="text-muted-foreground text-sm max-w-md">Si el error persiste, asegúrate de que tu usuario tiene rol de Staff o Admin en el backend Django.</p>
            </div>
        );
    }

    const financials = analytics?.financials;
    const rescues = analytics?.rescues;
    const shop = analytics?.shop;
    const chartData = analytics?.charts?.daily_sales || [];

    // Calculate maximum value for chart scaling
    const maxVal = chartData.length > 0 
        ? Math.max(...chartData.map(d => d.total || 0), 100) 
        : 100;

    return (
        <div className="space-y-12">
            {/* Header */}
            <div>
                <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-2 text-foreground">
                    Control <span className="text-primary italic">Center</span>
                </h1>
                <p className="text-[10px] font-black uppercase tracking-widest text-primary opacity-80 flex items-center gap-2">
                    <Activity className="w-4 h-4 text-primary animate-pulse" /> Estado General y KPIs Financieros
                </p>
            </div>

            {/* KPI Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Gross Sales */}
                <div className="p-6 border border-border/80 rounded-3xl bg-gradient-to-br from-primary/10 to-card/50 shadow-xl relative overflow-hidden group">
                    <div className="absolute top-4 right-4 bg-primary/10 text-primary p-2.5 rounded-2xl">
                        <DollarSign className="h-5 w-5" />
                    </div>
                    <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Ventas Brutas Totales</p>
                    <h3 className="text-2xl font-black tracking-tighter mt-2 text-foreground">
                        ${financials?.gross_sales?.toLocaleString('es-MX', { minimumFractionDigits: 2 }) || "0.00"} MXN
                    </h3>
                    <div className="mt-4 pt-3 border-t border-border/50 text-[10px] text-muted-foreground space-y-1">
                        <div className="flex justify-between">
                            <span>Apadrinamientos:</span>
                            <span className="font-bold text-foreground">${financials?.sponsorship_sales?.toLocaleString('es-MX')}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Tienda:</span>
                            <span className="font-bold text-foreground">${financials?.shop_sales?.toLocaleString('es-MX')}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Campamentos/Tours:</span>
                            <span className="font-bold text-foreground">${financials?.activities_sales?.toLocaleString('es-MX')}</span>
                        </div>
                    </div>
                </div>

                {/* Active Sponsors */}
                <div className="p-6 border border-border/80 rounded-3xl bg-card/40 backdrop-blur-sm shadow-xl relative overflow-hidden group">
                    <div className="absolute top-4 right-4 bg-primary/10 text-primary p-2.5 rounded-2xl">
                        <Heart className="h-5 w-5 animate-pulse text-red-500" />
                    </div>
                    <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Apadrinamientos Activos</p>
                    <h3 className="text-4xl font-black tracking-tighter mt-4 text-foreground">
                        {analytics?.sponsorships?.active_count || 0}
                    </h3>
                    <p className="text-[10px] text-primary font-bold mt-2">Padrinos recurrentes</p>
                </div>

                {/* Shop Status */}
                <div className="p-6 border border-border/80 rounded-3xl bg-card/40 backdrop-blur-sm shadow-xl relative overflow-hidden group">
                    <div className="absolute top-4 right-4 bg-primary/10 text-primary p-2.5 rounded-2xl">
                        <ShoppingBag className="h-5 w-5" />
                    </div>
                    <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Tienda e Inventario</p>
                    <h3 className="text-4xl font-black tracking-tighter mt-4 text-foreground">
                        {shop?.total_orders || 0}
                    </h3>
                    <div className="flex items-center justify-between mt-2">
                        <span className="text-[10px] text-muted-foreground">Pedidos procesados</span>
                        {shop?.low_stock_count && shop.low_stock_count > 0 ? (
                            <span className="bg-amber-500/10 text-amber-600 px-2 py-0.5 rounded-lg text-[9px] font-black uppercase">
                                {shop.low_stock_count} Bajo stock
                            </span>
                        ) : null}
                    </div>
                </div>

                {/* Rescue Status */}
                <div className="p-6 border border-border/80 rounded-3xl bg-card/40 backdrop-blur-sm shadow-xl relative overflow-hidden group">
                    <div className="absolute top-4 right-4 bg-primary/10 text-primary p-2.5 rounded-2xl">
                        <ShieldAlert className="h-5 w-5" />
                    </div>
                    <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Emergencias de Rescate</p>
                    <h3 className="text-4xl font-black tracking-tighter mt-4 text-foreground">
                        {rescues?.total || 0}
                    </h3>
                    <div className="flex gap-2 mt-2">
                        <span className="bg-red-500/10 text-red-500 px-2 py-0.5 rounded-lg text-[9px] font-black uppercase">
                            {rescues?.pending || 0} Pendientes
                        </span>
                        <span className="bg-green-500/10 text-green-500 px-2 py-0.5 rounded-lg text-[9px] font-black uppercase">
                            {rescues?.resolved || 0} Resueltos
                        </span>
                    </div>
                </div>
            </div>

            {/* Custom SVG Line Chart */}
            {chartData.length > 0 ? (
                <div className="bg-card-bg border border-card-border p-8 rounded-[2.5rem] relative overflow-hidden group hover:border-primary/20 transition-all duration-300">
                    <header className="mb-8 flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                        <div>
                            <h2 className="text-2xl font-black tracking-tighter">Ventas de los Últimos 30 Días</h2>
                            <p className="text-[9px] font-black uppercase tracking-widest text-primary opacity-80 mt-1">Apadrinamientos, tienda y reservaciones</p>
                        </div>
                        {activeHoverData && (
                            <div className="bg-background/80 border border-primary/10 backdrop-blur-md px-4 py-2.5 rounded-2xl text-[10px] grid grid-cols-2 gap-x-4 gap-y-1 min-w-[200px] shadow-lg">
                                <span className="font-bold text-muted-foreground">Fecha:</span>
                                <span className="font-black text-right">{activeHoverData.date}</span>
                                <span className="font-bold text-muted-foreground">Actividades:</span>
                                <span className="font-black text-right text-foreground">${activeHoverData.activities.toFixed(2)}</span>
                                <span className="font-bold text-muted-foreground">Apadrinamientos:</span>
                                <span className="font-black text-right text-foreground">${activeHoverData.sponsorships.toFixed(2)}</span>
                                <span className="font-bold text-muted-foreground">Tienda:</span>
                                <span className="font-black text-right text-foreground">${activeHoverData.shop.toFixed(2)}</span>
                                <span className="font-black text-primary border-t pt-1 mt-1">Total:</span>
                                <span className="font-black text-right text-primary border-t pt-1 mt-1">${activeHoverData.total.toFixed(2)}</span>
                            </div>
                        )}
                    </header>

                    {/* SVG Chart Design */}
                    <div className="relative w-full h-64 mt-4">
                        <svg className="w-full h-full" viewBox="0 0 1000 250" preserveAspectRatio="none">
                            {/* Grid Lines */}
                            <line x1="0" y1="50" x2="1000" y2="50" stroke="currentColor" strokeWidth="0.5" className="text-muted-foreground/10" />
                            <line x1="0" y1="125" x2="1000" y2="125" stroke="currentColor" strokeWidth="0.5" className="text-muted-foreground/10" />
                            <line x1="0" y1="200" x2="1000" y2="200" stroke="currentColor" strokeWidth="0.5" className="text-muted-foreground/10" />

                            {/* Line Plot for Total */}
                            {chartData.map((d, index, arr) => {
                                if (index === 0) return null;
                                const prev = arr[index - 1];
                                const x1 = ((index - 1) / (arr.length - 1)) * 1000;
                                const y1 = 230 - (prev.total / maxVal) * 200;
                                const x2 = (index / (arr.length - 1)) * 1000;
                                const y2 = 230 - (d.total / maxVal) * 200;
                                return (
                                    <line 
                                        key={index} 
                                        x1={x1} 
                                        y1={y1} 
                                        x2={x2} 
                                        y2={y2} 
                                        stroke="var(--primary)" 
                                        strokeWidth="3.5" 
                                        strokeLinecap="round"
                                        className="transition-all duration-300"
                                    />
                                );
                            })}

                            {/* Dots and interactive hover triggers */}
                            {chartData.map((d, index, arr) => {
                                const x = (index / (arr.length - 1)) * 1000;
                                const y = 230 - (d.total / maxVal) * 200;
                                const isCurrent = activeHoverData?.date === d.date;
                                return (
                                    <g key={index} className="cursor-pointer group/dot" onMouseEnter={() => setActiveHoverData(d)}>
                                        <circle 
                                            cx={x} 
                                            cy={y} 
                                            r={isCurrent ? "7" : "4.5"} 
                                            fill={isCurrent ? "var(--primary)" : "var(--primary-foreground)"} 
                                            stroke="var(--primary)" 
                                            strokeWidth="2.5"
                                            className="transition-all duration-300"
                                        />
                                        {/* Invisible wide hover rectangle to make it easy to trigger hover */}
                                        <rect 
                                            x={x - 15} 
                                            y="0" 
                                            width="30" 
                                            height="250" 
                                            fill="transparent" 
                                            className="outline-none"
                                        />
                                    </g>
                                );
                            })}
                        </svg>
                    </div>

                    <div className="flex justify-between items-center text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-4">
                        <span>{chartData[0]?.date}</span>
                        <span className="text-primary font-black animate-pulse">Pasa el mouse sobre el gráfico para ver detalles</span>
                        <span>{chartData[chartData.length - 1]?.date}</span>
                    </div>
                </div>
            ) : null}

            {/* Quick Actions Portal */}
            <section className="bg-secondary/5 border rounded-[2.5rem] p-8 md:p-10 space-y-6">
                <div>
                    <h2 className="text-2xl font-black tracking-tighter">Accesos de Gestión Rápida</h2>
                    <p className="text-xs text-muted-foreground">Acciones comunes del administrador para el control del santuario.</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    <Link href="/admin/animals/animal/" target="_blank" className="p-6 border bg-background/50 hover:bg-primary/5 hover:border-primary/20 rounded-3xl block transition-all shadow-sm">
                        <span className="text-[9px] font-black uppercase tracking-widest text-primary mb-1 block">Catálogo</span>
                        <h4 className="font-bold text-lg text-foreground">Control de Animales</h4>
                        <p className="text-xs text-muted-foreground mt-1">Agregar animales, editar bitácoras de salud y subir fotos.</p>
                    </Link>
                    <Link href="/admin/sponsorship/sponsorship/" target="_blank" className="p-6 border bg-background/50 hover:bg-primary/5 hover:border-primary/20 rounded-3xl block transition-all shadow-sm">
                        <span className="text-[9px] font-black uppercase tracking-widest text-primary mb-1 block">Donativos</span>
                        <h4 className="font-bold text-lg text-foreground">Suscripciones y Tiers</h4>
                        <p className="text-xs text-muted-foreground mt-1">Revisar patrocinadores activos e importes de Stripe.</p>
                    </Link>
                    <Link href="/admin/rescues/rescuerequest/" target="_blank" className="p-6 border bg-background/50 hover:bg-primary/5 hover:border-primary/20 rounded-3xl block transition-all shadow-sm">
                        <span className="text-[9px] font-black uppercase tracking-widest text-primary mb-1 block">Emergencias</span>
                        <h4 className="font-bold text-lg text-foreground">Reportes de Rescate</h4>
                        <p className="text-xs text-muted-foreground mt-1">Actualizar estado de solicitudes y asignar rescatistas.</p>
                    </Link>
                </div>
            </section>
        </div>
    );
}
