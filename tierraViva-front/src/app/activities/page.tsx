"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getActivities } from "@/lib/api";
import { Activity } from "@/lib/types";
import ActivityCard from "@/components/activities/ActivityCard";
import NewsletterSection from "@/components/activities/NewsletterSection";
import { 
    Calendar, 
    Compass, 
    Star, 
    Sparkles, 
    Clock, 
    MapPin, 
    Users, 
    ShieldCheck, 
    Ticket,
    X
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { 
    Dialog, 
    DialogContent, 
    DialogHeader, 
    DialogTitle,
    DialogDescription
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";

export default function ActivitiesPage() {
    const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);

    const { data: activities = [], isLoading } = useQuery<Activity[]>({
        queryKey: ['activities'],
        queryFn: getActivities,
    });

    if (isLoading) {
        return (
            <div className="container mx-auto px-4 py-20 space-y-12">
                <Skeleton className="h-[400px] w-full rounded-[3rem]" />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {[1, 2, 3].map(i => (
                        <Skeleton key={i} className="h-96 w-full rounded-2xl" />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-12 space-y-20 min-h-screen relative">
            {/* Background Hand-Drawn Elements Placeholder */}
            <div className="absolute top-10 left-10 pointer-events-none opacity-10">
                <svg width="200" height="200" viewBox="0 0 200 200">
                    <path d="M20,100 Q60,20 100,100 T180,100" fill="none" stroke="currentColor" strokeWidth="2" className="sketch-stroke" />
                </svg>
            </div>

            {/* Hero Section - Sketch Style */}
            <header className="relative py-24 text-center rounded-[4rem] overflow-hidden bg-white border-4 border-[#0d0f36] shadow-[12px_12px_0px_0px_#0d0f36] dark:bg-card dark:border-primary/20 dark:shadow-none">                <div className="relative z-10 max-w-3xl mx-auto space-y-8 animate-in fade-in slide-in-from-top duration-1000">
                    <div className="flex items-center justify-center gap-2 mb-4">
                        <Compass className="w-12 h-12 text-primary" />
                    </div>
                    <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-[0.8]">
                        Explora la <span className="text-primary italic sketch-underline">Vida</span>
                    </h1>
                    <p className="text-xl md:text-2xl text-muted-foreground font-bold leading-relaxed px-4">
                        Conoce el santuario desde adentro. Tours educativos y talleres artesanales para reconectar con lo esencial.
                    </p>
                    
                    <div className="flex flex-wrap items-center justify-center gap-8 pt-4">
                        <div className="flex items-center gap-3 text-sm font-black uppercase tracking-widest">
                            <Star className="w-5 h-5 text-primary" /> Cupos Limitados
                        </div>
                        <div className="flex items-center gap-3 text-sm font-black uppercase tracking-widest">
                            <ShieldCheck className="w-5 h-5 text-primary" /> Guías Pro
                        </div>
                    </div>
                </div>
            </header>

            {/* Activities Grid */}
            <section className="space-y-16">
                <div className="flex flex-col md:flex-row justify-between items-end gap-6 border-b-2 border-border/30 pb-12">
                    <div className="space-y-4">
                        <h2 className="text-4xl md:text-5xl font-black italic tracking-tighter flex items-center gap-4">
                            <Calendar className="w-10 h-10 text-primary" />
                            Próximos Encuentros
                        </h2>
                        <p className="text-muted-foreground font-bold text-lg max-w-xl">
                            Reserva tu lugar en nuestras experiencias guiadas. Cada visita apoya directamente al rescate.
                        </p>
                    </div>
                    
                    <div className="flex gap-2">
                        <Button variant="outline" className="rounded-full font-black uppercase text-[10px] tracking-[0.2em] px-6">Todos</Button>
                        <Button variant="ghost" className="rounded-full font-black uppercase text-[10px] tracking-[0.2em] px-6">Tours</Button>
                        <Button variant="ghost" className="rounded-full font-black uppercase text-[10px] tracking-[0.2em] px-6">Talleres</Button>
                    </div>
                </div>

                {activities.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
                        {activities.map((activity, index) => (
                            <div key={activity.id} onClick={() => setSelectedActivity(activity)} className="cursor-pointer">
                                <ActivityCard activity={activity} index={index} />
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-40 bg-muted/20 rounded-[4rem] border-4 border-dashed border-[#0d0f36]/10">
                        <Compass className="w-24 h-24 text-muted-foreground mx-auto mb-8 opacity-20" />
                        <h3 className="text-3xl font-black italic tracking-tight mb-4">No hay expediciones abiertas</h3>
                        <p className="text-muted-foreground font-bold">Suscríbete para ser el primero en saber cuando abramos cupos.</p>
                    </div>
                )}
            </section>

            {/* Activity Detail Modal */}
            <Dialog open={!!selectedActivity} onOpenChange={(open) => !open && setSelectedActivity(null)}>
                <DialogContent className="max-w-6xl h-[90vh] p-0 overflow-hidden border-none rounded-[4rem] bg-background/98 backdrop-blur-2xl shadow-2xl">
                    <div className="h-full overflow-y-auto custom-scrollbar">
                        {selectedActivity && (
                            <div className="pb-24">
                                {/* Modal Hero */}
                                <div className="aspect-[21/9] relative w-full overflow-hidden">
                                    <img 
                                        src={selectedActivity.image_url} 
                                        className="w-full h-full object-cover"
                                        alt={selectedActivity.title}
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
                                    
                                    <div className="absolute bottom-12 left-12 right-12 space-y-6">
                                        <div className="flex flex-wrap gap-3">
                                            <Badge className="bg-primary hover:bg-primary font-black uppercase text-[10px] tracking-widest px-5 py-2 rounded-full">
                                                #{selectedActivity.type_display}
                                            </Badge>
                                            <Badge variant="secondary" className="bg-white/90 backdrop-blur-sm text-[#0d0f36] font-black uppercase text-[10px] tracking-widest px-5 py-2 rounded-full">
                                                <Users className="w-3 h-3 mr-2" /> Cupos: {selectedActivity.remaining_capacity}
                                            </Badge>
                                        </div>
                                        <DialogTitle className="text-5xl md:text-8xl font-black italic tracking-tighter text-foreground leading-[0.8] drop-shadow-sm">
                                            {selectedActivity.title}
                                        </DialogTitle>
                                    </div>
                                </div>

                                {/* Modal Content Container */}
                                <div className="max-w-5xl mx-auto px-12 py-16 grid grid-cols-1 lg:grid-cols-12 gap-16">
                                    {/* Left: Description & Gallery */}
                                    <div className="lg:col-span-8 space-y-16">
                                        <div 
                                            className="rich-text-content prose prose-2xl prose-p:font-bold prose-p:text-muted-foreground prose-headings:font-black prose-headings:italic dark:prose-invert max-w-none"
                                            dangerouslySetInnerHTML={{ __html: selectedActivity.description }}
                                        />

                                        {/* Gallery Support */}
                                        {selectedActivity.gallery && selectedActivity.gallery.length > 0 && (
                                            <div className="space-y-10 pt-16 border-t-2 border-border/30">
                                                <h3 className="text-3xl font-black flex items-center gap-3 italic">
                                                    <Sparkles className="w-8 h-8 text-primary" /> Crónicas Visuales
                                                </h3>
                                                <div className="grid grid-cols-2 gap-6">
                                                    {selectedActivity.gallery.map((img, i) => (
                                                        <div key={img.id} className="group aspect-square rounded-[2.5rem] overflow-hidden bg-muted border-2 border-border/20 shadow-xl">
                                                            <img 
                                                                src={img.url} 
                                                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                                                                alt={img.caption || ""} 
                                                            />
                                                            {img.caption && (
                                                                <div className="p-4 bg-background/90 text-[10px] font-black uppercase tracking-widest border-t border-border/10">
                                                                    {img.caption}
                                                                </div>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Right: Info & Booking */}
                                    <div className="lg:col-span-4 space-y-8">
                                        <div className="sticky top-8 space-y-6">
                                            <div className="p-8 rounded-[3rem] bg-accent/5 border-2 border-accent/10 space-y-8">
                                                <div className="space-y-6">
                                                    <h4 className="text-xs font-black uppercase tracking-[0.3em] text-accent/60 flex items-center gap-2">
                                                        <Clock className="w-4 h-4" /> Logística
                                                    </h4>
                                                    <div className="space-y-4 font-bold text-lg">
                                                        <div className="flex items-center gap-3">
                                                            <Calendar className="w-5 h-5 text-accent" />
                                                            {formatDate(selectedActivity.date, { dateStyle: 'long' })}
                                                        </div>
                                                        <div className="flex items-center gap-3">
                                                            <Clock className="w-5 h-5 text-accent" />
                                                            {selectedActivity.time.substring(0, 5)} hrs
                                                        </div>
                                                        <div className="flex items-center gap-3">
                                                            <MapPin className="w-5 h-5 text-accent" />
                                                            {selectedActivity.location}
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="pt-8 border-t border-accent/10">
                                                    <p className="text-xs font-black uppercase text-accent/60 mb-2">Inversión Final</p>
                                                    <p className="text-4xl font-black text-accent tracking-tighter">
                                                        ${selectedActivity.price}
                                                    </p>
                                                </div>

                                                <Button className="w-full h-16 rounded-[2rem] text-lg font-black bg-accent hover:bg-accent/90 shadow-xl shadow-accent/20">
                                                    <Ticket className="w-5 h-5 mr-3" /> Reservar Lugar
                                                </Button>
                                            </div>

                                            <div className="p-6 rounded-3xl bg-secondary/10 flex items-start gap-3">
                                                <ShieldCheck className="w-6 h-6 text-secondary-foreground shrink-0" />
                                                <p className="text-[10px] font-bold text-secondary-foreground/80 leading-relaxed uppercase tracking-wider">
                                                    Tu visita contribuye directamente al mantenimiento de los rescatados y proyectos de conservación.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>

            <NewsletterSection />
        </div>
    );
}
