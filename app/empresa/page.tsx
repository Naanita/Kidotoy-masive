import { PantallaLoginAdmin } from "@/components/auth/pantalla-login-admin";
import { LoginCorreo } from "@/components/auth/login-correo";
import { accionEmpresa } from "./actions";

export default function PaginaEmpresa() {
  return (
    <PantallaLoginAdmin
      variante="acueducto"
      titulo="Portal del Acueducto"
      descripcion="Consulta del avance de la campaña. Solo lectura."
    >
      <LoginCorreo accion={accionEmpresa} />
    </PantallaLoginAdmin>
  );
}
