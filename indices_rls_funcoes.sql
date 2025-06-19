-- ========================================
-- PORTAL AFILIADOS DA ELITE
-- ÍNDICES, RLS E FUNÇÕES DE OTIMIZAÇÃO
-- ========================================

-- ========================================
-- ÍNDICES PARA PERFORMANCE MÁXIMA
-- ========================================

-- Profiles
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_affiliate_id ON profiles(affiliate_id);
CREATE INDEX IF NOT EXISTS idx_profiles_affiliate_code ON profiles(affiliate_code);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_status ON profiles(affiliate_status);
CREATE INDEX IF NOT EXISTS idx_profiles_referred_by ON profiles(referred_by);

-- Products
CREATE INDEX IF NOT EXISTS idx_products_category_id ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);
CREATE INDEX IF NOT EXISTS idx_products_is_featured ON products(is_featured);
CREATE INDEX IF NOT EXISTS idx_products_is_active ON products(is_active);
CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
CREATE INDEX IF NOT EXISTS idx_products_search ON products USING gin(to_tsvector('portuguese', name || ' ' || COALESCE(description, '')));

-- Product Offers
CREATE INDEX IF NOT EXISTS idx_product_offers_product_id ON product_offers(product_id);
CREATE INDEX IF NOT EXISTS idx_product_offers_is_default ON product_offers(is_default);
CREATE INDEX IF NOT EXISTS idx_product_offers_is_active ON product_offers(is_active);

-- Affiliate Links
CREATE INDEX IF NOT EXISTS idx_affiliate_links_user_id ON affiliate_links(user_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_links_product_id ON affiliate_links(product_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_links_custom_slug ON affiliate_links(custom_slug);
CREATE INDEX IF NOT EXISTS idx_affiliate_links_status ON affiliate_links(status);

-- Link Analytics
CREATE INDEX IF NOT EXISTS idx_link_analytics_link_id ON link_analytics(link_id);
CREATE INDEX IF NOT EXISTS idx_link_analytics_user_id ON link_analytics(user_id);
CREATE INDEX IF NOT EXISTS idx_link_analytics_event_type ON link_analytics(event_type);
CREATE INDEX IF NOT EXISTS idx_link_analytics_created_at ON link_analytics(created_at);

-- Commissions
CREATE INDEX IF NOT EXISTS idx_commissions_affiliate_id ON commissions(affiliate_id);
CREATE INDEX IF NOT EXISTS idx_commissions_product_id ON commissions(product_id);
CREATE INDEX IF NOT EXISTS idx_commissions_status ON commissions(status);
CREATE INDEX IF NOT EXISTS idx_commissions_created_at ON commissions(created_at);

-- Courses
CREATE INDEX IF NOT EXISTS idx_courses_category_id ON courses(category_id);
CREATE INDEX IF NOT EXISTS idx_courses_instructor_id ON courses(instructor_id);
CREATE INDEX IF NOT EXISTS idx_courses_is_active ON courses(is_active);
CREATE INDEX IF NOT EXISTS idx_courses_is_featured ON courses(is_featured);

-- Lessons
CREATE INDEX IF NOT EXISTS idx_lessons_course_id ON lessons(course_id);
CREATE INDEX IF NOT EXISTS idx_lessons_order_index ON lessons(order_index);
CREATE INDEX IF NOT EXISTS idx_lessons_is_active ON lessons(is_active);

-- Chat
CREATE INDEX IF NOT EXISTS idx_chat_rooms_created_by ON chat_rooms(created_by);
CREATE INDEX IF NOT EXISTS idx_chat_room_members_room_id ON chat_room_members(room_id);
CREATE INDEX IF NOT EXISTS idx_chat_room_members_user_id ON chat_room_members(user_id);
CREATE INDEX IF NOT EXISTS idx_messages_room_id ON messages(room_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);

-- Notifications
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);

-- ========================================
-- FUNÇÕES AUXILIARES
-- ========================================

-- Função para gerar affiliate_id automático
CREATE OR REPLACE FUNCTION generate_affiliate_id()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.affiliate_id IS NULL THEN
        NEW.affiliate_id := 'AFF' || UPPER(substring(gen_random_uuid()::text, 1, 8));
    END IF;
    IF NEW.affiliate_code IS NULL THEN
        NEW.affiliate_code := UPPER(substring(gen_random_uuid()::text, 1, 10));
    END IF;
    IF NEW.referral_code IS NULL THEN
        NEW.referral_code := 'REF' || UPPER(substring(gen_random_uuid()::text, 1, 8));
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para gerar IDs automáticos
DROP TRIGGER IF EXISTS generate_affiliate_id_trigger ON profiles;
CREATE TRIGGER generate_affiliate_id_trigger
    BEFORE INSERT ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION generate_affiliate_id();

-- Função para atualizar estatísticas do afiliado
CREATE OR REPLACE FUNCTION update_affiliate_stats()
RETURNS TRIGGER AS $$
BEGIN
    -- Atualizar total_earnings e total_conversions
    UPDATE profiles 
    SET 
        total_earnings = (
            SELECT COALESCE(SUM(amount), 0) 
            FROM commissions 
            WHERE affiliate_id = NEW.affiliate_id AND status = 'paid'
        ),
        total_conversions = (
            SELECT COUNT(*) 
            FROM commissions 
            WHERE affiliate_id = NEW.affiliate_id
        ),
        conversion_rate = (
            SELECT CASE 
                WHEN total_clicks > 0 THEN (total_conversions::DECIMAL / total_clicks) * 100
                ELSE 0 
            END
        )
    WHERE id = NEW.affiliate_id;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para atualizar stats do afiliado
DROP TRIGGER IF EXISTS update_affiliate_stats_trigger ON commissions;
CREATE TRIGGER update_affiliate_stats_trigger
    AFTER INSERT OR UPDATE ON commissions
    FOR EACH ROW
    EXECUTE FUNCTION update_affiliate_stats();

-- Função para criar salas de chat padrão
CREATE OR REPLACE FUNCTION create_default_chat_rooms()
RETURNS void AS $$
BEGIN
    INSERT INTO chat_rooms (name, description, type) VALUES
    ('Geral', 'Sala geral para todos os afiliados', 'general'),
    ('Suporte', 'Sala para suporte técnico', 'support'),
    ('Anúncios', 'Sala para anúncios importantes', 'announcements')
    ON CONFLICT DO NOTHING;
END;
$$ language 'plpgsql';

-- Função para obter estatísticas do dashboard
CREATE OR REPLACE FUNCTION get_user_dashboard_data(p_user_id UUID)
RETURNS TABLE(
    total_commissions DECIMAL,
    monthly_commissions DECIMAL,
    total_clicks INTEGER,
    conversion_rate DECIMAL,
    pending_commissions DECIMAL,
    paid_commissions DECIMAL,
    products_count INTEGER,
    top_product JSONB
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COALESCE(SUM(c.amount), 0) as total_commissions,
        COALESCE(SUM(CASE WHEN c.created_at >= date_trunc('month', NOW()) THEN c.amount ELSE 0 END), 0) as monthly_commissions,
        COALESCE(p.total_clicks, 0) as total_clicks,
        COALESCE(p.conversion_rate, 0) as conversion_rate,
        COALESCE(SUM(CASE WHEN c.status = 'pending' THEN c.amount ELSE 0 END), 0) as pending_commissions,
        COALESCE(SUM(CASE WHEN c.status = 'paid' THEN c.amount ELSE 0 END), 0) as paid_commissions,
        (SELECT COUNT(*) FROM products WHERE is_active = true)::INTEGER as products_count,
        COALESCE(
            (SELECT jsonb_build_object(
                'name', pr.name, 
                'earnings', SUM(c2.amount)
            ) 
            FROM commissions c2 
            JOIN products pr ON c2.product_id = pr.id 
            WHERE c2.affiliate_id = p_user_id 
            GROUP BY pr.id, pr.name 
            ORDER BY SUM(c2.amount) DESC 
            LIMIT 1), 
            '{}'::jsonb
        ) as top_product
    FROM profiles p
    LEFT JOIN commissions c ON p.id = c.affiliate_id
    WHERE p.id = p_user_id
    GROUP BY p.total_clicks, p.conversion_rate;
END;
$$ language 'plpgsql';

-- Função para obter ofertas padrão de produto
CREATE OR REPLACE FUNCTION get_product_default_offer(product_uuid UUID)
RETURNS TABLE(
    id UUID,
    product_id UUID,
    name TEXT,
    description TEXT,
    price DECIMAL,
    original_price DECIMAL,
    commission_rate DECIMAL,
    commission_amount DECIMAL,
    promotion_url TEXT,
    is_default BOOLEAN,
    is_active BOOLEAN,
    valid_from TIMESTAMPTZ,
    valid_until TIMESTAMPTZ,
    metadata JSONB,
    sort_order INTEGER,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY
    SELECT po.*
    FROM product_offers po
    WHERE po.product_id = product_uuid 
      AND po.is_active = true
      AND (po.is_default = true OR po.id = (
          SELECT po2.id 
          FROM product_offers po2 
          WHERE po2.product_id = product_uuid 
            AND po2.is_active = true 
          ORDER BY po2.is_default DESC, po2.sort_order ASC 
          LIMIT 1
      ))
    ORDER BY po.is_default DESC, po.sort_order ASC
    LIMIT 1;
END;
$$ language 'plpgsql';

-- Função para estatísticas do afiliado
CREATE OR REPLACE FUNCTION get_affiliate_stats(affiliate_uuid UUID)
RETURNS JSONB AS $$
DECLARE
    stats JSONB;
BEGIN
    SELECT jsonb_build_object(
        'total_earnings', COALESCE(SUM(CASE WHEN status = 'paid' THEN amount ELSE 0 END), 0),
        'pending_earnings', COALESCE(SUM(CASE WHEN status = 'pending' THEN amount ELSE 0 END), 0),
        'total_clicks', COALESCE((SELECT total_clicks FROM profiles WHERE id = affiliate_uuid), 0),
        'total_conversions', COALESCE(COUNT(*), 0),
        'conversion_rate', CASE 
            WHEN (SELECT total_clicks FROM profiles WHERE id = affiliate_uuid) > 0 
            THEN ROUND((COUNT(*)::DECIMAL / (SELECT total_clicks FROM profiles WHERE id = affiliate_uuid)) * 100, 2)
            ELSE 0 
        END,
        'this_month_earnings', COALESCE(SUM(CASE WHEN created_at >= date_trunc('month', NOW()) AND status = 'paid' THEN amount ELSE 0 END), 0),
        'last_month_earnings', COALESCE(SUM(CASE WHEN created_at >= date_trunc('month', NOW() - interval '1 month') AND created_at < date_trunc('month', NOW()) AND status = 'paid' THEN amount ELSE 0 END), 0)
    ) INTO stats
    FROM commissions
    WHERE affiliate_id = affiliate_uuid;
    
    RETURN stats;
END;
$$ language 'plpgsql';

-- ========================================
-- POLÍTICAS RLS (ROW LEVEL SECURITY)
-- ========================================

-- Habilitar RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE affiliate_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE link_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE commissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE lesson_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_room_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE file_uploads ENABLE ROW LEVEL SECURITY;
ALTER TABLE creatives ENABLE ROW LEVEL SECURITY;
ALTER TABLE creative_downloads ENABLE ROW LEVEL SECURITY;
ALTER TABLE elite_tips ENABLE ROW LEVEL SECURITY;

-- Função auxiliar para verificar admin
CREATE OR REPLACE FUNCTION is_admin(user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = user_id 
        AND role IN ('admin', 'super_admin')
    );
END;
$$ language 'plpgsql' SECURITY DEFINER;

-- Função auxiliar para verificar moderator ou admin
CREATE OR REPLACE FUNCTION is_moderator_or_admin(user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = user_id 
        AND role IN ('moderator', 'admin', 'super_admin')
    );
END;
$$ language 'plpgsql' SECURITY DEFINER;

-- PROFILES - Políticas RLS
CREATE POLICY "Users can view own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" ON profiles
    FOR SELECT USING (is_admin());

CREATE POLICY "Admins can update all profiles" ON profiles
    FOR UPDATE USING (is_admin());

CREATE POLICY "Allow profile creation during signup" ON profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- PRODUCTS - Políticas RLS
CREATE POLICY "Everyone can view active products" ON products
    FOR SELECT USING (is_active = true AND status = 'active');

CREATE POLICY "Admins can manage all products" ON products
    FOR ALL USING (is_admin());

-- PRODUCT OFFERS - Políticas RLS
CREATE POLICY "Everyone can view active offers" ON product_offers
    FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage all offers" ON product_offers
    FOR ALL USING (is_admin());

-- AFFILIATE LINKS - Políticas RLS
CREATE POLICY "Users can view own affiliate links" ON affiliate_links
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own affiliate links" ON affiliate_links
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all affiliate links" ON affiliate_links
    FOR SELECT USING (is_admin());

-- LINK ANALYTICS - Políticas RLS
CREATE POLICY "Users can view own analytics" ON link_analytics
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can insert analytics" ON link_analytics
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can view all analytics" ON link_analytics
    FOR SELECT USING (is_admin());

-- COMMISSIONS - Políticas RLS
CREATE POLICY "Users can view own commissions" ON commissions
    FOR SELECT USING (auth.uid() = affiliate_id);

CREATE POLICY "Admins can manage all commissions" ON commissions
    FOR ALL USING (is_admin());

-- COURSES - Políticas RLS
CREATE POLICY "Everyone can view active courses" ON courses
    FOR SELECT USING (is_active = true);

CREATE POLICY "Instructors can manage own courses" ON courses
    FOR ALL USING (auth.uid() = instructor_id);

CREATE POLICY "Admins can manage all courses" ON courses
    FOR ALL USING (is_admin());

-- LESSONS - Políticas RLS
CREATE POLICY "Everyone can view active lessons" ON lessons
    FOR SELECT USING (is_active = true);

CREATE POLICY "Course instructors can manage lessons" ON lessons
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM courses 
            WHERE courses.id = lessons.course_id 
            AND courses.instructor_id = auth.uid()
        ) OR is_admin()
    );

-- MATERIALS - Políticas RLS
CREATE POLICY "Enrolled users can view materials" ON materials
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM course_enrollments 
            WHERE course_enrollments.course_id = materials.course_id 
            AND course_enrollments.user_id = auth.uid()
            AND course_enrollments.is_active = true
        ) OR is_admin()
    );

-- COURSE ENROLLMENTS - Políticas RLS
CREATE POLICY "Users can view own enrollments" ON course_enrollments
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can enroll in courses" ON course_enrollments
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can manage all enrollments" ON course_enrollments
    FOR ALL USING (is_admin());

-- LESSON PROGRESS - Políticas RLS
CREATE POLICY "Users can view own progress" ON lesson_progress
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own progress" ON lesson_progress
    FOR ALL USING (auth.uid() = user_id);

-- CHAT ROOMS - Políticas RLS
CREATE POLICY "Members can view joined rooms" ON chat_rooms
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM chat_room_members 
            WHERE chat_room_members.room_id = chat_rooms.id 
            AND chat_room_members.user_id = auth.uid()
        ) OR is_admin()
    );

-- CHAT ROOM MEMBERS - Políticas RLS
CREATE POLICY "Users can view room memberships" ON chat_room_members
    FOR SELECT USING (
        user_id = auth.uid() OR 
        EXISTS (
            SELECT 1 FROM chat_room_members crm 
            WHERE crm.room_id = chat_room_members.room_id 
            AND crm.user_id = auth.uid()
        ) OR is_admin()
    );

-- MESSAGES - Políticas RLS
CREATE POLICY "Room members can view messages" ON messages
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM chat_room_members 
            WHERE chat_room_members.room_id = messages.room_id 
            AND chat_room_members.user_id = auth.uid()
        ) OR is_admin()
    );

CREATE POLICY "Room members can send messages" ON messages
    FOR INSERT WITH CHECK (
        auth.uid() = sender_id AND
        EXISTS (
            SELECT 1 FROM chat_room_members 
            WHERE chat_room_members.room_id = messages.room_id 
            AND chat_room_members.user_id = auth.uid()
        )
    );

-- NOTIFICATIONS - Políticas RLS
CREATE POLICY "Users can view own notifications" ON notifications
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications" ON notifications
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "System can create notifications" ON notifications
    FOR INSERT WITH CHECK (true);

-- FILE UPLOADS - Políticas RLS
CREATE POLICY "Users can view own uploads" ON file_uploads
    FOR SELECT USING (auth.uid() = user_id OR is_public = true);

CREATE POLICY "Users can upload files" ON file_uploads
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can manage all uploads" ON file_uploads
    FOR ALL USING (is_admin());

-- CREATIVES - Políticas RLS
CREATE POLICY "Everyone can view approved creatives" ON creatives
    FOR SELECT USING (approval_status = 'approved' AND is_active = true);

CREATE POLICY "Users can create creatives" ON creatives
    FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Creators can manage own creatives" ON creatives
    FOR ALL USING (auth.uid() = created_by);

CREATE POLICY "Admins can manage all creatives" ON creatives
    FOR ALL USING (is_admin());

-- ELITE TIPS - Políticas RLS
CREATE POLICY "Everyone can view active tips" ON elite_tips
    FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage tips" ON elite_tips
    FOR ALL USING (is_admin()); 