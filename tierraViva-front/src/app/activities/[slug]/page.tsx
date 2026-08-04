"use client";

import { useEffect, useState, use } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
    Calendar,
    Clock,
    MapPin,
    Users,
    Ticket,
    ChevronLeft,
    ShieldCheck,
    ArrowRight,
    Star
} from "lucide-react";
import { getActivityBySlug, createActivityCheckoutSession } from "@/lib/api";
import { Activity } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuthStore } from "@/store/useAuthStore";
import { formatDate } from "@/lib/utils";
import Link from "next/link";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

const MySwal = withReactContent(Swal);

export default function ActivityDetailPage({ params }: { params: { slug: string } }) {
    const { slug } = params;
    const [activity, setActivity] = useState<Activity | null>(null);
    const [tickets, setTickets] = useState(1);
    const [loading, setLoading] = useState(true);
    const [bookingLoading, setBookingLoading] = useState(false);
    const { user, isAuthenticated } = useAuthStore();
    const router = useRouter();

    useEffect(() => {
        async function load() {
            try {
                setLoading(true);
                const data = await getActivityBySlug(slug);
                setActivity(data);
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        }
        load();
    }, [slug]);

    const handleBooking = async () => {
        if (!isAuthenticated) {
            MySwal.fire({
                title: <span className="text-2xl font-black">¡Atención!</span>,
                html: <p className="font-medium">Es necesario iniciar sesión para reservar tu lugar en el santuario.</p>,
                icon: "info",
                confirmButtonText: "Ir a iniciar sesión",
                confirmButtonColor: "var(--primary)",
                showCancelButton: true,
                cancelButtonText: "Cancelar",
                customClass: {
                    popup: "rounded-[2rem] border-2 border-primary/10",
                    confirmButton: "rounded-xl font-bold px-8 py-3",
                    cancelButton: "rounded-xl font-bold px-8 py-3",
                }
            }).then((result) => {
                if (result.isConfirmed) {
                    router.push(`/login?redirect=/activities/${slug}`);
                }
            });
            return;
        }

        setBookingLoading(true);
        try {
            const session = await createActivityCheckoutSession(slug, tickets);
            if (session.url) {
                window.location.href = session.url;
            }
        } catch (error: any) {
            MySwal.fire({
                title: "Error al procesar",
                text: error.response?.data?.error || "Hubo un problema al iniciar el pago. Por favor intenta de nuevo.",
                icon: "error",
                confirmButtonColor: "var(--primary)",
                customClass: {
                    popup: "rounded-[2rem]",
                }
            });
        } finally {
            setBookingLoading(false);
        }
    };

    if (loading) return (
        <div className="container mx-auto px-4 py-24 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
    );

    if (!activity) return (
        <div className="container mx-auto px-4 py-24 text-center">
            <h2 className="text-2xl font-bold">Actividad no encontrada</h2>
            <Link href="/activities" className="text-primary hover:underline mt-4 inline-block font-bold">Volver al catálogo</Link>
        </div>
    );

    const formattedDate = formatDate(activity.date, { dateStyle: 'full' });
    const totalPrice = activity.price * tickets;

    return (
        <div className="container mx-auto px-4 py-8 max-w-7xl">
            {/* Navigation & Header */}
            <Link href="/activities" className="flex items-center gap-2 text-primary font-bold mb-8 hover:-translate-x-2 transition-transform duration-300">
                <ChevronLeft className="w-5 h-5" />
                Volver a actividades
            </Link>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                {/* Main Content (Left) */}
                <div className="lg:col-span-8 space-y-10">
                    {/* Header Section */}
                    <div className="space-y-4">
                        <div className="flex flex-wrap gap-2">
                            <Badge className="bg-primary/10 text-primary border-none font-bold uppercase tracking-widest text-[10px] px-4">
                                {activity.type_display}
                            </Badge>
                            {activity.remaining_capacity <= 3 && activity.remaining_capacity > 0 && (
                                <Badge variant="destructive" className="font-bold border-none uppercase text-[10px] px-4 animate-pulse">
                                    ¡Pocos lugares disponibles!
                                </Badge>
                            )}
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black tracking-tighter leading-tight">
                            {activity.title}
                        </h1>
                        <div className="flex flex-wrap items-center gap-6 text-muted-foreground font-medium pt-2">
                            <div className="flex items-center gap-2">
                                <Calendar className="w-5 h-5 text-primary" />
                                {formattedDate}
                            </div>
                            <div className="flex items-center gap-2 border-l pl-6 border-border">
                                <Clock className="w-5 h-5 text-primary" />
                                {activity.time} ({activity.duration})
                            </div>
                        </div>
                    </div>

                    {/* Main Image Gallery Placeholder */}
                    <div className="relative aspect-video rounded-[3rem] overflow-hidden shadow-2xl group">
                        <Image
                            src={activity.image_url || "/placeholder-activity.jpg"}
                            alt={activity.title}
                            fill
                            className="object-cover transition-transform duration-[2s] group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                        <div className="absolute bottom-6 left-6 flex items-center gap-3">
                            <div className="bg-white/20 backdrop-blur-md rounded-2xl p-4 border border-white/30 text-white flex items-center gap-3">
                                <MapPin className="w-6 h-6 text-primary shadow-sm" />
                                <span className="font-black text-lg">{activity.location}</span>
                            </div>
                        </div>
                    </div>

                    {/* Secondary Gallery (if exists) */}
                    {activity.gallery && activity.gallery.length > 0 && (
                        <div className="grid grid-cols-3 gap-4">
                            {activity.gallery.map((img) => (
                                <div key={img.id} className="relative aspect-square rounded-2xl overflow-hidden animate-in fade-in duration-700">
                                    <Image src={img.url} alt={img.caption || ""} fill className="object-cover hover:scale-110 transition-all duration-500" />
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Description Section */}
                    <div className="space-y-6 pt-6">
                        <h2 className="text-2xl font-black flex items-center gap-3">
                            <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
                                <Star className="w-4 h-4 text-primary fill-primary" />
                            </div>
                            ¿Qué esperar de esta experiencia?
                        </h2>
                        <div
                            className="prose prose-lg dark:prose-invert font-medium text-muted-foreground max-w-none leading-relaxed"
                            dangerouslySetInnerHTML={{ __html: activity.description }}
                        />
                    </div>
                </div>

                {/* Booking Widget (Right) */}
                <div className="lg:col-span-4">
                    <div className="sticky top-24 space-y-6">
                        <div className="bg-card border-border/50 border-2 rounded-[2.5rem] p-8 shadow-xl space-y-8 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-2xl rounded-full" />

                            <div className="relative z-10 flex items-end justify-between">
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Precio por persona</p>
                                    <p className="text-4xl font-black text-primary">${activity.price}</p>
                                </div>
                                <div className="text-right">
                                    <div className="flex items-center gap-1 text-xs font-bold text-muted-foreground bg-muted p-2 rounded-xl">
                                        <Users className="w-3.5 h-3.5" />
                                        <span>{activity.remaining_capacity} disponibles</span>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <label className="text-sm font-black uppercase tracking-widest text-muted-foreground">Número de asistentes</label>
                                <div className="flex items-center justify-between bg-muted/50 p-2 rounded-2xl border border-border/50">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-12 w-12 rounded-xl hover:bg-background font-bold text-xl"
                                        onClick={() => setTickets(Math.max(1, tickets - 1))}
                                    > - </Button>
                                    <span className="text-2xl font-black">{tickets}</span>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-12 w-12 rounded-xl hover:bg-background font-bold text-xl"
                                        onClick={() => setTickets(Math.min(activity.remaining_capacity, tickets + 1))}
                                        disabled={tickets >= activity.remaining_capacity}
                                    > + </Button>
                                </div>
                            </div>

                            <div className="space-y-4 pt-4 border-t border-border/50">
                                <div className="flex justify-between items-center">
                                    <span className="text-muted-foreground font-bold italic">Total de la inversión</span>
                                    <span className="text-2xl font-black">${totalPrice}</span>
                                </div>
                                <Button
                                    className="w-full h-16 rounded-[1.5rem] text-lg font-black shadow-xl shadow-primary/20 group relative overflow-hidden transition-all duration-300"
                                    onClick={handleBooking}
                                    disabled={bookingLoading || activity.remaining_capacity === 0}
                                >
                                    {bookingLoading ? "Procesando..." : activity.remaining_capacity === 0 ? "Sin lugares" : "Reservar ahora"}
                                    <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-2 transition-transform duration-300" />
                                </Button>
                                <p className="text-[10px] text-center text-muted-foreground font-medium flex items-center justify-center gap-2">
                                    <ShieldCheck className="w-3 h-3" /> Pago seguro procesado por Stripe
                                </p>
                            </div>
                        </div>

                        {/* Extra info cards */}
                        <div className="bg-secondary/5 rounded-3xl p-6 border border-secondary/10 space-y-4">
                            <h4 className="font-extrabold flex items-center gap-2">
                                <Ticket className="w-5 h-5 text-secondary" />
                                Detalles de la entrada
                            </h4>
                            <ul className="space-y-2">
                                <li className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                    • Confirmación instantánea por correo
                                </li>
                                <li className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                    • Punto de reunión: entrada principal
                                </li>
                                <li className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                    • Se recomienda calzado cómodo
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
