"use client";

import { useMemo, useState, useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search, Download, Loader2, Undo2, CheckCircle2, ShieldAlert } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { revertirEntrega, type Resultado } from "@/app/kidotoy/acciones-panel";
import { filtrarEntregas } from "@/lib/kidotoy/filtros";
import { formatearFechaHora } from "@/lib/format";
import type { FilaEntregaGestion } from "@/lib/kidotoy/entregas";

const TODAS = "todas";
const MIN_MOTIVO = 10;

export function GestionEntregas({
  filas,
  carpas,
  adminEmail,
}: {
  filas: FilaEntregaGestion[];
  carpas: { id: string; nombre: string }[];
  adminEmail: string;
}) {
  const [carpa, setCarpa] = useState(TODAS);
  const [estado, setEstado] = useState(TODAS);
  const [q, setQ] = useState("");
  const [sel, setSel] = useState<FilaEntregaGestion | null>(null);
  const [motivo, setMotivo] = useState("");
  const router = useRouter();

  const [state, formAction, pending] = useActionState<Resultado, FormData>(
    revertirEntrega,
    { ok: false },
  );

  useEffect(() => {
    if (state.ok) {
      setSel(null);
      setMotivo("");
      router.refresh();
    }
  }, [state.ok, router]);

  const filtradas = useMemo(
    () =>
      filtrarEntregas(filas, {
        carpaId: carpa === TODAS ? null : carpa,
        estado: estado === TODAS ? null : estado,
        q,
      }),
    [filas, carpa, estado, q],
  );

  const exportUrl = useMemo(() => {
    const p = new URLSearchParams();
    if (carpa !== TODAS) p.set("carpa", carpa);
    if (estado !== TODAS) p.set("estado", estado);
    if (q.trim()) p.set("q", q.trim());
    const s = p.toString();
    return `/kidotoy/entregas/export${s ? `?${s}` : ""}`;
  }, [carpa, estado, q]);

  const motivoValido = motivo.trim().length >= MIN_MOTIVO;

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-48 flex-1">
          <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" aria-hidden />
          <Input
            placeholder="Buscar beneficiario, cédula, código u operario"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="pl-8"
          />
        </div>

        <Select value={carpa} onValueChange={setCarpa}>
          <SelectTrigger className="w-44"><SelectValue placeholder="Carpa" /></SelectTrigger>
          <SelectContent>
            <SelectItem value={TODAS}>Toda carpa</SelectItem>
            {carpas.map((c) => (
              <SelectItem key={c.id} value={c.id}>{c.nombre}</SelectItem>
            ))}
            <SelectItem value="__sin__">Sin carpa</SelectItem>
          </SelectContent>
        </Select>

        <Select value={estado} onValueChange={setEstado}>
          <SelectTrigger className="w-40"><SelectValue placeholder="Estado" /></SelectTrigger>
          <SelectContent>
            <SelectItem value={TODAS}>Todo estado</SelectItem>
            <SelectItem value="entregado">Entregado</SelectItem>
            <SelectItem value="pendiente">Pendiente de entrega</SelectItem>
          </SelectContent>
        </Select>

        <Button asChild variant="outline">
          <a href={exportUrl}>
            <Download className="mr-2 size-4" aria-hidden />
            Exportar CSV
          </a>
        </Button>
      </div>

      <p className="text-xs text-muted-foreground">
        {filtradas.length} de {filas.length} selecciones
      </p>

      <div className="overflow-x-auto rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Beneficiario</TableHead>
              <TableHead>Carpa</TableHead>
              <TableHead>Colaborador</TableHead>
              <TableHead>Juguete</TableHead>
              <TableHead>Código</TableHead>
              <TableHead>Entrega</TableHead>
              <TableHead className="w-24 text-right">Acción</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtradas.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="py-8 text-center text-muted-foreground">
                  No hay resultados con esos filtros.
                </TableCell>
              </TableRow>
            ) : (
              filtradas.map((f) => (
                <TableRow key={f.seleccionId}>
                  <TableCell className="font-medium">{f.beneficiario}</TableCell>
                  <TableCell className={f.carpaNombre ? undefined : "text-destructive"}>
                    {f.carpaNombre ?? "Sin carpa"}
                  </TableCell>
                  <TableCell>{f.colaborador}</TableCell>
                  <TableCell>{f.producto}</TableCell>
                  <TableCell className="font-mono text-xs">{f.codigo}</TableCell>
                  <TableCell>
                    {f.entregado ? (
                      <div className="text-xs">
                        <Badge className="bg-success text-success-foreground hover:bg-success">
                          <CheckCircle2 className="mr-1 size-3" aria-hidden />
                          Entregado
                        </Badge>
                        {f.fueraDeCarpa && (
                          <Badge variant="outline" className="ml-1 border-warning text-warning">
                            fuera de carpa
                          </Badge>
                        )}
                        <div className="mt-1 text-muted-foreground">
                          {formatearFechaHora(f.entregadoEn)}
                          {f.operario ? ` · ${f.operario}` : ""}
                        </div>
                      </div>
                    ) : (
                      <Badge variant="secondary">Pendiente</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    {f.entregado && (
                      <Button variant="outline" size="sm" onClick={() => setSel(f)}>
                        <Undo2 className="mr-1.5 size-3.5" aria-hidden />
                        Revertir
                      </Button>
                    )}
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
            <DialogTitle>Revertir entrega</DialogTitle>
            <DialogDescription>
              {sel?.beneficiario} · {sel?.producto} · código{" "}
              <span className="font-mono">{sel?.codigo}</span>
            </DialogDescription>
          </DialogHeader>

          <Alert variant="destructive">
            <ShieldAlert className="size-4" aria-hidden />
            <AlertDescription>
              La selección volverá a "sin entregar" y se podrá registrar de nuevo.
              Queda en auditoría a tu nombre (
              <span className="font-medium">{adminEmail}</span>) con el motivo.
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
                placeholder="Explica por qué se revierte esta entrega"
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
              <Button type="button" variant="outline" onClick={() => setSel(null)}>
                Cancelar
              </Button>
              <Button type="submit" variant="destructive" disabled={pending || !motivoValido}>
                {pending && <Loader2 className="mr-2 size-4 animate-spin" aria-hidden />}
                Revertir entrega
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
