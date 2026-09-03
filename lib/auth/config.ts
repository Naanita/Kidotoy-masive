/**
 * Roles, espacios y el mensaje genérico de acceso.
 * Módulo plano (sin dependencias de servidor) para poder usarlo también en el
 * middleware (edge runtime).
 */

export type Rol =
  | "colaborador"
  | "admin_kidotoy"
  | "empresa_cliente"
  | "operario_entrega"
  | "admin_dev";

/**
 * Mismo mensaje para TODO fallo de acceso, incluido durante el bloqueo por
 * intentos. No revela si la cédula/correo existe, ni si hay bloqueo, ni cuánto
 * falta. Cambiarlo al quinto intento confirmaría que la cédula existe y anularía
 * la protección entera.
 */
export const MENSAJE_ACCESO_GENERICO =
  "Los datos no coinciden. Verifica e intenta de nuevo.";

/** Correo sintético del colaborador: {cedula}@acueducto.interno */
export const DOMINIO_COLABORADOR = "acueducto.interno";

export interface Zona {
  prefijo: string; // raíz del espacio, también su página de login
  rol: Rol;
  home: string; // destino tras autenticarse
  titulo: string;
}

export const ZONAS: Zona[] = [
  { prefijo: "/acceso", rol: "colaborador", home: "/acceso/inicio", titulo: "Colaboradores" },
  { prefijo: "/kidotoy", rol: "admin_kidotoy", home: "/kidotoy/panel", titulo: "Administración Kidotoy" },
  { prefijo: "/empresa", rol: "empresa_cliente", home: "/empresa/panel", titulo: "Portal del Acueducto" },
  { prefijo: "/entrega", rol: "operario_entrega", home: "/entrega/panel", titulo: "Módulo de entrega" },
  { prefijo: "/dev", rol: "admin_dev", home: "/dev/panel", titulo: "Panel de desarrollo" },
];

/** Zona a la que pertenece una ruta, si alguna. */
export function zonaDeRuta(pathname: string): Zona | undefined {
  return ZONAS.find(
    (z) => pathname === z.prefijo || pathname.startsWith(z.prefijo + "/"),
  );
}

/** Home del espacio que corresponde a un rol. */
export function homeDeRol(rol: string | undefined): string | undefined {
  return ZONAS.find((z) => z.rol === rol)?.home;
}
