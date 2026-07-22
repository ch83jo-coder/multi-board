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
NEXT_PUBLIC_SITE_URL=https://panmoa.com
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

現在のマイグレーションには、初期スキーマ、日本語データ、通知、閲覧数、返信通知、ゲスト投稿が含まれています。

## SEOの設定と運用

アプリは`robots.txt`、`sitemap.xml`、canonical URL、Open Graph/Twitterカード、`DiscussionForumPosting`と`WebSite`のJSON-LDを自動生成します。本番環境では`NEXT_PUBLIC_SITE_URL`に公開サイトのオリジンを設定してください。

```text
NEXT_PUBLIC_SITE_URL=https://panmoa.com
```

Vercelプロジェクトの「Settings > Domains」で`panmoa.com`を本番ドメインに設定し、`www.panmoa.com`も追加してapexドメインへリダイレクトします。コード側でも`www.panmoa.com`と旧URL`multi-board-eight.vercel.app`から`panmoa.com`へパスとクエリを維持した308リダイレクトを行います。Vercelで両ドメインの証明書発行が完了した後、Google Search ConsoleとBing Webmaster Toolsで次を実施してください。

1. ドメイン所有権をDNSレコードで確認します。
2. `https://<DOMAIN>/sitemap.xml`を送信します。
3. 投稿詳細URLをURL検査し、インデックス登録をリクエストします。
4. 1〜2週間、ページのインデックス登録状況を確認します。検索、認証、プロフィール、管理、投稿フォームが`noindex`として除外されていることも確認します。

SEO公開前にIssue #4のリージョン固定、データ取得ウォーターフォール削減、キャッシュ設定を維持してください。TTFBとCore Web Vitalsは検索順位とクロール効率の両方に影響します。

ゲスト投稿は検索品質へ直接影響します。通報されたスパムや内容の乏しい投稿を管理者が削除する運用を定め、必要に応じて最低品質基準未満の投稿へ`noindex`を追加してください。検索流入は既に導入済みのVercel Analytics、または任意のGA4で測定できます。

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
