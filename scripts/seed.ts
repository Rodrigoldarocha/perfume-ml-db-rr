import { createClient } from "@supabase/supabase-js";

async function seed() {
  console.log("Starting seed process...");
  
  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error("Missing environment variables");
    return;
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  console.log("Seeding dummy data for demonstration purposes...");

  const perfumes = [
    {
      nome: "Bleu de Chanel",
      marca: "Chanel",
      genero: "masculino",
      avaliacao: 4.5,
      numero_avaliacoes: 15000,
      ano_lancamento: 2010,
      notas_saida: ["Limão", "Hortelã", "Pimenta Rosa", "Toranja"],
      notas_coracao: ["Gengibre", "Iso E Super", "Jasmim", "Noz-moscada"],
      notas_fundo: ["Lábdano", "Sândalo", "Patchouli", "Vetiver", "Incenso", "Cedro", "Almíscar Branco"],
      acordes_principais: ["Cítrico", "Amadeirado", "Especiado Quente", "Aromático", "Âmbar"],
      perfumista_1: "Jacques Polge",
      url_fonte: "https://www.fragrantica.com/perfume/Chanel/Bleu-de-Chanel-9050.html",
      cluster: 1,
      cluster_perfil: "Amadeirado Aromático",
      top5_similares: ["Sauvage", "Acqua di Gio Profumo"]
    },
    {
      nome: "J'adore",
      marca: "Dior",
      genero: "feminino",
      avaliacao: 4.2,
      numero_avaliacoes: 12000,
      ano_lancamento: 1999,
      notas_saida: ["Pêra", "Melão", "Magnólia", "Pêssego", "Mandarina", "Bergamota"],
      notas_coracao: ["Jasmim", "Lírio-do-vale", "Tuberosa", "Freesia", "Rosa", "Orquídea", "Ameixa", "Violeta"],
      notas_fundo: ["Almíscar", "Baunilha", "Amora", "Cedro"],
      acordes_principais: ["Floral", "Frutado", "Doce", "Fresco"],
      perfumista_1: "Calice Becker",
      url_fonte: "https://www.fragrantica.com/perfume/Dior/J-adore-210.html",
      cluster: 2,
      cluster_perfil: "Floral Frutado",
      top5_similares: ["Miss Dior", "Chanel No 5"]
    }
  ];

  const { error } = await supabase.from("perfumes").upsert(perfumes, { onConflict: 'nome,marca' });

  if (error) {
    console.error("Error seeding data:", error);
  } else {
    console.log("Seed completed successfully!");
  }
}

seed();
