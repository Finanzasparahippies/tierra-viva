
import AnimalCard from "@/components/animals/AnimalCard";
export const dynamic = "force-dynamic";
import { getAnimals } from "@/lib/api";
import { Animal } from "@/lib/types";
import { Sparkles, HeartPulse } from "lucide-react";

export default async function AnimalsPage() {
    let animals: Animal[] = [];
    try {
        animals = await getAnimals();
    } catch (error) {
        console.error("Failed to fetch animals:", error);
    }
    
    return (
        <div className="container mx-auto px-4 py-20 min-h-screen relative overflow-hidden">
            {/* Background Decorative Glows */}
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/10 blur-[180px] -z-10 rounded-full animate-pulse" />
            <div className="absolute bottom-1/4 left-0 w-80 h-80 bg-accent/5 blur-[120px] -z-10 rounded-full" />

            {/* Cinematic Header */}
            <header className="max-w-4xl mx-auto text-center mb-24 space-y-8 animate-in fade-in slide-in-from-top duration-1000">
                <div className="inline-flex items-center gap-3 px-6 py-2.5 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-[0.4em] border border-primary/20 shadow-sm transition-all hover:bg-primary/20">
                    <HeartPulse className="w-4 h-4" /> Resguardo Tierra Viva
                </div>
                <h1 className="text-6xl md:text-8xl lg:text-9xl font-black tracking-tighter leading-[0.8] italic">
                    Nuestros <br />
                    <span className="text-primary relative inline-block">
                        Amigos
                        <svg className="absolute -bottom-2 left-0 w-full h-4 text-primary/30 -z-10" viewBox="0 0 100 10" preserveAspectRatio="none">
                            <path d="M0 10 Q 50 0 100 10" stroke="currentColor" strokeWidth="6" fill="transparent" />
                        </svg>
                    </span>
                </h1>
                <p className="text-xl md:text-2xl text-muted-foreground font-bold max-w-2xl mx-auto pt-8 leading-relaxed">
                    Cada rescate cuenta una historia de valentía. Conócelos, enamórate y decide formar parte de su camino a la sanación.
                </p>
            </header>

            {/* Discovery Grid */}
            <div className="max-w-7xl mx-auto">
                {animals.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-24">
                        {animals.map((animal, index) => (
                            <AnimalCard key={animal.id} animal={animal} index={index} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-40 bg-card/40 rounded-[4rem] border-2 border-dashed border-border/40 animate-in fade-in zoom-in duration-700">
                        <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-8">
                            <Sparkles className="w-12 h-12 text-primary" />
                        </div>
                        <h3 className="text-3xl font-black italic tracking-tight mb-4">El santuario está descansando...</h3>
                        <p className="text-muted-foreground font-bold">Vuelve pronto para conocer a nuevos amigos.</p>
                    </div>
                )}
            </div>

            {/* Bottom Call to Action */}
            <section className="mt-40 text-center animate-in fade-in slide-in-from-bottom duration-1000 delay-500 fill-mode-both">
                <div className="bg-[#0d0f36] text-[#f1f6ce] p-16 md:p-24 rounded-[4rem] shadow-2xl relative overflow-hidden group">
                    <div className="absolute top-0 left-0 w-full h-full bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                    <h2 className="text-4xl md:text-6xl font-black italic tracking-tighter mb-8 relative z-10">
                        ¿Listo para cambiar <span className="text-primary">una vida</span>?
                    </h2>
                    <p className="text-xl font-bold text-[#b9f1d6]/80 max-w-xl mx-auto mb-12 relative z-10">
                        Tu apoyo mensual garantiza alimento, medicina y un hogar digno para los que no tienen voz.
                    </p>
                    <div className="relative z-10">
                         {/* Button logic would go here if specific redirection needed */}
                    </div>
                </div>
            </section>
        </div>
    );
}
