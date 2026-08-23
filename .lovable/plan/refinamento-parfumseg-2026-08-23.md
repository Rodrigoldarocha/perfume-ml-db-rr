# Refinamento ParfumSeg

Este plano detalha a implementação de melhorias de SEO, experiência do usuário (UX) e infraestrutura para o catálogo de perfumes ParfumSeg, conforme solicitado no guia de otimização.

## SEO e Metadados

-   **Head Metadata**: Atualizar `head()` em cada rota (`src/routes/index.tsx`, `src/routes/perfume.$id.tsx`, `src/routes/quiz.tsx`) com títulos únicos, descrições ricas em palavras-chave e tags OpenGraph/Twitter.
-   **Robots.txt & Sitemap.xml**: Criar rotas de API em `src/routes/robots.txt.ts` e `src/routes/sitemap.xml.ts` para servir estes arquivos estáticos dinamicamente.
-   **Favicon**: Adicionar um favicon minimalista em `public/favicon.ico`.
-   **Imagens**: Adicionar tags `alt` descritivas em todos os componentes de imagem e configurar lazy loading nativo (`loading="lazy"`).

## Experiência do Usuário (UX)

-   **Páginas Essenciais**:
    -   `src/routes/contato.tsx`: Formulário de contato simples.
    -   `src/routes/privacidade.tsx`: Termos de uso e política de privacidade.
    -   `src/routes/agradecimento.tsx`: Página de destino pós-quiz ou contato.
    -   `src/routes/__root.tsx`: Refinar a `NotFoundComponent` (página 404 customizada).
-   **Componentes de Navegação**:
    -   **Breadcrumbs**: Implementar um componente de trilha de navegação para a página de detalhes do perfume.
    -   **FAQ**: Adicionar uma seção de 5 perguntas frequentes na página inicial ou em uma página dedicada.
    -   **CTA**: Adicionar um botão de chamada para ação claro na seção hero da home ("Fazer o Quiz Olfativo").
-   **Feedback e Validação**:
    -   Implementar mensagens de erro úteis usando `sonner`.
    -   Limitar caracteres em inputs de busca e formulários.

## Limpeza e Otimização

-   Remover código morto e comentários desnecessários em todo o projeto.
-   Garantir que todas as imagens decorativas tenham `alt=""` e imagens de conteúdo tenham descrições precisas.

## Detalhes Técnicos

-   Uso de `sonner` para notificações.
-   Rotas de API do TanStack Start para arquivos de texto (`robots.txt`, `sitemap.xml`).
-   Tailwind v4 para estilização consistente com o tema de luxo (beige/charcoal).
-   Componentes Shadcn UI para formulários e layouts.
