-- ========================================
-- DADOS INICIAIS E CONFIGURAÇÃO DE STORAGE
-- ========================================

-- ========================================
-- 1. CATEGORIAS PADRÃO
-- ========================================

INSERT INTO categories (name, slug, description, color, sort_order) VALUES
('Marketing Digital', 'marketing-digital', 'Produtos e cursos de marketing digital', '#3B82F6', 1),
('Desenvolvimento', 'desenvolvimento', 'Cursos de programação e desenvolvimento', '#10B981', 2),
('Design', 'design', 'Cursos e ferramentas de design', '#8B5CF6', 3),
('Negócios', 'negocios', 'Empreendedorismo e gestão de negócios', '#F59E0B', 4),
('Saúde e Fitness', 'saude-fitness', 'Produtos de saúde e bem-estar', '#EF4444', 5),
('Educação', 'educacao', 'Cursos educacionais diversos', '#06B6D4', 6)
ON CONFLICT (slug) DO NOTHING;

-- ========================================
-- 2. PRODUTOS EXEMPLO
-- ========================================

INSERT INTO products (
    name, slug, short_description, description, category_id, price, original_price, 
    commission_rate, sales_page_url, affiliate_link, is_featured, status
) VALUES
(
    'Curso Completo de Marketing Digital',
    'curso-marketing-digital-completo',
    'Aprenda marketing digital do zero ao profissional',
    'Um curso completo que ensina desde conceitos básicos até estratégias avançadas de marketing digital, incluindo SEO, Google Ads, Facebook Ads e muito mais.',
    (SELECT id FROM categories WHERE slug = 'marketing-digital'),
    497.00,
    997.00,
    50.00,
    'https://exemplo.com/marketing-digital',
    'https://exemplo.com/aff/marketing-digital',
    true,
    'active'
),
(
    'Bootcamp Full-Stack JavaScript',
    'bootcamp-fullstack-javascript',
    'Torne-se um desenvolvedor full-stack em 6 meses',
    'Bootcamp intensivo para formar desenvolvedores full-stack com JavaScript, React, Node.js e banco de dados.',
    (SELECT id FROM categories WHERE slug = 'desenvolvimento'),
    1497.00,
    2497.00,
    40.00,
    'https://exemplo.com/bootcamp-js',
    'https://exemplo.com/aff/bootcamp-js',
    true,
    'active'
),
(
    'Design System Masterclass',
    'design-system-masterclass',
    'Crie design systems profissionais',
    'Aprenda a criar e implementar design systems escaláveis para produtos digitais.',
    (SELECT id FROM categories WHERE slug = 'design'),
    397.00,
    697.00,
    45.00,
    'https://exemplo.com/design-system',
    'https://exemplo.com/aff/design-system',
    false,
    'active'
)
ON CONFLICT (slug) DO NOTHING;

-- ========================================
-- 3. OFERTAS PADRÃO PARA PRODUTOS
-- ========================================

INSERT INTO product_offers (
    product_id, name, description, price, commission_rate, is_default, is_active
)
SELECT 
    p.id,
    'Oferta Padrão',
    'Oferta principal do produto',
    p.price,
    p.commission_rate,
    true,
    true
FROM products p
ON CONFLICT DO NOTHING;

-- ========================================
-- 4. CURSOS EDUCACIONAIS
-- ========================================

INSERT INTO courses (
    title, description, category_id, is_free, is_featured, is_active, skill_level
) VALUES
(
    'Introdução ao Marketing de Afiliados',
    'Aprenda os fundamentos do marketing de afiliados e como começar sua jornada',
    (SELECT id FROM categories WHERE slug = 'marketing-digital'),
    true,
    true,
    true,
    'beginner'
),
(
    'Estratégias Avançadas de Conversão',
    'Técnicas avançadas para maximizar suas conversões como afiliado',
    (SELECT id FROM categories WHERE slug = 'marketing-digital'),
    false,
    true,
    true,
    'advanced'
),
(
    'Criação de Landing Pages que Convertem',
    'Como criar landing pages de alta conversão para seus produtos',
    (SELECT id FROM categories WHERE slug = 'design'),
    false,
    false,
    true,
    'intermediate'
)
ON CONFLICT DO NOTHING;

-- ========================================
-- 5. AULAS DOS CURSOS
-- ========================================

-- Aulas do curso de Introdução ao Marketing de Afiliados
INSERT INTO lessons (course_id, title, description, order_index, is_preview, is_active)
SELECT 
    c.id,
    'O que é Marketing de Afiliados',
    'Conceitos fundamentais e como funciona o marketing de afiliados',
    1,
    true,
    true
FROM courses c WHERE c.title = 'Introdução ao Marketing de Afiliados'
UNION ALL
SELECT 
    c.id,
    'Escolhendo Produtos para Promover',
    'Como escolher os melhores produtos para seu nicho',
    2,
    false,
    true
FROM courses c WHERE c.title = 'Introdução ao Marketing de Afiliados'
UNION ALL
SELECT 
    c.id,
    'Criando Conteúdo que Converte',
    'Estratégias para criar conteúdo que gera vendas',
    3,
    false,
    true
FROM courses c WHERE c.title = 'Introdução ao Marketing de Afiliados'
ON CONFLICT DO NOTHING;

-- ========================================
-- 6. SALAS DE CHAT PADRÃO
-- ========================================

INSERT INTO chat_rooms (name, description, type, is_active) VALUES
('🎯 Geral', 'Sala principal para discussões gerais', 'general', true),
('📞 Suporte', 'Sala para suporte técnico e dúvidas', 'support', true),
('📢 Anúncios', 'Anúncios importantes da plataforma', 'announcements', true),
('💡 Dicas e Estratégias', 'Compartilhe dicas e estratégias de marketing', 'general', true)
ON CONFLICT (name) DO NOTHING;

-- ========================================
-- 7. ELITE TIPS INICIAIS
-- ========================================

INSERT INTO elite_tips (title, content, icon, order_index, is_active) VALUES
(
    'Foque na Qualidade',
    'É melhor promover poucos produtos de alta qualidade do que muitos produtos mediocres. Sua audiência confia em você!',
    'star',
    1,
    true
),
(
    'Conheça Seu Público',
    'Entenda profundamente seu público-alvo. Quanto melhor você conhecer suas dores e desejos, mais efetivas serão suas campanhas.',
    'users',
    2,
    true
),
(
    'Teste e Otimize',
    'Sempre teste diferentes abordagens: headlines, calls-to-action, formatos de conteúdo. O que funciona hoje pode não funcionar amanhã.',
    'trending-up',
    3,
    true
),
(
    'Transparência é Fundamental',
    'Sempre declare seus links de afiliado. A transparência gera confiança e confiança gera vendas a longo prazo.',
    'shield-check',
    4,
    true
),
(
    'Invista em Educação',
    'O marketing digital está sempre evoluindo. Dedique tempo para aprender novas estratégias e ferramentas.',
    'book-open',
    5,
    true
)
ON CONFLICT (title) DO NOTHING;

-- ========================================
-- 8. EXECUTAR FUNÇÃO PARA CRIAR SALAS PADRÃO
-- ========================================

SELECT create_default_chat_rooms();

-- ========================================
-- 9. STORAGE BUCKETS (Executar no Supabase Dashboard)
-- ========================================

/*
-- Execute estes comandos no Supabase Dashboard > Storage:

-- 1. Bucket para avatares (público)
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true);

-- 2. Bucket para imagens de produtos (público)
INSERT INTO storage.buckets (id, name, public) VALUES ('product-images', 'product-images', true);

-- 3. Bucket para materiais de curso (privado)
INSERT INTO storage.buckets (id, name, public) VALUES ('course-materials', 'course-materials', false);

-- 4. Bucket para criatividade (público)
INSERT INTO storage.buckets (id, name, public) VALUES ('creatives', 'creatives', true);

-- 5. Bucket para uploads gerais (privado)
INSERT INTO storage.buckets (id, name, public) VALUES ('uploads', 'uploads', false);

-- Políticas para avatares
CREATE POLICY "Avatar images are publicly accessible" ON storage.objects
FOR SELECT USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload avatar images" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'avatars' AND auth.uid() = owner);

CREATE POLICY "Users can update own avatar images" ON storage.objects
FOR UPDATE USING (bucket_id = 'avatars' AND auth.uid() = owner);

-- Políticas para product-images
CREATE POLICY "Product images are publicly accessible" ON storage.objects
FOR SELECT USING (bucket_id = 'product-images');

CREATE POLICY "Admins can upload product images" ON storage.objects
FOR INSERT WITH CHECK (
    bucket_id = 'product-images' AND 
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
);

-- Políticas para course-materials
CREATE POLICY "Enrolled users can view course materials" ON storage.objects
FOR SELECT USING (
    bucket_id = 'course-materials' AND
    EXISTS (
        SELECT 1 FROM course_enrollments ce
        WHERE ce.user_id = auth.uid() AND ce.is_active = true
    )
);

-- Políticas para creatives
CREATE POLICY "Creatives are publicly accessible" ON storage.objects
FOR SELECT USING (bucket_id = 'creatives');

CREATE POLICY "Users can upload creatives" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'creatives' AND auth.uid() = owner);

-- Políticas para uploads gerais
CREATE POLICY "Users can view own uploads" ON storage.objects
FOR SELECT USING (bucket_id = 'uploads' AND auth.uid() = owner);

CREATE POLICY "Users can upload files" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'uploads' AND auth.uid() = owner);
*/

-- ========================================
-- 10. VIEWS ÚTEIS
-- ========================================

-- View para estatísticas do admin dashboard
CREATE OR REPLACE VIEW admin_dashboard_stats AS
SELECT 
    (SELECT COUNT(*) FROM profiles WHERE affiliate_status = 'pending') as pending_affiliates,
    (SELECT COUNT(*) FROM profiles WHERE affiliate_status = 'approved') as approved_affiliates,
    (SELECT COUNT(*) FROM commissions WHERE status = 'pending') as pending_commissions,
    (SELECT COALESCE(SUM(amount), 0) FROM commissions WHERE status = 'pending') as pending_commissions_value,
    (SELECT COUNT(*) FROM commissions WHERE status = 'approved') as pending_payments,
    (SELECT COALESCE(SUM(amount), 0) FROM commissions WHERE status = 'approved') as pending_payments_value,
    (SELECT COUNT(*) FROM products WHERE is_active = true) as active_products,
    (SELECT COUNT(*) FROM courses WHERE is_active = true) as active_courses;

-- ========================================
-- 11. MENSAGEM DE SUCESSO
-- ========================================

DO $$
BEGIN
    RAISE NOTICE '🎉 Estrutura do Portal Afiliados da Elite criada com sucesso!';
    RAISE NOTICE '📊 Dados iniciais inseridos';
    RAISE NOTICE '🔐 Políticas RLS configuradas';
    RAISE NOTICE '⚡ Índices criados para performance máxima';
    RAISE NOTICE '🚀 Sistema pronto para uso!';
END $$; 