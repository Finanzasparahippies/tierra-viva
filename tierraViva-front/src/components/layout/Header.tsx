"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { ShoppingCart, LogOut, User, Menu, ChevronDown, X, Heart, Store, ImageIcon, BookOpen, Home, HeartPulse, Calendar } from "lucide-react";
import { useCartStore } from "@/store/useCartStore";
import { useAuthStore } from "@/store/useAuthStore";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { useTheme } from "next-themes";

const Header = () => {
    const pathname = usePathname();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const cartItems = useCartStore((state) => state.items);
    const fetchCart = useCartStore((state) => state.fetchCart);
    const router = useRouter();
    const { user, logout, isAuthenticated } = useAuthStore();
    const { resolvedTheme } = useTheme();

    useEffect(() => {
        if (isAuthenticated) {
            fetchCart();
        }
    }, [isAuthenticated, fetchCart]);

    // Close menu on route change
    useEffect(() => {
        setIsMenuOpen(false);
    }, [pathname]);

    const links = [
        { href: "/", label: "Inicio", icon: <Home className="w-4 h-4" /> },
        { href: "/shop", label: "Tienda", icon: <Store className="w-4 h-4" /> },
        { href: "/animals", label: "Apadrina", icon: <Heart className="w-4 h-4" /> },
        { href: "/updates", label: "Historias", icon: <BookOpen className="w-4 h-4" /> },
        { href: "/activities", label: "Actividades", icon: <Calendar className="w-4 h-4" /> },
        { href: "/blog", label: "Blog", icon: <BookOpen className="w-4 h-4" /> },
        { href: "/gallery", label: "Galería", icon: <ImageIcon className="w-4 h-4" /> },
        { href: "/rescue", label: "Rescate", icon: <HeartPulse className="w-4 h-4" /> },
        { href: "/about", label: "Nosotros", icon: <User className="w-4 h-4" /> },
    ];

    return (
        <header className={`sticky top-0 z-[60] transition-all duration-300 border-b ${isMenuOpen
            ? "bg-background border-primary/20 shadow-2xl"
            : "bg-background/95 backdrop-blur-xl border-border/40"
            }`}>
            <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    {/* Mobile Menu Button */}
                    <Button
                        variant="ghost"
                        size="icon"
                        className="md:hidden hover:bg-primary/10 transition-colors"
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                    >
                        {isMenuOpen ? <X className="h-6 w-6 text-primary" /> : <Menu className="h-6 w-6" />}
                    </Button>

                    <Link
                        href="/"
                        className="text-2xl font-bold tracking-tight text-primary flex items-center gap-2 brush-stroke"
                    >
                        <Image
                            src="/logo-solo/TVcomp-blanco.png"
                            alt="TierraViva logo"
                            width={150}
                            height={200}
                            className="dark:invert-0 invert transition-all duration-300"
                        />
                    </Link>
                </div>

                <nav className="hidden md:flex gap-8 items-center">
                    {links.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={`text-sm font-black transition-all hover:text-primary relative py-1 sketch-nav-link ${pathname === link.href ? "active text-primary" : "text-muted-foreground"}`}
                        >
                            {link.label}
                        </Link>
                    ))}
                </nav>

                <div className="flex items-center gap-2 sm:gap-4">
                    <ThemeToggle />
                    <Link href="/shop/cart">
                        <Button variant="ghost" size="icon" className="relative hover:bg-primary/10 transition-colors">
                            <ShoppingCart className="h-5 w-5" />
                            {cartItems.length > 0 && (
                                <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-[10px] font-black rounded-full w-4 h-4 flex items-center justify-center animate-bounce shadow-sm">
                                    {cartItems.length}
                                </span>
                            )}
                        </Button>
                    </Link>

                    {user ? (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="gap-2 px-1 sm:px-2 hover:bg-primary/10 transition-colors rounded-full">
                                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
                                        <User className="h-4 w-4 text-primary" />
                                    </div>
                                    <span className="hidden lg:inline-block max-w-[100px] truncate font-bold">{user.first_name}</span>
                                    <ChevronDown className="h-4 w-4 text-muted-foreground hidden lg:block" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56 rounded-2xl p-2 shadow-2xl border-primary/10">
                                <DropdownMenuLabel className="font-black text-xs uppercase tracking-widest text-muted-foreground px-3 py-2">Mi Cuenta</DropdownMenuLabel>
                                <DropdownMenuSeparator className="bg-primary/5" />
                                <DropdownMenuItem asChild>
                                    <Link href="/dashboard" className="cursor-pointer rounded-xl font-bold p-3 hover:bg-primary/5">Panel Principal</Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                    <Link href="/dashboard/sponsorships" className="cursor-pointer rounded-xl font-bold p-3 hover:bg-primary/5">Mis Apadrinamientos</Link>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator className="bg-primary/5" />
                                <DropdownMenuItem
                                    onClick={() => {
                                        logout();
                                        router.push("/login");
                                    }}
                                    className="text-destructive focus:text-destructive cursor-pointer rounded-xl font-bold p-3 hover:bg-destructive/5"
                                >
                                    <LogOut className="mr-2 h-4 w-4" />
                                    Cerrar Sesión
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    ) : (
                        <div className="flex gap-1 sm:gap-2">
                            <Link href="/login">
                                <Button variant="ghost" size="sm" className="font-bold rounded-full hover:bg-primary/10">Entrar</Button>
                            </Link>
                            <Link href="/register">
                                <Button size="sm" className="shadow-lg shadow-primary/20 rounded-full font-black px-4">Unirme</Button>
                            </Link>
                        </div>
                    )}
                </div>
            </div>

            {/* Mobile Drawer Overlay */}
            {isMenuOpen && (
                <>
                    {/* Overlay oscuro */}
                    <div
                        className="fixed inset-0 z-30 bg-black/20 md:hidden"
                        onClick={() => setIsMenuOpen(false)}
                    />

                    {/* Drawer real */}
                    <div className="fixed top-16 left-0 w-full md:hidden z-40 bg-black/90 backdrop-blur-md flex flex-col p-6 space-y-4 border-t border-primary/5 animate-in slide-in-from-left duration-300">                        <div className="text-xs font-black text-primary/40 uppercase tracking-widest mb-2 flex items-center gap-2">
                        <span className="w-8 h-[1px] bg-primary/20"></span>
                        Explorar Santuario
                    </div>

                        {links.map((link, index) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={`flex items-center gap-4 p-4 rounded-2xl font-bold text-lg transition-all active:scale-95 ${pathname === link.href
                                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/30 translate-x-1"
                                    : "hover:bg-primary/5 text-foreground/80 border border-transparent hover:border-primary/10"
                                    }`}
                                style={{ animationDelay: `${index * 50}ms` }}
                                onClick={() => setIsMenuOpen(false)}
                            >
                                <span
                                    className={`transition-colors ${pathname === link.href ? "text-white" : "text-primary"
                                        }`}
                                >
                                    {link.icon}
                                </span>
                                {link.label}
                            </Link>
                        ))}

                        {!user && (
                            <div className="pt-8 mt-auto grid grid-cols-2 gap-4">
                                <Link href="/login" onClick={() => setIsMenuOpen(false)}>
                                    <Button variant="outline" className="w-full h-14 rounded-2xl font-bold border-2 hover:bg-primary/5 text-primary">
                                        Entrar
                                    </Button>
                                </Link>
                                <Link href="/register" onClick={() => setIsMenuOpen(false)}>
                                    <Button className="w-full h-14 rounded-2xl font-bold shadow-lg shadow-primary/20">
                                        Unirme
                                    </Button>
                                </Link>
                            </div>
                        )}

                        {user && (
                            <div className="pt-8 space-y-3">
                                <Link href="/dashboard" className="flex items-center gap-4 p-4 rounded-2xl bg-secondary/10 font-bold" onClick={() => setIsMenuOpen(false)}>
                                    <User className="w-5 h-5 text-primary" /> Mi Panel
                                </Link>
                                <Button
                                    variant="ghost"
                                    className="w-full justify-start gap-4 p-4 h-auto text-destructive font-bold hover:bg-destructive/5"
                                    onClick={() => {
                                        logout();
                                        router.push("/login");
                                    }}
                                >
                                    <LogOut className="w-5 h-5" /> Salir de la cuenta
                                </Button>
                            </div>
                        )}
                    </div>
                </>
            )}
        </header >
    );
};

export default Header;
