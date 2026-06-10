
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, Heart, Store } from "lucide-react";

export default function Home() {
  return (
    <div className="space-y-40 pb-40">
      {/* Cinematic Hero Section - Monochrome Fusion Style */}
      <section className="relative min-h-[90vh] flex flex-col items-center justify-center text-center px-6 overflow-hidden bg-white dark:bg-[#0d0f36]">
        {/* Background Sketch Decorative Elements */}
        <div className="absolute inset-0 pointer-events-none opacity-5">
           <svg width="100%" height="100%" className="absolute top-0 left-0">
              <path d="M-100,200 Q400,0 900,400 T1800,200" fill="none" stroke="#69d2cd" strokeWidth="2" className="sketch-stroke" />
              <path d="M-200,600 Q500,800 1200,400" fill="none" stroke="#294380" strokeWidth="1" className="sketch-stroke" style={{ animationDelay: '0.5s' }} />
           </svg>
        </div>

        <div className="relative z-10 max-w-6xl space-y-12 animate-in fade-in slide-in-from-bottom-12 duration-1000">
          <div className="inline-flex items-center gap-3 px-6 py-2 rounded-full border-2 border-[#0d0f36] bg-white text-[#0d0f36] text-[10px] font-black uppercase tracking-[0.4em] shadow-[4px_4px_0px_0px_#69d2cd]">
            <Sparkles className="w-4 h-4 text-primary" /> Santuario Tierra Viva
          </div>
          
          <h1 className="text-[12vw] md:text-[10vw] font-black tracking-tighter leading-[0.75] italic text-[#0d0f36] dark:text-white">
            Salvaguarda <br /> 
            <span className="text-primary sketch-underline">la Vida</span>
          </h1>
          
          <p className="text-2xl md:text-3xl text-muted-foreground max-w-2xl mx-auto leading-tight font-bold pt-6">
            Conectando corazones con la vida silvestre. Adopta con amor, apadrina con generosidad y apoya el comercio consciente.
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-8 pt-12">
            <Link href="/animals">
              <Button size="lg" className="h-20 px-12 rounded-[2rem] text-xl shadow-[8px_8px_0px_0px_#0d0f36] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all">
                <Heart className="w-6 h-6 mr-3" /> Cuidar un Animal
              </Button>
            </Link>
            <Link href="/shop">
              <Button variant="outline" size="lg" className="h-20 px-12 rounded-[2rem] text-xl shadow-[8px_8px_0px_0px_#69d2cd] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all">
                <Store className="w-6 h-6 mr-3" /> Tienda Solidaria
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Value Proposition - Professional Grid */}
      <section className="container mx-auto px-6 animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-300 fill-mode-both">
        <div className="flex flex-col md:flex-row items-center justify-between gap-12 mb-24 border-b-2 border-border/30 pb-12">
            <h2 className="text-5xl md:text-7xl font-black tracking-tighter italic leading-none max-w-xl">
               Nuestra Misión <span className="text-primary">Tierra Viva</span>
            </h2>
            <p className="text-xl text-muted-foreground font-bold max-w-md leading-relaxed">
               Creamos un ecosistema de apoyo donde cada acción genera un impacto real en la naturaleza.
            </p>
        </div>

        <div className="grid md:grid-cols-3 gap-12">
          {[
            { title: "Rescate Animal", desc: "Damos una segunda oportunidad a quienes más lo necesitan.", icon: "🐾", accent: "#69d2cd" },
            { title: "Comercio Justo", desc: "Fortalecemos la economía local con productos orgánicos.", icon: "🌾", accent: "#294380" },
            { title: "Sostenibilidad", desc: "Promovemos un estilo de vida consciente y respetuoso.", icon: "🍃", accent: "#b9f1d6" }
          ].map((item, i) => (
            <div key={i} className="group relative p-12 border-4 border-[#0d0f36] rounded-[4rem] bg-white shadow-[12px_12px_0px_0px_#0d0f36] hover:translate-x-2 hover:translate-y-2 hover:shadow-none transition-all duration-500">
              <div className="text-7xl mb-10 grayscale group-hover:grayscale-0 transition-all duration-500 transform group-hover:scale-110">
                {item.icon}
              </div>
              <h3 className="text-3xl font-black italic tracking-tighter mb-4">{item.title}</h3>
              <p className="text-muted-foreground font-bold leading-tight text-xl mb-8">
                {item.desc}
              </p>
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                 <ArrowRight className="w-6 h-6" />
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
