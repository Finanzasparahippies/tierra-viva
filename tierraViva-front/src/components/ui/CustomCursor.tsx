"use client";

import { useEffect, useState, useRef } from "react";

export function CustomCursor() {
    const cursorDotRef = useRef<HTMLDivElement>(null);
    const cursorOutlineRef = useRef<HTMLDivElement>(null);
    const [isVisible, setIsVisible] = useState(false);
    const [isHovering, setIsHovering] = useState(false);
    const [isText, setIsText] = useState(false);

    useEffect(() => {
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
            const isPointer = (
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
    }, [isVisible]);

    useEffect(() => {
        document.body.style.cursor = "none";
        return () => {
            document.body.style.cursor = "auto";
        };
    }, []);

    if (typeof window === "undefined") return null;

    return (
        <div className={`pointer-events-none fixed inset-0 z-[10000] ${isVisible ? "opacity-100" : "opacity-0"} transition-opacity duration-300`}>
            {/* Main Cursor Element */}
            <div 
                ref={cursorDotRef}
                className={`fixed top-0 left-0 transition-all duration-200 ease-out z-10 ${
                    isText 
                    ? "w-[2px] h-6 bg-[#0d0f36] rounded-full -translate-x-1/2 -translate-y-1/2 shadow-sm" 
                    : "w-1.5 h-1.5 bg-[#69d2cd] rounded-full -translate-x-1/2 -translate-y-1/2"
                }`}
            />
            {/* Outer Ring / Interaction Feedback */}
            <div 
                ref={cursorOutlineRef}
                className={`fixed top-0 left-0 rounded-full -translate-x-1/2 -translate-y-1/2 transition-all duration-300 ease-out border-2 ${
                    isText
                    ? "w-4 h-8 border-[#0d0f36]/10 opacity-50 scale-x-50"
                    : isHovering 
                        ? "w-16 h-16 bg-[#69d2cd]/10 border-[#69d2cd] shadow-[0_0_20px_rgba(105,210,205,0.4)]" 
                        : "w-10 h-10 border-[#0d0f36]/20 dark:border-white/20"
                }`}
            >
                {isHovering && !isText && (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-1 h-1 bg-[#69d2cd] rounded-full animate-ping" />
                    </div>
                )}
            </div>
        </div>
    );
}
