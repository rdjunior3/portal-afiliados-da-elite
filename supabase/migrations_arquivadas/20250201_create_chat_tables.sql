-- ========================================
-- Tabelas de Chat
-- ========================================

-- Tabela de salas de chat
CREATE TABLE IF NOT EXISTS chat_rooms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de mensagens
CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    room_id UUID REFERENCES chat_rooms(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    edited BOOLEAN DEFAULT false,
    edited_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX idx_messages_room_id ON messages(room_id);
CREATE INDEX idx_messages_sender_id ON messages(sender_id);
CREATE INDEX idx_messages_created_at ON messages(room_id, created_at DESC);

-- Função para atualizar 'updated_at'
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para a tabela 'chat_rooms'
DROP TRIGGER IF EXISTS update_chat_rooms_updated_at ON public.chat_rooms;
CREATE TRIGGER update_chat_rooms_updated_at
BEFORE UPDATE ON chat_rooms
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

-- Habilitar RLS para a tabela
ALTER TABLE chat_rooms ENABLE ROW LEVEL SECURITY;

-- Política para chat_rooms (afiliados aprovados podem ver salas ativas)
CREATE POLICY "Afiliados aprovados podem ver salas de chat" ON chat_rooms
    FOR SELECT
    USING (
        is_active = true AND
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.affiliate_status = 'approved'
        )
    );

-- Política para messages (afiliados aprovados podem ver e enviar mensagens)
CREATE POLICY "Afiliados aprovados podem ver mensagens" ON messages
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.affiliate_status = 'approved'
        )
    );

CREATE POLICY "Afiliados aprovados podem enviar mensagens" ON messages
    FOR INSERT
    WITH CHECK (
        auth.uid() = sender_id AND
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.affiliate_status = 'approved'
        ) AND
        EXISTS (
            SELECT 1 FROM chat_rooms 
            WHERE chat_rooms.id = room_id 
            AND chat_rooms.is_active = true
        )
    );

CREATE POLICY "Usuários podem editar suas próprias mensagens" ON messages
    FOR UPDATE
    USING (
        auth.uid() = sender_id AND
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.affiliate_status = 'approved'
        )
    )
    WITH CHECK (
        auth.uid() = sender_id
    );

-- Políticas para admin
CREATE POLICY "Admin tem acesso total a chat_rooms" ON chat_rooms
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

CREATE POLICY "Admin tem acesso total a messages" ON messages
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

-- Função para marcar mensagem como editada
CREATE OR REPLACE FUNCTION mark_message_edited()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.content != NEW.content THEN
        NEW.edited = true;
        NEW.edited_at = NOW();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER mark_message_edited_trigger
    BEFORE UPDATE ON messages
    FOR EACH ROW
    EXECUTE FUNCTION mark_message_edited(); 