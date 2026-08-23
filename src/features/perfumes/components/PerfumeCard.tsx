import { Link } from "@tanstack/react-router";
import { Perfume } from "@/types/perfume";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star } from "lucide-react";

interface PerfumeCardProps {
  perfume: Perfume;
}

export function PerfumeCard({ perfume }: PerfumeCardProps) {
  return (
    <Link to="/perfume/$id" params={{ id: perfume.id.toString() }} className="block group">
      <Card className="h-full overflow-hidden border-none shadow-sm transition-all hover:shadow-md bg-white">
        <div className="aspect-[3/4] bg-muted flex items-center justify-center p-6 group-hover:bg-muted/80 transition-colors relative overflow-hidden">
          {/* Imagem decorativa com lazy loading */}
          <div className="absolute inset-0 opacity-10 grayscale group-hover:grayscale-0 transition-all duration-700">
             {/* Simulação de imagem - em um cenário real usaríamos perfume.imagem_url */}
             <div className="w-full h-full bg-[radial-gradient(circle_at_center,_var(--color-primary)_0%,_transparent_70%)]" />
          </div>
          <div className="text-center">
             <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground block mb-2">{perfume.marca}</span>
             <h3 className="font-serif text-lg leading-tight group-hover:text-primary transition-colors">{perfume.nome}</h3>
          </div>
        </div>
        <CardContent className="p-4 pt-4">
          <div className="flex items-center justify-between mb-2">
            <Badge variant="outline" className="text-[10px] uppercase font-light tracking-wider rounded-none px-2 py-0 border-primary/20">
              {perfume.genero}
            </Badge>
            {perfume.avaliacao && (
              <div className="flex items-center gap-1 text-xs">
                <Star className="w-3 h-3 fill-primary text-primary" />
                <span>{perfume.avaliacao.toFixed(1)}</span>
              </div>
            )}
          </div>
          <div className="flex flex-wrap gap-1 mt-2">
            {perfume.acordes_principais.slice(0, 3).map((acorde) => (
              <span key={acorde} className="text-[10px] text-muted-foreground bg-muted/30 px-1.5 py-0.5">
                {acorde}
              </span>
            ))}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
