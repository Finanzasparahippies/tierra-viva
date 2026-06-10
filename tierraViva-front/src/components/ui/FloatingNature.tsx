import React from "react";

// 1. Flor original
const FlowerIcon = ({ className, style }: { className?: string, style?: React.CSSProperties }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} style={style}>
    <path d="M12 2C9.24 2 7 4.24 7 7C7 9.76 9.24 12 12 12C14.76 12 17 9.76 17 7C17 4.24 14.76 2 12 2ZM12 22C14.76 22 17 19.76 17 17C17 14.24 14.76 12 12 12C9.24 12 7 14.24 7 17C7 19.76 9.24 22 12 22ZM2 12C2 14.76 4.24 17 7 17C9.76 17 12 14.76 12 12C12 9.24 9.76 7 7 7C4.24 7 2 9.24 2 12ZM22 12C22 9.24 19.76 7 17 7C14.24 7 12 9.24 12 12C12 14.76 14.24 17 17 17C19.76 17 22 14.76 22 12ZM12 14.5C10.62 14.5 9.5 13.38 9.5 12C9.5 10.62 10.62 9.5 12 9.5C13.38 9.5 14.5 10.62 14.5 12C14.5 13.38 13.38 14.5 12 14.5Z" />
  </svg>
);

// 2. Hoja (Leaf)
const LeafIcon = ({ className, style }: { className?: string, style?: React.CSSProperties }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} style={style}>
    <path d="M17.5 2C13.78 2 10.42 3.5 8 5.88L2 11.88V22H12.12L18.12 16C20.5 13.58 22 10.22 22 6.5V2H17.5ZM17.29 13.71L10.29 20.71L8.88 19.29L15.88 12.29L17.29 13.71Z" />
  </svg>
);

// 3. Hexágono (Panal/Naturaleza)
const HexagonIcon = ({ className, style }: { className?: string, style?: React.CSSProperties }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} style={style}>
    <path d="M12 2.5L20 7V17L12 21.5L4 17V7L12 2.5Z" />
  </svg>
);

// 4. Gota de Agua
const DropIcon = ({ className, style }: { className?: string, style?: React.CSSProperties }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} style={style}>
    <path d="M12 2.5s-8 7-8 11 a8 8 0 1 0 16 0c0-4-8-11-8-11z" />
  </svg>
);

// 5. Cactus Sahuaro
const CactusIcon = ({ className, style }: { className?: string, style?: React.CSSProperties }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} style={style}>
    <rect x="10" y="3" width="4" height="19" rx="2" />
    <path d="M6 9v4c0 1.7 1.3 3 3 3h1v-4H9c-.6 0-1-.4-1-1V9c0-.6-.4-1-1-1s-1 .4-1 1z" />
    <path d="M18 6v5c0 1.7-1.3 3-3 3h-1v-4h1c.6 0 1-.4 1-1V6c0-.6.4-1 1-1s1 .4 1 1z" />
  </svg>
);

// 6. Abejita
const BeeIcon = ({ className, style }: { className?: string, style?: React.CSSProperties }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} style={style}>
    {/* Ala Izquierda */}
    <ellipse cx="9" cy="8" rx="3" ry="5" transform="rotate(-30 9 8)" opacity="0.6" />
    {/* Ala Derecha */}
    <ellipse cx="14" cy="8" rx="3" ry="5" transform="rotate(30 14 8)" opacity="0.6" />
    {/* Cuerpo (Abeja gorda) */}
    <ellipse cx="12" cy="13" rx="6" ry="4" fill="currentColor" />
    {/* Rayas */}
    <path d="M9.5 9.5v7M12.5 9.5v7" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
    {/* Aguijón */}
    <polygon points="18,13 21,13 18,14.5" />
    {/* Cabeza (Ojo) */}
    <circle cx="8" cy="13" r="1" fill="white" />
  </svg>
);

// 7. Vaca (Abstracta / Minimalista)
const CowIcon = ({ className, style }: { className?: string, style?: React.CSSProperties }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} style={style}>
    {/* Osico / Cara Inferior */}
    <path d="M6 14h12v3c0 2-3 4-6 4s-6-2-6-4v-3z" fillOpacity="0.75" />
    {/* Orificios Nariz */}
    <circle cx="9" cy="17" r="1.5" fill="white" />
    <circle cx="15" cy="17" r="1.5" fill="white" />
    {/* Forma de cabeza */}
    <path d="M7 8h10v6H7z" />
    {/* Ojos */}
    <circle cx="9.5" cy="11" r="1" fill="white" />
    <circle cx="14.5" cy="11" r="1" fill="white" />
    {/* Orejas */}
    <path d="M7 8c-2-1-4-1-4 2s3 2 4-2 M17 8c2-1 4-1 4 2s-3 2-4-2" />
    {/* Cuernos */}
    <path d="M7 8c0-2 1-3 2-4M17 8c0-2-1-3-2-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none" />
  </svg>
);


export default function FloatingNature() {
  return (
    <div className="fixed inset-0 pointer-events-none z-[-1] overflow-hidden">
      {/* Grupo 1: Flores y Plantas */}
      <FlowerIcon className="absolute left-[5%] opacity-0 w-24 h-24 text-primary animate-float" style={{ animationDelay: '0s' }} />
      <LeafIcon className="absolute left-[15%] opacity-0 w-16 h-16 text-secondary animate-float-slow" style={{ animationDelay: '7s' }} />
      <CactusIcon className="absolute left-[30%] opacity-0 w-32 h-32 text-destructive animate-float-reverse" style={{ animationDelay: '2s' }} />
      <LeafIcon className="absolute left-[65%] opacity-0 w-14 h-14 text-primary animate-float" style={{ animationDelay: '12s' }} />
      <CactusIcon className="absolute left-[75%] opacity-0 w-20 h-20 text-accent animate-float-fast" style={{ animationDelay: '5s' }} />
      
      {/* Grupo 2: Animales y Rancho */}
      <BeeIcon className="absolute left-[20%] opacity-0 w-14 h-14 text-accent animate-float-fast" style={{ animationDelay: '3s' }} />
      <CowIcon className="absolute left-[40%] opacity-0 w-28 h-28 text-muted-foreground/30 animate-float-slow" style={{ animationDelay: '15s' }} />
      <BeeIcon className="absolute left-[60%] opacity-0 w-12 h-12 text-destructive animate-float" style={{ animationDelay: '8s' }} />
      <CowIcon className="absolute left-[85%] opacity-0 w-24 h-24 text-primary/40 animate-float-reverse" style={{ animationDelay: '10s' }} />

      {/* Grupo 3: Elementos adicionales (Gotas, Hexagonos) */}
      <DropIcon className="absolute left-[10%] opacity-0 w-10 h-10 text-secondary animate-float-reverse" style={{ animationDelay: '18s' }} />
      <HexagonIcon className="absolute left-[25%] opacity-0 w-16 h-16 text-primary/20 animate-float" style={{ animationDelay: '4s' }} />
      <DropIcon className="absolute left-[45%] opacity-0 w-8 h-8 text-primary animate-float-fast" style={{ animationDelay: '22s' }} />
      <HexagonIcon className="absolute left-[55%] opacity-0 w-32 h-32 text-secondary/30 animate-float-slow" style={{ animationDelay: '14s' }} />
      <DropIcon className="absolute left-[80%] opacity-0 w-12 h-12 text-destructive animate-float" style={{ animationDelay: '6s' }} />
      <DropIcon className="absolute left-[90%] opacity-0 w-16 h-16 text-accent animate-float-reverse" style={{ animationDelay: '20s' }} />
    </div>
  );
}
