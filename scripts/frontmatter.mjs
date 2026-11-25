// Minimal frontmatter reader/writer for the post files in content/posts.
// Supports flat `key: value` pairs (strings, numbers, booleans).

export function parseFrontmatter(raw) {
  const text = raw.replace(/^﻿/, "");
  const m = text.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!m) return { data: {}, body: text };
  const data = {};
  for (const line of m[1].split(/\r?\n/)) {
    const kv = line.match(/^([A-Za-z_][\w-]*):\s*(.*)$/);
    if (!kv) continue;
    let value = kv[2].trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1).replace(/\\"/g, '"');
    } else if (value === "true" || value === "false") {
      value = value === "true";
    } else if (value !== "" && !Number.isNaN(Number(value)) && !/^\d{4}-\d{2}-\d{2}/.test(value)) {
      value = Number(value);
    }
    data[kv[1]] = value;
  }
  return { data, body: m[2] };
}

export function stringifyFrontmatter(data, body) {
  const lines = Object.entries(data)
    .filter(([, v]) => v !== undefined && v !== null && v !== "")
    .map(([k, v]) => {
      if (typeof v === "string") return `${k}: "${v.replace(/"/g, '\\"').replace(/\r?\n/g, " ")}"`;
      return `${k}: ${v}`;
    });
  return `---\n${lines.join("\n")}\n---\n\n${body.trim()}\n`;
}
