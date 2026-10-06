import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { renderMarkdown, extractHeadings } from "./markdown";
import { readingTime } from "./format";
import type { Post, PostMeta, TagCount } from "./types";

const postsDir = path.join(process.cwd(), "content", "posts");

type Frontmatter = {
  title?: unknown;
  date?: unknown;
  tags?: unknown;
  summary?: unknown;
  draft?: unknown;
};

function readPost(slug: string): Post | null {
  const file = path.join(postsDir, `${slug}.md`);
  if (!fs.existsSync(file)) return null;
  const raw = fs.readFileSync(file, "utf8");
  const { data, content } = matter(raw);
  const m = data as Frontmatter;
  // YAML 会把 date: 2026-10-06 解析成 Date 对象，需统一转回 ISO 字符串
  const date =
    m.date instanceof Date
      ? m.date.toISOString().slice(0, 10)
      : typeof m.date === "string"
        ? m.date
        : "1970-01-01";
  return {
    slug,
    title: typeof m.title === "string" && m.title ? m.title : slug,
    date,
    tags: Array.isArray(m.tags) ? m.tags.filter((t): t is string => typeof t === "string") : [],
    summary: typeof m.summary === "string" ? m.summary : "",
    draft: m.draft === true,
    readingTime: readingTime(content),
    content,
    html: renderMarkdown(content),
    headings: extractHeadings(content),
  };
}

/** 全部文章，按日期倒序；生产构建自动剔除 draft:true */
export function getAllPosts(): Post[] {
  if (!fs.existsSync(postsDir)) return [];
  const slugs = fs
    .readdirSync(postsDir)
    .filter((f) => f.endsWith(".md"))
    .map((f) => f.slice(0, -3));
  const posts = slugs
    .map((s) => readPost(s))
    .filter((p): p is Post => !!p && (process.env.NODE_ENV !== "production" || !p.draft));
  posts.sort((a, b) => (a.date < b.date ? 1 : -1));
  return posts;
}

export function toMeta(p: Post): PostMeta {
  const { slug, title, date, tags, summary, draft, readingTime } = p;
  return { slug, title, date, tags, summary, draft, readingTime };
}

export function getPostBySlug(slug: string): Post | null {
  const post = readPost(slug);
  if (!post) return null;
  if (post.draft && process.env.NODE_ENV === "production") return null;
  return post;
}

/** 相邻文章：prev 更新一篇，next 更旧一篇 */
export function getAdjacent(slug: string): { prev: PostMeta | null; next: PostMeta | null } {
  const posts = getAllPosts();
  const i = posts.findIndex((p) => p.slug === slug);
  if (i === -1) return { prev: null, next: null };
  return {
    prev: i > 0 ? toMeta(posts[i - 1]) : null,
    next: i < posts.length - 1 ? toMeta(posts[i + 1]) : null,
  };
}

export function getAllTags(): TagCount[] {
  const map = new Map<string, number>();
  for (const p of getAllPosts()) {
    for (const t of p.tags) map.set(t, (map.get(t) ?? 0) + 1);
  }
  return [...map.entries()]
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag));
}

export function getPostsByTag(tag: string): Post[] {
  return getAllPosts().filter((p) => p.tags.includes(tag));
}
