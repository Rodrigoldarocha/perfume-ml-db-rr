create type public.perfume_genero as enum ('masculino', 'feminino', 'unissex');

create table public.perfumes (
    id serial primary key,
    nome text not null,
    marca text not null,
    pais_origem text,
    genero public.perfume_genero not null,
    avaliacao numeric,
    numero_avaliacoes integer,
    ano_lancamento integer,
    notas_saida text[] not null default '{}',
    notas_coracao text[] not null default '{}',
    notas_fundo text[] not null default '{}',
    acordes_principais text[] not null default '{}',
    perfumista_1 text,
    perfumista_2 text,
    url_fonte text not null,
    cluster integer,
    cluster_perfil text,
    top5_similares text[] not null default '{}',
    created_at timestamptz default now()
);

grant select on public.perfumes to authenticated;
grant select on public.perfumes to anon;
grant all on public.perfumes to service_role;

alter table public.perfumes enable row level security;

create policy "Allow public read access to perfumes"
on public.perfumes
for select
to anon, authenticated
using (true);
