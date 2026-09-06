-- Formulário de contato: escrita anônima validada, leitura só service_role.
create table public.contato_mensagens (
  id bigint generated always as identity primary key,
  nome text not null check (char_length(nome) between 2 and 100),
  email text not null check (email like '%@%.%'),
  mensagem text not null check (char_length(mensagem) between 10 and 2000),
  created_at timestamptz default now() not null
);

alter table public.contato_mensagens enable row level security;

create policy "Anon pode enviar contato"
  on public.contato_mensagens
  for insert
  to anon
  with check (true);

grant insert on public.contato_mensagens to anon;
grant all on public.contato_mensagens to service_role;
