"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { actualizarStock, type Resultado } from "@/app/kidotoy/acciones-panel";
import type { ProductoAdmin } from "@/lib/kidotoy/datos";

export function DialogoStock({ producto }: { producto: ProductoAdmin }) {
  const [abierto, setAbierto] = useState(false);
  const router = useRouter();
  const [state, formAction, pending] = useActionState<Resultado, FormData>(
    actualizarStock,
    { ok: false },
  );

  useEffect(() => {
    if (state.ok) {
      setAbierto(false);
      router.refresh();
    }
  }, [state.ok, router]);

  return (
    <Dialog open={abierto} onOpenChange={setAbierto}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Pencil className="mr-1.5 size-3.5" aria-hidden />
          Stock
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar stock</DialogTitle>
          <DialogDescription>
            {producto.nombre} · {producto.edad} años · {producto.genero}
          </DialogDescription>
        </DialogHeader>
        <form action={formAction} className="space-y-4">
          <input type="hidden" name="producto_id" value={producto.id} />
          <div className="grid grid-cols-3 gap-3 text-center text-sm">
            <div className="rounded-md bg-muted p-2">
              <p className="text-xs text-muted-foreground">Consumido</p>
              <p className="text-lg font-semibold tabular-nums">
                {producto.consumido}
              </p>
            </div>
            <div className="rounded-md bg-muted p-2">
              <p className="text-xs text-muted-foreground">Disponible</p>
              <p className="text-lg font-semibold tabular-nums">
                {producto.stock_disponible}
              </p>
            </div>
            <div className="rounded-md bg-muted p-2">
              <p className="text-xs text-muted-foreground">Total actual</p>
              <p className="text-lg font-semibold tabular-nums">
                {producto.stock_inicial}
              </p>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="stock_inicial">Nuevo total de unidades</Label>
            <Input
              id="stock_inicial"
              name="stock_inicial"
              type="number"
              inputMode="numeric"
              min={producto.consumido}
              defaultValue={producto.stock_inicial}
              required
            />
            <p className="text-xs text-muted-foreground">
              No puede ser menor que {producto.consumido} (unidades ya
              confirmadas). El disponible se recalcula solo.
            </p>
          </div>
          {state.error && (
            <Alert variant="destructive">
              <AlertDescription>{state.error}</AlertDescription>
            </Alert>
          )}
          <DialogFooter>
            <Button type="submit" disabled={pending}>
              {pending && <Loader2 className="mr-2 size-4 animate-spin" aria-hidden />}
              Guardar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
