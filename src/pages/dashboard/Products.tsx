import React, { useState } from 'react';
import { useProducts, useCategories } from '@/hooks/useProducts';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Search } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { PageLayout } from '@/components/layout/PageLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { ProductCard } from '@/components/ProductCard';

// O tipo agora vem implicitamente do hook useProducts
type ProductWithOffers = ReturnType<typeof useProducts>['data']['data']['data'][0];

const ProductsPage = () => {
  const { toast } = useToast();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Usar os hooks para buscar dados
  const { data: productsData, isLoading: isLoadingProducts } = useProducts({});
  const { data: categoriesData } = useCategories();

  const products = productsData?.data?.data || [];
  const categories = categoriesData?.data || [];

  const handleDeleteProduct = (productId: string) => {
    // Lógica para deletar o produto.
    // TODO: Chamar o serviço de produto para deletar e depois invalidar a query para atualizar a lista.
    console.log(`(Admin) Deletar produto: ${productId}`);
    toast({ title: "Funcionalidade de exclusão a ser implementada." });
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
              showNewProductButton={true}
            />
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

        {/* Grid de Produtos */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoadingProducts
            ? Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-64 bg-slate-800" />)
            : filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onDelete={handleDeleteProduct}
                />
              ))}
        </div>
      </div>
    </PageLayout>
  );
};

export default ProductsPage;