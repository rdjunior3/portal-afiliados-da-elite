#!/bin/bash

# ============================================
# SCRIPT PARA CORRIGIR ERRO 403 EM PRODUCTS
# Executa as correções RLS via CLI do Supabase
# ============================================

echo "🔧 [FIX-RLS] Iniciando correção do erro 403 em products..."

# Verificar se supabase CLI está instalado
if ! command -v supabase &> /dev/null; then
    echo "❌ [FIX-RLS] Supabase CLI não encontrado!"
    echo "💡 [FIX-RLS] Instale com: npm install -g supabase"
    echo "💡 [FIX-RLS] Ou execute o SQL manualmente no Dashboard do Supabase"
    exit 1
fi

# Verificar se está logado
echo "🔐 [FIX-RLS] Verificando autenticação..."
if ! supabase status &> /dev/null; then
    echo "⚠️ [FIX-RLS] Faça login no Supabase:"
    echo "   supabase login"
    echo "💡 [FIX-RLS] Ou execute o SQL manualmente no Dashboard"
    exit 1
fi

echo "✅ [FIX-RLS] CLI configurado corretamente"

# Definir o arquivo SQL principal
SQL_FILE="fix-products-403-error.sql"

if [ ! -f "$SQL_FILE" ]; then
    echo "❌ [FIX-RLS] Arquivo $SQL_FILE não encontrado!"
    echo "💡 [FIX-RLS] Execute este script na pasta /scripts"
    exit 1
fi

echo "📋 [FIX-RLS] Executando correções RLS..."

# Executar o script SQL
if supabase db reset --db-url "postgresql://postgres:password@localhost:5432/postgres"; then
    echo "⚠️ [FIX-RLS] Usando banco local - aplicando correções..."
    
    # Executar via psql se disponível
    if command -v psql &> /dev/null; then
        echo "🔍 [FIX-RLS] Executando via psql local..."
        psql -h localhost -p 5432 -U postgres -d postgres -f "$SQL_FILE"
    else
        echo "💡 [FIX-RLS] Execute manualmente:"
        echo "   cat $SQL_FILE | supabase db reset --db-url YOUR_DATABASE_URL"
    fi
else
    echo "⚠️ [FIX-RLS] Não conseguiu conectar ao banco local"
    echo "💡 [FIX-RLS] Execute manualmente no Dashboard do Supabase:"
    echo ""
    echo "1. Acesse: https://supabase.com/dashboard/project/rbqzddsserknaedojuex"
    echo "2. Vá em SQL Editor"
    echo "3. Cole o conteúdo de: $SQL_FILE"
    echo "4. Execute o script"
    echo ""
    echo "Ou copie o comando abaixo:"
    echo "════════════════════════════════════════════════════════════"
    cat "$SQL_FILE"
    echo "════════════════════════════════════════════════════════════"
fi

echo ""
echo "🎯 [FIX-RLS] PRÓXIMOS PASSOS:"
echo "1. Execute o script SQL no Dashboard do Supabase"
echo "2. Verifique os resultados do diagnóstico"
echo "3. Teste a operação de deletar produto no app"
echo "4. Se ainda houver erro 403, verifique:"
echo "   - Se o usuário tem role 'admin'"
echo "   - Se as políticas RLS foram aplicadas corretamente"
echo ""
echo "🔗 [FIX-RLS] Links úteis:"
echo "   Dashboard: https://supabase.com/dashboard/project/rbqzddsserknaedojuex"
echo "   SQL Editor: https://supabase.com/dashboard/project/rbqzddsserknaedojuex/sql"
echo ""

# Criar um arquivo de instruções
cat > "INSTRUCOES_ERRO_403.md" << EOF
# CORREÇÃO DO ERRO 403 EM PRODUCTS

## Problema Identificado
- Erro 403 ao tentar arquivar produtos
- Usuário admin não consegue fazer UPDATE na tabela products
- Problemas nas políticas RLS (Row Level Security)

## Solução

### Opção 1: Dashboard do Supabase (Recomendado)
1. Acesse: https://supabase.com/dashboard/project/rbqzddsserknaedojuex
2. Vá em **SQL Editor**
3. Cole o conteúdo do arquivo \`fix-products-403-error.sql\`
4. Execute o script
5. Analise os resultados do diagnóstico
6. Teste a operação no app

### Opção 2: Via CLI (Avançado)
\`\`\`bash
# No terminal, na pasta /scripts
./fix-rls-products.sh
\`\`\`

## Verificações Pós-Correção
- [ ] Usuário 04junior.silva09@gmail.com tem role 'admin'
- [ ] Políticas RLS aplicadas corretamente
- [ ] Enum product_status inclui 'archived'
- [ ] Operação de arquivar produto funciona no app

## Se o Problema Persistir
1. Verifique os logs do navegador para outros erros
2. Confirme que as variáveis de ambiente estão corretas
3. Teste a operação manualmente no SQL Editor
4. Considere desabilitar temporariamente o RLS para teste

## Contato
Se precisar de ajuda adicional, compartilhe:
- Resultados do diagnóstico SQL
- Logs completos do navegador
- Screenshot do erro
EOF

echo "📄 [FIX-RLS] Instruções salvas em: INSTRUCOES_ERRO_403.md"
echo "✅ [FIX-RLS] Script de correção concluído!"