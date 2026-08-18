export type DoujinPost = {
  id: string;
  title: string;
  japaneseTitle: string;
  excerpt: string;
  tags: string[];
  cover: string;
  images?: string[];
  sourceUrl: string;
  createdAt: string;
};

export function isRemoteDoujinImage(source: string) {
  return /^https:\/\//i.test(source);
}

export function doujinImageSource(basePath: string, source: string) {
  return isRemoteDoujinImage(source) ? source : `${basePath}/${source.replace(/^\/+/, "")}`;
}
