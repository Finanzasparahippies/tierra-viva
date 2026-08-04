
"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { User, Heart, Settings, LogOut, Ticket, ShoppingBag, ShieldAlert, Cpu, BarChart3 } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { Button } from "@/components/ui/button";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const router = useRouter();
    const logout = useAuthStore((state) => state.logout);
    const user = useAuthStore((state) => state.user);

    const role = user?.role || "USER";
    const isStaff = user?.is_staff || false;

    let sidebarLinks = [];
    let portalTitle = "Mi Cuenta";
    let portalSubtitle = "Socio Santuario";

    if (role === 'ADMIN' || isStaff) {
        portalTitle = "Admin Portal";
        portalSubtitle = "Tierra Viva Control";
        sidebarLinks = [
            { href: "/dashboard", label: "Control Center", icon: BarChart3 },
            { href: "/dashboard/admin-config", label: "Configuración Apps", icon: Settings },
            { href: "/dashboard/telemetry", label: "Métricas Sistema", icon: Cpu },
            { href: "/dashboard/settings", label: "Mi Perfil", icon: User },
        ];
    } else if (role === 'FAMILY') {
        portalTitle = "Portal Familia";
        portalSubtitle = "Personal del Santuario";
        sidebarLinks = [
            { href: "/dashboard", label: "Gestión Rancho", icon: BarChart3 },
            { href: "/dashboard/admin-config", label: "Gestión Contenido", icon: Settings },
            { href: "/dashboard/rescues", label: "Reportes Rescate", icon: ShieldAlert },
            { href: "/dashboard/settings", label: "Mi Perfil", icon: User },
        ];
    } else if (role === 'SPONSOR') {
        portalTitle = "Padrino Santuario";
        portalSubtitle = "Aliado Especial";
        sidebarLinks = [
            { href: "/dashboard", label: "Mi Panel", icon: User },
            { href: "/dashboard/sponsorships", label: "Mis Apadrinamientos", icon: Heart },
            { href: "/dashboard/bookings", label: "Mis Actividades", icon: Ticket },
            { href: "/dashboard/orders", label: "Mis Pedidos", icon: ShoppingBag },
            { href: "/dashboard/rescues", label: "Reportar Rescate", icon: ShieldAlert },
            { href: "/dashboard/settings", label: "Mi Perfil", icon: Settings },
        ];
    } else {
        sidebarLinks = [
            { href: "/dashboard", label: "Mi Cuenta", icon: User },
            { href: "/dashboard/bookings", label: "Mis Actividades", icon: Ticket },
            { href: "/dashboard/orders", label: "Mis Pedidos", icon: ShoppingBag },
            { href: "/dashboard/rescues", label: "Reportar Rescate", icon: ShieldAlert },
            { href: "/dashboard/settings", label: "Mi Perfil", icon: Settings },
        ];
    }

    return (
        <div className="flex flex-col md:flex-row gap-8 py-8 animate-in fade-in duration-700">
            <aside className="w-full md:w-64 space-y-3 shrink-0">
                <div className="p-5 border border-primary/10 rounded-3xl bg-primary/5/10 bg-gradient-to-br from-primary/5 to-secondary/5 backdrop-blur-md">
                    <h2 className="font-black text-lg tracking-tight text-foreground uppercase">
                        {portalTitle}
                    </h2>
                    <p className="text-[10px] font-black text-primary uppercase tracking-widest mt-1 opacity-85">
                        {portalSubtitle}
                    </p>
                </div>
                <nav className="space-y-1 bg-card/30 p-2 border rounded-3xl">
                    {sidebarLinks.map((link) => {
                        const Icon = link.icon;
                        const isActive = pathname === link.href;
                        return (
                            <Link key={link.href} href={link.href}>
                                <Button
                                    variant={isActive ? "secondary" : "ghost"}
                                    className={`w-full justify-start gap-3 rounded-2xl py-6 font-bold transition-all duration-300 ${
                                        isActive 
                                            ? "bg-primary text-primary-foreground font-black shadow-lg shadow-primary/20 scale-[1.02]" 
                                            : "hover:bg-primary/10"
                                    }`}
                                >
                                    <Icon className={`h-5 w-5 ${isActive ? "text-primary-foreground animate-pulse" : "text-muted-foreground"}`} />
                                    {link.label}
                                </Button>
                            </Link>
                        );
                    })}
                    <Button
                        variant="ghost"
                        className="w-full justify-start gap-3 rounded-2xl py-6 font-bold text-destructive hover:text-destructive hover:bg-destructive/10 transition-all duration-300 mt-2"
                        onClick={() => {
                            logout();
                            router.push("/login");
                        }}
                    >
                        <LogOut className="h-5 w-5" />
                        Cerrar Sesión
                    </Button>
                </nav>
            </aside>
            <div className="flex-1 min-h-[500px] border border-border/60 rounded-[2.5rem] p-6 md:p-8 bg-card/10 backdrop-blur-sm shadow-xl relative overflow-hidden">
                {children}
            </div>
        </div>
    );
}
