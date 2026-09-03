"use client";

import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Escáner de QR con cámara (html5-qrcode). Se carga de forma dinámica para que
 * nunca se ejecute en el servidor. Al leer un código llama onDetectar y cierra.
 * Requiere HTTPS o localhost y permiso de cámara; si falla, muestra un aviso y
 * el operario puede teclear el código.
 */
export function EscanerQr({
  onDetectar,
  onCerrar,
}: {
  onDetectar: (texto: string) => void;
  onCerrar: () => void;
}) {
  const contenedorId = "lector-qr";
  const scannerRef = useRef<{ stop: () => Promise<void>; clear: () => void } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let activo = true;
    let instancia: { stop: () => Promise<void>; clear: () => void } | null = null;

    (async () => {
      try {
        const { Html5Qrcode } = await import("html5-qrcode");
        if (!activo) return;
        const scanner = new Html5Qrcode(contenedorId);
        instancia = scanner;
        scannerRef.current = scanner;
        await scanner.start(
          { facingMode: "environment" },
          { fps: 10, qrbox: { width: 240, height: 240 } },
          (texto: string) => {
            onDetectar(texto.trim());
          },
          () => {},
        );
      } catch {
        if (activo) {
          setError(
            "No se pudo abrir la cámara. Escribe el código o busca por cédula.",
          );
        }
      }
    })();

    return () => {
      activo = false;
      const s = instancia;
      if (s) {
        s.stop().then(() => s.clear()).catch(() => {});
      }
    };
  }, [onDetectar]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-background">
      <div className="flex items-center justify-between border-b px-4 py-3">
        <span className="text-lg font-semibold">Escanear código QR</span>
        <Button variant="ghost" size="icon" onClick={onCerrar} aria-label="Cerrar">
          <X className="size-6" aria-hidden />
        </Button>
      </div>
      <div className="flex flex-1 items-center justify-center p-4">
        {error ? (
          <p className="max-w-xs text-center text-lg text-muted-foreground">
            {error}
          </p>
        ) : (
          <div id={contenedorId} className="w-full max-w-sm" />
        )}
      </div>
      <div className="p-4">
        <Button
          variant="outline"
          className="h-14 w-full text-lg"
          onClick={onCerrar}
        >
          Cancelar y escribir el código
        </Button>
      </div>
    </div>
  );
}
