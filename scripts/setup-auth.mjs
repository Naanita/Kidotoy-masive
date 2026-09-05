// =====================================================================
//  setup-auth.mjs — USO LOCAL / OPERATIVO. NO es parte de la app.
//
//  Crea los usuarios de Supabase Auth del piloto con la SERVICE ROLE KEY
//  (solo desde el entorno, nunca hardcodeada, nunca en el navegador):
//
//   - Colaboradores: correo sintético {cedula}@acueducto.interno,
//     contraseña = codigo_sap, app_metadata {empresa_id, rol:'colaborador'}.
//     Luego escribe colaboradores.auth_user_id.
//   - Personal: admin_kidotoy, empresa_cliente, operario_entrega, admin_dev,
//     con el mismo empresa_id en app_metadata.
//
//  Reejecutable (upsert por correo): correrlo dos veces deja el mismo estado.
//  Correr con:  npm run db:auth
// =====================================================================

import { createClient } from "@supabase/supabase-js";

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE = process.env.SUPABASE_SERVICE_ROLE_KEY;
const SLUG = process.env.NEXT_PUBLIC_EMPRESA_SLUG ?? "acueducto";
const DOMINIO = "acueducto.interno";

if (!URL || !SERVICE) {
  console.error(
    "\n✖ Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en .env.local.\n",
  );
  process.exit(1);
}

// Personal del piloto. Credenciales de demostración (datos ficticios).
const PERSONAL = [
  { correo: "admin@kidotoy.local", password: "Kidotoy#2026", rol: "admin_kidotoy" },
  { correo: "rrhh@acueducto.local", password: "Acueducto#2026", rol: "empresa_cliente" },
  { correo: "dev@kidotoy.local", password: "DevKidotoy#2026", rol: "admin_dev" },
];

// Operarios de entrega, cada uno con su carpa. En producción se crean desde el
// panel de Kidotoy; aquí van unos pocos para demostrar varios puestos a la vez.
// Carpas alineadas al catálogo-muestra (grupos con referencias: 2/4/6/10). En
// producción son 28 grupos; estas se re-mapean al llegar el catálogo completo.
const OPERARIOS = [
  { correo: "entrega@kidotoy.local", password: "Entrega#2026", nombre: "Operario Carpa 4", carpa: "Carpa edad 4" },
  { correo: "carpa7@kidotoy.local", password: "Entrega#2026", nombre: "Operario Carpa 6", carpa: "Carpa edad 6" },
  { correo: "carpa12@kidotoy.local", password: "Entrega#2026", nombre: "Operario Carpa 10", carpa: "Carpa edad 10" },
];

const admin = createClient(URL, SERVICE, {
  auth: { persistSession: false, autoRefreshToken: false },
});

function log(m) {
  process.stdout.write(m + "\n");
}

/** Trae todos los usuarios de Auth y los mapea por correo (para upsert). */
async function mapaUsuariosPorCorreo() {
  const mapa = new Map();
  let page = 1;
  for (;;) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 1000 });
    if (error) throw new Error(`listUsers: ${error.message}`);
    for (const u of data.users) if (u.email) mapa.set(u.email.toLowerCase(), u);
    if (data.users.length < 1000) break;
    page += 1;
  }
  return mapa;
}

/** Crea o actualiza un usuario por correo. Devuelve el id. */
async function upsertUsuario(mapa, { correo, password, appMetadata }) {
  const existente = mapa.get(correo.toLowerCase());
  if (existente) {
    const { data, error } = await admin.auth.admin.updateUserById(existente.id, {
      password,
      email_confirm: true,
      app_metadata: appMetadata,
    });
    if (error) throw new Error(`update ${correo}: ${error.message}`);
    return data.user.id;
  }
  const { data, error } = await admin.auth.admin.createUser({
    email: correo,
    password,
    email_confirm: true,
    app_metadata: appMetadata,
  });
  if (error) throw new Error(`create ${correo}: ${error.message}`);
  return data.user.id;
}

async function main() {
  // 1. empresa activa
  const { data: empresa, error: eEmp } = await admin
    .from("empresas")
    .select("id, nombre")
    .eq("slug", SLUG)
    .single();
  if (eEmp || !empresa) {
    throw new Error(
      `No se encontró la empresa slug='${SLUG}'. ¿Corriste 'npm run db:setup'? ${eEmp?.message ?? ""}`,
    );
  }
  const empresaId = empresa.id;
  log(`Empresa: ${empresa.nombre}\n`);

  // 2. colaboradores del seed
  const { data: colaboradores, error: eCol } = await admin
    .from("colaboradores")
    .select("id, cedula, codigo_sap")
    .eq("empresa_id", empresaId);
  if (eCol) throw new Error(`leer colaboradores: ${eCol.message}`);

  const mapa = await mapaUsuariosPorCorreo();

  // 3. upsert de colaboradores + enlace auth_user_id
  log(`↻ Colaboradores (${colaboradores.length})…`);
  let okColab = 0;
  for (const c of colaboradores) {
    const correo = `${c.cedula}@${DOMINIO}`;
    const id = await upsertUsuario(mapa, {
      correo,
      password: c.codigo_sap,
      appMetadata: { empresa_id: empresaId, rol: "colaborador" },
    });
    const { error: eUpd } = await admin
      .from("colaboradores")
      .update({ auth_user_id: id })
      .eq("id", c.id);
    if (eUpd) throw new Error(`enlazar auth_user_id de ${c.cedula}: ${eUpd.message}`);
    okColab += 1;
  }
  log(`  ✓ ${okColab} colaboradores con usuario y auth_user_id enlazado\n`);

  // 4. personal
  log(`↻ Personal (${PERSONAL.length})…`);
  for (const p of PERSONAL) {
    await upsertUsuario(mapa, {
      correo: p.correo,
      password: p.password,
      appMetadata: { empresa_id: empresaId, rol: p.rol },
    });
    log(`  ✓ ${p.rol.padEnd(16)} ${p.correo}`);
  }

  // 5. operarios de entrega, cada uno enlazado a su carpa
  const { data: carpas } = await admin
    .from("carpas")
    .select("id, nombre")
    .eq("empresa_id", empresaId);
  const carpaPorNombre = new Map((carpas ?? []).map((c) => [c.nombre, c.id]));

  log(`\n↻ Operarios (${OPERARIOS.length})…`);
  for (const o of OPERARIOS) {
    const id = await upsertUsuario(mapa, {
      correo: o.correo,
      password: o.password,
      appMetadata: { empresa_id: empresaId, rol: "operario_entrega" },
    });
    const carpaId = carpaPorNombre.get(o.carpa) ?? null;
    const { error: eOp } = await admin.from("operarios").upsert(
      {
        auth_user_id: id,
        empresa_id: empresaId,
        nombre: o.nombre,
        correo: o.correo,
        carpa_id: carpaId,
      },
      { onConflict: "auth_user_id" },
    );
    if (eOp) throw new Error(`operario ${o.correo}: ${eOp.message}`);
    log(`  ✓ ${o.correo.padEnd(22)} → ${o.carpa}`);
  }

  // 6. resumen de credenciales de demostración
  log("\n── Credenciales de demostración ──");
  log("  Colaborador (caso estrella): cédula 52318904 · código SAP-007340");
  log("  → 3 hijos de 3, 7 y 12 años (tres catálogos distintos)\n");
  for (const p of PERSONAL) {
    log(`  ${p.rol.padEnd(16)} ${p.correo}  /  ${p.password}`);
  }
  for (const o of OPERARIOS) {
    log(`  operario         ${o.correo}  /  ${o.password}  (${o.carpa})`);
  }
  log("\n✅ Usuarios de Auth listos.");
}

main().catch((e) => {
  console.error("\n✖ Error:", e.message);
  process.exit(1);
});
