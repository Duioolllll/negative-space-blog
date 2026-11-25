import { useEffect, useRef, type RefObject } from "react";

const ZOOM = 2.4;

/**
 * A photographer's loupe for the contact sheet: a glass lens that follows the
 * pointer over a frame and magnifies it. Fine pointers only; on touch the
 * frames are simply tapped. Positions are written straight to the DOM.
 */
export function Loupe({ scope }: { scope: RefObject<HTMLElement | null> }) {
  const lens = useRef<HTMLDivElement>(null);
  const view = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = scope.current;
    const el = lens.current;
    const img = view.current;
    if (!root || !el || !img) return;
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;

    let raf = 0;
    let last: PointerEvent | null = null;
    let current: HTMLImageElement | null = null;

    const paint = () => {
      raf = 0;
      const e = last;
      if (!e) return;
      const target = (e.target as Element | null)?.closest?.(".ns-film")?.querySelector("img") ?? null;
      if (!target) {
        root.classList.remove("loupe-on");
        current = null;
        return;
      }
      const r = target.getBoundingClientRect();
      const size = el.offsetWidth;
      if (current !== target) {
        current = target;
        img.style.backgroundImage = `url("${target.currentSrc || target.src}")`;
      }
      const x = e.clientX - r.left;
      const y = e.clientY - r.top;
      img.style.backgroundSize = `${r.width * ZOOM}px ${r.height * ZOOM}px`;
      img.style.backgroundPosition = `${-(x * ZOOM - size / 2)}px ${-(y * ZOOM - size / 2)}px`;
      el.style.transform = `translate3d(${e.clientX - size / 2}px, ${e.clientY - size / 2}px, 0)`;
      root.classList.add("loupe-on");
    };

    const onMove = (e: PointerEvent) => {
      last = e;
      if (!raf) raf = requestAnimationFrame(paint);
    };
    const onLeave = () => {
      root.classList.remove("loupe-on");
      current = null;
    };

    root.addEventListener("pointermove", onMove, { passive: true });
    root.addEventListener("pointerleave", onLeave);
    window.addEventListener("scroll", onLeave, { passive: true });
    return () => {
      root.removeEventListener("pointermove", onMove);
      root.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("scroll", onLeave);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [scope]);

  return (
    <div ref={lens} className="ns-loupe" aria-hidden="true">
      <div ref={view} className="ns-loupe-view" />
      <span className="ns-loupe-rim" />
    </div>
  );
}
