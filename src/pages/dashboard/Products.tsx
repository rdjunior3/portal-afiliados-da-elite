import React, { useState, useEffect } from 'react';
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

type Product = Tables<'products'> & {
  categories?: {
    id: string;
    name: string;
    color: string;
  } | null;
};

const Products = () => {
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

  // Buscar categorias
  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data;
    }
  });

  // Buscar produtos
  const { data: products, isLoading } = useQuery({
    queryKey: ['products', selectedCategory, searchQuery],
    queryFn: async () => {
      let query = supabase
        .from('products')
        .select(`
          *,
          categories(id, name, color)
        `)
        .eq('status', 'active')
        .order('name');

      if (selectedCategory !== 'all') {
        query = query.eq('category_id', selectedCategory);
      }

      if (searchQuery) {
        query = query.ilike('name', `%${searchQuery}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Product[];
    }
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
      queryClient.invalidateQueries({ queryKey: ['products'] });
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
      queryClient.invalidateQueries({ queryKey: ['products'] });
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
    <PageLayout
      fullWidth={true}
      headerContent={
        <div className="max-w-7xl mx-auto">
          <PageHeader
            title="Produtos para Afiliação"
            description={canManageContent ? 'Gerencie produtos e ganhe comissões' : 'Escolha produtos para promover e ganhar comissões'}
            customIcon={<TrophyIcon className="w-6 h-6" color="#f97316" />}
          />
        </div>
      }
    >
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Actions Section */}
        <div className="flex items-center justify-between">
          <div className="flex-1" />
          {canManageContent && (
            <Dialog open={isProductModalOpen} onOpenChange={setIsProductModalOpen}>
              <DialogTrigger asChild>
                <Button 
                  onClick={handleCreateProduct}
                  className="bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-500 hover:to-orange-600 text-white shadow-lg hover:shadow-orange-500/30 transition-all duration-300"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Cadastrar Produto
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl bg-slate-800/95 backdrop-blur border-slate-700/50">
                <DialogHeader>
                  <DialogTitle className="text-white">
                    {editingProduct ? 'Editar Produto' : 'Cadastrar Novo Produto'}
                  </DialogTitle>
                  <DialogDescription className="text-slate-300">
                    {editingProduct ? 'Atualize as informações do produto' : 'Preencha as informações para criar um novo produto'}
                  </DialogDescription>
                </DialogHeader>
                
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 py-4 max-h-[75vh] overflow-y-auto">
                    {/* Seção Informações Básicas */}
                    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                      {/* Coluna da Imagem - Menor */}
                      <div className="lg:col-span-2">
                        <FormField
                          control={form.control}
                          name="thumbnail_url"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-slate-200">Imagem do Produto</FormLabel>
                              <FormControl>
                                <ImageUpload
                                  value={field.value || ''}
                                  onChange={field.onChange}
                                  bucket="uploads"
                                  folder="products/thumbnails"
                                  placeholder="Envie uma imagem do produto"
                                  maxWidth={400}
                                  maxHeight={400}
                                />
                              </FormControl>
                              <FormMessage className="text-red-400" />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      {/* Coluna dos Campos - Maior */}
                      <div className="lg:col-span-3 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-slate-200">Nome do Produto *</FormLabel>
                                <FormControl>
                                  <Input
                                    {...field}
                                    onChange={(e) => handleNameChange(e.target.value)}
                                    className="bg-slate-700/60 border-slate-600/50 text-white backdrop-blur-sm"
                                    placeholder="Nome do produto"
                                  />
                                </FormControl>
                                <FormMessage className="text-red-400" />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="slug"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-slate-200 flex items-center gap-2">
                                  Slug (URL) *
                                  {isValidating && (
                                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-orange-500" />
                                  )}
                                </FormLabel>
                                <FormControl>
                                  <Input
                                    {...field}
                                    className="bg-slate-700/60 border-slate-600/50 text-white backdrop-blur-sm"
                                    placeholder="slug-do-produto"
                                  />
                                </FormControl>
                                <FormDescription className="text-slate-400 text-xs">
                                  URL amigável para o produto (apenas letras, números e hífens)
                                </FormDescription>
                                <FormMessage className="text-red-400" />
                              </FormItem>
                            )}
                          />
                        </div>
                        
                        <FormField
                          control={form.control}
                          name="description"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-slate-200">Descrição</FormLabel>
                              <FormControl>
                                <Textarea
                                  {...field}
                                  className="bg-slate-700/60 border-slate-600/50 text-white backdrop-blur-sm"
                                  placeholder="Descrição do produto"
                                  rows={3}
                                />
                              </FormControl>
                              <FormMessage className="text-red-400" />
                            </FormItem>
                          )}
                        />
                      
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <FormField
                            control={form.control}
                            name="price"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-slate-200">Preço (R$) *</FormLabel>
                                <FormControl>
                                  <Input
                                    {...field}
                                    type="number"
                                    step="0.01"
                                    onChange={(e) => field.onChange(Number(e.target.value))}
                                    className="bg-slate-700/60 border-slate-600/50 text-white backdrop-blur-sm"
                                    placeholder="0.00"
                                  />
                                </FormControl>
                                <FormMessage className="text-red-400" />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="commission_rate"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-slate-200">Comissão (%) *</FormLabel>
                                <FormControl>
                                  <Input
                                    {...field}
                                    type="number"
                                    step="0.01"
                                    onChange={(e) => field.onChange(Number(e.target.value))}
                                    className="bg-slate-700/60 border-slate-600/50 text-white backdrop-blur-sm"
                                    placeholder="10"
                                  />
                                </FormControl>
                                <FormMessage className="text-red-400" />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="category_id"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-slate-200">Categoria *</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                  <FormControl>
                                    <SelectTrigger className="bg-slate-700/60 border-slate-600/50 text-white backdrop-blur-sm">
                                      <SelectValue placeholder="Selecione uma categoria" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent className="bg-slate-800/95 border-slate-700/50 backdrop-blur z-50">
                                    {categories?.map((category) => (
                                      <SelectItem key={category.id} value={category.id} className="text-white hover:bg-slate-700/50">
                                        {category.name}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <FormMessage className="text-red-400" />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Descrição Completa e Link - Layout Horizontal */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="affiliate_link"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-slate-200">Link de Afiliado *</FormLabel>
                            <FormControl>
                              <Textarea
                                {...field}
                                className="bg-slate-700/60 border-slate-600/50 text-white backdrop-blur-sm"
                                placeholder="https://exemplo.com/produto"
                                rows={4}
                              />
                            </FormControl>
                            <FormDescription className="text-slate-400 text-xs">
                              URL completa da página de vendas do produto
                            </FormDescription>
                            <FormMessage className="text-red-400" />
                          </FormItem>
                        )}
                      />
                    
                      <div className="space-y-2">
                        <Label className="text-slate-200">Observações Adicionais</Label>
                        <div className="p-3 bg-slate-700/40 border border-slate-600/50 rounded-lg">
                          <p className="text-xs text-slate-400">
                            • Certifique-se de que o link de afiliado está correto<br/>
                            • Teste o link antes de publicar<br/>
                            • Mantenha as informações atualizadas
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Seção de Ofertas Múltiplas - Mais Compacta */}
                    <div className="border-t border-slate-700/50 pt-6">
                      <div className="bg-gradient-to-r from-orange-500/10 to-orange-600/5 rounded-lg p-4 mb-4 border border-orange-500/20">
                        <h3 className="text-lg font-semibold text-white mb-1 flex items-center gap-2">
                          💰 Ofertas e Preços do Produto
                        </h3>
                        <p className="text-sm text-slate-400">
                          Configure diferentes preços e comissões. Útil para ofertas promocionais, versões diferentes, etc.
                        </p>
                      </div>
                      
                      <ProductOffersManager
                        offers={productOffers}
                        onChange={setProductOffers}
                        productId={editingProduct?.id}
                      />
                    </div>
                  </form>
                </Form>
                
                <DialogFooter className="pt-4 border-t border-slate-700/50 flex flex-row justify-end gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setIsProductModalOpen(false)}
                    className="border-slate-600/50 text-slate-300 hover:border-slate-500 hover:text-white"
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    onClick={form.handleSubmit(onSubmit)}
                    disabled={saveProductMutation.isPending || isValidating}
                    className="bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-500 hover:to-orange-600 text-white px-6"
                  >
                    {saveProductMutation.isPending ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                        Salvando...
                      </>
                    ) : isValidating ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                        Validando...
                      </>
                    ) : (
                      editingProduct ? 'Atualizar' : 'Cadastrar'
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>

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