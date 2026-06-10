"use client";

import { useQuery } from "@tanstack/react-query";
import { getRanchTags } from "@/lib/api";
import { RanchUpdateTag } from "@/lib/types";
import { Search, Tag, X, Sparkles } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect } from "react";
import { useDebounce } from "@/hooks/use-debounce";

interface RanchUpdateFiltersProps {
    onFilterChange: (filters: { search: string; tag: string }) => void;
}

export function RanchUpdateFilters({ onFilterChange }: RanchUpdateFiltersProps) {
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedTag, setSelectedTag] = useState<string>("");
    
    // Add custom useDebounce or just trigger on enter/change
    const debouncedSearch = useDebounce(searchTerm, 500);

    const { data: tags = [] } = useQuery<RanchUpdateTag[]>({
        queryKey: ['ranch-tags'],
        queryFn: getRanchTags
    });

    useEffect(() => {
        onFilterChange({ search: debouncedSearch, tag: selectedTag });
    }, [debouncedSearch, selectedTag, onFilterChange]);

    const clearFilters = () => {
        setSearchTerm("");
        setSelectedTag("");
    };

    return (
        <div className="w-full space-y-8 py-12">
            {/* Search Bar */}
            <div className="relative max-w-2xl mx-auto group">
                <div className="absolute inset-0 bg-primary/20 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 -z-10" />
                <div className="relative flex items-center">
                    <Search className="absolute left-6 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    <Input
                        placeholder="Buscar en la bitácora... (ej. Rescate, Salud, El Rancho)"
                        className="h-16 pl-14 pr-6 bg-card border-2 border-border/50 rounded-3xl text-lg font-bold shadow-xl focus-visible:ring-primary focus-visible:border-primary transition-all group-hover:border-primary/30"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    {searchTerm && (
                        <button 
                            onClick={clearFilters}
                            className="absolute right-6 p-1 hover:bg-primary/10 rounded-full transition-colors"
                        >
                            <X className="w-4 h-4 text-muted-foreground" />
                        </button>
                    )}
                </div>
            </div>

            {/* Tag Cloud */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground/60 flex items-center gap-2">
                        <Tag className="w-3 h-3" /> Explorar por Etiquetas
                    </h3>
                    {selectedTag && (
                        <button 
                            onClick={() => setSelectedTag("")}
                            className="text-xs font-black text-primary hover:underline flex items-center gap-1"
                        >
                            Limpiar filtros <X className="w-3 h-3" />
                        </button>
                    )}
                </div>
                
                <div className="flex flex-wrap gap-3">
                    <Badge 
                        variant={selectedTag === "" ? "default" : "outline"}
                        className={`h-10 px-6 rounded-2xl cursor-pointer text-xs font-black uppercase tracking-widest transition-all ${
                            selectedTag === "" 
                            ? "shadow-lg shadow-primary/20 scale-105" 
                            : "hover:border-primary/50 hover:bg-primary/5"
                        }`}
                        onClick={() => setSelectedTag("")}
                    >
                        <Sparkles className="w-3 h-3 mr-2" /> Todas
                    </Badge>
                    
                    {tags.map((tag) => (
                        <Badge 
                            key={tag.id}
                            variant={selectedTag === tag.slug ? "default" : "outline"}
                            className={`h-10 px-6 rounded-2xl cursor-pointer text-xs font-black uppercase tracking-widest transition-all ${
                                selectedTag === tag.slug 
                                ? "shadow-lg shadow-primary/20 scale-105" 
                                : "hover:border-primary/50 hover:bg-primary/5"
                            }`}
                            onClick={() => setSelectedTag(tag.slug)}
                        >
                            #{tag.name}
                        </Badge>
                    ))}
                </div>
            </div>
        </div>
    );
}
