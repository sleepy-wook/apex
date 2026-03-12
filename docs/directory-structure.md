# Apex 디렉토리 구조

## Backend (FastAPI)

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py                    # FastAPI app 생성, 라우터 등록, CORS
│   ├── config.py                  # 환경변수, 설정값
│   │
│   ├── api/
│   │   └── v1/
│   │       ├── __init__.py
│   │       ├── router.py          # v1 라우터 통합
│   │       ├── races.py           # /races, /seasons 엔드포인트
│   │       ├── standings.py       # /standings 엔드포인트
│   │       ├── drivers.py         # /drivers 엔드포인트
│   │       └── head_to_head.py    # /head-to-head 엔드포인트
│   │
│   ├── models/                    # Pydantic 스키마
│   │   ├── __init__.py
│   │   ├── race.py                # RaceSummary, DriverRaceResult, LapData
│   │   ├── standing.py            # DriverStanding, ConstructorStanding
│   │   ├── driver.py              # Driver, DriverDetail
│   │   ├── strategy.py            # PitStrategy, Stint, PitStop
│   │   └── common.py              # 공통 응답 모델 (Pagination 등)
│   │
│   ├── db/
│   │   ├── __init__.py
│   │   ├── connection.py          # asyncpg 풀 관리
│   │   ├── queries/
│   │   │   ├── __init__.py
│   │   │   ├── races.py           # 레이스 관련 쿼리
│   │   │   ├── standings.py       # 스탠딩 쿼리
│   │   │   ├── drivers.py         # 드라이버 쿼리
│   │   │   └── head_to_head.py    # H2H 쿼리
│   │   └── migrations/            # DB 마이그레이션 (필요 시)
│   │
│   ├── cache/
│   │   ├── __init__.py
│   │   └── redis.py               # Redis 연결 + 캐시 데코레이터
│   │
│   └── services/
│       ├── __init__.py
│       ├── race_service.py        # 레이스 비즈니스 로직
│       ├── standing_service.py    # 스탠딩 비즈니스 로직
│       └── driver_service.py      # 드라이버 비즈니스 로직
│
├── .env.example                   # 환경변수 예시
├── Dockerfile
├── docker-compose.yml             # FastAPI + Redis
└── requirements.txt
```

## Frontend (Next.js 15)

```
frontend/
├── app/                           # App Router (루트 — Next.js 기본)
│   ├── layout.tsx                 # 루트 레이아웃
│   ├── page.tsx                   # 홈페이지
│   ├── globals.css                # 글로벌 CSS + 토큰 임포트
│   ├── favicon.ico
│   │
│   ├── race/
│   │   └── [year]/
│   │       └── [round]/
│   │           ├── page.tsx       # 레이스 리뷰 페이지
│   │           └── _components/   # 페이지 전용 컴포넌트
│   │               ├── RaceResultTable.tsx
│   │               ├── PositionChartSection.tsx
│   │               ├── StrategySection.tsx
│   │               └── LapTimeSection.tsx
│   │
│   ├── standings/
│   │   └── [year]/
│   │       ├── page.tsx           # 스탠딩 페이지
│   │       └── _components/
│   │           ├── DriverStandingsTable.tsx
│   │           ├── ConstructorStandingsTable.tsx
│   │           └── PointsProgressionChart.tsx
│   │
│   ├── drivers/
│   │   ├── page.tsx               # 드라이버 목록
│   │   └── [driver_number]/
│   │       └── page.tsx           # 드라이버 상세
│   │
│   └── compare/
│       └── page.tsx               # 텔레메트리 비교 (CSR)
│
├── src/
│   ├── components/
│   │   ├── ui/                    # 공유 기본 컴포넌트
│   │   │   ├── Card.tsx
│   │   │   ├── Badge.tsx
│   │   │   ├── Button.tsx
│   │   │   ├── Skeleton.tsx
│   │   │   ├── DataTable.tsx
│   │   │   ├── StatCard.tsx
│   │   │   ├── DriverTag.tsx
│   │   │   ├── TyreChip.tsx
│   │   │   └── PositionChange.tsx
│   │   │
│   │   ├── charts/                # 공유 차트 컴포넌트
│   │   │   ├── LapTimeChart.tsx
│   │   │   ├── PositionChart.tsx
│   │   │   ├── TyreStrategyChart.tsx
│   │   │   └── GapChart.tsx
│   │   │
│   │   └── layout/                # 레이아웃 컴포넌트
│   │       ├── Header.tsx
│   │       ├── Footer.tsx
│   │       ├── PageHeader.tsx
│   │       └── Container.tsx
│   │
│   ├── lib/
│   │   ├── api.ts                 # API 클라이언트 (fetch wrapper)
│   │   └── utils.ts               # cn() 등 유틸 함수
│   │
│   ├── hooks/
│   │   ├── useRace.ts             # 레이스 데이터 훅
│   │   └── useStandings.ts        # 스탠딩 데이터 훅
│   │
│   ├── types/
│   │   ├── race.ts                # 레이스 관련 타입
│   │   ├── standing.ts            # 스탠딩 타입
│   │   ├── driver.ts              # 드라이버 타입
│   │   └── api.ts                 # API 응답 공통 타입
│   │
│   └── styles/
│       └── tokens.css             # 디자인 토큰 (CSS 변수)
│
├── content/                       # MDX 정적 콘텐츠
│   └── guide/
│       ├── basics.mdx
│       ├── glossary.mdx
│       └── teams.mdx
│
├── public/
│   └── images/
│       └── teams/                 # 팀 로고
│
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

## 핵심 원칙

1. **컴포넌트 분리**: 2곳 이상 사용 → `src/components/` | 1곳 전용 → `_components/`
2. **API 버전**: `/api/v1/` prefix 고정
3. **캐시**: 엔드포인트별 Redis TTL 적용
4. **타입 안전**: Pydantic (BE) + TypeScript (FE) 양쪽 보장
