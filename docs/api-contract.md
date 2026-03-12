# Apex API Contract

## 개요

- **Base URL**: `/api/v1/`
- **데이터 소스**: `[PG]` PostgreSQL (Supabase), `[S3]` S3 Parquet
- **캐시**: Redis (TTL은 엔드포인트별 명시)
- **응답 형식**: JSON, Pydantic 스키마 기반

---

## 1. 세션 & 레이스 목록

### `GET /api/v1/seasons/{year}/races` `[PG]`
시즌 내 전체 레이스(GP) 목록

| 파라미터 | 타입 | 필수 | 설명 |
|----------|------|------|------|
| `year` | path, int | ✅ | 시즌 연도 |

**캐시 TTL**: 24h

```json
{
  "year": 2024,
  "races": [
    {
      "session_key": 9468,
      "year": 2024,
      "round": 1,
      "country_name": "Bahrain",
      "country_code": "BHR",
      "circuit_short_name": "Sakhir",
      "location": "Sakhir",
      "date_start": "2024-03-02T15:00:00+03:00",
      "session_type": "Race",
      "session_name": "Race",
      "winner_name": "Max VERSTAPPEN",
      "winner_team": "Red Bull Racing",
      "winner_team_colour": "3671C6"
    }
  ]
}
```

---

### `GET /api/v1/sessions/{session_key}` `[PG]`
특정 세션 상세 정보

| 파라미터 | 타입 | 필수 | 설명 |
|----------|------|------|------|
| `session_key` | path, int | ✅ | 세션 고유 ID |

**캐시 TTL**: 24h

---

## 2. 레이스 결과 & 분석

### `GET /api/v1/races/{year}/{round}/summary` `[PG]`
레이스 요약 (우승자, SC 횟수, 총 랩 수 등)

| 파라미터 | 타입 | 필수 | 설명 |
|----------|------|------|------|
| `year` | path, int | ✅ | 시즌 연도 |
| `round` | path, int | ✅ | 라운드 번호 |

**캐시 TTL**: 24h
**소스 테이블**: `race_summary`

```json
{
  "year": 2024,
  "round": 1,
  "race_name": "Bahrain Grand Prix",
  "circuit_short_name": "Sakhir",
  "country_name": "Bahrain",
  "date": "2024-03-02T15:00:00+03:00",
  "total_laps": 57,
  "safety_car_count": 1,
  "red_flag_count": 0,
  "winner": {
    "driver_number": 1,
    "full_name": "Max VERSTAPPEN",
    "name_acronym": "VER",
    "team_name": "Red Bull Racing",
    "team_colour": "3671C6"
  }
}
```

---

### `GET /api/v1/races/{year}/{round}/results` `[PG]`
드라이버별 레이스 결과 (순위, 포인트, 그리드→피니시)

| 파라미터 | 타입 | 필수 | 설명 |
|----------|------|------|------|
| `year` | path, int | ✅ | 시즌 연도 |
| `round` | path, int | ✅ | 라운드 번호 |

**캐시 TTL**: 24h
**소스 테이블**: `driver_race_result`

```json
{
  "results": [
    {
      "position": 1,
      "driver_number": 1,
      "full_name": "Max VERSTAPPEN",
      "name_acronym": "VER",
      "team_name": "Red Bull Racing",
      "team_colour": "3671C6",
      "grid": 1,
      "positions_gained": 0,
      "points": 25.0,
      "status": "Finished",
      "total_time": "5765.432",
      "fastest_lap_time": "1:32.456",
      "pit_count": 2,
      "headshot_url": "https://..."
    }
  ]
}
```

---

### `GET /api/v1/races/{year}/{round}/laps` `[PG]`
랩별 분석 데이터 (랩타임 + 타이어 컴파운드)

| 파라미터 | 타입 | 필수 | 설명 |
|----------|------|------|------|
| `year` | path, int | ✅ | 시즌 연도 |
| `round` | path, int | ✅ | 라운드 번호 |
| `driver_number` | query, int | ❌ | 특정 드라이버 필터 |

**캐시 TTL**: 24h
**소스 테이블**: `lap_analysis` (gold)

```json
{
  "laps": [
    {
      "driver_number": 1,
      "name_acronym": "VER",
      "team_colour": "3671C6",
      "lap_number": 1,
      "lap_duration": 92.456,
      "sector_1": 28.123,
      "sector_2": 34.567,
      "sector_3": 29.766,
      "compound": "MEDIUM",
      "tyre_age": 1,
      "is_pit_out_lap": false
    }
  ]
}
```

---

### `GET /api/v1/races/{year}/{round}/positions` `[PG]`
랩별 포지션 변화 (순위 차트 데이터)

| 파라미터 | 타입 | 필수 | 설명 |
|----------|------|------|------|
| `year` | path, int | ✅ | 시즌 연도 |
| `round` | path, int | ✅ | 라운드 번호 |

**캐시 TTL**: 24h
**소스 테이블**: `position_changes` (gold) — 현재 Supabase 미적재, S3에서 온디맨드 가능

```json
{
  "positions": [
    {
      "driver_number": 1,
      "name_acronym": "VER",
      "team_colour": "3671C6",
      "laps": [
        { "lap": 1, "position": 1 },
        { "lap": 2, "position": 1 }
      ]
    }
  ]
}
```

---

### `GET /api/v1/races/{year}/{round}/strategy` `[PG]`
피트 전략 (스틴트 + 타이어 + 피트 타이밍)

| 파라미터 | 타입 | 필수 | 설명 |
|----------|------|------|------|
| `year` | path, int | ✅ | 시즌 연도 |
| `round` | path, int | ✅ | 라운드 번호 |

**캐시 TTL**: 24h
**소스 테이블**: `pit_strategy`

```json
{
  "strategies": [
    {
      "driver_number": 1,
      "name_acronym": "VER",
      "team_name": "Red Bull Racing",
      "team_colour": "3671C6",
      "stints": [
        {
          "stint_number": 1,
          "compound": "MEDIUM",
          "lap_start": 1,
          "lap_end": 20,
          "stint_laps": 20,
          "tyre_age_at_start": 3
        }
      ],
      "pit_stops": [
        {
          "lap_number": 20,
          "pit_duration": 23.5
        }
      ]
    }
  ]
}
```

---

## 3. 챔피언십 스탠딩

### `GET /api/v1/standings/drivers/{year}` `[PG]`
드라이버 챔피언십 순위

| 파라미터 | 타입 | 필수 | 설명 |
|----------|------|------|------|
| `year` | path, int | ✅ | 시즌 연도 |
| `round` | query, int | ❌ | 특정 라운드 기준 (미지정 시 최신) |

**캐시 TTL**: 6h
**소스 테이블**: `driver_standings`

```json
{
  "year": 2024,
  "round": 24,
  "standings": [
    {
      "position": 1,
      "driver_id": "max_verstappen",
      "driver_name": "Max VERSTAPPEN",
      "name_acronym": "VER",
      "team_name": "Red Bull Racing",
      "team_colour": "3671C6",
      "points": 437.0,
      "wins": 9
    }
  ]
}
```

---

### `GET /api/v1/standings/constructors/{year}` `[PG]`
컨스트럭터 챔피언십 순위

| 파라미터 | 타입 | 필수 | 설명 |
|----------|------|------|------|
| `year` | path, int | ✅ | 시즌 연도 |
| `round` | query, int | ❌ | 특정 라운드 기준 |

**캐시 TTL**: 6h
**소스 테이블**: `constructor_standings`

```json
{
  "year": 2024,
  "round": 24,
  "standings": [
    {
      "position": 1,
      "constructor_id": "mclaren",
      "constructor_name": "McLaren",
      "team_colour": "FF8000",
      "points": 666.0,
      "wins": 5
    }
  ]
}
```

---

### `GET /api/v1/standings/drivers/{year}/progression` `[PG]`
라운드별 포인트 추이 (스탠딩 차트용)

| 파라미터 | 타입 | 필수 | 설명 |
|----------|------|------|------|
| `year` | path, int | ✅ | 시즌 연도 |

**캐시 TTL**: 6h
**소스 테이블**: `driver_standings`

```json
{
  "progression": [
    {
      "driver_id": "max_verstappen",
      "name_acronym": "VER",
      "team_colour": "3671C6",
      "rounds": [
        { "round": 1, "points": 25 },
        { "round": 2, "points": 43 }
      ]
    }
  ]
}
```

---

## 4. 드라이버

### `GET /api/v1/drivers` `[PG]`
현재 시즌 드라이버 목록

| 파라미터 | 타입 | 필수 | 설명 |
|----------|------|------|------|
| `year` | query, int | ❌ | 시즌 (기본: 현재) |

**캐시 TTL**: 24h
**소스 테이블**: `drivers`

---

### `GET /api/v1/drivers/{driver_number}` `[PG]`
드라이버 상세 + 시즌 통계

| 파라미터 | 타입 | 필수 | 설명 |
|----------|------|------|------|
| `driver_number` | path, int | ✅ | 차량 번호 |
| `year` | query, int | ❌ | 시즌 (기본: 현재) |

**캐시 TTL**: 24h
**소스 테이블**: `drivers`, `driver_race_result`

---

## 5. 팀메이트 비교

### `GET /api/v1/head-to-head/{year}/{constructor_id}` `[PG]`
팀메이트 간 H2H 비교

| 파라미터 | 타입 | 필수 | 설명 |
|----------|------|------|------|
| `year` | path, int | ✅ | 시즌 연도 |
| `constructor_id` | path, string | ✅ | 팀 ID |

**캐시 TTL**: 6h
**소스 테이블**: `head_to_head`

```json
{
  "year": 2024,
  "team_name": "McLaren",
  "team_colour": "FF8000",
  "driver_1": {
    "name_acronym": "NOR",
    "full_name": "Lando NORRIS",
    "qualifying_wins": 14,
    "race_wins": 12,
    "avg_position": 3.2,
    "total_points": 374
  },
  "driver_2": {
    "name_acronym": "PIA",
    "full_name": "Oscar PIASTRI",
    "qualifying_wins": 10,
    "race_wins": 12,
    "avg_position": 4.1,
    "total_points": 292
  }
}
```

---

## 6. 헬스체크 & 메타

### `GET /api/v1/health`
서버 상태 확인

### `GET /api/v1/seasons`
사용 가능한 시즌 목록

---

## API 엔드포인트 요약

| Method | Path | 소스 | TTL | 설명 |
|--------|------|------|-----|------|
| GET | `/seasons/{year}/races` | [PG] | 24h | 시즌 레이스 목록 |
| GET | `/sessions/{session_key}` | [PG] | 24h | 세션 상세 |
| GET | `/races/{year}/{round}/summary` | [PG] | 24h | 레이스 요약 |
| GET | `/races/{year}/{round}/results` | [PG] | 24h | 레이스 결과 |
| GET | `/races/{year}/{round}/laps` | [PG] | 24h | 랩 분석 |
| GET | `/races/{year}/{round}/positions` | [PG] | 24h | 포지션 변화 |
| GET | `/races/{year}/{round}/strategy` | [PG] | 24h | 피트 전략 |
| GET | `/standings/drivers/{year}` | [PG] | 6h | 드라이버 스탠딩 |
| GET | `/standings/constructors/{year}` | [PG] | 6h | 컨스트럭터 스탠딩 |
| GET | `/standings/drivers/{year}/progression` | [PG] | 6h | 포인트 추이 |
| GET | `/drivers` | [PG] | 24h | 드라이버 목록 |
| GET | `/drivers/{driver_number}` | [PG] | 24h | 드라이버 상세 |
| GET | `/head-to-head/{year}/{constructor_id}` | [PG] | 6h | 팀메이트 비교 |
| GET | `/health` | - | - | 헬스체크 |
| GET | `/seasons` | [PG] | 7d | 시즌 목록 |

---

## DB 쿼리 패턴

### race_summary
```sql
SELECT * FROM race_summary
WHERE year = :year AND round = :round;
```

### driver_race_result
```sql
SELECT drr.*, d.headshot_url, d.team_colour
FROM driver_race_result drr
JOIN drivers d ON drr.driver_number = d.driver_number
  AND drr.session_key = d.session_key
WHERE drr.year = :year AND drr.round = :round
ORDER BY drr.position;
```

### pit_strategy
```sql
SELECT * FROM pit_strategy
WHERE session_key = (
  SELECT session_key FROM sessions
  WHERE year = :year AND round = :round AND session_type = 'Race'
)
ORDER BY driver_number, stint_number;
```

### driver_standings (최신)
```sql
SELECT * FROM driver_standings
WHERE year = :year AND round = (
  SELECT MAX(round) FROM driver_standings WHERE year = :year
)
ORDER BY position;
```

### driver_standings (progression)
```sql
SELECT driver_id, name_acronym, team_colour, round, points
FROM driver_standings
WHERE year = :year
ORDER BY driver_id, round;
```

### constructor_standings
```sql
SELECT * FROM constructor_standings
WHERE year = :year AND round = (
  SELECT MAX(round) FROM constructor_standings WHERE year = :year
)
ORDER BY position;
```

### head_to_head
```sql
SELECT * FROM head_to_head
WHERE year = :year AND constructor_id = :constructor_id;
```

### sessions (시즌 레이스 목록)
```sql
SELECT s.*, rs.winner_name, rs.winner_team, rs.winner_team_colour
FROM sessions s
LEFT JOIN race_summary rs ON s.year = rs.year AND s.round = rs.round
WHERE s.year = :year AND s.session_type = 'Race'
ORDER BY s.round;
```
