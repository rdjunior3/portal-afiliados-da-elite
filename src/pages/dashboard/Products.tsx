import React, { useState } from 'react';
import { useProducts, useCategories } from '@/hooks/useProducts'; // Usar o hook centralizado
import { useAuth } from '@/contexts/AuthContext'; // 1. Importar o hook de autenticação
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, Copy, PlusCircle, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { PageLayout } from '@/components/layout/PageLayout';
import { PageHeader } from '@/components/layout/PageHeader';

// O tipo agora vem implicitamente do hook useProducts
type ProductWithOffers = ReturnType<typeof useProducts>['data']['data']['data'][0];

const ProductsPage = () => {
  const { toast } = useToast();
  const { isAdmin } = useAuth(); // 2. Obter a função isAdmin
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Usar os hooks para buscar dados
  const { data: productsData, isLoading: isLoadingProducts } = useProducts({
    // Futuramente, podemos adicionar filtros de categoria/busca aqui
  });
  const { data: categoriesData } = useCategories();

  const products = productsData?.data?.data || [];
  const categories = categoriesData?.data || [];

  const handleCopyLink = (url: string) => {
    if (!url) {
      toast({ title: "Link indisponível", variant: "destructive" });
        return;
    }
    navigator.clipboard.writeText(url);
    toast({ title: "Link de promoção copiado!" });
  };
  
  const handleDeleteProduct = (productId: string) => {
    // Lógica para deletar o produto.
    // TODO: Chamar o serviço de produto para deletar e depois invalidar a query para atualizar a lista.
    console.log(`(Admin) Deletar produto: ${productId}`);
    toast({ title: "Funcionalidade de exclusão a ser implementada." });
  };

  const handleAddNewProduct = () => {
    // Lógica para abrir modal ou navegar para a página de criação.
    console.log("(Admin) Adicionar novo produto.");
    toast({ title: "Funcionalidade de adição a ser implementada." });
  };

  // Lógica de filtro no lado do cliente
  const filteredProducts = products.filter(product => {
    const matchesCategory = selectedCategory === 'all' || product.category_id === selectedCategory;
    const matchesSearch = !searchQuery || product.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <PageLayout
      headerContent={
        <div className="bg-slate-900/70 border-b border-slate-800 backdrop-blur-sm -mx-4 -mt-4 mb-4 md:-mx-6 md:-mt-6 md:mb-6 lg:-mx-8 lg:-mt-8 lg:mb-8">
          <div className="max-w-7xl mx-auto px-4 py-4 md:px-6 md:py-6 lg:px-8">
            <PageHeader
              title="Vitrine de Produtos Elite"
              description="Explore todos os nossos produtos e encontre as melhores ofertas para promover."
            >
              {isAdmin() && (
                <Button onClick={handleAddNewProduct}>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Novo Produto
                </Button>
              )}
            </PageHeader>
          </div>
        </div>
      }
    >
      <div className="max-w-7xl mx-auto">
        {/* Filtros */}
        <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
              placeholder="Buscar por nome do produto..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-slate-800 border-slate-700"
              />
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="bg-slate-800 border-slate-700">
              <SelectValue placeholder="Filtrar por categoria" />
              </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-700 text-white">
              <SelectItem value="all">Todas as Categorias</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Grid de Produtos */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoadingProducts
            ? Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-64 bg-slate-800" />)
            : filteredProducts.map((product) => (
                <Card key={product.id} className="bg-slate-800 border-slate-700 flex flex-col group relative">
                  
                  {isAdmin() && (
                    <div className="absolute top-2 right-2 z-10">
                      <Button variant="destructive" size="icon" onClick={() => handleDeleteProduct(product.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  )}

                  <CardHeader>
                    <CardTitle className="text-white">{product.name}</CardTitle>
                    <CardDescription>{product.short_description}</CardDescription>
                  </CardHeader>
                  <CardContent className="flex-grow space-y-4">
                    <p className="text-sm text-slate-300 line-clamp-3">{product.description}</p>
                    <h4 className="font-semibold text-white">Ofertas Disponíveis:</h4>
                    <div className="space-y-2">
                      {product.product_offers && product.product_offers.length > 0 ? (
                        product.product_offers.map((offer) => (
                          <div key={offer.id} className="p-3 bg-slate-700/50 rounded-lg border border-slate-600 flex justify-between items-center">
                            <div>
                              <p className="font-medium text-white">{offer.name}</p>
                              <div className="text-xs text-slate-300">
                                <span>Preço: <span className="text-green-400">R$ {offer.price.toFixed(2)}</span></span>
                                <span className="mx-2">|</span>
                                <span>Comissão: <span className="text-orange-400">{offer.commission_rate}%</span></span>
                              </div>
                            </div>
                            <Button size="sm" onClick={() => handleCopyLink(offer.promotion_url || '')}>
                              <Copy className="h-4 w-4" />
                            </Button>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-slate-400">Nenhuma oferta disponível no momento.</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
        </div>
      </div>
    </PageLayout>
  );
};

export default ProductsPage; 