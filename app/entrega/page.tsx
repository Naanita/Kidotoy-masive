import { PantallaLoginAdmin } from "@/components/auth/pantalla-login-admin";
import { LoginCorreo } from "@/components/auth/login-correo";
import { accionEntrega } from "./actions";

export default function PaginaEntrega() {
  return (
    <PantallaLoginAdmin
      variante="operario"
      titulo="Módulo de entrega"
      descripcion="Ingreso para el operario de la jornada."
    >
      <LoginCorreo accion={accionEntrega} grande />
    </PantallaLoginAdmin>
  );
}
