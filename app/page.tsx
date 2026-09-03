import Link from "next/link";
import { Gift, Users, Building2, PackageCheck, ArrowRight } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { LockupMarca } from "@/components/marca/logotipo";

const ESPACIOS = [
  {
    href: "/acceso",
    titulo: "Colaboradores",
    descripcion: "Elige el regalo de cada uno de tus hijos con tu cédula y código.",
    icon: Gift,
  },
  {
    href: "/kidotoy",
    titulo: "Administración Kidotoy",
    descripcion: "Selecciones en vivo, inventario, avance y catálogo.",
    icon: Users,
  },
  {
    href: "/empresa",
    titulo: "Portal del Acueducto",
    descripcion: "Consulta el avance de la campaña y exporta reportes.",
    icon: Building2,
  },
  {
    href: "/entrega",
    titulo: "Módulo de entrega",
    descripcion: "Busca por código o cédula y marca la entrega del regalo.",
    icon: PackageCheck,
  },
];

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-4xl flex-col justify-center px-6 py-16">
      <header className="mb-10 text-center">
        <LockupMarca className="mb-5 justify-center" />
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Selección de regalos de fin de año
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
          Elige el espacio que te corresponde para continuar.
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2">
        {ESPACIOS.map(({ href, titulo, descripcion, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className="group rounded-lg outline-none ring-ring focus-visible:ring-2"
          >
            <Card className="h-full transition-colors group-hover:border-primary">
              <CardHeader>
                <div className="mb-2 flex size-10 items-center justify-center rounded-md bg-primary/10 text-primary">
                  <Icon className="size-5" aria-hidden />
                </div>
                <CardTitle className="flex items-center justify-between gap-2">
                  {titulo}
                  <ArrowRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" aria-hidden />
                </CardTitle>
                <CardDescription>{descripcion}</CardDescription>
              </CardHeader>
              <CardContent />
            </Card>
          </Link>
        ))}
      </div>
    </main>
  );
}
