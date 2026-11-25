import { useEffect, useRef } from "react";
import { clamp01, easeInOut, easeOut, useScrollProgress } from "./use-scroll-progress";

type Variant = {
  key: string;
  fit: "slice" | "meet";
  vb: [number, number];
  lines: { text: string; x: number; y: number; size: number }[];
  className: string;
};

// Two layouts of the same masked word: wide for desktop, stacked for phones.
const VARIANTS: Variant[] = [
  {
    key: "wide",
    fit: "slice",
    vb: [1600, 1000],
    lines: [
      { text: "NEGATIVE", x: 800, y: 360, size: 300 },
      { text: "SPACE", x: 800, y: 612, size: 300 },
    ],
    className: "hidden md:block",
  },
  {
    key: "tall",
    fit: "meet",
    vb: [800, 1500],
    lines: [
      { text: "NEGA", x: 390, y: 430, size: 270 },
      { text: "TIVE", x: 390, y: 680, size: 270 },
      { text: "SPACE", x: 380, y: 910, size: 196 },
    ],
    className: "md:hidden",
  },
];

function initialDot(v: Variant) {
  const l = v.lines[v.lines.length - 1];
  const s = l.size * 0.2;
  const estWidth = l.text.length * l.size * 0.6;
  return { x: l.x + estWidth / 2 + l.size * 0.06, y: l.y - s, s };
}

function MaskedWord({ v }: { v: Variant }) {
  const [w, h] = v.vb;
  const dot = initialDot(v);
  const id = `ns-mask-${v.key}`;
  return (
    <svg
      data-variant={v.key}
      className={`absolute inset-0 h-full w-full ${v.className}`}
      viewBox={`0 0 ${w} ${h}`}
      preserveAspectRatio={`xMidYMid ${v.fit}`}
      aria-hidden="true"
    >
      <defs>
        <mask id={id} maskUnits="userSpaceOnUse" x={-w * 4} y={-h * 4} width={w * 9} height={h * 9}>
          <rect x={-w * 4} y={-h * 4} width={w * 9} height={h * 9} fill="black" />
          <g data-zoom="">
            {v.lines.map((l, li) => (
              <text
                key={l.text}
                data-last={li === v.lines.length - 1 ? "" : undefined}
                x={l.x}
                y={l.y}
                fontSize={l.size}
                textAnchor="middle"
                fill="white"
                className="ns-display"
                style={{ fontWeight: 900, letterSpacing: "-0.04em" }}
              >
                {l.text}
              </text>
            ))}
            <rect data-dot="" x={dot.x} y={dot.y} width={dot.s} height={dot.s} fill="white" />
          </g>
        </mask>
      </defs>
      <image
        href="/assets/hero-negative.jpg"
        x={-w * 0.3}
        y={-h * 0.3}
        width={w * 1.6}
        height={h * 1.6}
        preserveAspectRatio="xMidYMid slice"
        mask={`url(#${id})`}
      />
    </svg>
  );
}

export function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const anchors = useRef(new Map<string, { cx: number; cy: number }>());

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const measure = () => {
      el.querySelectorAll<SVGSVGElement>("svg[data-variant]").forEach((svg) => {
        const v = VARIANTS.find((x) => x.key === svg.dataset.variant);
        const text = svg.querySelector<SVGTextElement>("text[data-last]");
        const rect = svg.querySelector<SVGRectElement>("rect[data-dot]");
        if (!v || !text || !rect) return;
        let len = 0;
        try {
          len = text.getComputedTextLength();
        } catch {
          return;
        }
        if (!len) return;
        const l = v.lines[v.lines.length - 1];
        const size = l.size * 0.2;
        const x = l.x + len / 2 + l.size * 0.06;
        const y = l.y - size;
        rect.setAttribute("x", x.toFixed(1));
        rect.setAttribute("y", y.toFixed(1));
        anchors.current.set(v.key, { cx: x + size / 2, cy: y + size / 2 });
      });
    };
    measure();
    const fonts = (document as Document & { fonts?: FontFaceSet }).fonts;
    fonts?.ready.then(measure).catch(() => undefined);
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  useScrollProgress(sectionRef, (p, el) => {
    const zoomT = easeInOut(clamp01(p / 0.72));
    const scale = Math.pow(90, zoomT);
    el.querySelectorAll<SVGSVGElement>("svg[data-variant]").forEach((svg) => {
      const a = anchors.current.get(svg.dataset.variant ?? "");
      const g = svg.querySelector<SVGGElement>("g[data-zoom]");
      if (!a || !g) return;
      g.setAttribute(
        "transform",
        `translate(${a.cx} ${a.cy}) scale(${scale}) translate(${-a.cx} ${-a.cy})`,
      );
    });
    const develop = clamp01((p - 0.5) / 0.32);
    el.style.setProperty("--develop", develop.toFixed(4));
    el.style.setProperty("--copy-y", `${(easeOut(clamp01(p / 0.4)) * 130).toFixed(2)}%`);
    el.style.setProperty("--caption-y", `${((1 - easeOut(clamp01((p - 0.78) / 0.2))) * 140).toFixed(2)}%`);
    el.style.setProperty("--meter", clamp01(p).toFixed(4));
  });

  return (
    <section ref={sectionRef} className="ns-hero relative" aria-labelledby="hero-title">
      <div className="ns-hero-stage sticky top-0 h-dvh overflow-hidden">
        {VARIANTS.map((v) => (
          <MaskedWord key={v.key} v={v} />
        ))}

        <div className="ns-hero-positive absolute inset-0" aria-hidden="true">
          <img src="/assets/hero.jpg" alt="" className="h-full w-full object-cover" fetchPriority="high" />
        </div>

        <div className="ns-hero-copy absolute inset-x-0 bottom-0 px-5 pb-8 md:px-10 md:pb-10">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div className="max-w-[40rem]">
              <h1 id="hero-title" className="ns-split text-4xl leading-[1.08] tracking-tight text-ink md:text-6xl">
                <span>글이</span> <span>현상되는</span> <span>곳</span>
              </h1>
              <p className="mt-4 max-w-[34rem] text-base leading-relaxed text-mid">
                쓰고, 지우고, 기다리는 동안 떠오르는 것들을 기록합니다. 글쓰기와 코드, 디자인과 사진에 대한 느린 블로그.
              </p>
            </div>
            <ViewfinderLink href="#featured">최신 글 읽기</ViewfinderLink>
          </div>
        </div>

        <div className="ns-hero-caption absolute inset-x-0 bottom-0 px-5 pt-24 pb-8 md:px-10 md:pb-10" aria-hidden="true">
          <p className="ns-mono text-xs text-paper/80">FIX 00:42</p>
          <p className="mt-2 max-w-[22rem] text-2xl leading-snug text-paper md:text-3xl">
            인화가 끝났습니다. 이제 읽을 차례예요.
          </p>
        </div>

        <div className="ns-hero-meter absolute right-5 top-1/2 hidden h-40 w-px -translate-y-1/2 bg-hairline md:block md:right-10" aria-hidden="true">
          <span className="absolute left-0 top-0 block h-full w-px origin-top bg-safelight" />
        </div>
      </div>
    </section>
  );
}

function ViewfinderLink({ href, children }: { href: string; children: string }) {
  return (
    <a href={href} className="ns-viewfinder group relative inline-flex items-center gap-3 self-start px-5 py-4 text-base text-ink md:self-auto">
      <span className="ns-vf-corner ns-vf-tl" aria-hidden="true" />
      <span className="ns-vf-corner ns-vf-tr" aria-hidden="true" />
      <span className="ns-vf-corner ns-vf-bl" aria-hidden="true" />
      <span className="ns-vf-corner ns-vf-br" aria-hidden="true" />
      <span className="h-2 w-2 bg-safelight" aria-hidden="true" />
      {children}
    </a>
  );
}
