import { PantallaLogin } from "@/components/auth/pantalla-login";
import { LoginCorreo } from "@/components/auth/login-correo";
import { accionDev } from "./actions";

export default function PaginaDev() {
  return (
    <PantallaLogin titulo="Panel de desarrollo">
      <LoginCorreo accion={accionDev} />
    </PantallaLogin>
  );
}
