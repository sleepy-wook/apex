# Databricks notebook source
# =============================================================================
# 전체 파이프라인 실행: Bronze(1950-2026) → Silver → Gold → Supabase
# =============================================================================
# 순서:
#   1. Bronze Jolpica (1950-2026) — 역사 전체 데이터
#   2. Bronze OpenF1 (2023-2026) — 텔레메트리/랩/피트 등
#   3. Silver Jolpica — 타입 캐스팅, flatten
#   4. Silver OpenF1 — datetime 파싱, 정규화
#   5. Gold — 비즈니스 집계
#   6. Supabase 동기화
#
# 주의: 각 %run 블록은 별도 셀로 분리해서 실행해야 합니다.
# =============================================================================

# COMMAND ----------

# MAGIC %run ../config

# COMMAND ----------

# ===== STEP 1: Bronze Jolpica (1950-2026) =====

# COMMAND ----------

# MAGIC %run ../bronze/ingest_jolpica

# COMMAND ----------

ingest_history(start_year=1950, end_year=2026)

# COMMAND ----------

# ===== STEP 2: Bronze OpenF1 (2023-2026) =====

# COMMAND ----------

# MAGIC %run ../bronze/ingest_openf1

# COMMAND ----------

for year in [2023, 2024, 2025, 2026]:
    ingest_all_openf1(year)

# COMMAND ----------

# ===== STEP 3: Silver Jolpica =====

# COMMAND ----------

# MAGIC %run ../silver/transform_jolpica

# COMMAND ----------

transform_all()

# COMMAND ----------

# ===== STEP 4: Silver OpenF1 =====

# COMMAND ----------

# MAGIC %run ../silver/transform_openf1

# COMMAND ----------

transform_all()

# COMMAND ----------

# ===== STEP 5: Gold 집계 =====

# COMMAND ----------

# MAGIC %run ../gold/aggregate

# COMMAND ----------

aggregate_all()

# COMMAND ----------

# ===== STEP 6: Supabase 동기화 =====

# COMMAND ----------

# MAGIC %run ./gold_to_supabase

# COMMAND ----------

print("전체 파이프라인 완료!")
