import { z } from "zod";

/** Fonte única de verdade do quiz (steps, defaults, schema). */

export interface QuizStep {
  title: string;
  options: string[];
}

export const QUIZ_STEPS: QuizStep[] = [
  {
    title: "Qual o seu gênero de preferência?",
    options: ["Masculino", "Feminino", "Unissex"],
  },
  {
    title: "Qual família olfativa você mais gosta?",
    options: ["Cítrico", "Floral", "Amadeirado", "Oriental", "Fougere"],
  },
  {
    title: "Para qual ocasião você procura o perfume?",
    options: ["Dia a dia", "Trabalho", "Noite/Festas", "Encontros"],
  },
  {
    title: "Qual a intensidade desejada?",
    options: ["Suave", "Moderada", "Intensa/Marcante"],
  },
  {
    title: "Quais notas você prefere?",
    options: ["Baunilha", "Lavanda", "Sândalo", "Rosa", "Limão"],
  },
];

export const QUIZ_DEFAULTS: QuizAnswers = {
  genero: "Unissex",
  familia: "Floral",
  ocasiao: "Dia a dia",
  intensidade: "Moderada",
  nota: "Limão",
};

export interface QuizAnswers {
  genero: string;
  familia: string;
  ocasiao: string;
  intensidade: string;
  nota: string;
}

export const recommendationSearchSchema = z.object({
  genero: z.string().catch(QUIZ_DEFAULTS.genero),
  familia: z.string().catch(QUIZ_DEFAULTS.familia),
  ocasiao: z.string().catch(QUIZ_DEFAULTS.ocasiao),
  intensidade: z.string().catch(QUIZ_DEFAULTS.intensidade),
  nota: z.string().catch(QUIZ_DEFAULTS.nota),
});

export type RecommendationSearch = z.infer<typeof recommendationSearchSchema>;

/** Completa respostas parciais do quiz com defaults (índice -> campo). */
export function answersToSearch(answers: string[]): QuizAnswers {
  return {
    genero: answers[0] || QUIZ_DEFAULTS.genero,
    familia: answers[1] || QUIZ_DEFAULTS.familia,
    ocasiao: answers[2] || QUIZ_DEFAULTS.ocasiao,
    intensidade: answers[3] || QUIZ_DEFAULTS.intensidade,
    nota: answers[4] || QUIZ_DEFAULTS.nota,
  };
}
