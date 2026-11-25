import { createFileRoute, notFound } from "@tanstack/react-router";
import { Nav } from "../../components/ns/nav";
import { Footer } from "../../components/ns/footer";
import { POSTS, formatDate, topicById } from "../../lib/blog/posts";
import { getPostBody } from "../../lib/blog/post-body.functions";
import { SITE, absoluteUrl } from "../../site";

export const Route = createFileRoute("/posts/$slug")({
  loader: async ({ params }) => {
    const post = POSTS.find((p) => p.slug === params.slug);
    if (!post) throw notFound();
    const html = await getPostBody({ data: { slug: post.slug } });
    if (html == null) throw notFound();
    return { post, html };
  },
  head: ({ loaderData }) => {
    if (!loaderData) return {};
    const { post } = loaderData;
    const url = absoluteUrl(`/posts/${post.slug}`);
    const image = absoluteUrl(post.image);
    return {
      meta: [
        { title: `${post.title} | ${SITE.name}` },
        { name: "description", content: post.dek },
        { property: "og:type", content: "article" },
        { property: "og:title", content: post.title },
        { property: "og:description", content: post.dek },
        { property: "og:url", content: url },
        { property: "og:image", content: image },
        { name: "twitter:image", content: image },
        { property: "article:published_time", content: post.date },
      ],
      links: [{ rel: "canonical", href: url }],
    };
  },
  component: PostPage,
});

function PostPage() {
  const { post, html } = Route.useLoaderData();
  const idx = POSTS.findIndex((p) => p.slug === post.slug);
  const next = POSTS.length > 1 ? POSTS[(idx + 1) % POSTS.length] : undefined;
  return (
    <div className="ns-root">
      <Nav />
      <main className="pt-28 md:pt-36">
        <article className="px-5 md:px-10">
          <header className="grid grid-cols-1 md:grid-cols-12">
            <div className="md:col-span-8">
              <p className="ns-mono text-xs text-mid">
                {post.frame}A / {formatDate(post.date)} / {topicById(post.topic).name} / {post.minutes}분
              </p>
              <h1 className="mt-5 text-4xl leading-[1.1] tracking-tight md:text-6xl">{post.title}</h1>
              {post.dek && <p className="mt-6 max-w-[38rem] text-lg leading-relaxed text-graphite">{post.dek}</p>}
            </div>
          </header>
          <figure className="mt-12 md:mt-16">
            <img src={post.image} alt="" className="max-h-[78vh] w-full object-cover" />
          </figure>
          <div
            className="ns-prose mx-auto mt-14 max-w-[65ch] md:mt-20"
            // Post HTML is compiled at build time from the site owner's own
            // Markdown/Notion content.
            dangerouslySetInnerHTML={{ __html: html }}
          />
        </article>
        {next && (
          <nav className="mt-24 border-t border-ink px-5 py-10 md:px-10" aria-label="다음 글">
            <a href={`/posts/${next.slug}`} className="ns-next group flex flex-col gap-2 md:flex-row md:items-baseline md:justify-between">
              <span className="ns-mono text-xs text-mid">NEXT FRAME {next.frame}A</span>
              <span className="text-3xl leading-tight tracking-tight md:text-5xl">{next.title}</span>
            </a>
          </nav>
        )}
      </main>
      <Footer />
    </div>
  );
}
