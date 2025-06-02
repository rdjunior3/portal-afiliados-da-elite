-- =====================================================
-- SCRIPT DE CONFIGURAÇÃO INICIAL
-- Portal Afiliados da Elite - Performance Otimizada
-- =====================================================

-- Verificar se todas as tabelas foram criadas
DO $$ 
DECLARE
    tables_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO tables_count 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name IN ('profiles', 'products', 'categories', 'courses', 'lessons', 'chat_rooms', 'messages', 'affiliate_links', 'commissions');
    
    IF tables_count < 9 THEN
        RAISE EXCEPTION 'Nem todas as tabelas necessárias foram criadas. Execute primeiro a migração principal.';
    END IF;
    
    RAISE NOTICE 'Todas as tabelas necessárias estão presentes.';
END $$;

-- =====================================================
-- CONFIGURAÇÕES DE PERFORMANCE
-- =====================================================

-- Atualizar estatísticas para otimização de queries
ANALYZE;

-- Configurar autovacuum mais agressivo para tabelas de alta movimentação
ALTER TABLE link_analytics SET (
    autovacuum_vacuum_scale_factor = 0.1,
    autovacuum_analyze_scale_factor = 0.05
);

ALTER TABLE messages SET (
    autovacuum_vacuum_scale_factor = 0.1,
    autovacuum_analyze_scale_factor = 0.05
);

-- =====================================================
-- CRIAR USUÁRIO ADMIN INICIAL
-- =====================================================

-- Função para criar usuário admin inicial
CREATE OR REPLACE FUNCTION create_initial_admin(admin_email TEXT)
RETURNS VOID
LANGUAGE plpgsql
AS $$
BEGIN
    -- Verificar se já existe um admin
    IF EXISTS (SELECT 1 FROM profiles WHERE role = 'admin') THEN
        RAISE NOTICE 'Já existe pelo menos um usuário admin no sistema.';
        RETURN;
    END IF;
    
    -- Verificar se o email existe nos profiles
    IF NOT EXISTS (SELECT 1 FROM profiles WHERE email = admin_email) THEN
        RAISE NOTICE 'Email % não encontrado nos profiles. Primeiro faça login com este email.', admin_email;
        RETURN;
    END IF;
    
    -- Promover usuário para admin
    UPDATE profiles 
    SET 
        role = 'admin',
        affiliate_status = 'approved',
        updated_at = NOW()
    WHERE email = admin_email;
    
    RAISE NOTICE 'Usuário % promovido para admin com sucesso!', admin_email;
END;
$$;

-- =====================================================
-- INSERIR DADOS INICIAIS ESSENCIAIS
-- =====================================================

-- Inserir categorias padrão (se não existirem)
INSERT INTO categories (name, slug, description, color, sort_order) VALUES
    ('Marketing Digital', 'marketing-digital', 'Produtos relacionados a marketing digital e vendas online', '#f59e0b', 1),
    ('Educação', 'educacao', 'Cursos e materiais educacionais', '#3b82f6', 2),
    ('Saúde e Bem-estar', 'saude-bem-estar', 'Produtos para saúde e qualidade de vida', '#10b981', 3),
    ('Tecnologia', 'tecnologia', 'Software, apps e ferramentas tecnológicas', '#8b5cf6', 4),
    ('Finanças', 'financas', 'Investimentos e educação financeira', '#ef4444', 5),
    ('Desenvolvimento Pessoal', 'desenvolvimento-pessoal', 'Livros, cursos e materiais de crescimento pessoal', '#f97316', 6)
ON CONFLICT (slug) DO NOTHING;

-- Inserir sala "Comunidade da Elite" (se não existir)
INSERT INTO chat_rooms (name, description, is_active) 
VALUES (
    'Comunidade da Elite',
    'Sala oficial da comunidade de afiliados elite. Networking premium e discussões estratégicas.',
    TRUE
) ON CONFLICT DO NOTHING;

-- Inserir curso de boas-vindas
INSERT INTO courses (title, description, is_active) VALUES (
    'Bem-vindo ao Portal Elite',
    'Curso introdutório para novos afiliados. Aprenda como maximizar seus ganhos e utilizar todas as ferramentas disponíveis.',
    TRUE
) ON CONFLICT DO NOTHING;

-- Inserir aulas do curso de boas-vindas
DO $$
DECLARE
    welcome_course_id UUID;
BEGIN
    SELECT id INTO welcome_course_id FROM courses WHERE title = 'Bem-vindo ao Portal Elite' LIMIT 1;
    
    IF welcome_course_id IS NOT NULL THEN
        INSERT INTO lessons (course_id, title, description, order_index, is_active) VALUES
            (welcome_course_id, 'Introdução ao Portal', 'Visão geral das funcionalidades e como começar', 1, TRUE),
            (welcome_course_id, 'Criando seus Primeiros Links', 'Como criar e otimizar links de afiliado', 2, TRUE),
            (welcome_course_id, 'Estratégias de Conversão', 'Técnicas comprovadas para aumentar suas vendas', 3, TRUE),
            (welcome_course_id, 'Acompanhando Performance', 'Como usar o dashboard para monitorar resultados', 4, TRUE)
        ON CONFLICT DO NOTHING;
    END IF;
END $$;

-- =====================================================
-- CONFIGURAR NOTIFICAÇÕES PADRÃO
-- =====================================================

-- Função para criar notificação de boas-vindas
CREATE OR REPLACE FUNCTION create_welcome_notification(user_id UUID)
RETURNS VOID
LANGUAGE plpgsql
AS $$
BEGIN
    INSERT INTO notifications (
        user_id,
        type,
        title,
        message,
        action_url,
        action_label,
        priority
    ) VALUES (
        user_id,
        'system',
        '🏆 Bem-vindo ao Portal Elite!',
        'Parabéns por se juntar à nossa comunidade premium de afiliados. Explore os recursos disponíveis e maximize seus ganhos.',
        '/dashboard/content',
        'Ver Cursos',
        1
    );
END;
$$;

-- =====================================================
-- CRIAR ÍNDICES ADICIONAIS PARA PERFORMANCE
-- =====================================================

-- Índices para searches frequentes
CREATE INDEX IF NOT EXISTS idx_profiles_email_lower ON profiles(LOWER(email));
CREATE INDEX IF NOT EXISTS idx_products_name_lower ON products(LOWER(name));

-- Índices para relatórios
CREATE INDEX IF NOT EXISTS idx_commissions_date_status ON commissions(conversion_date, status);
CREATE INDEX IF NOT EXISTS idx_link_analytics_date_type ON link_analytics(created_at, event_type);

-- Índices para performance do chat
CREATE INDEX IF NOT EXISTS idx_messages_room_created ON messages(room_id, created_at DESC);

-- =====================================================
-- FUNÇÕES DE MONITORAMENTO
-- =====================================================

-- Função para verificar saúde do banco
CREATE OR REPLACE FUNCTION check_database_health()
RETURNS TABLE (
    metric_name TEXT,
    metric_value TEXT,
    status TEXT
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        'Total de Usuários'::TEXT,
        (SELECT COUNT(*)::TEXT FROM profiles),
        CASE WHEN (SELECT COUNT(*) FROM profiles) > 0 THEN 'OK' ELSE 'WARNING' END;
    
    RETURN QUERY
    SELECT 
        'Produtos Ativos'::TEXT,
        (SELECT COUNT(*)::TEXT FROM products WHERE status = 'active'),
        CASE WHEN (SELECT COUNT(*) FROM products WHERE status = 'active') > 0 THEN 'OK' ELSE 'WARNING' END;
    
    RETURN QUERY
    SELECT 
        'Salas de Chat'::TEXT,
        (SELECT COUNT(*)::TEXT FROM chat_rooms WHERE is_active = TRUE),
        CASE WHEN (SELECT COUNT(*) FROM chat_rooms WHERE is_active = TRUE) > 0 THEN 'OK' ELSE 'WARNING' END;
    
    RETURN QUERY
    SELECT 
        'Links Ativos'::TEXT,
        (SELECT COUNT(*)::TEXT FROM affiliate_links WHERE status = 'active'),
        'INFO';
    
    RETURN QUERY
    SELECT 
        'Comissões Pendentes'::TEXT,
        (SELECT COUNT(*)::TEXT FROM commissions WHERE status = 'pending'),
        'INFO';
END;
$$;

-- Função para limpeza de dados antigos
CREATE OR REPLACE FUNCTION cleanup_old_data()
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
DECLARE
    rows_deleted INTEGER := 0;
BEGIN
    -- Limpar analytics antigas (mais de 6 meses)
    DELETE FROM link_analytics 
    WHERE created_at < NOW() - INTERVAL '6 months' 
    AND event_type = 'click';
    
    GET DIAGNOSTICS rows_deleted = ROW_COUNT;
    
    -- Limpar notificações lidas antigas (mais de 3 meses)
    DELETE FROM notifications 
    WHERE is_read = TRUE 
    AND read_at < NOW() - INTERVAL '3 months';
    
    GET DIAGNOSTICS rows_deleted = rows_deleted + ROW_COUNT;
    
    -- Atualizar estatísticas após limpeza
    ANALYZE;
    
    RETURN rows_deleted;
END;
$$;

-- =====================================================
-- TRIGGER PARA NOTIFICAÇÃO DE BOAS-VINDAS
-- =====================================================

CREATE OR REPLACE FUNCTION trigger_welcome_notification()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    -- Criar notificação de boas-vindas para novos usuários
    IF TG_OP = 'INSERT' THEN
        PERFORM create_welcome_notification(NEW.id);
    END IF;
    
    RETURN NEW;
END;
$$;

-- Aplicar trigger
DROP TRIGGER IF EXISTS welcome_notification_trigger ON profiles;
CREATE TRIGGER welcome_notification_trigger
    AFTER INSERT ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION trigger_welcome_notification();

-- =====================================================
-- CONFIGURAÇÕES FINAIS
-- =====================================================

-- Atualizar estatísticas finais
ANALYZE;

-- Mostrar resumo da configuração
DO $$
BEGIN
    RAISE NOTICE '=== CONFIGURAÇÃO CONCLUÍDA ===';
    RAISE NOTICE 'Tabelas: %', (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public');
    RAISE NOTICE 'Índices: %', (SELECT COUNT(*) FROM pg_indexes WHERE schemaname = 'public');
    RAISE NOTICE 'Funções: %', (SELECT COUNT(*) FROM pg_proc WHERE pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public'));
    RAISE NOTICE 'Categorias: %', (SELECT COUNT(*) FROM categories);
    RAISE NOTICE 'Salas de Chat: %', (SELECT COUNT(*) FROM chat_rooms);
    RAISE NOTICE '';
    RAISE NOTICE 'Para criar um usuário admin, execute:';
    RAISE NOTICE 'SELECT create_initial_admin(''seu@email.com'');';
    RAISE NOTICE '';
    RAISE NOTICE 'Para verificar a saúde do banco:';
    RAISE NOTICE 'SELECT * FROM check_database_health();';
END $$; 