#!/bin/bash

echo "🧹 INICIANDO LIMPEZA DO PROJETO - Portal Afiliados da Elite"
echo "=================================================="

# Contador de arquivos removidos
removed_count=0

# Função para remover arquivo se existir
remove_file() {
    if [ -f "$1" ]; then
        echo "❌ Removendo: $1"
        rm "$1"
        ((removed_count++))
    fi
}

# Função para remover diretório se existir
remove_dir() {
    if [ -d "$1" ]; then
        echo "❌ Removendo diretório: $1"
        rm -rf "$1"
        ((removed_count++))
    fi
}

echo ""
echo "📋 REMOVENDO DOCUMENTAÇÃO OBSOLETA..."
echo "--------------------------------------"

# Documentação obsoleta identificada
remove_file "MELHORIAS_MOBILE_IMPLEMENTADAS.md"
remove_file "SOLUCAO_PROBLEMAS_DATABASE.md"
remove_file "README_DICAS_ELITE.md"
remove_file "IMPLEMENTACAO_FINAL.md"
remove_file "IMPLEMENTACAO_COMPLETA.md"
remove_file "ANALISE_COMPLETA_APLICATIVO.md"
remove_file "CORREÇÕES_URGENTES.md"
remove_file "ACTION_REQUIRED.md"
remove_file "INVESTIGACAO_PROBLEMAS.md"
remove_file "INSTRUÇÕES_STORAGE_FIX.md"
remove_file "DEBUG-COMPLETE-PROFILE.md"
remove_file "INSTRUCOES-APLICAR-MELHORIAS.md"
remove_file "MELHORIAS-UPLOAD-IMAGEM-LAYOUT-IMPLEMENTADAS.md"
remove_file "MELHORIAS-LAYOUT-MODERNO-IMPLEMENTADAS.md"
remove_file "RESUMO-PADRONIZACAO-IMPLEMENTADA.md"
remove_file "PADRONIZACAO-DESIGN-LAYOUT.md"
remove_file "CORRECAO-LOGOUT-TRAVADO-V2.md"
remove_file "AUDITORIA-DESIGN-LAYOUT.md"
remove_file "CORRECAO-LOGOUT-TRAVADO.md"
remove_file "CORRECAO-ERRO-COMPILACAO.md"
remove_file "MELHORIAS-LOGOMARCA-EMOJIS.md"
remove_file "ANALISE-INTERFACE-MELHORIAS.md"
remove_file "APPLY-MIGRATIONS-INSTRUCTIONS.md"
remove_file "backup-codigo-principal.md"
remove_file "backup-projeto.md"
remove_file "BACKUP-INDEX.md"
remove_file "BACKUP-COMPLETO-INSTRUCOES.md"
remove_file "FORCE-VERCEL-DEPLOY.md"
remove_file "VERCEL-FIX-404.md"
remove_file "SUPABASE-CONFIG.md"
remove_file "README-SETUP.md"
remove_file "GUIA_INVESTIGACAO_COMPLETA.md"

echo ""
echo "🗄️ REMOVENDO SCRIPTS SQL DUPLICADOS..."
echo "---------------------------------------"

# Scripts SQL duplicados - manter apenas os essenciais
remove_file "supabase_storage_fix.sql"
remove_file "supabase_storage_fix_simplified.sql"
remove_file "supabase_storage_super_simple.sql"
remove_file "supabase_storage_fix_SAFE.sql"
remove_file "supabase_storage_fix_FINAL.sql"
remove_file "diagnostico_completo.sql"
remove_file "VERIFICAR-ADMIN-PERMISSIONS.sql"

# Scripts que podem ser aplicados uma vez e removidos
remove_file "create_tips_table.sql"

echo ""
echo "🧹 REMOVENDO SCRIPTS DE LIMPEZA ANTIGOS..."
echo "-------------------------------------------"

# Scripts de limpeza antigos
remove_file "cleanup_script.ps1"
remove_file "cleanup_script.sh"

echo ""
echo "📊 RELATÓRIO FINAL..."
echo "--------------------"
echo "✅ Arquivos removidos: $removed_count"
echo ""

# Arquivos que devem permanecer
echo "💾 ARQUIVOS MANTIDOS (essenciais):"
echo "  ✅ README.md"
echo "  ✅ ANALISE_COMPLETA_MELHORIAS_2025.md"
echo "  ✅ GUIA_INTERFACE_SUPABASE.md"
echo "  ✅ fix_database_schema.sql"
echo "  ✅ fix_storage_policies_supabase_hosted.sql"
echo "  ✅ test_all_functionality.sql"
echo ""

if [ $removed_count -gt 0 ]; then
    echo "🎉 LIMPEZA CONCLUÍDA COM SUCESSO!"
    echo "   Projeto mais organizado e limpo."
else
    echo "ℹ️  Nenhum arquivo desnecessário encontrado."
    echo "   Projeto já estava limpo."
fi

echo ""
echo "🚀 PRÓXIMOS PASSOS:"
echo "   1. Execute os scripts SQL essenciais no Supabase"
echo "   2. Teste as funcionalidades principais"
echo "   3. Implemente as melhorias identificadas"
echo ""
echo "==================================================" 