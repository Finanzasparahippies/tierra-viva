"use client";

import { useEffect, useState } from "react";
import { getUserRescues } from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { 
    ShieldAlert, 
    Calendar, 
    MapPin, 
    CheckCircle2, 
    Clock, 
    CalendarDays, 
    XCircle,
    PlusCircle,
    Eye
} from "lucide-react";

interface RescueData {
    id: number;
    user?: number;
    email?: string;
    animal_type: string;
    animal_type_display: string;
    other_species?: string;
    description: string;
    latitude: number;
    longitude: number;
    address: string;
    phone: string;
    status: 'PENDING_APPROVAL' | 'PENDING_RESCUE' | 'SCHEDULED' | 'RESCUED' | 'CANCELLED';
    status_display: string;
    photo?: string;
    created_at: string;
    updated_at: string;
}

export default function RescuesPage() {
    const [rescues, setRescues] = useState<RescueData[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRescues = async () => {
            try {
                const data = await getUserRescues();
                setRescues(data);
            } catch (error) {
                console.error("Error fetching user rescues:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchRescues();
    }, []);

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <Skeleton className="h-8 w-48 rounded-xl" />
                    <Skeleton className="h-10 w-36 rounded-xl" />
                </div>
                <div className="grid sm:grid-cols-2 gap-6">
                    <Skeleton className="h-44 rounded-3xl" />
                    <Skeleton className="h-44 rounded-3xl" />
                </div>
            </div>
        );
    }

    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'RESCUED':
                return { bg: 'bg-green-500/10 border-green-500/20 text-green-500', icon: CheckCircle2 };
            case 'PENDING_APPROVAL':
                return { bg: 'bg-yellow-500/10 border-yellow-500/20 text-yellow-500', icon: Clock };
            case 'PENDING_RESCUE':
                return { bg: 'bg-orange-500/10 border-orange-500/20 text-orange-500', icon: ShieldAlert };
            case 'SCHEDULED':
                return { bg: 'bg-blue-500/10 border-blue-500/20 text-blue-500', icon: CalendarDays };
            default:
                return { bg: 'bg-red-500/10 border-red-500/20 text-red-500', icon: XCircle };
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black tracking-tight mb-2 text-foreground">Mis Reportes de Rescate</h1>
                    <p className="text-muted-foreground text-sm">Monitorea el progreso de tus reportes de fauna silvestre o abejas.</p>
                </div>
                <Link href="/rescue">
                    <Button className="rounded-2xl font-bold py-5 px-5 gap-2 shadow-lg shadow-primary/20 hover:scale-105 transition-all">
                        <PlusCircle className="w-4 h-4" /> Reportar Emergencia
                    </Button>
                </Link>
            </div>

            {rescues.length === 0 ? (
                <div className="text-center py-16 px-6 space-y-6 border border-dashed rounded-[2.5rem] bg-muted/5 flex flex-col items-center justify-center">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                        <ShieldAlert className="w-8 h-8 text-primary" />
                    </div>
                    <div className="space-y-2 max-w-md">
                        <h2 className="text-2xl font-black text-foreground">Sin reportes registrados</h2>
                        <p className="text-muted-foreground text-sm">
                            Aquí aparecerá el historial de reportes de rescate que realices en el sitio. Puedes registrar enjambres de abejas, animales heridos o fauna silvestre en peligro.
                        </p>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {rescues.map((rescue) => {
                        const formattedDate = new Date(rescue.created_at).toLocaleDateString('es-MX', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                        });

                        const { bg, icon: StatusIcon } = getStatusStyle(rescue.status);

                        return (
                            <div key={rescue.id} className="border border-border/80 rounded-[2rem] bg-card/45 backdrop-blur-sm p-6 shadow-lg hover:border-primary/20 transition-all duration-300 flex flex-col justify-between space-y-6 group">
                                <div className="space-y-4">
                                    <div className="flex justify-between items-start gap-4">
                                        <div>
                                            <span className="text-[10px] font-black uppercase tracking-widest text-primary">REPORTE #{rescue.id}</span>
                                            <h3 className="text-xl font-black text-foreground mt-0.5">
                                                Rescate de {rescue.animal_type_display}
                                                {rescue.other_species && <span className="text-sm font-bold text-muted-foreground block">({rescue.other_species})</span>}
                                            </h3>
                                        </div>
                                        <span className={`shrink-0 border px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider flex items-center gap-1.5 ${bg}`}>
                                            <StatusIcon className="w-3.5 h-3.5" />
                                            {rescue.status_display}
                                        </span>
                                    </div>

                                    <p className="text-sm text-muted-foreground font-medium line-clamp-3">
                                        {rescue.description}
                                    </p>
                                </div>

                                <div className="space-y-3 pt-4 border-t border-border/40 text-xs font-bold text-muted-foreground">
                                    <div className="flex items-center gap-2">
                                        <Calendar className="w-4 h-4 text-primary" />
                                        <span>Reportado el: <span className="text-foreground font-black">{formattedDate}</span></span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <MapPin className="w-4 h-4 text-primary shrink-0" />
                                        <span className="truncate text-foreground font-black">{rescue.address}</span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
