import { createClient } from '@supabase/supabase-js';

// Configurações do Supabase
const SUPABASE_URL = 'https://llimwudaqdwpfhgxcpxf.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxsaW13dWRhcWR3cGZoZ3hjcHhmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NzQxODc5NCwiZXhwIjoyMDYyOTk0Nzk0fQ.yP9ZI9WY61sYkMepyKMEKmVf2Obp-8tnVQLcwBNZc04';

// Criar cliente do Supabase com service role
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

const sampleProducts = [
  {
    name: "Curso Completo de Marketing Digital 2024",
    slug: "curso-marketing-digital-2024",
    short_description: "Aprenda todas as estratégias de marketing digital que realmente funcionam em 2024",
    description: "Um curso completo e atualizado com todas as estratégias de marketing digital para 2024. Inclui Facebook Ads, Google Ads, Instagram, TikTok, Email Marketing e muito mais.",
    thumbnail_url: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400",
    price: 497.00,
    original_price: 997.00,
    commission_rate: 50.00,
    affiliate_link: "https://hotmart.com/curso-marketing-digital-2024",
    vendor_name: "João Silva",
    vendor_email: "joao@marketingpro.com",
    target_audience: "Empreendedores, profissionais de marketing, iniciantes",
    keywords: ["marketing digital", "facebook ads", "google ads", "instagram", "tiktok"],
    tags: ["curso", "marketing", "ads", "social media"],
    gravity_score: 95,
    earnings_per_click: 12.50,
    conversion_rate_avg: 8.5,
    refund_rate: 5.2,
    is_featured: true,
    is_exclusive: true,
    status: 'active',
    category_name: 'Marketing Digital'
  },
  {
    name: "Fórmula Negócio Online - Do Zero ao Primeiro Milhão",
    slug: "formula-negocio-online",
    short_description: "Método completo para criar um negócio online lucrativo do zero",
    description: "Descubra o método exato que já ajudou mais de 5.000 pessoas a criar negócios online lucrativos. Desde a escolha do nicho até a primeira venda.",
    thumbnail_url: "https://images.unsplash.com/photo-1553484771-371a605b060b?w=400",
    price: 997.00,
    original_price: 1997.00,
    commission_rate: 60.00,
    affiliate_link: "https://hotmart.com/formula-negocio-online",
    vendor_name: "Maria Santos",
    vendor_email: "maria@negocioonline.com",
    target_audience: "Pessoas que querem empreender online, profissionais liberais",
    keywords: ["negócio online", "empreendedorismo", "renda extra", "trabalhar em casa"],
    tags: ["negócio", "online", "empreendedorismo", "renda"],
    gravity_score: 88,
    earnings_per_click: 24.50,
    conversion_rate_avg: 6.8,
    refund_rate: 7.1,
    is_featured: true,
    is_exclusive: false,
    status: 'active',
    category_name: 'Negócios Online'
  },
  {
    name: "Python para Análise de Dados - Bootcamp Completo",
    slug: "python-analise-dados-bootcamp",
    short_description: "Domine Python e se torne um analista de dados profissional",
    description: "Bootcamp intensivo de Python para análise de dados. Aprenda Pandas, NumPy, Matplotlib, Seaborn e muito mais. Com projetos práticos reais.",
    thumbnail_url: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400",
    price: 697.00,
    original_price: 1297.00,
    commission_rate: 45.00,
    affiliate_link: "https://hotmart.com/python-analise-dados",
    vendor_name: "Carlos Tech",
    vendor_email: "carlos@pythonpro.com",
    target_audience: "Profissionais de TI, estudantes, analistas",
    keywords: ["python", "análise de dados", "data science", "programação"],
    tags: ["python", "dados", "programação", "bootcamp"],
    gravity_score: 82,
    earnings_per_click: 18.30,
    conversion_rate_avg: 7.2,
    refund_rate: 4.8,
    is_featured: true,
    is_exclusive: false,
    status: 'active',
    category_name: 'Tecnologia'
  },
  {
    name: "Investimentos Inteligentes - Estratégias para 2024",
    slug: "investimentos-inteligentes-2024",
    short_description: "Aprenda a investir seu dinheiro de forma inteligente e segura",
    description: "Curso completo sobre investimentos com estratégias atualizadas para 2024. Ações, fundos, renda fixa, criptomoedas e muito mais.",
    thumbnail_url: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=400",
    price: 397.00,
    original_price: 797.00,
    commission_rate: 40.00,
    affiliate_link: "https://hotmart.com/investimentos-inteligentes",
    vendor_name: "Ana Financeira",
    vendor_email: "ana@investsmart.com",
    target_audience: "Pessoas que querem investir, iniciantes no mercado financeiro",
    keywords: ["investimentos", "ações", "fundos", "renda fixa", "criptomoedas"],
    tags: ["investimentos", "finanças", "dinheiro", "bolsa"],
    gravity_score: 78,
    earnings_per_click: 8.90,
    conversion_rate_avg: 9.1,
    refund_rate: 6.3,
    is_featured: true,
    is_exclusive: false,
    status: 'active',
    category_name: 'Finanças'
  },
  {
    name: "Protocolo Saúde Total - Transforme seu Corpo em 90 Dias",
    slug: "protocolo-saude-total",
    short_description: "Método comprovado para perder peso e ganhar saúde em 90 dias",
    description: "Protocolo completo de alimentação e exercícios para transformar seu corpo e sua saúde em apenas 90 dias. Com acompanhamento nutricional.",
    thumbnail_url: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400",
    price: 297.00,
    original_price: 597.00,
    commission_rate: 55.00,
    affiliate_link: "https://hotmart.com/protocolo-saude-total",
    vendor_name: "Dr. Pedro Saúde",
    vendor_email: "pedro@saudetotal.com",
    target_audience: "Pessoas que querem emagrecer, melhorar a saúde",
    keywords: ["emagrecimento", "saúde", "exercícios", "alimentação", "dieta"],
    tags: ["saúde", "emagrecimento", "exercícios", "dieta"],
    gravity_score: 91,
    earnings_per_click: 15.80,
    conversion_rate_avg: 11.2,
    refund_rate: 8.5,
    is_featured: true,
    is_exclusive: true,
    status: 'active',
    category_name: 'Saúde e Bem-estar'
  },
  {
    name: "Inglês Fluente em 6 Meses - Método Revolucionário",
    slug: "ingles-fluente-6-meses",
    short_description: "Fale inglês fluentemente em apenas 6 meses com nosso método exclusivo",
    description: "Método revolucionário para aprender inglês de forma rápida e eficiente. Com aulas práticas, conversação e certificação internacional.",
    thumbnail_url: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=400",
    price: 597.00,
    original_price: 997.00,
    commission_rate: 50.00,
    affiliate_link: "https://hotmart.com/ingles-fluente",
    vendor_name: "Teacher Mike",
    vendor_email: "mike@englishfast.com",
    target_audience: "Estudantes, profissionais, viajantes",
    keywords: ["inglês", "idiomas", "conversação", "fluência", "certificação"],
    tags: ["inglês", "idiomas", "educação", "conversação"],
    gravity_score: 85,
    earnings_per_click: 16.70,
    conversion_rate_avg: 8.9,
    refund_rate: 5.8,
    is_featured: false,
    is_exclusive: false,
    status: 'active',
    category_name: 'Educação'
  }
];

async function seedDatabase() {
  console.log('🌱 Iniciando população do banco de dados...\n');

  try {
    // Buscar categorias existentes
    const { data: categories, error: categoriesError } = await supabase
      .from('categories')
      .select('id, name');

    if (categoriesError) {
      console.error('❌ Erro ao buscar categorias:', categoriesError);
      return;
    }

    console.log(`📂 Encontradas ${categories.length} categorias\n`);

    // Inserir produtos
    for (const productData of sampleProducts) {
      console.log(`⏳ Inserindo produto: ${productData.name}`);

      // Encontrar categoria
      const category = categories.find(c => c.name === productData.category_name);
      
      if (!category) {
        console.log(`⚠️  Categoria não encontrada: ${productData.category_name}`);
        continue;
      }

      // Remover category_name dos dados do produto
      const { category_name, ...productToInsert } = productData;
      productToInsert.category_id = category.id;

      // Verificar se o produto já existe
      const { data: existingProduct } = await supabase
        .from('products')
        .select('id')
        .eq('slug', productData.slug)
        .single();

      if (existingProduct) {
        console.log(`✅ Produto já existe: ${productData.name}`);
        continue;
      }

      // Inserir produto
      const { error: productError } = await supabase
        .from('products')
        .insert(productToInsert);

      if (productError) {
        console.error(`❌ Erro ao inserir produto ${productData.name}:`, productError.message);
      } else {
        console.log(`✅ Produto inserido: ${productData.name}`);
      }
    }

    console.log('\n🎉 População do banco concluída!');
    console.log('\n📋 Produtos disponíveis:');
    
    // Listar produtos inseridos
    const { data: products } = await supabase
      .from('products')
      .select('name, commission_rate, status')
      .eq('status', 'active');

    products?.forEach(product => {
      console.log(`• ${product.name} (${product.commission_rate}% comissão)`);
    });

    console.log(`\n✨ Total: ${products?.length || 0} produtos ativos`);
    console.log('\n🚀 Agora você pode testar o dashboard em: http://localhost:8081/dashboard');

  } catch (error) {
    console.error('❌ Erro geral:', error.message);
    process.exit(1);
  }
}

// Executar seed
seedDatabase(); 