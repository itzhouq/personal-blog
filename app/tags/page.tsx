import type { Metadata } from "next";
import { getAllTags } from "@/lib/posts";
import TagBadge from "@/components/TagBadge";

export const metadata: Metadata = {
  title: "标签",
  description: "按标签浏览文章",
};

export default function TagsIndex() {
  const tags = getAllTags();
  return (
    <div className="py-12">
      <h1 className="text-3xl font-bold">标签</h1>
      <p className="mt-2 text-sm text-[var(--muted)]">共 {tags.length} 个标签</p>
      <div className="mt-8 flex flex-wrap gap-3">
        {tags.map(({ tag, count }) => (
          <span key={tag} className="text-base">
            <TagBadge tag={tag} count={count} />
          </span>
        ))}
      </div>
    </div>
  );
}
