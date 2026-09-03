import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DialogoStock } from "./dialogo-stock";
import type { ProductoAdmin } from "@/lib/kidotoy/datos";

const UMBRAL = 0.2;

/** Etiqueta de estado de stock de una referencia. */
function estadoStock(p: ProductoAdmin) {
  if (!p.activo) return { texto: "Inactivo", clase: "" as const, variant: "outline" as const };
  if (p.stock_disponible === 0)
    return { texto: "Agotado", variant: "destructive" as const };
  if (p.stock_disponible < p.stock_inicial * UMBRAL)
    return { texto: "Por agotarse", clase: "bg-warning text-warning-foreground hover:bg-warning" };
  return { texto: "Disponible", clase: "bg-success text-success-foreground hover:bg-success" };
}

export function TablaInventario({ productos }: { productos: ProductoAdmin[] }) {
  return (
    <div className="overflow-x-auto rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Referencia</TableHead>
            <TableHead>Juguete</TableHead>
            <TableHead className="w-14">Edad</TableHead>
            <TableHead className="w-16">Género</TableHead>
            <TableHead className="w-16 text-right">Inicial</TableHead>
            <TableHead className="w-16 text-right">Consumido</TableHead>
            <TableHead className="w-16 text-right">Disponible</TableHead>
            <TableHead className="w-32">Estado</TableHead>
            <TableHead className="w-24 text-right">Acción</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {productos.map((p) => {
            const est = estadoStock(p);
            return (
              <TableRow key={p.id}>
                <TableCell className="font-mono text-xs">{p.codigo_referencia}</TableCell>
                <TableCell className="font-medium">{p.nombre}</TableCell>
                <TableCell>{p.edad}</TableCell>
                <TableCell>{p.genero}</TableCell>
                <TableCell className="text-right tabular-nums">{p.stock_inicial}</TableCell>
                <TableCell className="text-right tabular-nums">{p.consumido}</TableCell>
                <TableCell className="text-right tabular-nums">{p.stock_disponible}</TableCell>
                <TableCell>
                  <Badge
                    variant={"variant" in est ? est.variant : "default"}
                    className={"clase" in est ? est.clase : undefined}
                  >
                    {est.texto}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <DialogoStock producto={p} />
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
