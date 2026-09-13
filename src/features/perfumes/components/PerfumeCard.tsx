import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Perfume } from "@/types/perfume";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star } from "lucide-react";

interface PerfumeCardProps {
  perfume: Perfume;
}

export function PerfumeCard({ perfume }: PerfumeCardProps) {
  const [imgOk, setImgOk] = useState(Boolean(perfume.imagem_url));

  return (
    <Link to="/perfume/$id" params={{ id: perfume.id.toString() }} preload="intent" className="block group">
      <Card className="h-full overflow-hidden border-0 rounded-2xl bg-background/50 transition-all hover:bg-background/60 group-hover:shadow-xl transition-shadow">
        <div className="aspect-[3/4] bg-muted relative overflow-hidden">
          {/* Foto real do frasco com lazy loading, ou degradê decorativo como fallback */}
          {perfume.imagem_url && imgOk ? (
            <img
              src={perfume.imagem_url}
              alt={`${perfume.marca} ${perfume.nome}`}
              loading="lazy"
              decoding="async"
              onError={() => setImgOk(false)}
              className="absolute inset-0 w-full h-full object-cover group-hover:opacity-95 transition-opacity duration-500"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center p-6">
              <div className="text-center">
                <span className="text-4xl font-display text-primary/60">💫</span>
                <p className="txt-body mt-2 text-primary/40">Fragrância</p>
              </div>
            </div>
          )}
          <div className="absolute inset-x-0 bottom-0 left-0 right-0 p-4">
            <div className="flex items-end justify-between">
              <span className="txt-body text-[10px] uppercase tracking-[0.15em] text-primary/60 block mb-1">{perfume.marca}</span>
              <h3 className="txt-display font-serif text-lg leading-tight">{perfume.nome}</h3>
            </div>
          </div>
        </div>
        <CardContent className="p-4 pt-0">
          <div className="flex items-center justify-between mb-3">
            {perfume.avaliacao != null && (
              <div className="flex items-center gap-1">
                <Star className="w-3 h-3 fill-primary text-primary" />
                <span className="txt-body-sm">{perfume.avaliacao.toFixed(1)}</span>
              </div>
            )}
            <div className="flex items-center gap-2">
              {(perfume.acordes_principais ?? []).slice(0, 2).map((acorde: string, i: number) => (
                <Badge
                  key={i}
                  variant="outline"
                  className="txt-body text-[9px] uppercase font-light tracking-wider rounded-none border-transparent hover:border-primary/30 hover:text-primary transition-colors px-2 py-0.5"
                >
                  {acorde}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
