-- Corrigir política de RLS para a tabela chat_rooms
-- Permitir que qualquer usuário autenticado visualize salas de chat ativas.

-- 1. Remover políticas antigas para evitar conflitos (opcional, mas mais seguro)
DROP POLICY IF EXISTS "Everyone can view active chat rooms" ON public.chat_rooms;
DROP POLICY IF EXISTS "Afiliados aprovados podem ver salas de chat" ON public.chat_rooms;
DROP POLICY IF EXISTS "Anyone can view public chat rooms" ON public.chat_rooms;


-- 2. Criar a política correta
CREATE POLICY "Authenticated users can view active chat rooms"
ON public.chat_rooms
FOR SELECT
TO authenticated
USING (is_active = true);

-- 3. Manter a política de administrador
-- (Supondo que a política de admin já exista e está correta, mas a recriamos para garantir)
DROP POLICY IF EXISTS "Admins can manage chat rooms" ON public.chat_rooms;
CREATE POLICY "Admins can manage chat rooms"
ON public.chat_rooms
FOR ALL
TO service_role
USING (true);

-- Nota: A role 'service_role' é usada aqui para dar acesso total via API com a chave de serviço (backend/admin),
-- o que é uma prática comum e segura.

-- Habilitar RLS na tabela, caso ainda não esteja.
ALTER TABLE public.chat_rooms ENABLE ROW LEVEL SECURITY; 