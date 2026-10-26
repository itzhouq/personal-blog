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
  /** 所属栏目 key（见 site.columns），未设置则只出现在「文章」总列表 */
  column?: string;
  /** 所属连载系列 key（见 site.series） */
  series?: string;
  /** 系列内序号（1 起），系列页按此排序 */
  seriesOrder?: number;
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
