"use client";

import React, { useState, useRef, useEffect } from "react";
import { 
    Bold, Italic, Underline, Strikethrough, Heading1, Heading2, Heading3, 
    List, ListOrdered, Quote, Link as LinkIcon, Image as ImageIcon, 
    Smile, Eraser, Upload
} from "lucide-react";

interface RichTextEditorProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    minHeight?: string;
}

const EMOJIS = ["🐝", "🌿", "🍯", "🐄", "🌻", "🚜", "⭐", "❤️", "🐾", "🌾", "🍎", "🪵", "✨", "☀️"];

export function RichTextEditor({ 
    value, 
    onChange, 
    placeholder = "Escribe tu contenido aquí...",
    minHeight = "240px"
}: RichTextEditorProps) {
    const editorRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [mounted, setMounted] = useState(false);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [showImageModal, setShowImageModal] = useState(false);
    const [imageUrlInput, setImageUrlInput] = useState("");

    useEffect(() => {
        setMounted(true);
    }, []);

    // Sync initial value or external updates if HTML differs
    useEffect(() => {
        if (editorRef.current && value !== editorRef.current.innerHTML) {
            if (document.activeElement !== editorRef.current) {
                editorRef.current.innerHTML = value || "";
            }
        }
    }, [value]);

    // Save and Restore Range to prevent cursor jumping
    const saveSelection = (): Range | null => {
        if (typeof window === "undefined") return null;
        const sel = window.getSelection();
        if (sel && sel.rangeCount > 0) {
            return sel.getRangeAt(0);
        }
        return null;
    };

    const restoreSelection = (range: Range | null) => {
        if (!range || typeof window === "undefined" || !editorRef.current) return;
        const sel = window.getSelection();
        if (sel) {
            sel.removeAllRanges();
            sel.addRange(range);
        }
    };

    const execCommand = (command: string, value: string | undefined = undefined) => {
        if (!editorRef.current) return;
        const savedRange = saveSelection();
        editorRef.current.focus();
        if (savedRange) restoreSelection(savedRange);
        
        document.execCommand(command, false, value);
        handleInput();
    };

    const execBlockToggle = (tag: string) => {
        if (!editorRef.current) return;
        const savedRange = saveSelection();
        editorRef.current.focus();
        if (savedRange) restoreSelection(savedRange);

        // Check if currently inside target block
        const sel = window.getSelection();
        let isAlreadyBlock = false;
        if (sel && sel.anchorNode) {
            let parent: Node | null = sel.anchorNode.nodeType === 3 ? sel.anchorNode.parentNode : sel.anchorNode;
            while (parent && parent !== editorRef.current) {
                if (parent.nodeName.toLowerCase() === tag.toLowerCase()) {
                    isAlreadyBlock = true;
                    break;
                }
                parent = parent.parentNode;
            }
        }

        const targetTag = isAlreadyBlock ? "<p>" : `<${tag}>`;
        document.execCommand("formatBlock", false, targetTag);
        handleInput();
    };

    const handleInput = () => {
        if (editorRef.current) {
            const html = editorRef.current.innerHTML;
            onChange(html === "<br>" ? "" : html);
        }
    };

    const handleInsertLink = () => {
        const url = prompt("Ingresa la URL del enlace:");
        if (url) {
            execCommand("createLink", url);
        }
    };

    const handleInsertImage = (url: string) => {
        if (url) {
            execCommand("insertImage", url);
            setShowImageModal(false);
            setImageUrlInput("");
        }
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (uploadEvent) => {
                const base64 = uploadEvent.target?.result as string;
                if (base64) {
                    handleInsertImage(base64);
                }
            };
            reader.readAsDataURL(file);
        }
    };

    const handleInsertEmoji = (emoji: string) => {
        execCommand("insertText", emoji);
        setShowEmojiPicker(false);
    };

    if (!mounted) return null;

    return (
        <div className="border border-border rounded-2xl bg-card overflow-hidden shadow-sm transition-all focus-within:ring-2 focus-within:ring-primary/40">
            {/* Scoped CSS for Rich Text Formatting inside the editor */}
            <style dangerouslySetInnerHTML={{__html: `
                .editor-content h1 {
                    font-size: 1.6rem !important;
                    font-weight: 800 !important;
                    color: #1b4332 !important;
                    margin: 0.75rem 0 !important;
                    display: block !important;
                }
                .dark .editor-content h1 {
                    color: #40916c !important;
                }
                .editor-content h2 {
                    font-size: 1.35rem !important;
                    font-weight: 750 !important;
                    color: #2d6a4f !important;
                    margin: 0.5rem 0 !important;
                    display: block !important;
                }
                .dark .editor-content h2 {
                    color: #52b788 !important;
                }
                .editor-content h3 {
                    font-size: 1.15rem !important;
                    font-weight: 700 !important;
                    margin: 0.5rem 0 !important;
                    display: block !important;
                }
                .editor-content blockquote {
                    border-left: 4px solid #f59e0b !important;
                    background-color: rgba(245, 158, 11, 0.08) !important;
                    padding: 0.5rem 1rem !important;
                    border-radius: 0 0.5rem 0.5rem 0 !important;
                    font-style: italic !important;
                    margin: 0.75rem 0 !important;
                    display: block !important;
                }
                .editor-content ul {
                    list-style-type: disc !important;
                    padding-left: 1.5rem !important;
                    margin: 0.5rem 0 !important;
                    display: block !important;
                }
                .editor-content ol {
                    list-style-type: decimal !important;
                    padding-left: 1.5rem !important;
                    margin: 0.5rem 0 !important;
                    display: block !important;
                }
                .editor-content li {
                    display: list-item !important;
                }
                .editor-content img {
                    border-radius: 1rem !important;
                    max-width: 100% !important;
                    margin: 0.5rem 0 !important;
                }
            `}} />

            {/* Toolbar Executiva */}
            <div className="flex flex-wrap items-center gap-1 p-2 bg-muted/40 border-b border-border text-foreground select-none">
                {/* Text Formats */}
                <div className="flex items-center gap-0.5 border-r border-border pr-1.5 mr-1">
                    <button
                        type="button"
                        onClick={() => execCommand("bold")}
                        className="p-1.5 rounded-lg hover:bg-primary/10 hover:text-primary transition-colors"
                        title="Negrita"
                    >
                        <Bold className="w-4 h-4" />
                    </button>
                    <button
                        type="button"
                        onClick={() => execCommand("italic")}
                        className="p-1.5 rounded-lg hover:bg-primary/10 hover:text-primary transition-colors"
                        title="Cursiva"
                    >
                        <Italic className="w-4 h-4" />
                    </button>
                    <button
                        type="button"
                        onClick={() => execCommand("underline")}
                        className="p-1.5 rounded-lg hover:bg-primary/10 hover:text-primary transition-colors"
                        title="Subrayado"
                    >
                        <Underline className="w-4 h-4" />
                    </button>
                    <button
                        type="button"
                        onClick={() => execCommand("strikeThrough")}
                        className="p-1.5 rounded-lg hover:bg-primary/10 hover:text-primary transition-colors"
                        title="Tachado"
                    >
                        <Strikethrough className="w-4 h-4" />
                    </button>
                </div>

                {/* Headings */}
                <div className="flex items-center gap-0.5 border-r border-border pr-1.5 mr-1">
                    <button
                        type="button"
                        onClick={() => execBlockToggle("h1")}
                        className="p-1.5 rounded-lg hover:bg-primary/10 hover:text-primary font-bold text-xs transition-colors"
                        title="Título 1 (H1)"
                    >
                        <Heading1 className="w-4 h-4" />
                    </button>
                    <button
                        type="button"
                        onClick={() => execBlockToggle("h2")}
                        className="p-1.5 rounded-lg hover:bg-primary/10 hover:text-primary font-bold text-xs transition-colors"
                        title="Título 2 (H2)"
                    >
                        <Heading2 className="w-4 h-4" />
                    </button>
                    <button
                        type="button"
                        onClick={() => execBlockToggle("h3")}
                        className="p-1.5 rounded-lg hover:bg-primary/10 hover:text-primary font-bold text-xs transition-colors"
                        title="Título 3 (H3)"
                    >
                        <Heading3 className="w-4 h-4" />
                    </button>
                </div>

                {/* Lists & Quotes */}
                <div className="flex items-center gap-0.5 border-r border-border pr-1.5 mr-1">
                    <button
                        type="button"
                        onClick={() => execCommand("insertUnorderedList")}
                        className="p-1.5 rounded-lg hover:bg-primary/10 hover:text-primary transition-colors"
                        title="Lista Viñetas"
                    >
                        <List className="w-4 h-4" />
                    </button>
                    <button
                        type="button"
                        onClick={() => execCommand("insertOrderedList")}
                        className="p-1.5 rounded-lg hover:bg-primary/10 hover:text-primary transition-colors"
                        title="Lista Numerada"
                    >
                        <ListOrdered className="w-4 h-4" />
                    </button>
                    <button
                        type="button"
                        onClick={() => execBlockToggle("blockquote")}
                        className="p-1.5 rounded-lg hover:bg-primary/10 hover:text-primary transition-colors"
                        title="Cita Destacada"
                    >
                        <Quote className="w-4 h-4" />
                    </button>
                </div>

                {/* Media & Link */}
                <div className="flex items-center gap-0.5 border-r border-border pr-1.5 mr-1">
                    <button
                        type="button"
                        onClick={handleInsertLink}
                        className="p-1.5 rounded-lg hover:bg-primary/10 hover:text-primary transition-colors"
                        title="Insertar Enlace"
                    >
                        <LinkIcon className="w-4 h-4" />
                    </button>
                    <button
                        type="button"
                        onClick={() => setShowImageModal(true)}
                        className="p-1.5 rounded-lg hover:bg-primary/10 hover:text-primary transition-colors"
                        title="Insertar Imagen"
                    >
                        <ImageIcon className="w-4 h-4" />
                    </button>
                </div>

                {/* Emojis Picker Dropdown */}
                <div className="relative">
                    <button
                        type="button"
                        onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                        className="p-1.5 rounded-lg hover:bg-amber-500/10 text-amber-600 dark:text-amber-400 transition-colors"
                        title="Insertar Emoji Organico"
                    >
                        <Smile className="w-4 h-4" />
                    </button>

                    {showEmojiPicker && (
                        <div className="absolute left-0 top-full mt-2 z-50 p-2 bg-card border border-border rounded-xl shadow-xl grid grid-cols-7 gap-1 w-52">
                            {EMOJIS.map((emoji) => (
                                <button
                                    key={emoji}
                                    type="button"
                                    onClick={() => handleInsertEmoji(emoji)}
                                    className="p-1.5 hover:bg-muted rounded-lg text-lg transition-transform active:scale-125"
                                >
                                    {emoji}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Clean Format */}
                <button
                    type="button"
                    onClick={() => execCommand("removeFormat")}
                    className="p-1.5 rounded-lg hover:bg-destructive/10 text-destructive ml-auto transition-colors"
                    title="Limpiar Formato"
                >
                    <Eraser className="w-4 h-4" />
                </button>
            </div>

            {/* Content Editable Body */}
            <div
                ref={editorRef}
                contentEditable
                onInput={handleInput}
                className="editor-content p-4 text-foreground outline-none overflow-y-auto max-w-none text-sm leading-relaxed"
                style={{ minHeight }}
                data-placeholder={placeholder}
            />

            {/* Image Modal */}
            {showImageModal && (
                <div className="p-4 bg-muted/30 border-t border-border space-y-3">
                    <p className="text-xs font-bold text-foreground uppercase tracking-wider">Insertar Imagen en el Artículo</p>
                    <div className="flex flex-col md:flex-row gap-2">
                        <input
                            type="url"
                            value={imageUrlInput}
                            onChange={(e) => setImageUrlInput(e.target.value)}
                            placeholder="URL de la imagen (Ej: Cloudinary, Unsplash...)"
                            className="flex-1 px-3 py-1.5 text-xs rounded-xl border border-input bg-card text-foreground"
                        />
                        <button
                            type="button"
                            onClick={() => handleInsertImage(imageUrlInput)}
                            disabled={!imageUrlInput.trim()}
                            className="px-4 py-1.5 bg-primary text-primary-foreground text-xs font-bold rounded-xl disabled:opacity-50"
                        >
                            Insertar URL
                        </button>
                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="px-4 py-1.5 bg-secondary text-secondary-foreground text-xs font-bold rounded-xl flex items-center justify-center gap-1"
                        >
                            <Upload className="w-3.5 h-3.5" /> Subir Local
                        </button>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleFileUpload}
                            className="hidden"
                        />
                        <button
                            type="button"
                            onClick={() => setShowImageModal(false)}
                            className="px-3 py-1.5 text-xs font-bold text-muted-foreground hover:bg-muted rounded-xl"
                        >
                            Cancelar
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default RichTextEditor;
