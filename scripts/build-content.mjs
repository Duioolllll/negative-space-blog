// Reads content/posts/*.md and writes:
//   src/generated/posts.json  - metadata only (safe to ship to the browser)
//   src/generated/bodies.json - rendered HTML per slug (imported server-side only)
// Runs before dev, build and typecheck (see package.json).
import { mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { marked } from "marked";
import { parseFrontmatter } from "./frontmatter.mjs";

const ROOT = new URL("..", import.meta.url).pathname;
const POSTS_DIR = join(ROOT, "content/posts");
const OUT_DIR = join(ROOT, "src/generated");
const TOPICS = ["writing", "code", "design", "photo", "reading", "notes"];
const FALLBACK_IMAGES = [
  "/assets/frames/frame-01.jpg",
  "/assets/frames/frame-02.jpg",
  "/assets/frames/frame-03.jpg",
  "/assets/frames/frame-04.jpg",
  "/assets/frames/frame-05.jpg",
  "/assets/frames/frame-06.jpg",
];

marked.setOptions({ gfm: true, breaks: false });

const errors = [];
const posts = [];
const bodies = {};

for (const file of readdirSync(POSTS_DIR).filter((f) => f.endsWith(".md")).sort()) {
  const { data, body } = parseFrontmatter(readFileSync(join(POSTS_DIR, file), "utf8"));
  if (data.draft === true) continue;
  const slug = String(data.slug || file.replace(/^\d{4}-\d{2}-\d{2}-/, "").replace(/\.md$/, ""));
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) errors.push(`${file}: slug "${slug}" must be lowercase letters, digits and hyphens`);
  if (!data.title) errors.push(`${file}: missing title`);
  const date = String(data.date || "");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) errors.push(`${file}: date must be YYYY-MM-DD`);
  const topic = TOPICS.includes(data.topic) ? data.topic : "notes";
  const plain = body.replace(/```[\s\S]*?```/g, "").replace(/[#>*_`\[\]()!-]/g, "");
  const minutes = Number(data.minutes) > 0 ? Number(data.minutes) : Math.max(1, Math.round(plain.replace(/\s+/g, "").length / 500));
  if (bodies[slug]) errors.push(`${file}: duplicate slug "${slug}"`);
  bodies[slug] = marked.parse(body);
  posts.push({
    slug,
    title: String(data.title || slug),
    dek: String(data.dek || ""),
    date,
    topic,
    image: data.image ? String(data.image) : "",
    minutes,
    featured: data.featured === true,
    source: data.source === "notion" ? "notion" : "markdown",
  });
}

if (errors.length) {
  console.error("Content errors:\n- " + errors.join("\n- "));
  process.exit(1);
}

posts.sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : a.slug.localeCompare(b.slug)));
posts.forEach((p, i) => {
  p.frame = String(i).padStart(2, "0");
  if (!p.image) p.image = FALLBACK_IMAGES[i % FALLBACK_IMAGES.length];
});

mkdirSync(OUT_DIR, { recursive: true });
writeFileSync(join(OUT_DIR, "posts.json"), JSON.stringify(posts, null, 2) + "\n");
writeFileSync(join(OUT_DIR, "bodies.json"), JSON.stringify(bodies) + "\n");
console.log(`content: ${posts.length} posts`);
