import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { Nav } from "../../components/ns/nav";
import { Footer } from "../../components/ns/footer";
import { POSTS, TOPICS, formatDate, topicById, type TopicId } from "../../lib/blog/posts";

const TOPIC_IDS = TOPICS.map((t) => t.id) as [TopicId, ...TopicId[]];

export const Route = createFileRoute("/posts/")({
  validateSearch: z.object({ topic: z.enum(TOPIC_IDS).optional() }),
  head: () => ({ meta: [{ title: "전체 글 | Negative Space" }] }),
  component: PostsIndex,
});

function PostsIndex() {
  const { topic } = Route.useSearch();
  const list = topic ? POSTS.filter((p) => p.topic === topic) : POSTS;
  return (
    <div className="ns-root">
      <Nav />
      <main className="px-5 pt-32 pb-24 md:px-10 md:pt-40">
        <h1 className="text-4xl leading-none tracking-tight md:text-6xl">
          {topic ? topicById(topic).name : "전체 글"}
        </h1>
        <div className="ns-mono mt-8 flex flex-wrap gap-x-5 gap-y-2 text-xs">
          <a href="/posts" className={`ns-filter ${!topic ? "is-on" : ""}`} aria-current={!topic ? "page" : undefined}>ALL</a>
          {TOPICS.map((t) => (
            <a key={t.id} href={`/posts?topic=${t.id}`} className={`ns-filter ${topic === t.id ? "is-on" : ""}`} aria-current={topic === t.id ? "page" : undefined}>
              {t.latin.toUpperCase()}
            </a>
          ))}
        </div>
        <ol className="mt-12 grid grid-cols-1 gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3" role="list">
          {list.map((p) => (
            <li key={p.slug}>
              <a href={`/posts/${p.slug}`} className="ns-card group block">
                <div className="overflow-hidden bg-ink">
                  <img src={p.image} alt="" className="aspect-[4/3] w-full object-cover" loading="lazy" />
                </div>
                <p className="ns-mono mt-4 text-xs text-mid">{p.frame}A / {formatDate(p.date)} / {topicById(p.topic).name}</p>
                <h2 className="mt-2 text-2xl leading-snug tracking-tight">{p.title}</h2>
                <p className="mt-2 text-sm leading-relaxed text-mid">{p.dek}</p>
              </a>
            </li>
          ))}
        </ol>
        {list.length === 0 && <p className="mt-12 text-mid">아직 이 서랍은 비어 있어요.</p>}
      </main>
      <Footer />
    </div>
  );
}
