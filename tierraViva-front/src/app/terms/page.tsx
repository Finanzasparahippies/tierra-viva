import React from "react";
import { Gavel, Globe, Users, Scale } from "lucide-react";

export const metadata = {
  title: "Términos de Uso - TierraViva",
  description: "Consulta los términos y condiciones para utilizar nuestra plataforma.",
};

export default function TermsPage() {
  const sections = [
    {
      icon: <Globe className="w-8 h-8 text-primary" />,
      title: "Uso del Sitio",
      content: "TierraViva es una plataforma dedicada al rescate animal y comercio justo. El uso del sitio debe ser respetuoso y acorde a estos valores."
    },
    {
      icon: <Users className="w-8 h-8 text-primary" />,
      title: "Cuentas de Usuario",
      content: "Eres responsable de mantener la confidencialidad de tu cuenta y contraseña, así como de todas las actividades que ocurran bajo tu cuenta."
    },
    {
      icon: <Scale className="w-8 h-8 text-primary" />,
      title: "Propiedad Intelectual",
      content: "Todo el contenido, diseños y logotipos son propiedad de TierraViva o sus respectivos dueños. Queda prohibida su reproducción sin permiso expreso."
    },
    {
      icon: <Gavel className="w-8 h-8 text-primary" />,
      title: "Limitación de Responsabilidad",
      content: "TierraViva no se hace responsable de daños directos o indirectos derivados del uso o imposibilidad de uso del sitio."
    }
  ];

  return (
    <div className="max-w-4xl mx-auto py-16 px-4">
      <div className="text-center mb-16 space-y-4">
        <h1 className="text-5xl font-black tracking-tighter">Términos de Uso</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Al navegar en TierraViva, aceptas cumplir con los siguientes términos y condiciones.
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

      <div className="mt-20 p-10 bg-muted/30 rounded-[3rem] space-y-8 border border-border/20 text-muted-foreground text-lg leading-relaxed">
        <h2 className="text-3xl font-bold text-foreground">Aceptación de Términos</h2>
        <p>
          TierraViva se reserva el derecho de modificar estos términos en cualquier momento. El uso continuado del sitio tras dichos cambios constituye la aceptación de los nuevos términos.
        </p>
        <p>
          Si tienes alguna duda sobre nuestros términos, por favor contáctanos en <span className="text-primary font-bold">tierraviva.raiz@gmail.com</span>.
        </p>
        <p className="pt-8 border-t border-border/40 text-sm">
          Última actualización: 7 de abril de 2026
        </p>
      </div>
    </div>
  );
}
