# Negative Space

글쓰기, 코드, 디자인, 사진에 대한 느린 블로그. 암실을 모티프로 한 흑백 디자인과, 스크롤하면 네거티브에서 포지티브로 "현상"되는 히어로가 특징입니다.

- **스택:** React 19 + TanStack Start (SSR) + Tailwind v4, Cloudflare Workers 한 개로 배포
- **글:** `content/posts/*.md` 마크다운 파일 + 노션 데이터베이스 (매시간 자동 동기화)
- **구독:** Cloudflare D1에 이메일 저장

## 로컬 실행

```bash
bun install
bun run db:migrate:local   # 로컬 D1에 구독 테이블 생성 (최초 1회)
bun run preview            # 빌드 후 wrangler dev 로 실행: http://localhost:8787
```

`bun run dev`(Vite 개발 서버)도 쓸 수 있지만, 구독 폼처럼 Cloudflare 바인딩이 필요한 기능은 `bun run preview`에서 확인하세요.

## 글 쓰기

### 1. 마크다운으로 쓰기

`content/posts/YYYY-MM-DD-slug.md` 파일을 만들고 main에 푸시하면 자동 배포됩니다.

```markdown
---
title: "글 제목"
slug: my-post            # URL: /posts/my-post (영문 소문자, 숫자, 하이픈)
date: 2026-12-01
topic: writing           # writing | code | design | photo | reading | notes
dek: "목록과 공유 카드에 보이는 한두 문장"
image: /content/my-post/cover.jpg   # 선택. public/ 아래 경로. 비우면 기본 이미지
minutes: 5               # 선택. 비우면 자동 계산
featured: true           # 선택. 메인 "이번 주의 글"에 고정
draft: true              # 선택. true면 사이트에 안 나옴
---

본문은 일반 마크다운으로 씁니다.
```

이미지는 `public/content/<slug>/` 에 넣고 `/content/<slug>/파일명` 으로 참조하세요.

### 2. 노션에서 쓰기

노션의 **"Negative Space 블로그 글"** 데이터베이스에 글을 쓰고 **공개**에 체크하면, 매시간 GitHub Actions가 마크다운으로 변환해 저장소에 커밋하고 다시 배포합니다. 바로 반영하려면 Actions 탭에서 **Sync from Notion → Run workflow**를 누르세요.

| 노션 속성 | 용도 |
| --- | --- |
| 제목 | 글 제목 |
| 슬러그 | URL (비우면 페이지 ID 사용) |
| 날짜 | 발행일 (비우면 생성일) |
| 주제 | writing / code / design / photo / reading / notes |
| 요약 | 목록과 공유 카드 문구 |
| 읽는 시간 | 분. 비우면 자동 |
| 커버 | 대표 이미지 1장 |
| 공개 | 체크한 글만 동기화. 체크를 풀면 사이트에서도 삭제 |

지원하는 블록: 문단, 제목, 글머리/번호/체크 목록, 인용, 콜아웃, 코드, 구분선, 이미지, 북마크. 이미지는 저장소로 내려받아 저장합니다(노션 이미지 링크는 1시간 뒤 만료되기 때문).

## 처음 배포하기 (Cloudflare)

1. **D1 데이터베이스 만들기**
   ```bash
   bunx wrangler login
   bunx wrangler d1 create negative-space-blog
   ```
   출력된 `database_id`를 `wrangler.jsonc`의 `REPLACE_WITH_YOUR_D1_DATABASE_ID` 자리에 붙여 넣고 커밋합니다.

2. **Cloudflare API 토큰 만들기**
   Cloudflare 대시보드 → My Profile → API Tokens → *Edit Cloudflare Workers* 템플릿으로 만들고, 권한에 **Account / D1 / Edit**를 추가합니다.

3. **GitHub 저장소 설정** (Settings → Secrets and variables → Actions)

   | 종류 | 이름 | 값 |
   | --- | --- | --- |
   | Secret | `CLOUDFLARE_API_TOKEN` | 2번에서 만든 토큰 |
   | Secret | `CLOUDFLARE_ACCOUNT_ID` | 대시보드 오른쪽의 Account ID |
   | Secret | `NOTION_TOKEN` | 노션 통합 토큰 (아래 참고) |
   | Variable | `NOTION_DATABASE_ID` | `4237f3b0f041817495f5dc31b466ea17` |
   | Variable | `SITE_URL` | 최종 주소, 예: `https://negative-space-blog.<계정>.workers.dev` |

4. **노션 통합 연결**
   https://www.notion.so/profile/integrations 에서 *Internal* 통합을 만들고 토큰을 `NOTION_TOKEN`에 넣습니다. 그다음 노션의 블로그 글 데이터베이스 → 오른쪽 위 `···` → **연결(Connections)** 에서 그 통합을 추가하세요. 이걸 빼먹으면 동기화가 404/401로 실패합니다.

5. main에 푸시하거나 Actions 탭에서 **Deploy → Run workflow**. 배포가 끝나면 `https://negative-space-blog.<계정>.workers.dev` 에서 열립니다.

6. (선택) **내 도메인**: 도메인을 Cloudflare에 연결한 뒤 `wrangler.jsonc`의 `routes` 주석을 풀고 도메인을 적으세요. `SITE_URL`도 그 주소로 바꿉니다.

## 구조

```
content/posts/          글 (마크다운). 노션 글은 source: notion 으로 표시됨
public/                 이미지, 파비콘, og.png
scripts/
  build-content.mjs     md → src/generated/posts.json(메타) + bodies.json(본문 HTML)
  sync-notion.mjs       노션 → content/posts
src/
  components/ns/        페이지 섹션 (hero, featured, contact-sheet, topics, about, letters ...)
  routes/               /, /posts, /posts/$slug, sitemap.xml, robots.txt
  lib/blog/             글 메타데이터, 본문 서버 함수
  lib/api/              구독 서버 함수 (D1)
  styles.css            디자인 토큰과 모든 스타일
migrations/             D1 스키마 (추가만, 수정·삭제 금지)
.github/workflows/      ci, deploy, notion-sync
docs/design-brief.md    디자인 원칙
```

## 구독자 확인

```bash
bunx wrangler d1 execute negative-space-blog --remote --command "SELECT email, created_at FROM subscribers ORDER BY id DESC"
```
