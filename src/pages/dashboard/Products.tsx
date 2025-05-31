import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, ExternalLink, Link, DollarSign, Package, Filter } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import CreateLinkModal from '@/components/CreateLinkModal';
import { formatCurrency } from '@/lib/utils';

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  commission_rate: number;
  category_id: string | null;
  image_url: string | null;
  sales_page_url: string;
  is_active: boolean;
  total_sales: number;
  category?: {
    name: string;
    slug: string;
  };
}

const Products = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isCreateLinkModalOpen, setIsCreateLinkModalOpen] = useState(false);

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
          category:categories(name, slug)
        `)
        .eq('is_active', true)
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
        .select('product_id, short_code')
        .eq('affiliate_id', user.id)
        .eq('status', 'active');
      
      if (error) throw error;
      return data;
    },
    enabled: !!user
  });

  const handleCreateLink = (product: Product) => {
    setSelectedProduct(product);
    setIsCreateLinkModalOpen(true);
  };

  const getAffiliateLink = (productId: string) => {
    const link = affiliateLinks?.find(l => l.product_id === productId);
    return link ? `${window.location.origin}/r/${link.short_code}` : null;
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
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col space-y-4">
        <div>
          <h1 className="text-3xl font-bold text-gradient-orange">
            Produtos para Afiliação
          </h1>
          <p className="text-muted-foreground mt-2">
            Escolha produtos para promover e ganhar comissões
          </p>
        </div>

        {/* Filtros */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Buscar produtos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 focus-orange"
            />
          </div>
          
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-full sm:w-[200px] focus-orange">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Categoria" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as categorias</SelectItem>
              {categories?.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Grid de Produtos */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <Skeleton className="h-48 w-full" />
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-full mt-2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-20 w-full" />
              </CardContent>
              <CardFooter>
                <Skeleton className="h-10 w-full" />
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
                className="overflow-hidden hover-lift card-hover border-gradient group"
              >
                {/* Imagem do Produto */}
                <div className="relative h-48 bg-gradient-to-br from-orange-100 to-orange-200 dark:from-orange-900/20 dark:to-orange-800/20">
                  {product.image_url ? (
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <Package className="h-16 w-16 text-orange-500/50" />
                    </div>
                  )}
                  
                  {/* Badge de Comissão */}
                  <Badge className="absolute top-3 right-3 bg-orange-500 text-white">
                    {product.commission_rate}% de comissão
                  </Badge>
                </div>

                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-xl line-clamp-2 group-hover:text-orange-600 transition-colors">
                        {product.name}
                      </CardTitle>
                      {product.category && (
                        <Badge variant="secondary" className="mt-2">
                          {product.category.name}
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {product.description || 'Sem descrição disponível'}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-2xl font-bold text-gradient-orange">
                        {formatCurrency(product.price)}
                      </p>
                      <p className="text-sm text-muted-foreground flex items-center">
                        <DollarSign className="h-3 w-3 mr-1" />
                        Ganhe {formatCurrency(product.price * product.commission_rate / 100)}
                      </p>
                    </div>
                    
                    {product.total_sales > 0 && (
                      <Badge variant="outline" className="text-orange-600 border-orange-600">
                        {product.total_sales} vendas
                      </Badge>
                    )}
                  </div>
                </CardContent>

                <CardFooter className="flex flex-col gap-2">
                  {affiliateLink ? (
                    <>
                      <Button
                        variant="outline"
                        className="w-full group-hover:border-orange-500 group-hover:text-orange-600"
                        onClick={() => copyToClipboard(affiliateLink)}
                      >
                        <Link className="h-4 w-4 mr-2" />
                        Copiar Link de Afiliado
                      </Button>
                      <Button
                        variant="default"
                        className="w-full gradient-orange hover:opacity-90"
                        onClick={() => window.open(product.sales_page_url, '_blank')}
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Ver Página de Vendas
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        variant="default"
                        className="w-full gradient-orange hover:opacity-90 glow-orange-hover"
                        onClick={() => handleCreateLink(product)}
                      >
                        <Link className="h-4 w-4 mr-2" />
                        Criar Link de Afiliado
                      </Button>
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => window.open(product.sales_page_url, '_blank')}
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
        <Card className="p-12 text-center">
          <Package className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Nenhum produto encontrado</h3>
          <p className="text-muted-foreground">
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
          productId={selectedProduct.id}
          productName={selectedProduct.name}
        />
      )}
    </div>
  );
};

export default Products; 