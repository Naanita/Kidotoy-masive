"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, Save, TriangleAlert, Loader2, Tent } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import {
  crearCarpa,
  renombrarCarpa,
  eliminarCarpa,
  asignarReferencia,
} from "@/app/kidotoy/acciones-carpas";
import type { CarpaConfig, ReferenciaCarpa } from "@/lib/kidotoy/carpas";

const SIN = "sin";

export function GestionCarpas({
  carpas,
  referencias,
}: {
  carpas: CarpaConfig[];
  referencias: ReferenciaCarpa[];
}) {
  const router = useRouter();
  const [nueva, setNueva] = useState("");
  const [pending, startTransition] = useTransition();

  const sinCarpa = referencias.filter((r) => r.activo && !r.carpaId);

  const run = (fn: () => Promise<{ ok: boolean; error?: string }>) =>
    startTransition(async () => {
      const r = await fn();
      if (r.ok) router.refresh();
      else toast.error(r.error ?? "No se pudo completar.");
    });

  return (
    <div className="space-y-8">
      {sinCarpa.length > 0 && (
        <Alert variant="destructive">
          <TriangleAlert className="size-4" aria-hidden />
          <AlertTitle>
            {sinCarpa.length} referencia(s) sin carpa asignada
          </AlertTitle>
          <AlertDescription>
            Nadie podrá entregar estos juguetes hasta asignarlos a una carpa:{" "}
            {sinCarpa.map((r) => r.codigo).join(", ")}.
          </AlertDescription>
        </Alert>
      )}

      {/* --- Carpas --- */}
      <section>
        <div className="mb-3 flex flex-wrap items-end gap-2">
          <div className="flex-1">
            <h2 className="text-lg font-semibold">Carpas del evento</h2>
            <p className="text-sm text-muted-foreground">
              Puntos físicos de entrega. Junta edades en un punto o parte una edad
              moviendo referencias abajo.
            </p>
          </div>
          <div className="flex items-end gap-2">
            <Input
              placeholder="Nombre de la carpa"
              value={nueva}
              onChange={(e) => setNueva(e.target.value)}
              className="w-56"
            />
            <Button
              disabled={pending || !nueva.trim()}
              onClick={() =>
                run(async () => {
                  const r = await crearCarpa(nueva);
                  if (r.ok) setNueva("");
                  return r;
                })
              }
            >
              <Plus className="mr-2 size-4" aria-hidden />
              Agregar
            </Button>
          </div>
        </div>

        <div className="grid gap-2 sm:grid-cols-2">
          {carpas.map((c) => (
            <CarpaRow key={c.id} carpa={c} pending={pending} run={run} />
          ))}
        </div>
      </section>

      {/* --- Asignación de referencias --- */}
      <section>
        <h2 className="mb-1 text-lg font-semibold">Referencias por carpa</h2>
        <p className="mb-3 text-sm text-muted-foreground">
          Cada referencia se despacha en una sola carpa.
        </p>
        <div className="overflow-x-auto rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Referencia</TableHead>
                <TableHead>Juguete</TableHead>
                <TableHead className="w-14">Edad</TableHead>
                <TableHead className="w-16">Género</TableHead>
                <TableHead className="w-56">Carpa</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {referencias.map((r) => (
                <TableRow key={r.productoId} className={r.activo ? undefined : "opacity-50"}>
                  <TableCell className="font-mono text-xs">{r.codigo}</TableCell>
                  <TableCell className="font-medium">{r.nombre}</TableCell>
                  <TableCell>{r.edad}</TableCell>
                  <TableCell>{r.genero}</TableCell>
                  <TableCell>
                    <Select
                      value={r.carpaId ?? SIN}
                      onValueChange={(v) =>
                        run(() => asignarReferencia(r.productoId, v === SIN ? null : v))
                      }
                    >
                      <SelectTrigger className={!r.carpaId ? "border-destructive text-destructive" : undefined}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={SIN}>Sin carpa</SelectItem>
                        {carpas.map((c) => (
                          <SelectItem key={c.id} value={c.id}>{c.nombre}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </section>
    </div>
  );
}

function CarpaRow({
  carpa,
  pending,
  run,
}: {
  carpa: CarpaConfig;
  pending: boolean;
  run: (fn: () => Promise<{ ok: boolean; error?: string }>) => void;
}) {
  const [nombre, setNombre] = useState(carpa.nombre);
  const cambiado = nombre.trim() !== carpa.nombre;

  return (
    <Card>
      <CardContent className="flex items-center gap-2 p-3">
        <Tent className="size-4 shrink-0 text-muted-foreground" aria-hidden />
        <Input value={nombre} onChange={(e) => setNombre(e.target.value)} className="h-9" />
        <Badge variant="secondary" className="shrink-0">
          {carpa.referencias} ref.
        </Badge>
        {cambiado && (
          <Button
            size="icon"
            variant="outline"
            className="size-9 shrink-0"
            disabled={pending}
            onClick={() => run(() => renombrarCarpa(carpa.id, nombre))}
            aria-label="Guardar nombre"
          >
            <Save className="size-4" aria-hidden />
          </Button>
        )}
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button size="icon" variant="ghost" className="size-9 shrink-0 text-destructive" aria-label="Eliminar carpa">
              <Trash2 className="size-4" aria-hidden />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>¿Eliminar “{carpa.nombre}”?</AlertDialogTitle>
              <AlertDialogDescription>
                Sus {carpa.referencias} referencia(s) quedarán sin carpa y los operarios
                asignados quedarán sin carpa. Podrás reasignarlos.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={() => run(() => eliminarCarpa(carpa.id))}>
                Eliminar
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </Card>
  );
}
