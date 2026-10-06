import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkRehype from "remark-rehype";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypeHighlight from "rehype-highlight";
import rehypeStringify from "rehype-stringify";
import GithubSlugger from "github-slugger";
import { visit } from "unist-util-visit";
import type { Heading } from "./types";

const processor = unified()
  .use(remarkParse)
  .use(remarkGfm)
  .use(remarkRehype)
  .use(rehypeSlug)
  .use(rehypeAutolinkHeadings, { behavior: "wrap" })
  .use(rehypeHighlight, { detect: false, ignoreMissing: true })
  .use(rehypeStringify);

/** Markdown -> HTML（GFM 表格/任务列表、代码高亮、标题锚点） */
export function renderMarkdown(md: string): string {
  return String(processor.processSync(md));
}

/** 提取 h2/h3 生成目录，slug 算法与 rehype-slug 一致 */
export function extractHeadings(md: string): Heading[] {
  const tree = unified().use(remarkParse).use(remarkGfm).parse(md);
  const slugger = new GithubSlugger();
  const out: Heading[] = [];
  visit(tree, "heading", (node) => {
    const level = node.depth;
    if (level !== 2 && level !== 3) return;
    let text = "";
    visit(node, (child) => {
      const c = child as { type: string; value?: string };
      if (c.type === "text" || c.type === "inlineCode") text += c.value ?? "";
    });
    text = text.trim();
    if (!text) return;
    out.push({ id: slugger.slug(text), text, level });
  });
  return out;
}
