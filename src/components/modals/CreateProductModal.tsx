import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Plus, X, DollarSign, Upload, Loader2, AlertTriangle, Trash2, ExternalLink } from 'lucide-react';
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

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category_id: '',
    image_url: '',
    affiliate_link: '', // Link que direcionará para a afiliação do produto
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[95vh] overflow-y-auto bg-gradient-to-br from-slate-900/98 via-slate-800/98 to-slate-900/98 border border-slate-600/50 text-white backdrop-blur-md shadow-2xl">
        <DialogHeader className="border-b border-slate-700/50 pb-6">
          <DialogTitle className="text-3xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400 bg-clip-text text-transparent flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg flex items-center justify-center">
              <Plus className="h-6 w-6 text-white" />
            </div>
            Cadastrar Novo Produto
          </DialogTitle>
          <DialogDescription className="text-slate-400 text-lg mt-2">
            Configure seu produto com informações detalhadas e ofertas personalizadas para maximizar suas vendas.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-8 pt-6">
          {/* Informações Básicas */}
          <div className="bg-gradient-to-r from-slate-800/30 to-slate-700/30 rounded-2xl p-6 border border-slate-600/30">
            <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
              <div className="w-2 h-6 bg-gradient-to-b from-orange-500 to-orange-600 rounded-full"></div>
              Informações Básicas
            </h3>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name" className="text-slate-200">Nome do Produto *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="bg-slate-800 border-slate-600 text-white"
                    placeholder="Ex: Curso de Marketing Digital"
                    required
                  />
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Label htmlFor="category" className="text-slate-200 flex-1">Categoria *</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setShowCategoryModal(true)}
                      className="border-cyan-500/50 text-cyan-400 hover:bg-cyan-600 hover:text-white"
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      Nova Categoria
                    </Button>
                  </div>
                  <Select value={formData.category_id} onValueChange={(value) => setFormData({...formData, category_id: value})}>
                    <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
                      <SelectValue placeholder="Selecione uma categoria" />
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

                <div>
                  <Label htmlFor="affiliate_link" className="text-slate-200 flex items-center gap-2">
                    Link de Afiliação *
                    <ExternalLink className="h-4 w-4 text-slate-400" />
                  </Label>
                  <Input
                    id="affiliate_link"
                    value={formData.affiliate_link}
                    onChange={(e) => setFormData({...formData, affiliate_link: e.target.value})}
                    className="bg-slate-800 border-slate-600 text-white"
                    placeholder="https://exemplo.com/produto"
                    required
                  />
                  <p className="text-xs text-slate-400 mt-1">
                    Este é o link que direcionará os usuários para a página de afiliação do produto
                  </p>
                </div>
              </div>

              {/* Upload de Imagem */}
              <div className="space-y-4">
                <div>
                  <Label className="text-slate-200">Imagem do Produto *</Label>
                  <p className="text-xs text-slate-400 mb-2">Dimensão ideal: 310x310px</p>
                  <div className="mt-2">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      id="image-upload"
                    />
                    <label
                      htmlFor="image-upload"
                      className="flex flex-col items-center justify-center w-full h-[310px] border-2 border-dashed border-slate-600 rounded-lg cursor-pointer bg-slate-800 hover:bg-slate-700 transition-colors"
                    >
                      {uploadingImage ? (
                        <div className="flex flex-col items-center space-y-2">
                          <Loader2 className="h-8 w-8 animate-spin text-cyan-400" />
                          <span className="text-sm text-slate-300">Fazendo upload... {uploadProgress}%</span>
                        </div>
                      ) : imagePreview ? (
                        <img src={imagePreview} alt="Preview" className="h-full w-full object-cover rounded-lg" />
                      ) : (
                        <div className="flex flex-col items-center space-y-2">
                          <Upload className="h-10 w-10 text-slate-400" />
                          <span className="text-sm text-slate-300">Clique para fazer upload</span>
                          <span className="text-xs text-slate-400">PNG, JPG, WEBP até 10MB</span>
                          <span className="text-xs text-cyan-400">Dimensão ideal: 310x310px</span>
                        </div>
                      )}
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Descrição */}
          <div>
            <Label htmlFor="description" className="text-slate-200">Descrição do Produto *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className="bg-slate-800 border-slate-600 text-white min-h-[100px]"
              placeholder="Descreva detalhadamente o produto, seus benefícios e características..."
              required
            />
          </div>

          {/* Ofertas */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-slate-200 text-lg font-semibold">Ofertas</Label>
              <Button
                type="button"
                onClick={() => setShowNewOfferForm(true)}
                variant="outline"
                size="sm"
                className="bg-slate-700 border-slate-600 text-white hover:bg-slate-600 hover:border-green-500/50"
                disabled={showNewOfferForm}
              >
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Oferta
              </Button>
            </div>
            
            {/* Oferta Principal */}
            <div className="bg-gradient-to-r from-slate-800/50 to-slate-700/50 rounded-xl p-6 border border-slate-600/50">
              <h4 className="text-white font-medium mb-4">Oferta Principal</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="price" className="text-slate-200">Preço (R$) *</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.price}
                    onChange={(e) => setFormData({...formData, price: parseFloat(e.target.value) || 0})}
                    className="bg-slate-800 border-slate-600 text-white"
                    placeholder="0.00"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="commission_rate" className="text-slate-200">Taxa de Comissão (%)</Label>
                  <Input
                    id="commission_rate"
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    value={formData.commission_rate}
                    onChange={(e) => setFormData({...formData, commission_rate: parseFloat(e.target.value) || 0})}
                    className="bg-slate-800 border-slate-600 text-white"
                    placeholder="10.00"
                  />
                </div>

                <div>
                  <Label htmlFor="commission_amount" className="text-slate-200">Valor da Comissão (R$)</Label>
                  <Input
                    id="commission_amount"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.commission_amount}
                    onChange={(e) => setFormData({...formData, commission_amount: parseFloat(e.target.value) || 0})}
                    className="bg-slate-800 border-slate-600 text-white"
                    placeholder="Calculado automaticamente"
                    readOnly={formData.price > 0 && formData.commission_rate > 0}
                  />
                </div>
              </div>
            </div>

            {/* Formulário de Nova Oferta */}
            {showNewOfferForm && (
              <div className="bg-gradient-to-r from-green-900/20 to-emerald-900/20 rounded-xl p-6 border border-green-600/30">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-green-300 font-medium">Nova Oferta</h4>
                  <Button
                    type="button"
                    onClick={() => setShowNewOfferForm(false)}
                    variant="outline"
                    size="sm"
                    className="bg-red-600/20 border-red-500/50 text-red-400 hover:bg-red-600/30"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <Label className="text-green-200">Título da Oferta *</Label>
                    <Input
                      value={newOffer.title}
                      onChange={(e) => setNewOffer({...newOffer, title: e.target.value})}
                      className="bg-slate-800 border-slate-600 text-white"
                      placeholder="Ex: Oferta Premium"
                    />
                  </div>
                  <div>
                    <Label className="text-green-200">Valor (R$) *</Label>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      value={newOffer.price}
                      onChange={(e) => setNewOffer({...newOffer, price: parseFloat(e.target.value) || 0})}
                      className="bg-slate-800 border-slate-600 text-white"
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <Label className="text-green-200">Comissão (%)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      max="100"
                      value={newOffer.commission_rate}
                      onChange={(e) => setNewOffer({...newOffer, commission_rate: parseFloat(e.target.value) || 0})}
                      className="bg-slate-800 border-slate-600 text-white"
                      placeholder="10.00"
                    />
                  </div>
                  <div className="flex items-end">
                    <Button
                      type="button"
                      onClick={addOffer}
                      className="w-full bg-green-600 hover:bg-green-700"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Adicionar
                    </Button>
                  </div>
                </div>
                {newOffer.price > 0 && newOffer.commission_rate > 0 && (
                  <p className="text-green-400 text-sm mt-2">
                    Comissão: R$ {newOffer.commission_amount.toFixed(2)}
                  </p>
                )}
              </div>
            )}

            {/* Lista de Ofertas Adicionais */}
            {offers.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-white font-medium">Ofertas Adicionais ({offers.length})</h4>
                {offers.map((offer, index) => (
                  <div key={offer.id} className="bg-gradient-to-r from-blue-900/20 to-indigo-900/20 rounded-lg p-4 border border-blue-600/30">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h5 className="text-blue-300 font-medium">{offer.title}</h5>
                        <p className="text-slate-400 text-sm">
                          Preço: R$ {offer.price.toFixed(2)} • Comissão: {offer.commission_rate}% (R$ {offer.commission_amount.toFixed(2)})
                        </p>
                      </div>
                      <Button
                        type="button"
                        onClick={() => removeOffer(offer.id)}
                        variant="outline"
                        size="sm"
                        className="bg-red-600/20 border-red-500/50 text-red-400 hover:bg-red-600/30"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Preview da Comissão Principal */}
          {formData.price > 0 && formData.commission_rate > 0 && (
            <div className="p-4 bg-gradient-to-r from-green-900/30 to-emerald-900/30 rounded-lg border border-green-700">
              <div className="flex items-center gap-2 text-green-400">
                <DollarSign className="h-5 w-5" />
                <span className="font-medium">
                  Comissão principal por venda: R$ {formData.commission_amount.toFixed(2)} ({formData.commission_rate}% de R$ {formData.price.toFixed(2)})
                </span>
              </div>
            </div>
          )}

          {/* Validações do formulário */}
          <div className="space-y-3">
            {formData.affiliate_link && !formData.affiliate_link.startsWith('http') && (
              <div className="p-3 bg-yellow-900/30 rounded border border-yellow-600">
                <div className="flex items-center gap-2 text-yellow-400">
                  <AlertTriangle className="h-4 w-4" />
                  <span className="text-sm">Link de afiliação deve começar com http:// ou https://</span>
                </div>
              </div>
            )}

            {formData.price <= 0 && (
              <div className="p-3 bg-red-900/30 rounded border border-red-600">
                <div className="flex items-center gap-2 text-red-400">
                  <AlertTriangle className="h-4 w-4" />
                  <span className="text-sm">Preço deve ser maior que zero</span>
                </div>
              </div>
            )}
          </div>

          {/* Tags */}
          <div>
            <Label className="text-slate-200">Tags do Produto</Label>
            <div className="flex flex-wrap gap-2 mt-2 mb-3">
              {tags.map((tag, index) => (
                <Badge key={index} variant="secondary" className="bg-cyan-900 text-cyan-200 hover:bg-cyan-800">
                  {tag}
                  <X className="h-3 w-3 ml-1 cursor-pointer" onClick={() => removeTag(tag)} />
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                className="bg-slate-800 border-slate-600 text-white"
                placeholder="Adicionar tag..."
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
              />
              <Button type="button" onClick={addTag} variant="outline" className="bg-slate-700 border-slate-600 text-white hover:bg-slate-600">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <DialogFooter className="flex justify-between pt-6">
            <Button type="button" onClick={onClose} variant="outline" className="bg-slate-700 border-slate-600 text-white hover:bg-slate-600">
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={createProductMutation.isPending || uploadingImage || !formData.image_url}
              className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white"
            >
              {createProductMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Criando...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Criar Produto
                </>
              )}
            </Button>
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
