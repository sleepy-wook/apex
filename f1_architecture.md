# Apex — F1 Korean Data Platform

## Architecture & Design Document

**프로젝트명:** Apex (코드네임)
**도메인:** TBD (후보: apexf1.kr, f1apex.com, apexlap.com 등)
**GitHub repo:** TBD

## 1. 프로젝트 개요

한국 F1 입문자 + 중급 팬을 위한 데이터 분석 플랫폼.
매 GP 후 자동으로 레이스 리뷰가 생성되고, 드라이버 텔레메트리 비교, 타이어 전략 분석 등을 한국어로 제공.

### 배경
- 한국어 F1 데이터 분석 사이트가 사실상 없음
- F1 더 무비 500만 관객 + 넷플릭스 유입으로 한국 F1 팬 급증
- 인천시 F1 GP 유치 추진 중
- 기존 한국 사이트: 뽁스뽁스(일정/결과만), 디시갤/카페(커뮤니티), 나무위키(수동 정리)

### 목표
1. 광고 수익 (성장하는 한국 F1 팬층)
2. Databricks 포트폴리오 (Medallion Architecture 실서비스)
3. 본인이 직접 쓰고 싶은 서비스

### UI/UX 방향
- **레퍼런스:** f1-boxbox.com (뽁스뽁스) — 깔끔한 미니멀 스타일
- 다크 테마 기본 (F1 분위기와 잘 맞음)
- 팀 컬러를 포인트 컬러로 활용
- 모바일 우선 반응형 (레이스 중 모바일로 확인하는 유저 다수)
- 입문자도 부담 없는 UI, 데이터는 점진적으로 깊이 제공

### F1 시즌 구조 (참고)
- 시즌: 3월~12월, 총 24개 GP (Grand Prix = 그랑프리)
- 대략 격주 간격, 중간에 2~4주 쉬는 기간 존재 (연간 ~40주 중 24주 레이스)
- GP 주말 구조: 금(FP1, FP2) → 토(FP3, 퀄리파잉) → 일(레이스)
- 일부 GP는 스프린트 포맷: 금(FP1, 스프린트 퀄리) → 토(스프린트, 퀄리) → 일(레이스)
- 레이스 위크엔드에 트래픽 집중 (금~일 3일간 전체의 ~70%)
- 레이스 없는 평일에도 유입이 필요 → 뉴스 피드 + 입문 가이드가 핵심

---

## 2. System Architecture

```
┌──────────────────────────────────────────────────────┐
│                    DATA SOURCES                       │
│                                                      │
│  OpenF1 API        FastF1 (Python)    Jolpica-F1     │
│  (2023+, 18 EP)    (2018+, telemetry) (1950+, hist)  │
│  Free: 30 req/min  Pandas DataFrame   Ergast 후속     │
│  No auth needed    Caching built-in                  │
│                                                      │
│  F1 News Sources (뉴스 피드)                          │
│  formula1.com RSS, motorsport.com 등                  │
│  → 헤드라인 + 원문 링크 + 관련 GP 데이터 연동          │
└───────────────────────┬──────────────────────────────┘
                        │
┌───────────────────────▼──────────────────────────────┐
│              DATABRICKS PLATFORM                      │
│                                                      │
│  Scheduled Jobs (매 GP 주말 트리거)                    │
│                                                      │
│  Bronze (Raw JSON)                                   │
│    → 원본 그대로 저장. Delta Lake on S3               │
│                                                      │
│  Silver (Cleaned)                                    │
│    → 타입 정규화, 결측치 처리, 드라이버/팀 매핑        │
│                                                      │
│  Gold (Analytics)                                    │
│    → 레이스 요약, 전략 분석, 순위 집계                 │
│                                                      │
│  ※ 기존 Orbital Junkyard 워크스페이스 활용             │
└───────────────────────┬──────────────────────────────┘
                        │
┌───────────────────────▼──────────────────────────────┐
│                  DATA SYNC                            │
│                                                      │
│  구조화 데이터 (laps, pit, positions, standings 등)    │
│    → PostgreSQL (Supabase Free → Pro → RDS)          │
│                                                      │
│  텔레메트리 (car_data — 3.7Hz, 대용량)                │
│    → S3 Parquet (세션/드라이버별 파일)                 │
│    → s3://f1-data/telemetry/{year}/{round}/           │
│         {session}/{driver}.parquet                   │
│                                                      │
│  ※ 매 GP 후 Databricks Job으로 증분 싱크              │
└───────────────────────┬──────────────────────────────┘
                        │
┌───────────────────────▼──────────────────────────────┐
│                BACKEND API                            │
│                                                      │
│  FastAPI (Docker Container)                          │
│  Deploy: Railway ($5~10/월) → ECS Fargate (성장기)   │
│  Cache: Redis (레이스 위크엔드 피크 대응)              │
│                                                      │
│  [PG] = PostgreSQL 쿼리                              │
│  [S3] = S3 Parquet 온디맨드 로드                      │
│                                                      │
│  /api/v1/races/{year}                         [PG]   │
│  /api/v1/race/{year}/{round}/summary          [PG]   │
│  /api/v1/race/{year}/{round}/laps             [PG]   │
│  /api/v1/race/{year}/{round}/positions        [PG]   │
│  /api/v1/race/{year}/{round}/strategy         [PG]   │
│  /api/v1/race/{year}/{round}/pit-stops        [PG]   │
│  /api/v1/race/{year}/{round}/events           [PG]   │
│  /api/v1/telemetry/{year}/{round}/{session}   [S3]   │
│    ?drivers=VER,NOR&lap=fastest                      │
│  /api/v1/standings/drivers/{year}              [PG]   │
│  /api/v1/standings/constructors/{year}         [PG]   │
│  /api/v1/drivers/                             [PG]   │
│  /api/v1/drivers/{driver_id}                  [PG]   │
│  /api/v1/circuits/                            [PG]   │
│  /api/v1/circuits/{circuit_id}                [PG]   │
│  /api/v1/news/                                [PG]   │
│  /api/v1/news/?driver=HAM                     [PG]   │
└───────────────────────┬──────────────────────────────┘
                        │
┌───────────────────────▼──────────────────────────────┐
│                 FRONTEND                              │
│                                                      │
│  Next.js on Vercel                                   │
│  Charts: Recharts (기본) + D3.js (텔레메트리)         │
│                                                      │
│  SSG (빌드 타임):                                     │
│    /guide/basics     — F1 규칙, 주말 구조              │
│    /guide/glossary   — 용어 사전                      │
│    /guide/teams      — 팀 소개                        │
│    /guide/media      — F1 영화/다큐/시리즈 가이드      │
│    /circuits/*       — 서킷 가이드                     │
│                                                      │
│  ISR (GP 후 갱신):                                    │
│    /                     — 메인 홈 (뉴스 + 최근 GP)   │
│    /race/{year}/{round}  — 레이스 리뷰               │
│    /standings/{year}     — 시즌 스탠딩                │
│    /drivers              — 드라이버 프로필             │
│                                                      │
│  CSR (인터랙티브):                                    │
│    /compare              — 텔레메트리 비교 도구        │
└──────────────────────────────────────────────────────┘
```

---

## 3. Data Sources 상세

### OpenF1 API (Primary — 2023+)
- URL: https://api.openf1.org/v1/
- Auth: 무료 티어 인증 불필요
- Rate Limit: Free 3 req/s, 30 req/min | Sponsor(€9.90/월) 6 req/s, 60 req/min
- Format: JSON, CSV

| Endpoint | 데이터 | 용도 |
|----------|--------|------|
| `/sessions` | 세션 메타 (FP1/2/3, Q, R, Sprint) | 세션 관리 |
| `/meetings` | GP 정보 (이름, 서킷, 날짜, 국가) | GP 정보 |
| `/drivers` | 드라이버 (번호, 이름, 팀) | 기본 정보 |
| `/laps` | 랩타임, 섹터타임, 피트 인/아웃 | 랩 분석 |
| `/car_data` | 속도, 스로틀, 브레이크, DRS, 기어, RPM (~3.7Hz) | 텔레메트리 |
| `/location` | 차량 위치 (x, y, z) | 트랙맵 |
| `/pit` | 피트스탑 시간, 랩 넘버 | 피트 분석 |
| `/position` | 순위 변동 시계열 | 순위 차트 |
| `/stints` | 타이어 컴파운드, 스틴트 길이 | 전략 분석 |
| `/race_control` | 깃발, 페널티, SC, VSC | 레이스 이벤트 |
| `/weather` | 트랙 온도, 기온, 습도, 강수, 풍속 | 날씨 |
| `/championship_drivers` | 드라이버 챔피언십 순위 | 스탠딩 |
| `/championship_teams` | 컨스트럭터 챔피언십 순위 | 스탠딩 |
| `/team_radio` | 팀 무전 | 부가 콘텐츠 |

### FastF1 Python Library (Supplementary — 2018+)
- 설치: `pip install fastf1`
- 2018+ 텔레메트리, 그 이전은 결과/일정만
- Pandas DataFrame, Matplotlib 연동, 캐싱 내장
- OpenF1보다 과거 데이터가 풍부 (2018~2022)

### Jolpica-F1 API (Historical — 1950+)
- URL: https://api.jolpi.ca/ergast/f1/
- Ergast API 후속, 1950년부터 전체 F1 역사
- 레이스 결과, 드라이버, 컨스트럭터, 서킷 정보

---

## 4. Database Schema (PostgreSQL — Gold 서빙용)

### 메타데이터
```
meetings
  - meeting_key (PK)
  - year, round
  - name, official_name
  - circuit_name, country, city
  - date_start

sessions
  - session_key (PK)
  - meeting_key (FK)
  - session_type (FP1, FP2, FP3, Qualifying, Sprint, Race)
  - date_start, date_end

drivers
  - driver_number (PK, 시즌 내)
  - full_name, name_acronym
  - team_name, team_colour
  - country_code
  - headshot_url

teams
  - team_name (PK, 시즌 내)
  - team_colour
  - year
```

### 레이스 결과 (1순위)
```
race_results
  - session_key (FK)
  - driver_number (FK)
  - position_final
  - points
  - status (Finished, DNF, DSQ 등)
  - grid_position
  - fastest_lap_time
  - total_time

laps
  - session_key (FK)
  - driver_number (FK)
  - lap_number
  - lap_duration (ms)
  - sector_1_duration, sector_2_duration, sector_3_duration
  - is_pit_out_lap, is_pit_in_lap
  - compound (SOFT, MEDIUM, HARD, INTERMEDIATE, WET)

position_changes
  - session_key (FK)
  - driver_number (FK)
  - lap_number (or timestamp)
  - position

pit_stops
  - session_key (FK)
  - driver_number (FK)
  - lap_number
  - stop_duration (s)
  - pit_duration (s, 레인 포함)

stints
  - session_key (FK)
  - driver_number (FK)
  - stint_number
  - compound
  - lap_start, lap_end
  - tyre_age_at_start

race_events
  - session_key (FK)
  - timestamp
  - event_type (SafetyCar, VSC, Flag, Penalty 등)
  - message
  - driver_number (nullable)

weather
  - session_key (FK)
  - timestamp
  - air_temperature, track_temperature
  - humidity, pressure
  - wind_speed, wind_direction
  - rainfall
```

### 시즌 트래킹 (3순위)
```
championship_drivers
  - year, round
  - driver_number
  - position, points

championship_constructors
  - year, round
  - team_name
  - position, points
```

### 역사 데이터 (v3)
```
historical_races
  - year, round
  - circuit, country
  - winner_driver, winner_team
  - pole_driver
  - fastest_lap_driver
```

### 뉴스
```
news_articles
  - id (PK)
  - title
  - title_ko (v2에서 AI 번역 추가)
  - source (formula1.com, motorsport.com 등)
  - url (원문 링크)
  - published_at
  - image_url
  - related_driver (nullable, 자동 태깅)
  - related_meeting_key (nullable, 자동 태깅)
  - created_at
```

### 텔레메트리 (S3 Parquet — DB 아님)
```
S3: s3://f1-data/telemetry/{year}/{round}/{session}/{driver}.parquet

columns:
  - timestamp
  - speed (km/h)
  - throttle (0-100%)
  - brake (0-100%)
  - gear (0-8)
  - rpm
  - drs (0/1/...)
  - distance (m, 랩 시작부터)
  - x, y, z (차량 위치)
```

---

### 이미지 & 에셋 관리

**원칙: 가능한 한 F1 공식 CDN 이미지를 직접 사용하여 일관성 확보.**

| 에셋 | 소스 | 자동화 | 비고 |
|------|------|--------|------|
| 드라이버 헤드샷 | OpenF1 `headshot_url` → F1 공식 CDN | ✅ 자동 | API 응답에 포함 |
| 팀 컬러 (HEX) | OpenF1 `team_colour` | ✅ 자동 | 차트/UI 팀 구분용 |
| 국기 이미지 | OpenF1 meetings `country_flag` → F1 CDN | ✅ 자동 | GP 목록 표시용 |
| 서킷 트랙맵 | OpenF1 meetings `circuit_image` → F1 CDN | ✅ 자동 | 서킷 가이드용 |
| 팀 로고 | API 미제공 → 시즌 시작 시 수동 확보 | ⚠️ 반수동 | 10개 팀, 시즌 1회 |
| 미디어 포스터 | 정적 에셋 (public/images/media/) | 수동 | F1 영화/다큐 소개용 |

**시즌별 변동 자동 반영:**
- OpenF1 `/drivers` 데이터가 session_key별로 제공됨
- 시즌 간 팀명 변경 (예: AlphaTauri → RB), 드라이버 이적 자동 반영
- 시즌 중 드라이버 교체 (부상 대타 등)도 해당 세션 데이터에 반영
- 과거 시즌 조회 시 해당 시즌의 팀명/드라이버 구성이 정확히 표시됨

**팀 로고 관리 (반수동):**
- 시즌 시작 전 (2~3월) 10개 팀 로고를 공식 소스에서 확보
- `public/images/teams/{year}/{team_name}.svg` 형태로 저장
- drivers 테이블의 team_name으로 매핑
- 연간 1회 업데이트 (팀 10개 고정)

---

## 5. 페이지별 데이터 요구사항

### 메인 홈 (`/`)
- 최신 뉴스 피드 (헤드라인 + 썸네일 + 원문 링크): news_articles
- 최근/다음 GP 정보: meetings + sessions
- 현재 챔피언십 순위 스냅샷: championship_drivers, championship_constructors
- 최근 GP 하이라이트 링크: race_results (직전 GP)

### MVP (1순위: 레이스 결과 & 리뷰)
**`/race/{year}/{round}`**
- 레이스 결과표: race_results
- 랩별 순위 변동 라인 차트: position_changes
- 타이어 전략 타임라인 (가로 바 차트): stints
- 피트스탑 요약 테이블: pit_stops
- 레이스 이벤트 마커 (SC, 깃발 등): race_events
- 날씨 요약: weather
- 패스티스트 랩: laps (min lap_duration)

### MVP (2순위: 퍼포먼스 분석)
**`/compare`** (인터랙티브 도구)
- 드라이버 선택 UI → 텔레메트리 오버레이: S3 Parquet
- 섹터 타임 비교 바 차트: laps (섹터별)
- 랩타임 분포 (바이올린/스캐터): laps

### MVP (3순위: 시즌 트래킹)
**`/standings/{year}`**
- 드라이버 순위 라인 차트 (라운드별 추이): championship_drivers
- 컨스트럭터 순위 라인 차트: championship_constructors
- 시즌 통계 요약: race_results 집계

### MVP (4순위: 입문자 & F1 즐기기)
**`/guide`** — 정적 MDX 콘텐츠
- `/guide/basics` — F1 규칙, 포인트 시스템, 주말 구조 설명
- `/guide/glossary` — 용어 사전 (DRS, 언더컷, SC, 컴파운드 등)
- `/guide/teams` — 현 시즌 10개 팀 소개
- `/guide/media` — F1 관련 미디어 가이드 (아래 상세)

**`/guide/media` — F1 즐기기 (영화/다큐/시리즈)**
비시즌(12~2월)이나 레이스 없는 주에도 유입을 만드는 콘텐츠.
입문자가 "F1에 빠지는 경로"를 안내하는 역할.
정적 MDX로 관리 (DB 불필요, 수동 큐레이션).

| 콘텐츠 | 연도 | 플랫폼 | 설명 |
|--------|------|--------|------|
| F1 (영화) | 2025 | 극장 | 브래드 피트 주연, 한국 500만 관객 |
| Drive to Survive | 2019~ | 넷플릭스 | 한국 F1 붐의 주역, 시즌별 비하인드 |
| Rush | 2013 | VOD | 라우다 vs 헌트 실화, 론 하워드 감독 |
| Senna | 2010 | VOD | 아일톤 세나 다큐멘터리 |
| Schumacher | 2021 | 넷플릭스 | 미하엘 슈마허 다큐멘터리 |
| Williams | 2017 | VOD | 윌리엄스 팀 다큐멘터리 |
| Gran Turismo | 2023 | VOD | 게이머 → 레이서 실화 |
| Senna (드라마) | 2024 | 넷플릭스 | 세나 생애 드라마화 |

각 콘텐츠를 카드 형태로 표시: 포스터 이미지 + 한줄 소개 + 추천 이유 + 시청 플랫폼.
신규 콘텐츠 나올 때 MDX에 추가하면 됨 (연 1~2회 수준).

**`/drivers`** — drivers + 시즌 통계 (race_results 집계)
**`/circuits`** — 정적 + historical_races

---

## 6. GP 주말 자동화 플로우

### 트리거 방식
F1 공식 캘린더에서 각 세션 종료 예정시각을 알 수 있으므로,
**세션 종료 예정시각 + 30분에 cron 트리거**를 설정.
(예: 레이스 15:00 종료 예정 → 15:30에 Job 시작)

추가 안전장치로 OpenF1 `/sessions` 엔드포인트를 폴링하여
세션 상태가 "ended"인지 확인 후 수집 시작.

시즌 시작 전에 연간 캘린더 기반으로 cron 스케줄을 일괄 등록.

### 플로우

```
세션 종료 예정시각 + 30분 (cron)
    │
    ├─ OpenF1 /sessions 폴링 → 세션 종료 확인
    │   (미종료 시 10분 간격 재시도, 최대 2시간)
    │
    ▼
Databricks Job 시작
    │
    ├─ 1) Bronze 수집
    │     OpenF1 endpoints 호출 → raw JSON → Delta Lake
    │
    ├─ 2) Silver 정제
    │     타입 정규화, 결측치 처리, 시간대 통일
    │     드라이버/팀 매핑, 컴파운드명 통일
    │
    ├─ 3) Gold 집계
    │     레이스 요약, 순위 변동 계산, 전략 분석
    │
    ├─ 4) PostgreSQL 싱크 (구조화 데이터)
    │
    ├─ 5) S3 Parquet 업로드 (텔레메트리)
    │
    └─ 6) Vercel ISR 재검증 트리거
          → 레이스 리뷰 페이지 자동 갱신
```

레이스 종료 후 약 1~2시간 이내에 한국어 레이스 리뷰 + 데이터가 자동 게시.

---

## 7. 뉴스 피드 (메인 페이지 핵심 콘텐츠)

레이스 없는 평일에도 유저 유입을 만들기 위한 핵심 기능.

### 소스
- formula1.com 공식 뉴스 RSS
- motorsport.com, autosport.com 등 주요 모터스포츠 매체
- FIA 공식 발표

### 처리 방식
- 뉴스 헤드라인 + 원문 링크 (저작권 안전)
- 관련 GP/드라이버 데이터 페이지 연동 (차별화)
  예: "해밀턴 페라리 첫 포디움" → 해당 GP 데이터 링크 자동 매핑
- 주기: 1시간마다 RSS 폴링 → DB 저장
- 향후(v2): AI 한국어 요약 추가 가능

### DB
```
news_articles
  - id (PK)
  - title (원문 헤드라인)
  - title_ko (한국어 번역 — v2에서 AI 추가)
  - source (formula1.com, motorsport.com 등)
  - url (원문 링크)
  - published_at
  - image_url (썸네일)
  - related_driver (nullable — 자동 태깅)
  - related_meeting_key (nullable — 자동 태깅)
  - created_at
```

### FastAPI 엔드포인트
```
/api/v1/news/                      -- 최신 뉴스 목록
/api/v1/news/?driver=HAM           -- 드라이버별 필터
/api/v1/news/?meeting_key=1272     -- GP별 필터
```

---

## 8. 인프라 & 비용 계획

### 초기 (MVP)
| 서비스 | 플랜 | 월 비용 |
|--------|------|--------|
| Vercel (Next.js) | Free / Hobby | $0 |
| Railway (FastAPI + Redis) | Hobby | $5~10 |
| Supabase (PostgreSQL) | Free (500MB) | $0 |
| S3 (텔레메트리 + Delta Lake) | 기존 AWS | $1~3 |
| Databricks | 기존 워크스페이스 | 기존 비용 |
| 도메인 | .com | ~$12/년 |
| **합계** | | **~$10~15/월** |

### 성장기
| 서비스 | 플랜 | 월 비용 |
|--------|------|--------|
| Vercel | Pro | $20 |
| Railway | Pro | $10~20 |
| Supabase | Pro (8GB) | $25 |
| S3 + CloudFront | - | $5~10 |
| **합계** | | **~$60~75/월** |

### 마이그레이션 없는 설계
- FastAPI: Docker 컨테이너 → Railway / ECS / EKS 어디든 동일 이미지
- PostgreSQL: Supabase → RDS → Aurora 커넥션 스트링만 변경
- Next.js: Vercel 자동 스케일링
- 코드 변경 없이 인프라만 업그레이드

---

## 9. 기술 스택 요약

| Layer | 기술 | 이유 |
|-------|------|------|
| Frontend | Next.js + TypeScript | SSG/ISR/CSR 혼합, Vercel 최적화 |
| Content | MDX (next-mdx-remote) | 가이드/용어사전/미디어 등 정적 콘텐츠 관리 |
| Charts | Recharts + D3.js | Recharts(기본 차트), D3(텔레메트리 커스텀) |
| Backend | FastAPI + Python | F1 데이터 에코시스템이 Python, FastF1 연동 |
| Container | Docker | 이식성, Railway → ECS 무중단 이전 |
| Cache | Redis | 레이스 위크엔드 피크 대응 |
| DB | PostgreSQL (Supabase) | 구조화 데이터 서빙, 무료 시작 |
| Storage | AWS S3 | 텔레메트리 Parquet, Delta Lake |
| Pipeline | Databricks (PySpark) | Medallion Architecture, 기존 워크스페이스 |
| Deploy (FE) | Vercel | Next.js 네이티브, 자동 스케일링 |
| Deploy (BE) | Railway | Docker 컨테이너, $5부터 시작 |
| API Version | /api/v1/ | 하위 호환성 보장 |

---

## 10. MVP 개발 우선순위

1. **데이터 파이프라인** — OpenF1 수집 → Bronze → Silver → Gold
2. **DB 세팅** — Supabase PostgreSQL + 스키마 생성
3. **FastAPI 백엔드** — 레이스 결과/랩/전략 API 엔드포인트
4. **Next.js 프론트** — 레이스 대시보드 페이지 (결과 + 순위 변동 + 전략)
5. **뉴스 피드** — RSS 수집 + 메인 홈 뉴스 카드 (평일 유입 핵심)
6. **드라이버 비교** — 텔레메트리 S3 연동 + 비교 UI
7. **시즌 스탠딩** — 챔피언십 순위 추이 차트
8. **입문 가이드 + F1 즐기기** — 정적 MDX (규칙, 용어, 팀 소개, 영화/다큐 가이드)
9. **자동화** — GP 주말 cron 트리거 + Databricks Job 스케줄링

---

## 11. 캐싱 전략

| 데이터 | Redis TTL | 비고 |
|--------|-----------|------|
| 뉴스 피드 | 30min | 1시간마다 RSS 갱신, 빠른 반영 |
| 레이스 결과 | 24h | GP 후 확정 데이터 |
| 스탠딩 | 6h | GP 후에만 변동 |
| 텔레메트리 | 1h | 용량 큼, 짧은 캐시 |
| 드라이버 목록 | 24h | 시즌 중 거의 불변 |
| 서킷 정보 | 7d | 정적 데이터 |

---

## 12. 향후 확장 (v2, v3)

### v2
- 서킷 가이드 (역대 데이터 + 특성 분석)
- 팀별 개발 곡선 (GP별 상대 페이스 변화)
- 피트스탑 팀 랭킹 + 트렌드
- 날씨 임팩트 분석
- 뉴스레터 자동 생성 (매 GP 데이터 리뷰)
- SEO 최적화 + AdSense

### v3
- OpenF1 WebSocket/MQTT 실시간 데이터
- 라이브 레이스 트래커
- 역대 기록 검색 (1950~ Jolpica)
- PWA / 모바일 앱
