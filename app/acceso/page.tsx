import { PantallaLogin } from "@/components/auth/pantalla-login";
import { LoginColaborador } from "@/components/auth/login-colaborador";
import { accionAcceso } from "./actions";

export default function PaginaAcceso() {
  return (
    <PantallaLogin
      titulo="Ingresa a elegir"
      descripcion="Usa tu número de cédula y el código SAP que te llegó por correo."
    >
      <LoginColaborador accion={accionAcceso} />
    </PantallaLogin>
  );
}
