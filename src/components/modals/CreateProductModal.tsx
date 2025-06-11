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
import { Plus, X, Image, DollarSign, Link, Tag } from 'lucide-react';

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

  // Mutation para criar produto
  const createProductMutation = useMutation({
    mutationFn: async (productData: typeof formData & { offers: ProductOffer[], tags: string[] }) => {
      // Validações
      if (!productData.name.trim()) throw new Error('Nome do produto é obrigatório');
      if (!productData.category_id) throw new Error('Categoria é obrigatória');
      if (!productData.description.trim()) throw new Error('Descrição é obrigatória');
      if (!productData.sales_page_url.trim()) throw new Error('Link para afiliação é obrigatório');
      if (productData.offers.length === 0) throw new Error('Pelo menos uma oferta é obrigatória');

      // Gerar tags automáticas baseadas no nome e descrição
      const autoTags = [
        ...productData.name.toLowerCase().split(' ').filter(word => word.length > 2),
        ...productData.description.toLowerCase().split(' ').filter(word => word.length > 3)
      ].slice(0, 5);

      const allTags = [...new Set([...productData.tags, ...autoTags])];

      // Criar produto
      const { data: product, error: productError } = await supabase
        .from('products')
        .insert([{
          name: productData.name.trim(),
          description: productData.description.trim(),
          category_id: productData.category_id,
          image_url: productData.image_url || null,
          sales_page_url: productData.sales_page_url.trim(),
          price: productData.offers[0]?.price || 0,
          commission_rate: productData.offers[0]?.commission_rate || 10,
          commission_amount: (productData.offers[0]?.price || 0) * ((productData.offers[0]?.commission_rate || 10) / 100),
          is_active: true,
          is_featured: false,
          total_sales: 0,
          status: 'active'
        }])
        .select()
        .single();

      if (productError) throw productError;

      // Criar ofertas
      if (productData.offers.length > 0) {
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

        const { error: offersError } = await supabase
          .from('product_offers')
          .insert(offersData);

        if (offersError) throw offersError;
      }

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
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Informações básicas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-slate-300">Nome do Produto *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ex: Curso de Marketing Digital"
                className="bg-slate-800 border-slate-700"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category" className="text-slate-300">Categoria *</Label>
              <Select value={formData.category_id} onValueChange={(value) => setFormData({ ...formData, category_id: value })}>
                <SelectTrigger className="bg-slate-800 border-slate-700">
                  <SelectValue placeholder="Selecione uma categoria" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  {categories?.map(category => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Imagem do produto */}
          <div className="space-y-2">
            <Label htmlFor="image_url" className="text-slate-300 flex items-center gap-2">
              <Image className="w-4 h-4" />
              Imagem do Produto
            </Label>
            <Input
              id="image_url"
              value={formData.image_url}
              onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
              placeholder="URL da imagem do produto"
              className="bg-slate-800 border-slate-700"
            />
          </div>

          {/* Descrição */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-slate-300">Descrição *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Descreva o produto detalhadamente..."
              className="bg-slate-800 border-slate-700 h-24"
            />
          </div>

          {/* Link para afiliação */}
          <div className="space-y-2">
            <Label htmlFor="sales_page_url" className="text-slate-300 flex items-center gap-2">
              <Link className="w-4 h-4" />
              Link para Afiliação *
            </Label>
            <Input
              id="sales_page_url"
              value={formData.sales_page_url}
              onChange={(e) => setFormData({ ...formData, sales_page_url: e.target.value })}
              placeholder="URL da página de vendas na plataforma terceira"
              className="bg-slate-800 border-slate-700"
            />
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label className="text-slate-300 flex items-center gap-2">
              <Tag className="w-4 h-4" />
              Tags de Filtro (Automáticas + Manuais)
            </Label>
            <div className="flex gap-2">
              <Input
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder="Adicionar tag personalizada"
                className="bg-slate-800 border-slate-700"
                onKeyPress={(e) => e.key === 'Enter' && addTag()}
              />
              <Button type="button" onClick={addTag} size="sm" className="bg-orange-600 hover:bg-orange-700">
                Adicionar
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {tags.map(tag => (
                <Badge key={tag} variant="secondary" className="bg-slate-700 text-slate-300">
                  {tag}
                  <button onClick={() => removeTag(tag)} className="ml-1 text-red-400 hover:text-red-300">
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
            </div>
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
          <Button variant="outline" onClick={onClose} className="border-slate-700">
            Cancelar
          </Button>
          <Button 
            onClick={() => createProductMutation.mutate({ ...formData, offers, tags })}
            disabled={createProductMutation.isPending}
            className="bg-orange-600 hover:bg-orange-700"
          >
            {createProductMutation.isPending ? 'Criando...' : 'Criar Produto'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreateProductModal; 