import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI Chat 游乐场",
  description: "带上你自己的 API Key，在线体验任意 OpenAI 兼容大模型",
  alternates: { canonical: "/tools/chat" },
};

export default function ChatLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
