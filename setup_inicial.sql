-- DADOS INICIAIS PORTAL AFILIADOS DA ELITE

-- Categorias
INSERT INTO categories (name, slug, description) VALUES 
('Marketing Digital', 'marketing-digital', 'Cursos de marketing'),
('Desenvolvimento', 'desenvolvimento', 'Cursos de programação'),
('Design', 'design', 'Cursos de design')
ON CONFLICT (slug) DO NOTHING;

-- Elite Tips
INSERT INTO elite_tips (title, content, is_active) VALUES
('Dica de Marketing', 'Foque na qualidade, não na quantidade', true),
('Estratégia', 'Conheça bem seu público-alvo', true),
('Conversão', 'Teste sempre suas campanhas', true)
ON CONFLICT (title) DO NOTHING;

-- Chat rooms
INSERT INTO chat_rooms (name, description, type) VALUES
('Geral', 'Sala principal', 'general'),
('Suporte', 'Sala de suporte', 'support'),
('Anúncios', 'Anúncios oficiais', 'announcements')
ON CONFLICT (name) DO NOTHING; 