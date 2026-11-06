import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Perfume } from "@/types/perfume";
import { Card, CardContent } from "@/components/ui/card";
import { Star } from "lucide-react";
import { liquidColor, liquidTint } from "@/lib/utils";

interface PerfumeCardProps {
  perfume: Perfume;
}

const formatNota = (value: number) => value.toFixed(1).replace(".", ",");

export function PerfumeCard({ perfume }: PerfumeCardProps) {
  const [imgOk, setImgOk] = useState(Boolean(perfume.imagem_url));
  const liquid = liquidColor(perfume.acordes_principais ?? []);

  return (
    <Link
      to="/perfume/$id"
      params={{ id: perfume.id.toString() }}
      preload="intent"
      className="block group card-rise rounded-md"
    >
      <Card className="h-full overflow-hidden rounded-md border-0 bg-white">
        <div
          className="aspect-[3/4] relative overflow-hidden isolate"
          style={{
            backgroundColor: liquidTint(liquid),
            backgroundImage:
              "radial-gradient(circle at 50% 42%, rgb(255 255 255 / 0.65) 0%, rgb(255 255 255 / 0) 68%)",
          }}
        >
          {perfume.imagem_url && imgOk ? (
            <img
              src={perfume.imagem_url}
              alt={`${perfume.marca} ${perfume.nome}`}
              loading="lazy"
              decoding="async"
              onError={() => setImgOk(false)}
              className="absolute inset-0 w-full h-full object-contain p-5 mix-blend-multiply"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center p-6 text-center">
              <p className="txt-display text-base leading-snug text-foreground/70">
                {perfume.nome}
              </p>
            </div>
          )}
        </div>
        <CardContent className="p-4">
          <span className="text-xs text-muted-foreground block mb-0.5">{perfume.marca}</span>
          <h3 className="txt-display text-base leading-snug">{perfume.nome}</h3>
          <div className="mt-2.5 flex items-center justify-between text-sm">
            <span className="text-muted-foreground capitalize">{perfume.genero}</span>
            {perfume.avaliacao != null && (
              <span className="inline-flex items-center gap-1 font-medium">
                <Star className="w-3.5 h-3.5 fill-primary text-primary" aria-hidden="true" />
                {formatNota(perfume.avaliacao)}
              </span>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
