export interface Faq {
  question: string;
  answer: string;
}

export const FAQS: Faq[] = [
  {
    question: "Como funciona o recomendador de perfumes?",
    answer:
      "Nosso sistema utiliza um algoritmo de similaridade que analisa as notas olfativas (saída, coração e fundo) e os acordes principais de cada fragrância para encontrar perfumes com perfis sensoriais semelhantes ao seu gosto.",
  },
  {
    question: "Os dados dos perfumes são atualizados?",
    answer:
      "Sim, baseamos nosso catálogo em dados consolidados da comunidade internacional de perfumaria, traduzidos e adaptados para o público brasileiro, abrangendo desde clássicos até os lançamentos mais recentes.",
  },
  {
    question: "O que é a pirâmide olfativa?",
    answer:
      "É a estrutura de um perfume dividida em três partes: Notas de Saída (o que você sente logo ao aplicar), Notas de Coração (a alma do perfume, que dura algumas horas) e Notas de Fundo (a base que fixa na pele por mais tempo).",
  },
  {
    question: "Posso confiar nas recomendações?",
    answer:
      "As recomendações são baseadas em dados químicos e sensoriais. Embora o gosto seja subjetivo, nosso sistema ajuda a filtrar fragrâncias que compartilham o mesmo DNA olfativo dos seus perfumes favoritos.",
  },
  {
    question: "Como encontro perfumes similares a um que já gosto?",
    answer:
      "Basta pesquisar pelo nome do perfume na barra de busca e, na página de detalhes, você encontrará a seção 'Fragrâncias Similares' com sugestões baseadas na composição.",
  },
];
