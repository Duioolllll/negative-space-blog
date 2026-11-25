import { TOPICS, countByTopic, topicPreview } from "../../lib/blog/posts";

export function Topics() {
  return (
    <section id="topics" className="ns-topics px-5 py-24 md:px-10 md:py-36" aria-labelledby="topics-title">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-12">
        <h2 id="topics-title" className="text-4xl leading-none tracking-tight md:col-span-5 md:text-6xl">주제별로 보기</h2>
        <p className="max-w-[28rem] text-base leading-relaxed text-mid md:col-span-4 md:col-start-9 md:pt-3">
          여섯 개의 서랍에 나눠 담았습니다. 서랍마다 다른 속도로 채워지고 있어요.
        </p>
      </div>
      <ul className="mt-14 border-t border-ink" role="list">
        {TOPICS.map((t) => (
          <li key={t.id} className="border-b border-hairline">
            <a href={`/posts?topic=${t.id}`} className="ns-row group relative grid grid-cols-[2.5rem_1fr_auto] items-center gap-4 overflow-hidden py-5 md:grid-cols-[4rem_1fr_12rem_6rem] md:gap-8 md:py-7">
              <img src={t.icon} alt="" className="ns-row-icon h-9 w-9 md:h-12 md:w-12" />
              <span className="ns-row-name text-3xl leading-none tracking-tight md:text-5xl">{t.name}</span>
              <span className="ns-mono hidden text-xs text-mid md:block">{t.latin}</span>
              <span className="ns-mono text-sm text-mid md:text-right">{String(countByTopic(t.id)).padStart(2, "0")}</span>
              <span className="ns-row-preview pointer-events-none absolute right-24 top-1/2 hidden h-28 w-40 -translate-y-1/2 overflow-hidden md:block" aria-hidden="true">
                <img src={topicPreview(t.id)} alt="" className="h-full w-full object-cover" loading="lazy" />
              </span>
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
