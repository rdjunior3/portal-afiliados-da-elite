import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Search,
  Package,
  DollarSign,
  Link,
  Image as ImageIcon,
  AlertCircle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { formatCurrency } from '@/lib/utils';

interface Product {
  id?: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  commission_rate: number;
  category_id: string | null;
  thumbnail_url: string | null;
  affiliate_link: string;
  status: 'active' | 'inactive' | 'pending' | 'archived';
  is_featured: boolean;
  is_exclusive: boolean;
  gravity_score: number;
  earnings_per_click: number;
  conversion_rate_avg: number;
  refund_rate: number;
  created_at: string;
  updated_at: string;
  category?: {
    name: string;
  };
}

interface Category {
  id: string;
  name: string;
  slug: string;
}

const ManageProducts = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState<Partial<Product>>({
    name: '',
    slug: '',
    description: '',
    price: 0,
    commission_rate: 10,
    category_id: '',
    thumbnail_url: '',
    affiliate_link: '',
    status: 'active'
  });

  // Buscar categorias
  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data as Category[];
    }
  });

  // Buscar produtos
  const { data: products, isLoading } = useQuery({
    queryKey: ['admin-products', searchQuery],
    queryFn: async () => {
      let query = supabase
        .from('products')
        .select(`
          *,
          category:categories(name)
        `)
        .order('created_at', { ascending: false });

      if (searchQuery) {
        query = query.ilike('name', `%${searchQuery}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Product[];
    }
  });

  // Gerar slug a partir do nome
  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .substring(0, 50);
  };

  // Mutation para criar/atualizar produto
  const saveMutation = useMutation({
    mutationFn: async (data: Partial<Product>) => {
      // Garantir que o slug seja gerado se não fornecido
      if (!data.slug && data.name) {
        data.slug = generateSlug(data.name);
      }

      // Campos obrigatórios com valores padrão
      const productData = {
        ...data,
        currency: 'BRL',
        commission_amount: 0,
        gravity_score: data.gravity_score || 0,
        earnings_per_click: data.earnings_per_click || 0,
        conversion_rate_avg: data.conversion_rate_avg || 0,
        refund_rate: data.refund_rate || 0,
        is_featured: data.is_featured || false,
        is_exclusive: data.is_exclusive || false,
        requires_approval: false,
        min_payout: 50
      };

      if (editingProduct?.id) {
        // Atualizar
        const { error } = await supabase
          .from('products')
          .update(productData)
          .eq('id', editingProduct.id);
        
        if (error) throw error;
      } else {
        // Criar
        const { error } = await supabase
          .from('products')
          .insert(productData);
        
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      toast({
        title: editingProduct ? "Produto atualizado" : "Produto criado",
        description: `O produto foi ${editingProduct ? 'atualizado' : 'criado'} com sucesso.`,
      });
      handleCloseDialog();
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao salvar",
        description: error.message || "Não foi possível salvar o produto.",
        variant: "destructive",
      });
    }
  });

  // Mutation para deletar produto
  const deleteMutation = useMutation({
    mutationFn: async (productId: string) => {
      const { error } = await supabase
        .from('products')
        .update({ status: 'archived' })
        .eq('id', productId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      toast({
        title: "Produto arquivado",
        description: "O produto foi arquivado com sucesso.",
      });
    },
    onError: () => {
      toast({
        title: "Erro ao arquivar",
        description: "Não foi possível arquivar o produto.",
        variant: "destructive",
      });
    }
  });

  // Mutation para alternar status ativo
  const toggleStatusMutation = useMutation({
    mutationFn: async ({ productId, status }: { productId: string; status: 'active' | 'inactive' }) => {
      const { error } = await supabase
        .from('products')
        .update({ status: status })
        .eq('id', productId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      toast({
        title: "Status atualizado",
        description: "O status do produto foi atualizado.",
      });
    },
    onError: () => {
      toast({
        title: "Erro ao atualizar",
        description: "Não foi possível atualizar o status.",
        variant: "destructive",
      });
    }
  });

  const handleOpenDialog = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name,
        slug: product.slug,
        description: product.description || '',
        price: product.price,
        commission_rate: product.commission_rate,
        category_id: product.category_id || '',
        thumbnail_url: product.thumbnail_url || '',
        affiliate_link: product.affiliate_link,
        status: product.status,
        is_featured: product.is_featured,
        is_exclusive: product.is_exclusive,
        gravity_score: product.gravity_score,
        earnings_per_click: product.earnings_per_click,
        conversion_rate_avg: product.conversion_rate_avg,
        refund_rate: product.refund_rate
      });
    } else {
      setEditingProduct(null);
      setFormData({
        name: '',
        slug: '',
        description: '',
        price: 0,
        commission_rate: 10,
        category_id: '',
        thumbnail_url: '',
        affiliate_link: '',
        status: 'active'
      });
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingProduct(null);
    setFormData({
      name: '',
      slug: '',
      description: '',
      price: 0,
      commission_rate: 10,
      category_id: '',
      thumbnail_url: '',
      affiliate_link: '',
      status: 'active'
    });
  };

  const handleSave = () => {
    if (!formData.name || !formData.price || !formData.affiliate_link) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha todos os campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    saveMutation.mutate(formData);
  };

  const handleDelete = (productId: string) => {
    if (confirm('Tem certeza que deseja arquivar este produto?')) {
      deleteMutation.mutate(productId);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Ativo</Badge>;
      case 'inactive':
        return <Badge className="bg-gray-500/20 text-gray-400 border-gray-500/30">Inativo</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">Pendente</Badge>;
      case 'archived':
        return <Badge className="bg-red-500/20 text-red-400 border-red-500/30">Arquivado</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gradient-orange">
            Gerenciar Produtos
          </h1>
          <p className="text-muted-foreground mt-2">
            Adicione e gerencie produtos disponíveis para afiliação
          </p>
        </div>
        <Button 
          onClick={() => handleOpenDialog()} 
          className="gradient-orange glow-orange-hover"
        >
          <Plus className="h-4 w-4 mr-2" />
          Novo Produto
        </Button>
      </div>

      {/* Busca */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Buscar produtos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 focus-orange"
            />
          </div>
        </CardContent>
      </Card>

      {/* Tabela de Produtos */}
      <Card>
        <CardHeader>
          <CardTitle>Produtos</CardTitle>
          <CardDescription>
            Total de {products?.length || 0} produtos cadastrados
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : products && products.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Produto</TableHead>
                    <TableHead>Categoria</TableHead>
                    <TableHead>Preço</TableHead>
                    <TableHead>Comissão</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Performance</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          {product.thumbnail_url ? (
                            <img 
                              src={product.thumbnail_url} 
                              alt={product.name}
                              className="h-10 w-10 rounded object-cover"
                            />
                          ) : (
                            <div className="h-10 w-10 rounded bg-orange-100 dark:bg-orange-900/20 flex items-center justify-center">
                              <Package className="h-5 w-5 text-orange-600" />
                            </div>
                          )}
                          <div>
                            <p className="font-medium">{product.name}</p>
                            {product.description && (
                              <p className="text-sm text-muted-foreground line-clamp-1">
                                {product.description}
                              </p>
                            )}
                            {product.is_featured && (
                              <Badge variant="outline" className="text-xs mt-1 text-orange-600 border-orange-600">
                                Destaque
                              </Badge>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {product.category?.name || (
                          <span className="text-muted-foreground">Sem categoria</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <span className="font-medium">
                          {formatCurrency(product.price)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-orange-600 border-orange-600">
                          {product.commission_rate}%
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getStatusBadge(product.status)}
                          <Switch
                            checked={product.status === 'active'}
                            onCheckedChange={(checked) => 
                              toggleStatusMutation.mutate({ 
                                productId: product.id!, 
                                status: checked ? 'active' : 'inactive'
                              })
                            }
                            disabled={toggleStatusMutation.isPending}
                          />
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm space-y-1">
                          <div className="flex items-center gap-1">
                            <span className="text-muted-foreground">Conversão:</span>
                            <span>{product.conversion_rate_avg}%</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="text-muted-foreground">EPC:</span>
                            <span>R$ {product.earnings_per_click}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleOpenDialog(product)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-red-600 hover:text-red-700"
                            onClick={() => handleDelete(product.id!)}
                            disabled={deleteMutation.isPending}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-12">
              <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                Nenhum produto cadastrado ainda.
              </p>
              <Button 
                className="mt-4" 
                onClick={() => handleOpenDialog()}
              >
                <Plus className="h-4 w-4 mr-2" />
                Criar Primeiro Produto
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog de Criar/Editar */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingProduct ? 'Editar Produto' : 'Novo Produto'}
            </DialogTitle>
            <DialogDescription>
              Preencha as informações do produto para afiliação
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-6 py-4">
            {/* Informações Básicas */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Informações Básicas</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome do Produto *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => {
                      const name = e.target.value;
                      setFormData({ 
                        ...formData, 
                        name,
                        slug: generateSlug(name)
                      });
                    }}
                    placeholder="Ex: Curso de Marketing Digital"
                    className="focus-orange"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="slug">Slug (URL) *</Label>
                  <Input
                    id="slug"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    placeholder="curso-marketing-digital"
                    className="focus-orange"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Categoria</Label>
                  <Select 
                    value={formData.category_id || ''} 
                    onValueChange={(value) => setFormData({ ...formData, category_id: value })}
                  >
                    <SelectTrigger id="category" className="focus-orange">
                      <SelectValue placeholder="Selecione uma categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Sem categoria</SelectItem>
                      {categories?.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select 
                    value={formData.status || 'active'} 
                    onValueChange={(value) => setFormData({ ...formData, status: value as any })}
                  >
                    <SelectTrigger id="status" className="focus-orange">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Ativo</SelectItem>
                      <SelectItem value="inactive">Inativo</SelectItem>
                      <SelectItem value="pending">Pendente</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  value={formData.description || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Descreva o produto..."
                  className="focus-orange min-h-[100px]"
                />
              </div>
            </div>

            {/* Preços e Comissões */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Preços e Comissões</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Preço (R$) *</Label>
                  <Input
                    id="price"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                    placeholder="0.00"
                    className="focus-orange"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="commission">Taxa de Comissão (%) *</Label>
                  <Input
                    id="commission"
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                    value={formData.commission_rate}
                    onChange={(e) => setFormData({ ...formData, commission_rate: parseFloat(e.target.value) || 0 })}
                    placeholder="10.00"
                    className="focus-orange"
                  />
                </div>
              </div>
            </div>

            {/* Links e Mídia */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Links e Mídia</h3>
              
              <div className="space-y-2">
                <Label htmlFor="affiliate_link">Link de Afiliado *</Label>
                <div className="relative">
                  <Link className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    id="affiliate_link"
                    type="url"
                    value={formData.affiliate_link || ''}
                    onChange={(e) => setFormData({ ...formData, affiliate_link: e.target.value })}
                    placeholder="https://exemplo.com/produto"
                    className="pl-10 focus-orange"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="thumbnail_url">URL da Imagem</Label>
                <div className="relative">
                  <ImageIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    id="thumbnail_url"
                    type="url"
                    value={formData.thumbnail_url || ''}
                    onChange={(e) => setFormData({ ...formData, thumbnail_url: e.target.value })}
                    placeholder="https://exemplo.com/imagem.jpg"
                    className="pl-10 focus-orange"
                  />
                </div>
              </div>
            </div>

            {/* Configurações Avançadas */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Configurações</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="is_featured"
                    checked={formData.is_featured || false}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_featured: checked })}
                  />
                  <Label htmlFor="is_featured">Produto em destaque</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    id="is_exclusive"
                    checked={formData.is_exclusive || false}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_exclusive: checked })}
                  />
                  <Label htmlFor="is_exclusive">Produto exclusivo</Label>
                </div>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={handleCloseDialog}>
              Cancelar
            </Button>
            <Button 
              onClick={handleSave}
              disabled={saveMutation.isPending}
              className="gradient-orange"
            >
              {saveMutation.isPending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Salvando...
                </>
              ) : (
                editingProduct ? 'Atualizar' : 'Criar'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ManageProducts; 