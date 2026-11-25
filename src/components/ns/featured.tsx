import { useRef } from "react";
import { FEATURED, formatDate, topicById } from "../../lib/blog/posts";
import { useScrollProgress } from "./use-scroll-progress";

export function Featured() {
  const ref = useRef<HTMLElement>(null);
  useScrollProgress(ref, (p, el) => {
    el.style.setProperty("--parallax", `${((p - 0.5) * -12).toFixed(2)}%`);
  }, { smoothing: 0.1, mode: "pass" });

  const post = FEATURED;
  if (!post) return null;
  return (
    <section id="featured" ref={ref} className="ns-featured relative px-5 pt-28 pb-24 md:px-10 md:pt-40 md:pb-36" aria-labelledby="featured-title">
      <div className="relative grid grid-cols-1 md:grid-cols-12">
        <figure className="ns-featured-figure relative overflow-hidden md:col-span-9 md:col-start-4 md:row-start-1">
          <img
            src={post.image}
            alt=""
            className="ns-featured-img h-[56vw] w-full object-cover md:h-[38vw]"
            loading="lazy"
          />
        </figure>
        <div className="relative z-10 -mt-12 mr-6 bg-paper pt-6 pr-6 md:col-span-6 md:col-start-1 md:row-start-2 md:-mt-48 md:mr-0 md:pt-12 md:pr-14">
          <p className="ns-eyebrow ns-mono text-xs uppercase tracking-[0.18em] text-safelight">이번 주의 글</p>
          <h2 id="featured-title" className="mt-4 text-4xl leading-[1.1] tracking-tight text-ink md:text-6xl">
            {post.title}
          </h2>
          <p className="mt-5 max-w-[32rem] text-base leading-relaxed text-mid">{post.dek}</p>
          <div className="ns-mono mt-6 flex gap-5 text-xs text-mid">
            <span>{formatDate(post.date)}</span>
            <span>{topicById(post.topic).name}</span>
            <span>{post.minutes}분</span>
          </div>
          <PerforationLink href={`/posts/${post.slug}`}>계속 읽기</PerforationLink>
        </div>
      </div>
    </section>
  );
}

function PerforationLink({ href, children }: { href: string; children: string }) {
  return (
    <a href={href} className="ns-perf group mt-10 inline-flex flex-col gap-3 text-lg text-ink">
      <span>{children}</span>
      <span className="ns-perf-track relative block h-3 w-56" aria-hidden="true">
        <span className="ns-perf-holes absolute inset-0" />
        <svg className="ns-perf-arrow absolute top-1/2 h-3 w-4 -translate-y-1/2" viewBox="0 0 16 12">
          <path d="M0 6h14M9 1l5 5-5 5" fill="none" stroke="currentColor" strokeWidth="2" />
        </svg>
      </span>
    </a>
  );
}
