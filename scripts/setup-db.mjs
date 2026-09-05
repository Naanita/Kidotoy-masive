// =====================================================================
//  setup-db.mjs — USO LOCAL / OPERATIVO. NO es parte de la app.
//
//  NO importar desde app/, NO exponer por ninguna ruta, NO llega al
//  navegador. Es una herramienta de línea de comandos que se conecta
//  directo a Postgres para aplicar el esquema del piloto.
//
//  Ejecuta los cuatro archivos de supabase/ EN ORDEN estricto:
//    01-schema → 02-rls → 03-funciones → 04-seed
//  Si uno falla, para ahí y reporta cuál y con qué error.
//
//  Reejecutable: hace un teardown (drop if exists) de las tablas del
//  proyecto antes de recrearlas, así correrlo dos veces deja la base en
//  el mismo estado. Las funciones son `create or replace` y el seed borra
//  antes de insertar, de modo que todo converge al mismo resultado.
//
//  La cadena de conexión se lee de SUPABASE_DB_URL (entorno). NUNCA se
//  escribe en el código. Correr con:
//    npm run db:setup       (usa node --env-file=.env.local)
// =====================================================================

import { readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import pg from "pg";

const { Client } = pg;

const DB_URL = process.env.SUPABASE_DB_URL;
if (!DB_URL) {
  console.error(
    "\n✖ Falta SUPABASE_DB_URL en el entorno.\n" +
      "  Copia la cadena de conexión del panel de Supabase\n" +
      "  (Project Settings → Database → Session pooler, puerto 5432)\n" +
      "  a .env.local como SUPABASE_DB_URL=postgresql://...\n",
  );
  process.exit(1);
}

const here = path.dirname(fileURLToPath(import.meta.url));
const supabaseDir = path.join(here, "..", "supabase");

// 05-storage: bucket y políticas de las fotos del catálogo.
// 06-imagenes: OPCIONAL. Lo genera `npm run catalogo:imagenes -- --aplicar` y
// devuelve las URLs de las fotos, que el seed reinserta en null. Si no existe
// todavía, se salta: el catálogo queda sin fotos y cae al preview de marca.
const FILES = [
  "01-schema.sql",
  "02-rls.sql",
  "03-funciones.sql",
  "04-seed.sql",
  "05-storage.sql",
  "06-imagenes.sql",
];
const OPCIONALES = new Set(["06-imagenes.sql"]);

// Teardown: deja la base limpia para que la corrida sea reproducible.
// El cascade se lleva índices, políticas y vistas dependientes, pero NO las
// tablas que apuntan a la que se borra: por eso hay que listar TODAS las tablas
// del proyecto, incluidas las de la era carpas (carpas, carpa_referencias,
// operarios). Si falta alguna, sobrevive al teardown y 01-schema.sql choca al
// recrearla ("relation ... already exists").
const TEARDOWN = `
  drop table if exists
    entregas, selecciones, beneficiarios, productos,
    colaboradores, intentos_acceso, auditoria, tema,
    operarios, carpa_referencias, carpas, empresas
  cascade;
`;

function log(msg) {
  process.stdout.write(msg + "\n");
}

async function scalar(client, sql, params = []) {
  const r = await client.query(sql, params);
  return r.rows[0];
}

async function main() {
  const client = new Client({
    connectionString: DB_URL,
    ssl: { rejectUnauthorized: false },
  });

  await client.connect();
  log("Conectado a Postgres.\n");

  try {
    log("↺ Teardown (drop if exists) para una corrida reproducible…");
    await client.query(TEARDOWN);
    log("  OK\n");

    for (const file of FILES) {
      const ruta = path.join(supabaseDir, file);
      if (OPCIONALES.has(file) && !existsSync(ruta)) {
        log(`▶ ${file} … no existe todavía, se salta`);
        continue;
      }
      const sql = await readFile(ruta, "utf8");
      process.stdout.write(`▶ ${file} … `);
      try {
        await client.query(sql);
        log("OK");
      } catch (e) {
        log("FALLÓ");
        console.error(
          `\n✖ Se detuvo en ${file}. No se ejecutaron los siguientes.\n` +
            `  Error: ${e.message}\n` +
            (e.position ? `  Posición: ${e.position}\n` : "") +
            (e.hint ? `  Pista: ${e.hint}\n` : ""),
        );
        process.exitCode = 1;
        return;
      }
    }

    log("\n── Verificación ──");
    const results = [];

    const { n: colab } = await scalar(
      client,
      "select count(*)::int as n from colaboradores",
    );
    results.push(["colaboradores = 25", colab === 25, `= ${colab}`]);

    const { n: benef } = await scalar(
      client,
      "select count(*)::int as n from beneficiarios",
    );
    results.push(["beneficiarios = 40", benef === 40, `= ${benef}`]);

    const { n: prod } = await scalar(
      client,
      "select count(*)::int as n from productos",
    );
    // Catálogo-muestra: 24 referencias (4 grupos de 6). Producción son 168.
    results.push(["productos = 24", prod === 24, `= ${prod}`]);

    const emp = await scalar(
      client,
      "select nombre from empresas where slug = 'acueducto'",
    );
    results.push([
      "empresa slug 'acueducto'",
      Boolean(emp),
      emp ? `→ ${emp.nombre}` : "no existe",
    ]);

    const ping = await scalar(client, "select ping() as t");
    results.push(["ping() responde", Boolean(ping?.t), ping?.t ? `→ ${ping.t.toISOString?.() ?? ping.t}` : "sin respuesta"]);

    const cfg = await scalar(
      client,
      "select config_publica('acueducto') as c",
    );
    const cfgOk = Boolean(cfg?.c && cfg.c.marca_nombre);
    results.push([
      "config_publica('acueducto') responde",
      cfgOk,
      cfgOk ? `→ ${JSON.stringify(cfg.c)}` : "nula o incompleta",
    ]);

    let allOk = true;
    for (const [label, ok, detail] of results) {
      log(`  ${ok ? "✓" : "✗"} ${label}  ${detail}`);
      if (!ok) allOk = false;
    }

    log("");
    if (allOk) {
      log("✅ Base lista. Falta verificar /api/keepalive → 200 (con el server arriba).");
    } else {
      log("⚠ Hay verificaciones que no pasaron. Revisa arriba.");
      process.exitCode = 1;
    }
  } finally {
    await client.end();
  }
}

main().catch((e) => {
  console.error("\n✖ Error inesperado:", e.message);
  process.exit(1);
});
