import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { LockupMarca } from "@/components/marca/logotipo";

/** Marco centrado y sobrio para todas las pantallas de login. */
export async function PantallaLogin({
  titulo,
  descripcion,
  children,
}: {
  titulo: string;
  descripcion?: string;
  children: React.ReactNode;
}) {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-background px-4 py-10">
      <Card className="w-full max-w-sm shadow-lg">
        <CardHeader className="space-y-2 text-center">
          <LockupMarca className="justify-center" />
          <CardTitle className="text-2xl">{titulo}</CardTitle>
          {descripcion && <CardDescription>{descripcion}</CardDescription>}
        </CardHeader>
        <CardContent>{children}</CardContent>
      </Card>
    </main>
  );
}
