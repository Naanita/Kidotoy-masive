"use client";

import { useState, useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Unlock, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { liberarSeleccion, type Resultado } from "@/app/kidotoy/acciones-panel";
import type { FilaSeleccion } from "@/lib/kidotoy/datos";

const MIN_MOTIVO = 10;

/**
 * Liberar una selección confirmada desde su fila en la tabla. Irreversible para
 * el colaborador; motivo obligatorio (>= 10 caracteres) y aviso de que queda en
 * auditoría a nombre del admin. Llama al RPC atómico `liberar_seleccion`.
 */
export function BotonLiberar({
  fila,
  adminEmail,
}: {
  fila: FilaSeleccion;
  adminEmail: string;
}) {
  const [abierto, setAbierto] = useState(false);
  const [motivo, setMotivo] = useState("");
  const router = useRouter();
  const [state, formAction, pending] = useActionState<Resultado, FormData>(
    liberarSeleccion,
    { ok: false },
  );

  useEffect(() => {
    if (state.ok) {
      setAbierto(false);
      setMotivo("");
      router.refresh();
    }
  }, [state.ok, router]);

  const motivoValido = motivo.trim().length >= MIN_MOTIVO;

  return (
    <Dialog open={abierto} onOpenChange={setAbierto}>
      <Button variant="outline" size="sm" onClick={() => setAbierto(true)}>
        <Unlock className="mr-1.5 size-3.5" aria-hidden />
        Liberar
      </Button>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Liberar selección</DialogTitle>
          <DialogDescription>
            {fila.beneficiario} · {fila.producto} · código{" "}
            <span className="font-mono">{fila.codigoEntrega}</span>
          </DialogDescription>
        </DialogHeader>

        <Alert variant="destructive">
          <ShieldAlert className="size-4" aria-hidden />
          <AlertDescription>
            El beneficiario podrá volver a elegir y la unidad regresa al
            inventario. Esta acción queda registrada en auditoría a tu nombre
            (<span className="font-medium">{adminEmail}</span>) junto con el
            motivo.
          </AlertDescription>
        </Alert>

        <form action={formAction} className="space-y-3">
          <input
            type="hidden"
            name="seleccion_id"
            value={fila.seleccionId ?? ""}
          />
          <div className="space-y-2">
            <Label htmlFor="motivo">Motivo (obligatorio)</Label>
            <textarea
              id="motivo"
              name="motivo"
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              rows={3}
              minLength={MIN_MOTIVO}
              required
              placeholder="Explica por qué se libera esta selección"
              className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm outline-none placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-ring"
            />
            <p className="text-xs text-muted-foreground">
              {motivo.trim().length < MIN_MOTIVO
                ? `Faltan ${MIN_MOTIVO - motivo.trim().length} caracteres (mínimo ${MIN_MOTIVO}).`
                : "Queda registrado tal cual lo escribas."}
            </p>
          </div>

          {state.error && (
            <Alert variant="destructive">
              <AlertDescription>{state.error}</AlertDescription>
            </Alert>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setAbierto(false)}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="destructive"
              disabled={pending || !motivoValido}
            >
              {pending && (
                <Loader2 className="mr-2 size-4 animate-spin" aria-hidden />
              )}
              Liberar selección
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
