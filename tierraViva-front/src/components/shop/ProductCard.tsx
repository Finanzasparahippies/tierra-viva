
"use client";

import Link from "next/link";
import { Product } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/store/useCartStore";
import { ShoppingCart, ShoppingBag, Sparkles, Plus } from "lucide-react";

interface ProductCardProps {
    product: Product;
}

const ProductCard = ({ product }: ProductCardProps) => {
    const addItem = useCartStore((state) => state.addItem);

    return (
        <div className={`group flex flex-col space-y-4 animate-in fade-in slide-in-from-bottom duration-1000 fill-mode-both hover-lift ${!product.is_active ? 'opacity-50 grayscale' : ''}`}>
            {/* Image Container */}
            <div className="aspect-square relative rounded-[2.5rem] overflow-hidden bg-card border-2 border-border/20 shadow-2xl transition-all duration-700">
                {product.image_url ? (
                    <img
                        src={product.image_url}
                        alt={product.name}
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                    />
                ) : (
                    <div className="absolute inset-0 bg-primary/5 flex items-center justify-center">
                        <ShoppingBag className="w-12 h-12 text-primary/10" />
                    </div>
                )}
                
                {/* Status Badges */}
                {product.stock <= 5 && product.stock > 0 && (
                    <div className="absolute top-4 right-4 z-20">
                        <div className="bg-amber-400 text-amber-950 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-tighter shadow-lg">
                             ¡Última Pieza!
                        </div>
                    </div>
                )}

                {product.stock === 0 && (
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] z-10 flex items-center justify-center">
                         <div className="bg-background/90 text-foreground text-xs font-black px-4 py-2 rounded-2xl uppercase tracking-widest shadow-2xl scale-90 group-hover:scale-100 transition-transform">
                             Agotado
                         </div>
                    </div>
                )}

                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                
                {/* Rapid Action Button */}
                <div className="absolute bottom-4 right-4 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 z-20">
                    <Button 
                        size="icon" 
                        onClick={(e) => {
                            e.preventDefault();
                            addItem(product);
                        }}
                        disabled={product.stock === 0 || !product.is_active}
                        className="w-12 h-12 rounded-full shadow-2xl shadow-primary/40 bg-primary hover:bg-primary/90"
                    >
                        <Plus className="w-6 h-6" />
                    </Button>
                </div>
            </div>

            {/* Content Container */}
            <div className="px-2 space-y-2">
                <div className="flex items-center justify-between gap-4">
                    <Link href={`/shop/${product.slug}`} className="flex-1">
                        <h3 className="text-xl font-black italic tracking-tighter leading-tight truncate group-hover:text-primary transition-colors">
                            {product.name}
                        </h3>
                    </Link>
                    <span className="text-lg font-black text-primary">
                        {formatCurrency(product.price)}
                    </span>
                </div>
                
                <p className="text-muted-foreground font-bold text-xs line-clamp-1">
                    {product.description}
                </p>

                <div className="flex items-center gap-2 pt-2 border-t border-border/20">
                    <div className="text-[10px] font-black uppercase tracking-widest text-primary/60 flex items-center gap-1">
                        <Sparkles className="w-3 h-3" /> {product.category || "Solidario"}
                    </div>
                    {product.unit && product.unit !== "PIECE" && (
                        <div className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/60 ml-auto bg-muted/30 px-2 py-0.5 rounded-full">
                            Por {product.unit_amount} {product.unit.toLowerCase()}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProductCard;
