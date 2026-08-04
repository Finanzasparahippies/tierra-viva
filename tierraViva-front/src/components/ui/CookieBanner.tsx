"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Cookie, X } from "lucide-react";
import { Button } from "./button";

const CookieBanner = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("cookie-consent");
    if (!consent) {
      setIsVisible(true);
    }
  }, []);

  const acceptCookies = () => {
    localStorage.setItem("cookie-consent", "true");
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-6 left-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-8 duration-500">
      <div className="max-w-4xl mx-auto glass-dark border border-white/20 p-6 rounded-[2rem] shadow-2xl backdrop-blur-xl flex flex-col md:flex-row items-center gap-6">
        <div className="bg-primary/20 p-3 rounded-full">
          <Cookie className="w-8 h-8 text-primary animate-pulse" />
        </div>
        
        <div className="flex-1 space-y-1 text-center md:text-left">
          <h4 className="font-bold text-lg">Aviso de Cookies</h4>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Utilizamos cookies para mejorar tu experiencia, analizar el tráfico y mostrar anuncios personalizados mediante Google AdSense. Al continuar navegando, aceptas nuestro uso de cookies. 
            <Link href="/privacy" className="text-primary hover:underline ml-1 font-medium">
              Leer aviso de privacidad
            </Link>
          </p>
        </div>

        <div className="flex items-center gap-4">
          <Button 
            onClick={acceptCookies}
            className="rounded-full px-8 py-6 font-bold shadow-lg shadow-primary/20 hover:scale-105 transition-all"
          >
            Aceptar todo
          </Button>
          <button 
            onClick={() => setIsVisible(false)}
            className="p-2 text-muted-foreground hover:text-foreground transition-colors"
            title="Cerrar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default CookieBanner;
