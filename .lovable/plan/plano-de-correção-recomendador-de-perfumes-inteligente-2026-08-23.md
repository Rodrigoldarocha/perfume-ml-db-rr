# Plano de Correção: Recomendador de Perfumes Inteligente

Este plano detalha a investigação e correção do pipeline de recomendações olfativas, garantindo que o sistema retorne resultados reais e precisos baseados nas preferências do usuário.

## 1. Auditoria e Diagnóstico
- **Identificação da Causa Raiz**: O quiz olfativo em `src/routes/quiz.tsx` atualmente não envia as respostas do usuário para nenhum serviço de recomendação; ele apenas redireciona para a home.
- **Implementação do Motor**: Criar a lógica de recomendação em `src/services/perfume.functions.ts` que utiliza os dados de perfil (gênero, família, intensidade, notas) para buscar fragrâncias compatíveis no banco de dados.

## 2. Desenvolvimento do Pipeline de Recomendação
- **Geração de Candidatos**: Filtragem inicial por gênero e família olfativa.
- **Cálculo de Score**: Implementar um sistema de pontuação baseado na presença das notas e acordes selecionados pelo usuário.
- **Fallback Hierárquico**: Garantir que o sistema nunca retorne uma lista vazia, reduzindo a restritividade dos filtros se necessário (ex: se o gênero + família não retornar nada, expandir a busca).

## 3. Integração com o Frontend
- **Quiz de Descoberta**: Atualizar a tela final do quiz para chamar o serviço de recomendação e exibir os resultados em uma nova rota `/recomendacoes` ou diretamente na home com estado de filtro.
- **Explicação Visual**: Adicionar badges ou textos justificando por que aquele perfume foi recomendado (ex: "Combina com seu gosto por notas de Sândalo").

## Detalhes Técnicos
- **Novas Funções**: `getRecommendations` em `src/services/perfume.functions.ts`.
- **Zod Validation**: Validar o objeto de perfil do usuário enviado pelo quiz.
- **Logs de Debug**: Adicionar o bloco de log solicitado para monitorar o afunilamento dos candidatos no servidor.
- **Rota**: Criar `src/routes/recomendacoes.tsx` para exibir os resultados específicos do quiz.
