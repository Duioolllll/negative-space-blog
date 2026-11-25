// Pulls published posts from a Notion database into content/posts/*.md.
//
//   NOTION_TOKEN=secret_xxx NOTION_DATABASE_ID=xxxx node scripts/sync-notion.mjs
//
// Only pages with the "공개" checkbox ticked are written. Files previously
// synced from Notion (source: notion) whose page is no longer published are
// removed. Images are downloaded into public/content/<slug>/ because Notion's
// file URLs expire after an hour.
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { parseFrontmatter, stringifyFrontmatter } from "./frontmatter.mjs";

const TOKEN = process.env.NOTION_TOKEN;
const DATABASE_ID = (process.env.NOTION_DATABASE_ID || "").replace(/-/g, "");
if (!TOKEN || !DATABASE_ID) {
  console.error("Set NOTION_TOKEN and NOTION_DATABASE_ID.");
  process.exit(1);
}

const ROOT = new URL("..", import.meta.url).pathname;
const POSTS_DIR = join(ROOT, "content/posts");
const MEDIA_DIR = join(ROOT, "public/content");
const API = "https://api.notion.com/v1";

// Property names in the Notion database. Change these if you rename columns.
const P = {
  title: "제목",
  slug: "슬러그",
  date: "날짜",
  topic: "주제",
  dek: "요약",
  minutes: "읽는 시간",
  cover: "커버",
  published: "공개",
};

async function notion(path, { method = "GET", body, version = "2025-09-03" } = {}) {
  for (let attempt = 0; attempt < 4; attempt++) {
    const res = await fetch(API + path, {
      method,
      headers: {
        Authorization: `Bearer ${TOKEN}`,
        "Notion-Version": version,
        "Content-Type": "application/json",
      },
      body: body ? JSON.stringify(body) : undefined,
    });
    if (res.status === 429) {
      await new Promise((r) => setTimeout(r, Number(res.headers.get("retry-after") || 1) * 1000));
      continue;
    }
    if (!res.ok) throw new Error(`Notion ${method} ${path} -> ${res.status}: ${await res.text()}`);
    return res.json();
  }
  throw new Error(`Notion ${path}: rate limited`);
}

async function queryPublished() {
  const filter = { property: P.published, checkbox: { equals: true } };
  const results = [];
  let cursor;
  // Current API: databases contain data sources. Fall back to the legacy
  // database query for older integrations.
  let queryPath;
  let version = "2025-09-03";
  try {
    const db = await notion(`/databases/${DATABASE_ID}`);
    const ds = db.data_sources?.[0]?.id;
    queryPath = ds ? `/data_sources/${ds}/query` : `/databases/${DATABASE_ID}/query`;
    if (!ds) version = "2022-06-28";
  } catch (e) {
    queryPath = `/databases/${DATABASE_ID}/query`;
    version = "2022-06-28";
  }
  do {
    const page = await notion(queryPath, {
      method: "POST",
      version,
      body: { filter, page_size: 100, ...(cursor ? { start_cursor: cursor } : {}) },
    });
    results.push(...page.results);
    cursor = page.has_more ? page.next_cursor : undefined;
  } while (cursor);
  return results;
}

async function children(blockId) {
  const out = [];
  let cursor;
  do {
    const res = await notion(`/blocks/${blockId}/children?page_size=100${cursor ? `&start_cursor=${cursor}` : ""}`);
    out.push(...res.results);
    cursor = res.has_more ? res.next_cursor : undefined;
  } while (cursor);
  return out;
}

const plainText = (rich = []) => rich.map((t) => t.plain_text).join("");

function richToMd(rich = []) {
  return rich
    .map((t) => {
      let s = t.plain_text;
      if (!s) return "";
      if (t.type === "equation") return `$${s}$`;
      const a = t.annotations || {};
      if (a.code) s = "`" + s + "`";
      if (a.bold) s = `**${s}**`;
      if (a.italic) s = `*${s}*`;
      if (a.strikethrough) s = `~~${s}~~`;
      if (t.href) s = `[${s}](${t.href})`;
      return s;
    })
    .join("");
}

async function download(url, slug, name) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`image download failed (${res.status})`);
  const type = res.headers.get("content-type") || "";
  const ext = type.includes("png") ? "png" : type.includes("webp") ? "webp" : type.includes("gif") ? "gif" : "jpg";
  const dir = join(MEDIA_DIR, slug);
  mkdirSync(dir, { recursive: true });
  const file = `${name}.${ext}`;
  writeFileSync(join(dir, file), Buffer.from(await res.arrayBuffer()));
  return `/content/${slug}/${file}`;
}

const fileUrl = (f) => (f?.type === "external" ? f.external?.url : f?.file?.url);

async function blocksToMd(blocks, slug, ctx, depth = 0) {
  const out = [];
  const indent = "  ".repeat(depth);
  let n = 0;
  for (const b of blocks) {
    const v = b[b.type] || {};
    let line = "";
    switch (b.type) {
      case "paragraph":
        line = richToMd(v.rich_text);
        break;
      case "heading_1":
      case "heading_2":
        line = `## ${richToMd(v.rich_text)}`;
        break;
      case "heading_3":
        line = `### ${richToMd(v.rich_text)}`;
        break;
      case "bulleted_list_item":
        line = `${indent}- ${richToMd(v.rich_text)}`;
        break;
      case "numbered_list_item":
        n += 1;
        line = `${indent}${n}. ${richToMd(v.rich_text)}`;
        break;
      case "to_do":
        line = `${indent}- [${v.checked ? "x" : " "}] ${richToMd(v.rich_text)}`;
        break;
      case "quote":
      case "callout":
        line = richToMd(v.rich_text)
          .split("\n")
          .map((l) => `> ${l}`)
          .join("\n");
        break;
      case "code":
        line = "```" + (v.language && v.language !== "plain text" ? v.language : "") + "\n" + plainText(v.rich_text) + "\n```";
        break;
      case "divider":
        line = "---";
        break;
      case "image": {
        const url = fileUrl(v);
        if (url) {
          ctx.img += 1;
          const local = await download(url, slug, `image-${ctx.img}`);
          line = `![${plainText(v.caption)}](${local})`;
        }
        break;
      }
      case "bookmark":
      case "embed":
      case "video":
        if (v.url) line = `[${v.url}](${v.url})`;
        break;
      default:
        break;
    }
    if (b.type !== "numbered_list_item") n = 0;
    const isList = /list_item|to_do/.test(b.type);
    if (line) out.push({ line, isList });
    if (b.has_children && isList) {
      const nested = await blocksToMd(await children(b.id), slug, ctx, depth + 1);
      if (nested) out.push({ line: nested, isList: true });
    }
  }
  // Consecutive list items stay together; everything else is separated by a blank line.
  return out.reduce((acc, cur, i) => {
    if (i === 0) return cur.line;
    return acc + (cur.isList && out[i - 1].isList ? "\n" : "\n\n") + cur.line;
  }, "");
}

function prop(page, name) {
  return page.properties?.[name];
}

async function main() {
  mkdirSync(POSTS_DIR, { recursive: true });
  const pages = await queryPublished();
  const written = new Set();

  for (const page of pages) {
    const title = plainText(prop(page, P.title)?.title);
    const slug = (plainText(prop(page, P.slug)?.rich_text) || page.id.replace(/-/g, ""))
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9-]+/g, "-")
      .replace(/^-+|-+$/g, "");
    const date = prop(page, P.date)?.date?.start?.slice(0, 10) || page.created_time.slice(0, 10);
    const topic = prop(page, P.topic)?.select?.name || "notes";
    const dek = plainText(prop(page, P.dek)?.rich_text);
    const minutes = prop(page, P.minutes)?.number || undefined;

    rmSync(join(MEDIA_DIR, slug), { recursive: true, force: true });
    const ctx = { img: 0 };
    let image;
    const cover = prop(page, P.cover)?.files?.[0] || page.cover;
    const coverUrl = fileUrl(cover);
    if (coverUrl) image = await download(coverUrl, slug, "cover");

    const body = await blocksToMd(await children(page.id), slug, ctx);
    const file = `${date}-${slug}.md`;
    writeFileSync(
      join(POSTS_DIR, file),
      stringifyFrontmatter(
        { title, slug, date, topic, dek, image, minutes, source: "notion", notion_id: page.id },
        body || dek,
      ),
    );
    written.add(file);
    console.log(`synced ${file}`);
  }

  // Remove Notion posts that were unpublished or deleted.
  for (const file of readdirSync(POSTS_DIR).filter((f) => f.endsWith(".md"))) {
    const { data } = parseFrontmatter(readFileSync(join(POSTS_DIR, file), "utf8"));
    if (data.source === "notion" && !written.has(file)) {
      rmSync(join(POSTS_DIR, file));
      if (data.slug && existsSync(join(MEDIA_DIR, String(data.slug)))) {
        rmSync(join(MEDIA_DIR, String(data.slug)), { recursive: true, force: true });
      }
      console.log(`removed ${file}`);
    }
  }
  console.log(`notion: ${written.size} published posts`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
