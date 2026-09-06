export type PerfumeGenero = 'masculino' | 'feminino' | 'unissex';

export interface Perfume {
  id: number;
  nome: string;
  marca: string;
  pais_origem: string | null;
  genero: PerfumeGenero;
  avaliacao: number | null;
  numero_avaliacoes: number | null;
  ano_lancamento: number | null;
  notas_saida: string[];
  notas_coracao: string[];
  notas_fundo: string[];
  acordes_principais: string[];
  perfumista_1: string | null;
  perfumista_2: string | null;
  url_fonte: string;
  cluster: number | null;
  cluster_perfil: string | null;
  top5_similares: string[];
  imagem_url: string | null;
  created_at?: string;
}
