import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env['SUPABASE_URL']!;
const SUPABASE_SERVICE_ROLE_KEY = process.env['SUPABASE_SERVICE_ROLE_KEY']!;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function run() {
    const data = {
        genero: "Feminino",
        familia: "Floral",
        ocasiao: "Noite/Festas",
        intensidade: "Intensa/Marcante",
        nota: "Rosa"
    };

    const targetGenero = data.genero.toLowerCase();
    let query = supabase.from("perfumes").select("*");
    
    if (targetGenero !== 'unissex') {
      query = query.in("genero", [targetGenero, 'unissex']);
    } else {
      query = query.eq("genero", 'unissex');
    }

    const { data: candidates, error } = await query.limit(100);
    if (error) {
        console.error("ERROR:", error);
        return;
    }
    
    console.log(`Candidates found: ${candidates?.length || 0}`);

    const targetFamilia = data.familia.toLowerCase();
    const targetNota = data.nota.toLowerCase();
    
    const mapping: Record<string, string[]> = {
      'cítrico': ['cítrico', 'aromático', 'aquático', 'fresco'],
      'floral': ['floral', 'rosa', 'flores brancas', 'íris', 'violeta'],
      'amadeirado': ['amadeirado', 'terroso', 'musgo', 'patchouli'],
      'oriental': ['oriental', 'baunilha', 'doce', 'especiado', 'âmbar'],
      'fougere': ['lavanda', 'aromático', 'verde', 'musgo']
    };
    const familyTerms = mapping[targetFamilia] || [targetFamilia];

    const scoredPerfumes = candidates.map(perfume => {
      let score = 0;
      const acordes = (perfume.acordes_principais || []).map(a => a.toLowerCase());
      if (acordes.some(a => familyTerms.includes(a))) {
        score += 0.5;
      }

      const todasNotas = [
        ...(perfume.notas_saida || []),
        ...(perfume.notas_coracao || []),
        ...(perfume.notas_fundo || [])
      ].map(n => n.toLowerCase());

      if (todasNotas.some(n => n.includes(targetNota) || targetNota.includes(n))) {
        score += 0.3;
      }
      score += (perfume.avaliacao || 0) / 10;
      return { id: perfume.id, nome: perfume.nome, score };
    });

    const threshold = 0.3;
    let finalResults = scoredPerfumes
      .filter(p => p.score >= threshold)
      .sort((a, b) => b.score - a.score);

    console.log(`Results above threshold: ${finalResults.length}`);
    if (finalResults.length > 0) {
        console.log("Top sample:", finalResults[0]);
    }
}

run();
