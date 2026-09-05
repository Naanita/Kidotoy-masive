// =====================================================================
//  seed-demo.mjs — USO LOCAL. Pobla la base con un "caso realista" para
//  ver el panel de Kidotoy con datos: avance parcial, referencias
//  agotándose y colaboradores pendientes.
//
//  - Usa confirmar_seleccion() (la función real: descuento atómico, código
//    de entrega, auditoría). No inventa filas a mano.
//  - DEJA sin elegir al colaborador estrella 52318904, para poder demostrar
//    el flujo de selección completo desde cero.
//  - Deja ~25% de los demás beneficiarios pendientes, para que "quiénes no
//    han entrado" no salga vacío y el avance no sea 100%.
//  - No destructivo: salta beneficiarios que YA tienen selección (incluye
//    las que hagas tú probando). Reejecutable.
//
//  Volver a cero: `npm run db:reset` (todo pendiente, stock lleno).
//  Correr: `npm run db:demo`
// =====================================================================

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SVC = process.env.SUPABASE_SERVICE_ROLE_KEY;
const ESTRELLA = "52318904"; // se deja pendiente a propósito

if (!URL || !SVC) {
  console.error("\n✖ Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en .env.local.\n");
  process.exit(1);
}

const h = { apikey: SVC, Authorization: `Bearer ${SVC}`, "Content-Type": "application/json" };
const rest = (p) => fetch(`${URL}/rest/v1/${p}`, { headers: h }).then((r) => r.json());
async function rpc(fn, body) {
  const r = await fetch(`${URL}/rest/v1/rpc/${fn}`, { method: "POST", headers: h, body: JSON.stringify(body) });
  const t = await r.text();
  let j; try { j = JSON.parse(t); } catch { j = t; }
  return { status: r.status, body: j };
}

/** Fecha (YYYY-MM-DD) de hace n días, en hora local. */
function fechaHaceDias(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  const p = (x) => String(x).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

/**
 * Reescribe confirmada_en de TODAS las selecciones confirmadas para que queden
 * repartidas en ~13 días con forma de campaña real. Pesos del más viejo (apertura)
 * al más nuevo (hoy): arranque bajo, pico al día siguiente del comunicado de RH,
 * y cola de goteo. Se agrupan por día y se hace un PATCH por día (14:00 -05:00,
 * hora que no cruza de día en UTC, así el corte por fecha de la gráfica es exacto).
 */
async function repartirFechas() {
  const pesos = [2, 3, 5, 9, 14, 12, 9, 7, 5, 4, 3, 3, 2]; // viejo → hoy (13 días)
  const N = pesos.length;
  const suma = pesos.reduce((a, b) => a + b, 0);

  const sels = await rest("selecciones?select=id&order=codigo_entrega");
  const ids = sels.map((s) => s.id);
  const total = ids.length;
  if (total === 0) return;

  // Reparto por mayor resto para que los conteos sumen exactamente el total.
  const crudo = pesos.map((p) => (p / suma) * total);
  const base = crudo.map((x) => Math.floor(x));
  let resto = total - base.reduce((a, b) => a + b, 0);
  const orden = crudo
    .map((x, i) => ({ i, frac: x - Math.floor(x) }))
    .sort((a, b) => b.frac - a.frac);
  for (let k = 0; k < resto; k++) base[orden[k].i]++;

  // Corta los ids en cubos (viejo → nuevo) y hace un PATCH por día.
  let cursor = 0;
  for (let k = 0; k < N; k++) {
    const cuenta = base[k];
    if (cuenta === 0) continue;
    const bucket = ids.slice(cursor, cursor + cuenta);
    cursor += cuenta;
    const offset = N - 1 - k; // k=0 (más viejo) → offset mayor
    const ts = `${fechaHaceDias(offset)}T14:00:00-05:00`;
    const lista = bucket.join(",");
    await fetch(`${URL}/rest/v1/selecciones?id=in.(${lista})`, {
      method: "PATCH",
      headers: { ...h, Prefer: "return=minimal" },
      body: JSON.stringify({ confirmada_en: ts }),
    });
  }
  console.log(`  Fechas de confirmación repartidas en ${N} días (${total} selecciones).`);
}

(async () => {
  const beneficiarios = await rest(
    "beneficiarios?select=id,edad,genero,colaboradores(cedula)&order=id",
  );
  const productos = await rest(
    "productos?select=id,edad,genero,stock_disponible,activo",
  );
  const existentes = await rest("selecciones?select=beneficiario_id");
  const yaTiene = new Set(existentes.map((s) => s.beneficiario_id));

  // Stock local que iremos descontando; concentramos en la referencia de
  // menor stock de cada grupo para que algunas lleguen a agotarse.
  const stock = new Map(productos.map((p) => [p.id, p.stock_disponible]));
  const enGrupo = (edad, genero) =>
    productos
      .filter((p) => p.activo && p.edad === edad && p.genero === genero && (stock.get(p.id) ?? 0) > 0)
      .sort((a, b) => (stock.get(a.id) ?? 0) - (stock.get(b.id) ?? 0));

  let confirmados = 0, saltados = 0, pendientesDejados = 0, errores = 0;

  for (let i = 0; i < beneficiarios.length; i++) {
    const b = beneficiarios[i];
    const cedula = Array.isArray(b.colaboradores) ? b.colaboradores[0]?.cedula : b.colaboradores?.cedula;

    if (cedula === ESTRELLA) { pendientesDejados++; continue; }     // caso estrella intacto
    if (yaTiene.has(b.id)) { saltados++; continue; }                 // ya elegido (no tocar)
    if (i % 4 === 0) { pendientesDejados++; continue; }              // ~25% pendientes

    const opciones = enGrupo(b.edad, b.genero);
    if (opciones.length === 0) { pendientesDejados++; continue; }
    const elegido = opciones[0];

    const r = await rpc("confirmar_seleccion", { p_beneficiario_id: b.id, p_producto_id: elegido.id });
    if (r.status === 200) {
      stock.set(elegido.id, (stock.get(elegido.id) ?? 1) - 1);
      confirmados++;
    } else if (String(r.body?.message).includes("YA_TIENE_SELECCION")) {
      saltados++;
    } else {
      errores++;
      if (errores <= 3) console.error("  error:", r.status, JSON.stringify(r.body).slice(0, 100));
    }
  }

  // --- Reparte las fechas de confirmación en ~13 días hacia atrás, con una
  //     curva realista: pocas al abrir la campaña, un pico al día siguiente del
  //     "comunicado de RH", y luego goteo hasta hoy. confirmar_seleccion() sella
  //     confirmada_en con now(), así que sin esto TODAS caen el mismo día y la
  //     gráfica de evolución se ve como un solo punto (roto, aunque correcto).
  //     Solo se reescriben fechas; nada más se toca del componente ni del RPC.
  await repartirFechas();

  // --- Jornada de entrega en curso: marca ~40% de lo confirmado como
  //     entregado, repartido entre operarios, para que la sección "Entregas"
  //     del panel muestre avance por carpa y últimas entregas.
  const carpas = await rest("carpas?select=id,nombre");
  const asign = await rest("carpa_referencias?select=producto_id,carpa_id");
  const carpaDeProducto = new Map(asign.map((a) => [a.producto_id, a.carpa_id]));
  const confirmadas = await rest(
    "selecciones?select=codigo_entrega,producto_id,entregas(id)&order=codigo_entrega",
  );
  const sinEntregar = confirmadas.filter(
    (s) => !(Array.isArray(s.entregas) ? s.entregas.length : s.entregas),
  );
  const OPERARIOS = ["entrega@kidotoy.local", "carpa7@kidotoy.local", "carpa12@kidotoy.local"];
  let entregadas = 0, fuera = 0;
  for (let i = 0; i < sinEntregar.length; i++) {
    if (i % 5 >= 2) continue; // ~40%
    const sel = sinEntregar[i];
    const carpaCorrecta = carpaDeProducto.get(sel.producto_id) ?? null;
    // El operario trabaja en la carpa correcta, salvo 1 de cada 7 (para mostrar
    // el caso "fuera de carpa" en el panel).
    let opCarpa = carpaCorrecta;
    if (i % 7 === 0) {
      const otra = carpas.find((c) => c.id !== carpaCorrecta);
      if (otra) opCarpa = otra.id;
    }
    const r = await rpc("registrar_entrega", {
      p_codigo_entrega: sel.codigo_entrega,
      p_operario: OPERARIOS[i % OPERARIOS.length],
      p_operario_carpa_id: opCarpa,
    });
    if (r.status === 200 && r.body?.ya_entregado === false) {
      entregadas++;
      if (r.body.fuera_de_carpa) fuera++;
    }
  }
  console.log(`  Entregas registradas (jornada en curso): ${entregadas} (${fuera} fuera de carpa)`);

  // Resumen como lo verá el panel
  const activos = productos.filter((p) => p.activo);
  const agotadas = activos.filter((p) => (stock.get(p.id) ?? 0) === 0).length;
  const inicialPorId = new Map();
  const prodFull = await rest("productos?select=id,stock_inicial");
  prodFull.forEach((p) => inicialPorId.set(p.id, p.stock_inicial));
  const porAgotarse = activos.filter((p) => {
    const d = stock.get(p.id) ?? 0;
    return d > 0 && d < (inicialPorId.get(p.id) ?? 0) * 0.2;
  }).length;

  const total = beneficiarios.length;
  const confirmadosTotal = (await rest("selecciones?select=id")).length;

  console.log("\n── Caso de demostración cargado ──");
  console.log(`  Confirmados en esta corrida: ${confirmados}  (saltados ${saltados}, errores ${errores})`);
  console.log(`  Selecciones totales ahora:   ${confirmadosTotal} de ${total} beneficiarios`);
  console.log(`  Avance:                      ${Math.round((1000 * confirmadosTotal) / total) / 10}%`);
  console.log(`  Referencias agotadas:        ${agotadas}`);
  console.log(`  Referencias por agotarse:    ${porAgotarse}`);
  console.log(`  Colaboradores dejados pendientes (incluye estrella ${ESTRELLA})`);
  console.log("\n✅ Entra a /kidotoy para ver el panel con datos, y a /acceso con 52318904 para elegir desde cero.");
})().catch((e) => { console.error("✖", e.message); process.exit(1); });
