---
name: server-action
description: Panmoa の Server Action を追加・修正するときに読む。ActionState / getActor / demoMutationError / ゲスト認証 / RLS 再確認など、この repo 固有のフォームアクション規約を守るためのガイド。「サーバーアクション」「Server Action」「フォーム送信処理」「投稿・コメント・投票の保存」を扱うとき。
---

# Server Action（Panmoa 規約）

`src/app/actions/*.ts` に新しいフォーム処理を書く／既存を直すときの手順。多層防御（proxy + Server Action + RLS）の一層を担うので、アクション内で必ず権限を再確認する。

## 前提（ハード規則）
- ファイル**先頭は `"use server";`**。1ファイル1ドメイン（`posts.ts` / `boards.ts` / `profile.ts` …）。
- 環境変数の直読み禁止。public は `@/lib/env`、secret は `@/lib/env.server`（`import "server-only"` 済み）経由。
- `SUPABASE_SERVICE_ROLE_KEY` はクライアントに出さない。管理系のみ `createAdminClient()`（`@/lib/supabase/admin`）。
- 通常の読み書きは SSR anon + cookie セッションの `createClient()`（`@/lib/supabase/server`, async）。

## 型と戻り値
- 戻り値は `ActionState`（`@/lib/types` = `{ error?: string; success?: string }`）。追加情報が要るなら `ActionState & { vote?: ... }` のように交差型で拡張。
- `useActionState` 用シグネチャは `(_: ActionState, formData: FormData): Promise<ActionState>`。

## 既存パターンをコピーする（`src/app/actions/posts.ts` が参照実装）
1. **入力検証を最初に**（Supabase 接続前）。長さ・必須をチェックし、失敗は**日本語**の `{ error }` で返す。
   - 入力は truncate しない。長すぎる制約はユーザー向けメッセージで伝える。
2. **デモ環境フォールバック**：`if (!hasSupabaseEnv()) return demoMutationError;`
   - `demoMutationError = { error: "Supabaseの接続設定後に…利用できます。" }` を再利用。
3. **権限の再確認**：ログイン必須の操作は `const actor = await getActor();`（`auth.getUser()` → `profiles.role`）。`actor` が無ければ `{ error }`。管理操作は `actor.role` を検査。
4. **ゲスト参加**：`guestMode === "true"` のとき `getGuestCredentials(formData)`（`guestName` / `guestPassword`）で検証。長さ規約は既存関数に従う。
5. 成功後は `revalidatePath(...)` / `updateTag(...)` でキャッシュ更新、必要なら `redirect(...)`。成功メッセージは日本語の `{ success }`。

## やらないこと
- try/catch でエラーを握りつぶさない。ユーザーには親切な日本語、開発者用ログは別。
- 新しい戻り値パターン／独自の状態型を勝手に導入しない。既存の `ActionState` に合わせる。
- RLS があるからと権限チェックを省かない（多層防御）。

## 仕上げ
変更後は `/verify`（lint → typecheck → build）を通す。
