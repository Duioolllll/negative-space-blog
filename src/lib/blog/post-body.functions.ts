import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

// Rendered HTML for one post. Runs on the server only, so the full archive of
// post bodies never ships in the browser bundle.
export const getPostBody = createServerFn({ method: "GET" })
  .inputValidator(z.object({ slug: z.string().min(1).max(200) }))
  .handler(async ({ data }) => {
    const { default: bodies } = (await import("../../generated/bodies.json")) as {
      default: Record<string, string>;
    };
    return bodies[data.slug] ?? null;
  });
