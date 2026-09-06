-- Corrige grant permissivo: leituras públicas, escritas só via service_role.
REVOKE INSERT, UPDATE, DELETE ON public.perfumes FROM anon;
REVOKE INSERT, UPDATE, DELETE ON public.perfumes FROM authenticated;
GRANT SELECT ON public.perfumes TO anon;
GRANT SELECT ON public.perfumes TO authenticated;
GRANT ALL ON public.perfumes TO service_role;
