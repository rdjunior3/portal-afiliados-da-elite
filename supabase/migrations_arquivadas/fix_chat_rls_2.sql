-- =================================================================
-- Correção da Política de RLS para a Tabela `chat_rooms`
--
-- Objetivo:
-- Garantir que a lógica de acesso para a tabela `chat_rooms` seja
-- consistente com as outras tabelas do sistema de chat (ex: `messages`).
-- Apenas afiliados aprovados e administradores devem poder interagir
-- com o chat.
--
-- Passos:
-- 1. Remover políticas conflitantes ou permissivas que foram
--    introduzidas em migrações anteriores.
-- 2. Recriar a política de `SELECT` para `chat_rooms`, restringindo
--    o acesso a afiliados com status 'approved'.
-- 3. Garantir que a política de administrador esteja correta e
--    consistente, baseada na `role` do perfil do usuário.
-- =================================================================

-- 1. Remover a política permissiva que concede acesso a todos os usuários autenticados.
DROP POLICY IF EXISTS "Authenticated users can view active chat rooms" ON public.chat_rooms;

-- 2. Remover a política de administrador que pode ter sido alterada para usar `service_role`.
DROP POLICY IF EXISTS "Admins can manage chat rooms" ON public.chat_rooms;

-- 3. Remover a política de acesso total de administrador para recriá-la de forma consistente.
DROP POLICY IF EXISTS "Admin tem acesso total a chat_rooms" ON public.chat_rooms;

-- 4. Remover a política de seleção para afiliados para recriá-la e garantir que é a única ativa.
DROP POLICY IF EXISTS "Afiliados aprovados podem ver salas de chat" ON public.chat_rooms;


-- 5. Criar a política correta para que apenas afiliados aprovados possam ver as salas de chat ativas.
CREATE POLICY "Afiliados aprovados podem ver salas de chat"
ON public.chat_rooms
FOR SELECT
USING (
    is_active = true AND
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE profiles.id = auth.uid() AND profiles.affiliate_status = 'approved'
    )
);

-- 6. Criar a política de administrador que concede acesso total, verificando a role do usuário.
--    Esta política também permite que administradores vejam as salas de chat, pois `ALL` inclui `SELECT`.
CREATE POLICY "Admin tem acesso total a chat_rooms"
ON public.chat_rooms
FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
); 