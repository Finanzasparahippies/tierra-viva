import React from "react";
import { Shield, Lock, Eye, FileText } from "lucide-react";

export const metadata = {
  title: "Aviso de Privacidad - TierraViva",
  description: "Conoce cómo protegemos tus datos y nuestra política de cookies.",
};

export default function PrivacyPage() {
  const sections = [
    {
      icon: <Shield className="w-8 h-8 text-primary" />,
      title: "Responsable del Tratamiento",
      content: "TierraViva, con domicilio en México, es el responsable del tratamiento de sus datos personales, asegurando su protección según las leyes vigentes."
    },
    {
      icon: <Eye className="w-8 h-8 text-primary" />,
      title: "Datos Recolectados",
      content: "Recolectamos datos de identificación (nombre, correo) a través de nuestro newsletter, datos de navegación mediante cookies y datos de transacciones para compras en nuestra tienda."
    },
    {
      icon: <FileText className="w-8 h-8 text-primary" />,
      title: "Uso de Google AdSense",
      content: "Utilizamos Google AdSense para mostrar anuncios. Google utiliza cookies para mostrar anuncios basados en las visitas previas de un usuario a este sitio web u otros sitios web."
    },
    {
      icon: <Lock className="w-8 h-8 text-primary" />,
      title: "Sus Derechos ARCO",
      content: "Usted tiene derecho al Acceso, Rectificación, Cancelación u Oposición del tratamiento de sus datos. Puede contactarnos en tierraviva@zohomail.com para ejercer estos derechos."
    }
  ];

  return (
    <div className="max-w-4xl mx-auto py-16 px-4">
      <div className="text-center mb-16 space-y-4">
        <h1 className="text-5xl font-black tracking-tighter">Aviso de Privacidad</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          En TierraViva, tu privacidad es nuestra prioridad. Aquí te explicamos cómo manejamos tu información.
        </p>
      </div>

      <div className="grid gap-12">
        {sections.map((section, index) => (
          <div key={index} className="flex flex-col md:flex-row gap-8 items-start p-8 rounded-[2rem] border border-border/40 glass-dark">
            <div className="bg-primary/10 p-4 rounded-3xl shrink-0">
              {section.icon}
            </div>
            <div className="space-y-4">
              <h2 className="text-2xl font-bold">{section.title}</h2>
              <p className="text-muted-foreground text-lg leading-relaxed">
                {section.content}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-20 p-10 bg-muted/30 rounded-[3rem] space-y-8 border border-border/20">
        <h2 className="text-3xl font-bold">Detalles Adicionales</h2>
        
        <div className="prose prose-invert max-w-none space-y-6 text-muted-foreground text-lg">
          <p>
            Al utilizar este sitio web, usted acepta el procesamiento de datos por TierraViva y por Google en la forma y para los fines mencionados.
          </p>
          
          <h3 className="text-xl font-bold text-foreground">Cookies y Tecnologías Similares</h3>
          <p>
            Las cookies son pequeños archivos de texto que se almacenan en su dispositivo. Ayudan a que el sitio funcione mejor y nos permiten entender qué secciones son más interesantes para nuestros visitantes.
          </p>

          <h3 className="text-xl font-bold text-foreground">Actualizaciones</h3>
          <p>
            Este aviso puede cambiar para cumplir con nuevas legislaciones o políticas internas. La versión más reciente siempre estará disponible en esta página.
          </p>

          <p className="pt-8 border-t border-border/40 text-sm">
            Última actualización: 7 de abril de 2026
          </p>
        </div>
      </div>
    </div>
  );
}
