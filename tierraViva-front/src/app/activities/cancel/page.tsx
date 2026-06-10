"use client";

import Link from "next/link";
import { XCircle, HelpCircle, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ActivityCancelPage() {
    return (
        <div className="container mx-auto px-4 py-24 max-w-lg text-center space-y-10 group">
            <div className="relative inline-block animate-bounce duration-slow">
                <div className="absolute inset-0 bg-destructive/10 blur-3xl rounded-full" />
                <XCircle className="w-24 h-24 text-destructive relative z-10" />
            </div>

            <div className="space-y-4">
                <h1 className="text-3xl font-black tracking-tight">Proceso Cancelado</h1>
                <p className="text-muted-foreground font-medium">
                    No se realizó ningún cargo a tu cuenta. Puedes volver a intentarlo cuando estés listo o contactarnos si tienes dudas sobre el proceso de reserva.
                </p>
            </div>

            <div className="bg-muted p-8 rounded-[2.5rem] border border-border/50 text-left space-y-4">
                <div className="flex items-center gap-3 text-sm font-bold">
                    <HelpCircle className="w-5 h-5 text-primary" />
                    ¿Necesitas ayuda?
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                    Si tuviste problemas técnicos con el pago o tienes dudas sobre los horarios, nuestro equipo está listo para apoyarte. Escríbenos a <span className="text-primary hover:underline">contacto@tierraviva.org</span>
                </p>
            </div>

            <Link href="/activities" className="block">
                <Button variant="ghost" className="rounded-full gap-2 font-bold hover:bg-primary/5">
                    <ArrowLeft className="w-4 h-4" /> Volver al catálogo de actividades
                </Button>
            </Link>
        </div>
    );
}
