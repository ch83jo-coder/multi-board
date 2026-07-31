# Panmoa 공통 에이전트 규칙

이 문서는 Panmoa 저장소에서 사용하는 AI 코딩 에이전트의 공통 규칙 원본이다.
도구별 설정이 충돌하면 사용자 지시, 저장소 루트의 지침, 이 문서 순으로 우선한다.

## 프로젝트

- Panmoa는 일본 Tesla 오너와 구매 검토자가 충전, 보험, 정비, 유지비의 실측 데이터와 경험을 공유하는 커뮤니티다.
- 사용자에게 노출되는 UI, 오류, 성공 메시지는 일본어로 작성한다.
- Supabase 환경 변수가 없어도 주요 조회 화면은 내장 데모 데이터로 동작해야 한다.
- 유지보수성과 명확성을 우선하며 요청 범위 밖의 리팩터링은 피한다.

## 기술 스택

- Next.js 16 App Router, React 19, TypeScript strict
- Supabase Auth, Postgres, Storage
- Tailwind CSS v4, Biome
- Vercel 배포
- 패키지 매니저는 Yarn만 사용한다. 다른 lockfile을 추가하지 않는다.

## 주요 경로

- `src/app`: App Router 페이지, 레이아웃, Server Actions
- `src/components`: 재사용 UI와 도메인 컴포넌트
- `src/lib`: 데이터 접근, 환경 변수, Supabase, SEO, 공통 타입
- `src/proxy.ts`: Next.js 16 세션 갱신과 라우트 보호
- `supabase/migrations`: 순차 적용하는 데이터베이스 마이그레이션
- `tools`: 초기 데이터와 콘텐츠 자동화 도구

절대 import는 `@/*`를 사용하며 이는 `src/*`를 가리킨다.

## 구현 규칙

### Server와 Client 경계

- 서버 전용 모듈은 첫 줄에 `import "server-only";`를 둔다.
- Server Action은 `src/app/actions/*.ts`에 두고 첫 줄에 `"use server";`를 둔다.
- 환경 변수는 기능 코드에서 `process.env`로 직접 읽지 않는다.
  - 공개 값은 `@/lib/env`
  - 비밀 값은 `@/lib/env.server`
- `SUPABASE_SERVICE_ROLE_KEY`를 클라이언트나 `NEXT_PUBLIC_` 변수로 노출하지 않는다.
- 입력값은 임의로 잘라내지 않는다. 제한을 넘으면 일본어 검증 메시지로 알린다.

### Supabase

- 브라우저: `@/lib/supabase/client`
- SSR과 일반 사용자 작업: `@/lib/supabase/server`의 async `createClient()`
- 관리자와 시스템 작업: `@/lib/supabase/admin`의 `createAdminClient()`
- `@/lib/supabase/anon`은 하위 유틸리티이므로 일반 기능에서 우선 사용하지 않는다.
- 인증과 권한은 Proxy, Server Action, RLS에서 각각 확인한다.
- 로그인 사용자는 `auth.getUser()`와 profile role을 다시 검증한다.
- 환경 변수가 없으면 조회는 데모 데이터로 폴백하고 변경 작업은 `demoMutationError` 패턴으로 안내한다.

### Server Action과 폼

- 반환값은 `@/lib/types`의 `ActionState` 패턴을 따른다.
- 검증은 데이터베이스 접근 전에 수행한다.
- 성공 후 필요한 경로 또는 태그만 재검증한다.
- 기존 `getActor()`, 게스트 자격 증명, 일본어 피드백 패턴을 재사용한다.

### 데이터베이스

- 파일명은 `supabase/migrations/YYYYMMDDNNNN_name.sql` 형식을 사용한다.
- 기존 RLS, 트리거, 함수의 보안 패턴을 먼저 확인한다.
- 파괴적 변경보다 단계적이고 되돌릴 수 있는 변경을 우선한다.
- 마이그레이션 생성만 요청받은 경우 `supabase db push`를 자동 실행하지 않는다.

### SEO

- 공개 페이지는 title, description, canonical, Open Graph, Twitter metadata를 함께 검토한다.
- 본문 기반 설명은 `@/lib/seo`의 `createDescription()`을 사용한다.
- URL은 `getSiteUrl()`과 `absoluteUrl()`을 사용한다.
- JSON-LD는 `@/components/seo/json-ld`의 `JsonLd`를 사용한다.
- 검색, 인증, 프로필, 관리, 작성 및 편집 화면의 `noindex`를 유지한다.
- 새 공개 route는 `robots.ts`와 `sitemap.ts` 반영 여부를 확인한다.

## 코드 스타일

- Biome 설정을 따른다: 공백 2칸, 큰따옴표, 세미콜론, import 자동 정리.
- 기존 컴포넌트와 데이터 접근 패턴을 먼저 재사용한다.
- 의존성은 꼭 필요한 경우에만 추가한다.
- 새 파일의 주석은 짧고 명확하게 작성한다.
- 사용자 변경이 있는 작업 트리에서는 관련 없는 파일을 수정하거나 stage하지 않는다.

## 작업 절차

1. 관련 파일과 기존 구현을 먼저 읽는다.
2. 변경 범위를 작게 유지한다.
3. 비밀 값, 권한, Server/Client 경계를 점검한다.
4. 변경에 맞는 검증을 실행한다.
5. 수정 파일, 검증 결과, 남은 위험을 간결하게 보고한다.

기본 검증:

```bash
yarn lint
yarn typecheck
yarn build
```

- 작은 문서 변경은 내용과 diff 검증만으로 충분하다.
- 코드 변경은 최소 `yarn lint`와 `yarn typecheck`를 실행한다.
- 배포 전, 구조 변경, 의존성 변경은 세 명령을 모두 실행한다.
- 실패한 검증을 숨기지 말고 원인과 실행하지 못한 검증을 함께 보고한다.

## Git과 배포

- 명시적 요청 없이 commit, push, PR 생성, 배포를 수행하지 않는다.
- Issue 기반 작업은 `issue-<id>-<짧은-설명>` 브랜치를 사용한다.
- PR은 관련 Issue를 연결하고 개요, 변경 내용, 확인 방법, 영향 범위를 기록한다.
- 커밋과 PR에는 현재 작업과 무관한 변경을 포함하지 않는다.

## 상세 가이드

다음 작업을 할 때는 구현 전에 해당 가이드를 추가로 읽는다.

- Supabase, 환경 변수, server-only 경계: `.claude/skills/supabase-access/SKILL.md`
- Server Action과 폼 처리: `.claude/skills/server-action/SKILL.md`
- 페이지, metadata, canonical, JSON-LD: `.claude/skills/seo-page/SKILL.md`

