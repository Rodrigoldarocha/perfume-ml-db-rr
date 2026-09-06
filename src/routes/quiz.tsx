import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Layout } from "@/components/Layout";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sparkles, ArrowRight, ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { QUIZ_STEPS, answersToSearch } from "@/lib/quiz";

export const Route = createFileRoute("/quiz")({
  component: Quiz,
  head: () => ({
    title: "Descobrir | Recomendador de Perfumes Inteligente | ParfumSeg",
    meta: [
      { name: "description", content: "Responda ao nosso quiz olfativo e encontre as fragrâncias que combinam com seu estilo, ocasião e notas favoritas." },
      { property: "og:title", content: "Descobrir | Qual o Seu Perfume Ideal?" },
      { property: "og:description", content: "Encontre sua essência através do nosso recomendador inteligente." },
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

  const handleSelect = (option: string) => {
    const newAnswers = [...answers];
    newAnswers[currentStep] = option;
    setAnswers(newAnswers);

    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
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
      toast.error("Ocorreu um erro ao processar suas recomendações.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isFinished) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-24 text-center">
          <Sparkles className="w-16 h-16 text-primary mx-auto mb-8 opacity-20" />
          <h2 className="text-4xl font-serif text-primary mb-6 uppercase tracking-widest">Encontramos sua essência</h2>
          <p className="text-muted-foreground font-light mb-12 max-w-lg mx-auto">
            Baseado nas suas preferências, preparamos uma seleção exclusiva de fragrâncias para você.
          </p>
          <Button 
            onClick={handleFinish} 
            disabled={isSubmitting}
            className="rounded-none uppercase tracking-widest px-8"
          >
            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
            Ver Recomendações
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-20 max-w-2xl">
        <div className="mb-12">
          <div className="flex justify-between items-center mb-4">
             <span className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">Passo {currentStep + 1} de {steps.length}</span>
             <div
               className="w-48 h-px bg-primary/10 relative"
               role="progressbar"
               aria-valuenow={currentStep + 1}
               aria-valuemin={1}
               aria-valuemax={steps.length}
               aria-label="Progresso do quiz"
             >
               <div 
                 className="absolute left-0 top-0 h-full bg-primary transition-all duration-500" 
                 style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
               />
             </div>
          </div>
          <h2 id="quiz-step-title" aria-live="polite" className="text-3xl font-serif text-primary tracking-wide">
            {steps[currentStep]?.title}
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-4" role="group" aria-labelledby="quiz-step-title">
          {steps[currentStep]?.options.map((option) => {
            const selected = answers[currentStep] === option;
            return (
              <button
                key={option}
                onClick={() => handleSelect(option)}
                aria-current={selected || undefined}
                className={`group p-6 text-left border transition-all bg-white hover:bg-primary hover:text-primary-foreground ${selected ? "border-primary" : "border-primary/10"}`}
              >
                <div className="flex items-center justify-between">
                  <span className="uppercase tracking-widest text-sm font-light">{option}</span>
                  <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </button>
            );
          })}
        </div>

        <div className="mt-12 flex justify-start">
          {currentStep > 0 && (
            <button 
              onClick={() => setCurrentStep(currentStep - 1)}
              className="flex items-center gap-2 min-h-[44px] text-[10px] uppercase tracking-[0.2em] text-muted-foreground hover:text-primary transition-colors"
            >
              <ArrowLeft className="w-3 h-3" /> Voltar
            </button>
          )}
        </div>
      </div>
    </Layout>
  );
}
