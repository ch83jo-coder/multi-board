---
name: supabase-access
description: Panmoa で Supabase クライアントを選ぶ・server-only 境界や env ラッパーを扱うときに読む。anon/client/server/admin の使い分け、SUPABASE_SERVICE_ROLE_KEY の保護、環境変数ラッパー経由アクセスの規約。「Supabaseクライアント」「service role」「server-only」「環境変数」「DBアクセス」を扱うとき。
---

# Supabase アクセス & server/client 境界（Panmoa 規約）

## クライアント4種の使い分け（`src/lib/supabase/`）
- **`client.ts`** — ブラウザ用 anon。Client Component から。
- **`server.ts`** — SSR 用 anon + cookie セッション。`createClient()`（**async**、`await` する）。Server Component / Server Action の通常の読み書きはこれ。
- **`admin.ts`** — service role。`createAdminClient()`。**サーバー専用**、RLS を貫通するので管理操作・システム処理のみ。ユーザー入力の権限判定を飛ばさない。
- **`anon.ts`** — anon キーの下位ユーティリティ。基本は `client.ts` / `server.ts` を使う。

判断基準：ブラウザ→`client`／SSR の通常操作→`server`／権限昇格が要る管理操作のみ→`admin`。

## ハード規則（違反禁止）
- **サーバー専用ファイルは先頭に `import "server-only";`**（例：`env.server.ts`, `supabase/admin.ts`, `image-upload.server.ts`）。新しいサーバー専用ロジックも同様に。
- **`SUPABASE_SERVICE_ROLE_KEY` を `NEXT_PUBLIC_` やクライアントへ出さない。** 取得は `getServiceRoleKey()`（`@/lib/env.server`）経由のみ。
- **環境変数は必ずラッパー経由**で読む。feature コードで raw `process.env` を触らない。
  - public（URL / anon key など）→ `@/lib/env`（`hasSupabaseEnv()`, `getPublicEnv()`）。
  - secret（service role, OpenAI key など）→ `@/lib/env.server`（`getServiceRoleKey()`, `getOpenAiKey()`）。

## デモデータ・フォールバック
- 環境変数が無い場合を `hasSupabaseEnv()` でガードする。
  - **読み取り**：デモデータ（`@/lib/demo-data`）を返して主要画面を動かす。
  - **変更（mutation）**：`demoMutationError` パターンで親切なエラーを返す。

## 認証セッション
- Next.js 16 ではセッション更新を `middleware.ts` ではなく **`src/proxy.ts`** で行う。
