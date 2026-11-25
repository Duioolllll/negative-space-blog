import { useEffect, useRef } from "react";
import { RAIL_POSTS, formatDate } from "../../lib/blog/posts";
import { Loupe } from "./loupe";
import { prefersReducedMotion, useScrollProgress } from "./use-scroll-progress";

export function ContactSheet() {
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLOListElement>(null);
  const travel = useRef(0);

  useEffect(() => {
    const section = sectionRef.current;
    const track = trackRef.current;
    if (!section || !track) return;
    if (prefersReducedMotion()) {
      section.dataset.static = "true";
      return;
    }
    const size = () => {
      if (window.innerWidth < 768) {
        section.style.height = "";
        travel.current = 0;
        section.dataset.static = "true";
        return;
      }
      section.dataset.static = "false";
      // Travel inside the (inset) stage, not the whole window.
      const distance = Math.max(0, track.scrollWidth - track.clientWidth);
      travel.current = distance;
      section.style.height = `${window.innerHeight + distance}px`;
    };
    size();
    window.addEventListener("resize", size);
    return () => window.removeEventListener("resize", size);
  }, []);

  useScrollProgress(sectionRef, (p) => {
    const track = trackRef.current;
    if (!track || travel.current === 0) {
      if (track) track.style.transform = "";
      return;
    }
    track.style.transform = `translate3d(${(-p * travel.current).toFixed(1)}px,0,0)`;
  }, { smoothing: 0.12 });

  return (
    <section id="sheet" ref={sectionRef} className="ns-sheet relative bg-ink text-paper" aria-labelledby="sheet-title">
      <div className="ns-sheet-stage flex flex-col justify-center overflow-hidden py-20 md:sticky md:top-0 md:h-dvh md:py-0">
        <div className="flex items-end justify-between px-5 md:px-10">
          <h2 id="sheet-title" className="text-4xl leading-none tracking-tight md:text-6xl">밀착 인화</h2>
          <p className="ns-mono hidden max-w-[22rem] text-right text-xs leading-relaxed text-paper/60 md:block">
            최근에 쓴 글들. 프레임 위에 커서를 올리면 루페로 들여다볼 수 있어요.
          </p>
        </div>
        <ol ref={trackRef} className="ns-sheet-track mt-12 flex gap-6 px-5 md:gap-10 md:px-10" role="list">
          {RAIL_POSTS.map((post, i) => (
            <li key={post.slug} className="shrink-0">
              <a href={`/posts/${post.slug}`} className={`ns-frame group block w-[78vw] md:w-[30rem] ${i === 1 ? "is-marked" : ""}`}>
                <div className="ns-film relative bg-[#050506] px-3 py-6">
                  <div className="ns-film-print relative overflow-hidden">
                    <img src={post.image} alt="" className="aspect-[4/3] w-full object-cover" loading="lazy" />
                    <svg className="ns-loop pointer-events-none absolute -inset-3 h-[calc(100%+1.5rem)] w-[calc(100%+1.5rem)]" viewBox="0 0 100 75" preserveAspectRatio="none" aria-hidden="true">
                      <path d="M6 40 C 4 14, 40 4, 62 6 S 98 22, 95 44 S 60 74, 34 70 S 2 58, 9 30" fill="none" stroke="#C8321E" strokeWidth="0.7" pathLength="1" />
                    </svg>
                  </div>
                </div>
                <div className="mt-4 flex items-start gap-4">
                  <span className="ns-frame-no ns-mono text-3xl leading-none md:text-5xl">{String(i + 1).padStart(2, "0")}A</span>
                  <span className="flex flex-col gap-1 pt-1">
                    <span className="text-lg leading-snug">{post.title}</span>
                    <span className="ns-mono text-xs text-paper/60">{formatDate(post.date)}</span>
                  </span>
                </div>
              </a>
            </li>
          ))}
        </ol>
      </div>
      <Loupe scope={sectionRef} />
    </section>
  );
}
