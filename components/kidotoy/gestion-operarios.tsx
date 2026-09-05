"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, UserPlus, RefreshCw, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
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
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { crearOperario, asignarOperarioCarpa } from "@/app/kidotoy/acciones-carpas";
import type { CarpaConfig, OperarioConfig } from "@/lib/kidotoy/carpas";

const SIN = "sin";

/** Contraseña legible al azar (sin caracteres ambiguos). Visible, nunca a ciegas. */
function generarPassword(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";
  const arr = new Uint32Array(10);
  crypto.getRandomValues(arr);
  return Array.from(arr, (n) => chars[n % chars.length]).join("");
}

export function GestionOperarios({
  operarios,
  carpas,
}: {
  operarios: OperarioConfig[];
  carpas: CarpaConfig[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [abierto, setAbierto] = useState(false);
  const [correo, setCorreo] = useState("");
  const [nombre, setNombre] = useState("");
  const [password, setPassword] = useState("");
  const [carpaId, setCarpaId] = useState(SIN);
  const [error, setError] = useState<string | null>(null);
  const [copiado, setCopiado] = useState(false);

  async function copiarPassword() {
    try {
      await navigator.clipboard.writeText(password);
      setCopiado(true);
      toast.success("Contraseña copiada", { description: "Entrégasela al operario." });
      setTimeout(() => setCopiado(false), 2000);
    } catch {
      toast.error("No se pudo copiar", { description: "Cópiala a mano." });
    }
  }

  function crear() {
    setError(null);
    startTransition(async () => {
      const r = await crearOperario({
        correo,
        password,
        nombre,
        carpaId: carpaId === SIN ? null : carpaId,
      });
      if (r.ok) {
        setAbierto(false);
        setCorreo(""); setNombre(""); setPassword(""); setCarpaId(SIN);
        toast.success("Operario creado");
        router.refresh();
      } else {
        setError(r.error ?? "No se pudo crear.");
      }
    });
  }

  function cambiarCarpa(authUserId: string, v: string) {
    startTransition(async () => {
      const r = await asignarOperarioCarpa(authUserId, v === SIN ? null : v);
      if (r.ok) router.refresh();
      else toast.error(r.error ?? "No se pudo asignar.");
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Una cuenta por persona de entrega. El día del evento son varias a la vez; con
          cuentas separadas la auditoría de quién entregó qué es confiable.
        </p>
        <Dialog open={abierto} onOpenChange={setAbierto}>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="mr-2 size-4" aria-hidden />
              Nuevo operario
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nuevo operario</DialogTitle>
              <DialogDescription>
                Crea una cuenta de entrega y asígnale una carpa.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-3">
              <div className="space-y-1">
                <Label htmlFor="op-nombre">Nombre</Label>
                <Input id="op-nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="op-correo">Correo</Label>
                <Input id="op-correo" type="email" value={correo} onChange={(e) => setCorreo(e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="op-pass">Contraseña (mín. 8)</Label>
                <div className="flex gap-2">
                  <Input
                    id="op-pass"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="flex-1 font-mono"
                    autoComplete="off"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setPassword(generarPassword())}
                  >
                    <RefreshCw className="mr-1.5 size-3.5" aria-hidden />
                    Generar
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={copiarPassword}
                    disabled={!password}
                    aria-label="Copiar contraseña"
                  >
                    {copiado ? (
                      <Check className="size-3.5 text-success" aria-hidden />
                    ) : (
                      <Copy className="size-3.5" aria-hidden />
                    )}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  El operario la usa para entrar al módulo de entrega.{" "}
                  <span className="font-medium text-foreground">
                    Cópiala y entrégasela
                  </span>{" "}
                  — no se vuelve a mostrar después.
                </p>
              </div>
              <div className="space-y-1">
                <Label>Carpa</Label>
                <Select value={carpaId} onValueChange={setCarpaId}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value={SIN}>Sin carpa</SelectItem>
                    {carpas.map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.nombre}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setAbierto(false)}>Cancelar</Button>
              <Button onClick={crear} disabled={pending}>
                {pending && <Loader2 className="mr-2 size-4 animate-spin" aria-hidden />}
                Crear
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="overflow-x-auto rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Correo</TableHead>
              <TableHead className="w-56">Carpa</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {operarios.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="py-8 text-center text-muted-foreground">
                  No hay operarios. Crea el primero.
                </TableCell>
              </TableRow>
            ) : (
              operarios.map((o) => (
                <TableRow key={o.authUserId}>
                  <TableCell className="font-medium">{o.nombre}</TableCell>
                  <TableCell className="text-muted-foreground">{o.correo ?? "—"}</TableCell>
                  <TableCell>
                    <Select value={o.carpaId ?? SIN} onValueChange={(v) => cambiarCarpa(o.authUserId, v)}>
                      <SelectTrigger className={!o.carpaId ? "border-warning" : undefined}>
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
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
