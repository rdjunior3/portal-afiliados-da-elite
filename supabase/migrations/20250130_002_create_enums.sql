-- Tipos customizados para o sistema de afiliados

-- Status de produtos
CREATE TYPE product_status AS ENUM ('active', 'inactive', 'pending', 'archived');

-- Status de comissões
CREATE TYPE commission_status AS ENUM ('pending', 'approved', 'paid', 'cancelled', 'disputed');

-- Tipos de eventos de analytics
CREATE TYPE analytics_event_type AS ENUM ('click', 'view', 'conversion', 'signup', 'purchase');

-- Tipos de criativos
CREATE TYPE creative_type AS ENUM ('banner', 'video', 'text', 'email', 'social', 'landing_page');

-- Status de links de afiliado
CREATE TYPE link_status AS ENUM ('active', 'inactive', 'expired');

-- Tipos de notificações
CREATE TYPE notification_type AS ENUM ('commission', 'payment', 'product', 'system', 'achievement');

-- Status de usuário
CREATE TYPE user_status AS ENUM ('active', 'inactive', 'pending', 'suspended');

-- Tipos de pagamento
CREATE TYPE payment_method AS ENUM ('pix', 'bank_transfer', 'paypal', 'crypto');

-- Status de pagamento
CREATE TYPE payment_status AS ENUM ('pending', 'processing', 'completed', 'failed', 'cancelled'); 