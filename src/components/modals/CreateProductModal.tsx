import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Plus, X, Image, DollarSign, Link, Tag, Upload } from 'lucide-react';
import { testSupabaseConnection, createProductImagesBucket } from '@/utils/testSupabase';

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
  const [uploadingImage, setUploadingImage] = useState(false);
  const [testingConnection, setTestingConnection] = useState(false);

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

  // Teste de conexão automático quando abre o modal
  useEffect(() => {
    if (isOpen) {
      handleTestConnection();
    }
  }, [isOpen]);

  const handleTestConnection = async () => {
    setTestingConnection(true);
    console.log('🔧 [Modal] Iniciando teste de conexão...');
    
    try {
      const isConnected = await testSupabaseConnection();
      
      if (isConnected) {
        toast({
          title: "✅ Conexão Bem-sucedida",
          description: "Supabase está funcionando corretamente. Veja o console para detalhes.",
          variant: "default",
        });
        
        // Tentar criar o bucket apenas se a conexão básica funcionar
        console.log('🪣 [Modal] Tentando criar bucket...');
        const bucketCreated = await createProductImagesBucket();
        
        if (bucketCreated) {
          toast({
            title: "📦 Storage Configurado",
            description: "Bucket de imagens criado/verificado com sucesso.",
            variant: "default",
          });
        }
      } else {
        toast({
          title: "⚠️ Problemas na Conexão",
          description: "Algumas tabelas podem não existir. Execute os scripts de migração no Supabase.",
          variant: "destructive",
        });
        
        // Mostrar instruções específicas
        console.log('🔧 [Modal] INSTRUÇÕES DE CORREÇÃO:');
        console.log('1. Acesse: https://supabase.com/dashboard/project/rbqzddsserknaedojuex/sql');
        console.log('2. Execute o script: db_scripts/fix_critical_tables.sql');
        console.log('3. Execute o script: db_scripts/fix_storage_buckets.sql');
        console.log('4. Teste novamente a conexão');
      }
      
    } catch (error: any) {
      console.error('💥 [Modal] Erro crítico no teste:', error.message);
      toast({
        title: "💥 Erro Crítico",
        description: `Falha no teste: ${error.message}. Verifique sua conexão com a internet.`,
        variant: "destructive",
      });
    } finally {
      console.log('🏁 [Modal] Teste de conexão finalizado');
      setTestingConnection(false);
    }
  };

  // Upload de imagem
  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validar tipo de arquivo
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Erro no arquivo",
        description: "Por favor, selecione apenas arquivos de imagem.",
        variant: "destructive",
      });
      return;
    }

    // Validar tamanho (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Arquivo muito grande",
        description: "A imagem deve ter no máximo 5MB.",
        variant: "destructive",
      });
      return;
    }

    setImageFile(file);
    
    // Criar preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Upload para Supabase Storage
  const uploadImageToSupabase = async (file: File): Promise<string> => {
    setUploadingImage(true);
    console.log('📸 [UploadImage] Iniciando upload:', { 
      fileName: file.name, 
      fileSize: file.size, 
      fileType: file.type 
    });
    
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `product-${Date.now()}.${fileExt}`;
      
      console.log('📸 [UploadImage] Nome do arquivo:', fileName);
      
      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(fileName, file);

      if (uploadError) {
        console.error('❌ [UploadImage] Erro no upload:', uploadError);
        throw new Error(`Erro no upload: ${uploadError.message}`);
      }

      console.log('✅ [UploadImage] Upload concluído, obtendo URL pública...');

      const { data: { publicUrl } } = supabase.storage
        .from('product-images')
        .getPublicUrl(fileName);

      console.log('🔗 [UploadImage] URL pública:', publicUrl);

      if (!publicUrl) {
        throw new Error('Não foi possível obter a URL pública da imagem');
      }

      return publicUrl;
    } catch (error: any) {
      console.error('💥 [UploadImage] Erro geral:', error);
      throw error;
    } finally {
      setUploadingImage(false);
    }
  };

  // Mutation para criar produto
  const createProductMutation = useMutation({
    mutationFn: async (productData: typeof formData & { offers: ProductOffer[], tags: string[] }) => {
      console.log('🚀 [CreateProduct] Iniciando criação de produto:', { 
        name: productData.name, 
        hasImageFile: !!imageFile,
        offersCount: productData.offers.length,
        tagsCount: productData.tags.length 
      });

      // Validações
      if (!productData.name.trim()) throw new Error('Nome do produto é obrigatório');
      if (!productData.category_id) throw new Error('Categoria é obrigatória');
      if (!productData.description.trim()) throw new Error('Descrição é obrigatória');
      if (!productData.sales_page_url.trim()) throw new Error('Link para afiliação é obrigatório');
      if (productData.offers.length === 0) throw new Error('Pelo menos uma oferta é obrigatória');

      console.log('✅ [CreateProduct] Validações passaram');

      // Upload da imagem se houver
      let finalImageUrl = productData.image_url;
      if (imageFile) {
        console.log('📸 [CreateProduct] Fazendo upload da imagem...');
        try {
          finalImageUrl = await uploadImageToSupabase(imageFile);
          console.log('✅ [CreateProduct] Upload da imagem concluído:', finalImageUrl);
        } catch (error) {
          console.error('❌ [CreateProduct] Erro no upload da imagem:', error);
          throw new Error(`Erro no upload da imagem: ${error.message}`);
        }
      }

      // Usar tags já geradas automaticamente
      const allTags = [...new Set(productData.tags)];
      console.log('🏷️ [CreateProduct] Tags finais:', allTags);

      // Criar produto
      console.log('📦 [CreateProduct] Criando produto na tabela products...');
      const productToInsert = {
        name: productData.name.trim(),
        description: productData.description.trim(),
        category_id: productData.category_id,
        image_url: finalImageUrl || null,
        sales_page_url: productData.sales_page_url.trim(),
        price: productData.offers[0]?.price || 0,
        commission_rate: productData.offers[0]?.commission_rate || 10,
        commission_amount: (productData.offers[0]?.price || 0) * ((productData.offers[0]?.commission_rate || 10) / 100),
        is_active: true,
        is_featured: false,
        total_sales: 0,
        status: 'active'
      };

      console.log('📦 [CreateProduct] Dados do produto:', productToInsert);

      const { data: product, error: productError } = await supabase
        .from('products')
        .insert([productToInsert])
        .select()
        .single();

      if (productError) {
        console.error('❌ [CreateProduct] Erro ao criar produto:', productError);
        throw productError;
      }

      console.log('✅ [CreateProduct] Produto criado com sucesso:', product.id);

      // Criar ofertas
      if (productData.offers.length > 0) {
        console.log('💰 [CreateProduct] Criando ofertas...');
        const offersData = productData.offers.map((offer, index) => ({
          product_id: product.id,
          name: offer.name,
          description: offer.description,
          price: offer.price,
          commission_rate: offer.commission_rate,
          commission_amount: offer.price * (offer.commission_rate / 100),
          promotion_url: offer.promotion_url,
          is_default: index === 0,
          is_active: true,
          sort_order: index
        }));

        console.log('💰 [CreateProduct] Dados das ofertas:', offersData);

        const { error: offersError } = await supabase
          .from('product_offers')
          .insert(offersData);

        if (offersError) {
          console.error('❌ [CreateProduct] Erro ao criar ofertas:', offersError);
          throw offersError;
        }

        console.log('✅ [CreateProduct] Ofertas criadas com sucesso');
      }

      console.log('🎉 [CreateProduct] Processo completo!');
      return product;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast({
        title: "Produto criado com sucesso! 🎉",
        description: "O produto foi adicionado à vitrine com todas as ofertas.",
      });
      onClose();
      resetForm();
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao criar produto",
        description: error.message || "Não foi possível criar o produto. Tente novamente.",
        variant: "destructive",
      });
    }
  });

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
  };

  const addOffer = () => {
    const newOffer: ProductOffer = {
      id: Date.now().toString(),
      name: '',
      description: '',
      price: 0,
      commission_rate: 10,
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
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const calculateCommission = (price: number, rate: number) => {
    return (price * (rate / 100)).toFixed(2);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-slate-900 border-slate-700">
        <DialogHeader>
          <DialogTitle className="text-orange-400 flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Cadastrar Novo Produto
            {testingConnection && (
              <div className="flex items-center gap-2 text-xs text-blue-400">
                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-400"></div>
                Verificando conexão...
              </div>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Informações básicas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-slate-200">Nome do Produto *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ex: Curso de Marketing Digital"
                className="bg-slate-800 border-slate-700 text-slate-100"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category" className="text-slate-200">Categoria *</Label>
              <Select value={formData.category_id} onValueChange={(value) => setFormData({ ...formData, category_id: value })}>
                <SelectTrigger className="bg-slate-800 border-slate-700 text-slate-100">
                  <SelectValue placeholder="Selecione uma categoria" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  {categories?.map(category => (
                    <SelectItem key={category.id} value={category.id} className="text-slate-100">
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Upload de Imagem */}
          <div className="space-y-2">
            <Label className="text-slate-200 flex items-center gap-2">
              <Image className="w-4 h-4" />
              Imagem do Produto (Ideal: 500x500px) *
            </Label>
            <div className="flex gap-4">
              <div className="flex-1">
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="bg-slate-800 border-slate-700 text-slate-100"
                />
                <p className="text-xs text-slate-400 mt-1">
                  Formatos aceitos: JPG, PNG, GIF (máx. 5MB)
                </p>
              </div>
              {imagePreview && (
                <div className="w-20 h-20 border border-slate-700 rounded-lg overflow-hidden">
                  <img 
                    src={imagePreview} 
                    alt="Preview" 
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
            </div>
            {!imageFile && (
              <div className="space-y-2">
                <Label className="text-slate-300">Ou insira URL da imagem:</Label>
                <Input
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  placeholder="https://exemplo.com/imagem.jpg"
                  className="bg-slate-800 border-slate-700 text-slate-100"
                />
              </div>
            )}
          </div>

          {/* Descrição */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-slate-200">Descrição *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Descreva o produto detalhadamente..."
              className="bg-slate-800 border-slate-700 h-24 text-slate-100"
            />
          </div>

          {/* Link para afiliação */}
          <div className="space-y-2">
            <Label htmlFor="sales_page_url" className="text-slate-200 flex items-center gap-2">
              <Link className="w-4 h-4" />
              Link para Afiliação *
            </Label>
            <Input
              id="sales_page_url"
              value={formData.sales_page_url}
              onChange={(e) => setFormData({ ...formData, sales_page_url: e.target.value })}
              placeholder="URL da página de vendas na plataforma terceira"
              className="bg-slate-800 border-slate-700 text-slate-100"
            />
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label className="text-slate-200 flex items-center gap-2">
              <Tag className="w-4 h-4" />
              Tags de Filtro (Geradas automaticamente do nome + Manuais)
            </Label>
            <div className="flex gap-2">
              <Input
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder="Adicionar tag personalizada"
                className="bg-slate-800 border-slate-700 text-slate-100"
                onKeyPress={(e) => e.key === 'Enter' && addTag()}
              />
              <Button type="button" onClick={addTag} size="sm" className="bg-orange-600 hover:bg-orange-700">
                Adicionar
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag, index) => (
                <Badge key={`${tag}-${index}`} variant="secondary" className="bg-slate-700 text-slate-200">
                  {tag}
                  <button onClick={() => removeTag(tag)} className="ml-1 text-red-400 hover:text-red-300">
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
            </div>
            {tags.length === 0 && formData.name && (
              <p className="text-xs text-slate-400">
                As tags serão geradas automaticamente quando você digitar o nome do produto
              </p>
            )}
          </div>

          {/* Ofertas do produto */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-slate-300 flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                Ofertas do Produto *
              </Label>
              <Button type="button" onClick={addOffer} size="sm" className="bg-green-600 hover:bg-green-700">
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Oferta
              </Button>
            </div>

            {offers.map((offer, index) => (
              <div key={offer.id} className="border border-slate-700 rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium text-slate-300">Oferta {index + 1}</h4>
                  {offers.length > 1 && (
                    <Button
                      type="button"
                      onClick={() => removeOffer(offer.id)}
                      size="sm"
                      variant="destructive"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <Input
                    value={offer.name}
                    onChange={(e) => updateOffer(offer.id, 'name', e.target.value)}
                    placeholder="Nome da oferta"
                    className="bg-slate-800 border-slate-700"
                  />
                  <Input
                    value={offer.description}
                    onChange={(e) => updateOffer(offer.id, 'description', e.target.value)}
                    placeholder="Descrição da oferta"
                    className="bg-slate-800 border-slate-700"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs text-slate-400">Preço (R$)</Label>
                    <Input
                      type="number"
                      value={offer.price}
                      onChange={(e) => updateOffer(offer.id, 'price', parseFloat(e.target.value) || 0)}
                      placeholder="0.00"
                      className="bg-slate-800 border-slate-700"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-slate-400">Comissão (%)</Label>
                    <Input
                      type="number"
                      value={offer.commission_rate}
                      onChange={(e) => updateOffer(offer.id, 'commission_rate', parseFloat(e.target.value) || 0)}
                      placeholder="10"
                      className="bg-slate-800 border-slate-700"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-slate-400">Afiliado recebe</Label>
                    <div className="bg-green-900/50 border border-green-700 rounded px-3 py-2 text-green-300 text-sm font-medium">
                      R$ {calculateCommission(offer.price, offer.commission_rate)}
                    </div>
                  </div>
                </div>

                <Input
                  value={offer.promotion_url}
                  onChange={(e) => updateOffer(offer.id, 'promotion_url', e.target.value)}
                  placeholder="URL específica desta oferta (opcional)"
                  className="bg-slate-800 border-slate-700"
                />
              </div>
            ))}

            {offers.length === 0 && (
              <div className="text-center py-8 text-slate-400">
                <DollarSign className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>Nenhuma oferta adicionada</p>
                <p className="text-sm">Clique em "Adicionar Oferta" para começar</p>
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <div className="flex justify-between items-center w-full">
            <Button 
              variant="outline" 
              onClick={handleTestConnection}
              disabled={testingConnection}
              className="border-slate-700 text-slate-300"
              size="sm"
            >
              {testingConnection ? 'Testando...' : '🔧 Testar Conexão'}
            </Button>
            
            <div className="flex gap-2">
              <Button variant="outline" onClick={onClose} className="border-slate-700">
                Cancelar
              </Button>
              <Button 
                onClick={() => createProductMutation.mutate({ ...formData, offers, tags })}
                disabled={createProductMutation.isPending || uploadingImage}
                className="bg-orange-600 hover:bg-orange-700"
              >
                {createProductMutation.isPending 
                  ? (uploadingImage ? 'Enviando imagem...' : 'Criando...') 
                  : 'Criar Produto'
                }
              </Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreateProductModal; 