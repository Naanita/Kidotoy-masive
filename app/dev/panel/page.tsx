import Link from "next/link";
import { Palette, ArrowRight } from "lucide-react";
import { EncabezadoEspacio } from "@/components/espacio/encabezado";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { salirDev } from "../actions";

export default function PaginaPanelDev() {
  return (
    <div className="min-h-dvh">
      <EncabezadoEspacio titulo="Panel de desarrollo" accionCerrar={salirDev} />
      <main className="mx-auto max-w-2xl p-4 sm:p-8">
        <Link href="/dev/tema" className="group block rounded-lg outline-none ring-ring focus-visible:ring-2">
          <Card className="transition-colors group-hover:border-primary">
            <CardHeader>
              <div className="mb-2 flex size-10 items-center justify-center rounded-md bg-primary/10 text-primary">
                <Palette className="size-5" aria-hidden />
              </div>
              <CardTitle className="flex items-center justify-between gap-2">
                Panel de temas
                <ArrowRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" aria-hidden />
              </CardTitle>
              <CardDescription>
                Colores, tipografía, forma y marca, con vista previa en vivo.
              </CardDescription>
            </CardHeader>
            <CardContent />
          </Card>
        </Link>
      </main>
    </div>
  );
}
