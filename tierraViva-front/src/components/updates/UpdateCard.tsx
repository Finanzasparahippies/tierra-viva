"use client";

import { RanchUpdate } from "@/lib/types";
import { optimizeImage, formatDate } from "@/lib/utils";
import { Calendar, Lock, User, Tag, ChevronRight, Heart } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface UpdateCardProps {
    update: RanchUpdate;
    index?: number;
    featured?: boolean;
}

export function UpdateCard({ update, index = 0, featured = false }: UpdateCardProps) {
    const formattedDate = formatDate(update.created_at);

    if (featured) {
        return (
            <div 
                className="group relative bg-card rounded-[3.5rem] overflow-hidden border border-border/50 shadow-2xl hover-lift animate-in fade-in slide-in-from-bottom duration-1000 fill-mode-both"
                style={{ animationDelay: `${index * 150}ms` }}
            >
                <div className="flex flex-col lg:flex-row h-full">
                    {/* Hero Image */}
                    <div className="lg:w-3/5 relative aspect-square lg:aspect-auto min-h-[400px]">
                        {update.image_url ? (
                            <img 
                                src={optimizeImage(update.image_url)} 
                                alt={update.title}
                                className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                            />
                        ) : (
                            <div className="absolute inset-0 bg-primary/5 flex items-center justify-center">
                                <Heart className="w-20 h-20 text-primary/10" />
                            </div>
                        )}
                        
                        {update.is_locked && (
                            <div className="absolute top-8 left-8 z-20">
                                <Badge variant="secondary" className="bg-black/60 backdrop-blur-md text-white border-white/20 px-4 py-2 rounded-full uppercase tracking-tighter text-[10px] font-black italic">
                                    <Lock className="w-3 h-3 mr-2" /> Contenido Exclusivo
                                </Badge>
                            </div>
                        )}
                    </div>

                    {/* Hero Content */}
                    <div className="lg:w-2/5 p-12 lg:p-16 flex flex-col justify-center space-y-8">
                        <div className="space-y-4">
                            <div className="flex flex-wrap gap-2">
                                {update.tags?.map(tag => (
                                    <span key={tag.id} className="text-[10px] font-black uppercase tracking-widest text-primary/60">
                                        #{tag.name}
                                    </span>
                                ))}
                            </div>
                            <h2 className="text-4xl lg:text-5xl font-black tracking-tight leading-tight group-hover:text-primary transition-colors italic">
                                {update.title}
                            </h2>
                        </div>

                        <p className="text-xl text-muted-foreground leading-relaxed line-clamp-4 font-medium">
                            {update.is_locked ? update.excerpt : update.excerpt}
                        </p>

                        <div className="flex items-center gap-6 text-sm font-bold text-muted-foreground pt-4 border-t border-border/50">
                            <span className="flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-primary" /> {formattedDate}
                            </span>
                        </div>

                        <Button className="w-full h-14 rounded-2xl font-black shadow-lg shadow-primary/20 group/btn bg-primary hover:bg-primary/90">
                            Continuar leyendo <ChevronRight className="w-4 h-4 ml-2 transition-transform group-hover/btn:translate-x-1" />
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div 
            className="group flex flex-col space-y-6 animate-in fade-in slide-in-from-bottom duration-1000 fill-mode-both hover-lift"
            style={{ animationDelay: `${index * 150}ms` }}
        >
            {/* Image Container */}
            <div className="aspect-[4/3] relative rounded-[2.5rem] overflow-hidden bg-card border border-border/40 shadow-xl group-hover:shadow-primary/5 transition-all duration-700">
                {update.image_url ? (
                    <img 
                        src={optimizeImage(update.image_url)} 
                        alt={update.title}
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                ) : (
                    <div className="absolute inset-0 bg-primary/5 flex items-center justify-center">
                        <Heart className="w-12 h-12 text-primary/10" />
                    </div>
                )}
                
                {update.is_locked && (
                    <div className="absolute top-6 left-6 z-20">
                        <Badge variant="secondary" className="bg-black/60 backdrop-blur-md text-white border-white/20 px-3 py-1 rounded-full uppercase tracking-tighter text-[9px] font-black italic">
                            <Lock className="w-3 h-3 mr-1.5" /> Exclusivo
                        </Badge>
                    </div>
                )}
                
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
            </div>

            {/* Content Container */}
            <div className="space-y-4 px-2">
                <div className="flex flex-wrap gap-2">
                    {update.tags?.map(tag => (
                        <span key={tag.id} className="text-[9px] font-black uppercase tracking-widest text-primary/60">
                            #{tag.name}
                        </span>
                    ))}
                    {(!update.tags || update.tags.length === 0) && (
                        <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/40">
                             #Bitacora
                        </span>
                    )}
                </div>
                
                <div className="space-y-2">
                    <h3 className="text-2xl font-black tracking-tight leading-tight group-hover:text-primary transition-colors line-clamp-2 italic">
                        {update.title}
                    </h3>
                    <p className="text-muted-foreground font-medium line-clamp-2 text-sm leading-relaxed">
                        {update.excerpt}
                    </p>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-border/30">
                    <div className="flex items-center gap-2 text-[11px] font-bold text-muted-foreground/60 uppercase tracking-wider">
                        <Calendar className="w-3 h-3 text-primary" /> {formattedDate}
                    </div>
                    <Button variant="ghost" size="sm" className="h-8 rounded-full font-black text-primary hover:bg-primary/10">
                        Leer <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                </div>
            </div>
        </div>
    );
}
