# Panmoa Multi Board

Panmoa Multi Boardは、Next.js App RouterとSupabaseで構築したコミュニティ掲示板です。Supabaseの環境変数を設定していない場合でも、内蔵のデモデータを使ってホーム、掲示板、投稿詳細画面を確認できます。

## 主な機能

- 複数掲示板の閲覧、投稿、編集、削除
- コメント、返信、投票、閲覧数
- 投稿検索とページネーション
- メールアドレスによる会員登録とログイン
- プロフィールと通知
- 管理者による掲示板、固定投稿、お知らせ投稿の管理
- PCとモバイルに対応したレスポンシブUI

## セットアップ

依存パッケージをインストールし、環境変数ファイルを作成します。

```bash
yarn install
cp .env.example .env.local
```

`.env.local`に次の値を設定すると、Supabase認証とデータベースを利用したCRUDが有効になります。

```text
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
```

`SUPABASE_SERVICE_ROLE_KEY`は管理機能を実行するサーバー専用の秘密鍵です。ブラウザへ公開したり、`NEXT_PUBLIC_`を付けたりしないでください。

開発サーバーを起動します。

```bash
yarn dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開いてください。

## Supabaseの準備

Supabase CLIでプロジェクトをリンクした後、`supabase/migrations`にあるマイグレーションを番号順に適用します。

```bash
supabase link --project-ref <PROJECT_REF>
supabase db push
```

現在のマイグレーションには、初期スキーマ、日本語データ、通知、閲覧数と返信通知が含まれています。

## OpenAIによる初期データ投入

`.env.local`に`OPENAI_API_KEY`を設定すると、有効な各掲示板へ日本語の投稿、コメント、投票、閲覧数を手動で投入できます。

```bash
yarn seed
```

既存投稿がある掲示板は既定でスキップされます。必要な環境変数、強制追加、再実行時の動作については[初期データ投入ツール](tools/init_data/README.md)を参照してください。

## 管理者アカウントの作成

1. アプリの新規登録画面から通常のアカウントを作成します。
2. Supabase Dashboardの「Authentication > Users」で対象ユーザーのUUIDを確認します。
3. SQL Editorで次のSQLを実行します。

```sql
begin;

alter table public.profiles
  disable trigger protect_profile_role_before_update;

update public.profiles
set role = 'admin'
where id = '<USER_UUID>';

alter table public.profiles
  enable trigger protect_profile_role_before_update;

commit;
```

`<USER_UUID>`は実際のユーザーUUIDに置き換えてください。役割保護トリガーが有効なままSQL Editorから直接`role`を変更すると、`Only administrators can change roles`エラーになります。

## 主なURL

- `/` — ホームフィード
- `/boards` — 掲示板一覧、投稿先の選択
- `/boards/[slug]` — 掲示板の投稿一覧
- `/boards/[slug]/[postId]` — 投稿詳細とコメント
- `/boards/[slug]/write` — 新規投稿
- `/search` — 投稿検索
- `/login`、`/signup` — ログインと新規登録
- `/profile` — プロフィールと自分の投稿
- `/admin/boards` — 管理者専用の掲示板管理

## 検証

```bash
yarn lint
yarn typecheck
yarn build
```

Next.js 16では、セッション更新用ファイルとして`middleware.ts`ではなく`src/proxy.ts`を使用しています。認証と権限はProxyだけに依存せず、Server ActionとSupabase Row Level Securityでも再確認します。
