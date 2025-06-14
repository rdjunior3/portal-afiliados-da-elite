# 🔧 CORREÇÃO DO ERRO 403 - GUIA COMPLETO

Este diretório contém todas as ferramentas necessárias para diagnosticar e corrigir o **erro 403** que está impedindo operações admin na tabela `products`.

## 📁 ARQUIVOS CRIADOS

### 🎯 Scripts Principais
- **`fix-products-403-error.sql`** - Script SQL principal para correção
- **`test-product-update.sql`** - Testes específicos da operação
- **`fix-rls-products.sh`** - Script bash para automação
- **`INSTRUCOES_ERRO_403.md`** - Instruções resumidas

### 📋 Documentação
- **`/docs/RELATORIO_ERRO_403_PRODUCTS.md`** - Relatório técnico completo

## 🚀 EXECUÇÃO RÁPIDA

### Método 1: Dashboard Supabase (RECOMENDADO)

1. **Acesse**: https://supabase.com/dashboard/project/rbqzddsserknaedojuex
2. **Vá para**: SQL Editor
3. **Execute**: Conteúdo de `fix-products-403-error.sql`

### Método 2: Terminal

```bash
cd /workspace/scripts
./fix-rls-products.sh
```

## 🔍 DIAGNÓSTICO DO PROBLEMA

### Erro Atual
```
403 Forbidden - rbqzddsserknaedojuex.supabase.co/rest/v1/products
```

### Causa
- **Políticas RLS conflitantes** na tabela products
- **Múltiplas políticas sobrepostas** impedem UPDATE
- **Validação de role admin** não funciona corretamente

### Solução
- **Limpeza** de políticas conflitantes
- **Criação** de políticas RLS otimizadas
- **Validação** de permissões admin

## 📊 CONTEÚDO DOS SCRIPTS

### 1. fix-products-403-error.sql
```sql
-- DIAGNÓSTICO: Verifica políticas atuais
-- CORREÇÃO: Remove políticas conflitantes
-- CRIAÇÃO: Aplica políticas otimizadas
-- VERIFICAÇÃO: Testa as correções
```

**Principais seções**:
- Diagnóstico de políticas RLS
- Verificação do role admin
- Limpeza de políticas conflitantes
- Criação de 3 políticas otimizadas
- Testes de verificação

### 2. test-product-update.sql
```sql
-- TESTE: Operação específica que falha
-- SIMULAÇÃO: Permissões RLS
-- VALIDAÇÃO: Enum product_status
```

**Principais seções**:
- Verificação do produto específico
- Simulação de permissões RLS
- Teste do enum product_status
- Logs de audit (se existir)

### 3. fix-rls-products.sh
```bash
#!/bin/bash
# AUTOMAÇÃO: Execução via CLI
# VERIFICAÇÃO: Pré-requisitos
# INSTRUÇÕES: Métodos alternativos
```

**Principais funções**:
- Verificação do Supabase CLI
- Execução automatizada
- Instruções para execução manual
- Geração de documentação

## ✅ CHECKLIST DE EXECUÇÃO

### Pré-Execução
- [ ] Backup do banco (se possível)
- [ ] Acesso ao Dashboard do Supabase
- [ ] Confirmação do problema no app

### Durante a Execução
- [ ] Execute o script SQL completo
- [ ] Analise os resultados do diagnóstico
- [ ] Verifique se 3 políticas foram criadas
- [ ] Confirme role 'admin' do usuário

### Pós-Execução
- [ ] Teste arquivar produto no app
- [ ] Verifique logs do navegador
- [ ] Confirme outras operações admin
- [ ] Documente o resultado

## 🎯 POLÍTICAS RLS FINAIS

Após a correção, a tabela `products` terá **3 políticas**:

1. **`products_authenticated_read`** - Leitura para usuários autenticados
2. **`products_admin_full_access`** - Gerenciamento completo para admins
3. **`products_public_read`** - Leitura pública de produtos ativos

## 🚨 TROUBLESHOOTING

### Se o erro persistir:

1. **Verifique role do admin**:
   ```sql
   SELECT email, role FROM profiles WHERE email = '04junior.silva09@gmail.com';
   ```

2. **Confirme políticas aplicadas**:
   ```sql
   SELECT policyname FROM pg_policies WHERE tablename = 'products';
   ```

3. **Teste manual**:
   ```sql
   UPDATE products SET status = 'archived' WHERE id = 'PRODUCT_ID';
   ```

4. **Solução emergencial**:
   ```sql
   -- APENAS PARA TESTE
   ALTER TABLE products DISABLE ROW LEVEL SECURITY;
   ```

## 📞 SUPORTE

Para suporte adicional, forneça:
- Resultado do diagnóstico SQL
- Logs completos do navegador
- Screenshot do erro
- Resultado das queries de teste

## 📝 LOGS E MONITORAMENTO

Após a correção, monitore:
- Operações de CRUD em products
- Logs de erro 403 no navegador
- Desempenho das consultas RLS
- Outros endpoints admin

---

**Autor**: Sistema de Correção Automatizada  
**Data**: 2024-06-14  
**Versão**: 1.0  
**Status**: ✅ Pronto para execução