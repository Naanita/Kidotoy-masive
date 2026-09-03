"use client";

import { useState, useEffect, useMemo, useRef, useTransition } from "react";
import { toast } from "sonner";
import {
  Save,
  RotateCcw,
  Download,
  Upload,
  Wand2,
  Sun,
  Moon,
  TriangleAlert,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { PreviewTema } from "./preview-tema";
import { CURATED_FONTS } from "@/lib/theme/fonts";
import { DEFAULTS_LIGHT, estiloPreview, type Overrides } from "@/lib/theme/defaults";
import {
  contraste,
  foregroundLegible,
  hexToHsl,
  formatHsl,
  hslStringToHex,
} from "@/lib/theme/color";
import { guardarTema } from "@/app/dev/tema/actions";

const COLORES: { key: string; label: string }[] = [
  { key: "primary", label: "Primario" },
  { key: "primary-foreground", label: "Texto s/ primario" },
  { key: "background", label: "Fondo" },
  { key: "foreground", label: "Texto base" },
  { key: "card", label: "Tarjeta" },
  { key: "muted", label: "Apagado" },
  { key: "muted-foreground", label: "Texto apagado" },
  { key: "secondary", label: "Secundario" },
  { key: "accent", label: "Acento" },
  { key: "border", label: "Borde" },
  { key: "destructive", label: "Error" },
  { key: "success", label: "Éxito" },
  { key: "warning", label: "Advertencia" },
  { key: "ring", label: "Foco" },
];

const PARES_CONTRASTE: [string, string, string][] = [
  ["background", "foreground", "Fondo / texto"],
  ["primary", "primary-foreground", "Primario"],
  ["card", "card-foreground", "Tarjeta"],
  ["secondary", "secondary-foreground", "Secundario"],
  ["muted", "muted-foreground", "Apagado"],
  ["destructive", "destructive-foreground", "Error"],
  ["success", "success-foreground", "Éxito"],
  ["warning", "warning-foreground", "Advertencia"],
];

function pxDe(v: string): number {
  const m = /^([\d.]+)(px|rem)$/.exec(v.trim());
  if (!m) return 0;
  return m[2] === "rem" ? parseFloat(m[1]) * 16 : parseFloat(m[1]);
}

export function PanelTema({ temaGuardado }: { temaGuardado: Overrides }) {
  const [overrides, setOverrides] = useState<Overrides>(temaGuardado);
  const [guardado, setGuardado] = useState<Overrides>(temaGuardado);
  const [modo, setModo] = useState<"light" | "dark">("light");
  const [pending, startTransition] = useTransition();
  const fileRef = useRef<HTMLInputElement>(null);

  const eff = (k: string) => overrides[k] ?? DEFAULTS_LIGHT[k] ?? "";
  const set = (k: string, v: string) => setOverrides((o) => ({ ...o, [k]: v }));

  const sucio = useMemo(
    () => JSON.stringify(overrides) !== JSON.stringify(guardado),
    [overrides, guardado],
  );

  // Aviso al salir con cambios sin guardar (cierre/recarga de pestaña).
  useEffect(() => {
    if (!sucio) return;
    const h = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", h);
    return () => window.removeEventListener("beforeunload", h);
  }, [sucio]);

  const style = useMemo(() => estiloPreview(overrides, modo), [overrides, modo]);

  const advertencias = useMemo(
    () =>
      PARES_CONTRASTE.map(([bg, fg, label]) => ({
        label,
        ratio: contraste(eff(bg), eff(fg)),
      })).filter((x) => x.ratio > 0 && x.ratio < 4.5),
    [overrides],
  );

  function generarVariantes() {
    // Deriva los *-foreground legibles a partir de cada color de fondo, y ata
    // el color de foco al primario.
    const next = { ...overrides };
    for (const base of ["primary", "secondary", "accent", "destructive", "success", "warning"]) {
      next[`${base}-foreground`] = foregroundLegible(eff(base));
    }
    next["ring"] = eff("primary");
    setOverrides(next);
    toast.success("Variantes derivadas del color primario");
  }

  function guardar() {
    startTransition(async () => {
      const r = await guardarTema(overrides);
      if (r.ok) {
        setGuardado(overrides);
        toast.success("Tema guardado");
      } else {
        toast.error(r.error ?? "No se pudo guardar");
      }
    });
  }

  function restablecer() {
    setOverrides({});
    toast.info("Valores por defecto (recuerda guardar)");
  }

  function exportar() {
    const blob = new Blob([JSON.stringify(overrides, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "tema.json";
    a.click();
    URL.revokeObjectURL(url);
  }

  function importar(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    file.text().then((txt) => {
      try {
        const data = JSON.parse(txt) as Record<string, unknown>;
        const limpio: Overrides = {};
        for (const [k, v] of Object.entries(data)) {
          if (k in DEFAULTS_LIGHT && typeof v === "string") limpio[k] = v;
        }
        setOverrides(limpio);
        toast.success("Tema importado (recuerda guardar)");
      } catch {
        toast.error("El archivo no es un tema válido");
      }
      if (fileRef.current) fileRef.current.value = "";
    });
  }

  const logoUrl =
    (modo === "dark" ? overrides["logo-dark-url"] : overrides["logo-url"]) ||
    overrides["logo-url"] ||
    null;

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,380px)_1fr]">
      {/* ---------------- Controles ---------------- */}
      <div className="space-y-6">
        <div className="sticky top-0 z-10 flex flex-wrap gap-2 bg-background/95 py-2 backdrop-blur">
          <Button onClick={guardar} disabled={pending || !sucio}>
            {pending ? (
              <Loader2 className="mr-2 size-4 animate-spin" aria-hidden />
            ) : (
              <Save className="mr-2 size-4" aria-hidden />
            )}
            Guardar
          </Button>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline">
                <RotateCcw className="mr-2 size-4" aria-hidden />
                Restablecer
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>¿Restablecer valores por defecto?</AlertDialogTitle>
                <AlertDialogDescription>
                  Se descartan todos los cambios del tema y se vuelve al diseño
                  base. Tendrás que guardar para que quede aplicado.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={restablecer}>
                  Restablecer
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          <Button variant="outline" onClick={exportar}>
            <Download className="mr-2 size-4" aria-hidden />
            Exportar
          </Button>
          <Button variant="outline" onClick={() => fileRef.current?.click()}>
            <Upload className="mr-2 size-4" aria-hidden />
            Importar
          </Button>
          <input
            ref={fileRef}
            type="file"
            accept="application/json"
            className="hidden"
            onChange={importar}
          />
          {sucio && (
            <span className="flex items-center text-sm text-warning">
              Cambios sin guardar
            </span>
          )}
        </div>

        {/* Colores */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-heading text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Colores
            </h2>
            <Button variant="ghost" size="sm" onClick={generarVariantes}>
              <Wand2 className="mr-1.5 size-3.5" aria-hidden />
              Generar variantes
            </Button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {COLORES.map(({ key, label }) => {
              const hex = hslStringToHex(eff(key)) || "#000000";
              return (
                <div key={key} className="space-y-1">
                  <Label className="text-xs">{label}</Label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={hex}
                      onChange={(e) => {
                        const hsl = hexToHsl(e.target.value);
                        if (hsl) set(key, formatHsl(hsl));
                      }}
                      className="size-9 shrink-0 cursor-pointer rounded border bg-transparent"
                      aria-label={label}
                    />
                    <Input
                      value={hex}
                      onChange={(e) => {
                        const hsl = hexToHsl(e.target.value);
                        if (hsl) set(key, formatHsl(hsl));
                      }}
                      className="h-9 font-mono text-xs"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <Separator />

        {/* Tipografía */}
        <section className="space-y-4">
          <h2 className="font-heading text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Tipografía
          </h2>
          <div className="grid gap-3">
            <div className="space-y-1">
              <Label className="text-xs">Fuente de títulos</Label>
              <Select value={eff("font-heading")} onValueChange={(v) => set("font-heading", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {CURATED_FONTS.map((f) => (
                    <SelectItem key={f.nombre} value={f.nombre}>{f.nombre}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Fuente de cuerpo</Label>
              <Select value={eff("font-body")} onValueChange={(v) => set("font-body", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {CURATED_FONTS.map((f) => (
                    <SelectItem key={f.nombre} value={f.nombre}>{f.nombre}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <SliderControl
            label="Tamaño base"
            value={pxDe(eff("font-size-base"))}
            min={12} max={22} step={1} unidad="px"
            onChange={(v) => set("font-size-base", `${v}px`)}
            nota="Aplica a toda la app (la mini-vista no lo refleja)"
          />
          <SliderControl
            label="Escala tipográfica"
            value={Number(eff("font-scale"))}
            min={1} max={1.5} step={0.05}
            onChange={(v) => set("font-scale", String(v))}
          />
          <div className="space-y-1">
            <Label className="text-xs">Peso de títulos</Label>
            <Select value={eff("font-weight-heading")} onValueChange={(v) => set("font-weight-heading", v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {["400", "500", "600", "700", "800"].map((w) => (
                  <SelectItem key={w} value={w}>{w}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </section>

        <Separator />

        {/* Forma y espacio */}
        <section className="space-y-4">
          <h2 className="font-heading text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Forma y espacio
          </h2>
          <SliderControl
            label="Radio"
            value={pxDe(eff("radius"))}
            min={0} max={20} step={1} unidad="px"
            onChange={(v) => set("radius", `${v}px`)}
          />
          <SliderControl
            label="Unidad de espaciado"
            value={pxDe(eff("spacing-unit"))}
            min={2} max={8} step={0.5} unidad="px"
            onChange={(v) => set("spacing-unit", `${v}px`)}
          />
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs">Densidad</Label>
              <Select value={eff("density")} onValueChange={(v) => set("density", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="0.85">Compacta</SelectItem>
                  <SelectItem value="1">Normal</SelectItem>
                  <SelectItem value="1.15">Amplia</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Sombra</Label>
              <Select value={eff("shadow-level")} onValueChange={(v) => set("shadow-level", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">Ninguna</SelectItem>
                  <SelectItem value="0.08">Sutil</SelectItem>
                  <SelectItem value="0.16">Media</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </section>

        <Separator />

        {/* Marca */}
        <section className="space-y-3">
          <h2 className="font-heading text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Marca
          </h2>
          <div className="space-y-1">
            <Label className="text-xs">Nombre de marca</Label>
            <Input value={eff("marca-nombre")} onChange={(e) => set("marca-nombre", e.target.value)} />
          </div>
          {[
            { key: "logo-url", label: "Logo (URL https)" },
            { key: "logo-dark-url", label: "Logo modo oscuro (URL)" },
            { key: "favicon-url", label: "Favicon (URL)" },
          ].map(({ key, label }) => (
            <div key={key} className="space-y-1">
              <Label className="text-xs">{label}</Label>
              <Input
                value={overrides[key] ?? ""}
                onChange={(e) => set(key, e.target.value)}
                placeholder="https://…"
                className="font-mono text-xs"
              />
            </div>
          ))}
        </section>
      </div>

      {/* ---------------- Vista previa ---------------- */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-heading text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Vista previa
          </h2>
          <div className="flex items-center gap-1 rounded-md border p-0.5">
            <Button
              variant={modo === "light" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setModo("light")}
            >
              <Sun className="mr-1.5 size-3.5" aria-hidden />
              Claro
            </Button>
            <Button
              variant={modo === "dark" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setModo("dark")}
            >
              <Moon className="mr-1.5 size-3.5" aria-hidden />
              Oscuro
            </Button>
          </div>
        </div>

        {advertencias.length > 0 && (
          <Alert variant="destructive">
            <TriangleAlert className="size-4" aria-hidden />
            <AlertTitle>Contraste bajo (menor a 4.5:1)</AlertTitle>
            <AlertDescription>
              {advertencias.map((a) => `${a.label} (${a.ratio}:1)`).join(" · ")}.
              Se puede guardar igual, pero puede costar leerlo al sol.
            </AlertDescription>
          </Alert>
        )}

        <PreviewTema
          style={style}
          dark={modo === "dark"}
          marca={eff("marca-nombre") || "Kidotoy"}
          logoUrl={logoUrl && /^https:\/\//.test(logoUrl) ? logoUrl : null}
        />
      </div>
    </div>
  );
}

function SliderControl({
  label,
  value,
  min,
  max,
  step,
  unidad,
  nota,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unidad?: string;
  nota?: string;
  onChange: (v: number) => void;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <Label className="text-xs">{label}</Label>
        <span className="font-mono text-xs text-muted-foreground">
          {value}
          {unidad ?? ""}
        </span>
      </div>
      <Slider
        value={[value]}
        min={min}
        max={max}
        step={step}
        onValueChange={(v) => onChange(v[0])}
      />
      {nota && <p className="text-[0.7rem] text-muted-foreground">{nota}</p>}
    </div>
  );
}
