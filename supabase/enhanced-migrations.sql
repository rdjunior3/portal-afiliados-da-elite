-- ========================================
-- ENHANCED MIGRATIONS - Portal Afiliados da Elite
-- Versão: 2.0 - Funcionalidades Avançadas
-- ========================================

-- ========================================
-- 1. CRIAR SISTEMA DE ROLES E PERMISSÕES
-- ========================================

-- Enum para roles do sistema
CREATE TYPE user_role AS ENUM ('user', 'affiliate', 'moderator', 'admin', 'super_admin');

-- Adicionar role ao perfil
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS role user_role DEFAULT 'user';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS permissions JSONB DEFAULT '{}';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS verification_token TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS login_count INTEGER DEFAULT 0;

-- Criar índice para roles
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);

-- ========================================
-- 2. MELHORAR SISTEMA DE UPLOAD/STORAGE
-- ========================================

-- Tabela para gerenciar uploads
CREATE TABLE IF NOT EXISTS file_uploads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    original_filename TEXT NOT NULL,
    stored_filename TEXT NOT NULL,
    file_path TEXT NOT NULL,
    file_size BIGINT NOT NULL,
    mime_type TEXT NOT NULL,
    file_hash TEXT, -- Para evitar duplicatas
    bucket_name TEXT DEFAULT 'uploads',
    is_public BOOLEAN DEFAULT false,
    metadata JSONB,
    upload_source TEXT, -- 'direct', 'google_drive', 'dropbox', etc.
    external_url TEXT, -- Para links externos como Google Drive
    thumbnail_path TEXT,
    processing_status TEXT DEFAULT 'completed', -- 'pending', 'processing', 'completed', 'failed'
    virus_scan_status TEXT DEFAULT 'pending', -- 'pending', 'clean', 'infected', 'skipped'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para uploads
CREATE INDEX IF NOT EXISTS idx_file_uploads_user ON file_uploads(user_id);
CREATE INDEX IF NOT EXISTS idx_file_uploads_hash ON file_uploads(file_hash);
CREATE INDEX IF NOT EXISTS idx_file_uploads_source ON file_uploads(upload_source);

-- ========================================
-- 3. MELHORAR SISTEMA DE MATERIAIS CRIATIVOS
-- ========================================

-- Atualizar tabela de criativos
ALTER TABLE creatives ADD COLUMN IF NOT EXISTS file_upload_id UUID REFERENCES file_uploads(id) ON DELETE SET NULL;
ALTER TABLE creatives ADD COLUMN IF NOT EXISTS external_link TEXT;
ALTER TABLE creatives ADD COLUMN IF NOT EXISTS preview_url TEXT;
ALTER TABLE creatives ADD COLUMN IF NOT EXISTS usage_instructions TEXT;
ALTER TABLE creatives ADD COLUMN IF NOT EXISTS license_type TEXT DEFAULT 'exclusive'; -- 'exclusive', 'royalty_free', 'attribution'
ALTER TABLE creatives ADD COLUMN IF NOT EXISTS approval_status TEXT DEFAULT 'pending'; -- 'pending', 'approved', 'rejected'
ALTER TABLE creatives ADD COLUMN IF NOT EXISTS approved_by UUID REFERENCES profiles(id);
ALTER TABLE creatives ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE creatives ADD COLUMN IF NOT EXISTS rejection_reason TEXT;

-- ========================================
-- 4. MELHORAR SISTEMA DE CHAT
-- ========================================

-- Criar tabela de salas de chat se não existir
CREATE TABLE IF NOT EXISTS chat_rooms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    type TEXT DEFAULT 'public', -- 'public', 'private', 'direct_message'
    created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    max_members INTEGER DEFAULT 1000,
    is_active BOOLEAN DEFAULT true,
    settings JSONB DEFAULT '{"allow_file_sharing": true, "allow_reactions": true}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar tabela de mensagens se não existir
CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    room_id UUID REFERENCES chat_rooms(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    message_type TEXT DEFAULT 'text', -- 'text', 'file', 'image', 'system'
    file_upload_id UUID REFERENCES file_uploads(id) ON DELETE SET NULL,
    reply_to_id UUID REFERENCES messages(id) ON DELETE SET NULL,
    is_edited BOOLEAN DEFAULT false,
    edited_at TIMESTAMP WITH TIME ZONE,
    is_deleted BOOLEAN DEFAULT false,
    deleted_at TIMESTAMP WITH TIME ZONE,
    metadata JSONB, -- Para menções, formatação, etc.
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela para reações nas mensagens
CREATE TABLE IF NOT EXISTS message_reactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    message_id UUID REFERENCES messages(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    emoji TEXT NOT NULL, -- '👍', '❤️', '😀', etc.
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(message_id, user_id, emoji)
);

-- Tabela para membros das salas
CREATE TABLE IF NOT EXISTS chat_room_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    room_id UUID REFERENCES chat_rooms(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    role TEXT DEFAULT 'member', -- 'member', 'moderator', 'admin'
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_read_at TIMESTAMP WITH TIME ZONE,
    is_muted BOOLEAN DEFAULT false,
    UNIQUE(room_id, user_id)
);

-- ========================================
-- 5. SISTEMA DE INTEGRAÇÃO EXTERNA
-- ========================================

-- Tabela para configurações de integração
CREATE TABLE IF NOT EXISTS external_integrations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    service_name TEXT NOT NULL, -- 'google_drive', 'dropbox', 'mailchimp', 'google_analytics', etc.
    config JSONB NOT NULL, -- Configurações específicas do serviço
    is_active BOOLEAN DEFAULT true,
    last_sync_at TIMESTAMP WITH TIME ZONE,
    sync_status TEXT DEFAULT 'pending', -- 'pending', 'syncing', 'success', 'error'
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, service_name)
);

-- Tabela para webhooks
CREATE TABLE IF NOT EXISTS webhooks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    url TEXT NOT NULL,
    events TEXT[] NOT NULL, -- ['commission.created', 'payment.completed', etc.]
    secret_key TEXT,
    is_active BOOLEAN DEFAULT true,
    last_triggered_at TIMESTAMP WITH TIME ZONE,
    success_count INTEGER DEFAULT 0,
    failure_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela para logs de webhooks
CREATE TABLE IF NOT EXISTS webhook_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    webhook_id UUID REFERENCES webhooks(id) ON DELETE CASCADE,
    event_type TEXT NOT NULL,
    payload JSONB NOT NULL,
    response_status INTEGER,
    response_body TEXT,
    delivered_at TIMESTAMP WITH TIME ZONE,
    attempts INTEGER DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- 6. SISTEMA AVANÇADO DE ANALYTICS
-- ========================================

-- Tabela para eventos personalizados
CREATE TABLE IF NOT EXISTS custom_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    event_name TEXT NOT NULL,
    event_data JSONB,
    source TEXT, -- 'web', 'mobile', 'api', etc.
    session_id TEXT,
    ip_address INET,
    user_agent TEXT,
    referrer TEXT,
    utm_source TEXT,
    utm_medium TEXT,
    utm_campaign TEXT,
    utm_term TEXT,
    utm_content TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para analytics
CREATE INDEX IF NOT EXISTS idx_custom_events_user ON custom_events(user_id);
CREATE INDEX IF NOT EXISTS idx_custom_events_name ON custom_events(event_name);
CREATE INDEX IF NOT EXISTS idx_custom_events_date ON custom_events(created_at);
CREATE INDEX IF NOT EXISTS idx_custom_events_utm_source ON custom_events(utm_source);

-- ========================================
-- 7. SISTEMA DE NOTIFICAÇÕES AVANÇADO
-- ========================================

-- Melhorar tabela de notificações
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'general';
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS priority TEXT DEFAULT 'medium'; -- 'low', 'medium', 'high', 'urgent'
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS delivery_channels TEXT[] DEFAULT ARRAY['in_app']; -- 'in_app', 'email', 'sms', 'push'
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS scheduled_for TIMESTAMP WITH TIME ZONE;
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS sent_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS delivery_status JSONB DEFAULT '{}'; -- Status por canal

-- ========================================
-- 8. TRIGGERS E FUNÇÕES
-- ========================================

-- Trigger para uploads
DROP TRIGGER IF EXISTS update_file_uploads_updated_at ON file_uploads;
CREATE TRIGGER update_file_uploads_updated_at
    BEFORE UPDATE ON file_uploads
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger para chat rooms
DROP TRIGGER IF EXISTS update_chat_rooms_updated_at ON chat_rooms;
CREATE TRIGGER update_chat_rooms_updated_at
    BEFORE UPDATE ON chat_rooms
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger para messages
DROP TRIGGER IF EXISTS update_messages_updated_at ON messages;
CREATE TRIGGER update_messages_updated_at
    BEFORE UPDATE ON messages
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger para integrations
DROP TRIGGER IF EXISTS update_external_integrations_updated_at ON external_integrations;
CREATE TRIGGER update_external_integrations_updated_at
    BEFORE UPDATE ON external_integrations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ========================================
-- 9. FUNÇÕES UTILITÁRIAS
-- ========================================

-- Função para promover usuário (CORRIGIDA)
CREATE OR REPLACE FUNCTION promote_user_role(user_email TEXT, new_role user_role)
RETURNS BOOLEAN AS $$
DECLARE
    rows_affected INTEGER := 0;
BEGIN
    UPDATE profiles 
    SET role = new_role,
        updated_at = NOW()
    WHERE email = user_email;
    
    GET DIAGNOSTICS rows_affected = ROW_COUNT;
    
    RETURN rows_affected > 0;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para criar sala de chat padrão
CREATE OR REPLACE FUNCTION create_default_chat_rooms()
RETURNS VOID AS $$
BEGIN
    INSERT INTO chat_rooms (name, description, type, created_by) VALUES
    ('Geral', 'Discussões gerais da comunidade', 'public', NULL),
    ('Suporte', 'Canal para suporte e dúvidas', 'public', NULL),
    ('Novidades', 'Anúncios e novidades da plataforma', 'public', NULL),
    ('Marketing', 'Discussões sobre estratégias de marketing', 'public', NULL),
    ('Vendas', 'Compartilhamento de resultados e estratégias de vendas', 'public', NULL)
    ON CONFLICT DO NOTHING;
END;
$$ LANGUAGE plpgsql;

-- ========================================
-- 10. POLÍTICAS RLS PARA NOVAS TABELAS
-- ========================================

-- RLS para file_uploads
ALTER TABLE file_uploads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own uploads" ON file_uploads
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can upload files" ON file_uploads
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own uploads" ON file_uploads
    FOR UPDATE USING (auth.uid() = user_id);

-- RLS para chat_rooms
ALTER TABLE chat_rooms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view public chat rooms" ON chat_rooms
    FOR SELECT USING (type = 'public' AND is_active = true);

-- RLS para messages
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view messages in joined rooms" ON messages
    FOR SELECT USING (
        room_id IN (
            SELECT room_id FROM chat_room_members 
            WHERE user_id = auth.uid()
        ) OR
        room_id IN (
            SELECT id FROM chat_rooms 
            WHERE type = 'public' AND is_active = true
        )
    );

CREATE POLICY "Users can send messages" ON messages
    FOR INSERT WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Users can edit own messages" ON messages
    FOR UPDATE USING (auth.uid() = sender_id);

-- RLS para message_reactions
ALTER TABLE message_reactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view reactions" ON message_reactions
    FOR SELECT USING (true);

CREATE POLICY "Users can add reactions" ON message_reactions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove own reactions" ON message_reactions
    FOR DELETE USING (auth.uid() = user_id);

-- RLS para chat_room_members
ALTER TABLE chat_room_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view room members" ON chat_room_members
    FOR SELECT USING (true);

CREATE POLICY "Users can join rooms" ON chat_room_members
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS para external_integrations
ALTER TABLE external_integrations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own integrations" ON external_integrations
    FOR ALL USING (auth.uid() = user_id);

-- RLS para webhooks
ALTER TABLE webhooks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own webhooks" ON webhooks
    FOR ALL USING (auth.uid() = user_id);

-- RLS para custom_events
ALTER TABLE custom_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own events" ON custom_events
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can insert events" ON custom_events
    FOR INSERT WITH CHECK (true);

-- ========================================
-- 11. INSERIR DADOS INICIAIS
-- ========================================

-- Promover usuário específico para super_admin
SELECT promote_user_role('04junior.silva09@gmail.com', 'super_admin');

-- Criar salas de chat padrão
SELECT create_default_chat_rooms();

-- Inserir configurações padrão do sistema
INSERT INTO external_integrations (user_id, service_name, config, is_active) VALUES
(
    (SELECT id FROM profiles WHERE email = '04junior.silva09@gmail.com' LIMIT 1),
    'system_config',
    '{
        "upload_max_size": 10485760,
        "allowed_file_types": ["jpg", "jpeg", "png", "gif", "pdf", "mp4", "mov", "avi"],
        "auto_moderation": true,
        "chat_file_sharing": true,
        "email_notifications": true
    }',
    true
)
ON CONFLICT (user_id, service_name) DO UPDATE SET
    config = EXCLUDED.config,
    updated_at = NOW();

-- ========================================
-- 12. ÍNDICES ADICIONAIS PARA PERFORMANCE
-- ========================================

-- Índices para chat
CREATE INDEX IF NOT EXISTS idx_messages_room_date ON messages(room_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_message_reactions_message ON message_reactions(message_id);
CREATE INDEX IF NOT EXISTS idx_chat_room_members_room ON chat_room_members(room_id);
CREATE INDEX IF NOT EXISTS idx_chat_room_members_user ON chat_room_members(user_id);

-- Índices para webhooks
CREATE INDEX IF NOT EXISTS idx_webhooks_user ON webhooks(user_id);
CREATE INDEX IF NOT EXISTS idx_webhook_logs_webhook ON webhook_logs(webhook_id);
CREATE INDEX IF NOT EXISTS idx_webhook_logs_created ON webhook_logs(created_at);

-- Índices para integrations
CREATE INDEX IF NOT EXISTS idx_external_integrations_user ON external_integrations(user_id);
CREATE INDEX IF NOT EXISTS idx_external_integrations_service ON external_integrations(service_name);

COMMENT ON TABLE file_uploads IS 'Gerenciamento de uploads e links externos';
COMMENT ON TABLE external_integrations IS 'Configurações para integrações com serviços externos';
COMMENT ON TABLE webhooks IS 'Sistema de webhooks para notificações externas';
COMMENT ON TABLE custom_events IS 'Eventos personalizados para analytics avançado';
COMMENT ON TABLE message_reactions IS 'Sistema de reações para mensagens do chat'; 