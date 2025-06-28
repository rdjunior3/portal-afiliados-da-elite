import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Plus, X, DollarSign, Upload, Loader2, AlertTriangle, Trash2, ExternalLink, Package, Image, Tags, ShoppingCart, Check, Info } from 'lucide-react';
import { useImageUpload } from '@/hooks/useImageUpload';
import CreateCategoryModal from './CreateCategoryModal';

interface CreateProductModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ProductOffer {
  id: string;
  title: string;
  price: number;
  commission_rate: number;
  commission_amount: number;
}

const CreateProductModal: React.FC<CreateProductModalProps> = ({ isOpen, onClose }) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('basic');

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category_id: '',
    image_url: '',
    affiliate_link: '',
    price: 0,
    commission_rate: 10,
    commission_amount: 0
  });

  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [offers, setOffers] = useState<ProductOffer[]>([]);
  const [newOffer, setNewOffer] = useState({ title: '', price: 0, commission_rate: 10, commission_amount: 0 });
  const [showNewOfferForm, setShowNewOfferForm] = useState(false);

  // Hook de upload otimizado
  const {
    uploadImage,
    uploading: uploadingImage,
    imageUrl: uploadedImageUrl,
    uploadProgress,
    resetUpload
  } = useImageUpload({
    bucket: 'product-images',
    folder: 'products',
    maxSizeInMB: 10
  });

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

  // Auto-gerar tags baseadas no nome do produto
  useEffect(() => {
    if (formData.name.trim()) {
      const autoTags = formData.name
        .toLowerCase()
        .split(' ')
        .filter(word => word.length > 2)
        .map(word => word.trim())
        .filter(word => word.length > 0)
        .slice(0, 5);
      
      const manualTags = tags.filter(tag => !autoTags.includes(tag.toLowerCase()));
      setTags([...autoTags, ...manualTags]);
    }
  }, [formData.name]);

  // Atualizar URL da imagem quando upload concluir
  useEffect(() => {
    if (uploadedImageUrl) {
      setFormData(prev => ({ ...prev, image_url: uploadedImageUrl }));
    }
  }, [uploadedImageUrl]);

  // Calcular comissão automaticamente para oferta principal
  useEffect(() => {
    if (formData.price > 0 && formData.commission_rate > 0) {
      const calculatedCommission = (formData.price * formData.commission_rate) / 100;
      setFormData(prev => ({ ...prev, commission_amount: parseFloat(calculatedCommission.toFixed(2)) }));
    }
  }, [formData.price, formData.commission_rate]);

  // Calcular comissão automaticamente para nova oferta
  useEffect(() => {
    if (newOffer.price > 0 && newOffer.commission_rate > 0) {
      const calculatedCommission = (newOffer.price * newOffer.commission_rate) / 100;
      setNewOffer(prev => ({ ...prev, commission_amount: parseFloat(calculatedCommission.toFixed(2)) }));
    }
  }, [newOffer.price, newOffer.commission_rate]);

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    console.log('[CreateProduct] Iniciando upload de:', file.name);
    
    try {
      setImageFile(file);
      
      // Preview local
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);

      // Upload para Supabase
      await uploadImage(file);
    } catch (error) {
      console.error('[CreateProduct] Erro no upload:', error);
      toast({
        title: "Erro no upload",
        description: "Não foi possível fazer upload da imagem. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  // Mutation para criar produto
  const createProductMutation = useMutation({
    mutationFn: async (productData: any) => {
      console.log('[CreateProduct] Iniciando criação de produto:', productData);

      if (!productData.image_url) {
        throw new Error('Imagem é obrigatória para criar um produto');
      }

      try {
        const insertData = {
          name: productData.name,
          description: productData.description,
          category_id: productData.category_id,
          image_url: productData.image_url,
          affiliate_link: productData.affiliate_link,
          sales_page_url: productData.affiliate_link,
          price: productData.price,
          commission_rate: productData.commission_rate,
          commission_amount: productData.commission_amount,
          tags: productData.tags || [],
          is_active: true,
          slug: productData.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
          currency: 'BRL'
        };

        console.log('[CreateProduct] Dados preparados:', insertData);

        // Criar produto
        const { data: product, error: productError } = await supabase
          .from('products')
          .insert([insertData])
          .select()
          .single();

        if (productError) {
          console.error('[CreateProduct] Erro ao criar produto:', productError);
          throw productError;
        }

        console.log('[CreateProduct] Produto criado com sucesso:', product);

        // Criar ofertas associadas
        if (productData.offers && productData.offers.length > 0) {
          console.log('[CreateProduct] Criando ofertas associadas...');
          
          const offersData = productData.offers.map((offer: ProductOffer, index: number) => ({
            product_id: product.id,
            name: offer.title,
            price: offer.price,
            commission_rate: offer.commission_rate,
            commission_amount: offer.commission_amount,
            is_default: index === 0,
            is_active: true,
            sort_order: index
          }));

          const { error: offersError } = await supabase
            .from('product_offers')
            .insert(offersData);

          if (offersError) {
            console.error('[CreateProduct] Erro ao criar ofertas:', offersError);
          }
        }

        return product;
      } catch (error) {
        console.error('[CreateProduct] Erro geral:', error);
        throw error;
      }
    },
    onSuccess: () => {
      toast({
        title: "Produto criado com sucesso!",
        description: "O produto foi adicionado ao catálogo e está disponível para os afiliados.",
      });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      resetForm();
      onClose();
    },
    onError: (error: any) => {
      console.error('[CreateProduct] Erro na mutation:', error);
      toast({
        title: "Erro ao criar produto",
        description: error.message || "Ocorreu um erro inesperado. Tente novamente.",
        variant: "destructive",
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast({
        title: "Campo obrigatório",
        description: "Nome do produto é obrigatório.",
        variant: "destructive",
      });
      return;
    }

    if (!formData.category_id) {
      toast({
        title: "Campo obrigatório", 
        description: "Selecione uma categoria para o produto.",
        variant: "destructive",
      });
      return;
    }

    if (!formData.affiliate_link.trim()) {
      toast({
        title: "Campo obrigatório",
        description: "Link de afiliação é obrigatório.",
        variant: "destructive",
      });
      return;
    }

    if (!formData.image_url) {
      toast({
        title: "Imagem obrigatória",
        description: "Faça upload de uma imagem para o produto.",
        variant: "destructive",
      });
      return;
    }

    createProductMutation.mutate({
      ...formData,
      tags,
      offers
    });
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      category_id: '',
      image_url: '',
      affiliate_link: '',
      price: 0,
      commission_rate: 10,
      commission_amount: 0
    });
    setTags([]);
    setNewTag('');
    setImageFile(null);
    setImagePreview('');
    setOffers([]);
    setNewOffer({ title: '', price: 0, commission_rate: 10, commission_amount: 0 });
    setShowNewOfferForm(false);
    setActiveTab('basic');
    resetUpload();
  };

  const handleCategoryCreated = (category: any) => {
    setFormData(prev => ({ ...prev, category_id: category.id }));
    setShowCategoryModal(false);
  };

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim().toLowerCase())) {
      setTags([...tags, newTag.trim().toLowerCase()]);
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const addOffer = () => {
    if (!newOffer.title.trim() || newOffer.price <= 0) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha o título e o preço da oferta.",
        variant: "destructive",
      });
      return;
    }

    const offer: ProductOffer = {
      id: `temp_${Date.now()}`,
      title: newOffer.title,
      price: newOffer.price,
      commission_rate: newOffer.commission_rate,
      commission_amount: newOffer.commission_amount
    };

    setOffers([...offers, offer]);
    // ✅ CORREÇÃO: Limpar completamente o formulário de nova oferta
    setNewOffer({ title: '', price: 0, commission_rate: 10, commission_amount: 0 });
    setShowNewOfferForm(false);

    toast({
      title: "Oferta adicionada",
      description: "A oferta foi adicionada com sucesso.",
    });
  };

  const removeOffer = (offerId: string) => {
    setOffers(offers.filter(offer => offer.id !== offerId));
  };

  // Verificar se pode avançar para próxima aba
  const canAdvanceTab = (tab: string) => {
    switch (tab) {
      case 'basic':
        return formData.name.trim() && formData.category_id && formData.affiliate_link.trim();
      case 'image':
        return formData.image_url;
      case 'offers':
        return formData.price > 0;
      default:
        return true;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[85vh] overflow-hidden bg-white border border-gray-200 text-gray-900 shadow-lg">
        <DialogHeader className="border-b border-gray-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <Plus className="h-5 w-5 text-white" />
            </div>
            <div>
              <DialogTitle className="text-xl font-semibold text-gray-900">
                Cadastrar Novo Produto
              </DialogTitle>
              <DialogDescription className="text-sm text-gray-600 mt-1">
                Preencha as informações do produto em etapas organizadas
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex-1 overflow-hidden">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
            <TabsList className="grid w-full grid-cols-4 bg-gray-50 border border-gray-200 mb-4 h-12 p-1 rounded-lg">
              <TabsTrigger 
                value="basic" 
                className="flex items-center gap-2 text-sm font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm"
              >
                <Package className="h-4 w-4" />
                <span className="hidden sm:inline">Informações Básicas</span>
                <span className="sm:hidden">Básico</span>
                {canAdvanceTab('basic') && <Check className="h-3 w-3 text-green-600" />}
              </TabsTrigger>
              <TabsTrigger 
                value="image" 
                className="flex items-center gap-2 text-sm font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm" 
                disabled={!canAdvanceTab('basic')}
              >
                <Image className="h-4 w-4" />
                <span className="hidden sm:inline">Imagem</span>
                <span className="sm:hidden">Foto</span>
                {canAdvanceTab('image') && <Check className="h-3 w-3 text-green-600" />}
              </TabsTrigger>
              <TabsTrigger 
                value="offers" 
                className="flex items-center gap-2 text-sm font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm" 
                disabled={!canAdvanceTab('image')}
              >
                <ShoppingCart className="h-4 w-4" />
                <span className="hidden sm:inline">Preços & Ofertas</span>
                <span className="sm:hidden">Preços</span>
                {canAdvanceTab('offers') && <Check className="h-3 w-3 text-green-600" />}
              </TabsTrigger>
              <TabsTrigger 
                value="tags" 
                className="flex items-center gap-2 text-sm font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm" 
                disabled={!canAdvanceTab('offers')}
              >
                <Tags className="h-4 w-4" />
                <span className="hidden sm:inline">Tags & Finalizar</span>
                <span className="sm:hidden">Tags</span>
              </TabsTrigger>
            </TabsList>

            <div className="flex-1 overflow-y-auto px-1">
              {/* Aba 1: Informações Básicas */}
              <TabsContent value="basic" className="space-y-6 h-full mt-0">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Coluna 1: Informações do Produto */}
                  <div className="space-y-4">
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                      <h3 className="font-medium text-blue-900 mb-3 flex items-center gap-2">
                        <Info className="h-4 w-4" />
                        Informações do Produto
                      </h3>
                      
                      <div className="space-y-3">
                        <div>
                          <Label htmlFor="name" className="text-sm font-medium text-gray-700">
                            Nome do Produto *
                          </Label>
                          <Input
                            id="name"
                            value={formData.name}
                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                            className="mt-1 bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                            placeholder="Ex: Curso Completo de Marketing Digital"
                            required
                          />
                        </div>

                        <div>
                          <Label htmlFor="description" className="text-sm font-medium text-gray-700">
                            Descrição do Produto *
                          </Label>
                          <Textarea
                            id="description"
                            value={formData.description}
                            onChange={(e) => setFormData({...formData, description: e.target.value})}
                            className="mt-1 bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500 min-h-[100px]"
                            placeholder="Descreva detalhadamente o produto, seus benefícios e o que está incluído..."
                            required
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Coluna 2: Categoria e Link */}
                  <div className="space-y-4">
                    <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                      <h3 className="font-medium text-green-900 mb-3 flex items-center gap-2">
                        <Package className="h-4 w-4" />
                        Categoria & Link
                      </h3>
                      
                      <div className="space-y-3">
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <Label className="text-sm font-medium text-gray-700">
                              Categoria *
                            </Label>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => setShowCategoryModal(true)}
                              className="text-xs h-7 px-2 border-green-300 text-green-700 hover:bg-green-100"
                            >
                              <Plus className="h-3 w-3 mr-1" />
                              Nova
                            </Button>
                          </div>
                          <Select value={formData.category_id} onValueChange={(value) => setFormData({...formData, category_id: value})}>
                            <SelectTrigger className="bg-white border-gray-300 focus:border-green-500 focus:ring-green-500">
                              <SelectValue placeholder="Selecione uma categoria" />
                            </SelectTrigger>
                            <SelectContent className="bg-white border-gray-200">
                              {categories?.map((category) => (
                                <SelectItem key={category.id} value={category.id} className="hover:bg-gray-50">
                                  {category.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label htmlFor="affiliate_link" className="text-sm font-medium text-gray-700 flex items-center gap-1">
                            Link de Afiliação *
                            <ExternalLink className="h-3 w-3 text-gray-400" />
                          </Label>
                          <Input
                            id="affiliate_link"
                            value={formData.affiliate_link}
                            onChange={(e) => setFormData({...formData, affiliate_link: e.target.value})}
                            className="mt-1 bg-white border-gray-300 focus:border-green-500 focus:ring-green-500"
                            placeholder="https://exemplo.com/meu-produto"
                            required
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            URL da página de vendas ou plataforma de afiliação
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-4 border-t border-gray-100">
                  <Button
                    type="button"
                    onClick={() => setActiveTab('image')}
                    disabled={!canAdvanceTab('basic')}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6"
                  >
                    Próximo: Adicionar Imagem
                  </Button>
                </div>
              </TabsContent>

              {/* Aba 2: Upload de Imagem */}
              <TabsContent value="image" className="space-y-6 h-full mt-0">
                <div className="flex justify-center">
                  <div className="w-full max-w-md">
                    <div className="bg-purple-50 p-6 rounded-lg border border-purple-200 text-center">
                      <h3 className="font-medium text-purple-900 mb-4 flex items-center justify-center gap-2">
                        <Image className="h-5 w-5" />
                        Imagem do Produto
                      </h3>
                      
                      <div className="space-y-4">
                        <p className="text-sm text-purple-700">
                          Faça upload de uma imagem de alta qualidade
                        </p>
                        <p className="text-xs text-purple-600">
                          Recomendado: 500x500px • PNG, JPG ou WEBP • Máx. 10MB
                        </p>
                        
                        <div>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="hidden"
                            id="image-upload"
                          />
                          <label
                            htmlFor="image-upload"
                            className="block w-full h-64 border-2 border-dashed border-purple-300 rounded-lg cursor-pointer bg-white hover:bg-purple-25 transition-colors"
                          >
                            {uploadingImage ? (
                              <div className="flex flex-col items-center justify-center h-full space-y-2">
                                <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
                                <span className="text-sm text-purple-700">Enviando...</span>
                                <div className="w-32 bg-purple-200 rounded-full h-2">
                                  <div 
                                    className="bg-purple-600 h-2 rounded-full transition-all" 
                                    style={{ width: `${uploadProgress}%` }}
                                  />
                                </div>
                                <span className="text-xs text-purple-600">{uploadProgress}%</span>
                              </div>
                            ) : imagePreview ? (
                              <img 
                                src={imagePreview} 
                                alt="Preview" 
                                className="h-full w-full object-cover rounded-lg" 
                              />
                            ) : (
                              <div className="flex flex-col items-center justify-center h-full space-y-3">
                                <Upload className="h-12 w-12 text-purple-400" />
                                <div className="space-y-1">
                                  <span className="text-sm font-medium text-purple-700">
                                    Clique para fazer upload
                                  </span>
                                  <p className="text-xs text-purple-600">
                                    ou arraste e solte aqui
                                  </p>
                                </div>
                              </div>
                            )}
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between pt-4 border-t border-gray-100">
                  <Button
                    type="button"
                    onClick={() => setActiveTab('basic')}
                    variant="outline"
                    className="border-gray-300 text-gray-700 hover:bg-gray-50"
                  >
                    Voltar
                  </Button>
                  <Button
                    type="button"
                    onClick={() => setActiveTab('offers')}
                    disabled={!canAdvanceTab('image')}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6"
                  >
                    Próximo: Configurar Preços
                  </Button>
                </div>
              </TabsContent>

              {/* Aba 3: Ofertas e Preços */}
              <TabsContent value="offers" className="space-y-6 h-full mt-0">
                {/* Oferta Principal */}
                <div className="bg-orange-50 p-6 rounded-lg border border-orange-200">
                  <h3 className="font-medium text-orange-900 mb-4 flex items-center gap-2">
                    <DollarSign className="h-5 w-5" />
                    Oferta Principal
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="price" className="text-sm font-medium text-gray-700">
                        Preço (R$) *
                      </Label>
                      <Input
                        id="price"
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.price}
                        onChange={(e) => setFormData({...formData, price: parseFloat(e.target.value) || 0})}
                        className="mt-1 bg-white border-gray-300 focus:border-orange-500 focus:ring-orange-500"
                        placeholder="0.00"
                        required
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="commission_rate" className="text-sm font-medium text-gray-700">
                        Taxa de Comissão (%)
                      </Label>
                      <Input
                        id="commission_rate"
                        type="number"
                        step="0.01"
                        min="0"
                        max="100"
                        value={formData.commission_rate}
                        onChange={(e) => setFormData({...formData, commission_rate: parseFloat(e.target.value) || 0})}
                        className="mt-1 bg-white border-gray-300 focus:border-orange-500 focus:ring-orange-500"
                        placeholder="10"
                      />
                    </div>
                    
                    <div>
                      <Label className="text-sm font-medium text-gray-700">
                        Valor da Comissão
                      </Label>
                      <div className="mt-1 p-3 bg-green-100 border border-green-300 rounded-md text-green-800 font-medium">
                        R$ {formData.commission_amount.toFixed(2)}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Ofertas Adicionais */}
                <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-medium text-blue-900 flex items-center gap-2">
                      <ShoppingCart className="h-5 w-5" />
                      Ofertas Adicionais ({offers.length})
                    </h3>
                    <Button
                      type="button"
                      onClick={() => setShowNewOfferForm(!showNewOfferForm)}
                      variant="outline"
                      size="sm"
                      className="border-blue-300 text-blue-700 hover:bg-blue-100"
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      {showNewOfferForm ? 'Cancelar' : 'Adicionar Oferta'}
                    </Button>
                  </div>

                  {/* Formulário Nova Oferta */}
                  {showNewOfferForm && (
                    <div className="bg-white p-4 rounded-lg border border-blue-200 mb-4">
                      <h4 className="font-medium text-gray-900 mb-3">Nova Oferta</h4>
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                        <div>
                          <Label className="text-sm font-medium text-gray-700">
                            Título da Oferta *
                          </Label>
                          <Input
                            value={newOffer.title}
                            onChange={(e) => setNewOffer({...newOffer, title: e.target.value})}
                            className="mt-1 bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                            placeholder="Ex: Oferta Premium"
                          />
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-gray-700">
                            Preço (R$) *
                          </Label>
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            value={newOffer.price}
                            onChange={(e) => setNewOffer({...newOffer, price: parseFloat(e.target.value) || 0})}
                            className="mt-1 bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                            placeholder="0.00"
                          />
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-gray-700">
                            Comissão (%)
                          </Label>
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            max="100"
                            value={newOffer.commission_rate}
                            onChange={(e) => setNewOffer({...newOffer, commission_rate: parseFloat(e.target.value) || 0})}
                            className="mt-1 bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                            placeholder="10"
                          />
                        </div>
                        <div className="flex items-end">
                          <Button
                            type="button"
                            onClick={addOffer}
                            className="w-full bg-green-600 hover:bg-green-700 text-white"
                          >
                            <Plus className="h-4 w-4 mr-1" />
                            Adicionar
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Lista de Ofertas */}
                  {offers.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {offers.map((offer) => (
                        <div key={offer.id} className="bg-white p-4 rounded-lg border border-blue-200">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h5 className="font-medium text-gray-900">{offer.title}</h5>
                              <p className="text-sm text-gray-600 mt-1">
                                R$ {offer.price.toFixed(2)} • {offer.commission_rate}% comissão
                              </p>
                              <p className="text-xs text-green-600 mt-1">
                                Comissão: R$ {offer.commission_amount.toFixed(2)}
                              </p>
                            </div>
                            <Button
                              type="button"
                              onClick={() => removeOffer(offer.id)}
                              variant="outline"
                              size="sm"
                              className="ml-2 border-red-300 text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex justify-between pt-4 border-t border-gray-100">
                  <Button
                    type="button"
                    onClick={() => setActiveTab('image')}
                    variant="outline"
                    className="border-gray-300 text-gray-700 hover:bg-gray-50"
                  >
                    Voltar
                  </Button>
                  <Button
                    type="button"
                    onClick={() => setActiveTab('tags')}
                    disabled={!canAdvanceTab('offers')}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6"
                  >
                    Próximo: Tags e Finalizar
                  </Button>
                </div>
              </TabsContent>

              {/* Aba 4: Tags e Finalização */}
              <TabsContent value="tags" className="space-y-6 h-full mt-0">
                <div className="bg-indigo-50 p-6 rounded-lg border border-indigo-200">
                  <h3 className="font-medium text-indigo-900 mb-4 flex items-center gap-2">
                    <Tags className="h-5 w-5" />
                    Tags do Produto
                  </h3>
                  
                  <div className="space-y-4">
                    <p className="text-sm text-indigo-700">
                      Tags ajudam na busca e categorização. Algumas são geradas automaticamente baseadas no nome do produto.
                    </p>
                    
                    <div className="flex flex-wrap gap-2">
                      {tags.map((tag, index) => (
                        <Badge 
                          key={index} 
                          variant="secondary" 
                          className="bg-indigo-100 text-indigo-800 hover:bg-indigo-200 flex items-center gap-1"
                        >
                          {tag}
                          <X 
                            className="h-3 w-3 cursor-pointer hover:text-indigo-600" 
                            onClick={() => removeTag(tag)} 
                          />
                        </Badge>
                      ))}
                    </div>
                    
                    <div className="flex gap-2">
                      <Input
                        value={newTag}
                        onChange={(e) => setNewTag(e.target.value)}
                        className="flex-1 bg-white border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                        placeholder="Adicionar nova tag..."
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                      />
                      <Button 
                        type="button" 
                        onClick={addTag} 
                        variant="outline"
                        className="border-indigo-300 text-indigo-700 hover:bg-indigo-100"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Resumo Final */}
                {formData.price > 0 && formData.commission_rate > 0 && (
                  <div className="bg-green-50 p-6 rounded-lg border border-green-200">
                    <h3 className="font-medium text-green-900 mb-3 flex items-center gap-2">
                      <Check className="h-5 w-5" />
                      Resumo do Produto
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-gray-700">Nome:</span>
                        <span className="ml-2 text-gray-900">{formData.name || 'Não informado'}</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Preço:</span>
                        <span className="ml-2 text-gray-900">R$ {formData.price.toFixed(2)}</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Comissão:</span>
                        <span className="ml-2 text-green-600 font-medium">
                          R$ {formData.commission_amount.toFixed(2)} ({formData.commission_rate}%)
                        </span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Ofertas extras:</span>
                        <span className="ml-2 text-gray-900">{offers.length}</span>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex justify-between pt-4 border-t border-gray-100">
                  <Button
                    type="button"
                    onClick={() => setActiveTab('offers')}
                    variant="outline"
                    className="border-gray-300 text-gray-700 hover:bg-gray-50"
                  >
                    Voltar
                  </Button>
                </div>
              </TabsContent>
            </div>
          </Tabs>

          <DialogFooter className="border-t border-gray-100 pt-4 mt-4">
            <div className="flex justify-between w-full">
              <Button 
                type="button" 
                onClick={onClose} 
                variant="outline" 
                className="border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                Cancelar
              </Button>
              <Button 
                type="submit" 
                disabled={createProductMutation.isPending || uploadingImage || !formData.image_url || !formData.name.trim() || !formData.category_id || !formData.affiliate_link.trim()}
                className="bg-green-600 hover:bg-green-700 text-white px-8"
              >
                {createProductMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Criando Produto...
                  </>
                ) : (
                  <>
                    <Check className="h-4 w-4 mr-2" />
                    Criar Produto
                  </>
                )}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>

      {/* Modal de criação de categoria */}
      <CreateCategoryModal 
        isOpen={showCategoryModal} 
        onClose={() => setShowCategoryModal(false)}
        onCategoryCreated={handleCategoryCreated}
      />
    </Dialog>
  );
};

export default CreateProductModal; 
