import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { useEliteTips, EliteTip } from '@/hooks/useEliteTips';
import { useAuth } from '@/contexts/AuthContext';
import { Edit, Trash2, Plus, Save, X, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface EliteTipsEditorProps {
  trigger?: React.ReactNode;
}

const EliteTipsEditor: React.FC<EliteTipsEditorProps> = ({ trigger }) => {
  const { tips, isUpdating, updateTip, createTip, deleteTip } = useEliteTips();
  const { isAdmin } = useAuth();
  const { toast } = useToast();
  const [editingTip, setEditingTip] = useState<EliteTip | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [open, setOpen] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    icon: '💡',
    order_index: 1
  });

  // Se não é admin, não mostra o componente
  if (!isAdmin()) {
    return null;
  }

  const resetForm = () => {
    setFormData({
      title: '',
      content: '',
      icon: '💡',
      order_index: tips.length + 1
    });
    setEditingTip(null);
    setIsCreating(false);
  };

  const handleEdit = (tip: EliteTip) => {
    setEditingTip(tip);
    setFormData({
      title: tip.title,
      content: tip.content,
      icon: tip.icon,
      order_index: tip.order_index
    });
  };

  const handleCreate = () => {
    setIsCreating(true);
    setFormData({
      title: '',
      content: '',
      icon: '💡',
      order_index: tips.length + 1
    });
  };

  const handleSave = async () => {
    if (!formData.title.trim() || !formData.content.trim()) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha título e conteúdo da dica.",
        variant: "destructive",
      });
      return;
    }

    let success = false;

    if (editingTip) {
      // Editar dica existente
      success = await updateTip(editingTip.id, {
        title: formData.title.trim(),
        content: formData.content.trim(),
        icon: formData.icon,
        order_index: formData.order_index
      });
    } else if (isCreating) {
      // Criar nova dica
      success = await createTip({
        title: formData.title.trim(),
        content: formData.content.trim(),
        icon: formData.icon,
        order_index: formData.order_index,
        is_active: true
      });
    }

    if (success) {
      resetForm();
    }
  };

  const handleDelete = async (tip: EliteTip) => {
    if (window.confirm('Tem certeza que deseja remover esta dica?')) {
      await deleteTip(tip.id);
    }
  };

  const emojiOptions = ['💡', '🏆', '💰', '📚', '🎯', '🚀', '⭐', '🔥', '💪', '🎉'];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button
            variant="ghost"
            size="sm"
            className="text-orange-400 hover:text-orange-300 hover:bg-orange-500/10"
          >
            <Edit className="h-4 w-4 mr-1" />
            Editar Dicas
          </Button>
        )}
      </DialogTrigger>
      
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto bg-slate-800 border-slate-700">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-white flex items-center gap-2">
            <span className="text-lg">💡</span>
            Gerenciar Dicas Elite
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Lista de Dicas Existentes */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Dicas Ativas</h3>
            {tips.map((tip) => (
              <Card key={tip.id} className="bg-slate-700/50 border-slate-600">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-lg">{tip.icon}</span>
                        <h4 className="text-white font-medium">{tip.title}</h4>
                        <span className="text-xs text-slate-400">#{tip.order_index}</span>
                      </div>
                      <p className="text-slate-300 text-sm">{tip.content}</p>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(tip)}
                        className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/10"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(tip)}
                        className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Botão para Criar Nova Dica */}
          {!editingTip && !isCreating && (
            <Button
              onClick={handleCreate}
              className="w-full bg-orange-600 hover:bg-orange-700 text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Nova Dica
            </Button>
          )}

          {/* Formulário de Edição/Criação */}
          {(editingTip || isCreating) && (
            <Card className="bg-slate-700/50 border-slate-600">
              <CardContent className="p-6 space-y-4">
                <h3 className="text-lg font-semibold text-white">
                  {editingTip ? 'Editar Dica' : 'Nova Dica'}
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Ícone */}
                  <div className="space-y-2">
                    <Label htmlFor="icon" className="text-slate-200">Ícone</Label>
                    <div className="flex flex-wrap gap-2">
                      {emojiOptions.map((emoji) => (
                        <button
                          key={emoji}
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, icon: emoji }))}
                          className={`w-10 h-10 rounded-lg border-2 transition-all ${
                            formData.icon === emoji
                              ? 'border-orange-400 bg-orange-500/20'
                              : 'border-slate-600 hover:border-slate-500'
                          }`}
                        >
                          <span className="text-lg">{emoji}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Ordem */}
                  <div className="space-y-2">
                    <Label htmlFor="order" className="text-slate-200">Ordem</Label>
                    <Input
                      id="order"
                      type="number"
                      min="1"
                      value={formData.order_index}
                      onChange={(e) => setFormData(prev => ({ ...prev, order_index: parseInt(e.target.value) || 1 }))}
                      className="bg-slate-600 border-slate-500 text-white"
                    />
                  </div>
                </div>

                {/* Título */}
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-slate-200">Título</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Digite o título da dica..."
                    className="bg-slate-600 border-slate-500 text-white placeholder:text-slate-400"
                  />
                </div>

                {/* Conteúdo */}
                <div className="space-y-2">
                  <Label htmlFor="content" className="text-slate-200">Conteúdo</Label>
                  <Textarea
                    id="content"
                    value={formData.content}
                    onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                    placeholder="Digite o conteúdo da dica..."
                    rows={3}
                    className="bg-slate-600 border-slate-500 text-white placeholder:text-slate-400"
                  />
                </div>

                {/* Botões de Ação */}
                <div className="flex gap-3 pt-4">
                  <Button
                    onClick={handleSave}
                    disabled={isUpdating}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    {isUpdating ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Salvando...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Salvar
                      </>
                    )}
                  </Button>
                  
                  <Button
                    onClick={resetForm}
                    variant="outline"
                    className="border-slate-600 text-slate-300 hover:bg-slate-700"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Cancelar
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EliteTipsEditor; 