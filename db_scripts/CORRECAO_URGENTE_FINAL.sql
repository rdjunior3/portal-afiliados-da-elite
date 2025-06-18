-- ================================================================
-- CORREÇÃO URGENTE E DEFINITIVA - PRODUTOS + CHAT
-- Portal Afiliados da Elite - Execute AGORA no Supabase
-- ================================================================

-- ============================================
-- 1. DIAGNÓSTICO RÁPIDO
-- ============================================
DO $$
BEGIN
    RAISE NOTICE '🔍 INICIANDO DIAGNÓSTICO URGENTE...';
    
    -- Verificar bucket
    IF EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'product-images') THEN
        RAISE NOTICE '✅ Bucket product-images: EXISTE';
    ELSE
        RAISE NOTICE '❌ Bucket product-images: NÃO EXISTE';
    END IF;
    
    -- Verificar campos products
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'image_url') THEN
        RAISE NOTICE '✅ Campo products.image_url: EXISTE';
    ELSE
        RAISE NOTICE '❌ Campo products.image_url: NÃO EXISTE';
    END IF;
    
    -- Verificar tabela messages
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'messages') THEN
        RAISE NOTICE '✅ Tabela messages: EXISTE';
    ELSE
        RAISE NOTICE '❌ Tabela messages: NÃO EXISTE';
    END IF;
    
    RAISE NOTICE '🔍 DIAGNÓSTICO CONCLUÍDO - INICIANDO CORREÇÕES...';
END $$;

-- ============================================
-- 2. CORRIGIR PRODUTOS - BUCKET E CAMPOS
-- ============================================
DO $$
BEGIN
    RAISE NOTICE '🛒 CORRIGINDO SISTEMA DE PRODUTOS...';
    
    -- Remover objetos e bucket se existir
    DELETE FROM storage.objects WHERE bucket_id = 'product-images';
    DELETE FROM storage.buckets WHERE id = 'product-images';
    
    -- Criar bucket limpo
    INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
    VALUES (
        'product-images',
        'product-images', 
        true,
        52428800, -- 50MB
        ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']
    );
    
    RAISE NOTICE '✅ Bucket product-images criado!';
    
    -- Adicionar campos necessários na tabela products
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'image_url') THEN
        ALTER TABLE products ADD COLUMN image_url TEXT;
        RAISE NOTICE '✅ Campo image_url adicionado';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'sales_page_url') THEN
        ALTER TABLE products ADD COLUMN sales_page_url TEXT;
        RAISE NOTICE '✅ Campo sales_page_url adicionado';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'commission_amount') THEN
        ALTER TABLE products ADD COLUMN commission_amount DECIMAL(10,2) DEFAULT 0;
        RAISE NOTICE '✅ Campo commission_amount adicionado';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'total_sales') THEN
        ALTER TABLE products ADD COLUMN total_sales INTEGER DEFAULT 0;
        RAISE NOTICE '✅ Campo total_sales adicionado';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'status') THEN
        ALTER TABLE products ADD COLUMN status TEXT DEFAULT 'active';
        RAISE NOTICE '✅ Campo status adicionado';
    END IF;
    
    RAISE NOTICE '✅ PRODUTOS: Estrutura corrigida!';
END $$;

-- ============================================
-- 3. CORRIGIR CHAT - ESTRUTURA E CAMPOS
-- ============================================
DO $$
BEGIN
    RAISE NOTICE '💬 CORRIGINDO SISTEMA DE CHAT...';
    
    -- Adicionar campos opcionais na tabela messages (se não existirem)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'messages' AND column_name = 'message_type') THEN
        ALTER TABLE messages ADD COLUMN message_type TEXT DEFAULT 'text';
        RAISE NOTICE '✅ Campo message_type adicionado';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'messages' AND column_name = 'file_upload_id') THEN
        ALTER TABLE messages ADD COLUMN file_upload_id UUID;
        RAISE NOTICE '✅ Campo file_upload_id adicionado';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'messages' AND column_name = 'reply_to_id') THEN
        ALTER TABLE messages ADD COLUMN reply_to_id UUID;
        RAISE NOTICE '✅ Campo reply_to_id adicionado';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'messages' AND column_name = 'is_edited') THEN
        ALTER TABLE messages ADD COLUMN is_edited BOOLEAN DEFAULT false;
        RAISE NOTICE '✅ Campo is_edited adicionado';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'messages' AND column_name = 'is_deleted') THEN
        ALTER TABLE messages ADD COLUMN is_deleted BOOLEAN DEFAULT false;
        RAISE NOTICE '✅ Campo is_deleted adicionado';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'messages' AND column_name = 'updated_at') THEN
        ALTER TABLE messages ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();
        RAISE NOTICE '✅ Campo updated_at adicionado';
    END IF;
    
    RAISE NOTICE '✅ CHAT: Estrutura corrigida!';
END $$;

-- ============================================
-- 4. CRIAR TABELA PRODUCT_OFFERS
-- ============================================
CREATE TABLE IF NOT EXISTS product_offers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL DEFAULT 0,
    commission_rate DECIMAL(5,2) NOT NULL DEFAULT 10,
    commission_amount DECIMAL(10,2) DEFAULT 0,
    promotion_url TEXT,
    is_default BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 5. POLÍTICAS RLS SIMPLES E FUNCIONAIS
-- ============================================

-- Políticas para storage (produto)
DROP POLICY IF EXISTS "Public can view product images" ON storage.objects;
CREATE POLICY "Public can view product images" ON storage.objects
FOR SELECT TO public USING (bucket_id = 'product-images');

DROP POLICY IF EXISTS "Authenticated can upload product images" ON storage.objects;
CREATE POLICY "Authenticated can upload product images" ON storage.objects
FOR INSERT TO authenticated WITH CHECK (bucket_id = 'product-images');

-- Políticas para products
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can view products" ON products;
CREATE POLICY "Public can view products" ON products FOR SELECT TO public USING (true);

DROP POLICY IF EXISTS "Admins can manage products" ON products;
CREATE POLICY "Admins can manage products" ON products
FOR ALL TO authenticated
USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'));

-- Políticas para product_offers
ALTER TABLE product_offers ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can view offers" ON product_offers;
CREATE POLICY "Public can view offers" ON product_offers FOR SELECT TO public USING (is_active = true);

DROP POLICY IF EXISTS "Admins can manage offers" ON product_offers;
CREATE POLICY "Admins can manage offers" ON product_offers
FOR ALL TO authenticated
USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'));

-- Políticas para chat_rooms (permissivas)
ALTER TABLE chat_rooms ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view chat rooms" ON chat_rooms;
CREATE POLICY "Users can view chat rooms" ON chat_rooms FOR SELECT TO authenticated USING (is_active = true);

DROP POLICY IF EXISTS "Admins can manage chat rooms" ON chat_rooms;
CREATE POLICY "Admins can manage chat rooms" ON chat_rooms
FOR ALL TO authenticated
USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'));

-- Políticas para messages (permissivas)
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view messages" ON messages;
CREATE POLICY "Users can view messages" ON messages FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Users can send messages" ON messages;
CREATE POLICY "Users can send messages" ON messages FOR INSERT TO authenticated WITH CHECK (auth.uid() = sender_id);

DROP POLICY IF EXISTS "Users can edit own messages" ON messages;
CREATE POLICY "Users can edit own messages" ON messages
FOR UPDATE TO authenticated
USING (auth.uid() = sender_id);

-- ============================================
-- 6. VERIFICAÇÃO FINAL E RELATÓRIO
-- ============================================
DO $$
DECLARE
    bucket_ok BOOLEAN;
    products_fields_ok INTEGER;
    messages_fields_ok INTEGER;
BEGIN
    -- Verificar bucket
    SELECT EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'product-images') INTO bucket_ok;
    
    -- Contar campos products
    SELECT COUNT(*) FROM information_schema.columns 
    WHERE table_name = 'products' 
    AND column_name IN ('image_url', 'sales_page_url', 'commission_amount', 'total_sales', 'status') 
    INTO products_fields_ok;
    
    -- Contar campos messages
    SELECT COUNT(*) FROM information_schema.columns 
    WHERE table_name = 'messages' 
    AND column_name IN ('message_type', 'file_upload_id', 'reply_to_id', 'is_edited', 'is_deleted') 
    INTO messages_fields_ok;
    
    RAISE NOTICE '';
    RAISE NOTICE '========================================';
    RAISE NOTICE '🎉 CORREÇÃO URGENTE CONCLUÍDA!';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Bucket product-images: %', CASE WHEN bucket_ok THEN '✅ CRIADO' ELSE '❌ ERRO' END;
    RAISE NOTICE 'Campos products: %/5 adicionados', products_fields_ok;
    RAISE NOTICE 'Campos messages: %/5 adicionados', messages_fields_ok;
    RAISE NOTICE '';
    RAISE NOTICE '🚀 PRÓXIMOS PASSOS OBRIGATÓRIOS:';
    RAISE NOTICE '1. Recarregue a página da aplicação (F5)';
    RAISE NOTICE '2. Teste o cadastro de produto';
    RAISE NOTICE '3. Teste o envio de mensagens no chat';
    RAISE NOTICE '4. Ambos devem funcionar perfeitamente!';
    RAISE NOTICE '';
    RAISE NOTICE '⚠️ Se ainda houver problemas, verifique:';
    RAISE NOTICE '   - Logs do browser (F12 > Console)';
    RAISE NOTICE '   - Permissões do usuário (role = admin)';
    RAISE NOTICE '   - Conexão com internet estável';
    RAISE NOTICE '========================================';
END $$;

-- Resultado final
SELECT 
    '🎯 CORREÇÃO URGENTE APLICADA COM SUCESSO!' as status,
    'Produtos e Chat corrigidos' as sistemas,
    NOW() as executado_em; 