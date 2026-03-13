# Databricks notebook source
# Silver 변환 전체 실행 (Jolpica + OpenF1)

# COMMAND ----------

# MAGIC %run ../config

# COMMAND ----------

# MAGIC %run ../silver/transform_jolpica

# COMMAND ----------

transform_all()

# COMMAND ----------

# MAGIC %run ../silver/transform_openf1

# COMMAND ----------

transform_all()

# COMMAND ----------

# 검증
out = []
for prefix in ["silver_results", "silver_driver_standings", "silver_constructor_standings", "silver_sessions", "silver_drivers", "silver_laps", "silver_pit", "silver_stints"]:
    try:
        df = spark.read.format("delta").load(f"{S3.SILVER_PATH}/{prefix}")
        years = sorted([r.year for r in df.select("year").distinct().collect()])
        total = df.count()
        out.append(f"{prefix}: {years[0]}-{years[-1]} ({len(years)}yrs), n={total}")
    except Exception as e:
        out.append(f"{prefix}: ERR={str(e)[:80]}")

for line in out:
    print(line)

dbutils.notebook.exit(" | ".join(out))
