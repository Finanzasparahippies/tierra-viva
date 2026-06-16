"use client";

import { useEffect, useState } from "react";
import { getUserSponsorships } from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { 
    Heart, 
    Calendar, 
    DollarSign, 
    CheckCircle2, 
    Sparkles, 
    BookOpen 
} from "lucide-react";

interface SponsorshipData {
    id: number;
    user: number;
    animal: number | null;
    animal_name: string;
    animal_image_url?: string;
    tier: number;
    tier_name: string;
    tier_price: number;
    billing_cycle: "MONTHLY" | "ANNUAL";
    amount: number;
    active: boolean;
    start_date: string;
}

export default function SponsorshipsPage() {
    const [sponsorships, setSponsorships] = useState<SponsorshipData[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSponsorships = async () => {
            try {
                const data = await getUserSponsorships();
                setSponsorships(data);
            } catch (error) {
                console.error("Error fetching user sponsorships:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchSponsorships();
    }, []);

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="space-y-2">
                    <Skeleton className="h-8 w-48 rounded-xl" />
                    <Skeleton className="h-4 w-72 rounded-xl" />
                </div>
                <div className="grid md:grid-cols-2 gap-6">
                    <Skeleton className="h-64 rounded-3xl" />
                    <Skeleton className="h-64 rounded-3xl" />
                </div>
            </div>
        );
    }

    if (sponsorships.length === 0) {
        return (
            <div className="text-center py-16 px-6 space-y-6 border border-dashed rounded-[2.5rem] bg-muted/5 flex flex-col items-center justify-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                    <Heart className="w-8 h-8 animate-pulse text-primary" />
                </div>
                <div className="space-y-2 max-w-md">
                    <h2 className="text-2xl font-black text-foreground">No tienes apadrinamientos activos</h2>
                    <p className="text-muted-foreground text-sm">
                        Al apadrinar un animal en Tierra Viva, financias su alimentación, cuidados veterinarios y hábitat. Además obtienes acceso a fotos y videos exclusivos de su día a día.
                    </p>
                </div>
                <Link href="/animals">
                    <Button className="rounded-2xl font-bold px-6 py-5 shadow-lg shadow-primary/20 transition-all hover:scale-105">
                        Ver animales para apadrinar
                    </Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div>
                <h1 className="text-3xl font-black tracking-tight mb-2 text-foreground">Mis Apadrinamientos</h1>
                <p className="text-muted-foreground text-sm">Gestiona tus animales apadrinados y revisa tus aportaciones activas.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {sponsorships.map((sponsorship) => {
                    const formattedDate = new Date(sponsorship.start_date).toLocaleDateString('es-MX', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                    });

                    return (
                        <div key={sponsorship.id} className="border border-border/80 rounded-[2rem] bg-card/45 backdrop-blur-sm overflow-hidden flex flex-col shadow-lg hover:border-primary/20 transition-all duration-300 group">
                            {/* Visual Image / Placeholder */}
                            <div className="h-44 w-full bg-muted relative overflow-hidden">
                                {sponsorship.animal_image_url ? (
                                    <img 
                                        src={sponsorship.animal_image_url} 
                                        alt={sponsorship.animal_name} 
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                    />
                                ) : (
                                    <div className="w-full h-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                                        <Heart className="w-12 h-12 text-primary opacity-60" />
                                    </div>
                                )}
                                <div className="absolute top-4 left-4 bg-background/80 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider text-primary border border-primary/10 flex items-center gap-1 shadow-md">
                                    <Sparkles className="w-3.5 h-3.5" /> {sponsorship.tier_name}
                                </div>
                                {sponsorship.active && (
                                    <div className="absolute top-4 right-4 bg-green-500/90 backdrop-blur-md px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider text-white flex items-center gap-1 shadow-md">
                                        <CheckCircle2 className="w-3 h-3" /> Activo
                                    </div>
                                )}
                            </div>

                            {/* Details body */}
                            <div className="p-6 flex-1 flex flex-col justify-between space-y-6">
                                <div>
                                    <h3 className="text-2xl font-black text-foreground">{sponsorship.animal_name || "Apoyo General al Rancho"}</h3>
                                    
                                    <div className="mt-4 space-y-2.5 text-xs text-muted-foreground font-bold">
                                        <div className="flex items-center gap-2">
                                            <Calendar className="w-4 h-4 text-primary" />
                                            <span>Fecha de Inicio: <span className="text-foreground font-black">{formattedDate}</span></span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <DollarSign className="w-4 h-4 text-primary" />
                                            <span>Aportación: <span className="text-foreground font-black">${sponsorship.amount.toLocaleString('es-MX')} MXN ({sponsorship.billing_cycle === 'ANNUAL' ? 'Anual' : 'Mensual'})</span></span>
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-border/50 flex gap-4">
                                    {sponsorship.animal && (
                                        <Link href={`/animals`} className="flex-1">
                                            <Button variant="outline" className="w-full rounded-xl py-5 font-bold gap-2 text-xs">
                                                Ver Perfil
                                            </Button>
                                        </Link>
                                    )}
                                    <Link href="/dashboard" className="flex-1">
                                        <Button className="w-full rounded-xl py-5 font-bold gap-2 text-xs">
                                            <BookOpen className="w-4 h-4" /> Bitácora
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
