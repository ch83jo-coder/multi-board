# Claude Code 연결 규칙

Claude Code는 저장소 루트의 `CLAUDE.md`를 진입점으로 사용한다.
모든 작업에서 먼저 `../.ai/AGENTS.md`의 Panmoa 공통 규칙을 적용한다.

- 반복 가능한 저장소 규칙은 `.ai/AGENTS.md`에 기록한다.
- Claude 전용 hook, command, skill, permission만 `.claude`에 둔다.
- 작업별 상세 가이드는 `.claude/skills/*/SKILL.md`를 사용한다.
- 프로젝트 공통 규칙을 이 파일에 복제하지 않는다.

