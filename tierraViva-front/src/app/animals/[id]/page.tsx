"use client";

import { useEffect, useState } from "react";
import { getAnimal, getTiers } from "@/lib/api";
import { Animal, SponsorshipTier } from "@/lib/types";
import { formatCurrency, getEmbedUrl, optimizeImage } from "@/lib/utils";
import CheckoutButton from "@/components/sponsorship/CheckoutButton";
import AnimalFolders from "@/components/animals/AnimalFolders";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
    Video,
    Calendar,
    MapPin,
    Activity,
    Weight,
    Cake,
    Dna,
    ArrowLeft,
    ShieldCheck,
    Sparkles,
    Heart
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

export default function AnimalProfilePage({ params }: { params: { id: string } }) {
    const [animal, setAnimal] = useState<Animal | null>(null);
    const [tiers, setTiers] = useState<SponsorshipTier[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAnnual, setIsAnnual] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const resolvedParams = await params;
                const [animalData, tiersData] = await Promise.all([
                    getAnimal(resolvedParams.id),
                    getTiers()
                ]);
                setAnimal(animalData);
                setTiers(tiersData);
            } catch (error) {
                console.error("Error fetching animal profile:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [params]);

    if (loading) {
        return (
            <div className="max-w-6xl mx-auto space-y-12 py-20 px-6">
                <Skeleton className="h-[500px] w-full rounded-[4rem]" />
                <div className="grid md:grid-cols-3 gap-12">
                    <div className="md:col-span-2 space-y-6">
                        <Skeleton className="h-16 w-3/4 rounded-2xl" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-5/6" />
                    </div>
                </div>
            </div>
        );
    }

    if (!animal) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-8">
                <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center">
                    <Heart className="w-12 h-12 text-primary" />
                </div>
                <h1 className="text-4xl font-black italic tracking-tighter">Explorador no encontrado</h1>
                <Link href="/animals">
                    <Button variant="outline" className="h-14 px-8 rounded-2xl font-black">Volver al Santuario</Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-6 py-20 space-y-24 min-h-screen relative overflow-hidden bg-white dark:bg-[#0d0f36]">
            {/* Ambient Background Sketch */}
            <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary/5 blur-[150px] -z-10 rounded-full" />

            {/* Back Navigation & Breadcrumb */}
            <nav className="relative z-10 max-w-6xl mx-auto">
                <Link href="/animals" className="inline-flex items-center gap-4 text-xs font-black uppercase tracking-widest text-primary group">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center border-2 border-primary/20 group-hover:bg-primary group-hover:text-white transition-all">
                        <ArrowLeft className="w-5 h-5" />
                    </div>
                    Volver al Resguardo
                </Link>
            </nav>

            {/* Main Profile Header - Journal Style */}
            <section className="relative z-10 grid lg:grid-cols-12 gap-16 items-start max-w-7xl mx-auto">
                {/* Large Profile Image */}
                <div className="lg:col-span-12 xl:col-span-7">
                    <div className="relative aspect-[4/3] rounded-[4rem] overflow-hidden border-4 border-[#0d0f36] shadow-[20px_20px_0px_0px_#0d0f36] group dark:border-primary/20 dark:shadow-none">
                        {animal.image_url ? (
                            <img
                                src={optimizeImage(animal.image_url)}
                                alt={animal.name}
                                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                            />
                        ) : (
                            <div className="w-full h-full bg-primary/5 flex items-center justify-center text-8xl">🐾</div>
                        )}

                        {animal.is_adopted && (
                            <div className="absolute top-8 right-8 z-20">
                                <Badge className="bg-primary text-primary-foreground font-black px-8 py-3 rounded-full text-lg rotate-3 shadow-2xl border-none uppercase tracking-tighter italic">
                                    <Sparkles className="w-5 h-5 mr-3" /> Familia Encontrada
                                </Badge>
                            </div>
                        )}

                        <div className="absolute inset-0 bg-gradient-to-t from-[#0d0f36]/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                    </div>
                </div>

                {/* Info Panel */}
                <div className="lg:col-span-12 xl:col-span-5 space-y-12 pt-8">
                    <div className="space-y-4">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest border border-primary/20">
                            {animal.species_name || animal.species} • {animal.breed_name || animal.breed}
                        </div>
                        <h1 className="text-7xl md:text-9xl font-black italic tracking-tighter leading-[0.75] text-[#0d0f36] dark:text-white">
                            {animal.name}
                        </h1>
                    </div>

                    {/* Stats Grid - High Contrast Monochrome Cards */}
                    <div className="grid grid-cols-2 gap-6">
                        {[
                            { label: "Edad", val: animal.age_display, icon: <Cake className="w-5 h-5" /> },
                            { label: "Rescate", val: animal.time_at_ranch_display, icon: <Calendar className="w-5 h-5" /> },
                            { label: "Sexo", val: animal.sex === 'MALE' ? 'Macho' : 'Hembra', icon: <Dna className="w-5 h-5" /> },
                            { label: "Salud", val: animal.health_status_display || 'Óptima', icon: <Activity className="w-5 h-5" />, accent: true }
                        ].map((stat, i) => (
                            <div key={i} className="p-6 rounded-[2rem] bg-white border-2 border-[#0d0f36]/10 shadow-sm hover:border-[#0d0f36] hover:shadow-xl transition-all group dark:bg-card dark:border-primary/5">
                                <div className="flex items-center gap-3 text-muted-foreground group-hover:text-primary transition-colors mb-4">
                                    {stat.icon}
                                    <span className="text-[10px] font-black uppercase tracking-widest">{stat.label}</span>
                                </div>
                                <p className={`text-xl font-black italic tracking-tighter ${stat.accent ? 'text-primary' : 'text-[#0d0f36] dark:text-white'}`}>
                                    {stat.val}
                                </p>
                            </div>
                        ))}
                    </div>

                    {!animal.is_adopted && (
                        <div className="pt-8">
                            <Link href="#membership-section">
                                <Button className="w-full h-20 rounded-[2.5rem] text-xl font-black italic shadow-[8px_8px_0px_0px_#0d0f36] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all">
                                    Apadrinar a {animal.name}
                                </Button>
                            </Link>
                        </div>
                    )}
                </div>
            </section>

            {/* History Section - Cinematic Journal */}
            <section className="relative z-10 max-w-5xl mx-auto grid lg:grid-cols-1 gap-16">
                <div className="space-y-12">
                    <header className="space-y-4">
                        <h2 className="text-4xl md:text-6xl font-black italic tracking-tighter leading-none">
                            Biografía <br />
                            <span className="text-primary sketch-underline">y Actualidad</span>
                        </h2>
                    </header>

                    <div className="prose prose-2xl prose-p:font-bold prose-p:text-muted-foreground prose-headings:font-black prose-headings:italic dark:prose-invert max-w-none leading-relaxed">
                        <div
                            className="descripcion-animal"
                            dangerouslySetInnerHTML={{ __html: animal.description }}
                        />
                    </div>

                    {animal.rescue_video_url && (
                        <div className="pt-20 border-t-2 border-[#0d0f36]/5">
                            <h3 className="text-2xl font-black italic tracking-tighter mb-10 flex items-center gap-4">
                                <Video className="w-10 h-10 text-primary" /> Crónica del Rescate
                            </h3>
                            <div className="aspect-video rounded-[4rem] overflow-hidden border-4 border-[#0d0f36] shadow-[20px_20px_0px_0px_#0d0f36] bg-black dark:border-primary/20">
                                {animal.rescue_video_url.includes("cloudinary.com") ||
                                    animal.rescue_video_url.match(/\.(mp4|webm|ogg|mov)$/i) ? (
                                    <video
                                        src={animal.rescue_video_url}
                                        controls
                                        className="w-full h-full object-cover"
                                        poster={animal.image_url}
                                    />
                                ) : (
                                    <iframe
                                        src={getEmbedUrl(animal.rescue_video_url) || ""}
                                        className="w-full h-full"
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                        allowFullScreen
                                    />
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </section>

            {/* Membership Section - Zine Style Cards */}
            {!animal.is_adopted && (
                <section id="membership-section" className="space-y-16 pt-32 scroll-mt-20 relative z-10 max-w-7xl mx-auto">
                    <div className="text-center max-w-3xl mx-auto space-y-8">
                        <h2 className="text-5xl md:text-7xl font-black italic tracking-tighter">
                            Únete al <span className="text-primary sketch-underline">Legado</span>
                        </h2>
                        <p className="text-xl font-bold text-muted-foreground/80 leading-relaxed px-4">
                            Dona mensualmente y obtén acceso a historias exclusivas, transmisiones y actualizaciones de vida en el rancho.
                        </p>

                        {/* Frequency Toggle - Journal Styles */}
                        <div className="flex items-center justify-center gap-6 pt-10">
                            <span className={`text-[10px] font-black uppercase tracking-widest ${!isAnnual ? "text-primary" : "text-muted-foreground"}`}>Mensual</span>
                            <button
                                onClick={() => setIsAnnual(!isAnnual)}
                                className="w-16 h-8 bg-[#0d0f36] rounded-full relative p-1.5 transition-all group shadow-inner"
                            >
                                <div className={`w-5 h-5 bg-primary rounded-full transition-all duration-300 transform ${isAnnual ? "translate-x-8" : "translate-x-0"} shadow-lg`} />
                            </button>
                            <span className={`text-[10px] font-black uppercase tracking-widest ${isAnnual ? "text-primary" : "text-muted-foreground"}`}>
                                Anual <Badge variant="secondary" className="ml-2 bg-green-500/10 text-green-600 border-none font-black italic px-3">-15%</Badge>
                            </span>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 items-stretch">
                        {tiers.map((tier) => (
                            <div key={tier.id} className="group relative flex flex-col bg-white border-4 border-[#0d0f36] rounded-[3.5rem] p-10 shadow-[12px_12px_0px_0px_#0d0f36] hover:translate-x-2 hover:translate-y-2 hover:shadow-none transition-all duration-500 dark:bg-card dark:border-primary/10">
                                {isAnnual && (
                                    <div className="absolute top-6 right-6">
                                        <div className="bg-green-500 text-white text-[9px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest shadow-lg">ANUAL</div>
                                    </div>
                                )}

                                <div className="mb-10 text-center">
                                    {tier.image_url ? (
                                        <div className="w-24 h-24 mx-auto rounded-full overflow-hidden mb-8 border-4 border-primary/20 shadow-xl group-hover:scale-110 transition-transform">
                                            <img src={tier.image_url} alt={tier.name} className="object-cover w-full h-full" />
                                        </div>
                                    ) : (
                                        <div className="w-20 h-20 mx-auto rounded-full bg-primary/10 flex items-center justify-center text-5xl mb-8 group-hover:scale-110 transition-transform">
                                            🐾
                                        </div>
                                    )}
                                    <h3 className="text-3xl font-black italic tracking-tighter mb-2">{tier.name}</h3>
                                    <div className="flex flex-col items-center">
                                        <span className="text-4xl font-black text-primary italic">
                                            {formatCurrency(Number(isAnnual ? (tier.price_annual || Number(tier.price) * 10) : tier.price))}
                                        </span>
                                        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 mt-1">
                                            {isAnnual ? 'Facturación Anual' : 'Aporte Mensual'}
                                        </span>
                                    </div>
                                </div>

                                <p className="text-muted-foreground font-bold text-sm leading-relaxed mb-12 flex-1 line-clamp-4">
                                    {tier.description}
                                </p>

                                <CheckoutButton
                                    tierId={tier.id}
                                    animalId={animal.id}
                                    is_annual={isAnnual}
                                    label={isAnnual ? "Plan Anual" : "Apadrinar"}
                                    className="w-full h-16 rounded-3xl text-lg font-black italic shadow-[8px_8px_0px_0px_#69d2cd]"
                                />
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* Stories & Updates Section */}
            <div className="relative z-10 pt-16 max-w-7xl mx-auto border-t-4 border-[#0d0f36]/5">
                <div className="mb-16">
                    <h2 className="text-4xl md:text-6xl font-black italic tracking-tighter">
                        Bitácora <span className="text-primary italic">Exclusiva</span>
                    </h2>
                    <p className="text-xl font-bold text-muted-foreground/80 mt-4 leading-relaxed">
                        Accede a los folders secretos y crónicas actualizadas por nuestros cuidadores.
                    </p>
                </div>
                <AnimalFolders folders={animal.folders} />
            </div>
        </div>
    );
}
