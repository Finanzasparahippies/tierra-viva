import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number) {
    return new Intl.NumberFormat('es-MX', {
        style: 'currency',
        currency: 'MXN'
    }).format(amount);
}

export function formatDate(dateString: string, options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long', year: 'numeric' }) {
    try {
        return new Date(dateString).toLocaleDateString('es-MX', options);
    } catch (e) {
        return dateString;
    }
}

export function optimizeImage(url: string | undefined): string {
    if (!url) return "";

    // Check if it's a Cloudinary URL
    if (url.includes("res.cloudinary.com")) {
        // Enforce HTTPS
        let secureUrl = url;
        if (url.startsWith("http://")) {
            secureUrl = url.replace("http://", "https://");
        }

        // Add basic transformation if no transformations exist
        if (secureUrl.includes("/upload/") && !secureUrl.includes("/upload/c_")) {
            return secureUrl.replace("/upload/", "/upload/f_auto,q_auto/");
        }
        return secureUrl;
    }

    return url;
}

export function stripHtml(html: string): string {
    if (!html) return "";
    return html.replace(/<[^>]*>/g, "");
}

export function getEmbedUrl(url: string | undefined): string {
    if (!url) return "";

    // YouTube
    if (url.includes("youtube.com/watch")) {
        const videoId = new URL(url).searchParams.get("v");
        return videoId ? `https://www.youtube.com/embed/${videoId}` : url;
    }

    if (url.includes("youtu.be/")) {
        const videoId = url.split("youtu.be/")[1];
        return `https://www.youtube.com/embed/${videoId}`;
    }

    // Vimeo
    if (url.includes("vimeo.com")) {
        const videoId = url.split("vimeo.com/")[1];
        return `https://player.vimeo.com/video/${videoId}`;
    }

    return url;
}