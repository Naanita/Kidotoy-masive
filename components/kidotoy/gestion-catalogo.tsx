"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Pencil, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { guardarProducto, type Resultado } from "@/app/kidotoy/acciones-panel";
import type { ProductoAdmin } from "@/lib/kidotoy/datos";

type Modo = { tipo: "cerrado" } | { tipo: "nuevo" } | { tipo: "editar"; p: ProductoAdmin };

export function GestionCatalogo({ productos }: { productos: ProductoAdmin[] }) {
  const [modo, setModo] = useState<Modo>({ tipo: "cerrado" });
  const [activo, setActivo] = useState(true);
  const router = useRouter();

  const [state, formAction, pending] = useActionState<Resultado, FormData>(
    guardarProducto,
    { ok: false },
  );

  useEffect(() => {
    if (state.ok) {
      setModo({ tipo: "cerrado" });
      router.refresh();
    }
  }, [state.ok, router]);

  const editando = modo.tipo === "editar" ? modo.p : null;
  const abierto = modo.tipo !== "cerrado";

  // Sincroniza el switch de activo al abrir en modo edición.
  useEffect(() => {
    if (modo.tipo === "editar") setActivo(modo.p.activo);
    if (modo.tipo === "nuevo") setActivo(true);
  }, [modo]);

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => setModo({ tipo: "nuevo" })}>
          <Plus className="mr-2 size-4" aria-hidden />
          Nueva referencia
        </Button>
      </div>

      <div className="overflow-x-auto rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Referencia</TableHead>
              <TableHead>Juguete</TableHead>
              <TableHead className="w-14">Edad</TableHead>
              <TableHead className="w-16">Género</TableHead>
              <TableHead className="w-20 text-right">Stock</TableHead>
              <TableHead className="w-24">Estado</TableHead>
              <TableHead className="w-20 text-right">Acción</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {productos.map((p) => (
              <TableRow key={p.id} className={p.activo ? undefined : "opacity-60"}>
                <TableCell className="font-mono text-xs">{p.codigo_referencia}</TableCell>
                <TableCell className="font-medium">{p.nombre}</TableCell>
                <TableCell>{p.edad}</TableCell>
                <TableCell>{p.genero}</TableCell>
                <TableCell className="text-right tabular-nums">
                  {p.stock_disponible}/{p.stock_inicial}
                </TableCell>
                <TableCell>
                  {p.activo ? (
                    <Badge variant="secondary">Activo</Badge>
                  ) : (
                    <Badge variant="outline">Inactivo</Badge>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setModo({ tipo: "editar", p })}
                  >
                    <Pencil className="mr-1.5 size-3.5" aria-hidden />
                    Editar
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={abierto} onOpenChange={(o) => !o && setModo({ tipo: "cerrado" })}>
        <DialogContent className="max-h-[90dvh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editando ? "Editar referencia" : "Nueva referencia"}
            </DialogTitle>
            <DialogDescription>
              {editando
                ? "El stock se edita desde Inventario."
                : "Crea una referencia del catálogo. El stock disponible inicia igual al total."}
            </DialogDescription>
          </DialogHeader>

          {/* key fuerza recrear el form (y sus defaultValue) al cambiar de modo */}
          <form
            key={editando?.id ?? "nuevo"}
            action={formAction}
            className="space-y-4"
          >
            {editando && <input type="hidden" name="producto_id" value={editando.id} />}

            {!editando && (
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="codigo_referencia">Código de referencia</Label>
                  <Input id="codigo_referencia" name="codigo_referencia" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sku">SKU (bodega)</Label>
                  <Input id="sku" name="sku" />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="nombre">Nombre</Label>
              <Input
                id="nombre"
                name="nombre"
                defaultValue={editando?.nombre ?? ""}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="descripcion">Descripción</Label>
              <Input
                id="descripcion"
                name="descripcion"
                defaultValue={editando?.descripcion ?? ""}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="imagen_url">URL de imagen</Label>
              <Input
                id="imagen_url"
                name="imagen_url"
                type="url"
                defaultValue={editando?.imagen_url ?? ""}
              />
            </div>

            {!editando ? (
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="edad">Edad</Label>
                  <Input id="edad" name="edad" type="number" min={0} max={13} required />
                </div>
                <div className="space-y-2">
                  <Label>Género</Label>
                  <Select name="genero" defaultValue="Niño">
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Niño">Niño</SelectItem>
                      <SelectItem value="Niña">Niña</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="stock_inicial">Stock</Label>
                  <Input id="stock_inicial" name="stock_inicial" type="number" min={0} required />
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between rounded-md border p-3">
                <div>
                  <Label htmlFor="activo">Referencia activa</Label>
                  <p className="text-xs text-muted-foreground">
                    Si la desactivas, deja de verse en el catálogo.
                  </p>
                </div>
                <Switch
                  id="activo"
                  name="activo"
                  checked={activo}
                  onCheckedChange={setActivo}
                />
              </div>
            )}

            {state.error && (
              <Alert variant="destructive">
                <AlertDescription>{state.error}</AlertDescription>
              </Alert>
            )}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setModo({ tipo: "cerrado" })}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={pending}>
                {pending && <Loader2 className="mr-2 size-4 animate-spin" aria-hidden />}
                Guardar
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
