"use client";

import { useMemo, useState } from "react";
import {
  Download,
  Search,
  CheckCircle2,
  X,
  ChevronLeft,
  ChevronRight,
  SearchX,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EstadoVacio } from "@/components/estado/estado-vacio";
import { BotonLiberar } from "./boton-liberar";
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
const POR_PAGINA = 15;

export function TablaSelecciones({
  filas,
  areas,
  adminEmail,
  permitirLiberar = false,
  mostrarCodigo = true,
  exportBase = "/kidotoy/selecciones/export",
}: {
  filas: FilaSeleccion[];
  areas: string[];
  /** Solo el panel de Kidotoy puede liberar; el portal del Acueducto es de solo lectura. */
  adminEmail?: string;
  permitirLiberar?: boolean;
  /** El código de entrega es un token de reclamo, no un dato de reporte: se oculta al Acueducto. */
  mostrarCodigo?: boolean;
  exportBase?: string;
}) {
  const [edad, setEdad] = useState(TODAS);
  const [genero, setGenero] = useState(TODAS);
  const [area, setArea] = useState(TODAS);
  const [estado, setEstado] = useState(TODAS);
  const [q, setQ] = useState("");
  const [pagina, setPagina] = useState(0);

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
        const blob =
          `${f.beneficiario} ${f.colaborador} ${f.cedula} ${f.producto ?? ""} ${f.codigoEntrega ?? ""}`.toLowerCase();
        if (!blob.includes(t)) return false;
      }
      return true;
    });
  }, [filas, edad, genero, area, estado, q]);

  // Reiniciar a la primera página cada vez que cambia el conjunto filtrado.
  const paginas = Math.max(1, Math.ceil(filtradas.length / POR_PAGINA));
  const p = Math.min(pagina, paginas - 1);
  const visibles = filtradas.slice(p * POR_PAGINA, p * POR_PAGINA + POR_PAGINA);
  const desde = filtradas.length === 0 ? 0 : p * POR_PAGINA + 1;
  const hasta = Math.min(p * POR_PAGINA + POR_PAGINA, filtradas.length);

  function reset<T>(setter: (v: T) => void, valor: T) {
    setter(valor);
    setPagina(0);
  }

  const chips: { clave: string; texto: string; limpiar: () => void }[] = [];
  if (edad !== TODAS)
    chips.push({ clave: "edad", texto: `Edad ${edad}`, limpiar: () => reset(setEdad, TODAS) });
  if (genero !== TODAS)
    chips.push({ clave: "genero", texto: genero, limpiar: () => reset(setGenero, TODAS) });
  if (area !== TODAS)
    chips.push({ clave: "area", texto: area, limpiar: () => reset(setArea, TODAS) });
  if (estado !== TODAS)
    chips.push({
      clave: "estado",
      texto: estado === "confirmado" ? "Confirmado" : "Pendiente",
      limpiar: () => reset(setEstado, TODAS),
    });
  if (q.trim())
    chips.push({ clave: "q", texto: `"${q.trim()}"`, limpiar: () => reset(setQ, "") });

  const hayFiltros = chips.length > 0;
  const limpiarTodo = () => {
    setEdad(TODAS);
    setGenero(TODAS);
    setArea(TODAS);
    setEstado(TODAS);
    setQ("");
    setPagina(0);
  };

  const exportUrl = useMemo(() => {
    const params = new URLSearchParams();
    if (edad !== TODAS) params.set("edad", edad);
    if (genero !== TODAS) params.set("genero", genero);
    if (area !== TODAS) params.set("area", area);
    if (estado !== TODAS) params.set("estado", estado);
    if (q.trim()) params.set("q", q.trim());
    const s = params.toString();
    return `${exportBase}${s ? `?${s}` : ""}`;
  }, [edad, genero, area, estado, q, exportBase]);

  return (
    <div className="space-y-3">
      {/* Barra de filtros */}
      <div className="rounded-md border bg-card p-3">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative min-w-56 flex-1">
            <Search
              className="absolute left-2.5 top-2.5 size-4 text-muted-foreground"
              aria-hidden
            />
            <Input
              placeholder="Buscar nombre, cédula o código"
              value={q}
              onChange={(e) => reset(setQ, e.target.value)}
              className="pl-8"
            />
          </div>

          <Select value={edad} onValueChange={(v) => reset(setEdad, v)}>
            <SelectTrigger className="w-28">
              <SelectValue placeholder="Edad" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={TODAS}>Toda edad</SelectItem>
              {edades.map((e) => (
                <SelectItem key={e} value={String(e)}>
                  {e} años
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={genero} onValueChange={(v) => reset(setGenero, v)}>
            <SelectTrigger className="w-28">
              <SelectValue placeholder="Género" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={TODAS}>Todo género</SelectItem>
              <SelectItem value="Niño">Niño</SelectItem>
              <SelectItem value="Niña">Niña</SelectItem>
            </SelectContent>
          </Select>

          <Select value={area} onValueChange={(v) => reset(setArea, v)}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Área" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={TODAS}>Toda área</SelectItem>
              {areas.map((a) => (
                <SelectItem key={a} value={a}>
                  {a}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={estado} onValueChange={(v) => reset(setEstado, v)}>
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
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

        {/* Filtros activos: chips removibles a la izquierda; "Limpiar todo"
            SEPARADO a la derecha para que nadie lo toque queriendo quitar uno. */}
        {hayFiltros && (
          <div className="mt-3 flex items-center justify-between gap-4 border-t pt-3">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-xs text-muted-foreground">Filtros:</span>
              {chips.map((c) => (
                <button
                  key={c.clave}
                  type="button"
                  onClick={c.limpiar}
                  className="inline-flex items-center gap-1 rounded-full bg-secondary px-2.5 py-1 text-xs font-medium text-secondary-foreground hover:bg-secondary/70"
                >
                  {c.texto}
                  <X className="size-3" aria-hidden />
                </button>
              ))}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={limpiarTodo}
              className="shrink-0 text-muted-foreground"
            >
              Limpiar todo
            </Button>
          </div>
        )}
      </div>

      <p className="text-xs text-muted-foreground tabular-nums">
        {filtradas.length} de {filas.length} beneficiarios
      </p>

      {filtradas.length === 0 ? (
        <EstadoVacio
          icon={SearchX}
          titulo="Ningún beneficiario coincide"
          descripcion="No hay resultados con estos filtros. Prueba con otros o límpialos."
        >
          {hayFiltros && (
            <Button variant="outline" onClick={limpiarTodo}>
              Limpiar filtros
            </Button>
          )}
        </EstadoVacio>
      ) : (
        <>
          <div className="overflow-x-auto rounded-md border bg-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Beneficiario</TableHead>
                  <TableHead className="w-14 text-right">Edad</TableHead>
                  <TableHead className="w-16">Género</TableHead>
                  <TableHead>Colaborador</TableHead>
                  <TableHead>Área</TableHead>
                  <TableHead>Juguete</TableHead>
                  {mostrarCodigo && <TableHead>Código</TableHead>}
                  <TableHead className="w-28">Estado</TableHead>
                  {permitirLiberar && (
                    <TableHead className="w-24 text-right">Acción</TableHead>
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {visibles.map((f) => (
                  <TableRow key={f.beneficiarioId}>
                    <TableCell className="font-medium">
                      {f.beneficiario}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {f.edad}
                    </TableCell>
                    <TableCell>{f.genero}</TableCell>
                    <TableCell>{f.colaborador}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {f.area ?? "—"}
                    </TableCell>
                    <TableCell>{f.producto ?? "—"}</TableCell>
                    {mostrarCodigo && (
                      <TableCell className="font-mono text-xs">
                        {f.codigoEntrega ?? "—"}
                      </TableCell>
                    )}
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
                    {permitirLiberar && (
                      <TableCell className="text-right">
                        {f.estado === "confirmado" && f.seleccionId && (
                          <BotonLiberar
                            fila={f}
                            adminEmail={adminEmail ?? "—"}
                          />
                        )}
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span className="tabular-nums">
              {desde}–{hasta} de {filtradas.length}
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
        </>
      )}
    </div>
  );
}
