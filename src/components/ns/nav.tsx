import { useEffect, useRef } from "react";
import { GlassLight } from "./glass";
import { Monogram } from "./monogram";

const GLYPHS = "ABCDEFGHJKLMNPQRSTUVWXYZ0123456789";

function DecodeLink({ href, label }: { href: string; label: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const timer = useRef<number | null>(null);

  useEffect(() => () => {
    if (timer.current) window.clearInterval(timer.current);
  }, []);

  const run = () => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let step = 0;
    if (timer.current) window.clearInterval(timer.current);
    timer.current = window.setInterval(() => {
      step += 1;
      const chars = label.split("").map((ch, i) =>
        i < step / 2 ? ch : GLYPHS[Math.floor(Math.random() * GLYPHS.length)],
      );
      el.textContent = chars.join("");
      if (step / 2 >= label.length) {
        el.textContent = label;
        if (timer.current) window.clearInterval(timer.current);
        timer.current = null;
      }
    }, 38);
  };

  // A solid fill inside the glass bar: glass never sits on glass.
  return (
    <a href={href} onMouseEnter={run} onFocus={run} className="ns-nav-cta">
      <span ref={ref} aria-label={label}>{label}</span>
    </a>
  );
}

export function Nav() {
  return (
    <header className="ns-nav-wrap pointer-events-none fixed inset-x-0 top-0 z-50 flex justify-center px-3 pt-3 md:pt-4">
      <GlassLight />
      <nav className="lg lg-regular lg-interactive ns-nav pointer-events-auto" aria-label="주요 메뉴">
        <a href="/" className="ns-nav-home" aria-label="Negative Space 홈">
          <Monogram className="h-5 w-5" />
          <span className="ns-display text-[15px] tracking-tight">Negative Space</span>
        </a>
        <span className="ns-nav-sep hidden md:block" aria-hidden="true" />
        <a href="/#sheet" className="ns-navlink hidden md:inline-flex">글</a>
        <a href="/#topics" className="ns-navlink hidden md:inline-flex">주제</a>
        <a href="/#about" className="ns-navlink hidden md:inline-flex">소개</a>
        <DecodeLink href="/#letters" label="구독하기" />
      </nav>
    </header>
  );
}
