/**
 * SCRIPT PARA CONFIGURAR BUCKETS DE STORAGE NO SUPABASE
 * Portal Afiliados da Elite - Correção do Upload de Avatares
 * 
 * COMO USAR:
 * 1. Acesse o dashboard do Supabase (https://supabase.com/dashboard)
 * 2. Abra o console do navegador (F12)
 * 3. Cole este código e execute
 */

console.log('🚀 Iniciando configuração dos buckets de storage...');

async function setupStorageBuckets() {
  try {
    // Verificar se _supabaseClient está disponível
    if (typeof _supabaseClient === 'undefined') {
      console.error('❌ _supabaseClient não encontrado. Execute este script no dashboard do Supabase.');
      return;
    }

    console.log('✅ Cliente Supabase encontrado');

    // Configurações dos buckets
    const buckets = [
      {
        id: 'profiles',
        name: 'profiles',
        public: true,
        fileSizeLimit: 2097152, // 2MB
        allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
      },
      {
        id: 'avatars',
        name: 'avatars', 
        public: true,
        fileSizeLimit: 2097152, // 2MB
        allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
      },
      {
        id: 'products',
        name: 'products',
        public: true,
        fileSizeLimit: 10485760, // 10MB
        allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/jpg']
      }
    ];

    console.log('📋 Configurando buckets:', buckets.map(b => b.id));

    for (const bucket of buckets) {
      console.log(`\n🪣 Configurando bucket: ${bucket.id}`);
      
      // Verificar se bucket já existe
      const { data: existingBucket, error: checkError } = await _supabaseClient.storage.getBucket(bucket.id);
      
      if (existingBucket) {
        console.log(`✅ Bucket ${bucket.id} já existe`);
        continue;
      }

      // Criar bucket
      console.log(`🔨 Criando bucket ${bucket.id}...`);
      const { data, error } = await _supabaseClient.storage.createBucket(bucket.id, {
        public: bucket.public,
        fileSizeLimit: bucket.fileSizeLimit,
        allowedMimeTypes: bucket.allowedMimeTypes
      });

      if (error) {
        console.error(`❌ Erro ao criar bucket ${bucket.id}:`, error);
      } else {
        console.log(`✅ Bucket ${bucket.id} criado com sucesso:`, data);
      }
    }

    // Verificar buckets criados
    console.log('\n📊 Verificando buckets criados...');
    const { data: allBuckets, error: listError } = await _supabaseClient.storage.listBuckets();
    
    if (listError) {
      console.error('❌ Erro ao listar buckets:', listError);
    } else {
      console.log('📋 Buckets disponíveis:');
      allBuckets.forEach(bucket => {
        console.log(`  • ${bucket.id} (${bucket.public ? 'público' : 'privado'})`);
      });
    }

    // Teste de upload
    console.log('\n🧪 Testando funcionalidade...');
    for (const bucketId of ['profiles', 'avatars']) {
      const { data, error } = await _supabaseClient.storage.getBucket(bucketId);
      if (data) {
        console.log(`✅ Bucket ${bucketId} funcionando corretamente`);
      } else {
        console.error(`❌ Bucket ${bucketId} não encontrado:`, error);
      }
    }

    console.log('\n🎉 Configuração concluída!');
    console.log('💡 Agora você pode testar o upload de avatares na aplicação.');
    
  } catch (error) {
    console.error('💥 Erro durante a configuração:', error);
  }
}

// Executar a configuração
setupStorageBuckets();

/**
 * INSTRUÇÕES ALTERNATIVAS:
 * 
 * Se o script acima não funcionar, execute estes comandos individualmente:
 */

console.log('\n📝 Comandos alternativos (execute um por vez):');

console.log(`
// 1. Criar bucket profiles
const { data: profilesData, error: profilesError } = await _supabaseClient.storage.createBucket('profiles', {
  public: true,
  fileSizeLimit: 2097152,
  allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
});
console.log('Profiles bucket:', { data: profilesData, error: profilesError });
`);

console.log(`
// 2. Criar bucket avatars  
const { data: avatarsData, error: avatarsError } = await _supabaseClient.storage.createBucket('avatars', {
  public: true,
  fileSizeLimit: 2097152,
  allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
});
console.log('Avatars bucket:', { data: avatarsData, error: avatarsError });
`);

console.log(`
// 3. Verificar buckets criados
const { data: buckets, error: bucketsError } = await _supabaseClient.storage.listBuckets();
console.log('Todos os buckets:', { data: buckets, error: bucketsError });
`);

console.log(`
// 4. Testar bucket específico
const { data: testBucket, error: testError } = await _supabaseClient.storage.getBucket('profiles');
console.log('Teste bucket profiles:', { data: testBucket, error: testError });
`);

console.log('\n✅ Execute este script no console do dashboard do Supabase!');
console.log('🔗 Dashboard: https://supabase.com/dashboard/project/[SEU_PROJECT_ID]/storage/buckets'); 