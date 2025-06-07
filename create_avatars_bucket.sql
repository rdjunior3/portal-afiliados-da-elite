-- =================================================================
-- SCRIPT DE LIMPEZA E CONFIGURAÇÃO DEFINITIVA DOS BUCKETS (v3 - Sintaxe Corrigida)
-- Portal Afiliados da Elite
--
-- OBJETIVO: Corrigir erros de sintaxe e implementar políticas de segurança
-- baseadas no ID do usuário.
-- =================================================================

-- ============================================
-- 1. CRIAÇÃO/VERIFICAÇÃO DOS BUCKETS
-- ============================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  ('avatars', 'avatars', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp']),
  ('uploads', 'uploads', true, 20971520, ARRAY['image/jpeg', 'image/png', 'image/webp'])
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

DO $$ BEGIN RAISE NOTICE '✅ Buckets ''avatars'' e ''uploads'' verificados/criados.'; END $$;

-- ============================================
-- 2. REMOÇÃO DE TODAS AS POLÍTICAS ANTIGAS E CONFLITANTES
-- ============================================

-- Lista abrangente de todas as políticas antigas para garantir um ambiente limpo.
DROP POLICY IF EXISTS "Enable_upload_for_avatars" ON storage.objects;
DROP POLICY IF EXISTS "Usuários podem atualizar seus avatars" ON storage.objects;
DROP POLICY IF EXISTS "Usuários podem deletar seus avatars" ON storage.objects;
DROP POLICY IF EXISTS "Usuários podem fazer upload de seus avatars" ON storage.objects;
DROP POLICY IF EXISTS "Usuários podem ver avatars públicos" ON storage.objects;
DROP POLICY IF EXISTS "avatars_authenticated_delete" ON storage.objects;
DROP POLICY IF EXISTS "avatars_authenticated_update" ON storage.objects;
DROP POLICY IF EXISTS "avatars_authenticated_upload" ON storage.objects;
DROP POLICY IF EXISTS "avatars_delete_policy" ON storage.objects;
DROP POLICY IF EXISTS "avatars_public_access" ON storage.objects;
DROP POLICY IF EXISTS "avatars_select_policy" ON storage.objects;
DROP POLICY IF EXISTS "avatars_update_policy" ON storage.objects;
DROP POLICY IF EXISTS "avatars_upload_by_users" ON storage.objects;
DROP POLICY IF EXISTS "avatars_upload_policy" ON storage.objects;
DROP POLICY IF EXISTS "profiles_delete_policy" ON storage.objects;
DROP POLICY IF EXISTS "profiles_select" ON storage.objects;
DROP POLICY IF EXISTS "profiles_select_policy" ON storage.objects;
DROP POLICY IF EXISTS "profiles_update_policy" ON storage.objects;
DROP POLICY IF EXISTS "profiles_upload" ON storage.objects;
DROP POLICY IF EXISTS "profiles_upload_policy" ON storage.objects;
DROP POLICY IF EXISTS "uploads_public_select" ON storage.objects;
DROP POLICY IF EXISTS "uploads_authenticated_insert" ON storage.objects;
DROP POLICY IF EXISTS "uploads_authenticated_update" ON storage.objects;
DROP POLICY IF EXISTS "uploads_authenticated_delete" ON storage.objects;
DROP POLICY IF EXISTS "Avatars: Acesso público para leitura" ON storage.objects;
DROP POLICY IF EXISTS "Avatars: Acesso de escrita para autenticados" ON storage.objects;
DROP POLICY IF EXISTS "Avatars: Acesso de atualização para autenticados" ON storage.objects;
DROP POLICY IF EXISTS "Avatars: Acesso de deleção para autenticados" ON storage.objects;
DROP POLICY IF EXISTS "Uploads: Acesso público para leitura" ON storage.objects;
DROP POLICY IF EXISTS "Uploads: Acesso de escrita para autenticados" ON storage.objects;
DROP POLICY IF EXISTS "Uploads: Acesso de atualização para autenticados" ON storage.objects;
DROP POLICY IF EXISTS "Uploads: Acesso de deleção para autenticados" ON storage.objects;
DROP POLICY IF EXISTS "Avatars: Usuário pode fazer upload para sua própria pasta" ON storage.objects;
DROP POLICY IF EXISTS "Avatars: Usuário pode atualizar seu próprio avatar" ON storage.objects;
DROP POLICY IF EXISTS "Avatars: Usuário pode deletar seu próprio avatar" ON storage.objects;

DO $$ BEGIN RAISE NOTICE '✅ Políticas antigas e conflitantes removidas.'; END $$;

-- ============================================
-- 3. CRIAÇÃO DAS POLÍTICAS DE SEGURANÇA APRIMORADAS
-- ============================================

-- --- POLÍTICAS PARA O BUCKET 'AVATARS' ---
DO $$ BEGIN RAISE NOTICE 'Criando políticas de segurança RLS para o bucket [avatars]...'; END $$;

-- Qualquer pessoa pode LER (ver) os avatares, pois são públicos.
CREATE POLICY "Avatars: Acesso público para leitura"
ON storage.objects FOR SELECT TO public USING (bucket_id = 'avatars');

-- Um usuário autenticado pode INSERIR um avatar, mas apenas na sua própria pasta.
-- A pasta é definida como 'public/user_id'.
CREATE POLICY "Avatars: Usuário pode fazer upload para sua própria pasta"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'avatars' AND
  (storage.foldername(name))[1] = 'public' AND
  (storage.foldername(name))[2] = auth.uid()::text
);

-- Um usuário autenticado pode ATUALIZAR um avatar, mas apenas na sua própria pasta.
CREATE POLICY "Avatars: Usuário pode atualizar seu próprio avatar"
ON storage.objects FOR UPDATE TO authenticated
USING (
  bucket_id = 'avatars' AND
  (storage.foldername(name))[1] = 'public' AND
  (storage.foldername(name))[2] = auth.uid()::text
);

-- Um usuário autenticado pode DELETAR um avatar, mas apenas da sua própria pasta.
CREATE POLICY "Avatars: Usuário pode deletar seu próprio avatar"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'avatars' AND
  (storage.foldername(name))[1] = 'public' AND
  (storage.foldername(name))[2] = auth.uid()::text
);

DO $$ BEGIN RAISE NOTICE '✅ Políticas RLS para o bucket [avatars] criadas.'; END $$;

-- --- POLÍTICAS PARA O BUCKET 'UPLOADS' (produtos, etc) ---
DO $$ BEGIN RAISE NOTICE 'Criando políticas para o bucket [uploads]...'; END $$;

CREATE POLICY "Uploads: Acesso público para leitura"
ON storage.objects FOR SELECT TO public USING (bucket_id = 'uploads');

CREATE POLICY "Uploads: Acesso de escrita para usuários autenticados"
ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'uploads');

CREATE POLICY "Uploads: Acesso de atualização para usuários autenticados"
ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'uploads');

CREATE POLICY "Uploads: Acesso de deleção para usuários autenticados"
ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'uploads');

DO $$ BEGIN RAISE NOTICE '✅ Políticas para o bucket [uploads] criadas.'; END $$;

-- ============================================
-- 4. VERIFICAÇÃO FINAL
-- ============================================
DO $$ BEGIN RAISE NOTICE '🚀 Processo de limpeza e configuração de segurança aprimorada concluído.'; END $$; 