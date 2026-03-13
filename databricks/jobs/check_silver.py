# Databricks notebook source
# Silver 테이블 검증

# COMMAND ----------

# MAGIC %run ../config

# COMMAND ----------

out = []
for prefix in ["silver_results", "silver_driver_standings", "silver_constructor_standings"]:
    try:
        df = spark.read.format("delta").load(f"{S3.SILVER_PATH}/{prefix}")
        years = sorted([r.year for r in df.select("year").distinct().collect()])
        total = df.count()
        out.append(f"{prefix}: {years[0]}-{years[-1]} ({len(years)}yrs), n={total}")
    except Exception as e:
        out.append(f"{prefix}: ERR={str(e)[:100]}")

for line in out:
    print(line)

dbutils.notebook.exit(" | ".join(out))
