import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Package, Upload, Loader2 } from 'lucide-react';

interface CreateProductModalSimpleProps {
  isOpen: boolean;
  onClose: () => void;
}

const CreateProductModalSimple: React.FC<CreateProductModalSimpleProps> = ({ isOpen, onClose }) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category_id: '',
    price: '',
    commission_rate: '10',
    sales_page_url: '',
    image_url: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

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
    mutationFn: async (productData: any) => {
      const insertData = {
        name: productData.name,
        slug: productData.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
        description: productData.description,
        category_id: productData.category_id || null,
        price: parseFloat(productData.price),
        commission_rate: parseFloat(productData.commission_rate),
        sales_page_url: productData.sales_page_url,
        image_url: productData.image_url || null,
        currency: 'BRL',
        is_active: true,
        tags: productData.name.toLowerCase().split(' ').filter(word => word.length > 2).slice(0, 3)
      };

      const { data, error } = await supabase
        .from('products')
        .insert([insertData])
        .select()
        .single();

      if (error) {
        console.error('Erro ao criar produto:', error);
        throw error;
      }

      return data;
    },
    onSuccess: (data) => {
      toast({
        title: "Produto criado com sucesso!",
        description: `O produto "${data.name}" foi adicionado à vitrine.`,
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
        description: "Nome e URL da página de vendas são obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    if (formData.price && isNaN(parseFloat(formData.price))) {
      toast({
        title: "Preço inválido",
        description: "Digite um valor numérico válido para o preço.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    createProductMutation.mutate(formData);
    setIsSubmitting(false);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      category_id: '',
      price: '',
      commission_rate: '10',
      sales_page_url: '',
      image_url: ''
    });
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleCategoryChange = (value: string) => {
    // Se for "no-category", salva como string vazia, senão salva o ID real
    const categoryValue = value === "no-category" ? "" : value;
    setFormData(prev => ({ ...prev, category_id: categoryValue }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-slate-800 border-slate-700 text-white max-w-2xl">
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

          {/* Grid com 2 colunas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Categoria */}
            <div className="space-y-2">
              <Label htmlFor="category" className="text-sm font-medium text-slate-200">
                Categoria
              </Label>
              <Select 
                value={formData.category_id || "no-category"} 
                onValueChange={(value) => handleInputChange('category_id', value === "no-category" ? "" : value)}
              >
                <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                  <SelectValue placeholder="Selecionar categoria" />
                </SelectTrigger>
                <SelectContent className="bg-slate-700 border-slate-600 text-white">
                  <SelectItem value="no-category">Sem categoria</SelectItem>
                  {categories?.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Preço */}
            <div className="space-y-2">
              <Label htmlFor="price" className="text-sm font-medium text-slate-200">
                Preço (R$)
              </Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                min="0"
                value={formData.price}
                onChange={(e) => handleInputChange('price', e.target.value)}
                placeholder="97.00"
                className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
              />
            </div>
          </div>

          {/* URL da Página de Vendas */}
          <div className="space-y-2">
            <Label htmlFor="sales_page_url" className="text-sm font-medium text-slate-200">
              URL da Página de Vendas *
            </Label>
            <Input
              id="sales_page_url"
              type="url"
              value={formData.sales_page_url}
              onChange={(e) => handleInputChange('sales_page_url', e.target.value)}
              placeholder="https://exemplo.com/produto"
              className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
              required
            />
          </div>

          {/* Grid com 2 colunas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Taxa de Comissão */}
            <div className="space-y-2">
              <Label htmlFor="commission_rate" className="text-sm font-medium text-slate-200">
                Taxa de Comissão (%)
              </Label>
              <Input
                id="commission_rate"
                type="number"
                step="0.1"
                min="0"
                max="100"
                value={formData.commission_rate}
                onChange={(e) => handleInputChange('commission_rate', e.target.value)}
                className="bg-slate-700 border-slate-600 text-white"
              />
            </div>

            {/* URL da Imagem */}
            <div className="space-y-2">
              <Label htmlFor="image_url" className="text-sm font-medium text-slate-200">
                URL da Imagem
              </Label>
              <Input
                id="image_url"
                type="url"
                value={formData.image_url}
                onChange={(e) => handleInputChange('image_url', e.target.value)}
                placeholder="https://exemplo.com/imagem.jpg"
                className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
              />
            </div>
          </div>

          <DialogFooter className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                resetForm();
                onClose();
              }}
              className="border-slate-600 text-slate-300 hover:bg-slate-700"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || createProductMutation.isPending}
              className="bg-orange-600 hover:bg-orange-700 text-white"
            >
              {(isSubmitting || createProductMutation.isPending) ? (
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
  );
};

export default CreateProductModalSimple; 