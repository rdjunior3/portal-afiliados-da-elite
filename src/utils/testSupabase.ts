import { supabase } from '@/integrations/supabase/client';

export const testSupabaseConnection = async () => {
  console.log('🔗 [TestSupabase] Testando conexão...');
  
  try {
    // Testar autenticação
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    console.log('👤 [TestSupabase] Usuário:', user?.email || 'Não autenticado');
    
    if (authError) {
      console.error('❌ [TestSupabase] Erro de autenticação:', authError);
      return false;
    }

    // Testar acesso às tabelas
    const { data: categories, error: categoriesError } = await supabase
      .from('categories')
      .select('*')
      .limit(1);
    
    if (categoriesError) {
      console.error('❌ [TestSupabase] Erro ao acessar categories:', categoriesError);
    } else {
      console.log('✅ [TestSupabase] Acesso a categories OK:', categories?.length || 0);
    }

    // Testar acesso à tabela products
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('*')
      .limit(1);
    
    if (productsError) {
      console.error('❌ [TestSupabase] Erro ao acessar products:', productsError);
    } else {
      console.log('✅ [TestSupabase] Acesso a products OK:', products?.length || 0);
    }

    // Testar bucket de storage
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
    
    if (bucketsError) {
      console.error('❌ [TestSupabase] Erro ao listar buckets:', bucketsError);
    } else {
      console.log('📦 [TestSupabase] Buckets disponíveis:', buckets?.map(b => b.name));
      const hasProductImages = buckets?.some(b => b.name === 'product-images');
      console.log('🖼️ [TestSupabase] Bucket product-images existe:', hasProductImages);
    }

    return true;
  } catch (error) {
    console.error('💥 [TestSupabase] Erro geral:', error);
    return false;
  }
};

export const createProductImagesBucket = async () => {
  console.log('📦 [CreateBucket] Criando bucket product-images...');
  
  try {
    const { data, error } = await supabase.storage.createBucket('product-images', {
      public: true,
      allowedMimeTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
      fileSizeLimit: 5242880 // 5MB
    });

    if (error) {
      if (error.message.includes('already exists')) {
        console.log('✅ [CreateBucket] Bucket product-images já existe');
        return true;
      }
      console.error('❌ [CreateBucket] Erro ao criar bucket:', error);
      return false;
    }

    console.log('✅ [CreateBucket] Bucket criado com sucesso:', data);
    return true;
  } catch (error) {
    console.error('💥 [CreateBucket] Erro geral:', error);
    return false;
  }
}; 