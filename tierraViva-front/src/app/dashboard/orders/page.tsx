"use client";

import { useEffect, useState } from "react";
import { getUserOrders } from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { 
    ShoppingBag, 
    Calendar, 
    CreditCard, 
    CheckCircle2, 
    XCircle,
    ChevronDown,
    ChevronUp
} from "lucide-react";

interface OrderItemData {
    id: number;
    product: number;
    product_name: string;
    price: string;
    quantity: number;
}

interface OrderData {
    id: number;
    user: number;
    items: OrderItemData[];
    total_price?: number;
    paid: boolean;
    stripe_payment_intent?: string;
    created_at: string;
}

export default function OrdersPage() {
    const [orders, setOrders] = useState<OrderData[]>([]);
    const [loading, setLoading] = useState(true);
    const [expandedOrders, setExpandedOrders] = useState<Record<number, boolean>>({});

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const data = await getUserOrders();
                setOrders(data);
            } catch (error) {
                console.error("Error fetching user orders:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchOrders();
    }, []);

    const toggleExpand = (id: number) => {
        setExpandedOrders(prev => ({
            ...prev,
            [id]: !prev[id]
        }));
    };

    if (loading) {
        return (
            <div className="space-y-6">
                <Skeleton className="h-8 w-48 rounded-xl" />
                <div className="space-y-4">
                    <Skeleton className="h-24 rounded-3xl" />
                    <Skeleton className="h-24 rounded-3xl" />
                </div>
            </div>
        );
    }

    if (orders.length === 0) {
        return (
            <div className="text-center py-16 px-6 space-y-6 border border-dashed rounded-[2.5rem] bg-muted/5 flex flex-col items-center justify-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                    <ShoppingBag className="w-8 h-8 text-primary" />
                </div>
                <div className="space-y-2 max-w-md">
                    <h2 className="text-2xl font-black text-foreground">No tienes compras registradas</h2>
                    <p className="text-muted-foreground text-sm">
                        Visita la tienda de Tierra Viva para comprar miel artesanal, souvenirs del santuario y productos ecológicos. El 100% de las ganancias se destina al rescate de animales.
                    </p>
                </div>
                <Link href="/shop">
                    <Button className="rounded-2xl font-bold px-6 py-5 shadow-lg shadow-primary/20 transition-all hover:scale-105">
                        Ir a la Tienda
                    </Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div>
                <h1 className="text-3xl font-black tracking-tight mb-2 text-foreground">Mis Pedidos</h1>
                <p className="text-muted-foreground text-sm">Historial de compras realizadas en la tienda del santuario.</p>
            </div>

            <div className="space-y-4">
                {orders.map((order) => {
                    const orderDate = new Date(order.created_at).toLocaleDateString('es-MX', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                    });

                    const isExpanded = expandedOrders[order.id];

                    // Calculate total if not provided by backend directly
                    const totalPrice = order.total_price || order.items.reduce((acc, item) => {
                        return acc + (parseFloat(item.price) * item.quantity);
                    }, 0);

                    const totalItemsCount = order.items.reduce((acc, item) => acc + item.quantity, 0);

                    return (
                        <div key={order.id} className="border border-border/80 rounded-[2rem] bg-card/45 backdrop-blur-sm shadow-md hover:border-primary/10 transition-all duration-300 overflow-hidden">
                            {/* Summary row */}
                            <div className="p-6 md:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6 cursor-pointer" onClick={() => toggleExpand(order.id)}>
                                <div className="space-y-2">
                                    <div className="flex items-center gap-3">
                                        <h3 className="text-lg font-black text-foreground">Pedido #{order.id}</h3>
                                        {order.paid ? (
                                            <span className="bg-green-500/10 text-green-500 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider flex items-center gap-1">
                                                <CheckCircle2 className="w-3.5 h-3.5" /> Pagado
                                            </span>
                                        ) : (
                                            <span className="bg-red-500/10 text-red-500 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider flex items-center gap-1">
                                                <XCircle className="w-3.5 h-3.5" /> Cancelado o Pendiente
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex flex-wrap gap-x-6 gap-y-1 text-xs text-muted-foreground font-bold">
                                        <span className="flex items-center gap-1.5">
                                            <Calendar className="w-4 h-4 text-primary" /> {orderDate}
                                        </span>
                                        <span className="flex items-center gap-1.5">
                                            <ShoppingBag className="w-4 h-4 text-primary" /> {totalItemsCount} {totalItemsCount === 1 ? 'artículo' : 'artículos'}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between sm:justify-end gap-6 border-t pt-4 sm:border-t-0 sm:pt-0 border-border/50">
                                    <div className="text-right">
                                        <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">Total pagado</p>
                                        <p className="text-2xl font-black text-primary">${totalPrice.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN</p>
                                    </div>
                                    <div className="p-2 border rounded-xl hover:bg-primary/10 transition-colors text-muted-foreground">
                                        {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                                    </div>
                                </div>
                            </div>

                            {/* Details table (Conditional render) */}
                            {isExpanded && (
                                <div className="px-6 pb-6 md:px-8 md:pb-8 border-t border-border/50 bg-secondary/5 animate-in slide-in-from-top-4 duration-300">
                                    <div className="py-4 font-black text-xs uppercase tracking-widest text-primary/70">
                                        Detalles de los Artículos
                                    </div>
                                    <div className="divide-y divide-border/40">
                                        {order.items.map((item) => {
                                            const priceVal = parseFloat(item.price);
                                            const subtotal = priceVal * item.quantity;
                                            return (
                                                <div key={item.id} className="py-4 flex justify-between items-center text-sm">
                                                    <div>
                                                        <span className="font-bold text-foreground block">{item.product_name}</span>
                                                        <span className="text-xs text-muted-foreground font-bold">
                                                            {item.quantity} x ${priceVal.toLocaleString('es-MX')} MXN
                                                        </span>
                                                    </div>
                                                    <span className="font-black text-foreground">
                                                        ${subtotal.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN
                                                    </span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                    {order.stripe_payment_intent && (
                                        <div className="mt-6 p-4 rounded-2xl bg-background border border-border/60 text-xs font-bold text-muted-foreground flex items-center gap-2">
                                            <CreditCard className="w-4 h-4 text-primary" />
                                            <span>Transacción Stripe: <span className="font-mono text-foreground">{order.stripe_payment_intent}</span></span>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
