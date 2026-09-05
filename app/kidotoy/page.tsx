import { PantallaLoginAdmin } from "@/components/auth/pantalla-login-admin";
import { LoginCorreo } from "@/components/auth/login-correo";
import { accionKidotoy } from "./actions";

export default function PaginaKidotoy() {
  return (
    <PantallaLoginAdmin
      variante="kidotoy"
      titulo="Administración"
      descripcion="Ingreso para el equipo de Kidotoy."
    >
      <LoginCorreo accion={accionKidotoy} />
    </PantallaLoginAdmin>
  );
}
