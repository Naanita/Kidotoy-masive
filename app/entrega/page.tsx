import { PantallaLogin } from "@/components/auth/pantalla-login";
import { LoginCorreo } from "@/components/auth/login-correo";
import { accionEntrega } from "./actions";

export default function PaginaEntrega() {
  return (
    <PantallaLogin
      titulo="Módulo de entrega"
      descripcion="Ingreso para el operario de la jornada."
    >
      <LoginCorreo accion={accionEntrega} />
    </PantallaLogin>
  );
}
