"use client";

import { useMemo, useState } from "react";
import { Download, Search, CheckCircle2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import type { FilaSeleccion } from "@/lib/kidotoy/datos";

const TODAS = "todas";

export function TablaSelecciones({
  filas,
  areas,
  exportBase = "/kidotoy/selecciones/export",
}: {
  filas: FilaSeleccion[];
  areas: string[];
  exportBase?: string;
}) {
  const [edad, setEdad] = useState(TODAS);
  const [genero, setGenero] = useState(TODAS);
  const [area, setArea] = useState(TODAS);
  const [estado, setEstado] = useState(TODAS);
  const [q, setQ] = useState("");

  const edades = useMemo(
    () => [...new Set(filas.map((f) => f.edad))].sort((a, b) => a - b),
    [filas],
  );

  const filtradas = useMemo(() => {
    const t = q.trim().toLowerCase();
    return filas.filter((f) => {
      if (edad !== TODAS && String(f.edad) !== edad) return false;
      if (genero !== TODAS && f.genero !== genero) return false;
      if (area !== TODAS && (f.area ?? "") !== area) return false;
      if (estado !== TODAS && f.estado !== estado) return false;
      if (t) {
        const blob = `${f.beneficiario} ${f.colaborador} ${f.cedula} ${f.producto ?? ""} ${f.codigoEntrega ?? ""}`.toLowerCase();
        if (!blob.includes(t)) return false;
      }
      return true;
    });
  }, [filas, edad, genero, area, estado, q]);

  const exportUrl = useMemo(() => {
    const p = new URLSearchParams();
    if (edad !== TODAS) p.set("edad", edad);
    if (genero !== TODAS) p.set("genero", genero);
    if (area !== TODAS) p.set("area", area);
    if (estado !== TODAS) p.set("estado", estado);
    if (q.trim()) p.set("q", q.trim());
    const s = p.toString();
    return `${exportBase}${s ? `?${s}` : ""}`;
  }, [edad, genero, area, estado, q, exportBase]);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-48 flex-1">
          <Search
            className="absolute left-2.5 top-2.5 size-4 text-muted-foreground"
            aria-hidden
          />
          <Input
            placeholder="Buscar nombre, cédula o código"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="pl-8"
          />
        </div>

        <Select value={edad} onValueChange={setEdad}>
          <SelectTrigger className="w-28"><SelectValue placeholder="Edad" /></SelectTrigger>
          <SelectContent>
            <SelectItem value={TODAS}>Toda edad</SelectItem>
            {edades.map((e) => (
              <SelectItem key={e} value={String(e)}>{e} años</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={genero} onValueChange={setGenero}>
          <SelectTrigger className="w-28"><SelectValue placeholder="Género" /></SelectTrigger>
          <SelectContent>
            <SelectItem value={TODAS}>Todo género</SelectItem>
            <SelectItem value="Niño">Niño</SelectItem>
            <SelectItem value="Niña">Niña</SelectItem>
          </SelectContent>
        </Select>

        <Select value={area} onValueChange={setArea}>
          <SelectTrigger className="w-40"><SelectValue placeholder="Área" /></SelectTrigger>
          <SelectContent>
            <SelectItem value={TODAS}>Toda área</SelectItem>
            {areas.map((a) => (
              <SelectItem key={a} value={a}>{a}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={estado} onValueChange={setEstado}>
          <SelectTrigger className="w-36"><SelectValue placeholder="Estado" /></SelectTrigger>
          <SelectContent>
            <SelectItem value={TODAS}>Todo estado</SelectItem>
            <SelectItem value="confirmado">Confirmado</SelectItem>
            <SelectItem value="pendiente">Pendiente</SelectItem>
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
        {filtradas.length} de {filas.length} beneficiarios
      </p>

      <div className="overflow-x-auto rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Beneficiario</TableHead>
              <TableHead className="w-16">Edad</TableHead>
              <TableHead className="w-20">Género</TableHead>
              <TableHead>Colaborador</TableHead>
              <TableHead>Área</TableHead>
              <TableHead>Juguete</TableHead>
              <TableHead>Código</TableHead>
              <TableHead className="w-28">Estado</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtradas.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="py-8 text-center text-muted-foreground">
                  No hay resultados con esos filtros.
                </TableCell>
              </TableRow>
            ) : (
              filtradas.map((f) => (
                <TableRow key={f.beneficiarioId}>
                  <TableCell className="font-medium">{f.beneficiario}</TableCell>
                  <TableCell>{f.edad}</TableCell>
                  <TableCell>{f.genero}</TableCell>
                  <TableCell>{f.colaborador}</TableCell>
                  <TableCell className="text-muted-foreground">{f.area ?? "—"}</TableCell>
                  <TableCell>{f.producto ?? "—"}</TableCell>
                  <TableCell className="font-mono text-xs">{f.codigoEntrega ?? "—"}</TableCell>
                  <TableCell>
                    {f.estado === "confirmado" ? (
                      <Badge className="bg-success text-success-foreground hover:bg-success">
                        <CheckCircle2 className="mr-1 size-3" aria-hidden />
                        Confirmado
                      </Badge>
                    ) : (
                      <Badge variant="secondary">Pendiente</Badge>
                    )}
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
