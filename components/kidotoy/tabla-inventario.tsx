"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
const POR_PAGINA = 12;

/** Etiqueta de estado de stock de una referencia. */
function estadoStock(p: ProductoAdmin) {
  if (!p.activo)
    return { texto: "Inactivo", variant: "outline" as const };
  if (p.stock_disponible === 0)
    return { texto: "Agotado", variant: "destructive" as const };
  if (p.stock_disponible < p.stock_inicial * UMBRAL)
    return {
      texto: "Por agotarse",
      clase: "bg-warning text-warning-foreground hover:bg-warning",
    };
  return {
    texto: "Disponible",
    clase: "bg-success text-success-foreground hover:bg-success",
  };
}

export function TablaInventario({ productos }: { productos: ProductoAdmin[] }) {
  const [pagina, setPagina] = useState(0);
  const paginas = Math.max(1, Math.ceil(productos.length / POR_PAGINA));
  const p = Math.min(pagina, paginas - 1);
  const visibles = useMemo(
    () => productos.slice(p * POR_PAGINA, p * POR_PAGINA + POR_PAGINA),
    [productos, p],
  );
  const desde = productos.length === 0 ? 0 : p * POR_PAGINA + 1;
  const hasta = Math.min(p * POR_PAGINA + POR_PAGINA, productos.length);

  return (
    <div>
      <div className="overflow-x-auto rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Referencia</TableHead>
              <TableHead>Juguete</TableHead>
              <TableHead className="w-14 text-right">Edad</TableHead>
              <TableHead className="w-16">Género</TableHead>
              <TableHead className="w-16 text-right">Inicial</TableHead>
              <TableHead className="w-20 text-right">Consumido</TableHead>
              <TableHead className="w-20 text-right">Disponible</TableHead>
              <TableHead className="w-32">Estado</TableHead>
              <TableHead className="w-24 text-right">Acción</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {visibles.map((prod) => {
              const est = estadoStock(prod);
              return (
                <TableRow key={prod.id}>
                  <TableCell className="font-mono text-xs">
                    {prod.codigo_referencia}
                  </TableCell>
                  <TableCell className="font-medium">{prod.nombre}</TableCell>
                  <TableCell className="text-right tabular-nums">
                    {prod.edad}
                  </TableCell>
                  <TableCell>{prod.genero}</TableCell>
                  <TableCell className="text-right tabular-nums">
                    {prod.stock_inicial}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {prod.consumido}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {prod.stock_disponible}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={"variant" in est ? est.variant : "default"}
                      className={"clase" in est ? est.clase : undefined}
                    >
                      {est.texto}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <DialogoStock producto={prod} />
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      <div className="mt-2 flex items-center justify-between text-sm text-muted-foreground">
        <span className="tabular-nums">
          {desde}–{hasta} de {productos.length}
        </span>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPagina((v) => Math.max(0, v - 1))}
            disabled={p === 0}
          >
            <ChevronLeft className="mr-1 size-4" aria-hidden />
            Anterior
          </Button>
          <span className="tabular-nums">
            {p + 1} / {paginas}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPagina((v) => Math.min(paginas - 1, v + 1))}
            disabled={p >= paginas - 1}
          >
            Siguiente
            <ChevronRight className="ml-1 size-4" aria-hidden />
          </Button>
        </div>
      </div>
    </div>
  );
}
