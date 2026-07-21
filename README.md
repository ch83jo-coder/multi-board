# Panmoa Multi Board

Google Stitch 모크업을 기반으로 구현한 Next.js App Router + Supabase 커뮤니티입니다. Supabase 환경 변수가 없을 때는 내장 데모 데이터로 홈, 보드, 게시글 상세 화면을 바로 확인할 수 있습니다.

## 시작하기

```bash
yarn install
cp .env.example .env.local
yarn dev
```

`.env.local`에 다음 값을 설정하면 인증과 실제 CRUD가 활성화됩니다.

```text
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
```

Supabase 프로젝트에는 `supabase/migrations/202607210001_initial_schema.sql`을 적용하세요. 관리자 계정은 `profiles.role`을 `admin`으로 변경해야 하며, service role key는 관리자 Server Action에서만 사용됩니다.

## 주요 경로

- `/` — 홈 피드
- `/boards/[slug]` — 동적 보드 목록
- `/boards/[slug]/[postId]` — 게시글과 댓글
- `/boards/[slug]/write` — 게시글 작성
- `/login`, `/signup` — 인증
- `/admin/boards` — 관리자 보드 관리

## 검증

```bash
yarn typecheck
yarn lint
yarn build
```

Next.js 16에서는 세션 갱신 파일명이 `middleware.ts`에서 `src/proxy.ts`로 변경되었습니다. 모든 변경 작업은 proxy와 별개로 Server Action 및 RLS에서 권한을 다시 확인합니다.
