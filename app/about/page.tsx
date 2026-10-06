import fs from "node:fs";
import path from "node:path";
import type { Metadata } from "next";
import { renderMarkdown } from "@/lib/markdown";

export const metadata: Metadata = {
  title: "关于",
  description: "关于我",
};

export default function AboutPage() {
  const md = fs.readFileSync(
    path.join(process.cwd(), "content", "about.md"),
    "utf8",
  );
  const html = renderMarkdown(md);

  return (
    <div className="py-12">
      <h1 className="text-3xl font-bold">关于我</h1>
      <div
        className="prose prose-stone dark:prose-invert mt-8 max-w-none"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  );
}
