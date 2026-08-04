
import ProductCard from "@/components/shop/ProductCard";
export const dynamic = "force-dynamic";
import { getProducts } from "@/lib/api";
import { Product } from "@/lib/types";
import { ShoppingBag, Sparkles, Store } from "lucide-react";

export default async function ShopPage() {
    let products: Product[] = [];
    try {
        products = await getProducts();
    } catch (error) {
        console.error("Failed to fetch products:", error);
    }
    
    return (
        <div className="container mx-auto px-4 py-20 min-h-screen relative overflow-hidden">
            {/* Background Decorative Glows */}
            <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-accent/5 blur-[150px] -z-10 rounded-full" />
            <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-primary/10 blur-[120px] -z-10 rounded-full animate-pulse" />

            {/* Cinematic Header */}
            <header className="max-w-4xl mx-auto text-center mb-24 space-y-8 animate-in fade-in slide-in-from-top duration-1000">
                <div className="inline-flex items-center gap-3 px-6 py-2.5 rounded-full bg-accent/10 text-accent text-[10px] font-black uppercase tracking-[0.4em] border border-accent/20 shadow-sm">
                    <Store className="w-4 h-4" /> Mercado Consciente
                </div>
                <h1 className="text-6xl md:text-8xl lg:text-9xl font-black tracking-tighter leading-[0.8] italic">
                    Tienda <br />
                    <span className="text-primary relative inline-block">
                        Solidaria
                        <svg className="absolute -bottom-2 left-0 w-full h-4 text-primary/30 -z-10" viewBox="0 0 100 10" preserveAspectRatio="none">
                            <path d="M0 10 Q 50 0 100 10" stroke="currentColor" strokeWidth="6" fill="transparent" />
                        </svg>
                    </span>
                </h1>
                <p className="text-xl md:text-2xl text-muted-foreground font-bold max-w-2xl mx-auto pt-8 leading-relaxed">
                    Productos orgánicos, artesanales y con causa. Al elegirnos, apoyas directamente la economía local y el bienestar animal.
                </p>
            </header>

            {/* Products Grid */}
            <div className="max-w-7xl mx-auto">
                {products.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-20">
                        {products.map((product, index) => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-40 bg-card/40 rounded-[4rem] border-2 border-dashed border-border/40 animate-in fade-in zoom-in duration-700">
                        <div className="w-24 h-24 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-8">
                            <ShoppingBag className="w-12 h-12 text-accent" />
                        </div>
                        <h3 className="text-3xl font-black italic tracking-tight mb-4">Nuestro mercado está creciendo...</h3>
                        <p className="text-muted-foreground font-bold">Vuelve pronto para descubrir productos únicos.</p>
                    </div>
                )}
            </div>

            {/* Bottom Value Section */}
            <section className="mt-40 grid grid-cols-1 md:grid-cols-3 gap-12 animate-in fade-in slide-in-from-bottom duration-1000 delay-500 fill-mode-both">
                {[
                    { title: "Origen Local", desc: "Proveniente de manos artesanas y productores locales.", icon: <Sparkles className="w-6 h-6 text-primary" /> },
                    { title: "Empaque Eco", desc: "Reducimos nuestra huella con materiales compostables.", icon: <Sparkles className="w-6 h-6 text-primary" /> },
                    { title: "100% Solidario", desc: "Las ganancias se destinan íntegramente al santuario.", icon: <Sparkles className="w-6 h-6 text-primary" /> }
                ].map((item, i) => (
                    <div key={i} className="p-12 rounded-[3.5rem] bg-card border-2 border-border/20 shadow-xl space-y-6 hover-lift">
                        <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center">
                            {item.icon}
                        </div>
                        <h3 className="text-2xl font-black italic tracking-tight">{item.title}</h3>
                        <p className="text-muted-foreground font-bold leading-relaxed">{item.desc}</p>
                    </div>
                ))}
            </section>
        </div>
    );
}
