ALTER TABLE public.perfumes ADD COLUMN imagem_url text;

GRANT SELECT ON public.perfumes TO anon;
GRANT SELECT ON public.perfumes TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.perfumes TO authenticated;
GRANT ALL ON public.perfumes TO service_role;