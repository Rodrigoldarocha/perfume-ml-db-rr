#!/usr/bin/env python3
"""Envia o CSV processado para o banco (PostgREST, service role)."""
import csv, json, os, re, sys, time
import requests

CSV_PATH = sys.argv[1] if len(sys.argv) > 1 else "/tmp/perfumes_processed.csv"
DRY_RUN = "--dry-run" in sys.argv
try:
    URL = os.environ["SUPABASE_URL"].rstrip("/") + "/rest/v1/perfumes?on_conflict=nome,marca"
    KEY = os.environ["SUPABASE_SERVICE_ROLE_KEY"]
except KeyError as e:
    sys.exit(f"Missing env {e}. Exporte SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY.")
H = {"apikey": KEY, "Authorization": f"Bearer {KEY}", "Content-Type": "application/json"}

ARR = re.compile(r'"((?:[^"\\]|\\.)*)"')


def parse_arr(s):
    return [m.group(1).replace('\\"', '"').replace("\\\\", "\\") for m in ARR.finditer(s or "")]


def num(v, cast):
    try:
        return cast(v)
    except (TypeError, ValueError):
        return None


rows = []
with open(CSV_PATH, encoding="utf-8") as f:
    for r in csv.DictReader(f):
        rows.append({
            "nome": r["nome"], "marca": r["marca"],
            "pais_origem": r["pais_origem"] or None, "genero": r["genero"],
            "avaliacao": num(r["avaliacao"], float),
            "numero_avaliacoes": num(r["numero_avaliacoes"], int),
            "ano_lancamento": num(r["ano_lancamento"], int),
            "notas_saida": parse_arr(r["notas_saida"]),
            "notas_coracao": parse_arr(r["notas_coracao"]),
            "notas_fundo": parse_arr(r["notas_fundo"]),
            "acordes_principais": parse_arr(r["acordes_principais"]),
            "perfumista_1": r["perfumista_1"] or None,
            "perfumista_2": r["perfumista_2"] or None,
            "url_fonte": r["url_fonte"],
            "cluster": num(r["cluster"], int), "cluster_perfil": r["cluster_perfil"],
            "top5_similares": parse_arr(r["top5_similares"]),
        })
print(f"{len(rows)} linhas prontas")
if DRY_RUN:
    print("dry-run: nada enviado. Remova --dry-run para aplicar upsert.")
    sys.exit(0)

# Sem DELETE full-table: upsert idempotente via on_conflict=nome,marca.
# Para troca atômica, cargar em tabela staging e depois rename — fora desse script simples.

CH = 500
for i in range(0, len(rows), CH):
    chunk = rows[i:i + CH]
    for attempt in range(3):
        resp = requests.post(URL, headers={**H, "Prefer": "resolution=merge-duplicates,return=minimal"},
                             data=json.dumps(chunk), timeout=180)
        if resp.status_code < 300:
            break
        print(f"  retry {attempt+1} ({resp.status_code}): {resp.text[:200]}")
        time.sleep(2)
    else:
        sys.exit(f"Falha no chunk {i}")
    print(f"  {min(i+CH, len(rows))}/{len(rows)}")
print("Upload concluído.")
