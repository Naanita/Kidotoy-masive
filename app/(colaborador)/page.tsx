import { PantallaLogin } from "@/components/auth/pantalla-login";
import { LoginColaborador } from "@/components/auth/login-colaborador";
import { accionAcceso } from "./actions";

export default function PaginaAcceso() {
  return (
    <PantallaLogin>
      <LoginColaborador accion={accionAcceso} />
    </PantallaLogin>
  );
}
