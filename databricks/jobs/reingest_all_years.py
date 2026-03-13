# Databricks notebook source
# =============================================================================
# 전체 역사 데이터 수집 (1950-2026)
# =============================================================================
# Jolpica API에서 1950년부터 2026년까지 모든 레이스 결과,
# 드라이버/컨스트럭터 스탠딩을 수집합니다.
#
# replaceWhere를 사용하므로 연도별로 안전하게 저장됩니다.
# 약 77개 연도 × 3 엔드포인트 = ~230회 API 호출
# 연도 간 2초 sleep → 약 10~15분 소요 예상
# =============================================================================

# COMMAND ----------

# MAGIC %run ../config

# COMMAND ----------

# MAGIC %run ../bronze/ingest_jolpica

# COMMAND ----------

# 전체 역사 데이터 수집 (1950-2026)
ingest_history(start_year=1950, end_year=2026)

# COMMAND ----------

# 검증: 각 테이블별 연도 범위 및 총 행 수
out = []
for tbl in ["bronze_results", "bronze_driver_standings", "bronze_constructor_standings"]:
    try:
        df = spark.read.format("delta").load(f"{S3.BRONZE_PATH}/{tbl}")
        years = sorted([r.year for r in df.select("year").distinct().collect()])
        total = df.count()
        out.append(f"{tbl}: {years[0]}-{years[-1]} ({len(years)}yrs), total={total}")
    except Exception as e:
        out.append(f"{tbl}: ERR={str(e)[:100]}")

for line in out:
    print(line)

# COMMAND ----------

dbutils.notebook.exit(" | ".join(out))
