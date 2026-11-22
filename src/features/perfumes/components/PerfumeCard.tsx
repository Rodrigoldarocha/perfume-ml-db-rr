import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Perfume } from "@/types/perfume";
import { Card, CardContent } from "@/components/ui/card";
import { Star } from "lucide-react";
import { liquidColor, liquidTint, formatNota } from "@/lib/utils";
import { PerfumeBottlePlaceholder } from "./PerfumeBottlePlaceholder";

interface PerfumeCardProps {
  perfume: Perfume;
}

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
      <Card className="h-full overflow-hidden rounded-md border-0 bg-card shadow-none">
        <div
          className="aspect-[3/4] relative overflow-hidden isolate"
          style={{ backgroundColor: liquidTint(liquid) }}
        >
          {perfume.imagem_url && imgOk ? (
            <img
              src={perfume.imagem_url}
              alt={`${perfume.marca} ${perfume.nome}`}
              loading="lazy"
              decoding="async"
              ref={(el) => {
                if (el && el.complete && el.naturalWidth === 0) setImgOk(false);
              }}
              onError={() => setImgOk(false)}
              className="absolute inset-0 w-full h-full object-contain p-5 mix-blend-multiply"
            />
          ) : (
            <PerfumeBottlePlaceholder liquid={liquid} marca={perfume.marca} />
          )}
        </div>
        <CardContent className="p-3">
          <span className="text-xs text-muted-foreground block mb-0.5">{perfume.marca}</span>
          <h3 className="txt-display text-base leading-snug">{perfume.nome}</h3>
          <div className="mt-1.5 flex flex-wrap items-center gap-1.5 text-xs">
            <span className="text-muted-foreground capitalize">{perfume.genero}</span>
            {perfume.acordes_principais?.slice(0, 3).map((acorde) => (
              <span
                key={acorde}
                className="rounded-md border border-border bg-background px-1.5 py-0.5 text-[11px] text-foreground/80"
              >
                {acorde}
              </span>
            ))}
            {perfume.avaliacao != null && (
              <span className="ml-auto inline-flex items-center gap-1 font-medium">
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