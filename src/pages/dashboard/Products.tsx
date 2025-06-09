import React, { useState } from 'react';
import { useProducts, useCategories } from '@/hooks/useProducts'; // Usar o hook centralizado
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, Copy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { PageLayout } from '@/components/layout/PageLayout';
import { PageHeader } from '@/components/layout/PageHeader';

// O tipo agora vem implicitamente do hook useProducts
type ProductWithOffers = ReturnType<typeof useProducts>['data']['data']['data'][0];

const ProductsPage = () => {
  const { toast } = useToast();
  
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
  
  // Lógica de filtro no lado do cliente
  const filteredProducts = products.filter(product => {
    const matchesCategory = selectedCategory === 'all' || product.category_id === selectedCategory;
    const matchesSearch = !searchQuery || product.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <PageLayout>
      <PageHeader
        title="Vitrine de Produtos Elite"
        description="Explore todos os nossos produtos e encontre as melhores ofertas para promover."
      />

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

      {/* Grid de Produtos */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoadingProducts
          ? Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-64 bg-slate-800" />)
          : filteredProducts.map((product) => (
            <Card key={product.id} className="bg-slate-800 border-slate-700 flex flex-col">
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
    </PageLayout>
  );
};

export default ProductsPage; 