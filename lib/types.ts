export type Heading = {
  id: string;
  text: string;
  level: 2 | 3;
};

export type PostMeta = {
  slug: string;
  title: string;
  date: string;
  tags: string[];
  summary: string;
  draft: boolean;
  readingTime: string;
};

export type Post = PostMeta & {
  content: string;
  html: string;
  headings: Heading[];
};

export type TagCount = {
  tag: string;
  count: number;
};
