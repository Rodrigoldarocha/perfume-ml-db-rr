import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Layout } from "@/components/Layout";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { QUIZ_STEPS, answersToSearch } from "@/lib/quiz";

export const Route = createFileRoute("/quiz")({
  component: Quiz,
  head: () => ({
    title: "Descobrir | Recomendador de Perfumes | ParfumSeg",
    meta: [
      { name: "description", content: "Responda ao quiz e encontre perfumes que combinam com seu estilo, ocasião e notas favoritas." },
      { property: "og:title", content: "Descobrir | Qual perfume combina com você?" },
      { property: "og:description", content: "Recomendações de perfumes baseadas nas suas preferências." },
      { property: "og:type", content: "website" }
    ]
  }),
});

function Quiz() {
  const steps = QUIZ_STEPS;
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [isFinished, setIsFinished] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const [multiSel, setMultiSel] = useState<string[]>([]);
  const step = steps[currentStep];
  const maxMulti = step?.multi ?? 1;

  const toggleMulti = (option: string) => {
    setMultiSel((cur) =>
      cur.includes(option)
        ? cur.filter((o) => o !== option)
        : cur.length < maxMulti
          ? [...cur, option]
          : cur,
    );
  };

  const handleSelect = (option: string) => {
    const newAnswers = [...answers];
    newAnswers[currentStep] = option;
    setAnswers(newAnswers);

    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
      setMultiSel([]);
    } else {
      setIsFinished(true);
    }
  };

  const handleFinish = async () => {
    setIsSubmitting(true);
    try {
      await navigate({
        to: "/recomendacoes",
        search: answersToSearch(answers),
      });
    } catch (error) {
      console.error(error);
      toast.error("Não foi possível montar as recomendações. Tente de novo.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isFinished) {
    return (
      <Layout>
        <div className="mx-auto w-full max-w-[620px] px-4 py-20 text-center">
          <h2 className="text-3xl txt-display">Recomendações prontas</h2>
          <p className="mt-3 text-muted-foreground">
            Usamos suas respostas para montar uma lista de perfumes com a sua cara.
          </p>
          <Button onClick={handleFinish} disabled={isSubmitting} className="mt-8 px-6">
            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" aria-hidden="true" /> : null}
            Ver recomendações
          </Button>
        </div>
      </Layout>
    );
  }

  const subtexts = step?.subtexts;
  const isMulti = maxMulti > 1;
  const manyOptions = (step?.options.length ?? 0) > 6;

  return (
    <Layout>
      <div className="mx-auto w-full max-w-[620px] px-4 py-14">
        <div
          className="flex gap-1.5 mb-8"
          role="progressbar"
          aria-valuenow={currentStep + 1}
          aria-valuemin={1}
          aria-valuemax={steps.length}
          aria-label="Progresso do quiz"
        >
          {steps.map((s, i) => (
            <span
              key={s.title}
              className={`h-1.5 flex-1 rounded-md ${
                i < currentStep ? "bg-primary" : i === currentStep ? "bg-primary/40" : "bg-black/10"
              }`}
            />
          ))}
        </div>

        <h1 id="quiz-step-title" aria-live="polite" className="text-[36px] leading-[1.15] txt-display mb-8">
          {step?.title}
        </h1>

        <div
          className={isMulti || manyOptions ? "grid grid-cols-2 sm:grid-cols-3 gap-3" : "flex flex-col gap-3"}
          role="group"
          aria-labelledby="quiz-step-title"
        >
          {step?.options.map((option) => {
            const selected = isMulti ? multiSel.includes(option) : answers[currentStep] === option;
            const sub = subtexts?.[option];
            return (
              <button
                key={option}
                type="button"
                onClick={() => (isMulti ? toggleMulti(option) : handleSelect(option))}
                aria-pressed={isMulti ? selected : undefined}
                aria-current={selected && !isMulti ? "true" : undefined}
                className={`w-full rounded-md border bg-white p-4 sm:p-5 text-left transition-colors ${
                  selected
                    ? "border-primary bg-primary/[0.06]"
                    : "border-border hover:border-primary/50 hover:bg-primary/[0.03]"
                }`}
              >
                <span className={`block ${isMulti ? "text-sm" : "text-base"} font-medium`}>
                  {option}
                </span>
                {sub && <span className="mt-0.5 block text-sm text-muted-foreground">{sub}</span>}
              </button>
            );
          })}
        </div>

        {isMulti && (
          <div className="mt-8 flex justify-end">
            <Button
              disabled={multiSel.length === 0}
              onClick={() => handleSelect(multiSel.join(", "))}
              className="px-6"
            >
              Continuar ({multiSel.length}/{maxMulti})
            </Button>
          </div>
        )}

        <div className="mt-10">
          {currentStep > 0 && (
            <button
              type="button"
              onClick={() => {
                setCurrentStep(currentStep - 1);
                setMultiSel([]);
              }}
              className="inline-flex items-center gap-2 min-h-[44px] text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-4 h-4" aria-hidden="true" /> Voltar
            </button>
          )}
        </div>
      </div>
    </Layout>
  );
}
