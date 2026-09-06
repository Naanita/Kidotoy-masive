import { defineCloudflareConfig } from "@opennextjs/cloudflare";

/**
 * Adaptador de OpenNext para Cloudflare Workers. SOLO para el piloto.
 *
 * Sin caché incremental a propósito: se quitó el ISR del layout raíz, así que
 * no hace falta montar un bucket R2 ni su binding. Menos piezas que fallar.
 *
 * ESTE ARCHIVO ES DESECHABLE: se borra el día que la plataforma se mude al VPS
 * (ver docs/DESPLIEGUE-VPS.md).
 */
export default defineCloudflareConfig({});
