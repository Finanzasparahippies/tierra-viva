"use client";

import { use, useState, useEffect } from "react";
import { notFound } from "next/navigation";
import { Product } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/store/useCartStore";
import { getProductBySlug } from "@/lib/api"; // Need to ensure this exists or add it
import Link from "next/link";

interface ProductPageProps {
    params: Promise<{ slug: string }>;
}

export default function ProductPage({ params }: ProductPageProps) {
    const resolvedParams = use(params);
    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const addItem = useCartStore((state) => state.addItem);

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const data = await getProductBySlug(resolvedParams.slug);
                setProduct(data);
            } catch (error) {
                console.error("Error fetching product:", error);
                setProduct(null);
            } finally {
                setLoading(false);
            }
        };
        fetchProduct();
    }, [resolvedParams.slug]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
            </div>
        );
    }

    if (!product) {
        return notFound();
    }

    return (
        <div className="max-w-6xl mx-auto py-12 px-4 space-y-12 animate-in fade-in duration-700">
            <div className="grid md:grid-cols-2 gap-12 items-start">
                {/* Product Image */}
                <div className={`aspect-square bg-muted rounded-[2rem] overflow-hidden relative shadow-2xl shadow-primary/5 group ${!product.is_active ? 'grayscale opacity-60' : ''}`}>
                    {product.image_url ? (
                        <img 
                            src={product.image_url} 
                            alt={product.name} 
                            className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-700" 
                        />
                    ) : (
                        <div className="flex items-center justify-center h-full text-6xl opacity-20">📦</div>
                    )}
                    {!product.is_active ? (
                        <span className="absolute top-6 right-6 bg-gray-500 text-white px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest border-white/20 border">
                            No disponible
                        </span>
                    ) : product.stock <= 5 && product.stock > 0 ? (
                        <span className="absolute top-6 right-6 glass px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest text-primary border-primary/20">
                            ¡Últimas unidades!
                        </span>
                    ) : product.stock === 0 && (
                        <span className="absolute top-6 right-6 bg-destructive/10 text-destructive px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest border-destructive/20 border">
                            Agotado
                        </span>
                    )}
                </div>

                {/* Product Info */}
                <div className={`space-y-8 py-4 ${!product.is_active ? 'opacity-70' : ''}`}>
                    <div className="space-y-4">
                        <Link href="/shop" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
                            &larr; Volver a la tienda
                        </Link>
                        <div className="inline-block px-3 py-1 bg-primary/10 text-primary text-xs font-bold rounded-full uppercase tracking-tighter">
                            {product.category || "General"}
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black tracking-tight leading-tight">{product.name}</h1>
                        <div className="flex items-center gap-4">
                            <p className="text-3xl font-black text-primary">{formatCurrency(product.price)}</p>
                            {product.unit && product.unit !== "PIECE" && (
                                <span className="text-sm text-muted-foreground font-medium uppercase tracking-widest">
                                    / {product.unit_amount} {product.unit.toLowerCase()}
                                </span>
                            )}
                        </div>
                    </div>

                    <div className="prose prose-lg text-muted-foreground leading-relaxed">
                        <p>{product.description}</p>
                    </div>

                    <div className="pt-6 border-t border-border/50">
                        <div className="flex items-center gap-4 mb-6">
                            <span className={`h-3 w-3 rounded-full ${!product.is_active ? 'bg-gray-400' : product.stock > 0 ? 'bg-green-500' : 'bg-destructive'}`} />
                            <span className="text-sm font-medium">
                                {!product.is_active ? 'Este producto no está disponible actualmente' : product.stock > 0 ? `${product.stock} disponibles en stock` : 'Agotado temporalmente'}
                            </span>
                        </div>
                        
                        <Button 
                            size="lg" 
                            onClick={() => addItem(product)} 
                            disabled={product.stock === 0 || !product.is_active}
                            className="w-full md:w-auto rounded-full px-12 py-8 text-lg font-bold shadow-xl shadow-primary/20 hover:scale-105 transition-all"
                        >
                            {!product.is_active ? "No disponible" : product.stock === 0 ? "Agotado" : "Agregar al Carrito"}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
