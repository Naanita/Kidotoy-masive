import type { Metadata } from "next";
import {
  Inter,
  Montserrat,
  Fredoka,
  Plus_Jakarta_Sans,
  Manrope,
  Source_Sans_3,
  Nunito_Sans,
  Outfit,
  Figtree,
} from "next/font/google";
import { Suspense } from "react";
import { Toaster } from "@/components/ui/sonner";
import { ToastBienvenida } from "@/components/estado/toast-bienvenida";
import { BannerDemostracion } from "@/components/banner-demostracion";
import { obtenerConfigPublica } from "@/lib/theme/config";
import { construirEstiloTema } from "@/lib/theme/serialize";
import "./globals.css";

// El tema y el banner viven en la BD y cambian desde /dev. Revalidar cada
// 5 min mantiene las páginas casi estáticas y refleja los cambios sin redeploy.
export const revalidate = 300;

// Fuentes por defecto (identidad Acueducto/Kidotoy): se precargan.
// Inter (cuerpo), Montserrat (títulos), Fredoka (display, momentos de alegría).
const fontBody = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const fontHeading = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
  display: "swap",
});
const fontDisplay = Fredoka({
  subsets: ["latin"],
  variable: "--font-fredoka",
  display: "swap",
});

// Resto de la lista curada del panel de temas: se declaran pero NO se precargan.
// El navegador solo descarga una cuando el tema realmente la usa.
const fontJakarta = Plus_Jakarta_Sans({ subsets: ["latin"], display: "swap", preload: false, variable: "--font-jakarta" });
const fontManrope = Manrope({ subsets: ["latin"], display: "swap", preload: false, variable: "--font-manrope" });
const fontSource = Source_Sans_3({ subsets: ["latin"], display: "swap", preload: false, variable: "--font-source-sans" });
const fontNunito = Nunito_Sans({ subsets: ["latin"], display: "swap", preload: false, variable: "--font-nunito" });
const fontOutfit = Outfit({ subsets: ["latin"], display: "swap", preload: false, variable: "--font-outfit" });
const fontFigtree = Figtree({ subsets: ["latin"], display: "swap", preload: false, variable: "--font-figtree" });

const FONT_VARS = [
  fontBody,
  fontHeading,
  fontDisplay,
  fontJakarta,
  fontManrope,
  fontSource,
  fontNunito,
  fontOutfit,
  fontFigtree,
]
  .map((f) => f.variable)
  .join(" ");

export async function generateMetadata(): Promise<Metadata> {
  const config = await obtenerConfigPublica();
  return {
    title: {
      default: `${config.marca_nombre} · Selección de regalos`,
      template: `%s · ${config.marca_nombre}`,
    },
    description:
      "Plataforma de selección de regalos de fin de año para los hijos de los colaboradores.",
    robots: { index: false, follow: false },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const config = await obtenerConfigPublica();
  const estiloTema = construirEstiloTema(config.tokens);

  return (
    <html lang="es" className={FONT_VARS} suppressHydrationWarning>
      <body className="min-h-dvh bg-background text-foreground antialiased">
        {/* Tema de la empresa: validado contra lista blanca antes de inyectar.
            Primer hijo del body → gana en cascada a los valores de globals.css. */}
        {estiloTema && (
          <style dangerouslySetInnerHTML={{ __html: estiloTema }} />
        )}
        {config.banner_demo && <BannerDemostracion />}
        {children}
        <Toaster />
        <Suspense fallback={null}>
          <ToastBienvenida />
        </Suspense>
      </body>
    </html>
  );
}
