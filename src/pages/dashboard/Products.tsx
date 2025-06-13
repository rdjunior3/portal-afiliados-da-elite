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
import { ProductCard } from '@/components/ProductCard';
import CreateProductModal from '@/components/modals/CreateProductModal';
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

          {/* Estado vazio */}
          {!isLoadingProducts && filteredProducts.length === 0 && (
            <div className="text-center py-12">
              <TrophyIcon className="w-16 h-16 mx-auto mb-4 opacity-50" color="#64748b" />
              <h3 className="text-lg font-medium text-slate-300 mb-2">
                {products.length === 0 ? 'Nenhum produto cadastrado' : 'Nenhum produto encontrado'}
              </h3>
              <p className="text-slate-400 mb-6">
                {products.length === 0 
                  ? 'Comece cadastrando seu primeiro produto para começar a vender.'
                  : 'Tente ajustar os filtros para encontrar o que procura.'
                }
              </p>
              {products.length === 0 && (
                <Button 
                  onClick={() => setShowCreateModal(true)}
                  className="bg-orange-600 hover:bg-orange-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Cadastrar Primeiro Produto
                </Button>
              )}
            </div>
          )}
        </div>
      </PageLayout>

      {/* Modal de cadastro de produto */}
      <CreateProductModal 
        isOpen={showCreateModal} 
        onClose={() => setShowCreateModal(false)} 
      />

      {/* Dialog de confirmação de exclusão */}
      <AlertDialog open={!!productToDelete} onOpenChange={() => setProductToDelete(null)}>
        <AlertDialogContent className="bg-slate-800 border-slate-700">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">
              Confirmar Exclusão
            </AlertDialogTitle>
            <AlertDialogDescription className="text-slate-300">
              Tem certeza que deseja arquivar o produto <strong>"{productToDelete?.name}"</strong>?
              <br />
              <br />
              Esta ação irá:
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Remover o produto da vitrine pública</li>
                <li>Manter os dados para fins históricos</li>
                <li>Permitir restauração futura se necessário</li>
              </ul>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-slate-700 text-white hover:bg-slate-600">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDeleteProduct}
              className="bg-red-600 hover:bg-red-700"
              disabled={deleteProductMutation.isPending}
            >
              {deleteProductMutation.isPending ? 'Arquivando...' : 'Confirmar Exclusão'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default ProductsPage;