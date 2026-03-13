# Databricks notebook source
# =============================================================================
# Apex F1 — 팀 상세 시드 데이터 → Supabase 적재
# =============================================================================

# MAGIC %run ../config

# COMMAND ----------

# 2024 시즌 팀 상세 데이터
# team_name은 constructor_standings 테이블의 constructor_name과 매칭됨
team_details_data = [
    {
        "team_name": "Red Bull Racing",
        "full_name": "Oracle Red Bull Racing",
        "base_city": "Milton Keynes",
        "base_country": "United Kingdom",
        "founded_year": 2005,
        "engine_supplier": "Honda RBPT",
        "team_principal": "Christian Horner",
        "world_championships": 6,
    },
    {
        "team_name": "Ferrari",
        "full_name": "Scuderia Ferrari",
        "base_city": "Maranello",
        "base_country": "Italy",
        "founded_year": 1950,
        "engine_supplier": "Ferrari",
        "team_principal": "Frédéric Vasseur",
        "world_championships": 16,
    },
    {
        "team_name": "McLaren",
        "full_name": "McLaren Formula 1 Team",
        "base_city": "Woking",
        "base_country": "United Kingdom",
        "founded_year": 1966,
        "engine_supplier": "Mercedes",
        "team_principal": "Andrea Stella",
        "world_championships": 8,
    },
    {
        "team_name": "Mercedes",
        "full_name": "Mercedes-AMG PETRONAS F1 Team",
        "base_city": "Brackley",
        "base_country": "United Kingdom",
        "founded_year": 2010,
        "engine_supplier": "Mercedes",
        "team_principal": "Toto Wolff",
        "world_championships": 8,
    },
    {
        "team_name": "Aston Martin",
        "full_name": "Aston Martin Aramco F1 Team",
        "base_city": "Silverstone",
        "base_country": "United Kingdom",
        "founded_year": 2021,
        "engine_supplier": "Mercedes",
        "team_principal": "Mike Krack",
        "world_championships": 0,
    },
    {
        "team_name": "RB",
        "full_name": "Visa Cash App RB F1 Team",
        "base_city": "Faenza",
        "base_country": "Italy",
        "founded_year": 2006,
        "engine_supplier": "Honda RBPT",
        "team_principal": "Laurent Mekies",
        "world_championships": 0,
    },
    {
        "team_name": "Haas F1 Team",
        "full_name": "MoneyGram Haas F1 Team",
        "base_city": "Kannapolis",
        "base_country": "United States",
        "founded_year": 2016,
        "engine_supplier": "Ferrari",
        "team_principal": "Ayao Komatsu",
        "world_championships": 0,
    },
    {
        "team_name": "Alpine",
        "full_name": "BWT Alpine F1 Team",
        "base_city": "Enstone",
        "base_country": "United Kingdom",
        "founded_year": 2021,
        "engine_supplier": "Renault",
        "team_principal": "Bruno Famin",
        "world_championships": 0,
    },
    {
        "team_name": "Williams",
        "full_name": "Williams Racing",
        "base_city": "Grove",
        "base_country": "United Kingdom",
        "founded_year": 1977,
        "engine_supplier": "Mercedes",
        "team_principal": "James Vowles",
        "world_championships": 9,
    },
    {
        "team_name": "Sauber",
        "full_name": "Stake F1 Team Kick Sauber",
        "base_city": "Hinwil",
        "base_country": "Switzerland",
        "founded_year": 1993,
        "engine_supplier": "Ferrari",
        "team_principal": "Alessandro Alunni Bravi",
        "world_championships": 0,
    },
]

# COMMAND ----------

for t in team_details_data:
    cols = ", ".join(t.keys())
    vals = []
    for v in t.values():
        if v is None:
            vals.append("NULL")
        elif isinstance(v, str):
            escaped = v.replace("'", "''")
            vals.append(f"'{escaped}'")
        else:
            vals.append(str(v))
    vals_str = ", ".join(vals)
    print(f"INSERT INTO team_details ({cols}) VALUES ({vals_str}) ON CONFLICT (team_name) DO UPDATE SET full_name = EXCLUDED.full_name, engine_supplier = EXCLUDED.engine_supplier, team_principal = EXCLUDED.team_principal, world_championships = EXCLUDED.world_championships;")

print(f"\n-- Total: {len(team_details_data)} teams inserted/updated")
