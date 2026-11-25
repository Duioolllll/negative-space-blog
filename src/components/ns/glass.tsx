import { useEffect } from "react";

/**
 * Liquid Glass for the web: the functional layer only (nav, floating tools,
 * primary actions). Content (photos, cards, text blocks) never gets glass.
 *
 * GlassLight follows the pointer across interactive glass so the specular
 * highlight answers the hand, the way system glass does on touch. It writes CSS
 * variables directly; no React state per frame.
 */
export function GlassLight() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const onMove = (e: PointerEvent) => {
      const el = (e.target as Element | null)?.closest?.<HTMLElement>(".lg-interactive");
      if (!el) return;
      const r = el.getBoundingClientRect();
      el.style.setProperty("--lg-x", `${(((e.clientX - r.left) / r.width) * 100).toFixed(1)}%`);
      el.style.setProperty("--lg-y", `${(((e.clientY - r.top) / r.height) * 100).toFixed(1)}%`);
    };
    document.addEventListener("pointermove", onMove, { passive: true });
    return () => document.removeEventListener("pointermove", onMove);
  }, []);
  return null;
}
