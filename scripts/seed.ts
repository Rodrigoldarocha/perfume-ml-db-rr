import { createClient } from "@supabase/supabase-js";
import { kmeans } from "ml-kmeans";
import * as fs from "fs";
import * as path from "path";

// Simple TF-IDF implementation since 'natural' was incompatible
class SimpleTfIdf {
  documents: string[][] = [];
  idfCache: Record<string, number> = {};

  addDocument(text: string) {
    this.documents.push(text.toLowerCase().split(/\s+/).filter(w => w.length > 2));
  }

  getTf(docIndex: number, term: string): number {
    const doc = this.documents[docIndex];
    if (!doc) return 0;
    const count = doc.filter(t => t === term).length;
    return count / doc.length;
  }

  getIdf(term: string): number {
    if (this.idfCache[term] !== undefined) return this.idfCache[term];
    const docsWithTerm = this.documents.filter(doc => doc.includes(term)).length;
    const idf = Math.log(this.documents.length / (1 + docsWithTerm));
    this.idfCache[term] = idf;
    return idf;
  }

  getTfIdf(docIndex: number, term: string): number {
    return this.getTf(docIndex, term) * this.getIdf(term);
  }

  listTerms(docIndex: number) {
    const doc = this.documents[docIndex];
    const uniqueTerms = Array.from(new Set(doc));
    return uniqueTerms.map(term => ({
      term,
      tfidf: this.getTfIdf(docIndex, term)
    }));
  }
}

const tfidf = new SimpleTfIdf();

async function seed() {
  console.log("Starting full seed process...");
  
  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error("Missing environment variables VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  // 1. Locate dataset
  const datasetPaths = [
    "/mnt/user-uploads/perfumes_ptbr.json",
    "/tmp/user-uploads/perfumes_ptbr.json",
    "./perfumes_ptbr.json"
  ];
  
  let datasetPath = "";
  for (const p of datasetPaths) {
    if (fs.existsSync(p)) {
      datasetPath = p;
      break;
    }
  }

  if (!datasetPath) {
    console.error("Dataset perfumes_ptbr.json not found in expected locations.");
    // Fallback to dummy for now if we really can't find it, but the user says "o dataset do projeto é esse"
    // so it MUST be there or arriving.
    process.exit(1);
  }

  console.log(`Reading dataset from ${datasetPath}...`);
  const rawData = fs.readFileSync(datasetPath, 'utf8');
  let perfumes = JSON.parse(rawData);

  console.log(`Processing ${perfumes.length} perfumes...`);

  // 2. Vectorization for Clustering and Similarity
  console.log("Vectorizing perfumes...");
  
  // Combine all relevant textual data for each perfume
  const documents = perfumes.map((p: any) => {
    const text = [
      ...(p.notas_saida || []),
      ...(p.notas_coracao || []),
      ...(p.notas_fundo || []),
      ...(p.acordes_principais || [])
    ].join(" ");
    tfidf.addDocument(text);
    return text;
  });

  // Get all unique terms to build the vector space
  const allTerms = new Set<string>();
  perfumes.forEach((p: any) => {
    [
      ...(p.notas_saida || []),
      ...(p.notas_coracao || []),
      ...(p.notas_fundo || []),
      ...(p.acordes_principais || [])
    ].forEach(term => allTerms.add(term.toLowerCase()));
  });
  const termsArray = Array.from(allTerms);

  // Create vectors
  const vectors = perfumes.map((p: any, i: number) => {
    const vector = new Array(termsArray.length).fill(0);
    const docTerms = tfidf.listTerms(i);
    docTerms.forEach(t => {
      const index = termsArray.indexOf(t.term.toLowerCase());
      if (index !== -1) {
        vector[index] = t.tfidf;
      }
    });
    return vector;
  });

  // 3. Clustering (k-means)
  const k = perfumes.length > 0 ? Math.min(12, perfumes.length) : 1;
  console.log(`Running K-Means clustering (k=${k})...`);
  const result = kmeans(vectors, k, { seed: 42 });
  const clusters = result.clusters;

  // 4. Similarity (Cosine Similarity for Top 5)
  console.log("Calculating Top 5 similarities...");
  function cosineSimilarity(vecA: number[], vecB: number[]) {
    let dotProduct = 0;
    let mA = 0;
    let mB = 0;
    for (let i = 0; i < vecA.length; i++) {
      dotProduct += vecA[i] * vecB[i];
      mA += vecA[i] * vecA[i];
      mB += vecB[i] * vecB[i];
    }
    mA = Math.sqrt(mA);
    mB = Math.sqrt(mB);
    if ((mA * mB) === 0) return 0;
    return dotProduct / (mA * mB);
  }

  // Assign clusters and find similarities
  perfumes = perfumes.map((p: any, i: number) => {
    const cluster = clusters[i];
    
    // Find top 5 similar perfumes (excluding self)
    const similarities = perfumes
      .map((other: any, j: number) => ({
        nome: other.nome,
        similarity: i === j ? -1 : cosineSimilarity(vectors[i], vectors[j])
      }))
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, 5)
      .map(s => s.nome);

    return {
      ...p,
      cluster,
      top5_similares: similarities
    };
  });

  // 5. Cluster Profiles
  console.log("Generating cluster profiles...");
  const clusterProfiles: Record<number, string> = {};
  for (let c = 0; c < k; c++) {
    const clusterPerfumes = perfumes.filter((p: any) => p.cluster === c);
    const accordCounts: Record<string, number> = {};
    clusterPerfumes.forEach((p: any) => {
      p.acordes_principais.forEach((a: string) => {
        accordCounts[a] = (accordCounts[a] || 0) + 1;
      });
    });
    const topAccords = Object.entries(accordCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 2)
      .map(e => e[0]);
    clusterProfiles[c] = topAccords.join(" ") || "Fragrância Única";
  }

  perfumes = perfumes.map((p: any) => ({
    ...p,
    cluster_perfil: clusterProfiles[p.cluster]
  }));

  // 6. Bulk Upsert to Supabase
  console.log("Uploading to Supabase in chunks...");
  const chunkSize = 500;
  for (let i = 0; i < perfumes.length; i += chunkSize) {
    const chunk = perfumes.slice(i, i + chunkSize);
    const { error } = await supabase.from("perfumes").upsert(chunk, { onConflict: 'nome,marca' });
    if (error) {
      console.error(`Error seeding chunk ${i}-${i + chunkSize}:`, error);
    } else {
      console.log(`Uploaded chunk ${i}-${i + chunkSize}`);
    }
  }

  console.log("Seed completed successfully!");
}

seed().catch(err => {
  console.error("Fatal error in seed script:", err);
  process.exit(1);
});