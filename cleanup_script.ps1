# =====================================================
# SCRIPT DE LIMPEZA: Portal Afiliados da Elite
# Data: 2025-01-30
# Objetivo: Remover arquivos desnecessários automaticamente
# Plataforma: Windows PowerShell
# =====================================================

Write-Host "🧹 INICIANDO LIMPEZA DO PROJETO..." -ForegroundColor Green

# Criar backup antes da limpeza
Write-Host "📦 Criando backup..." -ForegroundColor Yellow
$backupFolder = "backup_$(Get-Date -Format 'yyyyMMdd_HHmmss')"
New-Item -ItemType Directory -Path $backupFolder -Force | Out-Null

# Backup de arquivos importantes
Get-ChildItem -Path "." -Filter "*.md" -ErrorAction SilentlyContinue | Copy-Item -Destination $backupFolder -ErrorAction SilentlyContinue
Get-ChildItem -Path "." -Filter "*.sql" -ErrorAction SilentlyContinue | Copy-Item -Destination $backupFolder -ErrorAction SilentlyContinue

# Scripts SQL Duplicados
Write-Host "🗑️ Removendo scripts SQL duplicados..." -ForegroundColor Red
$sqlFiles = @(
    "supabase_storage_fix.sql",
    "supabase_storage_fix_simplified.sql",
    "supabase_storage_super_simple.sql", 
    "supabase_storage_fix_SAFE.sql",
    "supabase_storage_fix_FINAL.sql",
    "diagnostico_completo.sql"
)

foreach ($file in $sqlFiles) {
    if (Test-Path $file) {
        Remove-Item $file -Force
        Write-Host "  ✅ Removido: $file" -ForegroundColor Green
    }
}

# Documentação Obsoleta
Write-Host "🗑️ Removendo documentação obsoleta..." -ForegroundColor Red
$docFiles = @(
    "CORREÇÕES_URGENTES.md",
    "ACTION_REQUIRED.md",
    "INVESTIGACAO_PROBLEMAS.md",
    "INSTRUÇÕES_STORAGE_FIX.md",
    "DEBUG-COMPLETE-PROFILE.md",
    "INSTRUCOES-APLICAR-MELHORIAS.md",
    "MELHORIAS-UPLOAD-IMAGEM-LAYOUT-IMPLEMENTADAS.md",
    "MELHORIAS-LAYOUT-MODERNO-IMPLEMENTADAS.md",
    "VERIFICAR-ADMIN-PERMISSIONS.sql",
    "RESUMO-PADRONIZACAO-IMPLEMENTADA.md",
    "PADRONIZACAO-DESIGN-LAYOUT.md",
    "CORRECAO-LOGOUT-TRAVADO-V2.md",
    "AUDITORIA-DESIGN-LAYOUT.md",
    "CORRECAO-LOGOUT-TRAVADO.md",
    "CORRECAO-ERRO-COMPILACAO.md",
    "MELHORIAS-LOGOMARCA-EMOJIS.md",
    "ANALISE-INTERFACE-MELHORIAS.md",
    "APPLY-MIGRATIONS-INSTRUCTIONS.md",
    "backup-codigo-principal.md",
    "backup-projeto.md",
    "BACKUP-INDEX.md",
    "BACKUP-COMPLETO-INSTRUCOES.md",
    "FORCE-VERCEL-DEPLOY.md",
    "VERCEL-FIX-404.md",
    "SUPABASE-CONFIG.md",
    "README-SETUP.md",
    "GUIA_INVESTIGACAO_COMPLETA.md"
)

$removedCount = 0
foreach ($file in $docFiles) {
    if (Test-Path $file) {
        Remove-Item $file -Force
        Write-Host "  ✅ Removido: $file" -ForegroundColor Green
        $removedCount++
    }
}

# Arquivos Específicos
Write-Host "🗑️ Removendo arquivos específicos..." -ForegroundColor Red
if (Test-Path "postcss.config.js") {
    Remove-Item "postcss.config.js" -Force -ErrorAction SilentlyContinue
    Write-Host "  ✅ Removido: postcss.config.js" -ForegroundColor Green
}

Write-Host ""
Write-Host "✅ ARQUIVOS MANTIDOS:" -ForegroundColor Green
Write-Host "📄 README.md" -ForegroundColor White
Write-Host "📄 IMPLEMENTACAO_COMPLETA.md" -ForegroundColor White
Write-Host "📄 GUIA_INTERFACE_SUPABASE.md" -ForegroundColor White
Write-Host "📄 ANALISE_COMPLETA_APLICATIVO.md" -ForegroundColor White
Write-Host "📄 IMPLEMENTACAO_FINAL.md" -ForegroundColor White
Write-Host "🗄️ fix_database_schema.sql" -ForegroundColor White
Write-Host "🗄️ fix_storage_policies_supabase_hosted.sql" -ForegroundColor White
Write-Host "🗄️ test_all_functionality.sql" -ForegroundColor White
Write-Host "🗄️ fix_critical_issues.sql" -ForegroundColor White

Write-Host ""
Write-Host "📊 RESUMO DA LIMPEZA:" -ForegroundColor Cyan
Write-Host "🗑️ Arquivos removidos: $removedCount+" -ForegroundColor Yellow
Write-Host "💾 Backup criado em: $backupFolder/" -ForegroundColor Yellow
Write-Host "✨ Projeto limpo e organizado!" -ForegroundColor Green

Write-Host ""
Write-Host "🎯 PRÓXIMOS PASSOS:" -ForegroundColor Cyan
Write-Host "1. Execute as correções críticas no Supabase" -ForegroundColor White
Write-Host "2. Teste as funcionalidades" -ForegroundColor White
Write-Host "3. Deploy do aplicativo limpo" -ForegroundColor White

Write-Host ""
Write-Host "✅ LIMPEZA CONCLUÍDA COM SUCESSO!" -ForegroundColor Green
Write-Host ""
Write-Host "🚀 PRÓXIMO PASSO: Execute os scripts SQL na ordem especificada em IMPLEMENTACAO_FINAL.md" -ForegroundColor Yellow 