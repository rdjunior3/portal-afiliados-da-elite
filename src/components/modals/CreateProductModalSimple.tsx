import React, { useState, useEffect } from 'react';
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

  // Estado para forçar re-render do cálculo
  const [calculationKey, setCalculationKey] = useState(0);
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

  // Mutation para criar produto - MELHORADA com debugging
  const createProductMutation = useMutation({
    mutationFn: async (productData: any) => {
      console.log('🚀 Iniciando criação do produto:', productData);
      console.log('📋 Ofertas a serem criadas:', offers);

      // Validações antes do envio
      if (!offers[0]?.price || isNaN(parseFloat(offers[0].price))) {
        throw new Error('Preço da primeira oferta é obrigatório e deve ser um número válido');
      }

      if (!productData.name || !productData.sales_page_url) {
        throw new Error('Nome e URL da página para afiliação são obrigatórios');
      }

      // 1. Criar produto
      const insertData = {
        name: productData.name.trim(),
        slug: productData.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
        description: productData.description?.trim() || null,
        category_id: productData.category_id || null,
        price: parseFloat(offers[0].price) || 0,
        commission_rate: parseFloat(offers[0].commission_rate) || 0,
        sales_page_url: productData.sales_page_url.trim(),
        affiliate_link: productData.sales_page_url.trim(), // Campo adicional
        image_url: productData.image_url || null,
        currency: 'BRL',
        is_active: true
      };

      console.log('📤 Dados do produto a serem inseridos:', insertData);

      const { data: product, error: productError } = await supabase
        .from('products')
        .insert([insertData])
        .select()
        .single();

      if (productError) {
        console.error('❌ Erro ao criar produto:', productError);
        throw new Error(`Erro ao criar produto: ${productError.message}`);
      }

      console.log('✅ Produto criado com sucesso:', product);

      // 2. Criar ofertas na tabela product_offers
      const offersData = offers.map((offer, index) => {
        const price = parseFloat(offer.price) || 0;
        const commissionRate = parseFloat(offer.commission_rate) || 0;
        const commissionAmount = price * (commissionRate / 100);

        return {
          product_id: product.id,
          name: offer.name.trim(),
          price: price,
          commission_rate: commissionRate,
          commission_amount: commissionAmount,
          is_default: index === 0, // Primeira oferta é sempre default
          is_active: true,
          sort_order: index + 1
        };
      });

      console.log('📤 Dados das ofertas a serem inseridas:', offersData);

      const { data: insertedOffers, error: offersError } = await supabase
        .from('product_offers')
        .insert(offersData)
        .select();

      if (offersError) {
        console.error('⚠️ Erro ao criar ofertas (produto já foi criado):', offersError);
        // Não falha se as ofertas não forem criadas, produto já existe
      } else {
        console.log('✅ Ofertas criadas com sucesso:', insertedOffers);
      }

      return { product, offers: insertedOffers };
    },
    onSuccess: (data) => {
      console.log('🎉 Criação completa bem-sucedida:', data);
      toast({
        title: "Produto criado com sucesso!",
        description: `O produto "${data.product.name}" foi adicionado à vitrine com ${offers.length} oferta(s).`,
      });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      resetForm();
      onClose();
    },
    onError: (error: any) => {
      console.error('💥 Erro na criação do produto:', error);
      toast({
        title: "Erro ao criar produto",
        description: error.message || "Erro inesperado. Tente novamente ou contate o suporte.",
        variant: "destructive",
      });
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('📝 Formulário submetido');
    console.log('📋 Dados do form:', formData);
    console.log('🏷️ Ofertas:', offers);
    
    // Validações frontend
    if (!formData.name?.trim()) {
      toast({
        title: "Nome obrigatório",
        description: "Digite o nome do produto.",
        variant: "destructive",
      });
      return;
    }

    if (!formData.sales_page_url?.trim()) {
      toast({
        title: "URL obrigatória",
        description: "Digite a URL da página para afiliação.",
        variant: "destructive",
      });
      return;
    }

    if (!offers[0]?.price || isNaN(parseFloat(offers[0].price)) || parseFloat(offers[0].price) <= 0) {
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
    } catch (error) {
      console.error('❌ Erro no handleSubmit:', error);
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
    setOffers([
      {
        id: '1',
        name: 'Oferta Principal',
        price: '',
        commission_rate: '50',
        is_default: true
      }
    ]);
    setCalculationKey(prev => prev + 1);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleOfferChange = (offerId: string, field: string, value: string) => {
    setOffers(prev => prev.map(offer => 
      offer.id === offerId ? { ...offer, [field]: value } : offer
    ));
    // Forçar re-render do cálculo quando preço ou comissão mudarem
    if (field === 'price' || field === 'commission_rate') {
      setCalculationKey(prev => prev + 1);
    }
  };

  const addNewOffer = () => {
    const newId = Date.now().toString();
    setOffers(prev => [...prev, {
      id: newId,
      name: `Oferta ${prev.length + 1}`,
      price: '',
      commission_rate: '50',
      is_default: false
    }]);
  };

  const removeOffer = (offerId: string) => {
    setOffers(prev => prev.filter(offer => offer.id !== offerId));
  };

  // Função de cálculo melhorada
  const calculateTotal = (price: string, commission: string): string => {
    const priceNum = parseFloat(price) || 0;
    const commissionNum = parseFloat(commission) || 0;
    
    if (priceNum === 0) {
      return 'R$ 0,00';
    }
    
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

  // Effect para debug do cálculo
  useEffect(() => {
    if (offers[0]) {
      console.log('🔢 Cálculo atualizado:', {
        offer1: offers[0],
        calculation: calculateTotal(offers[0].price, offers[0].commission_rate)
      });
    }
  }, [offers, calculationKey]);

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

          <form onSubmit={handleSubmit} className="space-y-4">
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

            {/* Upload de Imagem - OTIMIZADO */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-slate-200">
                Imagem do Produto (Recomendado 310x310px)
              </Label>
              <div className="max-h-48 overflow-hidden"> {/* Altura máxima reduzida */}
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
                className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400 min-h-[60px]"
                rows={2}
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

            {/* Ofertas - LAYOUT MELHORADO */}
            <div className="space-y-3">
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

              <div className="space-y-2">
                {offers.map((offer, index) => (
                  <Card key={`${offer.id}-${calculationKey}`} className="bg-slate-700/50 border-slate-600">
                    <CardContent className="p-3">
                      <div className="flex items-center justify-between mb-2">
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
                            className="text-red-400 hover:text-red-300 hover:bg-red-500/10 h-6 w-6 p-0"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                        <div className="space-y-1">
                          <Label className="text-xs text-slate-300">Nome da Oferta</Label>
                          <Input
                            value={offer.name}
                            onChange={(e) => handleOfferChange(offer.id, 'name', e.target.value)}
                            placeholder="Ex: Básica, Premium"
                            className="bg-slate-600 border-slate-500 text-white text-sm h-8"
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
                            className="bg-slate-600 border-slate-500 text-white text-sm h-8"
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
                            className="bg-slate-600 border-slate-500 text-white text-sm h-8"
                          />
                        </div>

                        <div className="space-y-1">
                          <Label className="text-xs text-slate-300">Total a Receber</Label>
                          <div className="flex items-center h-8 px-2 bg-green-500/10 border border-green-500/30 rounded-md">
                            <Calculator className="w-3 h-3 text-green-400 mr-1 flex-shrink-0" />
                            <span className="text-xs font-medium text-green-400 truncate">
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

            <DialogFooter className="flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 flex gap-3 pt-3">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="border-slate-600 text-slate-300 hover:bg-slate-700"
                disabled={isSubmitting}
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
                onKeyDown={(e) => e.key === 'Enter' && handleCreateCategory()}
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