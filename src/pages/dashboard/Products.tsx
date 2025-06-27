import React, { useState } from 'react';
import { useProducts, useCategories, useDeleteProduct } from '@/hooks/useProducts';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { PageLayout } from '@/components/layout/PageLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { ProductCard } from '@/components/business';
import CreateProductModalSimple from '@/components/modals/CreateProductModalSimple';
import TrophyIcon from '@/components/ui/TrophyIcon';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

// O tipo agora vem implicitamente do hook useProducts
type ProductWithOffers = ReturnType<typeof useProducts>['data']['data']['data'][0];

const ProductsPage = () => {
  const { toast } = useToast();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [productToDelete, setProductToDelete] = useState<{ id: string; name: string } | null>(null);

  // Usar os hooks para buscar dados
  const { data: productsData, isLoading: isLoadingProducts } = useProducts({});
  const { data: categoriesData } = useCategories();
  const deleteProductMutation = useDeleteProduct();

  const products = productsData?.data?.data || [];
  const categories = categoriesData?.data || [];

  const handleDeleteProduct = (productId: string) => {
    const product = products.find(p => p.id === productId);
    if (product) {
      setProductToDelete({ id: productId, name: product.name });
    }
  };

  const confirmDeleteProduct = () => {
    if (productToDelete) {
      deleteProductMutation.mutate(productToDelete.id);
      setProductToDelete(null);
    }
  };

  // Lógica de filtro no lado do cliente
  const filteredProducts = products.filter(product => {
    const matchesCategory = selectedCategory === 'all' || product.category_id === selectedCategory;
    const matchesSearch = !searchQuery || product.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <>
      <PageLayout
        headerContent={
          <div className="flex items-center justify-between">
            <PageHeader
              title="Vitrine de Produtos Elite"
              description="Explore todos os nossos produtos e encontre as melhores ofertas para promover."
              customIcon={<TrophyIcon className="w-6 h-6" color="#f97316" />}
            />
            <Button 
              onClick={() => setShowCreateModal(true)}
              className="bg-orange-600 hover:bg-orange-700 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Cadastrar Produto
            </Button>
          </div>
        }
      >
        {/* Filtros */}
        <div className="bg-slate-800/50 rounded-lg p-6 mb-8 border border-slate-700">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
              <Input
                placeholder="Buscar produtos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
              />
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full sm:w-[200px] bg-slate-700 border-slate-600 text-white">
                <SelectValue placeholder="Todas categorias" />
              </SelectTrigger>
              <SelectContent className="bg-slate-700 border-slate-600 text-white">
                <SelectItem value="all">Todas categorias</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Grid de Produtos */}
        {isLoadingProducts ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-slate-800 rounded-lg p-4 space-y-4">
                <Skeleton className="h-48 w-full bg-slate-700" />
                <Skeleton className="h-4 w-3/4 bg-slate-700" />
                <Skeleton className="h-4 w-1/2 bg-slate-700" />
                <div className="flex justify-between">
                  <Skeleton className="h-6 w-20 bg-slate-700" />
                  <Skeleton className="h-6 w-16 bg-slate-700" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-slate-400 text-lg mb-4">
              {searchQuery || selectedCategory !== 'all' 
                ? 'Nenhum produto encontrado com os filtros aplicados.'
                : 'Nenhum produto cadastrado ainda.'
              }
            </div>
            {(!searchQuery && selectedCategory === 'all') && (
              <Button 
                onClick={() => setShowCreateModal(true)}
                className="bg-orange-600 hover:bg-orange-700 text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Cadastrar Primeiro Produto
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onEdit={() => {}} // Edição removida temporariamente
                onDelete={() => handleDeleteProduct(product.id)}
              />
            ))}
          </div>
        )}
      </PageLayout>

      {/* Modal de Criação Simples */}
      <CreateProductModalSimple
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
      />

      {/* Dialog de confirmação de exclusão */}
      <AlertDialog open={!!productToDelete} onOpenChange={() => setProductToDelete(null)}>
        <AlertDialogContent className="bg-slate-800 border-slate-700 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-300">
              Tem certeza que deseja excluir o produto "{productToDelete?.name}"? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel 
              onClick={() => setProductToDelete(null)}
              className="border-slate-600 text-slate-300 hover:bg-slate-700"
            >
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDeleteProduct}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default ProductsPage;