"use client";

import { useState, useEffect } from "react";
import { getTeam } from "@/lib/api";
import { User } from "@/lib/types";
import { 
    Instagram, 
    Linkedin, 
    Twitter, 
    Mail, 
    MessageCircle,
    Users,
    Heart,
    Leaf
} from "lucide-react";

export default function AboutPage() {
    const [team, setTeam] = useState<User[]>([]);
    const [activeTab, setActiveTab] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTeam = async () => {
            try {
                const data = await getTeam();
                setTeam(data);
            } catch (error) {
                console.error("Error fetching team:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchTeam();
    }, []);

    const activeMember = team[activeTab];

    return (
        <div className="max-w-6xl mx-auto px-4 py-12 space-y-24 animate-in fade-in duration-1000">
            {/* Hero Section */}
            <section className="text-center space-y-6 max-w-3xl mx-auto">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-bold uppercase tracking-widest mb-4">
                    <Heart size={16} />
                    Nuestra Misión
                </div>
                <h1 className="text-5xl md:text-6xl font-black tracking-tight leading-tight">
                    Protegiendo la vida en todas sus formas
                </h1>
                <p className="text-xl text-muted-foreground leading-relaxed italic">
                    "TierraViva nació en 2020 con un propósito claro: reconectar a las personas con la naturaleza y proteger a los animales vulnerables."
                </p>
            </section>

            {/* Content Grid */}
            <div className="grid md:grid-cols-2 gap-12 items-center">
                <div className="space-y-8">
                    <div className="space-y-4">
                        <h2 className="text-3xl font-bold flex items-center gap-3">
                            <Users className="text-primary" />
                            ¿Quiénes somos?
                        </h2>
                        <p className="text-lg text-muted-foreground leading-relaxed">
                            Somos una familia apasionada por el medio ambiente y el bienestar animal. 
                            Lo que comenzó como un pequeño refugio se ha convertido en una comunidad vibrante de 
                            personas comprometidas con el cambio positivo.
                        </p>
                    </div>

                    <div className="space-y-4">
                        <h2 className="text-3xl font-bold flex items-center gap-3">
                            <Leaf className="text-primary" />
                            Lo que hacemos
                        </h2>
                        <ul className="grid grid-cols-1 gap-4">
                            {[
                                "Rescate y rehabilitación de fauna doméstica y silvestre.",
                                "Promoción de productos locales y sostenibles.",
                                "Talleres educativos sobre conservación y ecología.",
                                "Programas de apadrinamiento vitales."
                            ].map((item, i) => (
                                <li key={i} className="flex items-start gap-4 p-4 rounded-2xl bg-card border border-border/50 shadow-sm hover:shadow-md transition-all">
                                    <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center shrink-0 mt-1">
                                        <div className="h-2 w-2 rounded-full bg-primary" />
                                    </div>
                                    <span className="text-muted-foreground">{item}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                <div className="relative aspect-square rounded-[3rem] overflow-hidden shadow-2xl skew-y-1 hover:skew-y-0 transition-transform duration-700">
                    <img 
                        src="https://images.unsplash.com/photo-1544391682-17ef1f3585ad?q=80&w=1000" 
                        alt="Tierra Viva Nature" 
                        className="object-cover w-full h-full scale-110 hover:scale-100 transition-transform duration-1000"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-10 left-10 text-white space-y-2">
                        <p className="text-4xl font-black">2020</p>
                        <p className="text-sm uppercase tracking-widest opacity-80">Fundación de TierraViva</p>
                    </div>
                </div>
            </div>

            {/* Team Tabs Section */}
            <section className="space-y-12">
                <div className="text-center space-y-4">
                    <h2 className="text-4xl font-black tracking-tight">Nuestro Equipo</h2>
                    <p className="text-muted-foreground">Conoce a las personas que hacen esto posible.</p>
                </div>

                {loading ? (
                    <div className="flex justify-center py-20">
                        <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
                    </div>
                ) : team.length > 0 ? (
                    <div className="space-y-8">
                        {/* Tab Headers */}
                        <div className="flex flex-wrap justify-center gap-2 p-2 bg-muted/30 rounded-[2rem] border border-border/50 max-w-2xl mx-auto">
                            {team.map((member, i) => (
                                <button
                                    key={member.id}
                                    onClick={() => setActiveTab(i)}
                                    className={`px-6 py-3 rounded-full text-sm font-bold transition-all ${
                                        activeTab === i 
                                        ? "bg-primary text-white shadow-lg shadow-primary/25 scale-105" 
                                        : "hover:bg-primary/10 text-muted-foreground"
                                    }`}
                                >
                                    {member.first_name || member.username}
                                </button>
                            ))}
                        </div>

                        {/* Tab Content */}
                        <div className="relative min-h-[500px] animate-in slide-in-from-bottom-4 duration-500">
                            {activeMember && (
                                <div className="grid md:grid-cols-12 gap-12 bg-card border border-border/40 rounded-[3rem] p-8 md:p-16 shadow-2xl shadow-primary/5">
                                    <div className="md:col-span-5 relative">
                                        <div className="aspect-[4/5] rounded-[2.5rem] overflow-hidden shadow-2xl relative group">
                                            {activeMember.family_profile?.photo_url ? (
                                                <img 
                                                    src={activeMember.family_profile.photo_url} 
                                                    alt={activeMember.first_name}
                                                    className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-700"
                                                />
                                            ) : (
                                                <div className="w-full h-full bg-secondary flex items-center justify-center text-6xl">👤</div>
                                            )}
                                        </div>
                                        {/* Social Links Overlay */}
                                        <div className="absolute -bottom-6 -right-6 flex flex-col gap-3 p-4 glass rounded-3xl shadow-xl">
                                            {activeMember.family_profile?.instagram_url && (
                                                <a href={activeMember.family_profile.instagram_url} target="_blank" className="p-3 bg-white/20 hover:bg-primary hover:text-white rounded-2xl transition-all shadow-sm">
                                                    <Instagram size={20} />
                                                </a>
                                            )}
                                            {activeMember.family_profile?.linkedin_url && (
                                                <a href={activeMember.family_profile.linkedin_url} target="_blank" className="p-3 bg-white/20 hover:bg-primary hover:text-white rounded-2xl transition-all shadow-sm">
                                                    <Linkedin size={20} />
                                                </a>
                                            )}
                                            {activeMember.family_profile?.twitter_url && (
                                                <a href={activeMember.family_profile.twitter_url} target="_blank" className="p-3 bg-white/20 hover:bg-primary hover:text-white rounded-2xl transition-all shadow-sm">
                                                    <Twitter size={20} />
                                                </a>
                                            )}
                                        </div>
                                    </div>

                                    <div className="md:col-span-7 flex flex-col justify-center space-y-8">
                                        <div className="space-y-2">
                                            <p className="text-primary font-bold uppercase tracking-[0.2em] text-sm">
                                                {activeMember.family_profile?.title || "Miembro del Equipo"}
                                            </p>
                                            <h3 className="text-5xl font-black tracking-tight">
                                                {activeMember.first_name} {activeMember.last_name}
                                            </h3>
                                        </div>

                                        <p className="text-xl text-muted-foreground leading-relaxed">
                                            {activeMember.family_profile?.bio || "Sin biografía disponible."}
                                        </p>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div className="flex items-center gap-4 p-4 rounded-2xl bg-muted/50 border border-border/40">
                                                <div className="p-2 bg-primary/10 text-primary rounded-lg italic">
                                                    <Mail size={18} />
                                                </div>
                                                <div className="overflow-hidden">
                                                    <p className="text-[10px] text-muted-foreground uppercase font-bold">Email</p>
                                                    <p className="text-sm font-medium truncate">{activeMember.email}</p>
                                                </div>
                                            </div>
                                            {activeMember.family_profile?.whatsapp && (
                                                <div className="flex items-center gap-4 p-4 rounded-2xl bg-muted/50 border border-border/40">
                                                    <div className="p-2 bg-green-500/10 text-green-600 rounded-lg">
                                                        <MessageCircle size={18} />
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] text-muted-foreground uppercase font-bold">WhatsApp</p>
                                                        <p className="text-sm font-medium">{activeMember.family_profile.whatsapp}</p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-20 card p-12 rounded-[2rem] bg-muted/30">
                        <p className="text-muted-foreground">Aún no se han añadido miembros al equipo en el panel administrativo.</p>
                    </div>
                )}
            </section>

            {/* Footer Call to Action */}
            <section className="bg-primary p-12 md:p-24 rounded-[4rem] text-center text-white space-y-8 relative overflow-hidden shadow-2xl shadow-primary/30">
                <div className="absolute top-0 right-0 p-12 opacity-10">
                    <Heart size={200} />
                </div>
                <h3 className="text-4xl md:text-5xl font-black leading-tight">¿Quieres ser parte de <br/> nuestra historia?</h3>
                <p className="text-xl opacity-90 max-w-2xl mx-auto">
                    Juntos podemos hacer una gran diferencia. Cada acción cuenta, desde una pequeña compra hasta un apadrinamiento vital.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                    <button className="px-10 py-5 bg-white text-primary rounded-full font-black text-lg shadow-xl hover:scale-105 active:scale-95 transition-all">
                        Apadrinar ahora
                    </button>
                    <button className="px-10 py-5 bg-primary-foreground/10 hover:bg-white/10 text-white border border-white/20 rounded-full font-black text-lg transition-all">
                        Ver Tienda
                    </button>
                </div>
            </section>
        </div>
    );
}
