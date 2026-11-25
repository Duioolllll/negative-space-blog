import { useEffect, useRef } from "react";
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

  return (
    <a href={href} onMouseEnter={run} onFocus={run} className="ns-decode ns-mono relative px-3 py-2 text-xs">
      <span className="ns-decode-bracket" aria-hidden="true">[</span>
      <span ref={ref} aria-label={label}>{label}</span>
      <span className="ns-decode-bracket" aria-hidden="true">]</span>
    </a>
  );
}

export function Nav() {
  return (
    <header className="ns-nav fixed inset-x-0 top-0 z-50">
      <nav className="flex h-16 items-center justify-between px-5 md:px-10" aria-label="주요 메뉴">
        <a href="/" className="flex items-center gap-3" aria-label="Negative Space 홈">
          <Monogram className="h-6 w-6" />
          <span className="ns-display text-base tracking-tight">Negative Space</span>
        </a>
        <div className="flex items-center gap-1 md:gap-6">
          <a href="/#sheet" className="ns-navlink hidden text-sm md:inline-block">글</a>
          <a href="/#topics" className="ns-navlink hidden text-sm md:inline-block">주제</a>
          <a href="/#about" className="ns-navlink hidden text-sm md:inline-block">소개</a>
          <DecodeLink href="/#letters" label="구독하기" />
        </div>
      </nav>
    </header>
  );
}
