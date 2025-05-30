-- DADOS DE EXEMPLO PARA PORTAL AFILIADOS DA ELITE
-- Execute este SQL APÓS aplicar a migração completa

-- 1. INSERIR PRODUTOS DE EXEMPLO
INSERT INTO products (name, slug, short_description, description, thumbnail_url, price, original_price, commission_rate, affiliate_link, vendor_name, vendor_email, target_audience, keywords, tags, gravity_score, earnings_per_click, conversion_rate_avg, refund_rate, is_featured, is_exclusive, status, category_id) 
SELECT 
  'Curso Completo de Marketing Digital 2024',
  'curso-marketing-digital-2024',
  'Aprenda todas as estratégias de marketing digital que realmente funcionam em 2024',
  'Um curso completo e atualizado com todas as estratégias de marketing digital para 2024. Inclui Facebook Ads, Google Ads, Instagram, TikTok, Email Marketing e muito mais.',
  'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400',
  497.00,
  997.00,
  50.00,
  'https://hotmart.com/curso-marketing-digital-2024',
  'João Silva',
  'joao@marketingpro.com',
  'Empreendedores, profissionais de marketing, iniciantes',
  ARRAY['marketing digital', 'facebook ads', 'google ads', 'instagram', 'tiktok'],
  ARRAY['curso', 'marketing', 'ads', 'social media'],
  95,
  12.50,
  8.5,
  5.2,
  true,
  true,
  'active',
  c.id
FROM categories c WHERE c.name = 'Marketing Digital'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO products (name, slug, short_description, description, thumbnail_url, price, original_price, commission_rate, affiliate_link, vendor_name, vendor_email, target_audience, keywords, tags, gravity_score, earnings_per_click, conversion_rate_avg, refund_rate, is_featured, is_exclusive, status, category_id) 
SELECT 
  'Fórmula Negócio Online - Do Zero ao Primeiro Milhão',
  'formula-negocio-online',
  'Método completo para criar um negócio online lucrativo do zero',
  'Descubra o método exato que já ajudou mais de 5.000 pessoas a criar negócios online lucrativos. Desde a escolha do nicho até a primeira venda.',
  'https://images.unsplash.com/photo-1553484771-371a605b060b?w=400',
  997.00,
  1997.00,
  60.00,
  'https://hotmart.com/formula-negocio-online',
  'Maria Santos',
  'maria@negocioonline.com',
  'Pessoas que querem empreender online, profissionais liberais',
  ARRAY['negócio online', 'empreendedorismo', 'renda extra', 'trabalhar em casa'],
  ARRAY['negócio', 'online', 'empreendedorismo', 'renda'],
  88,
  24.50,
  6.8,
  7.1,
  true,
  false,
  'active',
  c.id
FROM categories c WHERE c.name = 'Negócios Online'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO products (name, slug, short_description, description, thumbnail_url, price, original_price, commission_rate, affiliate_link, vendor_name, vendor_email, target_audience, keywords, tags, gravity_score, earnings_per_click, conversion_rate_avg, refund_rate, is_featured, is_exclusive, status, category_id) 
SELECT 
  'Python para Análise de Dados - Bootcamp Completo',
  'python-analise-dados-bootcamp',
  'Domine Python e se torne um analista de dados profissional',
  'Bootcamp intensivo de Python para análise de dados. Aprenda Pandas, NumPy, Matplotlib, Seaborn e muito mais. Com projetos práticos reais.',
  'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400',
  697.00,
  1297.00,
  45.00,
  'https://hotmart.com/python-analise-dados',
  'Carlos Tech',
  'carlos@pythonpro.com',
  'Profissionais de TI, estudantes, analistas',
  ARRAY['python', 'análise de dados', 'data science', 'programação'],
  ARRAY['python', 'dados', 'programação', 'bootcamp'],
  82,
  18.30,
  7.2,
  4.8,
  true,
  false,
  'active',
  c.id
FROM categories c WHERE c.name = 'Tecnologia'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO products (name, slug, short_description, description, thumbnail_url, price, original_price, commission_rate, affiliate_link, vendor_name, vendor_email, target_audience, keywords, tags, gravity_score, earnings_per_click, conversion_rate_avg, refund_rate, is_featured, is_exclusive, status, category_id) 
SELECT 
  'Investimentos Inteligentes - Estratégias para 2024',
  'investimentos-inteligentes-2024',
  'Aprenda a investir seu dinheiro de forma inteligente e segura',
  'Curso completo sobre investimentos com estratégias atualizadas para 2024. Ações, fundos, renda fixa, criptomoedas e muito mais.',
  'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=400',
  397.00,
  797.00,
  40.00,
  'https://hotmart.com/investimentos-inteligentes',
  'Ana Financeira',
  'ana@investsmart.com',
  'Pessoas que querem investir, iniciantes no mercado financeiro',
  ARRAY['investimentos', 'ações', 'fundos', 'renda fixa', 'criptomoedas'],
  ARRAY['investimentos', 'finanças', 'dinheiro', 'bolsa'],
  78,
  8.90,
  9.1,
  6.3,
  true,
  false,
  'active',
  c.id
FROM categories c WHERE c.name = 'Finanças'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO products (name, slug, short_description, description, thumbnail_url, price, original_price, commission_rate, affiliate_link, vendor_name, vendor_email, target_audience, keywords, tags, gravity_score, earnings_per_click, conversion_rate_avg, refund_rate, is_featured, is_exclusive, status, category_id) 
SELECT 
  'Protocolo Saúde Total - Transforme seu Corpo em 90 Dias',
  'protocolo-saude-total',
  'Método comprovado para perder peso e ganhar saúde em 90 dias',
  'Protocolo completo de alimentação e exercícios para transformar seu corpo e sua saúde em apenas 90 dias. Com acompanhamento nutricional.',
  'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400',
  297.00,
  597.00,
  55.00,
  'https://hotmart.com/protocolo-saude-total',
  'Dr. Pedro Saúde',
  'pedro@saudetotal.com',
  'Pessoas que querem emagrecer, melhorar a saúde',
  ARRAY['emagrecimento', 'saúde', 'exercícios', 'alimentação', 'dieta'],
  ARRAY['saúde', 'emagrecimento', 'exercícios', 'dieta'],
  91,
  15.80,
  11.2,
  8.5,
  true,
  true,
  'active',
  c.id
FROM categories c WHERE c.name = 'Saúde e Bem-estar'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO products (name, slug, short_description, description, thumbnail_url, price, original_price, commission_rate, affiliate_link, vendor_name, vendor_email, target_audience, keywords, tags, gravity_score, earnings_per_click, conversion_rate_avg, refund_rate, is_featured, is_exclusive, status, category_id) 
SELECT 
  'Inglês Fluente em 6 Meses - Método Revolucionário',
  'ingles-fluente-6-meses',
  'Fale inglês fluentemente em apenas 6 meses com nosso método exclusivo',
  'Método revolucionário para aprender inglês de forma rápida e eficiente. Com aulas práticas, conversação e certificação internacional.',
  'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=400',
  597.00,
  997.00,
  50.00,
  'https://hotmart.com/ingles-fluente',
  'Teacher Mike',
  'mike@englishfast.com',
  'Estudantes, profissionais, viajantes',
  ARRAY['inglês', 'idiomas', 'conversação', 'fluência', 'certificação'],
  ARRAY['inglês', 'idiomas', 'educação', 'conversação'],
  85,
  16.70,
  8.9,
  5.8,
  false,
  false,
  'active',
  c.id
FROM categories c WHERE c.name = 'Educação'
ON CONFLICT (slug) DO NOTHING;

-- 2. VERIFICAR SE OS PRODUTOS FORAM INSERIDOS
SELECT 
  p.name,
  p.commission_rate,
  p.status,
  c.name as category_name,
  p.is_featured
FROM products p
LEFT JOIN categories c ON c.id = p.category_id
WHERE p.status = 'active'
ORDER BY p.is_featured DESC, p.created_at DESC; 