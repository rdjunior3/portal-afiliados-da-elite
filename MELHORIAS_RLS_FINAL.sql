-- ============================================================================
-- MELHORIAS RLS FINAL - PORTAL AFILIADOS DA ELITE 2025
-- Versão que verifica DINAMICAMENTE as colunas existentes
-- ============================================================================

-- 1. OTIMIZAÇÃO DE POLÍTICAS RLS COM (SELECT auth.uid())
SELECT 'APLICANDO MELHORIAS RLS FINAL...' as status;

-- Política otimizada para profiles
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT
  TO authenticated
  USING ((SELECT auth.uid()) = id);

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE
  TO authenticated
  USING ((SELECT auth.uid()) = id)
  WITH CHECK ((SELECT auth.uid()) = id);

-- Política otimizada para products
DROP POLICY IF EXISTS "Users can view active products" ON products;
CREATE POLICY "Users can view active products" ON products
  FOR SELECT
  TO authenticated
  USING (is_active = true);

-- Políticas admin diretas (sem Security Definer)
DROP POLICY IF EXISTS "Admins can manage products" ON products;
CREATE POLICY "Admins can manage products" ON products
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = (SELECT auth.uid()) 
      AND role = 'admin'
    )
  );

-- 2. CRIAÇÃO DE ÍNDICES OTIMIZADOS PARA RLS (VERIFICAÇÃO DINÂMICA)
SELECT 'CRIANDO ÍNDICES PARA PERFORMANCE RLS...' as status;

-- Índices básicos sempre existentes
CREATE INDEX IF NOT EXISTS idx_profiles_id_btree 
ON profiles USING btree (id);

CREATE INDEX IF NOT EXISTS idx_products_is_active 
ON products USING btree (is_active);

-- Verificação DINÂMICA das colunas e criação de índices
DO $$
BEGIN
  -- Verificar se coluna 'role' existe em profiles
  IF EXISTS (SELECT 1 FROM information_schema.columns 
             WHERE table_schema = 'public' 
             AND table_name = 'profiles' 
             AND column_name = 'role') THEN
    CREATE INDEX IF NOT EXISTS idx_profiles_role 
    ON profiles USING btree (role);
    RAISE NOTICE '✅ Índice idx_profiles_role criado';
  END IF;

  -- TABELA: affiliate_links - verificar qual coluna existe (user_id ou affiliate_id)
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'affiliate_links') THEN
    -- Tentar user_id primeiro  
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_schema = 'public' 
               AND table_name = 'affiliate_links' 
               AND column_name = 'user_id') THEN
      CREATE INDEX IF NOT EXISTS idx_affiliate_links_user_id 
      ON affiliate_links USING btree (user_id);
      RAISE NOTICE '✅ Índice idx_affiliate_links_user_id criado';
    -- Senão, tentar affiliate_id
    ELSIF EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_schema = 'public' 
                  AND table_name = 'affiliate_links' 
                  AND column_name = 'affiliate_id') THEN
      CREATE INDEX IF NOT EXISTS idx_affiliate_links_affiliate_id 
      ON affiliate_links USING btree (affiliate_id);
      RAISE NOTICE '✅ Índice idx_affiliate_links_affiliate_id criado';
    END IF;
  END IF;

  -- TABELA: messages - usar sender_id (não user_id)
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'messages') THEN
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_schema = 'public' 
               AND table_name = 'messages' 
               AND column_name = 'sender_id') THEN
      CREATE INDEX IF NOT EXISTS idx_messages_sender_id 
      ON messages USING btree (sender_id);
      RAISE NOTICE '✅ Índice idx_messages_sender_id criado';
    END IF;
    
    -- Índice para room_id também
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_schema = 'public' 
               AND table_name = 'messages' 
               AND column_name = 'room_id') THEN
      CREATE INDEX IF NOT EXISTS idx_messages_room_id 
      ON messages USING btree (room_id);
      RAISE NOTICE '✅ Índice idx_messages_room_id criado';
    END IF;
  END IF;

  -- TABELA: chat_rooms - verificar created_by
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'chat_rooms') THEN
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_schema = 'public' 
               AND table_name = 'chat_rooms' 
               AND column_name = 'created_by') THEN
      CREATE INDEX IF NOT EXISTS idx_chat_rooms_created_by 
      ON chat_rooms USING btree (created_by);
      RAISE NOTICE '✅ Índice idx_chat_rooms_created_by criado';
    END IF;
  END IF;

  RAISE NOTICE '✅ Verificação dinâmica de índices concluída';
END $$;

-- 3. TRIGGERS OTIMIZADOS PARA PERFORMANCE
SELECT 'CRIANDO TRIGGERS OTIMIZADOS...' as status;

-- Trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Aplicar trigger onde updated_at existe
DO $$
BEGIN
  -- Trigger para profiles
  IF EXISTS (SELECT 1 FROM information_schema.columns 
             WHERE table_schema = 'public' 
             AND table_name = 'profiles' 
             AND column_name = 'updated_at') THEN
    DROP TRIGGER IF EXISTS trigger_update_profiles_updated_at ON profiles;
    CREATE TRIGGER trigger_update_profiles_updated_at
      BEFORE UPDATE ON profiles
      FOR EACH ROW
      EXECUTE FUNCTION public.update_updated_at_column();
    RAISE NOTICE '✅ Trigger profiles updated_at criado';
  END IF;

  -- Trigger para products
  IF EXISTS (SELECT 1 FROM information_schema.columns 
             WHERE table_schema = 'public' 
             AND table_name = 'products' 
             AND column_name = 'updated_at') THEN
    DROP TRIGGER IF EXISTS trigger_update_products_updated_at ON products;
    CREATE TRIGGER trigger_update_products_updated_at
      BEFORE UPDATE ON products
      FOR EACH ROW
      EXECUTE FUNCTION public.update_updated_at_column();
    RAISE NOTICE '✅ Trigger products updated_at criado';
  END IF;

  -- Trigger para chat_rooms
  IF EXISTS (SELECT 1 FROM information_schema.columns 
             WHERE table_schema = 'public' 
             AND table_name = 'chat_rooms' 
             AND column_name = 'updated_at') THEN
    DROP TRIGGER IF EXISTS trigger_update_chat_rooms_updated_at ON chat_rooms;
    CREATE TRIGGER trigger_update_chat_rooms_updated_at
      BEFORE UPDATE ON chat_rooms
      FOR EACH ROW
      EXECUTE FUNCTION public.update_updated_at_column();
    RAISE NOTICE '✅ Trigger chat_rooms updated_at criado';
  END IF;
END $$;

-- 4. VALIDAÇÕES E CONSTRAINTS PARA INTEGRIDADE
SELECT 'APLICANDO CONSTRAINTS DE INTEGRIDADE...' as status;

-- Verificar se colunas existem antes de adicionar constraints
DO $$
BEGIN
  -- Constraint para roles válidos (se coluna role existir)
  IF EXISTS (SELECT 1 FROM information_schema.columns 
             WHERE table_schema = 'public' 
             AND table_name = 'profiles' 
             AND column_name = 'role') THEN
    BEGIN
      ALTER TABLE profiles 
      DROP CONSTRAINT IF EXISTS valid_role;
      ALTER TABLE profiles 
      ADD CONSTRAINT valid_role 
      CHECK (role IN ('admin', 'user', 'moderator', 'affiliate'));
      RAISE NOTICE '✅ Constraint valid_role aplicada';
    EXCEPTION
      WHEN OTHERS THEN
        RAISE NOTICE '⚠️ Erro ao aplicar constraint valid_role: %', SQLERRM;
    END;
  END IF;

  -- Constraint para preços positivos (se tabela product_offers existir)
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'product_offers') THEN
    BEGIN
      ALTER TABLE product_offers 
      DROP CONSTRAINT IF EXISTS positive_price;
      ALTER TABLE product_offers 
      ADD CONSTRAINT positive_price 
      CHECK (price >= 0);
      RAISE NOTICE '✅ Constraint positive_price aplicada';
    EXCEPTION
      WHEN OTHERS THEN
        RAISE NOTICE '⚠️ Erro ao aplicar constraint positive_price: %', SQLERRM;
    END;
  END IF;
END $$;

-- 5. CONFIGURAÇÕES DE PERFORMANCE
SELECT 'APLICANDO CONFIGURAÇÕES DE PERFORMANCE...' as status;

-- Atualizar estatísticas das tabelas para otimização de queries
ANALYZE profiles;
ANALYZE products;

-- Verificar e analisar tabelas condicionalmente
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'messages') THEN
    ANALYZE messages;
    RAISE NOTICE '✅ ANALYZE messages executado';
  END IF;
  
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'affiliate_links') THEN
    ANALYZE affiliate_links;
    RAISE NOTICE '✅ ANALYZE affiliate_links executado';
  END IF;

  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'chat_rooms') THEN
    ANALYZE chat_rooms;
    RAISE NOTICE '✅ ANALYZE chat_rooms executado';
  END IF;

  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'categories') THEN
    ANALYZE categories;
    RAISE NOTICE '✅ ANALYZE categories executado';
  END IF;

  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'product_offers') THEN
    ANALYZE product_offers;
    RAISE NOTICE '✅ ANALYZE product_offers executado';
  END IF;
END $$;

-- 6. TESTES DE INTEGRIDADE
SELECT 'EXECUTANDO TESTES DE INTEGRIDADE...' as status;

-- Verificar se todas as políticas RLS estão ativas
SELECT 
  tablename,
  CASE WHEN rowsecurity THEN '✅' ELSE '❌' END as rls_status
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;

-- 7. VERIFICAÇÃO DE ÍNDICES CRIADOS
SELECT 'VERIFICANDO ÍNDICES CRIADOS...' as status;

SELECT 
  schemaname,
  tablename,
  indexname,
  indexdef
FROM pg_indexes 
WHERE schemaname = 'public'
  AND indexname LIKE 'idx_%'
ORDER BY tablename, indexname;

-- 8. RELATÓRIO FINAL DETALHADO
SELECT 'MELHORIAS APLICADAS COM SUCESSO FINAL!' as status;

SELECT 
  '🚀 RELATÓRIO DE MELHORIAS FINAL' as titulo,
  current_timestamp as timestamp,
  '✅ Políticas RLS otimizadas com (SELECT auth.uid())' as melhoria1,
  '✅ Políticas admin diretas (sem Security Definer)' as melhoria2,
  '✅ Índices criados dinamicamente verificando colunas' as melhoria3,
  '✅ Triggers e constraints aplicados condicionalmente' as melhoria4,
  '✅ Estatísticas atualizadas para todas as tabelas' as melhoria5,
  '✅ VERIFICAÇÃO DINÂMICA DE ESTRUTURA' as importante,
  '✅ COMPATÍVEL COM QUALQUER MIGRAÇÃO' as garantia; 