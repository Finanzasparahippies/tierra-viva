import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function CancelPage() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[70vh] text-center space-y-6 bg-white/50 backdrop-blur-sm rounded-2xl p-8 max-w-2xl mx-auto shadow-sm border mt-10 relative z-10">
            <div className="w-24 h-24 bg-destructive/20 text-destructive rounded-full flex items-center justify-center text-5xl mb-4 shadow-inner">
                ✕
            </div>
            <h1 className="text-4xl font-bold text-destructive drop-shadow-sm">Pago Cancelado</h1>
            <p className="text-lg text-muted-foreground max-w-md">
                El proceso de pago en Stripe ha sido cancelado o interrumpido. No te preocupes, no se ha realizado ningún cargo a tu tarjeta.
            </p>
            <Link href="/animals">
                <Button size="lg" variant="outline" className="mt-6 rounded-full font-bold">Intentarlo de nuevo</Button>
            </Link>
        </div>
    );
}
