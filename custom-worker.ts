// @ts-expect-error — lo genera OpenNext durante el build; no existe antes.
import { default as handler } from "./.open-next/worker.js";

/**
 * Entrypoint propio del Worker del PILOTO. Desechable: se borra al migrar al VPS.
 *
 * El Worker que genera OpenNext solo exporta `fetch`. Para tener tareas
 * programadas hace falta un entrypoint propio que reutilice ese `fetch` y añada
 * el `scheduled`; por eso wrangler.jsonc apunta aquí y no a .open-next/worker.js.
 *
 * Las dos tareas se despachan CONTRA LA PROPIA APLICACIÓN, reusando las rutas
 * que ya existen y están probadas. No se duplica lógica aquí.
 *
 * El host de la Request es sintético a propósito: esas dos rutas solo miran la
 * ruta y las cabeceras, nunca construyen URLs absolutas, así que esto no depende
 * del dominio y sigue funcionando si el dominio cambia.
 */
export default {
  fetch: handler.fetch,

  async scheduled(
    event: ScheduledController,
    env: CloudflareEnv,
    ctx: ExecutionContext,
  ) {
    const llamar = (ruta: string, cabeceras: HeadersInit = {}) =>
      handler.fetch(
        new Request(`https://interno${ruta}`, { headers: cabeceras }),
        env,
        ctx,
      );

    switch (event.cron) {
      // Mantiene despierto el proyecto de Supabase (se pausa a los 7 días).
      case "0 9 * * *":
        await llamar("/api/keepalive");
        break;

      // Resumen diario a Kidotoy.
      case "30 12 * * *":
        await llamar("/api/resumen-diario", {
          "x-cron-secret":
            (env as unknown as { CRON_SECRET?: string }).CRON_SECRET ?? "",
        });
        break;
    }
  },
} satisfies ExportedHandler<CloudflareEnv>;
