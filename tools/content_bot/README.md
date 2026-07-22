# コンテンツボット

Web検索で確認した最近の話題をもとに、日本語のコミュニティ投稿を手動生成する管理用ツールです。既存の初期データ投入ツールとは独立しており、有効な掲示板を選んで実行します。

## 事前準備

Node.js 22を推奨します。Supabaseのマイグレーションを適用し、`.env.local`に次の値を設定してください。

```dotenv
NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<service-role-key>
OPENAI_API_KEY=<openai-api-key>
OPENAI_MODEL=gpt-4o-mini
OPENAI_IMAGE_MODEL=gpt-image-2
```

`OPENAI_MODEL`は省略可能で、既定値は`gpt-4o-mini`です。利用するモデルにはResponses APIのWeb SearchとStructured Outputsへの対応が必要です。

`OPENAI_IMAGE_MODEL`も省略可能で、既定値は`gpt-image-2`です。`--with-images`を指定した場合だけ使用します。GPT Imageの利用にはOpenAI Organization Verificationが必要になる場合があります。

`SUPABASE_SERVICE_ROLE_KEY`と`OPENAI_API_KEY`は秘密鍵です。ブラウザへ公開したり、Gitへコミットしたりしないでください。また、`profiles.role = 'admin'`のプロフィールが少なくとも1件必要です。最も古い管理者プロフィールが投稿者になります。

## 実行方法

引数を付けずに実行すると、投稿は生成せず、有効な掲示板と使い方だけを表示します。

```bash
yarn content-bot
```

1つの掲示板へ既定の5件を生成します。

```bash
yarn content-bot --board humor
```

件数は1〜10件の範囲で指定できます。

```bash
yarn content-bot --board news --count 3
```

投稿ごとに画像も生成する場合は`--with-images`を追加します。タイトルの完全一致チェックを通過した投稿だけが画像生成の対象になります。

```bash
yarn content-bot --board tesla --count 3 --with-images
```

すべての有効な掲示板へ各5件を生成します。

```bash
yarn content-bot --all
```

## 生成・保存ルール

- 掲示板ごとに管理者名義の最近の投稿タイトルを最大30件取得し、プロンプトへ渡して話題の重複を抑えます。
- 保存直前にも掲示板内の完全一致タイトルを確認し、同一タイトルはスキップします。
- 各投稿はWeb検索で確認した話題を独自に要約・コメントし、最終行に`参考: https://...`形式の情報源を付けます。
- 記事本文の転載、長い引用、センシティブな事件は生成対象から除外するよう指示しています。
- 投稿は通常の初期値で保存します。閲覧数や投票数の水増し、コメント生成は行いません。
- `--with-images`では投稿ごとに独自の横長イラストを生成し、既存の公開Supabase Storageバケット`post-images`へWebP形式でアップロードします。公開URLは`posts.thumbnail_url`へ保存します。
- 画像は`1536x1024`、`low`品質、WebP圧縮率80で生成します。画像生成またはアップロードに失敗した投稿は、画像なしで保存を続行します。
- 投稿のDB保存に失敗した場合は、その掲示板の処理中にアップロードした画像をStorageから削除します。

自動生成内容には誤りや不適切な表現が含まれる可能性があります。公開後は管理者が本文と参照先を確認し、必要に応じて修正または削除してください。

## 費用と運用

対象掲示板ごとにOpenAI Responses APIを1回呼び出し、その中でWeb Searchを使用します。`--with-images`では、重複を除いた投稿ごとにImage APIも1回呼び出します。実行結果には入力・出力トークン、Web検索回数、画像の生成・アップロード・失敗件数、所要時間を表示します。

既定モデルではトークン料金の概算も表示しますが、Web検索ツール料金は別表示で概算に含みません。画像は成功した生成数をもとに、実装時点の`gpt-image-2`の`1536x1024`・`low`品質における画像出力料金を1枚あたり$0.005として概算します。画像プロンプトの入力料金はこの概算に含みません。料金は変更されることがあるため、最終的な費用はOpenAIのUsage画面と最新の料金表で確認してください。`--all --with-images`は有効な全掲示板で投稿数分の画像生成も行うため、対象数と費用を確認してから実行してください。

本文生成またはDB保存でエラーが発生した場合は処理を停止します。画像生成・アップロードのエラーだけは、その投稿を画像なしで保存して処理を続けます。複数掲示板を対象にした場合、完了済み掲示板の投稿はロールバックされません。

`api.openai.comの名前解決に失敗しました (ENOTFOUND)`と表示された場合は、APIキーやモデルではなくDNS接続の問題です。次のコマンドで接続を確認し、VPN・プロキシ・DNS設定を見直してから再実行してください。

```bash
curl -I https://api.openai.com/v1/models
```

HTTP `401`が返ればネットワーク接続自体は正常です（上記確認コマンドはAPIキーを送信しないため、`401 Unauthorized`が期待されます）。
