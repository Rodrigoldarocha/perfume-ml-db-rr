DROP POLICY IF EXISTS "Anon pode enviar contato" ON public.contato_mensagens;
CREATE POLICY "Anon pode enviar contato"
  ON public.contato_mensagens
  FOR INSERT
  TO anon
  WITH CHECK (
    char_length(nome) BETWEEN 2 AND 100
    AND char_length(email) BETWEEN 5 AND 100
    AND email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'
    AND char_length(mensagem) BETWEEN 10 AND 2000
  );