import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Perfume } from "@/types/perfume";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star } from "lucide-react";

interface PerfumeCardProps {
  perfume: Perfume;
}

export function PerfumeCard({ perfume }: PerfumeCardProps) {
  const [imgOk, setImgOk] = useState(Boolean(perfume.imagem_url));

  return (
    <Link to="/perfume/$id" params={{ id: perfume.id.toString() }} className="block group">
      <Card className="h-full overflow-hidden border-none shadow-sm transition-all hover:shadow-md bg-white">
        <div className="aspect-[3/4] bg-muted flex items-center justify-center relative overflow-hidden">
          {/* Foto real do frasco com lazy loading, ou degradê decorativo como fallback */}
          {perfume.imagem_url && imgOk ? (
            <img
              src={perfume.imagem_url}
              alt={`${perfume.marca} ${perfume.nome}`}
              loading="lazy"
              decoding="async"
              onError={() => setImgOk(false)}
              className="absolute inset-0 w-full h-full object-contain p-6 group-hover:scale-[1.03] transition-transform duration-700"
            />
          ) : (
            <div className="absolute inset-0 opacity-10 grayscale group-hover:grayscale-0 transition-all duration-700">
              <div className="w-full h-full bg-[radial-gradient(circle_at_center,_var(--color-primary)_0%,_transparent_70%)]" />
            </div>
          )}
          <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/55 via-black/15 to-transparent text-center">
            <span className="text-[10px] uppercase tracking-[0.2em] text-white/80 block mb-1">{perfume.marca}</span>
            <h3 className="font-serif text-lg leading-tight text-white group-hover:text-white transition-colors">{perfume.nome}</h3>
          </div>
        </div>
        <CardContent className="p-4 pt-4">
          <div className="flex items-center justify-between mb-2">
            <Badge variant="outline" className="text-[10px] uppercase font-light tracking-wider rounded-none px-2 py-0 border-primary/20">
              {perfume.genero}
            </Badge>
            {perfume.avaliacao != null && (
              <div className="flex items-center gap-1 text-xs">
                <Star className="w-3 h-3 fill-primary text-primary" />
                <span>{perfume.avaliacao.toFixed(1)}</span>
              </div>
            )}
          </div>
          <div className="flex flex-wrap gap-1 mt-2">
            {(perfume.acordes_principais ?? []).slice(0, 3).map((acorde, i) => (
              <span key={`${acorde}-${i}`} className="text-[10px] text-muted-foreground bg-muted/30 px-1.5 py-0.5">
                {acorde}
              </span>
            ))}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
