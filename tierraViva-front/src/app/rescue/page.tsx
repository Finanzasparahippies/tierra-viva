"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import dynamic from "next/dynamic";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { MapPin, Phone, MessageSquare, Info, ShieldCheck, HeartPulse, Mail, MessageCircle } from "lucide-react";
import { createRescueRequest } from "@/lib/api";
import { useAuthStore } from "@/store/useAuthStore";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

const MySwal = withReactContent(Swal);

// Dynamically import Leaflet components to avoid SSR issues
const MapContainer = dynamic(() => import("react-leaflet").then((mod) => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import("react-leaflet").then((mod) => mod.TileLayer), { ssr: false });
const Marker = dynamic(() => import("react-leaflet").then((mod) => mod.Marker), { ssr: false });
const LocationMarker = dynamic(() => import("@/components/ui/MapComponents").then((mod) => mod.LocationMarker), { ssr: false });

const ANIMAL_TYPES = [
    { value: "BEES", label: "Abejas" },
    { value: "DOGS", label: "Perros" },
    { value: "CATS", label: "Gatos" },
    { value: "RABBITS", label: "Conejos" },
    { value: "HORSES", label: "Caballos" },
    { value: "BOVINES", label: "Bovinos" },
    { value: "PORCINES", label: "Porcinos" },
    { value: "OTHER", label: "Otro (Sujeto a aprobación)" },
];

export default function RescuePage() {
    const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
    const [address, setAddress] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [othersEnabled, setOthersEnabled] = useState(false);

    // Form logic
    const { register, handleSubmit, setValue, watch, reset } = useForm({
        defaultValues: {
            animal_type: "BEES",
            other_species: "",
            description: "",
            phone: "",
            address: "",
            email: "",
        }
    });

    const { user, isAuthenticated } = useAuthStore();

    useEffect(() => {
        if (isAuthenticated && user?.email) {
            setValue("email", user.email);
        }
    }, [isAuthenticated, user, setValue]);

    const animalType = watch("animal_type");

    useEffect(() => {
        setOthersEnabled(animalType === "OTHER");
    }, [animalType]);

    // Reverse geocoding
    const fetchAddress = async (lat: number, lng: number) => {
        try {
            const response = await axios.get(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
            );
            const addr = response.data.display_name;
            setAddress(addr);
            setValue("address", addr);
        } catch (error) {
            console.error("Error fetching address:", error);
        }
    };

    const handleLocationSelect = (lat: number, lng: number) => {
        setLocation({ lat, lng });
        fetchAddress(lat, lng);
    };

    const onSubmit = async (data: any) => {
        if (!location) {
            MySwal.fire({
                title: "Ubicación faltante",
                text: "Por favor, selecciona una ubicación en el mapa para poder enviar el rescate.",
                icon: "warning",
                confirmButtonColor: "var(--primary)",
                customClass: { popup: "rounded-[2rem]" }
            });
            return;
        }

        setIsSubmitting(true);
        try {
            const formData = {
                ...data,
                latitude: location.lat,
                longitude: location.lng,
                address: data.address || address, // Use form address or fetched one
            };

            await createRescueRequest(formData);
            MySwal.fire({
                title: <span className="text-2xl font-black">¡Solicitud Enviada!</span>,
                html: <p className="font-medium">El equipo de <b>Tierra Viva</b> ha recibido tu reporte. Revisaremos los detalles y nos pondremos en contacto contigo pronto.</p>,
                icon: "success",
                confirmButtonText: "Entendido",
                confirmButtonColor: "var(--primary)",
                customClass: {
                    popup: "rounded-[2rem] border-2 border-primary/10",
                    confirmButton: "rounded-xl font-bold px-8 py-3",
                }
            });
            reset();
            setLocation(null);
            setAddress("");
        } catch (error: any) {
            console.error("Error submitting rescue:", error);
            MySwal.fire({
                title: "Error",
                text: "Hubo un problema al enviar la solicitud. Por favor intenta de nuevo.",
                icon: "error",
                confirmButtonColor: "var(--primary)",
                customClass: { popup: "rounded-[2rem]" }
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 py-12 space-y-12 animate-in fade-in duration-1000">
            <header className="text-center space-y-4 max-w-3xl mx-auto animate-in slide-in-from-top duration-700">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary font-bold text-sm uppercase tracking-wider">
                    <HeartPulse className="w-4 h-4" /> Red de Rescate Tierra Viva
                </div>
                <h1 className="text-4xl md:text-6xl font-black tracking-tight text-foreground">
                    Ayuda a un Animal en <span className="text-primary italic">Peligro</span>
                </h1>
                <p className="text-lg text-muted-foreground">
                    ¿Tienes abejas en tu domicilio o algún animal que necesite ser rescatado?
                    Usa nuestro mapa para pinear tu ubicación y organizaremos una visita profesional.
                </p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Map Section */}
                <Card className="lg:col-span-8 overflow-hidden rounded-3xl border-2 border-primary/5 shadow-2xl transition-all hover:shadow-primary/5">
                    <CardHeader className="bg-primary/5 border-b border-primary/10">
                        <CardTitle className="flex items-center gap-2">
                            <MapPin className="text-primary" /> 1. Selecciona la Ubicación
                        </CardTitle>
                        <CardDescription>Haz clic en el mapa para marcar el punto exacto de la emergencia</CardDescription>
                    </CardHeader>
                    <CardContent className="p-0 h-[500px] relative z-10">
                        <MapContainer
                            center={[29.0730, -110.9559]}
                            zoom={13}
                            className="h-full w-full"
                        >
                            <TileLayer
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                            />
                            <LocationMarker onLocationSelect={handleLocationSelect} />
                        </MapContainer>
                        {!location && (
                            <div className="absolute inset-0 bg-background/50 backdrop-blur-sm z-20 flex items-center justify-center p-6 text-center pointer-events-none">
                                <div className="bg-background p-6 rounded-2xl shadow-xl border border-primary/20 animate-bounce">
                                    <p className="font-bold flex items-center gap-2">
                                        <Info className="w-5 h-5 text-primary" /> Haz clic en el mapa para comenzar
                                    </p>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Form Section */}
                <Card className="lg:col-span-4 rounded-3xl border-2 border-primary/10 shadow-xl">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <MessageSquare className="text-primary" /> 2. Detalles del Rescate
                        </CardTitle>
                        <CardDescription>Proporciona información para coordinar la visita</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-sm font-black uppercase tracking-widest text-primary/60">Animal a Rescatar</label>
                                <Select
                                    onValueChange={(val) => setValue("animal_type", val)}
                                    defaultValue="BEES"
                                >
                                    <SelectTrigger className="w-full bg-background border-2 border-border/50 rounded-xl focus:ring-primary h-12 font-bold text-foreground">
                                        <SelectValue placeholder="Tipo de animal" className="text-foreground font-bold" />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-xl p-2 bg-popover border-2 border-border/20 shadow-2xl">
                                        {ANIMAL_TYPES.map(type => (
                                            <SelectItem key={type.value} value={type.value} className="rounded-lg font-black text-foreground hover:bg-primary/10 transition-colors">
                                                {type.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {othersEnabled && (
                                <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                                    <label className="text-sm font-black uppercase tracking-widest text-primary/60">Especificar Especie</label>
                                    <Input
                                        {...register("other_species")}
                                        placeholder="Ej. Tlacuache, Halcón..."
                                        className="rounded-xl border-2 bg-secondary/5 h-12"
                                    />
                                </div>
                            )}

                            <div className="space-y-2">
                                <label className="text-sm font-black uppercase tracking-widest text-primary/60">Teléfono de Contacto</label>
                                <div className="relative">
                                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                    <Input
                                        {...register("phone", { required: true })}
                                        placeholder="10 dígitos"
                                        className="pl-11 rounded-xl border-2 bg-secondary/5 h-12"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-black uppercase tracking-widest text-primary/60">Correo electrónico</label>
                                <Input
                                    {...register("email", {
                                        required: "El correo es necesario para enviarte una copia de tu solicitud",
                                        pattern: {
                                            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                            message: "Correo inválido"
                                        }
                                    })}
                                    placeholder="tu@correo.com"
                                    className="rounded-xl border-2 bg-secondary/5 h-12"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-black uppercase tracking-widest text-primary/60">Dirección</label>
                                <Input
                                    {...register("address", { required: true })}
                                    placeholder="Calle, número, colonia..."
                                    className="rounded-xl border-2 bg-secondary/5 h-12"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-black uppercase tracking-widest text-primary/60">Descripción breve</label>
                                <Textarea
                                    {...register("description", { required: true })}
                                    placeholder="¿Cuál es la situación? Ej. Panal en el jardín, perro herido..."
                                    className="rounded-xl border-2 bg-secondary/5 min-h-[100px]"
                                />
                            </div>

                            <div className="pt-4 flex flex-col gap-4">
                                <div className="flex items-start gap-2 p-3 rounded-xl bg-orange-500/10 text-orange-600 text-xs font-bold">
                                    <ShieldCheck className="w-6 h-6 shrink-0" />
                                    <p>Tus datos son privados y solo se comparten con los rescatistas autorizados.</p>
                                </div>
                                <Button
                                    type="submit"
                                    disabled={isSubmitting || !location}
                                    className="w-full h-14 rounded-2xl text-lg font-black shadow-lg shadow-primary/20"
                                >
                                    {isSubmitting ? "Enviando..." : "Solicitar Rescate"}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>

            {/* Contact Section */}
            <section className="bg-primary/5 border border-primary/20 rounded-[3rem] p-8 md:p-12 grid md:grid-cols-2 gap-8 items-center animate-in fade-in slide-in-from-bottom duration-700">
                <div className="space-y-4 text-left">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary font-bold text-xs uppercase tracking-wider">
                        <MessageSquare className="w-3.5 h-3.5" /> Comunícate con nosotros
                    </div>
                    <h2 className="text-3xl font-black tracking-tight">¿Tienes alguna duda o comentario?</h2>
                    <p className="text-muted-foreground leading-relaxed">
                        Si tienes preguntas sobre un rescate en curso, sugerencias para nuestro equipo, o deseas colaborar con la red de rescatistas de Tierra Viva, escríbenos directamente. Estamos para escucharte.
                    </p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <a
                        href="mailto:soporte@tierraviva.com.mx"
                        className="flex items-center gap-4 p-6 rounded-2xl bg-background border border-border/50 shadow-sm hover:shadow-md hover:border-primary/20 hover:-translate-y-1 transition-all duration-300 group"
                    >
                        <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                            <Mail className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground uppercase font-black tracking-wider">Enviar Correo</p>
                            <p className="text-sm font-bold truncate">tierraviva.raiz@gmail.com</p>
                        </div>
                    </a>
                    <a
                        href="https://wa.me/526621412251"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-4 p-6 rounded-2xl bg-background border border-border/50 shadow-sm hover:shadow-md hover:border-green-500/20 hover:-translate-y-1 transition-all duration-300 group"
                    >
                        <div className="h-12 w-12 rounded-xl bg-green-500/10 flex items-center justify-center shrink-0 text-green-600 group-hover:bg-green-500 group-hover:text-white transition-colors">
                            <MessageCircle className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground uppercase font-black tracking-wider">WhatsApp</p>
                            <p className="text-sm font-bold">+52 (662) 141 2251</p>
                        </div>
                    </a>
                </div>
            </section>

            <section className="bg-secondary/10 rounded-[3rem] p-8 md:p-16 text-center space-y-8">
                <h2 className="text-3xl font-black">Nuestra Red Social de <span className="text-primary">Rescate</span></h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="bg-background p-8 rounded-3xl space-y-4 shadow-sm">
                        <div className="w-12 h-12 bg-primary/20 rounded-2xl flex items-center justify-center mx-auto text-primary">
                            <Info className="w-6 h-6" />
                        </div>
                        <h3 className="font-bold text-xl">Informa</h3>
                        <p className="text-muted-foreground text-sm">Pinea la ubicación y cuéntanos qué está pasando.</p>
                    </div>
                    <div className="bg-background p-8 rounded-3xl space-y-4 shadow-sm">
                        <div className="w-12 h-12 bg-primary/20 rounded-2xl flex items-center justify-center mx-auto text-primary">
                            <ShieldCheck className="w-6 h-6" />
                        </div>
                        <h3 className="font-bold text-xl">Valida</h3>
                        <p className="text-muted-foreground text-sm">Validamos la situación y asignamos un profesional.</p>
                    </div>
                    <div className="bg-background p-8 rounded-3xl space-y-4 shadow-sm">
                        <div className="w-12 h-12 bg-primary/20 rounded-2xl flex items-center justify-center mx-auto text-primary">
                            <HeartPulse className="w-6 h-6" />
                        </div>
                        <h3 className="font-bold text-xl">Sana</h3>
                        <p className="text-muted-foreground text-sm">El animal es rescatado y llevado a un lugar seguro.</p>
                    </div>
                </div>
            </section>
        </div>
    );
}
