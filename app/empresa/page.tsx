import { PantallaLogin } from "@/components/auth/pantalla-login";
import { LoginCorreo } from "@/components/auth/login-correo";
import { accionEmpresa } from "./actions";

export default function PaginaEmpresa() {
  return (
    <PantallaLogin
      titulo="Portal del Acueducto"
      descripcion="Consulta del avance de la campaña. Solo lectura."
    >
      <LoginCorreo accion={accionEmpresa} />
    </PantallaLogin>
  );
}
