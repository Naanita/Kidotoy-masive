import { toast } from "sonner";

/**
 * Notificaciones flotantes (toast) para confirmaciones NO bloqueantes:
 * sesión iniciada, cambios guardados, exportación lista, código copiado.
 * Los errores de formulario nunca van aquí: van pegados al campo (DESIGN §4).
 */
export const notificar = {
  exito: (titulo: string, descripcion?: string) =>
    toast.success(titulo, { description: descripcion }),
  info: (titulo: string, descripcion?: string) =>
    toast.info(titulo, { description: descripcion }),
  advertencia: (titulo: string, descripcion?: string) =>
    toast.warning(titulo, { description: descripcion }),
  error: (titulo: string, descripcion?: string) =>
    toast.error(titulo, { description: descripcion }),
};
