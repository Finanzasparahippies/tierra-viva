"use client";

import { useEffect, useState } from "react";
import { getUserBookings } from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { 
    Ticket, 
    Calendar, 
    Clock, 
    Users, 
    MapPin, 
    CheckCircle2, 
    XCircle,
    Info
} from "lucide-react";

interface BookingData {
    id: number;
    user: number;
    user_name: string;
    activity: number;
    activity_title: string;
    tickets: number;
    total_price: number;
    status: 'PENDING' | 'PAID' | 'CANCELLED' | 'REFUNDED';
    status_display: string;
    stripe_payment_intent?: string;
    created_at: string;
}

export default function BookingsPage() {
    const [bookings, setBookings] = useState<BookingData[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchBookings = async () => {
            try {
                const data = await getUserBookings();
                setBookings(data);
            } catch (error) {
                console.error("Error fetching user bookings:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchBookings();
    }, []);

    if (loading) {
        return (
            <div className="space-y-6">
                <Skeleton className="h-8 w-48 rounded-xl" />
                <div className="grid md:grid-cols-2 gap-6">
                    <Skeleton className="h-48 rounded-3xl" />
                    <Skeleton className="h-48 rounded-3xl" />
                </div>
            </div>
        );
    }

    if (bookings.length === 0) {
        return (
            <div className="text-center py-16 px-6 space-y-6 border border-dashed rounded-[2.5rem] bg-muted/5 flex flex-col items-center justify-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                    <Ticket className="w-8 h-8 text-primary" />
                </div>
                <div className="space-y-2 max-w-md">
                    <h2 className="text-2xl font-black text-foreground">No tienes reservaciones activas</h2>
                    <p className="text-muted-foreground text-sm">
                        Participa en nuestros talleres ecológicos, visitas guiadas y campamentos de reconexión. Al asistir, contribuyes directamente al sustento del santuario.
                    </p>
                </div>
                <Link href="/activities">
                    <Button className="rounded-2xl font-bold px-6 py-5 shadow-lg shadow-primary/20 transition-all hover:scale-105">
                        Explorar Actividades
                    </Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div>
                <h1 className="text-3xl font-black tracking-tight mb-2 text-foreground">Mis Actividades</h1>
                <p className="text-muted-foreground text-sm">Gestiona tus pases de acceso y detalles de las visitas.</p>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                {bookings.map((booking) => {
                    const bookingDate = new Date(booking.created_at).toLocaleDateString('es-MX', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                    });

                    const isPaid = booking.status === 'PAID';
                    const isCancelled = booking.status === 'CANCELLED' || booking.status === 'REFUNDED';

                    return (
                        <div key={booking.id} className="relative flex flex-col md:flex-row border border-border/80 rounded-[2rem] bg-card/40 backdrop-blur-sm overflow-hidden shadow-lg hover:border-primary/20 transition-all duration-300">
                            
                            {/* Ticket Main Portion */}
                            <div className="flex-1 p-6 md:p-8 flex flex-col justify-between space-y-6">
                                <div>
                                    <div className="flex justify-between items-start gap-4">
                                        <h3 className="text-xl md:text-2xl font-black tracking-tight text-foreground line-clamp-2">
                                            {booking.activity_title}
                                        </h3>
                                        {isPaid ? (
                                            <span className="shrink-0 bg-green-500/10 text-green-500 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider flex items-center gap-1">
                                                <CheckCircle2 className="w-3.5 h-3.5" /> Pagado
                                            </span>
                                        ) : isCancelled ? (
                                            <span className="shrink-0 bg-red-500/10 text-red-500 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider flex items-center gap-1">
                                                <XCircle className="w-3.5 h-3.5" /> Cancelado
                                            </span>
                                        ) : (
                                            <span className="shrink-0 bg-amber-500/10 text-amber-500 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider flex items-center gap-1 animate-pulse">
                                                <Clock className="w-3.5 h-3.5" /> Pendiente
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest mt-1">
                                        Reserva #{booking.id} • {bookingDate}
                                    </p>
                                </div>

                                <div className="grid grid-cols-2 gap-4 text-xs font-bold text-muted-foreground">
                                    <div className="flex items-center gap-2">
                                        <Users className="w-4 h-4 text-primary" />
                                        <span>{booking.tickets} {booking.tickets === 1 ? 'Persona' : 'Personas'}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <MapPin className="w-4 h-4 text-primary" />
                                        <span className="truncate">Santuario Principal</span>
                                    </div>
                                </div>

                                <div className="flex justify-between items-baseline pt-4 border-t border-border/40">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Total abonado</span>
                                    <span className="text-xl font-black text-primary">
                                        ${booking.total_price.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN
                                    </span>
                                </div>
                            </div>

                            {/* Ticket Divider/Perforation (Hidden on Mobile) */}
                            <div className="hidden md:flex flex-col items-center justify-between py-4 select-none pointer-events-none relative w-4 shrink-0">
                                <div className="-mt-6 w-5 h-5 rounded-full bg-background border border-border border-t-0 border-l-0 border-r-0 z-10"></div>
                                <div className="h-full border-l border-dashed border-border/80"></div>
                                <div className="-mb-6 w-5 h-5 rounded-full bg-background border border-border border-b-0 border-l-0 border-r-0 z-10"></div>
                            </div>

                            {/* QR/Pass Stub */}
                            <div className="p-6 md:p-8 md:w-48 bg-primary/5 flex flex-col items-center justify-center border-t md:border-t-0 md:border-l border-border/50 shrink-0">
                                {isPaid ? (
                                    <div className="flex flex-col items-center space-y-3">
                                        {/* Premium CSS-based QR representation */}
                                        <div className="w-24 h-24 bg-foreground p-2 rounded-2xl flex flex-col justify-between shadow-md group-hover:scale-105 transition-transform duration-300">
                                            <div className="grid grid-cols-4 gap-1 w-full h-full">
                                                <div className="bg-background rounded-[3px]"></div>
                                                <div className="bg-background rounded-[3px]"></div>
                                                <div className="bg-transparent"></div>
                                                <div className="bg-background rounded-[3px]"></div>
                                                <div className="bg-transparent"></div>
                                                <div className="bg-background rounded-[3px]"></div>
                                                <div className="bg-background rounded-[3px]"></div>
                                                <div className="bg-transparent"></div>
                                                <div className="bg-background rounded-[3px]"></div>
                                                <div className="bg-transparent"></div>
                                                <div className="bg-background rounded-[3px]"></div>
                                                <div className="bg-background rounded-[3px]"></div>
                                                <div className="bg-background rounded-[3px]"></div>
                                                <div className="bg-background rounded-[3px]"></div>
                                                <div className="bg-transparent"></div>
                                                <div className="bg-background rounded-[3px]"></div>
                                            </div>
                                        </div>
                                        <span className="text-[8px] font-black uppercase tracking-wider text-muted-foreground text-center">
                                            Pase de acceso digital
                                        </span>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center text-center space-y-2">
                                        <Info className="w-8 h-8 text-amber-500 animate-bounce" />
                                        <p className="text-[10px] text-muted-foreground font-bold leading-tight">
                                            {isCancelled ? "Pase cancelado" : "Espera el pago para generar el pase QR"}
                                        </p>
                                    </div>
                                )}
                            </div>

                        </div>
                    );
                })}
            </div>
        </div>
    );
}
