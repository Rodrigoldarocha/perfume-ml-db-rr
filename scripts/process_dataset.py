#!/usr/bin/env python3
"""
ParfumSeg — processamento completo do dataset perfumes_ptbr.json
1. TF-IDF sobre notas olfativas + acordes
2. Clustering K-Means (k=12) -> cluster + cluster_perfil
3. Similaridade de cosseno -> top5_similares
4. Exporta CSV pronto para COPY no Postgres
"""
import json, csv, re, sys, unicodedata
import numpy as np
from scipy.sparse import csr_matrix
from collections import Counter

SRC = sys.argv[1] if len(sys.argv) > 1 else "/mnt/user-uploads/perfumes_ptbr.json"
OUT = sys.argv[2] if len(sys.argv) > 2 else "/tmp/perfumes_processed.csv"
K_FIXED = 12
SEED = 42

MINOR = {"de", "da", "do", "das", "dos", "e", "of", "the", "la", "le", "du", "des", "von", "van", "y", "el"}


def titulo(s):
    if not s:
        return None
    s = s.replace("-", " ").replace("_", " ").strip()
    s = re.sub(r"\s+", " ", s)
    parts = []
    for i, w in enumerate(s.split(" ")):
        if i > 0 and w.lower() in MINOR:
            parts.append(w.lower())
        elif len(w) <= 3 and w.isalpha() and w.isupper():
            parts.append(w)
        else:
            parts.append(w[:1].upper() + w[1:])
    return " ".join(parts)


print("Lendo dataset…")
data = json.load(open(SRC, encoding="utf-8"))
n = len(data)
print(f"{n} perfumes carregados")
if n == 0:
    sys.exit("Dataset vazio. Nada a processar.")
K = min(K_FIXED, n)

# ---------- 1. TF-IDF ----------
print("Vetorizando (TF-IDF)…")


def tokens(p):
    toks = []
    for field, w in (("notas_saida", 1), ("notas_coracao", 2), ("notas_fundo", 2), ("acordes_principais", 3)):
        for t in (p.get(field) or []):
            t = unicodedata.normalize("NFKD", str(t).lower().strip())
            t = "".join(c for c in t if not unicodedata.combining(c))
            t = re.sub(r"\s+", "_", t)
            if t:
                toks.extend([f"{field[:2]}:{t}"] * w)
    return toks


vocab = {}
indptr = [0]
indices = []
values = []
for p in data:
    counts = Counter(tokens(p))
    total = sum(counts.values()) or 1
    for term, c in counts.items():
        j = vocab.setdefault(term, len(vocab))
        indices.append(j)
        values.append(c / total)
    indptr.append(len(indices))

X = csr_matrix((np.array(values, dtype=np.float32), np.array(indices), np.array(indptr)), shape=(n, len(vocab)))
print(f"Vocabulário: {len(vocab)} termos")

df = np.bincount(X.indices, minlength=len(vocab)).astype(np.float32)
idf = np.log((1 + n) / (1 + df)).astype(np.float32) + 1.0
X = X.multiply(idf).tocsr().astype(np.float32)
norms = np.sqrt(X.multiply(X).sum(axis=1)).A.ravel()
norms[norms == 0] = 1.0
X = csr_matrix(X.multiply(1.0 / norms[:, None])).astype(np.float32)

# ---------- 2. K-Means (esférico, cosseno) ----------
print(f"Rodando K-Means (k={K})…")
rng = np.random.default_rng(SEED)
centroids = np.asarray(X[rng.choice(n, K, replace=False)].todense(), dtype=np.float32)
labels = np.zeros(n, dtype=np.int32)
for it in range(25):
    sims = X @ centroids.T           # (n, K)
    new_labels = np.asarray(sims).argmax(axis=1).astype(np.int32)
    shifted = int((new_labels != labels).sum())
    labels = new_labels
    for c in range(K):
        mask = labels == c
        if mask.sum() == 0:
            centroids[c] = np.asarray(X[rng.integers(n)].todense(), dtype=np.float32).ravel()
            continue
        cen = np.asarray(X[mask].mean(axis=0), dtype=np.float32).ravel()
        nrm = np.linalg.norm(cen) or 1.0
        centroids[c] = cen / nrm
    print(f"  iter {it + 1}: {shifted} realocados")
    if shifted == 0:
        break

# ---------- 3. Perfis de cluster ----------
print("Gerando perfis de cluster…")
perfis = {}
for c in range(K):
    counter = Counter()
    for i in np.flatnonzero(labels == c):
        for a in (data[i].get("acordes_principais") or []):
            counter[str(a).strip().lower()] += 1
    top = [t for t, _ in counter.most_common(3)]
    perfis[c] = " · ".join(titulo(t) for t in top) if top else "Perfil Único"
    print(f"  Cluster {c}: {perfis[c]} ({int((labels == c).sum())} perfumes)")

# ---------- 4. Similaridade Top 5 ----------
print("Calculando similaridade (Top 5) por cosseno…")
nomes = [titulo(p["nome"]) for p in data]
Xt = X.T.tocsr()
top5 = [None] * n
CH = 512
for start in range(0, n, CH):
    end = min(start + CH, n)
    S = np.asarray((X[start:end] @ Xt).todense(), dtype=np.float32)
    for r in range(end - start):
        i = start + r
        S[r, i] = -1.0
        idx = np.argpartition(-S[r], 6)[:6]
        idx = idx[np.argsort(-S[r][idx])][:5]
        top5[i] = [nomes[j] for j in idx if S[r][j] > 0]
    if (start // CH) % 10 == 0:
        print(f"  {end}/{n}")

# ---------- 5. Export CSV ----------
print("Exportando CSV…")


def pgarray(items):
    out = []
    for it in items or []:
        s = titulo(str(it))
        if s:
            out.append('"' + s.replace("\\", "\\\\").replace('"', '\\"') + '"')
    return "{" + ",".join(out) + "}"


GEN = {"masculino", "feminino", "unissex"}
seen = set()
rows = 0
with open(OUT, "w", newline="", encoding="utf-8") as f:
    w = csv.writer(f)
    w.writerow(["nome", "marca", "pais_origem", "genero", "avaliacao", "numero_avaliacoes",
                "ano_lancamento", "notas_saida", "notas_coracao", "notas_fundo",
                "acordes_principais", "perfumista_1", "perfumista_2", "url_fonte",
                "cluster", "cluster_perfil", "top5_similares"])
    for i, p in enumerate(data):
        nome, marca = nomes[i], titulo(p.get("marca"))
        if not nome or not marca:
            continue
        key = (nome.lower(), marca.lower())
        if key in seen:
            continue
        seen.add(key)
        genero = str(p.get("genero") or "unissex").lower()
        if genero not in GEN:
            genero = "unissex"
        w.writerow([
            nome, marca, p.get("pais_origem") or "", genero,
            p.get("avaliacao") if p.get("avaliacao") is not None else "",
            p.get("numero_avaliacoes") if p.get("numero_avaliacoes") is not None else "",
            p.get("ano_lancamento") if p.get("ano_lancamento") is not None else "",
            pgarray(p.get("notas_saida")), pgarray(p.get("notas_coracao")),
            pgarray(p.get("notas_fundo")), pgarray(p.get("acordes_principais")),
            titulo(p.get("perfumista_1")) or "", titulo(p.get("perfumista_2")) or "",
            p.get("url_fonte") or "",
            int(labels[i]), perfis[int(labels[i])],
            "{" + ",".join('"' + s.replace('"', '\\"') + '"' for s in (top5[i] or [])) + "}",
        ])
        rows += 1
print(f"OK: {rows} linhas em {OUT}")
