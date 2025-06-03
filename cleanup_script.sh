#!/bin/bash

# =====================================================
# SCRIPT DE LIMPEZA: Portal Afiliados da Elite
# Data: 2025-01-30
# Objetivo: Remover arquivos desnecessários automaticamente
# =====================================================

echo "🧹 INICIANDO LIMPEZA DO PROJETO..."

# Criar backup antes da limpeza
echo "📦 Criando backup..."
mkdir -p backup_$(date +%Y%m%d_%H%M%S)
cp *.md backup_$(date +%Y%m%d_%H%M%S)/ 2>/dev/null || true
cp *.sql backup_$(date +%Y%m%d_%H%M%S)/ 2>/dev/null || true

# Scripts SQL Duplicados
echo "🗑️ Removendo scripts SQL duplicados..."
rm -f supabase_storage_fix.sql
rm -f supabase_storage_fix_simplified.sql
rm -f supabase_storage_super_simple.sql
rm -f supabase_storage_fix_SAFE.sql
rm -f supabase_storage_fix_FINAL.sql
rm -f diagnostico_completo.sql

# Documentação Obsoleta
echo "🗑️ Removendo documentação obsoleta..."
rm -f CORREÇÕES_URGENTES.md
rm -f ACTION_REQUIRED.md
rm -f INVESTIGACAO_PROBLEMAS.md
rm -f INSTRUÇÕES_STORAGE_FIX.md
rm -f DEBUG-COMPLETE-PROFILE.md
rm -f INSTRUCOES-APLICAR-MELHORIAS.md
rm -f MELHORIAS-UPLOAD-IMAGEM-LAYOUT-IMPLEMENTADAS.md
rm -f MELHORIAS-LAYOUT-MODERNO-IMPLEMENTADAS.md
rm -f VERIFICAR-ADMIN-PERMISSIONS.sql
rm -f RESUMO-PADRONIZACAO-IMPLEMENTADA.md
rm -f PADRONIZACAO-DESIGN-LAYOUT.md
rm -f CORRECAO-LOGOUT-TRAVADO-V2.md
rm -f AUDITORIA-DESIGN-LAYOUT.md
rm -f CORRECAO-LOGOUT-TRAVADO.md
rm -f CORRECAO-ERRO-COMPILACAO.md
rm -f MELHORIAS-LOGOMARCA-EMOJIS.md
rm -f ANALISE-INTERFACE-MELHORIAS.md
rm -f APPLY-MIGRATIONS-INSTRUCTIONS.md
rm -f backup-codigo-principal.md
rm -f backup-projeto.md
rm -f BACKUP-INDEX.md
rm -f BACKUP-COMPLETO-INSTRUCOES.md
rm -f FORCE-VERCEL-DEPLOY.md
rm -f VERCEL-FIX-404.md
rm -f SUPABASE-CONFIG.md
rm -f README-SETUP.md
rm -f GUIA_INVESTIGACAO_COMPLETA.md

# Arquivos Específicos
echo "🗑️ Removendo arquivos específicos..."
rm -f postcss.config.js 2>/dev/null || true

# Listar arquivos mantidos
echo "✅ ARQUIVOS MANTIDOS:"
echo "📄 README.md"
echo "📄 IMPLEMENTACAO_COMPLETA.md"
echo "📄 GUIA_INTERFACE_SUPABASE.md"
echo "📄 ANALISE_COMPLETA_APLICATIVO.md"
echo "🗄️ fix_database_schema.sql"
echo "🗄️ fix_storage_policies_supabase_hosted.sql"
echo "🗄️ test_all_functionality.sql"

# Listar arquivos removidos
echo ""
echo "🗑️ ARQUIVOS REMOVIDOS:"
removed_count=0

for file in supabase_storage_fix.sql supabase_storage_fix_simplified.sql supabase_storage_super_simple.sql supabase_storage_fix_SAFE.sql supabase_storage_fix_FINAL.sql diagnostico_completo.sql CORREÇÕES_URGENTES.md ACTION_REQUIRED.md INVESTIGACAO_PROBLEMAS.md; do
    if [ ! -f "$file" ]; then
        echo "✅ $file"
        ((removed_count++))
    fi
done

echo ""
echo "📊 RESUMO DA LIMPEZA:"
echo "🗑️ Arquivos removidos: $removed_count+"
echo "💾 Backup criado em: backup_$(date +%Y%m%d_%H%M%S)/"
echo "✨ Projeto limpo e organizado!"

echo ""
echo "🎯 PRÓXIMOS PASSOS:"
echo "1. Execute as correções críticas"
echo "2. Teste as funcionalidades"
echo "3. Deploy do aplicativo limpo"

echo ""
echo "✅ LIMPEZA CONCLUÍDA COM SUCESSO!" 