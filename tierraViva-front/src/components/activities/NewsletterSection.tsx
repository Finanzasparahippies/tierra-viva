"use client";

import { useState } from "react";
import { subscribeNewsletter } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import { Send, Sparkles } from "lucide-react";

const MySwal = withReactContent(Swal);

const NewsletterSection = () => {
    const [email, setEmail] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleSubscribe = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!email) {
            toast("Por favor ingresa un correo electrónico", "warning");
            return;
        }

        setIsLoading(true);
        try {
            await subscribeNewsletter(email);
            MySwal.fire({
                title: <span className="text-2xl font-black italic tracking-tighter">¡Ya eres parte!</span>,
                html: <p className="font-bold text-muted-foreground leading-relaxed">Te avisaremos en cuanto tengamos nuevas expediciones y talleres.</p>,
                icon: "success",
                confirmButtonColor: "#69d2cd",
                customClass: {
                    popup: "rounded-[3rem] border-4 border-[#0d0f36] shadow-[12px_12px_0px_0px_#0d0f36]",
                    confirmButton: "rounded-2xl font-black uppercase text-xs tracking-widest px-8 py-4",
                }
            });
            setEmail("");
        } catch (error: any) {
             MySwal.fire({
                title: <span className="text-xl font-black">Error</span>,
                text: error.response?.data?.email || "No pudimos completar tu registro.",
                icon: "error",
                confirmButtonColor: "#0d0f36",
                customClass: { popup: "rounded-[2rem] border-2 border-destructive/20" }
            });
        } finally {
            setIsLoading(false);
        }
    };

    const toast = (title: string, icon: any) => {
        MySwal.fire({
            title,
            icon,
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 3000,
            timerProgressBar: true,
            customClass: {
                popup: "rounded-2xl border-2 border-primary/20 bg-background/95 backdrop-blur-md"
            }
        });
    }

    return (
        <section className="relative bg-white border-4 border-[#0d0f36] p-16 md:p-24 rounded-[4rem] shadow-[20px_20px_0px_0px_#0d0f36] dark:bg-[#0d0f36] dark:border-primary/20 dark:shadow-none overflow-hidden group">
            {/* Sketch Background Elements */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 -z-10 rounded-full blur-[100px] group-hover:bg-primary/10 transition-colors duration-1000" />
            <div className="absolute bottom-[-50px] left-[-50px] pointer-events-none opacity-20 text-primary">
                <svg width="200" height="200" viewBox="0 0 200 200">
                    <path d="M10,190 Q50,150 90,190 T170,190" fill="none" stroke="currentColor" strokeWidth="4" className="sketch-stroke" />
                </svg>
            </div>

            <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-16">
                <div className="space-y-6 max-w-2xl text-center lg:text-left">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest mb-2 border border-primary/20">
                        <Sparkles className="w-3.5 h-3.5" /> Bitácora Digital
                    </div>
                    <h2 className="text-5xl md:text-7xl font-black italic tracking-tighter leading-[0.8]">
                        ¿Quieres ser el <span className="text-primary sketch-underline">Primero</span>?
                    </h2>
                    <p className="text-xl text-muted-foreground font-bold leading-relaxed max-w-lg">
                        Únete a nuestra lista de correos y recibe notificaciones exclusivas cada vez que abramos nuevas fechas para recorridos y talleres.
                    </p>
                </div>
                
                <form onSubmit={handleSubscribe} className="w-full lg:w-auto flex flex-col sm:flex-row items-center gap-6">
                    <div className="relative w-full sm:w-[400px]">
                        <Input
                            type="email"
                            placeholder="tu@correo.com"
                            className="h-20 rounded-[2rem] bg-muted/30 border-2 border-[#0d0f36]/10 focus-visible:border-[#0d0f36] dark:focus-visible:border-primary text-lg font-bold px-8 placeholder:text-muted-foreground/40"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                        <div className="absolute right-6 top-1/2 -translate-y-1/2 text-muted-foreground/20">
                            <Send className="w-6 h-6" />
                        </div>
                    </div>
                    <Button 
                        type="submit"
                        disabled={isLoading}
                        className="h-20 px-12 rounded-[2rem] bg-[#0d0f36] text-white dark:bg-primary dark:text-[#0d0f36] font-black text-xl uppercase tracking-widest shadow-[8px_8px_0px_0px_#69d2cd] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all w-full sm:w-auto hover:bg-[#0d0f36]/90"
                    >
                        {isLoading ? "..." : "Unirme"}
                    </Button>
                </form>
            </div>
        </section>
    );
};

export default NewsletterSection;
