import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Plus, Loader2, Tag } from 'lucide-react';

interface CreateCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCategoryCreated?: (category: any) => void;
}

const CreateCategoryModal: React.FC<CreateCategoryModalProps> = ({ 
  isOpen, 
  onClose, 
  onCategoryCreated 
}) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    slug: ''
  });

  // Auto-gerar slug baseado no nome
  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '') // Remove caracteres especiais
      .replace(/\s+/g, '-') // Substitui espaços por hífens
      .replace(/-+/g, '-') // Remove hífens duplicados
      .replace(/^-|-$/g, ''); // Remove hífens no início e fim
  };

  // Atualizar slug automaticamente quando o nome muda
  const handleNameChange = (name: string) => {
    setFormData(prev => ({
      ...prev,
      name,
      slug: generateSlug(name)
    }));
  };

  // Mutation para criar categoria
  const createCategoryMutation = useMutation({
    mutationFn: async (categoryData: typeof formData) => {
      console.log('🏷️ [CreateCategory] Criando categoria:', categoryData);

      // Verificar se slug já existe
      const { data: existingSlug, error: slugError } = await supabase
        .from('categories')
        .select('slug')
        .eq('slug', categoryData.slug)
        .single();

      if (existingSlug) {
        throw new Error('Já existe uma categoria com este nome. Tente um nome diferente.');
      }

      // Criar categoria
      const { data: category, error } = await supabase
        .from('categories')
        .insert([{
          name: categoryData.name,
          description: categoryData.description || null,
          slug: categoryData.slug,
          is_active: true
        }])
        .select()
        .single();

      if (error) {
        console.error('❌ [CreateCategory] Erro ao criar categoria:', error);
        throw error;
      }

      console.log('✅ [CreateCategory] Categoria criada com sucesso:', category);
      return category;
    },
    onSuccess: (category) => {
      console.log('🎉 [CreateCategory] Categoria criada com sucesso!');
      toast({
        title: "Categoria criada! 🏷️",
        description: `A categoria "${category.name}" foi criada com sucesso.`,
        className: "bg-green-600 text-white border-green-500"
      });
      
      // Invalidar cache das categorias
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      
      // Callback para o componente pai
      if (onCategoryCreated) {
        onCategoryCreated(category);
      }
      
      resetForm();
      onClose();
    },
    onError: (error: any) => {
      console.error('❌ [CreateCategory] Erro ao criar categoria:', error);
      toast({
        title: "Erro ao criar categoria",
        description: error.message || "Ocorreu um erro inesperado. Tente novamente.",
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
        description: "Por favor, informe o nome da categoria.",
        variant: "destructive",
      });
      return;
    }

    if (!formData.slug.trim()) {
      toast({
        title: "Slug inválido",
        description: "O slug foi gerado automaticamente mas está vazio. Verifique o nome.",
        variant: "destructive",
      });
      return;
    }

    createCategoryMutation.mutate(formData);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      slug: ''
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md bg-gradient-to-br from-slate-900 to-slate-800 border-slate-600 text-white">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-cyan-400 flex items-center gap-2">
            <Tag className="h-5 w-5" />
            Nova Categoria
          </DialogTitle>
          <DialogDescription className="text-slate-300">
            Crie uma nova categoria para organizar seus produtos.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name" className="text-slate-200">Nome da Categoria *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleNameChange(e.target.value)}
              className="bg-slate-800 border-slate-600 text-white"
              placeholder="Ex: Cursos Digitais"
              required
              maxLength={50}
            />
          </div>

          <div>
            <Label htmlFor="slug" className="text-slate-200">Slug (URL amigável)</Label>
            <Input
              id="slug"
              value={formData.slug}
              onChange={(e) => setFormData({...formData, slug: e.target.value})}
              className="bg-slate-800 border-slate-600 text-white"
              placeholder="cursos-digitais"
              pattern="^[a-z0-9-]+$"
              title="Apenas letras minúsculas, números e hífens"
            />
            <p className="text-xs text-slate-400 mt-1">
              Gerado automaticamente. Use apenas letras minúsculas, números e hífens.
            </p>
          </div>

          <div>
            <Label htmlFor="description" className="text-slate-200">Descrição (opcional)</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className="bg-slate-800 border-slate-600 text-white"
              placeholder="Descreva brevemente esta categoria..."
              rows={3}
              maxLength={200}
            />
          </div>

          <DialogFooter className="flex gap-2 pt-4">
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
              disabled={createCategoryMutation.isPending}
              className="bg-cyan-600 hover:bg-cyan-700 text-white"
            >
              {createCategoryMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Criando...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  Criar Categoria
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateCategoryModal; 