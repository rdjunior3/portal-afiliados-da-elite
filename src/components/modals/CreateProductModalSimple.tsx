import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ImageUpload } from '@/components/ui/ImageUpload';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Package, Plus, Trash2, Loader2, Calculator } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface CreateProductModalSimpleProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ProductOffer {
  id: string;
  name: string;
  price: string;
  commission_rate: string;
  is_default: boolean;
}

const CreateProductModalSimple: React.FC<CreateProductModalSimpleProps> = ({ isOpen, onClose }) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category_id: '',
    image_url: '',
    sales_page_url: ''
  });

  const [offers, setOffers] = useState<ProductOffer[]>([
    {
      id: '1',
      name: 'Oferta Principal',
      price: '',
      commission_rate: '50',
      is_default: true
    }
  ]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showNewCategoryModal, setShowNewCategoryModal] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');

  // Buscar categorias
  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('is_active', true)
        .order('name');
      
      if (error) throw error;
      return data;
    }
  });

  // Mutation para criar categoria
  const createCategoryMutation = useMutation({
    mutationFn: async (name: string) => {
      const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      const { data, error } = await supabase
        .from('categories')
        .insert([{
          name,
          slug,
          color: '#F97316',
          is_active: true
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      toast({
        title: "Categoria criada!",
        description: `A categoria "${data.name}" foi criada com sucesso.`,
      });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      setFormData(prev => ({ ...prev, category_id: data.id }));
      setNewCategoryName('');
      setShowNewCategoryModal(false);
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao criar categoria",
        description: error.message || "Tente novamente.",
        variant: "destructive",
      });
    }
  });

  // Mutation para criar produto
  const createProductMutation = useMutation({
    mutationFn: async (productData: any) => {
      // 1. Criar produto
      const insertData = {
        name: productData.name,
        slug: productData.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
        description: productData.description,
        category_id: productData.category_id || null,
        price: parseFloat(offers[0].price) || 0,
        commission_rate: parseFloat(offers[0].commission_rate) || 0,
        sales_page_url: productData.sales_page_url,
        image_url: productData.image_url || null,
        currency: 'BRL',
        is_active: true
      };

      const { data: product, error: productError } = await supabase
        .from('products')
        .insert([insertData])
        .select()
        .single();

      if (productError) throw productError;

      // 2. Criar ofertas na tabela product_offers
      const offersData = offers.map((offer, index) => ({
        product_id: product.id,
        name: offer.name,
        price: parseFloat(offer.price) || 0,
        commission_rate: parseFloat(offer.commission_rate) || 0,
        commission_amount: (parseFloat(offer.price) || 0) * (parseFloat(offer.commission_rate) || 0) / 100,
        is_default: index === 0, // Primeira oferta é sempre default
        is_active: true,
        sort_order: index + 1
      }));

      const { error: offersError } = await supabase
        .from('product_offers')
        .insert(offersData);

      if (offersError) {
        console.warn('Erro ao criar ofertas:', offersError);
        // Não falha se as ofertas não forem criadas, produto já existe
      }

      return product;
    },
    onSuccess: (data) => {
      toast({
        title: "Produto criado com sucesso!",
        description: `O produto "${data.name}" foi adicionado à vitrine com ${offers.length} oferta(s).`,
      });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      resetForm();
      onClose();
    },
    onError: (error: any) => {
      console.error('Erro completo:', error);
      toast({
        title: "Erro ao criar produto",
        description: error.message || "Tente novamente ou entre em contato com o suporte.",
        variant: "destructive",
      });
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.sales_page_url) {
      toast({
        title: "Campos obrigatórios",
        description: "Nome e URL da página para afiliação são obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    if (!offers[0].price || isNaN(parseFloat(offers[0].price))) {
      toast({
        title: "Preço inválido",
        description: "Digite um preço válido para a primeira oferta.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await createProductMutation.mutateAsync(formData);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      category_id: '',
      image_url: '',
      sales_page_url: ''
    });
    setOffers([{
      id: '1',
      name: 'Oferta Principal',
      price: '',
      commission_rate: '50',
      is_default: true
    }]);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleOfferChange = (offerId: string, field: string, value: string) => {
    setOffers(prev => prev.map(offer => 
      offer.id === offerId ? { ...offer, [field]: value } : offer
    ));
  };

  const addNewOffer = () => {
    const newOffer: ProductOffer = {
      id: Date.now().toString(),
      name: `Oferta ${offers.length + 1}`,
      price: '',
      commission_rate: '50',
      is_default: false
    };
    setOffers(prev => [...prev, newOffer]);
  };

  const removeOffer = (offerId: string) => {
    if (offers.length > 1) {
      setOffers(prev => prev.filter(offer => offer.id !== offerId));
    }
  };

  const calculateTotal = (price: string, commission: string): string => {
    const priceNum = parseFloat(price) || 0;
    const commissionNum = parseFloat(commission) || 0;
    const total = priceNum * (commissionNum / 100);
    return total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const handleCreateCategory = () => {
    if (!newCategoryName.trim()) {
      toast({
        title: "Nome obrigatório",
        description: "Digite um nome para a categoria.",
        variant: "destructive",
      });
      return;
    }
    createCategoryMutation.mutate(newCategoryName.trim());
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="bg-slate-800 border-slate-700 text-white max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <Package className="w-5 h-5 text-orange-500" />
              Cadastrar Novo Produto
            </DialogTitle>
            <DialogDescription className="text-slate-300">
              Adicione um novo produto à vitrine de afiliados. Preencha as informações básicas abaixo.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Nome do Produto */}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium text-slate-200">
                Nome do Produto *
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Ex: Curso de Marketing Digital Avançado"
                className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
                required
              />
            </div>

            {/* Upload de Imagem */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-slate-200">
                Imagem do Produto (Recomendado 310x310px)
              </Label>
              <ImageUpload
                value={formData.image_url}
                onChange={(url) => handleInputChange('image_url', url)}
                bucket="product-images"
                folder="products"
                placeholder="Selecione uma imagem para o produto"
                maxWidth={310}
                maxHeight={310}
                enableCrop={true}
                cropAspect={1}
                className="w-full"
              />
            </div>

            {/* Descrição */}
            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm font-medium text-slate-200">
                Descrição
              </Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Descreva os principais benefícios e características do produto..."
                className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400 min-h-[80px]"
                rows={3}
              />
            </div>

            {/* Categoria */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-slate-200">Categoria</Label>
              <div className="flex gap-2">
                <Select 
                  value={formData.category_id || "no-category"} 
                  onValueChange={(value) => handleInputChange('category_id', value === "no-category" ? "" : value)}
                >
                  <SelectTrigger className="bg-slate-700 border-slate-600 text-white flex-1">
                    <SelectValue placeholder="Selecione uma categoria" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-700 border-slate-600">
                    <SelectItem value="no-category">Sem categoria</SelectItem>
                    {categories?.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowNewCategoryModal(true)}
                  className="border-slate-600 text-slate-300 hover:bg-slate-700"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Ofertas */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium text-slate-200">Ofertas</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addNewOffer}
                  className="border-slate-600 text-slate-300 hover:bg-slate-700"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Adicionar Oferta
                </Button>
              </div>

              <div className="space-y-3">
                {offers.map((offer, index) => (
                  <Card key={offer.id} className="bg-slate-700/50 border-slate-600">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-sm font-medium text-orange-400">
                          {index === 0 ? 'Oferta Principal' : `Oferta ${index + 1}`}
                          {index === 0 && <span className="text-xs text-slate-400 ml-2">(Padrão)</span>}
                        </h4>
                        {index > 0 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeOffer(offer.id)}
                            className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                        <div className="space-y-1">
                          <Label className="text-xs text-slate-300">Nome da Oferta</Label>
                          <Input
                            value={offer.name}
                            onChange={(e) => handleOfferChange(offer.id, 'name', e.target.value)}
                            placeholder="Ex: Básica, Premium"
                            className="bg-slate-600 border-slate-500 text-white text-sm"
                          />
                        </div>

                        <div className="space-y-1">
                          <Label className="text-xs text-slate-300">Preço (R$)</Label>
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            value={offer.price}
                            onChange={(e) => handleOfferChange(offer.id, 'price', e.target.value)}
                            placeholder="97.00"
                            className="bg-slate-600 border-slate-500 text-white text-sm"
                          />
                        </div>

                        <div className="space-y-1">
                          <Label className="text-xs text-slate-300">Comissão (%)</Label>
                          <Input
                            type="number"
                            step="0.1"
                            min="0"
                            max="100"
                            value={offer.commission_rate}
                            onChange={(e) => handleOfferChange(offer.id, 'commission_rate', e.target.value)}
                            placeholder="50"
                            className="bg-slate-600 border-slate-500 text-white text-sm"
                          />
                        </div>

                        <div className="space-y-1">
                          <Label className="text-xs text-slate-300">Total a Receber</Label>
                          <div className="flex items-center h-9 px-3 bg-green-500/10 border border-green-500/30 rounded-md">
                            <Calculator className="w-3 h-3 text-green-400 mr-1" />
                            <span className="text-sm font-medium text-green-400">
                              {calculateTotal(offer.price, offer.commission_rate)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* URL da Página para Afiliação */}
            <div className="space-y-2">
              <Label htmlFor="sales_page_url" className="text-sm font-medium text-slate-200">
                URL da Página para Afiliação *
              </Label>
              <Input
                type="url"
                id="sales_page_url"
                value={formData.sales_page_url}
                onChange={(e) => handleInputChange('sales_page_url', e.target.value)}
                placeholder="https://exemplo.com/produto"
                className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
                required
              />
            </div>

            <DialogFooter className="flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="border-slate-600 text-slate-300 hover:bg-slate-700"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-orange-600 hover:bg-orange-700 text-white"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Criando...
                  </>
                ) : (
                  <>
                    <Package className="w-4 h-4 mr-2" />
                    Criar Produto
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal para Nova Categoria */}
      <Dialog open={showNewCategoryModal} onOpenChange={setShowNewCategoryModal}>
        <DialogContent className="bg-slate-800 border-slate-700 text-white max-w-md">
          <DialogHeader>
            <DialogTitle>Nova Categoria</DialogTitle>
            <DialogDescription className="text-slate-300">
              Digite o nome da nova categoria.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium text-slate-200">Nome da Categoria</Label>
              <Input
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="Ex: Saúde e Bem-estar"
                className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowNewCategoryModal(false)}
              className="border-slate-600 text-slate-300 hover:bg-slate-700"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleCreateCategory}
              disabled={createCategoryMutation.isPending}
              className="bg-orange-600 hover:bg-orange-700 text-white"
            >
              {createCategoryMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Criando...
                </>
              ) : (
                'Criar Categoria'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CreateProductModalSimple; 