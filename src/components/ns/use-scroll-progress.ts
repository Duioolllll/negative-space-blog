import { useEffect, useRef, type RefObject } from "react";

export const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);
export const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
export const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);

export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * Scroll progress through a tall section (0 at its top edge, 1 when its bottom
 * reaches the viewport bottom), smoothed with a lerp so scrubbing feels weighted.
 * The callback writes styles directly: no React state per frame.
 */
export function useScrollProgress(
  ref: RefObject<HTMLElement | null>,
  onFrame: (progress: number, el: HTMLElement) => void,
  options: { smoothing?: number; mode?: "pin" | "pass" } = {},
) {
  const cb = useRef(onFrame);
  cb.current = onFrame;
  const smoothing = options.smoothing ?? 0.14;
  const mode = options.mode ?? "pin";

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (prefersReducedMotion()) {
      cb.current(1, el);
      return;
    }

    let target = 0;
    let current = -1;
    let raf = 0;

    const measure = () => {
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight;
      if (mode === "pass") {
        target = clamp01((vh - rect.top) / (vh + rect.height));
        return;
      }
      const travel = rect.height - vh;
      target = travel <= 0 ? (rect.top <= 0 ? 1 : 0) : clamp01(-rect.top / travel);
    };

    const tick = () => {
      raf = 0;
      if (current < 0) current = target;
      current += (target - current) * smoothing;
      if (Math.abs(target - current) < 0.0005) current = target;
      cb.current(current, el);
      if (current !== target) raf = requestAnimationFrame(tick);
    };

    const kick = () => {
      measure();
      if (!raf) raf = requestAnimationFrame(tick);
    };

    kick();
    window.addEventListener("scroll", kick, { passive: true });
    window.addEventListener("resize", kick);
    return () => {
      window.removeEventListener("scroll", kick);
      window.removeEventListener("resize", kick);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [ref, smoothing, mode]);
}
