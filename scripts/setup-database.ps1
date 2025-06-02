# =====================================================
# SCRIPT DE CONFIGURAÇÃO DO BANCO DE DADOS
# Portal Afiliados da Elite - Windows PowerShell
# =====================================================

param(
    [string]$AdminEmail,
    [switch]$SkipMigration,
    [switch]$ResetDatabase,
    [switch]$Help
)

# Cores para output
$ErrorColor = "Red"
$SuccessColor = "Green"
$InfoColor = "Cyan"
$WarningColor = "Yellow"

function Write-ColorOutput($ForegroundColor) {
    $fc = $host.UI.RawUI.ForegroundColor
    $host.UI.RawUI.ForegroundColor = $ForegroundColor
    
    if ($args) {
        Write-Output $args
    } else {
        $input | Write-Output
    }
    
    $host.UI.RawUI.ForegroundColor = $fc
}

function Show-Help {
    Write-Host @"
🏆 PORTAL AFILIADOS DA ELITE - CONFIGURAÇÃO DO BANCO DE DADOS

USO:
    .\setup-database.ps1 [OPÇÕES]

OPÇÕES:
    -AdminEmail <email>     Email do usuário para promover a admin
    -SkipMigration         Pula a execução da migração principal
    -ResetDatabase         Reseta completamente o banco (CUIDADO!)
    -Help                  Mostra esta ajuda

EXEMPLOS:
    .\setup-database.ps1 -AdminEmail "admin@empresa.com"
    .\setup-database.ps1 -ResetDatabase -AdminEmail "admin@empresa.com"
    .\setup-database.ps1 -SkipMigration

REQUISITOS:
    - Node.js instalado
    - Supabase CLI instalado (npm install -g @supabase/cli)
    - Projeto Supabase configurado

"@ -ForegroundColor $InfoColor
}

function Test-Prerequisites {
    Write-Host "🔍 Verificando pré-requisitos..." -ForegroundColor $InfoColor
    
    # Verificar Node.js
    try {
        $nodeVersion = node --version
        Write-Host "✅ Node.js: $nodeVersion" -ForegroundColor $SuccessColor
    } catch {
        Write-Host "❌ Node.js não encontrado. Instale em https://nodejs.org" -ForegroundColor $ErrorColor
        return $false
    }
    
    # Verificar Supabase CLI
    try {
        $supabaseVersion = npx supabase --version
        Write-Host "✅ Supabase CLI: $supabaseVersion" -ForegroundColor $SuccessColor
    } catch {
        Write-Host "❌ Supabase CLI não encontrado. Instale com: npm install -g @supabase/cli" -ForegroundColor $ErrorColor
        return $false
    }
    
    # Verificar se está no diretório correto
    if (-not (Test-Path "supabase/migrations")) {
        Write-Host "❌ Diretório supabase/migrations não encontrado. Execute no diretório raiz do projeto." -ForegroundColor $ErrorColor
        return $false
    }
    
    return $true
}

function Invoke-DatabaseReset {
    Write-Host "⚠️  ATENÇÃO: Isso irá APAGAR TODOS OS DADOS!" -ForegroundColor $WarningColor
    $confirmation = Read-Host "Digite 'CONFIRMO' para continuar"
    
    if ($confirmation -ne "CONFIRMO") {
        Write-Host "❌ Operação cancelada." -ForegroundColor $ErrorColor
        return $false
    }
    
    Write-Host "🔄 Resetando banco de dados..." -ForegroundColor $InfoColor
    
    try {
        npx supabase db reset
        Write-Host "✅ Banco resetado com sucesso!" -ForegroundColor $SuccessColor
        return $true
    } catch {
        Write-Host "❌ Erro ao resetar banco: $($_.Exception.Message)" -ForegroundColor $ErrorColor
        return $false
    }
}

function Invoke-DatabaseMigration {
    Write-Host "📊 Aplicando migração da estrutura otimizada..." -ForegroundColor $InfoColor
    
    try {
        # Verificar se há migrações pendentes
        $migrationFiles = Get-ChildItem "supabase/migrations" -Filter "*.sql" | Sort-Object Name
        
        if ($migrationFiles.Count -eq 0) {
            Write-Host "❌ Nenhuma migração encontrada em supabase/migrations/" -ForegroundColor $ErrorColor
            return $false
        }
        
        Write-Host "📄 Migrações encontradas:" -ForegroundColor $InfoColor
        foreach ($file in $migrationFiles) {
            Write-Host "   - $($file.Name)" -ForegroundColor $InfoColor
        }
        
        # Aplicar migrações
        npx supabase db push
        Write-Host "✅ Migração aplicada com sucesso!" -ForegroundColor $SuccessColor
        return $true
    } catch {
        Write-Host "❌ Erro ao aplicar migração: $($_.Exception.Message)" -ForegroundColor $ErrorColor
        return $false
    }
}

function Invoke-InitialSetup {
    Write-Host "⚙️ Executando configuração inicial..." -ForegroundColor $InfoColor
    
    $setupScript = "scripts/setup-database.sql"
    
    if (-not (Test-Path $setupScript)) {
        Write-Host "❌ Script de configuração não encontrado: $setupScript" -ForegroundColor $ErrorColor
        return $false
    }
    
    try {
        # Executar script de configuração
        Get-Content $setupScript | npx supabase db query
        Write-Host "✅ Configuração inicial executada!" -ForegroundColor $SuccessColor
        return $true
    } catch {
        Write-Host "❌ Erro na configuração inicial: $($_.Exception.Message)" -ForegroundColor $ErrorColor
        return $false
    }
}

function Set-AdminUser($email) {
    if (-not $email) {
        Write-Host "⚠️ Email de admin não fornecido. Pule esta etapa por agora." -ForegroundColor $WarningColor
        return $true
    }
    
    Write-Host "👑 Configurando usuário admin: $email" -ForegroundColor $InfoColor
    
    try {
        $query = "SELECT create_initial_admin('$email');"
        echo $query | npx supabase db query
        Write-Host "✅ Usuário admin configurado!" -ForegroundColor $SuccessColor
        return $true
    } catch {
        Write-Host "❌ Erro ao configurar admin: $($_.Exception.Message)" -ForegroundColor $ErrorColor
        Write-Host "💡 Dica: Primeiro faça login com este email no sistema." -ForegroundColor $InfoColor
        return $false
    }
}

function Test-DatabaseHealth {
    Write-Host "🏥 Verificando saúde do banco de dados..." -ForegroundColor $InfoColor
    
    try {
        $query = "SELECT * FROM check_database_health();"
        $result = echo $query | npx supabase db query
        
        Write-Host "📊 Status do Banco:" -ForegroundColor $InfoColor
        Write-Host $result -ForegroundColor $InfoColor
        
        return $true
    } catch {
        Write-Host "❌ Erro ao verificar saúde do banco: $($_.Exception.Message)" -ForegroundColor $ErrorColor
        return $false
    }
}

# =====================================================
# EXECUÇÃO PRINCIPAL
# =====================================================

function Main {
    Write-Host @"
🏆 ===================================================
   PORTAL AFILIADOS DA ELITE
   Configuração Otimizada do Banco de Dados
==================================================== 🏆
"@ -ForegroundColor $InfoColor

    if ($Help) {
        Show-Help
        return
    }
    
    # Verificar pré-requisitos
    if (-not (Test-Prerequisites)) {
        Write-Host "❌ Pré-requisitos não atendidos. Corrija os problemas acima." -ForegroundColor $ErrorColor
        return
    }
    
    $success = $true
    
    # Reset do banco se solicitado
    if ($ResetDatabase) {
        $success = $success -and (Invoke-DatabaseReset)
    }
    
    # Aplicar migração principal
    if (-not $SkipMigration -and $success) {
        $success = $success -and (Invoke-DatabaseMigration)
    }
    
    # Configuração inicial
    if ($success) {
        $success = $success -and (Invoke-InitialSetup)
    }
    
    # Configurar admin
    if ($success) {
        $success = $success -and (Set-AdminUser $AdminEmail)
    }
    
    # Verificar saúde do banco
    if ($success) {
        Test-DatabaseHealth | Out-Null
    }
    
    # Resultado final
    Write-Host "`n" -NoNewline
    if ($success) {
        Write-Host @"
🎉 ===================================================
   CONFIGURAÇÃO CONCLUÍDA COM SUCESSO!
==================================================== 🎉

✅ Banco de dados configurado e otimizado
✅ Todas as tabelas e índices criados
✅ Dados iniciais inseridos
✅ Funções e triggers configurados

🚀 PRÓXIMOS PASSOS:
   1. Acesse o dashboard da aplicação
   2. Faça login com sua conta
   3. Se configurou admin, teste as funcionalidades administrativas
   4. Explore os recursos disponíveis

💡 COMANDOS ÚTEIS:
   - Verificar saúde: SELECT * FROM check_database_health();
   - Criar admin: SELECT create_initial_admin('email@exemplo.com');
   - Limpeza: SELECT cleanup_old_data();

"@ -ForegroundColor $SuccessColor
    } else {
        Write-Host @"
❌ ===================================================
   CONFIGURAÇÃO FALHOU
==================================================== ❌

Verifique os erros acima e tente novamente.

🔧 SOLUÇÕES COMUNS:
   1. Verificar conexão com Supabase
   2. Conferir permissões do banco
   3. Validar estrutura do projeto
   4. Consultar logs detalhados

"@ -ForegroundColor $ErrorColor
    }
}

# Executar script principal
Main 