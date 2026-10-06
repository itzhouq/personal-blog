import type { Heading } from "@/lib/types";

export default function Toc({ items }: { items: Heading[] }) {
  if (items.length === 0) return null;
  return (
    <nav aria-label="文章目录" className="hidden w-56 shrink-0 lg:block">
      <div className="sticky top-24 max-h-[70vh] overflow-auto border-l border-[var(--border)] pl-4 text-sm">
        <p className="mb-2 font-medium">本页目录</p>
        <ul className="space-y-1.5">
          {items.map((h) => (
            <li key={h.id} className={h.level === 3 ? "pl-3" : ""}>
              <a
                href={`#${h.id}`}
                className="leading-snug text-[var(--muted)] transition-colors hover:text-[var(--accent)]"
              >
                {h.text}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
