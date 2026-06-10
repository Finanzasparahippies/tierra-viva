
"use client";

import Link from "next/link";
import { Animal } from "@/lib/types";
import { stripHtml, optimizeImage } from "@/lib/utils";
import { Heart, ShieldCheck, ArrowRight, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface AnimalCardProps {
    animal: Animal;
    index?: number;
}

const AnimalCard = ({ animal, index = 0 }: AnimalCardProps) => {
    return (
        <Link 
            href={`/animals/${animal.id}`} 
            className="group flex flex-col space-y-6 animate-in fade-in slide-in-from-bottom duration-1000 fill-mode-both hover-lift"
            style={{ animationDelay: `${index * 150}ms` }}
        >
            {/* Image Container */}
            <div className="aspect-[4/5] relative rounded-[3rem] overflow-hidden bg-card border-2 border-border/20 shadow-2xl transition-all duration-700">
                {animal.image_url ? (
                    <img
                        src={optimizeImage(animal.image_url)}
                        alt={animal.name}
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                    />
                ) : (
                    <div className="absolute inset-0 bg-primary/5 flex items-center justify-center">
                        <Heart className="w-16 h-16 text-primary/10" />
                    </div>
                )}
                
                {/* Status Badge */}
                {animal.is_adopted && (
                    <div className="absolute top-6 left-6 z-20">
                        <Badge className="bg-primary/90 backdrop-blur-md text-primary-foreground border-none px-4 py-2 rounded-full uppercase tracking-tighter text-[10px] font-black italic shadow-xl">
                            <Sparkles className="w-3 h-3 mr-2" /> Familia Encontrada
                        </Badge>
                    </div>
                )}

                {!animal.is_adopted && (
                    <div className="absolute top-6 left-6 z-20">
                        <Badge variant="secondary" className="bg-black/60 backdrop-blur-md text-white border-white/20 px-4 py-2 rounded-full uppercase tracking-tighter text-[10px] font-black italic">
                            <Heart className="w-3 h-3 mr-2 text-primary" /> Busca Padrino
                        </Badge>
                    </div>
                )}
                
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-700" />
                
                {/* Image Overlay Content */}
                <div className="absolute bottom-8 left-8 right-8">
                    <h3 className="text-3xl font-black text-white italic tracking-tighter leading-tight drop-shadow-md">
                        {animal.name}
                    </h3>
                    <p className="text-primary font-bold text-sm uppercase tracking-widest mt-1">
                        {animal.species_name || animal.species}
                    </p>
                </div>
            </div>

            {/* Bottom Content */}
            <div className="px-2 space-y-4">
                <p className="text-muted-foreground font-bold line-clamp-2 text-sm leading-relaxed">
                    {stripHtml(animal.description)}
                </p>
                
                <div className="flex items-center justify-between pt-4 border-t border-border/30">
                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary/60">
                        <ShieldCheck className="w-3.5 h-3.5" /> Protegido por TV
                    </div>
                    <div className="flex items-center gap-1 text-xs font-black italic text-primary group-hover:translate-x-1 transition-transform">
                        Ver Bio <ArrowRight className="w-4 h-4" />
                    </div>
                </div>
            </div>
        </Link>
    );
};

export default AnimalCard;
