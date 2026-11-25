// Site-wide settings. SITE_URL is set at build time (VITE_SITE_URL), and is
// used for absolute links in social cards and the sitemap.
export const SITE = {
  name: "Negative Space",
  description: "글이 현상되는 곳. 글쓰기와 코드, 디자인과 사진에 대한 느린 블로그.",
  url: (import.meta.env.VITE_SITE_URL as string | undefined)?.replace(/\/$/, "") ?? "",
  ogImage: "/og.png",
  locale: "ko_KR",
};

export function absoluteUrl(path: string): string {
  return SITE.url ? `${SITE.url}${path}` : path;
}
