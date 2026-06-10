
"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { User, Heart, Settings, LogOut } from "lucide-react";
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

    const sidebarLinks = [
        { href: "/dashboard", label: "Resumen", icon: User },
        { href: "/dashboard/sponsorships", label: "Mis Apadrinamientos", icon: Heart },
        { href: "/dashboard/settings", label: "Configuración", icon: Settings },
    ];

    return (
        <div className="flex flex-col md:flex-row gap-8 py-8">
            <aside className="w-full md:w-64 space-y-2">
                <div className="p-4 border rounded-lg bg-muted/30 mb-4">
                    <h2 className="font-semibold text-lg">Mi Cuenta</h2>
                </div>
                <nav className="space-y-1">
                    {sidebarLinks.map((link) => {
                        const Icon = link.icon;
                        return (
                            <Link key={link.href} href={link.href}>
                                <Button
                                    variant={pathname === link.href ? "secondary" : "ghost"}
                                    className="w-full justify-start gap-2"
                                >
                                    <Icon className="h-4 w-4" />
                                    {link.label}
                                </Button>
                            </Link>
                        );
                    })}
                    <Button
                        variant="ghost"
                        className="w-full justify-start gap-2 text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => {
                            logout();
                            router.push("/login");
                        }}
                    >
                        <LogOut className="h-4 w-4" />
                        Cerrar Sesión
                    </Button>
                </nav>
            </aside>
            <div className="flex-1 min-h-[500px] border rounded-lg p-6">
                {children}
            </div>
        </div>
    );
}
