# Apex — CLAUDE.md

## 프로젝트 개요

한국 F1 팬을 위한 데이터 분석 플랫폼.
매 GP 후 자동으로 레이스 리뷰 생성, 드라이버 텔레메트리 비교, 타이어 전략 분석을 한국어로 제공.

상세 아키텍처: `f1_architecture.md` 참고
개발 계획: `.claude/plans/quirky-questing-island.md` 참고

---

## 인프라 확정 사항

| 서비스 | 상세 |
|--------|------|
| **GitHub** | https://github.com/sleepy-wook/apex |
| **Databricks** | https://dbc-526697f5-3a2f.cloud.databricks.com (AWS, us-east-1) |
| **AWS S3** | `s3://apex-f1-data/` (us-east-1) |
| **S3 접근 방식** | Unity Catalog: Storage Credential `apex-databricks-role` + External Location `apex_f1_s3` |
| **Supabase** | 프로젝트 생성 완료 (Data API OFF, RLS OFF — FastAPI에서만 접근) |
| **IAM Role** | `apex-databricks-role` (S3 GetObject, PutObject, DeleteObject, ListBucket) |

Databricks에서 S3 접근 시 `s3://` 프로토콜 사용 (s3a:// 아님).

---

## 레포 구조

```
apex/
├── CLAUDE.md
├── f1_architecture.md
├── .gitignore
├── databricks/              # Medallion 파이프라인 (PySpark)
│   ├── config.py            # S3 경로, API URL, Delta 테이블명 상수
│   ├── bronze/
│   ├── silver/
│   ├── gold/
│   ├── jobs/                # 자동화 Job 스크립트
│   └── news/                # RSS 뉴스 수집
├── backend/                 # FastAPI
│   ├── app/
│   │   ├── api/v1/          # 라우터
│   │   ├── models/          # Pydantic 스키마
│   │   ├── db/              # DB 연결 & 쿼리
│   │   ├── cache/           # Redis 캐시 로직
│   │   └── services/        # 비즈니스 로직
│   ├── .env.example
│   ├── Dockerfile
│   ├── docker-compose.yml
│   ├── pyproject.toml          # uv 패키지 관리
│   └── uv.lock
└── frontend/                # Next.js 15 + TypeScript + Tailwind
    ├── src/
    │   ├── app/             # App Router 페이지
    │   ├── components/
    │   │   ├── ui/          # 공유 기본 컴포넌트 (Button, Card, Badge 등)
    │   │   ├── charts/      # 공유 차트 컴포넌트
    │   │   └── layout/      # Header, Footer, Nav 등
    │   ├── lib/             # API 클라이언트, 유틸 함수
    │   ├── hooks/           # 커스텀 훅
    │   ├── styles/          # 전역 스타일 & 디자인 토큰
    │   └── types/           # 전역 TypeScript 타입
    └── content/             # MDX 정적 콘텐츠 (가이드/용어사전 등)
```

---

## 기술 스택

| Layer | 기술 |
|-------|------|
| Frontend | Next.js 15 + TypeScript + Tailwind CSS |
| Charts | Recharts (기본) + D3.js (텔레메트리) |
| Backend | FastAPI + Python (uv 패키지 매니저) |
| Container | Docker |
| Cache | Redis |
| DB | PostgreSQL (Supabase) |
| Storage | AWS S3 `apex-f1-data` (us-east-1) |
| Pipeline | Databricks (PySpark, Medallion Architecture, Unity Catalog) |
| Deploy FE | Vercel |
| Deploy BE | Railway |

---

## 개발 협업 규칙

### Databricks 코드
- Claude가 **PySpark/Python 코드까지 전부 작성**
- 사용자는 프로젝트 완료 후 **코드 리뷰**
- 스키마 레퍼런스: `databricks/schemas.json` 참고
- Unity Catalog: `apex.f1.{table_name}` 네이밍

### 백엔드 패키지 관리
- **uv** 사용 (pip/requirements.txt 사용 금지)
- 의존성 추가: `uv add <package>`
- 실행: `uv run uvicorn app.main:app --reload`
- Docker에서도 uv 사용

### 커밋 & 푸시
- **Phase 단위로 커밋 + 푸시** (Phase 완료 시 반드시)
- 커밋 메시지: `Phase N: 간단한 설명` 형식

### 외부 서비스 설정 알림
- Phase 시작 전 또는 완료 후, 사용자가 외부 서비스에서 직접 해야 하는 작업을 **체크리스트 형태**로 명시
- 대상: Databricks, AWS (S3, IAM), Supabase, Vercel, Railway, 도메인

### 컴포넌트 설계 원칙
- UI 요소가 2곳 이상 사용되면 **반드시 공유 컴포넌트로 추출**
- 컴포넌트 위치:
  - 범용 UI → `components/ui/`
  - 차트 → `components/charts/`
  - 레이아웃 → `components/layout/`
  - 특정 페이지 전용 → 해당 페이지 폴더 내 `_components/`

### 스타일 규칙
- 색상, 간격, 폰트, 브레이크포인트 등 **반복되는 값은 반드시 CSS 변수 또는 Tailwind 토큰으로 관리**
- 팀 컬러는 DB에서 가져온 `team_colour` 값을 CSS 변수로 주입 (`--color-team-primary`)
- 화이트(라이트) 테마 기본 (`:root` CSS 변수 사용)
- 스타일 토큰 파일: `frontend/src/styles/tokens.css`

---

## 디자인 가이드라인

- **테마:** 화이트(라이트) 기본
- **레퍼런스:** f1-boxbox.com (깔끔한 미니멀)
- **포인트 컬러:** F1 팀 컬러 활용
- **반응형:** 모바일 우선 (레이스 중 모바일 확인 유저 다수)
- **UX 원칙:** 입문자도 부담 없는 UI, 데이터는 점진적으로 깊이 제공

---

## API 데이터 소스 주의사항

### OpenF1 (2023+)
- `championship_drivers` 엔드포인트 **사용 불가** (404) → Jolpica로 대체
- `pit`: `stop_duration`, `lane_duration`, `pit_duration` 3개 중복 → Silver에서 통일
- `laps`: pit out/in lap에서 `lap_duration`, `duration_sector_*`, `st_speed` 전부 null
- `drivers`: `headshot_url` null 가능
- `race_control`: 대부분 필드 nullable, category별 다른 필드 사용
- `position`: 시계열 row 수 폭발 → lap별 snapshot 집계 필요

### Jolpica-F1 (1950+)
- **모든 숫자 필드가 String** → Silver에서 타입 캐스팅 필수
- 계층적 JSON (Driver, Constructor 중첩) → flatten 필요
- 챔피언십 스탠딩, 역사 데이터, 서킷 정보에 사용

---

## API 설계 원칙

- 버전 prefix: `/api/v1/`
- PostgreSQL 쿼리: `[PG]` 표기
- S3 Parquet 온디맨드: `[S3]` 표기
- 모든 응답은 Pydantic 스키마로 타입 보장
- 캐시 적용 대상은 Redis TTL 명시 (레이스 결과 24h, 스탠딩 6h 등)

---

## MVP 개발 Phase

| Phase | 내용 | 상태 |
|-------|------|------|
| 0 | 프로젝트 셋업 (레포, 인프라, 환경) | ✅ 완료 |
| 1 | Databricks 파이프라인 (Bronze → Silver → Gold) | ✅ 완료 |
| 2 | Supabase DB 세팅 (스키마 + 인덱스) | ✅ 완료 |
| 3 | FastAPI 백엔드 (API + Redis) | ✅ 완료 |
| 4 | Next.js 프론트엔드 (디자인 토큰 → 컴포넌트 → 페이지) | ✅ 완료 |
| 5 | 뉴스 피드 (RSS + 홈 UI) | |
| 6 | 자동화 (GP 주말 cron + Job 스케줄) | |

---

## 지속 관리 사항

- **CLAUDE.md 업데이트**: 사용자가 중요한 요청을 할 때마다 관련 내용을 CLAUDE.md에 반영할 것
- **하드코딩 연도 금지**: 연도는 항상 동적으로 (DB 또는 `getSeasons()` API 기준)
- **한국어 우선**: UI 텍스트는 한국어, 데이터 원문(레이스명, 드라이버명 등)은 영어 유지
- **next/image 호스트**: 외부 이미지 사용 시 `next.config.ts`의 `remotePatterns`에 호스트 추가 필수
