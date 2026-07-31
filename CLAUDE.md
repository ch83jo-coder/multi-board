@.ai/AGENTS.md

# Claude Code 프로젝트 연결

공통 프로젝트 규칙의 단일 원본은 `.ai/AGENTS.md`다.
Claude Code 전용 설정은 `.claude`에만 유지한다.

## 작업별 로컬 스킬

- Supabase 클라이언트, 환경 변수, server-only 경계:
  `.claude/skills/supabase-access/SKILL.md`
- Server Action, 폼, 인증과 권한:
  `.claude/skills/server-action/SKILL.md`
- 페이지, metadata, canonical, JSON-LD:
  `.claude/skills/seo-page/SKILL.md`

## 명령

- `/verify`: lint, typecheck, build 순서로 전체 검증
- `/migration <name>`: 저장소 규칙에 맞는 Supabase 마이그레이션 생성

글로벌 Claude 규칙과 충돌하지 않는 범위에서 공통 프로젝트 규칙을 적용한다.
