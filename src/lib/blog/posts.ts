// Post metadata comes from content/posts/*.md (and Notion, via
// scripts/sync-notion.mjs), compiled by scripts/build-content.mjs.
// Bodies are kept out of the browser bundle; see post-body.functions.ts.
import postsJson from "../../generated/posts.json";

export type TopicId = "writing" | "code" | "design" | "photo" | "reading" | "notes";

export type Topic = {
  id: TopicId;
  name: string;
  latin: string;
  icon: string;
  fallback: string;
};

export type Post = {
  slug: string;
  frame: string;
  title: string;
  dek: string;
  date: string;
  minutes: number;
  topic: TopicId;
  image: string;
  featured: boolean;
  source: "markdown" | "notion";
};

export const TOPICS: Topic[] = [
  { id: "writing", name: "글쓰기", latin: "Writing", icon: "/assets/icons/writing.png", fallback: "/assets/frames/frame-01.jpg" },
  { id: "code", name: "코드", latin: "Code", icon: "/assets/icons/code.png", fallback: "/assets/frames/frame-06.jpg" },
  { id: "design", name: "디자인", latin: "Design", icon: "/assets/icons/design.png", fallback: "/assets/frames/frame-03.jpg" },
  { id: "photo", name: "사진", latin: "Photo", icon: "/assets/icons/photo.png", fallback: "/assets/frames/frame-02.jpg" },
  { id: "reading", name: "읽기", latin: "Reading", icon: "/assets/icons/reading.png", fallback: "/assets/frames/frame-05.jpg" },
  { id: "notes", name: "메모", latin: "Notes", icon: "/assets/icons/notes.png", fallback: "/assets/frames/frame-04.jpg" },
];

/** All published posts, newest first. */
export const POSTS = postsJson as Post[];

/** The pinned post (frontmatter `featured: true`), or the newest one. */
export const FEATURED: Post | undefined = POSTS.find((p) => p.featured) ?? POSTS[0];

/** Up to six recent posts for the contact-sheet rail, excluding the featured one. */
export const RAIL_POSTS = POSTS.filter((p) => p !== FEATURED).slice(0, 6);

export function topicById(id: TopicId): Topic {
  return TOPICS.find((t) => t.id === id) ?? TOPICS[0];
}

export function countByTopic(id: TopicId): number {
  return POSTS.filter((p) => p.topic === id).length;
}

export function topicPreview(id: TopicId): string {
  return POSTS.find((p) => p.topic === id)?.image ?? topicById(id).fallback;
}

/** 2026-11-21 -> 2026.11.21 */
export function formatDate(iso: string): string {
  return iso.replaceAll("-", ".");
}
