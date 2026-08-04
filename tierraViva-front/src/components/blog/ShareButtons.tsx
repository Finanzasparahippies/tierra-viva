"use client";

import { useState, useEffect } from "react";
import { Share2, Link as LinkIcon, Check, X, MessageCircle, Facebook, Linkedin } from "lucide-react";

interface ShareButtonsProps {
    title: string;
    url: string;
}

export const ShareButtons = ({ title, url }: ShareButtonsProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const [copied, setCopied] = useState(false);

    const shareUrl = url.startsWith("http") ? url : (typeof window !== "undefined" ? window.location.origin + url : url);
    const encodedUrl = encodeURIComponent(shareUrl);
    const encodedTitle = encodeURIComponent(title);

    const socialLinks = [
        {
            name: "WhatsApp",
            icon: <MessageCircle className="w-5 h-5" />,
            color: "bg-[#25D366]",
            href: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`,
        },
        {
            name: "Facebook",
            icon: <Facebook className="w-5 h-5" />,
            color: "bg-[#1877F2]",
            href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
        },
        {
            name: "X (Twitter)",
            icon: (
                <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
            ),
            color: "bg-black",
            href: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
        },
        {
            name: "LinkedIn",
            icon: <Linkedin className="w-5 h-5" />,
            color: "bg-[#0A66C2]",
            href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
        },
    ];

    const handleCopy = () => {
        navigator.clipboard.writeText(shareUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    // Close on escape
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === "Escape") setIsOpen(false);
        };
        window.addEventListener("keydown", handleEsc);
        return () => window.removeEventListener("keydown", handleEsc);
    }, []);

    return (
        <>
            <div className="flex gap-4">
                <button
                    onClick={() => setIsOpen(true)}
                    className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-all bg-muted/30 hover:bg-primary/10 px-6 py-2.5 rounded-full text-sm font-medium border border-transparent hover:border-primary/20"
                >
                    <Share2 size={18} />
                    Compartir
                </button>
            </div>

            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
                    {/* Overlay */}
                    <div 
                        className="absolute inset-0 bg-background/40 backdrop-blur-md animate-in fade-in duration-300"
                        onClick={() => setIsOpen(false)}
                    />
                    
                    {/* Modal */}
                    <div className="relative w-full max-w-sm bg-card border shadow-2xl rounded-3xl overflow-hidden animate-in zoom-in-95 fade-in duration-300">
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-xl font-bold">Compartir artículo</h3>
                                <button 
                                    onClick={() => setIsOpen(false)}
                                    className="p-2 hover:bg-muted rounded-full transition-colors"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="grid grid-cols-2 gap-4 mb-8">
                                {socialLinks.map((social) => (
                                    <a
                                        key={social.name}
                                        href={social.href}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex flex-col items-center gap-2 p-4 rounded-2xl hover:bg-muted transition-all group"
                                    >
                                        <div className={`${social.color} w-12 h-12 rounded-full flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform`}>
                                            {social.icon}
                                        </div>
                                        <span className="text-xs font-semibold">{social.name}</span>
                                    </a>
                                ))}
                            </div>

                            <div className="relative">
                                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                                    <LinkIcon size={14} className="text-muted-foreground" />
                                </div>
                                <input
                                    type="text"
                                    readOnly
                                    value={shareUrl}
                                    className="w-full bg-muted/50 border-none rounded-2xl py-3 pl-10 pr-24 text-xs font-medium focus:ring-1 focus:ring-primary/20"
                                />
                                <button
                                    onClick={handleCopy}
                                    className="absolute right-2 top-1.5 bottom-1.5 px-4 bg-primary text-primary-foreground rounded-xl text-xs font-bold hover:opacity-90 transition-opacity flex items-center gap-2"
                                >
                                    {copied ? (
                                        <>
                                            <Check size={12} />
                                            Copiado
                                        </>
                                    ) : (
                                        "Copiar"
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};
