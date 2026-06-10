"use client";

import { AnimalContentFolder } from "@/lib/types";
import { Lock, FolderOpen, Image as ImageIcon, PlayCircle, X } from "lucide-react";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { optimizeImage } from "@/lib/utils";

interface AnimalFoldersProps {
    folders: AnimalContentFolder[];
    title?: string;
}

export default function AnimalFolders({ folders, title = "Galerías Exclusivas" }: AnimalFoldersProps) {
    const [selectedFolder, setSelectedFolder] = useState<AnimalContentFolder | null>(null);
    const [selectedItem, setSelectedItem] = useState<any | null>(null);

    if (!folders || folders.length === 0) return null;

    return (
        <div className="space-y-8 pt-12 border-t">
            <div className="flex items-center gap-3">
                <FolderOpen className="w-8 h-8 text-primary" />
                <h2 className="text-3xl font-bold">{title}</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {folders.map((folder) => (
                    <div 
                        key={folder.id}
                        onClick={() => !folder.is_locked && setSelectedFolder(folder)}
                        className={`group relative overflow-hidden rounded-3xl border bg-card shadow-sm transition-all ${
                            folder.is_locked 
                            ? "cursor-not-allowed opacity-80" 
                            : "cursor-pointer hover:shadow-xl hover:-translate-y-1"
                        }`}
                    >
                        {/* Cover Image */}
                        <div className="aspect-video relative overflow-hidden bg-muted group-hover:scale-105 transition-all duration-700">
                            {folder.cover_image_url ? (
                                <img 
                                    src={optimizeImage(folder.cover_image_url)} 
                                    alt={folder.name}
                                    className={`object-cover w-full h-full transition-all duration-1000 ${
                                        folder.is_locked 
                                        ? "blur-[8px] grayscale opacity-60 scale-110" 
                                        : "group-hover:scale-110"
                                    }`}
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-muted-foreground bg-secondary/5">
                                    <ImageIcon className="w-12 h-12 opacity-20" />
                                </div>
                            )}

                            {/* Lock Overlay */}
                            {folder.is_locked && (
                                <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex flex-col items-center justify-center text-white p-4 text-center group-hover:bg-black/50 transition-all duration-500">
                                    <div className="bg-primary/90 p-3 rounded-full shadow-2xl mb-3 animate-in zoom-in duration-500 border-2 border-white/20">
                                        <Lock className="w-8 h-8 text-white" />
                                    </div>
                                    <p className="font-black text-xl tracking-tight mb-1">Galería Exclusiva</p>
                                    <div className="bg-white/20 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.15em] backdrop-blur-md">
                                        Nivel {folder.min_tier_level} Requerido
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Folder Info */}
                        <div className="p-5">
                            <h3 className="text-xl font-bold mb-1">{folder.name}</h3>
                            <div className="flex items-center justify-between text-sm text-muted-foreground">
                                <span>{folder.media?.length || 0} archivos</span>
                                {!folder.is_locked && (
                                    <span className="text-primary font-medium group-hover:underline">Ver contenido &rarr;</span>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Gallery Dialog */}
            <Dialog open={!!selectedFolder} onOpenChange={() => setSelectedFolder(null)}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl p-8">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                            <FolderOpen className="text-primary" />
                            {selectedFolder?.name}
                        </DialogTitle>
                    </DialogHeader>
                    
                    <div className="grid grid-cols-2 md:md:grid-cols-3 gap-4 mt-6">
                        {selectedFolder?.media?.map((item) => (
                            <div key={item.id} className="group relative aspect-square rounded-2xl overflow-hidden bg-muted border border-border shadow-sm">
                                {item.media_type === 'IMAGE' ? (
                                    <div 
                                        className="w-full h-full cursor-zoom-in"
                                        onClick={() => setSelectedItem(item)}
                                    >
                                        <img 
                                            src={optimizeImage(item.file_url)} 
                                            alt="Gallery Item" 
                                            className="object-cover w-full h-full transition-transform hover:scale-105"
                                        />
                                    </div>
                                ) : (
                                    <div className="w-full h-full flex flex-col items-center justify-center bg-secondary/10 relative">
                                        <PlayCircle className="w-12 h-12 text-primary" />
                                        <p className="text-xs mt-2 font-medium">Video exclusivo</p>
                                        <video 
                                            src={item.file_url} 
                                            className="absolute inset-0 w-full h-full object-cover opacity-0 hover:opacity-100 transition-opacity"
                                            controls
                                        />
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </DialogContent>
            </Dialog>

            {/* Lightbox for Full View */}
            <Dialog open={!!selectedItem} onOpenChange={() => setSelectedItem(null)}>
                <DialogContent className="max-w-[95vw] lg:max-w-6xl h-screen md:h-auto p-0 overflow-hidden bg-black/95 rounded-none md:rounded-[3rem] border-none">
                    <div className="relative w-full h-full min-h-[50vh] flex items-center justify-center p-4">
                        {selectedItem?.media_type === 'IMAGE' && (
                            <>
                                {/* Ambient Glow backdrop */}
                                <img 
                                    src={optimizeImage(selectedItem.file_url)} 
                                    alt=""
                                    className="absolute inset-0 w-full h-full object-cover blur-3xl opacity-30 scale-150 pointer-events-none"
                                />
                                {/* Full Image View */}
                                <img 
                                    src={optimizeImage(selectedItem.file_url)} 
                                    alt="Full View" 
                                    className="relative z-10 object-contain max-w-full max-h-full shadow-2xl rounded-2xl"
                                />
                            </>
                        )}
                        <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => setSelectedItem(null)}
                            className="absolute top-6 right-6 z-20 bg-black/20 backdrop-blur-md rounded-full text-white hover:bg-white/20"
                        >
                            <Lock className="w-5 h-5 rotate-45" /> {/* Use close icon or similar if available */}
                            <X className="w-5 h-5" />
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
