-- Tabela de métodos de pagamento dos afiliados
CREATE TABLE IF NOT EXISTS payment_methods_user (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  method_type payment_method NOT NULL,
  is_primary BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  
  -- Dados PIX
  pix_key TEXT,
  pix_key_type TEXT, -- 'cpf', 'email', 'phone', 'random'
  
  -- Dados bancários
  bank_name TEXT,
  bank_code TEXT,
  agency TEXT,
  account_number TEXT,
  account_type TEXT, -- 'checking', 'savings'
  account_holder_name TEXT,
  account_holder_document TEXT,
  
  -- PayPal
  paypal_email TEXT,
  
  -- Crypto
  crypto_wallet_address TEXT,
  crypto_currency TEXT, -- 'BTC', 'ETH', 'USDT'
  crypto_network TEXT, -- 'mainnet', 'polygon', 'bsc'
  
  verification_status TEXT DEFAULT 'pending', -- 'pending', 'verified', 'rejected'
  verification_date TIMESTAMPTZ,
  verification_notes TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de pagamentos realizados
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  payment_method_id UUID REFERENCES payment_methods_user(id) ON DELETE SET NULL,
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'BRL',
  gross_amount DECIMAL(10,2) NOT NULL,
  fees DECIMAL(10,2) DEFAULT 0,
  net_amount DECIMAL(10,2) NOT NULL,
  commission_ids UUID[], -- Array de IDs das comissões incluídas
  payment_method payment_method NOT NULL,
  status payment_status DEFAULT 'pending',
  reference_code TEXT UNIQUE,
  external_transaction_id TEXT,
  payment_date TIMESTAMPTZ,
  processed_at TIMESTAMPTZ,
  failure_reason TEXT,
  receipt_url TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de notificações
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  type notification_type NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  action_url TEXT,
  action_label TEXT,
  is_read BOOLEAN DEFAULT false,
  is_sent_email BOOLEAN DEFAULT false,
  is_sent_push BOOLEAN DEFAULT false,
  priority INTEGER DEFAULT 1, -- 1=baixa, 2=média, 3=alta, 4=crítica
  metadata JSONB,
  expires_at TIMESTAMPTZ,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de configurações de notificação por usuário
CREATE TABLE IF NOT EXISTS notification_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  email_notifications BOOLEAN DEFAULT true,
  push_notifications BOOLEAN DEFAULT true,
  sms_notifications BOOLEAN DEFAULT false,
  
  -- Tipos específicos de notificações
  notify_new_commission BOOLEAN DEFAULT true,
  notify_payment_processed BOOLEAN DEFAULT true,
  notify_new_product BOOLEAN DEFAULT true,
  notify_performance_reports BOOLEAN DEFAULT true,
  notify_system_updates BOOLEAN DEFAULT true,
  notify_marketing_tips BOOLEAN DEFAULT false,
  
  -- Frequência de relatórios
  weekly_report BOOLEAN DEFAULT true,
  monthly_report BOOLEAN DEFAULT true,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Tabela de relatórios automáticos
CREATE TABLE IF NOT EXISTS automated_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  report_type TEXT NOT NULL, -- 'weekly', 'monthly', 'quarterly'
  period_start TIMESTAMPTZ NOT NULL,
  period_end TIMESTAMPTZ NOT NULL,
  total_clicks INTEGER DEFAULT 0,
  total_conversions INTEGER DEFAULT 0,
  total_commissions DECIMAL(10,2) DEFAULT 0,
  conversion_rate DECIMAL(5,2) DEFAULT 0,
  top_products JSONB, -- Array com os produtos mais performáticos
  recommendations TEXT,
  report_data JSONB, -- Dados completos do relatório
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_payment_methods_user ON payment_methods_user(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_methods_primary ON payment_methods_user(is_primary);
CREATE INDEX IF NOT EXISTS idx_payment_methods_active ON payment_methods_user(is_active);

CREATE INDEX IF NOT EXISTS idx_payments_user ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_date ON payments(payment_date);
CREATE INDEX IF NOT EXISTS idx_payments_reference ON payments(reference_code);

CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_date ON notifications(created_at);

CREATE INDEX IF NOT EXISTS idx_notification_preferences_user ON notification_preferences(user_id);

CREATE INDEX IF NOT EXISTS idx_reports_user ON automated_reports(user_id);
CREATE INDEX IF NOT EXISTS idx_reports_type ON automated_reports(report_type);
CREATE INDEX IF NOT EXISTS idx_reports_period ON automated_reports(period_start, period_end);

-- Triggers para updated_at
CREATE TRIGGER update_payment_methods_user_updated_at
    BEFORE UPDATE ON payment_methods_user
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payments_updated_at
    BEFORE UPDATE ON payments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notification_preferences_updated_at
    BEFORE UPDATE ON notification_preferences
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column(); 