import { ShellEmpresa } from "@/components/empresa/shell";
import { TablaSelecciones } from "@/components/kidotoy/tabla-selecciones";
import { obtenerContexto } from "@/lib/auth/session";
import { obtenerFilasSelecciones } from "@/lib/kidotoy/datos";

export default async function PaginaSeleccionesEmpresa() {
  const { empresaId } = await obtenerContexto();
  const filas = empresaId ? await obtenerFilasSelecciones(empresaId) : [];
  const areas = [
    ...new Set(filas.map((f) => f.area).filter(Boolean) as string[]),
  ].sort();

  return (
    <ShellEmpresa>
      <h1 className="mb-4 font-heading text-xl font-semibold text-foreground">
        Selecciones
      </h1>
      {/* Solo consulta: sin liberar y sin la columna de código de entrega
          (es el token de reclamo, no un dato de reporte). */}
      <TablaSelecciones
        filas={filas}
        areas={areas}
        mostrarCodigo={false}
        exportBase="/empresa/selecciones/export"
      />
    </ShellEmpresa>
  );
}
