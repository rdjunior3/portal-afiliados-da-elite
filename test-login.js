// Teste de conectividade Supabase
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Carregar variáveis de ambiente
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

console.log('🔍 Testando conectividade Supabase...');
console.log('URL:', supabaseUrl);
console.log('Key:', supabaseAnonKey ? 'Configurada ✅' : 'NÃO configurada ❌');

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Variáveis de ambiente não configuradas!');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testConnection() {
  try {
    console.log('\n📡 Testando conexão...');
    
    // Teste básico de conexão
    const { data, error } = await supabase
      .from('profiles')
      .select('count', { count: 'exact', head: true });
    
    if (error) {
      console.error('❌ Erro de conexão:', error.message);
      return false;
    }
    
    console.log('✅ Conexão com Supabase funcionando!');
    console.log('📊 Total de perfis:', data?.length || 'N/A');
    
    // Teste de autenticação
    console.log('\n🔐 Testando autenticação...');
    const { data: session } = await supabase.auth.getSession();
    console.log('Session:', session.session ? 'Ativa' : 'Nenhuma');
    
    return true;
  } catch (err) {
    console.error('❌ Erro inesperado:', err.message);
    return false;
  }
}

testConnection().then(success => {
  if (success) {
    console.log('\n🎉 Login local pronto para uso!');
    console.log('🌐 Acesse: http://localhost:8080');
  } else {
    console.log('\n⚠️ Verifique as configurações do Supabase');
  }
}); 