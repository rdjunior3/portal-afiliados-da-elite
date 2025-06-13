import { supabase } from '@/integrations/supabase/client';

export const testSupabaseConnection = async () => {
  console.log('🔗 [TestSupabase] Testando conexão...');
  
  try {
    // 1. Teste básico de autenticação
    console.log('🔐 [TestSupabase] Verificando autenticação...');
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError) {
      console.error('❌ [TestSupabase] Erro de autenticação:', authError.message);
      return false;
    }
    
    if (user) {
      console.log('✅ [TestSupabase] Usuário autenticado:', user.email);
    } else {
      console.warn('⚠️ [TestSupabase] Nenhum usuário autenticado');
      return false;
    }

    // 2. Teste simples de leitura na tabela profiles
    console.log('📊 [TestSupabase] Testando leitura de dados...');
    const { data: profiles, error: profileError } = await supabase
      .from('profiles')
      .select('id, email')
      .limit(1);
    
    if (profileError) {
      console.error('❌ [TestSupabase] Erro ao ler profiles:', profileError.message);
      return false;
    }
    
    console.log('✅ [TestSupabase] Profiles acessíveis:', profiles?.length || 0);

    // 3. Teste de leitura nas principais tabelas (sem insert)
    const tables = ['products', 'categories', 'elite_tips'];
    
    for (const table of tables) {
      try {
        const { data, error } = await supabase
          .from(table)
          .select('id')
          .limit(1);
        
        if (error) {
          console.warn(`⚠️ [TestSupabase] Problema com ${table}:`, error.message);
        } else {
          console.log(`✅ [TestSupabase] ${table} acessível:`, data?.length || 0, 'registros');
        }
      } catch (err) {
        console.warn(`⚠️ [TestSupabase] Erro inesperado em ${table}:`, err);
      }
    }
    
    console.log('🎉 [TestSupabase] Teste de conexão concluído com sucesso!');
    return true;
    
  } catch (error) {
    console.error('💥 [TestSupabase] Erro geral:', error);
    return false;
  }
};

export const createProductImagesBucket = async () => {
  console.log('🪣 [TestSupabase] Verificando bucket product-images...');
  
  try {
    // Verificar se o bucket já existe
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      console.error('❌ [TestSupabase] Erro ao listar buckets:', listError.message);
      return false;
    }
    
    const productBucket = buckets?.find(bucket => bucket.name === 'product-images');
    
    if (productBucket) {
      console.log('✅ [TestSupabase] Bucket product-images já existe!');
      return true;
    }
    
    console.warn('⚠️ [TestSupabase] Bucket product-images não encontrado - isso é estranho...');
    return false;
    
  } catch (error) {
    console.error('💥 [TestSupabase] Erro ao verificar bucket:', error);
    return false;
  }
}; 