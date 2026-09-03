"use client";

import { useMemo, useState, useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search, Loader2, Unlock, ShieldAlert } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { liberarSeleccion, type Resultado } from "@/app/kidotoy/acciones-panel";
import type { FilaSeleccion } from "@/lib/kidotoy/datos";

const MIN_MOTIVO = 10;

export function BuscadorLiberar({
  confirmadas,
  adminEmail,
}: {
  confirmadas: FilaSeleccion[];
  adminEmail: string;
}) {
  const [q, setQ] = useState("");
  const [sel, setSel] = useState<FilaSeleccion | null>(null);
  const [motivo, setMotivo] = useState("");
  const router = useRouter();

  const [state, formAction, pending] = useActionState<Resultado, FormData>(
    liberarSeleccion,
    { ok: false },
  );

  useEffect(() => {
    if (state.ok) {
      setSel(null);
      setMotivo("");
      router.refresh();
    }
  }, [state.ok, router]);

  const resultados = useMemo(() => {
    const t = q.trim().toLowerCase();
    if (!t) return confirmadas.slice(0, 20);
    return confirmadas
      .filter((f) =>
        `${f.beneficiario} ${f.colaborador} ${f.cedula} ${f.codigoEntrega ?? ""}`
          .toLowerCase()
          .includes(t),
      )
      .slice(0, 20);
  }, [confirmadas, q]);

  const motivoValido = motivo.trim().length >= MIN_MOTIVO;

  return (
    <div className="space-y-4">
      <div className="relative max-w-md">
        <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" aria-hidden />
        <Input
          placeholder="Buscar por beneficiario, colaborador, cédula o código"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="pl-8"
        />
      </div>

      <div className="overflow-x-auto rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Beneficiario</TableHead>
              <TableHead>Colaborador</TableHead>
              <TableHead>Juguete</TableHead>
              <TableHead>Código</TableHead>
              <TableHead className="w-24 text-right">Acción</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {resultados.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="py-8 text-center text-muted-foreground">
                  No hay selecciones confirmadas que coincidan.
                </TableCell>
              </TableRow>
            ) : (
              resultados.map((f) => (
                <TableRow key={f.beneficiarioId}>
                  <TableCell className="font-medium">{f.beneficiario}</TableCell>
                  <TableCell>{f.colaborador}</TableCell>
                  <TableCell>{f.producto}</TableCell>
                  <TableCell className="font-mono text-xs">{f.codigoEntrega}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="outline" size="sm" onClick={() => setSel(f)}>
                      <Unlock className="mr-1.5 size-3.5" aria-hidden />
                      Liberar
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={sel !== null} onOpenChange={(o) => !o && setSel(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Liberar selección</DialogTitle>
            <DialogDescription>
              {sel?.beneficiario} · {sel?.producto} · código{" "}
              <span className="font-mono">{sel?.codigoEntrega}</span>
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
            <input type="hidden" name="seleccion_id" value={sel?.seleccionId ?? ""} />
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
                onClick={() => setSel(null)}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                variant="destructive"
                disabled={pending || !motivoValido}
              >
                {pending && <Loader2 className="mr-2 size-4 animate-spin" aria-hidden />}
                Liberar selección
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
