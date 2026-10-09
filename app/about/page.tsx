import fs from "node:fs";
import path from "node:path";
import type { Metadata } from "next";
import { renderMarkdown } from "@/lib/markdown";

export const metadata: Metadata = {
  title: "关于",
  description: "关于我",
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  const md = fs.readFileSync(
    path.join(process.cwd(), "content", "about.md"),
    "utf8",
  );
  const html = renderMarkdown(md);

  return (
    <div className="py-12">
      <div className="flex items-center gap-5">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/avatar-192.png"
          alt="搞副业的老周itzhouq"
          width={80}
          height={80}
          className="h-20 w-20 rounded-2xl"
        />
        <h1 className="text-3xl font-bold">关于我</h1>
      </div>
      <div
        className="prose prose-stone dark:prose-invert mt-8 max-w-none"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  );
}
