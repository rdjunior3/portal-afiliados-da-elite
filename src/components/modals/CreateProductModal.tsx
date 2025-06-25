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
import { Plus, X, Image, DollarSign, Link, Tag, Upload, Loader2 } from 'lucide-react';
import { useImageUpload } from '@/hooks/useImageUpload';

interface CreateProductModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ProductOffer {
  id: string;
  name: string;
  description: string;
  price: number;
  commission_rate: number;
  promotion_url: string;
}

const CreateProductModal: React.FC<CreateProductModalProps> = ({ isOpen, onClose }) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category_id: '',
    image_url: '',
    sales_page_url: ''
  });

  const [offers, setOffers] = useState<ProductOffer[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');

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
      
      // Merge com tags manuais, removendo duplicatas
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

  // Upload de imagem otimizado
  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    console.log('📸 [CreateProduct] Iniciando upload otimizado de:', file.name);

    setImageFile(file);
    
    // Criar preview local
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Upload usando hook otimizado
    try {
      const imageUrl = await uploadImage(file);
      if (imageUrl) {
        console.log('✅ [CreateProduct] Upload concluído:', imageUrl);
        toast({
          title: "Imagem carregada! ✅",
          description: "Agora você pode continuar com o cadastro do produto.",
          variant: "default",
        });
      }
    } catch (error: any) {
      console.error('❌ [CreateProduct] Erro no upload:', error);
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
      console.log('✅ [CreateProduct] Iniciando criação com validação OK');
      console.log('📊 [CreateProduct] Dados:', productData);

      // Verificar se tem imagem
      if (!productData.image_url) {
        throw new Error('Imagem é obrigatória para criar um produto');
      }

      console.log('🚀 [CreateProduct] Iniciando criação de produto:', productData);
      console.log('✅ [CreateProduct] Validações passaram');

      // Criar produto
      const { data: product, error: productError } = await supabase
        .from('products')
        .insert([{
          name: productData.name,
          description: productData.description,
          category_id: productData.category_id,
          image_url: productData.image_url,
          sales_page_url: productData.sales_page_url,
          tags: productData.tags || [],
          is_active: true
        }])
        .select()
        .single();

      if (productError) {
        console.error('❌ [CreateProduct] Erro ao criar produto:', productError);
        throw productError;
      }

      console.log('✅ [CreateProduct] Produto criado:', product);

      // Criar ofertas associadas
      if (productData.offers && productData.offers.length > 0) {
        const offersData = productData.offers.map((offer: ProductOffer) => ({
          product_id: product.id,
          name: offer.name,
          description: offer.description,
          price: offer.price,
          commission_rate: offer.commission_rate,
          promotion_url: offer.promotion_url,
          is_active: true
        }));

        const { error: offersError } = await supabase
          .from('product_offers')
          .insert(offersData);

        if (offersError) {
          console.error('❌ [CreateProduct] Erro ao criar ofertas:', offersError);
          throw offersError;
        }

        console.log('✅ [CreateProduct] Ofertas criadas');
      }

      return product;
    },
    onSuccess: () => {
      console.log('🎉 [CreateProduct] Produto criado com sucesso!');
      toast({
        title: "Produto criado! 🎉",
        description: "O produto foi adicionado ao catálogo com sucesso.",
      });
      
      queryClient.invalidateQueries({ queryKey: ['products'] });
      resetForm();
      onClose();
    },
    onError: (error: any) => {
      console.error('❌ [CreateProduct] Erro na criação:', error);
      toast({
        title: "Erro ao criar produto",
        description: error.message || "Não foi possível criar o produto. Tente novamente.",
        variant: "destructive",
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validações básicas
    if (!formData.name.trim()) {
      toast({
        title: "Nome obrigatório",
        description: "Por favor, informe o nome do produto.",
        variant: "destructive",
      });
      return;
    }

    if (!formData.description.trim()) {
      toast({
        title: "Descrição obrigatória",
        description: "Por favor, informe a descrição do produto.",
        variant: "destructive",
      });
      return;
    }

    if (!formData.category_id) {
      toast({
        title: "Categoria obrigatória",
        description: "Por favor, selecione uma categoria.",
        variant: "destructive",
      });
      return;
    }

    if (!formData.image_url) {
      toast({
        title: "Imagem obrigatória",
        description: "Por favor, faça upload de uma imagem do produto.",
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
      sales_page_url: ''
    });
    setOffers([]);
    setTags([]);
    setNewTag('');
    setImageFile(null);
    setImagePreview('');
    resetUpload();
  };

  const addOffer = () => {
    const newOffer: ProductOffer = {
      id: `temp-${Date.now()}`,
      name: '',
      description: '',
      price: 0,
      commission_rate: 0,
      promotion_url: ''
    };
    setOffers([...offers, newOffer]);
  };

  const updateOffer = (id: string, field: keyof ProductOffer, value: string | number) => {
    setOffers(offers.map(offer => 
      offer.id === id ? { ...offer, [field]: value } : offer
    ));
  };

  const removeOffer = (id: string) => {
    setOffers(offers.filter(offer => offer.id !== id));
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

  const calculateCommission = (price: number, rate: number) => {
    return (price * rate / 100).toFixed(2);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-slate-900 to-slate-800 border-slate-600 text-white">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-cyan-400 flex items-center gap-2">
            <Plus className="h-6 w-6" />
            Criar Novo Produto Elite
          </DialogTitle>
          <DialogDescription className="text-slate-300">
            Adicione um novo produto ao catálogo da Elite com informações detalhadas e ofertas.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Informações Básicas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="name" className="text-slate-200">Nome do Produto *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="bg-slate-800 border-slate-600 text-white"
                  placeholder="Ex: Curso de Marketing Digital Elite"
                  required
                />
              </div>

              <div>
                <Label htmlFor="category" className="text-slate-200">Categoria *</Label>
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
                <Label htmlFor="sales_page_url" className="text-slate-200">Link da Página de Vendas</Label>
                <Input
                  id="sales_page_url"
                  value={formData.sales_page_url}
                  onChange={(e) => setFormData({...formData, sales_page_url: e.target.value})}
                  className="bg-slate-800 border-slate-600 text-white"
                  placeholder="https://exemplo.com/produto"
                />
              </div>
            </div>

            {/* Upload de Imagem */}
            <div className="space-y-4">
              <div>
                <Label className="text-slate-200">Imagem do Produto *</Label>
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
                    className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-slate-600 rounded-lg cursor-pointer bg-slate-800 hover:bg-slate-700 transition-colors"
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
                      </div>
                    )}
                  </label>
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

          {/* Ofertas */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <Label className="text-slate-200">Ofertas do Produto</Label>
              <Button type="button" onClick={addOffer} variant="outline" size="sm" className="bg-slate-700 border-slate-600 text-white hover:bg-slate-600">
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Oferta
              </Button>
            </div>

            <div className="space-y-4">
              {offers.map((offer) => (
                <div key={offer.id} className="p-4 bg-slate-800 rounded-lg border border-slate-600">
                  <div className="flex justify-between items-start mb-3">
                    <h4 className="text-slate-200 font-medium">Oferta #{offers.indexOf(offer) + 1}</h4>
                    <Button type="button" onClick={() => removeOffer(offer.id)} variant="ghost" size="sm" className="text-red-400 hover:text-red-300 hover:bg-red-900/20">
                      <X className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      value={offer.name}
                      onChange={(e) => updateOffer(offer.id, 'name', e.target.value)}
                      className="bg-slate-700 border-slate-600 text-white"
                      placeholder="Nome da oferta"
                    />
                    <Input
                      value={offer.promotion_url}
                      onChange={(e) => updateOffer(offer.id, 'promotion_url', e.target.value)}
                      className="bg-slate-700 border-slate-600 text-white"
                      placeholder="URL da promoção"
                    />
                    <Input
                      type="number"
                      value={offer.price}
                      onChange={(e) => updateOffer(offer.id, 'price', parseFloat(e.target.value) || 0)}
                      className="bg-slate-700 border-slate-600 text-white"
                      placeholder="Preço (R$)"
                    />
                    <Input
                      type="number"
                      value={offer.commission_rate}
                      onChange={(e) => updateOffer(offer.id, 'commission_rate', parseFloat(e.target.value) || 0)}
                      className="bg-slate-700 border-slate-600 text-white"
                      placeholder="Comissão (%)"
                    />
                  </div>

                  <Textarea
                    value={offer.description}
                    onChange={(e) => updateOffer(offer.id, 'description', e.target.value)}
                    className="bg-slate-700 border-slate-600 text-white mt-3"
                    placeholder="Descrição da oferta..."
                    rows={2}
                  />

                  {offer.price > 0 && offer.commission_rate > 0 && (
                    <div className="mt-3 p-2 bg-green-900/20 rounded border border-green-700">
                      <span className="text-green-400 text-sm">
                        💰 Comissão: R$ {calculateCommission(offer.price, offer.commission_rate)}
                      </span>
                    </div>
                  )}
                </div>
              ))}
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
    </Dialog>
  );
};

export default CreateProductModal; 