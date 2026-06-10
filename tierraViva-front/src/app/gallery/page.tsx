"use client";

import { useEffect, useState } from "react";
import { getSpecies, getFolders } from "@/lib/api";
import { AnimalContentFolder, Species } from "@/lib/types";
import AnimalFolders from "@/components/animals/AnimalFolders";
import { Skeleton } from "@/components/ui/skeleton";
import { ImageIcon, Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function GalleryPage() {
    const [species, setSpecies] = useState<Species[]>([]);
    const [folders, setFolders] = useState<AnimalContentFolder[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedSpecies, setSelectedSpecies] = useState<number | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [speciesData, foldersData] = await Promise.all([
                    getSpecies(),
                    getFolders()
                ]);
                setSpecies(speciesData);
                setFolders(foldersData);
            } catch (error) {
                console.error("Error fetching gallery data:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const filteredFolders = folders.filter(folder => {
        const matchesSearch = folder.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesSpecies = selectedSpecies ? folder.species === selectedSpecies : true;
        return matchesSearch && matchesSpecies;
    });

    // Group folders by species for the "By Species" view
    const foldersBySpecies = species.map(s => ({
        ...s,
        folders: folders.filter(f => f.species === s.id)
    })).filter(s => s.folders.length > 0);

    // General ranch folders (no species)
    const generalFolders = folders.filter(f => !f.species && !f.animal);

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-12 space-y-8 mt-10">
                <div className="space-y-4 text-center">
                    <Skeleton className="h-12 w-64 mx-auto rounded-full" />
                    <Skeleton className="h-6 w-96 mx-auto rounded-full opacity-50" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {[1, 2, 3].map(i => (
                        <Skeleton key={i} className="h-64 rounded-[2.5rem]" />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-16 space-y-16 relative">
            {/* Background Glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-96 bg-primary/5 blur-[120px] rounded-full pointer-events-none -z-10" />

            {/* Hero Section */}
            <div className="text-center space-y-6 max-w-3xl mx-auto">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-black uppercase tracking-widest mb-2">
                    <ImageIcon className="w-4 h-4" /> Galería Multimedia
                </div>
                <h1 className="text-5xl md:text-7xl font-black tracking-tight leading-tight">
                    Explora la vida en el <span className="text-primary italic">Santuario</span>
                </h1>
                <p className="text-xl text-muted-foreground font-medium">
                    Actualizaciones constantes de todos nuestros rescatados. Sé testigo de su recuperación y felicidad.
                </p>
            </div>

            {/* Controls */}
            <div className="flex flex-col md:flex-row gap-6 items-center justify-between bg-card/50 backdrop-blur-md p-6 rounded-[2.5rem] border border-primary/5 shadow-xl shadow-primary/5">
                <div className="relative w-full md:max-w-md">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                        placeholder="¿Qué buscas hoy? (ej: Rescate, Caballos...)"
                        className="pl-14 h-15 rounded-[1.5rem] border-none bg-background/50 focus-visible:ring-primary/20 text-lg font-bold"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="flex items-center gap-4 w-full md:w-auto">
                    <div className="flex items-center gap-2 bg-background/50 px-4 py-2 rounded-2xl border border-primary/10 w-full md:w-64">
                        <Filter className="w-4 h-4 text-primary" />
                        <select
                            className="bg-transparent border-none focus:ring-0 font-bold text-sm w-full cursor-pointer outline-none"
                            value={selectedSpecies || ""}
                            onChange={(e) => setSelectedSpecies(e.target.value ? Number(e.target.value) : null)}
                        >
                            <option value="">Todas las especies</option>
                            {species.map(s => (
                                <option key={s.id} value={s.id}>{s.name}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Gallery Sections */}
            <div className="space-y-24">
                {/* General Ranch View */}
                {generalFolders.length > 0 && !selectedSpecies && (
                    <div className="space-y-4">
                        <AnimalFolders
                            folders={generalFolders.filter(f => f.name.toLowerCase().includes(searchTerm.toLowerCase()))}
                            title="Actualizaciones Generales"
                        />
                    </div>
                )}

                {/* Species Groups */}
                {foldersBySpecies
                    .filter(s => selectedSpecies ? s.id === selectedSpecies : true)
                    .map(s => (
                        <div key={s.id} className="space-y-8 p-8 rounded-[3rem] bg-secondary/5 border border-primary/5 animate-in fade-in duration-700">
                            <div className="flex items-center gap-4 border-b border-primary/10 pb-6 mb-8">
                                <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center text-3xl shadow-inner">
                                    🐾
                                </div>
                                <div>
                                    <h2 className="text-4xl font-black tracking-tight">{s.name}</h2>
                                    <p className="text-muted-foreground font-bold italic">Galería exclusiva de esta especie</p>
                                </div>
                            </div>

                            <AnimalFolders
                                folders={s.folders.filter(f => f.name.toLowerCase().includes(searchTerm.toLowerCase()))}
                                title="Momentos"
                            />
                        </div>
                    ))}

                {filteredFolders.length === 0 && (
                    <div className="text-center py-20 space-y-4 opacity-50">
                        <div className="text-6xl mx-auto">🍃</div>
                        <h3 className="text-2xl font-black">No encontramos galerías con esos filtros</h3>
                        <Button variant="outline" onClick={() => { setSearchTerm(""); setSelectedSpecies(null) }} className="rounded-full">
                            Ver todo el contenido
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}
