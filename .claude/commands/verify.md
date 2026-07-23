---
description: 検証3종（lint → typecheck → build）を順に実行し、最初の失敗で止めて報告する
allowed-tools: Bash(yarn lint*), Bash(yarn typecheck*), Bash(yarn build*)
---

以下を順に実行する。前段が失敗したら後段はスキップし、失敗内容を要約して報告する。

1. `yarn lint`
2. `yarn typecheck`
3. `yarn build`

全て通れば「検証3種すべて通過」とだけ簡潔に報告する。失敗があれば、失敗したステップ・原因・修正候補（ファイルと行）を示す。lint の自動修正可能なものは `yarn format` を提案する（勝手に実行しない）。
