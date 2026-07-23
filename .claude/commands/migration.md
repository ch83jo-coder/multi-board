---
description: Supabase マイグレーションの新規ファイルを命名規約に沿って作成する
argument-hint: <スネークケースの変更名（例: add_post_tags）>
allowed-tools: Bash(ls supabase/migrations*), Bash(date*), Write
---

`supabase/migrations/` に新しいマイグレーションを作成する。

手順:
1. `ls supabase/migrations/` で既存の連番を確認する。命名は `YYYYMMDDNNNN_name.sql`（同日内は `NNNN` を +1）。
2. 変更名は `$ARGUMENTS`（未指定なら何を変更するか尋ねる）。スネークケースに整える。
3. 当日の `YYYYMMDD` を求め、その日の最大連番の次を採番してファイル名を決める。
4. マイグレーション SQL を作成する。既存ファイルの規約に合わせる:
   - RLS ポリシー、トリガー、`profiles.role` 保護（`protect_profile_role_before_update`）などの既存パターンを踏襲。
   - 破壊的変更は避け、可逆的・段階的に。ロールバック観点も一言コメントで残す。
5. 作成後、適用は自動実行しない。`supabase db push` の実行はユーザーに委ねる旨を伝える。
