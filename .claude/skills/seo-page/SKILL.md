---
name: seo-page
description: Panmoa で新しいページ／route を追加、または metadata・OG・canonical・JSON-LD・noindex を扱うときに読む。運営に直結する SEO 規約。「新しいページ」「metadata」「generateMetadata」「canonical」「OGP」「JSON-LD」「noindex」を扱うとき。
---

# ページ SEO（Panmoa 規約 — 運営に直結）

新規 route（`src/app/**/page.tsx`）を作る／メタデータを直すときの規約。TTFB・CWV が順位に響くので重い処理を増やさない。UI 文字列は**日本語**。

## metadata の付け方
- 静的なら `export const metadata: Metadata`、動的（slug など）なら `export async function generateMetadata(...)`。
- title / description / canonical / OG / Twitter を揃える。参照実装：`src/app/(main)/boards/[slug]/page.tsx`。
- **本文由来の description は `createDescription(value)`（`@/lib/seo`）**で生成（プレーン化 + 160字省略、`…` 付与）。手動 truncate しない。
- URL は `@/lib/seo` のヘルパを使う：`getSiteUrl()` / `absoluteUrl(path)`。本番オリジンは `NEXT_PUBLIC_SITE_URL=https://panmoa.com`。
- canonical は相対パス（例 `/boards/${slug}`）。ページネーションは `page > 1` のとき `?page=N` を付ける。
- OG は `locale: "ja_JP"`, `siteName: "Panmoa"`, `images: ["/og_image_v2.png"]` を踏襲。

## noindex を維持する対象
検索・認証・プロフィール・管理・作成/編集フォームは `robots: { index: false, follow: false }`（または `{ index: false }`）を維持する。
既存例：`search`, `profile`, `boards`（一覧）, `boards/[slug]/write`・`.../edit`, `tesla-data/new`, `admin/*`, `(auth)/layout`。
一般公開の閲覧ページ（掲示板詳細・投稿詳細・ツール等）は index 可。

## JSON-LD
構造化データは `JsonLd`（`@/components/seo/json-ld`）を使う（`<` エスケープ・`dangerouslySetInnerHTML` 済み）。生の `<script type="application/ld+json">` を手書きしない。参照：`layout.tsx`, `boards/[slug]/[postId]/page.tsx`, `tools/charging-cost/page.tsx`。

## 仕上げ
`robots.ts` / `sitemap.ts` に新 route の掲載要否を確認し、変更後は `/verify` を通す。
