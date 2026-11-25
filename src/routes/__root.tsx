import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import type { ReactNode } from "react";

import appCss from "../styles.css?url";
import { SITE, absoluteUrl } from "../site";

function buildHead() {
  const ogImage = absoluteUrl(SITE.ogImage);
  return {
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: SITE.name },
      { name: "description", content: SITE.description },
      { name: "theme-color", content: "#EDEDEA" },
      { property: "og:site_name", content: SITE.name },
      { property: "og:locale", content: SITE.locale },
      { property: "og:type", content: "website" },
      { property: "og:title", content: SITE.name },
      { property: "og:description", content: SITE.description },
      ...(SITE.url ? [{ property: "og:url", content: SITE.url }] : []),
      { property: "og:image", content: ogImage },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:image", content: ogImage },
    ],
    links: [
      { rel: "preconnect", href: "https://cdn.jsdelivr.net", crossOrigin: "anonymous" as const },
      { rel: "preconnect", href: "https://api.fontshare.com", crossOrigin: "anonymous" as const },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" as const },
      {
        rel: "stylesheet",
        href: "https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css",
      },
      { rel: "stylesheet", href: "https://api.fontshare.com/v2/css?f[]=satoshi@500,700,900&display=swap" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500&display=swap" },
      { rel: "stylesheet", href: appCss },
      { rel: "icon", href: "/favicon.ico", sizes: "32x32" },
      { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
      { rel: "apple-touch-icon", href: "/apple-touch-icon.png" },
      { rel: "manifest", href: "/site.webmanifest" },
    ],
  };
}

function NotFoundComponent() {
  return (
    <div className="flex min-h-dvh flex-col justify-end bg-paper px-5 pb-12 text-ink md:px-10 md:pb-16">
      <p className="ns-mono text-xs text-safelight">FRAME MISSING</p>
      <h1 className="mt-4 text-5xl leading-none tracking-tight md:text-7xl">이 장면은 인화되지 않았어요</h1>
      <p className="mt-5 max-w-[32rem] text-base leading-relaxed text-mid">
        주소가 바뀌었거나 아직 쓰지 않은 글이에요.
      </p>
      <a href="/" className="ns-backlink mt-10 self-start border-b-2 border-ink pb-1 text-lg">처음으로</a>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  return (
    <div className="flex min-h-dvh flex-col justify-end bg-paper px-5 pb-12 text-ink md:px-10 md:pb-16">
      <p className="ns-mono text-xs text-safelight">LIGHT LEAK</p>
      <h1 className="mt-4 text-5xl leading-none tracking-tight md:text-7xl">페이지를 불러오지 못했어요</h1>
      <p className="mt-5 max-w-[32rem] text-base leading-relaxed text-mid">잠시 뒤에 다시 시도해 주세요.</p>
      <div className="mt-10 flex gap-8">
        <button
          type="button"
          onClick={() => {
            router.invalidate();
            reset();
          }}
          className="border-b-2 border-safelight pb-1 text-lg text-safelight"
        >
          다시 시도
        </button>
        <a href="/" className="ns-backlink border-b-2 border-ink pb-1 text-lg">처음으로</a>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => buildHead(),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="ko" style={{ colorScheme: "light" }}>
      <head>
        <HeadContent />
      </head>
      <body className="ns-body bg-paper text-ink">
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  return (
    <QueryClientProvider client={queryClient}>
      <Outlet />
    </QueryClientProvider>
  );
}
