# 📊 ANÁLISE COMPLETA: ESTRUTURA DO BANCO VIA MCP

**Data:** $(date)  
**Projeto:** Portal Afiliados da Elite  
**ID Supabase:** vhociemaoccrkpcylpit

## 🔍 STATUS ATUAL DA ESTRUTURA

### ✅ ESTRUTURA CONFIRMADA (via tipos gerados)
```typescript
products: {
  // Campos básicos
  id: string
  category_id: string | null
  name: string
  slug: string | null
  short_description: string | null
  description: string | null
  
  // Mídia
  image_url: string | null
  thumbnail_url: string | null
  
  // Preços e comissões
  price: number
  original_price: number | null
  currency: string | null
  commission_rate: number
  commission_amount: number | null
  
  // Link principal
  sales_page_url: string  // ⚠️ NOTA: Este é o campo atual
  
  // Status e configurações
  is_active: boolean | null
  is_exclusive: boolean | null
  is_featured: boolean | null
  min_payout: number | null
  requires_approval: boolean | null
  status: string | null
  
  // Métricas
  gravity_score: number | null
  earnings_per_click: number | null
  conversion_rate_avg: number | null
  refund_rate: number | null
  total_sales: number | null
  
  // Timestamps
  created_at: string | null
  updated_at: string | null
}
```

## ❌ PROBLEMAS IDENTIFICADOS

### 1. **CONFLITO DE CAMPOS CRÍTICO**
- **Código espera:** `affiliate_link` 
- **Banco tem:** `sales_page_url`
- **Impacto:** Inserção falha ao tentar usar campo inexistente

### 2. **CAMPO TAGS AUSENTE**
- **Código tenta inserir:** `tags: string[]`
- **Banco:** Campo não existe na estrutura atual
- **Impacto:** Erro de inserção

### 3. **INCONSISTÊNCIAS ENTRE MIGRAÇÕES**
- **Problema:** 41 scripts SQL conflitantes na pasta db_scripts
- **Resultado:** Estrutura inconsistente entre código e banco
- **Evidência:** Múltiplas versões da tabela products em diferentes arquivos

### 4. **MODELO NÃO ALINHADO PARA CATÁLOGO EXTERNO**
- Campo `affiliate_link` fundamental para modelo externo
- Falta campos específicos para catálogo de afiliação
- Estrutura ainda voltada para sistema interno

## 🔧 ATUALIZAÇÕES NECESSÁRIAS

### PRIORIDADE ALTA (Críticas)

#### 1. **Corrigir Conflito affiliate_link vs sales_page_url**
```sql
-- Opção 1: Adicionar affiliate_link (recomendado)
ALTER TABLE products ADD COLUMN IF NOT EXISTS affiliate_link TEXT;

-- Opção 2: Migrar dados (se sales_page_url contém links de afiliação)
UPDATE products SET affiliate_link = sales_page_url WHERE affiliate_link IS NULL;
```

#### 2. **Adicionar Campo tags**
```sql
ALTER TABLE products ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';
```

#### 3. **Campos Essenciais para Catálogo Externo**
```sql
-- Campo principal para status ativo
ALTER TABLE products ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- Slug para URLs amigáveis (se null)
UPDATE products SET slug = LOWER(REPLACE(name, ' ', '-')) WHERE slug IS NULL;
```

### PRIORIDADE MÉDIA

#### 4. **Otimizar Estrutura para Modelo Externo**
```sql
-- Garantir defaults corretos
ALTER TABLE products ALTER COLUMN currency SET DEFAULT 'BRL';
ALTER TABLE products ALTER COLUMN commission_rate SET DEFAULT 10.0;
ALTER TABLE products ALTER COLUMN is_active SET DEFAULT true;
```

#### 5. **Corrigir Tipos de Status**
```sql
-- Verificar se enum product_status existe
-- CREATE TYPE product_status AS ENUM ('active', 'inactive', 'pending', 'archived');
```

### PRIORIDADE BAIXA

#### 6. **Limpeza e Organização**
- Remover campos desnecessários para modelo externo
- Consolidar migrações conflitantes
- Atualizar documentação da estrutura

## 🛠️ SCRIPT DE CORREÇÃO RECOMENDADO

```sql
-- CORREÇÃO URGENTE: ESTRUTURA PARA CATÁLOGO EXTERNO
-- Execute no Supabase Dashboard → SQL Editor

-- 1. VERIFICAR ESTRUTURA ATUAL
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'products' AND column_name IN (
    'affiliate_link', 'sales_page_url', 'tags', 'is_active', 'slug'
)
ORDER BY column_name;

-- 2. CORRIGIR CAMPOS CRÍTICOS
-- Adicionar affiliate_link (campo principal para modelo externo)
ALTER TABLE products ADD COLUMN IF NOT EXISTS affiliate_link TEXT;

-- Adicionar tags
ALTER TABLE products ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';

-- Garantir is_active existe
ALTER TABLE products ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- 3. MIGRAR DADOS (se necessário)
-- Se sales_page_url contém os links de afiliação, migrar
UPDATE products 
SET affiliate_link = COALESCE(affiliate_link, sales_page_url)
WHERE affiliate_link IS NULL AND sales_page_url IS NOT NULL;

-- 4. TESTE DE INSERÇÃO
DO $$
DECLARE
    test_category_id UUID;
    test_product_id UUID;
BEGIN
    -- Buscar categoria para teste
    SELECT id INTO test_category_id FROM categories LIMIT 1;
    
    -- Inserir produto de teste com estrutura corrigida
    INSERT INTO products (
        name, description, category_id, image_url, 
        affiliate_link, price, commission_rate, 
        commission_amount, tags, is_active
    ) VALUES (
        'Teste Estrutura Corrigida',
        'Produto para testar estrutura corrigida',
        test_category_id,
        'https://exemplo.com/imagem.jpg',
        'https://exemplo.com/affiliate-link',
        99.90, 15.0, 14.99,
        ARRAY['teste', 'estrutura'], true
    ) RETURNING id INTO test_product_id;
    
    -- Remover teste
    DELETE FROM products WHERE id = test_product_id;
    
    RAISE NOTICE 'Teste de estrutura passou! Campos necessários existem.';
END $$;
```

## 📋 CHECKLIST DE VERIFICAÇÃO

- [ ] Campo `affiliate_link` existe e é usado pelo código
- [ ] Campo `tags` existe como TEXT[]
- [ ] Campo `is_active` tem default true
- [ ] Teste de inserção com estrutura completa passa
- [ ] CreateProductModal funciona sem erros
- [ ] Dados migrados corretamente (se necessário)

## 🎯 PRÓXIMOS PASSOS

1. **Executar script de correção** no Supabase Dashboard
2. **Testar criação de produto** no frontend
3. **Verificar se upload e inserção funcionam**
4. **Atualizar tipos TypeScript** se necessário
5. **Documentar estrutura final**

## ⚠️ OBSERVAÇÕES IMPORTANTES

- **Backup recomendado** antes de executar correções
- **Testar em ambiente de desenvolvimento** primeiro
- **Verificar impacto** em produtos existentes
- **Coordenar** com atualizações do código frontend

---

**Status:** Pronto para execução  
**Risco:** Baixo (apenas adições, sem alterações destrutivas)  
**Tempo estimado:** 5-10 minutos 