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
import { Plus, X, Image, DollarSign, Link, Tag, Upload, Loader2, AlertTriangle } from 'lucide-react';
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
    affiliate_link: '', // Link de afiliação externo principal
    price: 0,
    commission_rate: 10, // Percentual padrão
    commission_amount: 0 // Valor fixo opcional
  });

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

  // Calcular comissão automaticamente
  useEffect(() => {
    if (formData.price > 0 && formData.commission_rate > 0) {
      const calculatedCommission = (formData.price * formData.commission_rate) / 100;
      setFormData(prev => ({ ...prev, commission_amount: parseFloat(calculatedCommission.toFixed(2)) }));
    }
  }, [formData.price, formData.commission_rate]);

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    console.log('📸 [CreateProduct] Iniciando upload otimizado de:', file.name);
    
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

      try {
        console.log('🔧 [CreateProduct] Preparando dados para INSERT...');
        
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
        
        console.log('📋 [CreateProduct] Dados preparados:', insertData);
        console.log('🔍 [CreateProduct] Verificando se todos campos obrigatórios estão presentes...');
        
        // Log detalhado dos campos
        Object.entries(insertData).forEach(([key, value]) => {
          console.log(`   ${key}:`, typeof value, value);
        });
        
        console.log('🎯 [CreateProduct] Executando INSERT na tabela products...');

        // Criar produto
        const { data: product, error: productError } = await supabase
          .from('products')
          .insert([insertData])
          .select()
          .single();

        console.log('🔍 [CreateProduct] Resultado do INSERT:', { product, error: productError });

        if (productError) {
          console.error('❌ [CreateProduct] Erro ao criar produto:', productError);
          console.error('🔍 [CreateProduct] Código do erro:', productError.code);
          console.error('🔍 [CreateProduct] Mensagem:', productError.message);
          console.error('🔍 [CreateProduct] Detalhes completos:', JSON.stringify(productError, null, 2));
          throw productError;
        }

        if (!product) {
          console.error('❌ [CreateProduct] Produto não foi retornado após INSERT');
          throw new Error('Produto não foi criado corretamente');
        }

        console.log('✅ [CreateProduct] Produto criado com sucesso:', product);

        // Criar ofertas associadas
        if (productData.offers && productData.offers.length > 0) {
          console.log('🏷️ [CreateProduct] Criando ofertas associadas...');
          const offersData = productData.offers.map((offer: ProductOffer) => ({
            product_id: product.id,
            name: offer.name,
            description: offer.description,
            price: offer.price,
            commission_rate: offer.commission_rate,
            promotion_url: offer.promotion_url,
            is_active: true
          }));

          console.log('📋 [CreateProduct] Dados das ofertas:', offersData);

          const { error: offersError } = await supabase
            .from('product_offers')
            .insert(offersData);

          if (offersError) {
            console.error('❌ [CreateProduct] Erro ao criar ofertas:', offersError);
            throw offersError;
          }

          console.log('✅ [CreateProduct] Ofertas criadas com sucesso');
        } else {
          console.log('ℹ️ [CreateProduct] Nenhuma oferta para criar');
        }

        console.log('🎉 [CreateProduct] Processo de criação concluído!');
        return product;
        
      } catch (error) {
        console.error('💥 [CreateProduct] Erro crítico durante criação:', error);
        console.error('🔍 [CreateProduct] Stack trace:', error instanceof Error ? error.stack : 'N/A');
        throw error;
      }
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

    if (!formData.affiliate_link.trim()) {
      toast({
        title: "Link de afiliação obrigatório",
        description: "Por favor, informe o link de afiliação do produto.",
        variant: "destructive",
      });
      return;
    }

    if (!formData.affiliate_link.startsWith('http://') && !formData.affiliate_link.startsWith('https://')) {
      toast({
        title: "Link inválido",
        description: "O link de afiliação deve começar com http:// ou https://",
        variant: "destructive",
      });
      return;
    }

    if (formData.price <= 0) {
      toast({
        title: "Preço obrigatório",
        description: "Por favor, informe um preço válido para o produto.",
        variant: "destructive",
      });
      return;
    }

    if (formData.commission_rate < 0 || formData.commission_rate > 100) {
      toast({
        title: "Taxa de comissão inválida",
        description: "A taxa de comissão deve estar entre 0% e 100%.",
        variant: "destructive",
      });
      return;
    }

    createProductMutation.mutate({
      ...formData,
      tags
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
    resetUpload();
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
                <Label htmlFor="affiliate_link" className="text-slate-200">Link de Afiliação *</Label>
                <Input
                  id="affiliate_link"
                  value={formData.affiliate_link}
                  onChange={(e) => setFormData({...formData, affiliate_link: e.target.value})}
                  className="bg-slate-800 border-slate-600 text-white"
                  placeholder="https://exemplo.com/produto"
                  required
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

          {/* Informações de Preço e Comissão */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="price" className="text-slate-200">Preço do Produto (R$) *</Label>
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

          {/* Preview da Comissão */}
          {formData.price > 0 && formData.commission_rate > 0 && (
            <div className="p-4 bg-gradient-to-r from-green-900/30 to-emerald-900/30 rounded-lg border border-green-700">
              <div className="flex items-center gap-2 text-green-400">
                <DollarSign className="h-5 w-5" />
                <span className="font-medium">
                  Comissão por venda: R$ {formData.commission_amount.toFixed(2)} ({formData.commission_rate}% de R$ {formData.price.toFixed(2)})
                </span>
              </div>
            </div>
          )}

          {/* Validações do formulário */}
          <div className="space-y-3">
            {/* Validação do link de afiliação */}
            {formData.affiliate_link && !formData.affiliate_link.startsWith('http') && (
              <div className="p-3 bg-yellow-900/30 rounded border border-yellow-600">
                <div className="flex items-center gap-2 text-yellow-400">
                  <AlertTriangle className="h-4 w-4" />
                  <span className="text-sm">Link de afiliação deve começar com http:// ou https://</span>
                </div>
              </div>
            )}

            {/* Validação de preço */}
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
    </Dialog>
  );
};

export default CreateProductModal; 