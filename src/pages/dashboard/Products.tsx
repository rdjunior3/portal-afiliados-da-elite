import React, { useState } from 'react';
import { useLoaderData, useRevalidator } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Search, ExternalLink, Link, DollarSign, Package, Filter, Plus, Edit, Trash2, AlertCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import CreateLinkModal from '@/components/CreateLinkModal';
import { ImageUpload } from '@/components/ui/ImageUpload';
import ProductOffersManager from '@/components/product/ProductOffersManager';
import { formatCurrency } from '@/lib/utils';
import { Tables } from '@/integrations/supabase/types';
import { PageLayout } from '@/components/layout/PageLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { ProductOffer } from '@/types/product-offers.types';
import TrophyIcon from '@/components/ui/TrophyIcon';
import { productSchema, ProductFormData } from '@/schemas/productSchema';
import { useSlugValidation } from '@/hooks/useSlugValidation';
import { QueryClient } from '@tanstack/react-query';

type Product = Tables<'products'> & {
  categories?: {
    id: string;
    name: string;
    color: string;
  } | null;
};

// --- LOADER ---
export const productsLoader = (queryClient: QueryClient) => async () => {
  const categoriesQuery = supabase.from('categories').select('*').order('name');
  const productsQuery = supabase.from('products').select('*, categories(id, name, color)').eq('status', 'active').order('name');

  // O user não está disponível aqui, então a query de links será feita no componente.
  // Idealmente, a informação do usuário viria de um loader pai.
  
  const [{ data: categories, error: catError }, { data: products, error: prodError }] = await Promise.all([
    categoriesQuery,
    productsQuery,
  ]);

  if (catError || prodError) {
    throw new Response("Erro ao carregar dados dos produtos.", { status: 500 });
  }

  return { categories, products };
};

const Products = () => {
  const initialData = useLoaderData() as { categories: any[], products: Product[] };
  const { user, canManageContent } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isCreateLinkModalOpen, setIsCreateLinkModalOpen] = useState(false);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productOffers, setProductOffers] = useState<ProductOffer[]>([]);

  // O revalidator substitui a necessidade de invalidar queries manualmente em muitos casos
  let revalidator = useRevalidator();

  // Os dados agora vêm do loader, mas podemos usar useQuery para mantê-los atualizados
  // e para filtragem/busca no lado do cliente ou com novas requisições.
  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: () => initialData.categories,
    staleTime: Infinity // Dados do loader são considerados "fresh"
  });

  const { data: products, isLoading } = useQuery({
    queryKey: ['products', selectedCategory, searchQuery],
    queryFn: async () => {
      // A lógica de filtro/busca pode ser movida para o lado do cliente
      // ou refatorada para refazer a query ao loader com parâmetros.
      // Por enquanto, usamos os dados iniciais.
      let filteredProducts = initialData.products;
      if (selectedCategory !== 'all') {
        filteredProducts = filteredProducts.filter(p => p.category_id === selectedCategory);
      }
      if (searchQuery) {
        filteredProducts = filteredProducts.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()));
      }
      return filteredProducts;
    },
    initialData: initialData.products
  });

  // Buscar links do afiliado
  const { data: affiliateLinks } = useQuery({
    queryKey: ['affiliate-links', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('affiliate_links')
        .select('product_id, custom_slug')
        .eq('user_id', user.id)
        .eq('status', 'active');
      
      if (error) throw error;
      return data;
    },
    enabled: !!user
  });

  // React Hook Form com Zod
  const form = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: '',
      slug: '',
      description: '',
      price: 0,
      commission_rate: 10,
      category_id: '',
      affiliate_link: '',
      thumbnail_url: ''
    }
  });

  // Hook para validação de slug
  const { validateSlugUnique, generateSlugFromName, isValidating } = useSlugValidation({
    currentProductId: editingProduct?.id
  });

  // Função para submeter o formulário com validações
  const onSubmit = async (data: ProductFormData) => {
    try {
      // 1. Validar slug único antes de submeter
      const isSlugValid = await validateSlugUnique(data.slug);
      if (!isSlugValid) {
        form.setError('slug', { 
          type: 'manual', 
          message: 'Este slug já está em uso' 
        });
        return;
      }

      // 2. Executar mutation
      await saveProductMutation.mutateAsync(data);
    } catch (error) {
      console.error('Erro na submissão:', error);
    }
  };

  // Mutation para criar/editar produto
  const saveProductMutation = useMutation({
    mutationFn: async (data: ProductFormData) => {
      const productData = {
        ...data,
        status: 'active' as const,
        currency: 'BRL',
        commission_amount: 0,
        gravity_score: 0,
        earnings_per_click: 0,
        conversion_rate_avg: 0,
        refund_rate: 0,
        is_featured: false,
        is_exclusive: false,
        requires_approval: false,
        min_payout: 50
      };

      if (editingProduct) {
        const { error } = await supabase
          .from('products')
          .update(productData)
          .eq('id', editingProduct.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('products')
          .insert([productData]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      revalidator.revalidate(); // Recarrega os dados do loader
      setIsProductModalOpen(false);
      setEditingProduct(null);
      
      // Reset do formulário
      form.reset({
        name: '',
        slug: '',
        description: '',
        price: 0,
        commission_rate: 10,
        category_id: '',
        affiliate_link: '',
        thumbnail_url: ''
      });

      toast({
        title: editingProduct ? "Produto atualizado! ✅" : "Produto criado! ✅",
        description: editingProduct ? "O produto foi atualizado com sucesso." : "O produto foi criado com sucesso.",
      });
    },
    onError: (error: any) => {
      console.error('Erro ao salvar produto:', error);
      
      let errorMessage = "Não foi possível salvar o produto. Tente novamente.";
      
      // Tratamento de erros específicos
      if (error?.message?.includes('duplicate key')) {
        errorMessage = "Já existe um produto com este slug. Use um slug diferente.";
        form.setError('slug', { type: 'manual', message: 'Slug já existe' });
      } else if (error?.message?.includes('violates foreign key')) {
        errorMessage = "Categoria selecionada é inválida. Selecione uma categoria válida.";
        form.setError('category_id', { type: 'manual', message: 'Categoria inválida' });
      }

      toast({
        title: "Erro ao salvar",
        description: errorMessage,
        variant: "destructive",
      });
    }
  });

  // Mutation para deletar produto
  const deleteProductMutation = useMutation({
    mutationFn: async (productId: string) => {
      const { error } = await supabase
        .from('products')
        .update({ status: 'archived' })
        .eq('id', productId);
      if (error) throw error;
    },
    onSuccess: () => {
      revalidator.revalidate(); // Recarrega os dados do loader
      toast({
        title: "Produto removido!",
        description: "O produto foi removido com sucesso.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: "Não foi possível remover o produto. Tente novamente.",
        variant: "destructive",
      });
    }
  });

  const handleCreateLink = (product: Product) => {
    setSelectedProduct(product);
    setIsCreateLinkModalOpen(true);
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    
    // Preencher o formulário com os dados do produto
    form.reset({
      name: product.name,
      slug: product.slug,
      description: product.description || '',
      price: product.price || 0,
      commission_rate: product.commission_rate,
      category_id: product.category_id || '',
      affiliate_link: product.affiliate_link,
      thumbnail_url: product.thumbnail_url || ''
    });
    
    setIsProductModalOpen(true);
  };

  const handleCreateProduct = () => {
    setEditingProduct(null);
    
    // Reset do formulário para criação
    form.reset({
      name: '',
      slug: '',
      description: '',
      price: 0,
      commission_rate: 10,
      category_id: '',
      affiliate_link: '',
      thumbnail_url: ''
    });
    
    setIsProductModalOpen(true);
  };

  // Função para gerar slug automaticamente a partir do nome
  const handleNameChange = (name: string) => {
    form.setValue('name', name);
    
    // Gerar slug automaticamente apenas se não estiver editando
    if (!editingProduct) {
      const generatedSlug = generateSlugFromName(name);
      form.setValue('slug', generatedSlug);
    }
  };

  const getAffiliateLink = (productId: string) => {
    const link = affiliateLinks?.find(l => l.product_id === productId);
    return link ? `${window.location.origin}/r/${link.custom_slug}` : null;
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Link copiado!",
        description: "O link foi copiado para sua área de transferência.",
      });
    } catch (error) {
      toast({
        title: "Erro ao copiar",
        description: "Não foi possível copiar o link.",
        variant: "destructive",
      });
    }
  };

  return (
    <PageLayout>
      <PageHeader
        title="Nossos Produtos"
        description="Explore nossa vitrine de produtos de alta conversão e encontre o ideal para sua audiência."
        actions={
          canManageContent() && (
            <Button onClick={handleCreateProduct} className="bg-orange-500 hover:bg-orange-600 text-white shadow-sm hover:shadow-lg transition-shadow">
              <Plus className="mr-2 h-4 w-4" />
              Criar Produto
            </Button>
          )
        }
      />
      
      <div className="space-y-6">
        {/* Filtros */}
        <Card className="bg-slate-800/60 border-slate-700/50 backdrop-blur-sm">
          <CardContent className="p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
            <Input
              placeholder="Buscar produtos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-slate-700/60 border-slate-600/50 text-white backdrop-blur-sm"
            />
          </div>
          
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-full sm:w-[200px] bg-slate-700/60 border-slate-600/50 text-white backdrop-blur-sm">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Categoria" />
            </SelectTrigger>
                <SelectContent className="bg-slate-800/95 border-slate-700/50 backdrop-blur">
              <SelectItem value="all" className="text-white">Todas as categorias</SelectItem>
              {categories?.map((category) => (
                <SelectItem key={category.id} value={category.id} className="text-white">
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
          </CardContent>
        </Card>

      {/* Grid de Produtos */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
              <Card key={i} className="overflow-hidden bg-slate-800/60 border-slate-700/50 backdrop-blur-sm">
                <Skeleton className="h-48 w-full bg-slate-700/50" />
              <CardHeader>
                  <Skeleton className="h-6 w-3/4 bg-slate-700/50" />
                  <Skeleton className="h-4 w-full mt-2 bg-slate-700/50" />
              </CardHeader>
              <CardContent>
                  <Skeleton className="h-20 w-full bg-slate-700/50" />
              </CardContent>
              <CardFooter>
                  <Skeleton className="h-10 w-full bg-slate-700/50" />
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products?.map((product) => {
            const affiliateLink = getAffiliateLink(product.id);
            
            return (
              <Card 
                key={product.id} 
                  className="overflow-hidden hover:shadow-lg hover:shadow-orange-500/20 transition-all duration-300 bg-slate-800/60 border-slate-700/50 backdrop-blur-sm group"
              >
                {/* Imagem do Produto */}
                  <div className="relative h-48 bg-gradient-to-br from-slate-900/40 to-slate-800/40">
                  {product.thumbnail_url ? (
                    <img
                      src={product.thumbnail_url}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                        <Package className="h-16 w-16 text-slate-500/50" />
                    </div>
                  )}
                  
                  {/* Badge de Comissão */}
                    <Badge className="absolute top-3 right-3 bg-orange-500/90 text-white backdrop-blur-sm">
                    {product.commission_rate}% de comissão
                  </Badge>

                  {/* Admin Actions */}
                    {canManageContent && (
                    <div className="absolute top-3 left-3 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleEditProduct(product)}
                          className="h-8 w-8 p-0 bg-slate-800/80 backdrop-blur-sm"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => deleteProductMutation.mutate(product.id)}
                          className="h-8 w-8 p-0 bg-red-600/80 backdrop-blur-sm"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>

                  <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-xl line-clamp-2 text-white group-hover:text-orange-300 transition-colors">
                        {product.name}
                      </CardTitle>
                      {product.categories && (
                        <Badge 
                          variant="secondary" 
                            className="mt-2 bg-slate-700/60 text-slate-300 backdrop-blur-sm"
                          style={{ backgroundColor: product.categories.color + '20', color: product.categories.color }}
                        >
                          {product.categories.name}
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>

                  <CardContent className="space-y-4 pb-4">
                  <p className="text-sm text-slate-300 line-clamp-3">
                    {product.description || 'Sem descrição disponível'}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-2xl font-bold text-orange-300">
                        {formatCurrency(product.price || 0)}
                      </p>
                      <p className="text-sm text-slate-400 flex items-center">
                        <DollarSign className="h-3 w-3 mr-1" />
                        Ganhe {formatCurrency((product.price || 0) * product.commission_rate / 100)}
                      </p>
                    </div>
                    
                    {product.gravity_score > 0 && (
                        <Badge variant="outline" className="text-orange-400 border-orange-400/50">
                        Score: {product.gravity_score}
                      </Badge>
                    )}
                  </div>
                </CardContent>

                  <CardFooter className="flex flex-col gap-2 pt-4 border-t border-slate-700/50">
                  {affiliateLink ? (
                    <>
                      <Button
                        variant="outline"
                          className="w-full border-slate-600/50 text-slate-300 hover:border-orange-500 hover:text-orange-300 backdrop-blur-sm"
                        onClick={() => copyToClipboard(affiliateLink)}
                      >
                        <Link className="h-4 w-4 mr-2" />
                        Copiar Link de Afiliado
                      </Button>
                      <Button
                        variant="default"
                        className="w-full bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-500 hover:to-orange-600 text-white"
                        onClick={() => window.open(product.affiliate_link, '_blank')}
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Ver Página de Vendas
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        variant="default"
                        className="w-full bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-500 hover:to-orange-600 text-white"
                        onClick={() => handleCreateLink(product)}
                      >
                        <Link className="h-4 w-4 mr-2" />
                        Criar Link de Afiliado
                      </Button>
                      <Button
                        variant="outline"
                          className="w-full border-slate-600/50 text-slate-300 hover:border-orange-500 hover:text-orange-300 backdrop-blur-sm"
                        onClick={() => window.open(product.affiliate_link, '_blank')}
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Ver Página de Vendas
                      </Button>
                    </>
                  )}
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && products?.length === 0 && (
          <Card className="p-12 text-center bg-slate-800/60 border-slate-700/50 backdrop-blur-sm">
          <Package className="h-16 w-16 mx-auto text-slate-500 mb-4" />
          <h3 className="text-lg font-semibold mb-2 text-white">Nenhum produto encontrado</h3>
          <p className="text-slate-400">
            Tente ajustar seus filtros ou volte mais tarde para ver novos produtos.
          </p>
        </Card>
      )}

      {/* Modal de Criação de Link */}
      {selectedProduct && (
        <CreateLinkModal
          isOpen={isCreateLinkModalOpen}
          onClose={() => {
            setIsCreateLinkModalOpen(false);
            setSelectedProduct(null);
          }}
          product={selectedProduct}
        />
      )}
    </div>
    </PageLayout>
  );
};

export default Products; 