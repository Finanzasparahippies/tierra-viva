"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getRanchUpdates } from "@/lib/api";
import { RanchUpdate } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import { BookOpen, Sparkles, MessageCircle, Heart, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UpdateCard } from "@/components/updates/UpdateCard";
import { RanchUpdateFilters } from "@/components/updates/RanchUpdateFilters";
import { 
    Dialog, 
    DialogContent, 
    DialogHeader, 
    DialogTitle,
    DialogDescription
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

export default function UpdatesPage() {
    const [filters, setFilters] = useState({ search: "", tag: "" });
    const [selectedUpdate, setSelectedUpdate] = useState<RanchUpdate | null>(null);

    const { data: updates = [], isLoading } = useQuery<RanchUpdate[]>({
        queryKey: ['ranch-updates', filters],
        queryFn: () => getRanchUpdates(filters),
    });

    const featuredUpdate = updates.length > 0 && !filters.search && !filters.tag ? updates[0] : null;
    const gridUpdates = featuredUpdate ? updates.slice(1) : updates;

    if (isLoading) {
        return (
            <div className="container mx-auto px-4 py-20 space-y-12">
                <Skeleton className="h-[500px] w-full rounded-[3.5rem]" />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
                    {[1, 2, 3, 4, 5, 6].map(i => (
                        <div key={i} className="space-y-4">
                            <Skeleton className="h-64 w-full rounded-[2.5rem]" />
                            <Skeleton className="h-6 w-3/4 rounded-full" />
                            <Skeleton className="h-10 w-full rounded-2xl" />
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-20 min-h-screen relative">
            {/* Background Decor */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 blur-[150px] -z-10 rounded-full animate-pulse" />
            <div className="absolute bottom-1/4 left-0 w-96 h-96 bg-secondary/5 blur-[120px] -z-10 rounded-full" />

            {/* Header */}
            <div className="max-w-4xl mx-auto text-center mb-16 space-y-6">
                <div className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-[0.3em] border border-primary/20">
                    <Sparkles className="w-3.5 h-3.5" /> Bitácora del Santuario
                </div>
                <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-[0.9] lg:text-9xl">
                    Diario <br />
                    <span className="text-primary italic sketch-underline">
                        de Vida
                    </span>
                </h1>
                <p className="text-xl text-muted-foreground font-medium max-w-2xl mx-auto pt-6 leading-relaxed">
                    Acompañanos en el día a día de nuestros rescatados. Cada historia es un testimonio de amor, resiliencia y esperanza.
                </p>
            </div>

            {/* Discovery Bar */}
            <div className="max-w-5xl mx-auto mb-20">
                <RanchUpdateFilters onFilterChange={setFilters} />
            </div>

            {/* Content Grid */}
            <div className="max-w-7xl mx-auto space-y-24">
                
                {/* Featured Story */}
                {featuredUpdate && (
                    <div onClick={() => setSelectedUpdate(featuredUpdate)} className="cursor-pointer">
                        <UpdateCard update={featuredUpdate} featured={true} />
                    </div>
                )}

                {/* Main Grid */}
                {gridUpdates.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-20">
                        {gridUpdates.map((update, index) => (
                            <div key={update.id} onClick={() => setSelectedUpdate(update)} className="cursor-pointer">
                                <UpdateCard update={update} index={index} />
                            </div>
                        ))}
                    </div>
                ) : (
                    !featuredUpdate && (
                        <div className="text-center py-40 bg-card/50 rounded-[4rem] border-2 border-dashed border-border/50 animate-in fade-in zoom-in duration-700">
                             <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-8">
                                <BookOpen className="w-12 h-12 text-primary" />
                             </div>
                             <h3 className="text-3xl font-black italic tracking-tight mb-4">No encontramos historias...</h3>
                             <p className="text-muted-foreground font-bold mb-8">Intenta con otros términos o explora todas las etiquetas.</p>
                             <Button 
                                variant="outline" 
                                className="h-14 px-8 rounded-2xl font-black border-2 border-primary/20 hover:border-primary/50 text-primary"
                                onClick={() => setFilters({ search: "", tag: "" })}
                             >
                                Ver todos los hilos
                             </Button>
                        </div>
                    )
                )}
            </div>

            {/* Detailed View Modal */}
            <Dialog open={!!selectedUpdate} onOpenChange={(open) => !open && setSelectedUpdate(null)}>
                <DialogContent className="max-w-6xl h-[90vh] p-0 overflow-hidden border-none rounded-[3.5rem] bg-background/95 backdrop-blur-2xl shadow-2xl">
                    <div className="h-full overflow-y-auto">
                        {selectedUpdate && (
                            <div className="pb-20">
                                {/* Modal Header / Hero */}
                                <div className="aspect-[21/9] relative w-full overflow-hidden">
                                    <img 
                                        src={selectedUpdate.image_url} 
                                        className="w-full h-full object-cover"
                                        alt={selectedUpdate.title}
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
                                    
                                    <div className="absolute bottom-12 left-12 right-12 space-y-4">
                                        <div className="flex flex-wrap gap-2">
                                            {selectedUpdate.tags?.map(tag => (
                                                <Badge key={tag.id} className="bg-primary hover:bg-primary font-black uppercase text-[10px] tracking-widest px-4 py-1">
                                                    #{tag.name}
                                                </Badge>
                                            ))}
                                        </div>
                                        <DialogTitle className="text-4xl md:text-7xl font-black italic tracking-tighter text-foreground leading-[0.8] drop-shadow-sm">
                                            {selectedUpdate.title}
                                        </DialogTitle>
                                    </div>
                                </div>

                                {/* Modal Body */}
                                <div className="max-w-4xl mx-auto px-12 py-12 space-y-12">
                                    <div 
                                        className="prose prose-2xl prose-p:font-medium prose-p:text-muted-foreground prose-headings:font-black prose-headings:italic dark:prose-invert max-w-none"
                                        dangerouslySetInnerHTML={{ __html: selectedUpdate.content }}
                                    />

                                    {/* Gallery in Modal */}
                                    {selectedUpdate.gallery && selectedUpdate.gallery.length > 0 && (
                                        <div className="space-y-8 pt-12 border-t border-border">
                                            <h3 className="text-2xl font-black flex items-center gap-2 italic">
                                                <Sparkles className="w-6 h-6 text-primary" /> Momentos Capturados
                                            </h3>
                                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                                {selectedUpdate.gallery.map((img, i) => (
                                                    <div key={img.id} className="aspect-square rounded-3xl overflow-hidden group relative">
                                                        <img src={img.url} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="" />
                                                        {img.caption && (
                                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity p-4 flex items-end">
                                                                <p className="text-white text-[10px] font-bold italic">{img.caption}</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Footer Actions */}
                                    <div className="flex items-center justify-between pt-12 border-t border-border mt-20">
                                        <div className="flex items-center gap-6">
                                            <Button variant="ghost" className="rounded-full gap-2 font-black hover:bg-primary/5 hover:text-primary">
                                                <Heart className="w-5 h-5" /> 2.4k
                                            </Button>
                                            <Button variant="ghost" className="rounded-full gap-2 font-black hover:bg-primary/5 hover:text-primary">
                                                <MessageCircle className="w-5 h-5" /> 128
                                            </Button>
                                        </div>
                                        <Button variant="secondary" className="rounded-full gap-2 font-black px-8">
                                            <Share2 className="w-4 h-4" /> Compartir Historia
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
