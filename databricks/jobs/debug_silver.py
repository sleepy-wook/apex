# Databricks notebook source
# COMMAND ----------

# MAGIC %run ../config

# COMMAND ----------

# MAGIC %run ../silver/transform_jolpica

# COMMAND ----------

# transform_results만 직접 실행 (에러 catch 없이)
try:
    transform_results()
    df = spark.read.format("delta").load(f"{S3.SILVER_PATH}/silver_results")
    years = sorted([r.year for r in df.select("year").distinct().collect()])
    total = df.count()
    msg = f"OK: silver_results {years[0]}-{years[-1]} ({len(years)}yrs), n={total}"
except Exception as e:
    import traceback
    msg = f"FAIL: {traceback.format_exc()}"

# COMMAND ----------

try:
    transform_driver_standings()
    transform_constructor_standings()
    msg2 = "standings OK"
except Exception as e:
    import traceback
    msg2 = f"standings FAIL: {traceback.format_exc()}"

# COMMAND ----------

dbutils.notebook.exit(f"{msg} | {msg2}")
