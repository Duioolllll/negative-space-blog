import { useEffect } from "react";

/**
 * Liquid Glass for the web: the functional layer only (nav, floating tools,
 * primary actions). Content (photos, cards, text blocks) never gets glass.
 *
 * GlassLight does two things once on the client:
 * - turns on edge refraction (`html.lg-refract`) where the browser can run an
 *   SVG filter inside `backdrop-filter` (Chromium). Safari and Firefox keep
 *   the frosted fallback.
 * - follows the pointer across interactive glass so the specular highlight
 *   answers the hand. It writes CSS variables directly; no React state.
 */
function canRefract(): boolean {
  const ua = navigator.userAgent;
  const isWebKitOnly = /Safari/.test(ua) && !/Chrome|Chromium|Edg\//.test(ua);
  if (isWebKitOnly || /Firefox/.test(ua)) return false;
  return typeof CSS !== "undefined" && CSS.supports("backdrop-filter", "url(#ns-lens)");
}

export function GlassLight() {
  useEffect(() => {
    const root = document.documentElement;
    if (canRefract()) root.classList.add("lg-refract");

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
