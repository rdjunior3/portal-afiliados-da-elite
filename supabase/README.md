# Portal Afiliados da Elite - Banco de Dados Otimizado

## 🚀 Estrutura do Banco de Dados

Este projeto utiliza uma estrutura de banco de dados altamente otimizada para máximo desempenho e escalabilidade, projetada especificamente para o Portal de Afiliados da Elite.

## 📊 Tabelas Principais

### 1. **profiles** - Perfis de Usuários/Afiliados
- Armazena informações completas dos afiliados
- Campo `full_name` gerado automaticamente
- Métricas de performance integradas
- Sistema de referência hierárquica

### 2. **products** - Produtos para Afiliação
- Estrutura completa para e-commerce
- Suporte a múltiplas mídias e categorias
- Métricas de conversão e performance
- Sistema de tags e keywords

### 3. **affiliate_links** - Links de Afiliado
- Sistema avançado de tracking
- Suporte a UTM parameters
- Analytics integrados
- Restrições de segurança

### 4. **commissions** - Sistema de Comissões
- Workflow completo de aprovação
- Múltiplas moedas
- Controle de disputas e reembolsos
- Auditoria completa

### 5. **courses & lessons** - Sistema Educacional
- Estrutura hierárquica de cursos
- Materiais de apoio
- Controle de progresso

### 6. **chat_rooms & messages** - Sistema de Chat
- Chat em tempo real
- Moderação e controles
- Histórico persistente

## ⚡ Otimizações de Performance

### Índices Estratégicos
- **Busca por texto completo** em produtos (PostgreSQL GIN)
- **Índices compostos** para queries complexas
- **Índices parciais** para consultas filtradas
- **Índices de ordenação** para paginação eficiente

### Triggers Automáticos
- **Atualização automática** de timestamps
- **Geração de IDs** de afiliado
- **Cálculo de métricas** em tempo real
- **Validações de dados** no banco

### Funções Utilitárias
- `log_link_click()` - Registro otimizado de cliques
- `log_conversion()` - Sistema de conversões
- `generate_performance_report()` - Relatórios automáticos

## 🔒 Segurança (RLS)

### Políticas de Acesso
- **Usuários** veem apenas seus próprios dados
- **Admins** têm acesso completo
- **Produtos ativos** são públicos
- **Mensagens** seguem regras específicas

## 📈 Analytics Avançado

### Tabela `link_analytics`
- Rastreamento detalhado de eventos
- Geolocalização e device info
- Métricas de conversão
- Dados para ML/BI

### View `admin_dashboard_stats`
- Estatísticas em tempo real
- Agregações otimizadas
- Dashboard administrativo

## 🛠️ Como Aplicar

### 1. Execução Local (Supabase CLI)
```bash
# Navegar para o diretório do projeto
cd "PORTAL AFILIADOS DA ELITE"

# Aplicar migração
npx supabase db push

# Ou reset completo
npx supabase db reset
```

### 2. Execução em Produção
```bash
# Via CLI do Supabase (recomendado)
npx supabase db push --linked

# Ou via interface web do Supabase
# Copie o conteúdo da migração e execute no SQL Editor
```

### 3. Verificação da Estrutura
```sql
-- Verificar tabelas criadas
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' ORDER BY table_name;

-- Verificar índices
SELECT indexname, tablename FROM pg_indexes 
WHERE schemaname = 'public' ORDER BY tablename;

-- Verificar funções
SELECT proname FROM pg_proc 
WHERE pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public');
```

## 📋 Dados Iniciais

### Sala de Chat Padrão
- **"Comunidade da Elite"** criada automaticamente
- Descrição premium configurada
- Pronta para uso imediato

### Categorias Padrão
- Marketing Digital
- Educação
- Saúde e Bem-estar
- Tecnologia
- Finanças

## 🔧 Configurações Recomendadas

### PostgreSQL Settings
```sql
-- Otimização para performance
ALTER SYSTEM SET shared_buffers = '256MB';
ALTER SYSTEM SET effective_cache_size = '1GB';
ALTER SYSTEM SET random_page_cost = 1.1;
ALTER SYSTEM SET seq_page_cost = 1.0;

-- Reload configuration
SELECT pg_reload_conf();
```

### Monitoring
```sql
-- Ver queries lentas
SELECT query, mean_exec_time, calls 
FROM pg_stat_statements 
ORDER BY mean_exec_time DESC LIMIT 10;

-- Ver uso de índices
SELECT schemaname, tablename, indexname, idx_scan, idx_tup_read, idx_tup_fetch
FROM pg_stat_user_indexes 
ORDER BY idx_scan DESC;
```

## 🚨 Troubleshooting

### Problemas Comuns

1. **Erro de permissão RLS**
   ```sql
   -- Verificar se o usuário é admin
   UPDATE profiles SET role = 'admin' WHERE email = 'seu@email.com';
   ```

2. **Funções não funcionam**
   ```sql
   -- Recriar extensões
   CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
   CREATE EXTENSION IF NOT EXISTS "pg_trgm";
   ```

3. **Performance lenta**
   ```sql
   -- Atualizar estatísticas
   ANALYZE;
   
   -- Reindexar se necessário
   REINDEX DATABASE postgres;
   ```

## 📊 Monitoramento

### Métricas Importantes
- Taxa de conversão de links
- Performance de queries
- Uso de índices
- Crescimento de dados

### Backups
- Configurar backup automático diário
- Testar restore regularmente
- Manter pelo menos 30 dias de histórico

## 🎯 Próximos Passos

1. **Aplicar a migração** no seu ambiente
2. **Criar primeiro usuário admin**
3. **Testar todas as funcionalidades**
4. **Configurar monitoramento**
5. **Implementar backups**

## 📞 Suporte

Para dúvidas ou problemas:
1. Verificar logs do Supabase
2. Consultar documentação oficial
3. Revisar políticas RLS
4. Verificar permissões de usuário

---

**Estrutura criada para máximo desempenho e escalabilidade** 🚀 