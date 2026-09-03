import { PantallaLogin } from "@/components/auth/pantalla-login";
import { LoginCorreo } from "@/components/auth/login-correo";
import { accionKidotoy } from "./actions";

export default function PaginaKidotoy() {
  return (
    <PantallaLogin
      titulo="Administración"
      descripcion="Ingreso para el equipo de Kidotoy."
    >
      <LoginCorreo accion={accionKidotoy} />
    </PantallaLogin>
  );
}
