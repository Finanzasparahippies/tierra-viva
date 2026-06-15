"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CheckCircle2, Calendar, Ticket, ArrowRight, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSearchParams } from "next/navigation";

import { Suspense } from "react";

function ActivitySuccessContent() {
    const searchParams = useSearchParams();
    const bookingId = searchParams.get('booking_id');

    return (
        <div className="container mx-auto px-4 py-24 max-w-2xl text-center">
            <div className="space-y-8 animate-in zoom-in duration-700">
                <div className="relative inline-block">
                    <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full" />
                    <CheckCircle2 className="w-24 h-24 text-primary relative z-10" />
                </div>

                <div className="space-y-4">
                    <h1 className="text-4xl font-black tracking-tighter">¡Reserva Confirmada!</h1>
                    <p className="text-xl text-muted-foreground font-medium italic">
                        Tu lugar en Tierra Viva está asegurado. Estamos emocionados de recibirte.
                    </p>
                </div>

                <div className="bg-card border-2 border-primary/10 rounded-[2.5rem] p-8 shadow-xl text-left space-y-6">
                    <div className="flex items-center gap-4 text-primary">
                        <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center">
                            <Ticket className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest opacity-60">ID de Reserva</p>
                            <p className="text-xl font-black">#{bookingId || 'TV-ACTIVITY'}</p>
                        </div>
                    </div>

                    <div className="space-y-4 pt-4 border-t border-border/50">
                        <div className="flex items-start gap-3">
                            <Mail className="w-5 h-5 text-primary mt-1" />
                            <p className="text-sm font-medium text-muted-foreground">
                                Te hemos enviado un correo electrónico con los detalles del punto de reunión y recomendaciones para tu visita.
                            </p>
                        </div>
                        <div className="flex items-start gap-3">
                            <Calendar className="w-5 h-5 text-primary mt-1" />
                            <p className="text-sm font-medium text-muted-foreground">
                                Recuerda llegar 15 minutos antes de la hora programada para el registro.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 pt-8">
                    <Link href="/dashboard" className="flex-1">
                        <Button variant="outline" className="w-full h-14 rounded-2xl font-bold border-2">
                            Mi Panel de Usuario
                        </Button>
                    </Link>
                    <Link href="/activities" className="flex-1">
                        <Button className="w-full h-14 rounded-2xl font-black shadow-lg shadow-primary/20">
                            Explorar Más <ArrowRight className="ml-2 w-5 h-5" />
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default function ActivitySuccessPage() {
    return (
        <Suspense fallback={
            <div className="container mx-auto px-4 py-24 max-w-2xl text-center">
                <p className="text-muted-foreground animate-pulse">Cargando confirmación...</p>
            </div>
        }>
            <ActivitySuccessContent />
        </Suspense>
    );
}
