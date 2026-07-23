# CLAUDE.md — Panmoa (multi-board)

> 글로벌 규칙(`~/.claude/CLAUDE.md`)을 상속한다. 이 파일은 이 저장소 고유의 사실과 규약만 기록한다.

## 프로젝트
Panmoa — 일본 Tesla 오너/구매 검토자를 위한 의사결정 커뮤니티. 충전·보험·정비·유지비의 실측 데이터와 후기를 공유한다.
**UI/사용자 노출 문자열은 전부 일본어.** 환경변수 미설정 시에도 내장 데모 데이터로 주요 화면이 동작한다.

## Stack
- **Next.js 16 (App Router)** + **React 19** + **TypeScript strict**
- **Supabase** (auth + Postgres + storage), **Tailwind v4**, **Biome**
- 패키지 매니저: **yarn** (npm/pnpm 아님)
- 배포: Vercel

## 명령어
```bash
yarn dev          # 개발 서버 (localhost:3000)
yarn typecheck    # tsc --noEmit
yarn lint         # biome check .
yarn format       # biome format --write .
yarn build        # next build
yarn seed         # 로컬 검증용 합성 데이터 투입 (tools/init_data)
yarn content-bot  # 콘텐츠 봇 (tools/content_bot)
```
**완료 전 검증 3종은 반드시 통과:** `yarn lint && yarn typecheck && yarn build` (또는 `/verify`).

## Server/Client 경계 (하드 규칙 — 위반 금지)
- **서버 전용 파일은 첫 줄에 `import "server-only";`** — `env.server.ts`, `supabase/server.ts`, `supabase/admin.ts`, `image-upload.server.ts`가 그 예다. 새 서버 전용 로직도 동일하게.
- **`SUPABASE_SERVICE_ROLE_KEY`는 절대 클라이언트/`NEXT_PUBLIC_`로 노출 금지.** 접근은 오직 `getServiceRoleKey()` (`env.server.ts`) 경유.
- **Server Action은 `src/app/actions/*.ts`, 파일 첫 줄 `"use server";`.** 폼은 `ActionState`(`@/lib/types`) 패턴을 따른다.
- 환경변수는 **항상 래퍼 경유**로만 읽는다 — `env.ts`(public), `env.server.ts`(secret). feature 코드에서 raw `process.env` 금지.

## Supabase 클라이언트 3종 (용도 구분)
- `supabase/client.ts` — 브라우저용 anon 클라이언트
- `supabase/server.ts` — SSR용 anon + 쿠키 세션 (`createClient()`, async)
- `supabase/admin.ts` — service role, **서버 전용** (`createAdminClient()`)

## 인증/권한
- **다층 방어:** proxy + Server Action + Supabase **RLS**. proxy 하나에 의존하지 않는다.
- Next.js 16에서는 세션 갱신을 `middleware.ts`가 아니라 **`src/proxy.ts`**로 한다.
- Server Action 안에서 권한을 다시 확인한다(`getActor()` 패턴: `auth.getUser()` → `profiles.role`).
- 게스트 참여: `guestName`/`guestPassword` (FormData) 패턴.

## 데모 데이터 폴백
- `hasSupabaseEnv()`로 가드. 환경변수 없으면 조회는 데모 데이터, 변경(mutation)은 친절한 에러 반환(`demoMutationError` 패턴).

## DB 마이그레이션
- 위치/명명: `supabase/migrations/YYYYMMDDNNNN_name.sql` (번호 순).
- 적용: `supabase link --project-ref <REF>` → `supabase db push`.
- `profiles.role` 변경은 `protect_profile_role_before_update` 트리거로 보호됨(관리자 부여는 README 절차 참고).

## 코드 스타일 (Biome로 강제)
- 들여쓰기 2칸(space), 큰따옴표, 세미콜론 항상, import 자동 정리(organizeImports on).
- 경로 별칭: `@/*` → `src/*`.
- 기존 컴포넌트 패턴(`src/components/**`)과 액션 패턴을 따라간다. 새 패턴 도입은 최소화.

## SEO (운영 민감)
- `robots.ts`/`sitemap.ts`/canonical/OG/JSON-LD 자동 생성. 본번은 `NEXT_PUBLIC_SITE_URL=https://panmoa.com`.
- 검색·인증·프로필·관리·작성 폼은 `noindex` 유지. TTFB/CWV가 순위에 직결됨.

## 주의
- 입력 데이터를 **잘라내지(truncate) 말 것.** 너무 길면 사용자와 상의.
- 유지보수성 > 영리함. 변경 범위 최소화, 타입 안정성 확보, lint/build 통과.
