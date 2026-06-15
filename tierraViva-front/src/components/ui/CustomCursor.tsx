"use client";

import { useEffect, useState, useRef } from "react";

export function CustomCursor() {
    const cursorDotRef = useRef<HTMLDivElement>(null);
    const cursorOutlineRef = useRef<HTMLDivElement>(null);
    const [isVisible, setIsVisible] = useState(true);
    const [isHovering, setIsHovering] = useState(false);
    const [isText, setIsText] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (!mounted) return;

        const moveCursor = (e: MouseEvent) => {
            if (!isVisible) setIsVisible(true);
            
            const { clientX: x, clientY: y } = e;
            
            if (cursorDotRef.current) {
                cursorDotRef.current.style.transform = `translate3d(${x}px, ${y}px, 0)`;
            }
            if (cursorOutlineRef.current) {
                cursorOutlineRef.current.style.transform = `translate3d(${x}px, ${y}px, 0)`;
            }
        };

        const handleMouseDown = () => setIsHovering(true);
        const handleMouseUp = () => setIsHovering(false);
        
        const handleMouseOver = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            
            // Check for interactive pointer elements (buttons, links)
            const isPointer = !!(
                target.tagName === 'A' || 
                target.tagName === 'BUTTON' || 
                target.closest('button') || 
                target.closest('a') ||
                target.classList.contains('cursor-pointer') ||
                window.getComputedStyle(target).cursor === 'pointer'
            );
            
            // Check for text entry elements
            const isTextElement = (
                target.tagName === 'INPUT' || 
                target.tagName === 'TEXTAREA' || 
                target.isContentEditable ||
                window.getComputedStyle(target).cursor === 'text'
            );

            setIsHovering(isPointer);
            setIsText(isTextElement);
        };
        
        const handleMouseOut = () => {
            setIsHovering(false);
            setIsText(false);
        };

        window.addEventListener("mousemove", moveCursor);
        window.addEventListener("mousedown", handleMouseDown);
        window.addEventListener("mouseup", handleMouseUp);
        document.addEventListener("mouseover", handleMouseOver, true);
        document.addEventListener("mouseout", handleMouseOut, true);

        return () => {
            window.removeEventListener("mousemove", moveCursor);
            window.removeEventListener("mousedown", handleMouseDown);
            window.removeEventListener("mouseup", handleMouseUp);
            document.removeEventListener("mouseover", handleMouseOver, true);
            document.removeEventListener("mouseout", handleMouseOut, true);
        };
    }, [isVisible, mounted]);

    useEffect(() => {
        if (!mounted) return;
        document.body.style.cursor = "none";
        return () => {
            document.body.style.cursor = "auto";
        };
    }, [mounted]);

    if (!mounted) return null;

    return (
        <div className={`pointer-events-none fixed inset-0 z-[10000] ${isVisible ? "opacity-100" : "opacity-0"} transition-opacity duration-300`}>
            {/* Custom Wing Flutter Animation Styles */}
            <style dangerouslySetInnerHTML={{__html: `
                @keyframes wing-flutter-left {
                    0%, 100% { transform: rotate(-30deg) scaleX(1); }
                    50% { transform: rotate(-60deg) scaleX(0.7); }
                }
                @keyframes wing-flutter-right {
                    0%, 100% { transform: rotate(30deg) scaleX(1); }
                    50% { transform: rotate(60deg) scaleX(0.7); }
                }
                .animate-wing-left {
                    animation: wing-flutter-left 0.12s infinite ease-in-out;
                }
                .animate-wing-right {
                    animation: wing-flutter-right 0.12s infinite ease-in-out;
                }
            `}} />

            {/* Main Cursor Element */}
            <div 
                ref={cursorDotRef}
                className="fixed top-0 left-0 -translate-x-1/2 -translate-y-1/2 transition-all duration-100 ease-out z-10"
            >
                {isText ? (
                    // Standard text cursor bar when hovering inputs/textareas
                    <div className="w-[2px] h-6 bg-[#1b4332] rounded-full shadow-sm" />
                ) : (
                    // Bee Cursor
                    <svg viewBox="0 0 24 24" className="w-8 h-8 select-none pointer-events-none drop-shadow-md">
                        {/* Left Wing */}
                        <ellipse 
                            cx="9" 
                            cy="8" 
                            rx="3" 
                            ry="5" 
                            fill="#e0f2fe" 
                            stroke="#7dd3fc" 
                            strokeWidth="0.5" 
                            opacity="0.85" 
                            className="animate-wing-left"
                            style={{ transformOrigin: "12px 13px" }}
                        />
                        {/* Right Wing */}
                        <ellipse 
                            cx="14" 
                            cy="8" 
                            rx="3" 
                            ry="5" 
                            fill="#e0f2fe" 
                            stroke="#7dd3fc" 
                            strokeWidth="0.5" 
                            opacity="0.85" 
                            className="animate-wing-right"
                            style={{ transformOrigin: "12px 13px" }}
                        />
                        {/* Body (Bee) */}
                        <ellipse cx="12" cy="13" rx="5.5" ry="4" fill="#fbbf24" stroke="#d97706" strokeWidth="0.5" />
                        {/* Stripes */}
                        <path d="M10 9.5a4 4 0 0 0 0 7M13 9.5a4 4 0 0 0 0 7" stroke="#1e293b" strokeWidth="1.2" strokeLinecap="round" fill="none" />
                        {/* Stinger */}
                        <polygon points="17.5,13 20.5,13 17.5,14" fill="#1e293b" />
                        {/* Eye */}
                        <circle cx="8.5" cy="12.2" r="0.8" fill="#1e293b" />
                    </svg>
                )}
            </div>

            {/* Outer Ring / Interaction Feedback */}
            <div 
                ref={cursorOutlineRef}
                className={`fixed top-0 left-0 rounded-full -translate-x-1/2 -translate-y-1/2 transition-all duration-300 ease-out border-2 ${
                    isText
                    ? "w-4 h-8 border-[#1b4332]/10 opacity-50 scale-x-50"
                    : isHovering 
                        ? "w-16 h-16 bg-[#40916c]/10 border-[#40916c] shadow-[0_0_20px_rgba(64,145,108,0.4)]" 
                        : "w-10 h-10 border-[#1b4332]/20 dark:border-white/20"
                }`}
            >
                {isHovering && !isText && (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-1.5 h-1.5 bg-[#40916c] rounded-full animate-ping" />
                    </div>
                )}
            </div>
        </div>
    );
}
