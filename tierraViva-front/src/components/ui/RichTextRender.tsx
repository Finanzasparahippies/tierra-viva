"use client";

import React, { useMemo } from "react";

interface RichTextRenderProps {
    content: string;
    className?: string;
}

/**
 * Client-side HTML Sanitizer for Tech-Organic Public Pages
 * Removes dangerous XSS vectors (<script>, onerror, onload, javascript:)
 */
function sanitizeHtml(rawHtml: string): string {
    if (!rawHtml) return "";

    return rawHtml
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
        .replace(/on\w+="[^"]*"/gi, "")
        .replace(/on\w+='[^']*'/gi, "")
        .replace(/on\w+=\w+/gi, "")
        .replace(/href="javascript:[^"]*"/gi, 'href="#"')
        .replace(/href='javascript:[^']*'/gi, 'href="#"');
}

export function RichTextRender({ content, className = "" }: RichTextRenderProps) {
    const cleanContent = useMemo(() => sanitizeHtml(content), [content]);

    return (
        <div className={`prose dark:prose-invert max-w-none text-foreground ${className}`}>
            <style dangerouslySetInnerHTML={{__html: `
                .rich-text-content blockquote {
                    border-left: 4px solid #f59e0b;
                    background-color: rgba(245, 158, 11, 0.06);
                    padding: 0.75rem 1.25rem;
                    border-radius: 0 0.75rem 0.75rem 0;
                    font-style: italic;
                    margin: 1rem 0;
                }
                .rich-text-content h1 {
                    font-size: 1.75rem;
                    font-weight: 900;
                    color: #1b4332;
                    margin-top: 1.5rem;
                    margin-bottom: 0.75rem;
                }
                .dark .rich-text-content h1 {
                    color: #40916c;
                }
                .rich-text-content h2 {
                    font-size: 1.35rem;
                    font-weight: 800;
                    margin-top: 1.25rem;
                    margin-bottom: 0.5rem;
                }
                .rich-text-content h3 {
                    font-size: 1.15rem;
                    font-weight: 700;
                    margin-top: 1rem;
                    margin-bottom: 0.5rem;
                }
                .rich-text-content img {
                    border-radius: 1.25rem;
                    margin: 1rem auto;
                    box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);
                    max-width: 100%;
                    height: auto;
                }
                .rich-text-content a {
                    color: #2d6a4f;
                    text-decoration: underline;
                    font-weight: 600;
                }
                .dark .rich-text-content a {
                    color: #52b788;
                }
                .rich-text-content ul {
                    list-style-type: disc;
                    padding-left: 1.5rem;
                    margin: 0.75rem 0;
                }
                .rich-text-content ol {
                    list-style-type: decimal;
                    padding-left: 1.5rem;
                    margin: 0.75rem 0;
                }
            `}} />

            <div 
                className="rich-text-content text-sm md:text-base leading-relaxed"
                dangerouslySetInnerHTML={{ __html: cleanContent }} 
            />
        </div>
    );
}

export default RichTextRender;
