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
import { Plus, X, DollarSign, Upload, Loader2, AlertTriangle, Trash2, ExternalLink, Package, Image, Tags, ShoppingCart } from 'lucide-react';
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
      <DialogContent className="max-w-4xl max-h-[75vh] overflow-hidden bg-gradient-to-br from-slate-900/98 via-slate-800/98 to-slate-900/98 border border-slate-600/50 text-white backdrop-blur-md shadow-2xl">
        <DialogHeader className="border-b border-slate-700/50 pb-2">
          <DialogTitle className="text-lg font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400 bg-clip-text text-transparent flex items-center gap-2">
            <div className="w-5 h-5 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg flex items-center justify-center">
              <Plus className="h-3 w-3 text-white" />
              </div>
            Novo Produto
          </DialogTitle>
          <DialogDescription className="text-slate-400 text-xs">
            Configure em etapas organizadas
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex-1 overflow-hidden">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
            <TabsList className="grid w-full grid-cols-4 bg-slate-800/50 border border-slate-600/50 mb-2 h-8">
              <TabsTrigger value="basic" className="flex items-center gap-1 text-xs h-6">
                <Package className="h-3 w-3" />
                Básico
              </TabsTrigger>
              <TabsTrigger value="image" className="flex items-center gap-1 text-xs h-6" disabled={!canAdvanceTab('basic')}>
                <Image className="h-3 w-3" />
                Imagem
              </TabsTrigger>
              <TabsTrigger value="offers" className="flex items-center gap-1 text-xs h-6" disabled={!canAdvanceTab('image')}>
                <ShoppingCart className="h-3 w-3" />
                Ofertas
              </TabsTrigger>
              <TabsTrigger value="tags" className="flex items-center gap-1 text-xs h-6" disabled={!canAdvanceTab('offers')}>
                <Tags className="h-3 w-3" />
                Tags
              </TabsTrigger>
            </TabsList>

            <div className="flex-1 overflow-y-auto">
              {/* Aba 1: Informações Básicas - Layout Grid Compacto */}
              <TabsContent value="basic" className="space-y-2 h-full">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
                  {/* Coluna 1: Campos básicos */}
            <div className="space-y-2">
                    <div>
                      <Label htmlFor="name" className="text-slate-200 text-xs">Nome do Produto *</Label>
              <Input
                id="name"
                value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        className="bg-slate-800 border-slate-600 text-white h-7 text-sm"
                        placeholder="Ex: Curso de Marketing"
                        required
              />
            </div>

                    <div>
                      <div className="flex items-center gap-1 mb-1">
                        <Label className="text-slate-200 text-xs flex-1">Categoria *</Label>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setShowCategoryModal(true)}
                          className="border-cyan-500/50 text-cyan-400 hover:bg-cyan-600 hover:text-white text-xs h-5 px-1"
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                      <Select value={formData.category_id} onValueChange={(value) => setFormData({...formData, category_id: value})}>
                        <SelectTrigger className="bg-slate-800 border-slate-600 text-white h-7">
                          <SelectValue placeholder="Selecionar" />
                </SelectTrigger>
                        <SelectContent className="bg-slate-800 border-slate-600">
                          {categories?.map((category) => (
                            <SelectItem key={category.id} value={category.id} className="text-white hover:bg-slate-700">
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

                  {/* Coluna 2: Link de afiliação */}
          <div className="space-y-2">
                    <div>
                      <Label htmlFor="affiliate_link" className="text-slate-200 flex items-center gap-1 text-xs">
                        Link de Afiliação *
                        <ExternalLink className="h-3 w-3 text-slate-400" />
            </Label>
                <Input
                        id="affiliate_link"
                        value={formData.affiliate_link}
                        onChange={(e) => setFormData({...formData, affiliate_link: e.target.value})}
                        className="bg-slate-800 border-slate-600 text-white h-7 text-sm"
                        placeholder="https://exemplo.com/produto"
                        required
                />
                <p className="text-xs text-slate-400 mt-1">
                        Página de afiliação do produto
                </p>
              </div>
                  </div>

                  {/* Coluna 3: Descrição compacta */}
                  <div>
                    <Label htmlFor="description" className="text-slate-200 text-xs">Descrição *</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      className="bg-slate-800 border-slate-600 text-white h-20 text-xs"
                      placeholder="Descreva o produto..."
                      required
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-1">
                  <Button
                    type="button"
                    onClick={() => setActiveTab('image')}
                    disabled={!canAdvanceTab('basic')}
                    className="bg-cyan-600 hover:bg-cyan-700 h-7 text-xs"
                  >
                    Próximo: Imagem
                  </Button>
            </div>
              </TabsContent>

              {/* Aba 2: Upload de Imagem Compacto */}
              <TabsContent value="image" className="space-y-2 h-full">
                <div className="flex justify-center">
                  <div className="w-full max-w-xs">
                    <Label className="text-slate-200 text-center block mb-1 text-xs">Imagem do Produto *</Label>
                    <p className="text-xs text-slate-400 mb-1 text-center">Ideal: 310x310px</p>
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
                        className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-slate-600 rounded-lg cursor-pointer bg-slate-800 hover:bg-slate-700 transition-colors"
                      >
                        {uploadingImage ? (
                          <div className="flex flex-col items-center space-y-1">
                            <Loader2 className="h-5 w-5 animate-spin text-cyan-400" />
                            <span className="text-xs text-slate-300">Upload... {uploadProgress}%</span>
                          </div>
                        ) : imagePreview ? (
                          <img src={imagePreview} alt="Preview" className="h-full w-full object-cover rounded-lg" />
                        ) : (
                          <div className="flex flex-col items-center space-y-1">
                            <Upload className="h-6 w-6 text-slate-400" />
                            <span className="text-xs text-slate-300">Clique para upload</span>
                            <span className="text-xs text-slate-400">PNG, JPG, WEBP</span>
                            <span className="text-xs text-cyan-400">310x310px</span>
              </div>
            )}
                      </label>
                    </div>
                  </div>
          </div>

                <div className="flex justify-between pt-1">
                  <Button
                    type="button"
                    onClick={() => setActiveTab('basic')}
                    variant="outline"
                    className="bg-slate-700 border-slate-600 text-white hover:bg-slate-600 h-7 text-xs"
                  >
                    Voltar
                  </Button>
                  <Button
                    type="button"
                    onClick={() => setActiveTab('offers')}
                    disabled={!canAdvanceTab('image')}
                    className="bg-cyan-600 hover:bg-cyan-700 h-7 text-xs"
                  >
                    Próximo: Ofertas
                  </Button>
          </div>
              </TabsContent>

              {/* Aba 3: Ofertas Compacta */}
              <TabsContent value="offers" className="space-y-2 h-full">
                {/* Oferta Principal */}
                <div className="bg-gradient-to-r from-slate-800/50 to-slate-700/50 rounded-lg p-2 border border-slate-600/50">
                  <h4 className="text-white font-medium mb-2 text-xs">Oferta Principal</h4>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <Label htmlFor="price" className="text-slate-200 text-xs">Preço (R$) *</Label>
            <Input
                        id="price"
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.price}
                        onChange={(e) => setFormData({...formData, price: parseFloat(e.target.value) || 0})}
                        className="bg-slate-800 border-slate-600 text-white h-7 text-xs"
                        placeholder="0.00"
                        required
            />
          </div>
                    <div>
                      <Label htmlFor="commission_rate" className="text-slate-200 text-xs">Comissão (%)</Label>
              <Input
                        id="commission_rate"
                        type="number"
                        step="0.01"
                        min="0"
                        max="100"
                        value={formData.commission_rate}
                        onChange={(e) => setFormData({...formData, commission_rate: parseFloat(e.target.value) || 0})}
                        className="bg-slate-800 border-slate-600 text-white h-7 text-xs"
                        placeholder="10"
                      />
                    </div>
                    <div>
                      <Label className="text-slate-200 text-xs">Valor</Label>
                      <div className="p-1 bg-slate-800 border border-slate-600 rounded text-green-400 text-xs h-7 flex items-center">
                        R$ {formData.commission_amount.toFixed(2)}
            </div>
            </div>
          </div>
            </div>

                {/* Ofertas Adicionais Compactas */}
                <div className="space-y-2">
                <div className="flex items-center justify-between">
                    <h4 className="text-white font-medium text-xs">Ofertas Adicionais ({offers.length})</h4>
                    <Button
                      type="button"
                      onClick={() => setShowNewOfferForm(!showNewOfferForm)}
                      variant="outline"
                      size="sm"
                      className="bg-slate-700 border-slate-600 text-white hover:bg-slate-600 h-6 text-xs px-2"
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      {showNewOfferForm ? 'Cancelar' : 'Add'}
                    </Button>
                  </div>

                  {/* Formulário Nova Oferta Compacto */}
                  {showNewOfferForm && (
                    <div className="bg-gradient-to-r from-green-900/20 to-emerald-900/20 rounded-lg p-2 border border-green-600/30">
                      <div className="grid grid-cols-4 gap-2">
                        <div>
                          <Label className="text-green-200 text-xs">Título *</Label>
                          <Input
                            value={newOffer.title}
                            onChange={(e) => setNewOffer({...newOffer, title: e.target.value})}
                            className="bg-slate-800 border-slate-600 text-white h-6 text-xs"
                            placeholder="Premium"
                          />
                        </div>
                        <div>
                          <Label className="text-green-200 text-xs">Valor *</Label>
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            value={newOffer.price}
                            onChange={(e) => setNewOffer({...newOffer, price: parseFloat(e.target.value) || 0})}
                            className="bg-slate-800 border-slate-600 text-white h-6 text-xs"
                            placeholder="0.00"
                          />
                        </div>
                        <div>
                          <Label className="text-green-200 text-xs">Comissão</Label>
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            max="100"
                            value={newOffer.commission_rate}
                            onChange={(e) => setNewOffer({...newOffer, commission_rate: parseFloat(e.target.value) || 0})}
                            className="bg-slate-800 border-slate-600 text-white h-6 text-xs"
                            placeholder="10"
                          />
                        </div>
                        <div className="flex items-end">
                          <Button
                            type="button"
                            onClick={addOffer}
                            className="w-full bg-green-600 hover:bg-green-700 h-6 text-xs"
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Lista Ofertas */}
                  {offers.length > 0 && (
                    <div className="grid grid-cols-2 gap-2">
                      {offers.map((offer) => (
                        <div key={offer.id} className="bg-gradient-to-r from-blue-900/20 to-indigo-900/20 rounded p-2 border border-blue-600/30">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <h5 className="text-blue-300 font-medium text-xs">{offer.title}</h5>
                              <p className="text-slate-400 text-xs">
                                R$ {offer.price.toFixed(2)} • {offer.commission_rate}%
                              </p>
                            </div>
                            <Button
                              type="button"
                              onClick={() => removeOffer(offer.id)}
                              variant="outline"
                              size="sm"
                              className="bg-red-600/20 border-red-500/50 text-red-400 hover:bg-red-600/30 h-5 w-5 p-0"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex justify-between pt-1">
                  <Button
                    type="button"
                    onClick={() => setActiveTab('image')}
                    variant="outline"
                    className="bg-slate-700 border-slate-600 text-white hover:bg-slate-600 h-7 text-xs"
                  >
                    Voltar
                  </Button>
                  <Button
                    type="button"
                    onClick={() => setActiveTab('tags')}
                    disabled={!canAdvanceTab('offers')}
                    className="bg-cyan-600 hover:bg-cyan-700 h-7 text-xs"
                  >
                    Próximo: Tags
                  </Button>
                </div>
              </TabsContent>

              {/* Aba 4: Tags Compacta */}
              <TabsContent value="tags" className="space-y-2 h-full">
                <div>
                  <Label className="text-slate-200 text-xs">Tags do Produto</Label>
                  <p className="text-xs text-slate-400 mb-1">Tags automáticas + personalizadas</p>
                  
                  <div className="flex flex-wrap gap-1 mb-2">
                    {tags.map((tag, index) => (
                      <Badge key={index} variant="secondary" className="bg-cyan-900 text-cyan-200 hover:bg-cyan-800 text-xs h-4">
                        {tag}
                        <X className="h-3 w-3 ml-1 cursor-pointer" onClick={() => removeTag(tag)} />
                      </Badge>
                    ))}
                  </div>
                  
                  <div className="flex gap-2">
                    <Input
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      className="bg-slate-800 border-slate-600 text-white h-7 text-xs"
                      placeholder="Adicionar tag..."
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                    />
                    <Button type="button" onClick={addTag} variant="outline" className="bg-slate-700 border-slate-600 text-white hover:bg-slate-600 h-7 px-2">
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                </div>

                {/* Preview Final Compacto */}
                {formData.price > 0 && formData.commission_rate > 0 && (
                  <div className="p-2 bg-gradient-to-r from-green-900/30 to-emerald-900/30 rounded border border-green-700">
                    <div className="flex items-center gap-2 text-green-400">
                      <DollarSign className="h-3 w-3" />
                      <span className="text-xs font-medium">
                        Comissão: R$ {formData.commission_amount.toFixed(2)} ({formData.commission_rate}%)
                      </span>
                    </div>
                  </div>
                )}

                <div className="flex justify-between pt-1">
                  <Button
                    type="button"
                    onClick={() => setActiveTab('offers')}
                    variant="outline"
                    className="bg-slate-700 border-slate-600 text-white hover:bg-slate-600 h-7 text-xs"
                  >
                    Voltar
                  </Button>
                </div>
              </TabsContent>
              </div>
          </Tabs>

          <DialogFooter className="border-t border-slate-700/50 pt-2 mt-1">
            <div className="flex justify-between w-full">
              <Button type="button" onClick={onClose} variant="outline" className="bg-slate-700 border-slate-600 text-white hover:bg-slate-600 h-7 text-xs">
                Cancelar
              </Button>
              <Button 
                type="submit" 
                disabled={createProductMutation.isPending || uploadingImage || !formData.image_url || !formData.name.trim() || !formData.category_id || !formData.affiliate_link.trim()}
                className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white h-7 text-xs"
              >
                {createProductMutation.isPending ? (
                  <>
                    <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                    Criando...
                  </>
                ) : (
                  <>
                    <Plus className="h-3 w-3 mr-1" />
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
