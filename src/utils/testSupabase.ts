import { supabase } from '@/integrations/supabase/client';

// Helper para timeout em promises
const withTimeout = <T>(promise: Promise<T> | PromiseLike<T>, timeoutMs: number): Promise<T> => {
  return Promise.race([
    Promise.resolve(promise),
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(`Timeout after ${timeoutMs}ms`)), timeoutMs)
    )
  ]);
};

export const testSupabaseConnection = async () => {
  console.log('🔗 [TestSupabase] Testando conexão...');
  
  try {
    // 1. Teste básico de autenticação COM TIMEOUT
    console.log('🔐 [TestSupabase] Verificando autenticação...');
    
    const { data: { user }, error: authError } = await withTimeout(
      supabase.auth.getUser(),
      10000 // Timeout de 10 segundos (aumentado devido aos problemas de conexão)
    );
    
    if (authError) {
      console.error('❌ [TestSupabase] Erro de autenticação:', authError);
      throw authError;
    }
    
    if (!user) {
      console.error('❌ [TestSupabase] Usuário não autenticado');
      throw new Error('Usuário não autenticado');
    }
    
    console.log('✅ [TestSupabase] Usuário autenticado:', user.email);

    // 2. Teste de leitura das tabelas principais com TIMEOUT
    console.log('📊 [TestSupabase] Testando leitura de dados...');
    
    const [profilesResult, productsResult, categoriesResult, eliteTipsResult] = await Promise.all([
      withTimeout(supabase.from('profiles').select('id').limit(1).then(r => r), 3000),
      withTimeout(supabase.from('products').select('id').limit(1).then(r => r), 3000),
      withTimeout(supabase.from('categories').select('id').limit(1).then(r => r), 3000),
      withTimeout(supabase.from('elite_tips').select('id').limit(1).then(r => r), 3000)
    ]);

    // Verificar resultados (com type assertion para PostgrestResponse)
    const profiles = profilesResult as any;
    const products = productsResult as any;
    const categories = categoriesResult as any;
    const eliteTips = eliteTipsResult as any;
    
    if (profiles.error) throw new Error(`Profiles: ${profiles.error.message}`);
    if (products.error) throw new Error(`Products: ${products.error.message}`);
    if (categories.error) throw new Error(`Categories: ${categories.error.message}`);
    if (eliteTips.error) throw new Error(`Elite Tips: ${eliteTips.error.message}`);
    
    console.log('✅ [TestSupabase] Profiles acessíveis:', profiles.data?.length || 0);
    console.log('✅ [TestSupabase] products acessível:', products.data?.length || 0, 'registros');
    console.log('✅ [TestSupabase] categories acessível:', categories.data?.length || 0, 'registros');
    console.log('✅ [TestSupabase] elite_tips acessível:', eliteTips.data?.length || 0, 'registros');

    // 3. Verificar storage buckets
    console.log('🪣 [TestSupabase] Verificando buckets...');
    
    const { data: buckets, error: bucketsError } = await withTimeout(
      supabase.storage.listBuckets(),
      3000
    );
    
    if (bucketsError) {
      console.warn('⚠️ [TestSupabase] Erro ao verificar buckets:', bucketsError.message);
    } else {
      const productImagesBucket = buckets?.find(b => b.id === 'product-images');
      if (productImagesBucket) {
        console.log('✅ [TestSupabase] Bucket product-images encontrado');
      } else {
        console.warn('⚠️ [TestSupabase] Bucket product-images não encontrado');
        
        // Tentar criar o bucket
        console.log('🔨 [TestSupabase] Tentando criar bucket...');
        const { error: createError } = await withTimeout(
          supabase.storage.createBucket('product-images', {
            public: true,
            fileSizeLimit: 52428800, // 50MB
            allowedMimeTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
          }),
          5000
        );
        
        if (createError) {
          console.warn('⚠️ [TestSupabase] Não foi possível criar bucket:', createError.message);
        } else {
          console.log('✅ [TestSupabase] Bucket product-images criado com sucesso');
        }
      }
    }
    
    console.log('🎉 [TestSupabase] Teste de conexão concluído com sucesso!');
    
  } catch (error) {
    console.error('💥 [TestSupabase] Falha no teste de conexão:', error);
    throw error;
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