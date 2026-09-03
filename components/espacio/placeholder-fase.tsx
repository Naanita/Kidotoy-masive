import { Hammer } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

/**
 * Marcador de sección en construcción. La Fase 1 deja los cinco espacios con
 * su login y su sesión funcionando; el contenido de cada uno llega en su fase.
 */
export function PlaceholderFase({
  fase,
  descripcion,
}: {
  fase: number;
  descripcion: string;
}) {
  return (
    <div className="mx-auto max-w-2xl p-4 sm:p-8">
      <Card>
        <CardHeader>
          <div className="mb-2 flex size-10 items-center justify-center rounded-md bg-muted text-muted-foreground">
            <Hammer className="size-5" aria-hidden />
          </div>
          <CardTitle>Sesión iniciada</CardTitle>
          <CardDescription>
            Esta sección se construye en la Fase {fase}. {descripcion}
          </CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          El acceso, el rol y el cierre de sesión ya funcionan.
        </CardContent>
      </Card>
    </div>
  );
}
