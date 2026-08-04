"use client";

import NewsletterForm from "../newsletter/NewsletterForm";

const Footer = () => {
    return (
        <footer className="bg-[#0d0f36] text-[#f1f6ce] py-16 mt-auto border-t border-primary/10">
            <div className="container mx-auto px-4">
                <div className="grid md:grid-cols-3 gap-12 items-start mb-12">
                    <div className="space-y-4">
                        <h4 className="text-3xl font-black italic tracking-tighter text-primary">TierraViva</h4>
                        <p className="text-[#b9f1d6] font-medium leading-relaxed max-w-xs">
                            Conectando corazones con la naturaleza y protegiendo la vida silvestre.
                        </p>
                    </div>
                    <div className="space-y-4">
                        <h5 className="text-sm font-black uppercase tracking-widest text-[#69d2cd]">Enlaces Rápidos</h5>
                        <ul className="space-y-2 font-bold">
                            <li><a href="/about" className="hover:text-primary transition-colors">Nosotros</a></li>
                            <li><a href="/rescue" className="hover:text-primary transition-colors">Reportar Rescate</a></li>
                            <li><a href="/shop" className="hover:text-primary transition-colors">Tienda Solidaria</a></li>
                        </ul>
                    </div>
                    <div className="space-y-6">
                        <h5 className="text-sm font-black uppercase tracking-widest text-[#69d2cd]">Únete al Cambio</h5>
                        <NewsletterForm />
                    </div>
                </div>
                <div className="flex flex-col md:flex-row justify-between items-center gap-6 text-xs font-black uppercase tracking-widest text-[#b9f1d6]/40 pt-12 border-t border-primary/5">
                    <p>&copy; {new Date().getFullYear()} TierraViva. Todos los derechos reservados.</p>
                    <div className="flex gap-6">
                        <a href="/privacy" className="hover:text-primary transition-colors">
                            Aviso de Privacidad
                        </a>
                        <a href="/terms" className="hover:text-primary transition-colors">
                            Términos de Uso
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
