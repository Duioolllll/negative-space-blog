import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { bindings } from "../bindings.server";

export const subscribe = createServerFn({ method: "POST" })
  .inputValidator(z.object({ email: z.string().trim().toLowerCase().email().max(254) }))
  .handler(async ({ data }) => {
    const { DB } = bindings();
    if (!DB) {
      return { ok: false as const, reason: "unavailable" as const };
    }
    const existing = await DB.prepare("SELECT id FROM subscribers WHERE email = ?")
      .bind(data.email)
      .first<{ id: number }>();
    if (existing) {
      return { ok: true as const, already: true };
    }
    await DB.prepare("INSERT INTO subscribers (email) VALUES (?)").bind(data.email).run();
    return { ok: true as const, already: false };
  });
