-- =====================================================
-- Migração Segura para Resolver Conflitos Elite Tips
-- =====================================================

-- Esta migração é projetada para ser executada mesmo quando 
-- há conflitos ou estruturas parcialmente criadas

-- 1. Verificar e criar função de update_updated_at se não existir
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 2. Criar tabela elite_tips apenas se não existir
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'elite_tips') THEN
        CREATE TABLE elite_tips (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            title TEXT NOT NULL,
            content TEXT NOT NULL,
            icon TEXT DEFAULT '💡',
            order_index INTEGER DEFAULT 0,
            is_active BOOLEAN DEFAULT true,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            created_by UUID REFERENCES profiles(id),
            updated_by UUID REFERENCES profiles(id)
        );
        
        RAISE NOTICE '✅ Tabela elite_tips criada com sucesso';
    ELSE
        RAISE NOTICE '⚠️ Tabela elite_tips já existe - ignorando criação';
    END IF;
END $$;

-- 3. Criar índices apenas se não existirem
DO $$
BEGIN
    -- Índice para is_active
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_elite_tips_active') THEN
        CREATE INDEX idx_elite_tips_active ON elite_tips(is_active);
        RAISE NOTICE '✅ Índice idx_elite_tips_active criado';
    ELSE
        RAISE NOTICE '⚠️ Índice idx_elite_tips_active já existe';
    END IF;
    
    -- Índice para order_index
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_elite_tips_order') THEN
        CREATE INDEX idx_elite_tips_order ON elite_tips(order_index);
        RAISE NOTICE '✅ Índice idx_elite_tips_order criado';
    ELSE
        RAISE NOTICE '⚠️ Índice idx_elite_tips_order já existe';
    END IF;
END $$;

-- 4. Criar trigger apenas se não existir
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_elite_tips_updated_at') THEN
        CREATE TRIGGER update_elite_tips_updated_at
            BEFORE UPDATE ON elite_tips
            FOR EACH ROW
            EXECUTE FUNCTION update_updated_at_column();
        RAISE NOTICE '✅ Trigger update_elite_tips_updated_at criado';
    ELSE
        RAISE NOTICE '⚠️ Trigger update_elite_tips_updated_at já existe';
    END IF;
END $$;

-- 5. Habilitar RLS (idempotente)
ALTER TABLE elite_tips ENABLE ROW LEVEL SECURITY;

-- 6. Recriar políticas RLS (drop + create)
DO $$
BEGIN
    -- Remover políticas existentes
    DROP POLICY IF EXISTS "Usuários autenticados podem ver dicas ativas" ON elite_tips;
    DROP POLICY IF EXISTS "Admin tem acesso total a dicas" ON elite_tips;
    
    -- Criar política para visualização
    CREATE POLICY "Usuários autenticados podem ver dicas ativas" ON elite_tips
        FOR SELECT
        USING (
            is_active = true AND
            auth.role() = 'authenticated'
        );
    
    -- Criar política para admin
    CREATE POLICY "Admin tem acesso total a dicas" ON elite_tips
        FOR ALL
        USING (
            EXISTS (
                SELECT 1 FROM profiles 
                WHERE profiles.id = auth.uid() 
                AND profiles.role IN ('admin', 'super_admin')
            )
        );
    
    RAISE NOTICE '✅ Políticas RLS recriadas com sucesso';
END $$;

-- 7. Inserir dados padrão apenas se a tabela estiver vazia
DO $$
DECLARE
    tip_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO tip_count FROM elite_tips;
    
    IF tip_count = 0 THEN
        INSERT INTO elite_tips (title, content, icon, order_index, is_active) VALUES
        ('Complete seu perfil', 'Complete seu perfil para desbloquear recursos premium exclusivos', '🏆', 1, true),
        ('Explore produtos premium', 'Explore nossos produtos com as maiores comissões do mercado', '💰', 2, true),
        ('Participe das capacitações', 'Participe das aulas de capacitação para aumentar suas vendas', '📚', 3, true);
        
        RAISE NOTICE '✅ Dicas padrão inseridas (%s registros)', tip_count;
    ELSE
        RAISE NOTICE '⚠️ Tabela já contém % registros - ignorando inserção', tip_count;
    END IF;
END $$;

-- 8. Verificação final
DO $$
DECLARE
    total_tips INTEGER;
    total_indices INTEGER;
BEGIN
    -- Contar dicas
    SELECT COUNT(*) INTO total_tips FROM elite_tips;
    
    -- Contar índices
    SELECT COUNT(*) INTO total_indices 
    FROM pg_indexes 
    WHERE tablename = 'elite_tips' 
    AND indexname IN ('idx_elite_tips_active', 'idx_elite_tips_order');
    
    RAISE NOTICE '🎉 MIGRAÇÃO CONCLUÍDA:';
    RAISE NOTICE '   - Dicas na tabela: %', total_tips;
    RAISE NOTICE '   - Índices criados: %/2', total_indices;
    RAISE NOTICE '   - RLS habilitado: ✅';
    RAISE NOTICE '   - Políticas ativas: ✅';
END $$; 