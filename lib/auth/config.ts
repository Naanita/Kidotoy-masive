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
  "Los datos ingresados no coinciden. Verifica tu documento y tu código.";

/**
 * Equivalente para los accesos con correo + contraseña (Kidotoy, Acueducto,
 * operario, dev). Mismo criterio de no revelar nada: no dice cuál de los dos
 * campos falló ni si el correo existe. Solo cambia el nombre de los campos,
 * porque aquí no hay "documento" ni "código".
 */
export const MENSAJE_ACCESO_CORREO_GENERICO =
  "Los datos ingresados no coinciden. Verifica el correo y la contraseña.";

/** Correo sintético del colaborador: {cedula}@acueducto.interno */
export const DOMINIO_COLABORADOR = "acueducto.interno";

export interface Zona {
  prefijo: string; // raíz del espacio, también su página de login
  rol: Rol;
  home: string; // destino tras autenticarse
  titulo: string;
}

/**
 * Rutas internas del espacio del colaborador. Su login vive en la RAÍZ (`/`),
 * así que su prefijo no sirve para reconocer sus rutas: "/" es prefijo de todo.
 * Por eso se listan aquí y `zonaDeRuta` las consulta aparte.
 */
export const RUTAS_COLABORADOR = ["/inicio", "/beneficiario"];

export const ZONAS: Zona[] = [
  { prefijo: "/", rol: "colaborador", home: "/inicio", titulo: "Colaboradores" },
  { prefijo: "/kidotoy", rol: "admin_kidotoy", home: "/kidotoy/panel", titulo: "Administración Kidotoy" },
  { prefijo: "/empresa", rol: "empresa_cliente", home: "/empresa/panel", titulo: "Portal del Acueducto" },
  { prefijo: "/entrega", rol: "operario_entrega", home: "/entrega/panel", titulo: "Módulo de entrega" },
  { prefijo: "/dev", rol: "admin_dev", home: "/dev/panel", titulo: "Panel de desarrollo" },
];

/**
 * Zona a la que pertenece una ruta, si alguna. El colaborador se evalúa de
 * ÚLTIMO y contra su lista explícita: si se resolviera por prefijo, "/" se
 * tragaría /kidotoy, /empresa, /entrega y /dev.
 */
export function zonaDeRuta(pathname: string): Zona | undefined {
  const otras = ZONAS.filter((z) => z.prefijo !== "/");
  const zona = otras.find(
    (z) => pathname === z.prefijo || pathname.startsWith(z.prefijo + "/"),
  );
  if (zona) return zona;

  const esColaborador =
    pathname === "/" ||
    RUTAS_COLABORADOR.some(
      (r) => pathname === r || pathname.startsWith(r + "/"),
    );
  return esColaborador ? ZONAS.find((z) => z.prefijo === "/") : undefined;
}

/** Home del espacio que corresponde a un rol. */
export function homeDeRol(rol: string | undefined): string | undefined {
  return ZONAS.find((z) => z.rol === rol)?.home;
}
