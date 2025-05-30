import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configurações do Supabase - PROJETO CORRETO
const SUPABASE_URL = 'https://rbqzddsserknaedojuex.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJicXpkZHNzZXJrbmFlZG9qdWV4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0ODYyMTg2NiwiZXhwIjoyMDY0MTk3ODY2fQ.mGYUrl4_X52dLTt-LtwOwsGDTshaYgr5T6-lwix9VUY';

// Criar cliente do Supabase com service role
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function executeSQLCommand(sql) {
  try {
    // Método mais direto usando fetch para APIs REST do Supabase
    const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        'apikey': SUPABASE_SERVICE_KEY,
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify({ query: sql })
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`HTTP ${response.status}: ${error}`);
    }

    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function applyMigrations() {
  console.log('🚀 Iniciando aplicação das migrações...\n');
  console.log(`🔗 Projeto: ${SUPABASE_URL}\n`);

  const migrationsDir = path.join(__dirname, '..', 'supabase', 'migrations');
  
  try {
    // Ler todos os arquivos de migração
    const files = fs.readdirSync(migrationsDir)
      .filter(file => file.endsWith('.sql'))
      .sort(); // Ordenar por nome para garantir sequência

    console.log(`📁 Encontradas ${files.length} migrações:\n`);

    for (const file of files) {
      console.log(`⏳ Aplicando: ${file}`);
      
      const migrationPath = path.join(migrationsDir, file);
      const sql = fs.readFileSync(migrationPath, 'utf8');
      
      // Dividir SQL em comandos menores para evitar problemas
      const commands = sql
        .split(';')
        .map(cmd => cmd.trim())
        .filter(cmd => cmd.length > 0);

      let successCount = 0;
      let errorCount = 0;

      for (const command of commands) {
        if (command) {
          const result = await executeSQLCommand(command + ';');
          
          if (result.success) {
            successCount++;
          } else {
            errorCount++;
            console.log(`⚠️  Erro no comando: ${result.error}`);
          }
        }
      }

      console.log(`✅ ${file}: ${successCount} comandos executados, ${errorCount} erros\n`);
    }

    console.log('🎉 Processamento concluído!');
    console.log('\n📋 Próximos passos:');
    console.log('1. Verificar tabelas criadas no dashboard: https://supabase.com/dashboard/project/rbqzddsserknaedojuex/editor');
    console.log('2. Executar o projeto: npm run dev');
    console.log('3. Testar o dashboard em /dashboard');

  } catch (error) {
    console.error('❌ Erro geral:', error.message);
    process.exit(1);
  }
}

// Executar migrações
applyMigrations(); 