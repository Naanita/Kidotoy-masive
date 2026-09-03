import { ShellKidotoy } from "@/components/kidotoy/shell";
import { TablaInventario } from "@/components/kidotoy/tabla-inventario";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { obtenerContexto } from "@/lib/auth/session";
import {
  obtenerInventarioGrupos,
  obtenerProductosAdmin,
} from "@/lib/kidotoy/datos";

export default async function PaginaInventario() {
  const { empresaId } = await obtenerContexto();
  if (!empresaId) {
    return (
      <ShellKidotoy>
        <p className="text-sm text-muted-foreground">Sesión sin empresa.</p>
      </ShellKidotoy>
    );
  }

  const [grupos, productos] = await Promise.all([
    obtenerInventarioGrupos(empresaId),
    obtenerProductosAdmin(empresaId),
  ]);

  return (
    <ShellKidotoy>
      <div className="space-y-8">
        <section>
          <h1 className="mb-1 text-xl font-semibold">Inventario por grupo</h1>
          <p className="mb-4 text-sm text-muted-foreground">
            Resumen por edad y género.
          </p>
          <div className="overflow-x-auto rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">Edad</TableHead>
                  <TableHead className="w-20">Género</TableHead>
                  <TableHead className="text-right">Referencias</TableHead>
                  <TableHead className="text-right">Iniciales</TableHead>
                  <TableHead className="text-right">Disponibles</TableHead>
                  <TableHead className="text-right">Consumidas</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {grupos.map((g) => (
                  <TableRow key={`${g.edad}-${g.genero}`}>
                    <TableCell>{g.edad}</TableCell>
                    <TableCell>{g.genero}</TableCell>
                    <TableCell className="text-right tabular-nums">{g.referencias}</TableCell>
                    <TableCell className="text-right tabular-nums">{g.iniciales}</TableCell>
                    <TableCell className="text-right tabular-nums">{g.disponibles}</TableCell>
                    <TableCell className="text-right tabular-nums">{g.consumidas}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </section>

        <section>
          <h2 className="mb-1 text-lg font-semibold">Referencias</h2>
          <p className="mb-4 text-sm text-muted-foreground">
            Edita el total de unidades de cada referencia. El mínimo es lo ya
            consumido.
          </p>
          <TablaInventario productos={productos} />
        </section>
      </div>
    </ShellKidotoy>
  );
}
