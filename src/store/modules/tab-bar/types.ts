export interface TagProps {
  title: string;
  name: string;
  fullPath: string;
  query?: any;
  params?: any;
  ignoreCache?: boolean;
  appendix?: string;
  category?: string;
}

export interface TabBarState {
  tagList: TagProps[];
  cacheTabList: Set<string>;
}
