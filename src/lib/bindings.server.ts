// Server-only access to the Worker's Cloudflare bindings (see wrangler.jsonc).
// `cloudflare:workers` is provided by the workerd runtime and is never bundled.
import { env } from "cloudflare:workers";
import type { D1Database } from "@cloudflare/workers-types";

type AppEnv = {
  DB?: D1Database;
};

export function bindings(): AppEnv {
  return env as unknown as AppEnv;
}
