
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google"; // Keeping existing fonts
import Script from "next/script";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import FloatingNature from "@/components/ui/FloatingNature";
import CookieBanner from "@/components/ui/CookieBanner";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { QueryProvider } from "@/components/providers/QueryProvider";
import { CustomCursor } from "@/components/ui/CustomCursor";
import { AssistantChatWidget } from "@/components/ui/AssistantChatWidget";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://tierraviva.com.mx"),
  title: "TierraViva",
  description: "Conectando corazones con la naturaleza",
  alternates: {
    canonical: "/",
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: "/icons/favicon.ico",
    apple: "/icons/apple-touch-icon-180x180.png",
    other: [
      { rel: "icon", url: "/icons/android-chrome-192x192.png", sizes: "192x192" },
      { rel: "icon", url: "/icons/android-chrome-512x512.png", sizes: "512x512" },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col relative`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <QueryProvider>
            <CustomCursor />
            <AssistantChatWidget />
            <Script
              async
              src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2582703158474486"
              crossOrigin="anonymous"
              strategy="afterInteractive"
            />
            <FloatingNature />
            <Header />
            <main className="flex-1 container mx-auto px-4 py-8">
              {children}
            </main>
            <Footer />
            <CookieBanner />
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
