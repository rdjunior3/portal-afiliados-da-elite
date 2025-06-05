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
import { ImageUpload } from '@/components/ui/ImageUpload';
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
    status: 'active',
    is_featured: false,
    is_exclusive: false,
    gravity_score: 0,
    earnings_per_click: 0,
    conversion_rate_avg: 0,
    refund_rate: 0
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
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove acentos
      .replace(/[^a-z0-9\s-]/g, '') // Remove caracteres especiais
      .replace(/\s+/g, '-') // Substitui espaços por hífens
      .replace(/-+/g, '-') // Remove hífens duplicados
      .substring(0, 50)
      .replace(/^-|-$/g, ''); // Remove hífens do início e fim
  };

  // Mutation para criar/atualizar produto
  const saveMutation = useMutation({
    mutationFn: async (data: Partial<Product>) => {
      try {
        // Validação de campos obrigatórios
        if (!data.name?.trim()) {
          throw new Error('Nome do produto é obrigatório');
        }
        if (!data.affiliate_link?.trim()) {
          throw new Error('Link de afiliado é obrigatório');
        }
        if (!data.price || data.price <= 0) {
          throw new Error('Preço deve ser maior que zero');
        }

        // Garantir que o slug seja gerado se não fornecido
        if (!data.slug && data.name) {
          data.slug = generateSlug(data.name);
        }

        // Campos obrigatórios com valores padrão mais seguros
        const productData = {
          name: data.name.trim(),
          slug: data.slug || generateSlug(data.name!),
          description: data.description?.trim() || null,
          price: Number(data.price) || 0,
          commission_rate: Number(data.commission_rate) || 10,
          category_id: data.category_id || null,
          thumbnail_url: data.thumbnail_url?.trim() || null,
          affiliate_link: data.affiliate_link.trim(),
          status: data.status || 'active',
          is_featured: Boolean(data.is_featured),
          is_exclusive: Boolean(data.is_exclusive),
          gravity_score: Number(data.gravity_score) || 0,
          earnings_per_click: Number(data.earnings_per_click) || 0,
          conversion_rate_avg: Number(data.conversion_rate_avg) || 0,
          refund_rate: Number(data.refund_rate) || 0,
          currency: 'BRL',
          commission_amount: 0,
          requires_approval: false,
          min_payout: 50,
          updated_at: new Date().toISOString()
        };

        let result;
        if (editingProduct?.id) {
          // Atualizar
          result = await supabase
            .from('products')
            .update(productData)
            .eq('id', editingProduct.id)
            .select()
            .single();
        } else {
          // Criar novo
          result = await supabase
            .from('products')
            .insert({
              ...productData,
              created_at: new Date().toISOString()
            })
            .select()
            .single();
        }
        
        if (result.error) {
          console.error('Erro do Supabase:', result.error);
          throw new Error(result.error.message || 'Erro ao salvar produto');
        }

        return result.data;
      } catch (error: any) {
        console.error('Erro na mutation:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      toast({
        title: editingProduct ? "Produto atualizado ✅" : "Produto criado ✅",
        description: `O produto foi ${editingProduct ? 'atualizado' : 'criado'} com sucesso.`,
      });
      handleCloseDialog();
    },
    onError: (error: any) => {
      console.error('Erro na mutation:', error);
      toast({
        title: "Erro ao salvar produto",
        description: error.message || "Não foi possível salvar o produto. Verifique os dados e tente novamente.",
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
        status: 'active',
        is_featured: false,
        is_exclusive: false,
        gravity_score: 0,
        earnings_per_click: 0,
        conversion_rate_avg: 0,
        refund_rate: 0
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
      status: 'active',
      is_featured: false,
      is_exclusive: false,
      gravity_score: 0,
      earnings_per_click: 0,
      conversion_rate_avg: 0,
      refund_rate: 0
    });
  };

  const handleSave = () => {
    // Validação adicional no frontend
    if (!formData.name?.trim()) {
      toast({
        title: "Campo obrigatório",
        description: "Nome do produto é obrigatório.",
        variant: "destructive",
      });
      return;
    }

    if (!formData.affiliate_link?.trim()) {
      toast({
        title: "Campo obrigatório",
        description: "Link de afiliado é obrigatório.",
        variant: "destructive",
      });
      return;
    }

    if (!formData.price || formData.price <= 0) {
      toast({
        title: "Campo obrigatório",
        description: "Preço deve ser maior que zero.",
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
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 p-6 space-y-6">
      {/* Header melhorado */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-400 to-orange-500 bg-clip-text text-transparent">
            Gerenciar Produtos
          </h1>
          <p className="text-slate-300 mt-2">
            Adicione e gerencie produtos disponíveis para afiliação
          </p>
        </div>
        <Button 
          onClick={() => handleOpenDialog()} 
          className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-400 hover:to-orange-500 text-white"
        >
          <Plus className="h-4 w-4 mr-2" />
          Novo Produto
        </Button>
      </div>

      {/* Busca melhorada */}
      <Card className="bg-slate-800/60 border-slate-700/50 backdrop-blur-sm">
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
            <Input
              placeholder="Buscar produtos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-slate-700/50 border-slate-600/50 text-white placeholder-slate-400"
            />
          </div>
        </CardContent>
      </Card>

      {/* Tabela de Produtos melhorada */}
      <Card className="bg-slate-800/60 border-slate-700/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-white">Produtos</CardTitle>
          <CardDescription className="text-slate-300">
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
                  <TableRow className="border-slate-700/50">
                    <TableHead className="text-slate-300">Produto</TableHead>
                    <TableHead className="text-slate-300">Categoria</TableHead>
                    <TableHead className="text-slate-300">Preço</TableHead>
                    <TableHead className="text-slate-300">Comissão</TableHead>
                    <TableHead className="text-slate-300">Status</TableHead>
                    <TableHead className="text-slate-300">Performance</TableHead>
                    <TableHead className="text-right text-slate-300">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.map((product) => (
                    <TableRow key={product.id} className="border-slate-700/50 hover:bg-slate-700/30">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          {product.thumbnail_url ? (
                            <img 
                              src={product.thumbnail_url} 
                              alt={product.name}
                              className="h-10 w-10 rounded object-cover"
                            />
                          ) : (
                            <div className="h-10 w-10 rounded bg-orange-500/20 flex items-center justify-center">
                              <Package className="h-5 w-5 text-orange-400" />
                            </div>
                          )}
                          <div>
                            <p className="font-medium text-white">{product.name}</p>
                            {product.description && (
                              <p className="text-sm text-slate-400 line-clamp-1">
                                {product.description}
                              </p>
                            )}
                            {product.is_featured && (
                              <Badge variant="outline" className="text-xs mt-1 text-orange-400 border-orange-400">
                                Destaque
                              </Badge>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-slate-300">
                        {product.category?.name || (
                          <span className="text-slate-500">Sem categoria</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <span className="font-medium text-white">
                          {formatCurrency(product.price)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-orange-400 border-orange-400">
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
                            <span className="text-slate-400">Conversão:</span>
                            <span className="text-slate-300">{product.conversion_rate_avg}%</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="text-slate-400">EPC:</span>
                            <span className="text-slate-300">R$ {product.earnings_per_click}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleOpenDialog(product)}
                            className="border-slate-600 text-slate-300 hover:bg-slate-700"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-red-600 text-red-400 hover:bg-red-500/20"
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
              <Package className="h-12 w-12 mx-auto text-slate-400 mb-4" />
              <p className="text-slate-400">
                Nenhum produto cadastrado ainda.
              </p>
              <Button 
                className="mt-4 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-400 hover:to-orange-500" 
                onClick={() => handleOpenDialog()}
              >
                <Plus className="h-4 w-4 mr-2" />
                Criar Primeiro Produto
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog de Criar/Editar - Layout melhorado */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-slate-800 border-slate-700">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-white flex items-center gap-2">
              <Package className="h-5 w-5 text-orange-400" />
              {editingProduct ? 'Editar Produto' : 'Novo Produto'}
            </DialogTitle>
            <DialogDescription className="text-slate-300">
              Preencha as informações do produto para afiliação
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-6 py-4">
            {/* Informações Básicas */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <span className="w-6 h-6 rounded bg-orange-500/20 flex items-center justify-center">
                  <span className="text-orange-400 text-sm">📋</span>
                </span>
                Informações Básicas
              </h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-slate-200">Nome do Produto *</Label>
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
                    className="bg-slate-700/50 border-slate-600/50 text-white placeholder-slate-400"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="slug" className="text-slate-200">Slug (URL) *</Label>
                  <Input
                    id="slug"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    placeholder="curso-marketing-digital"
                    className="bg-slate-700/50 border-slate-600/50 text-white placeholder-slate-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category" className="text-slate-200">Categoria</Label>
                  <Select 
                    value={formData.category_id || ''} 
                    onValueChange={(value) => setFormData({ ...formData, category_id: value })}
                  >
                    <SelectTrigger id="category" className="bg-slate-700/50 border-slate-600/50 text-white">
                      <SelectValue placeholder="Selecione uma categoria" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700">
                      <SelectItem value="">Sem categoria</SelectItem>
                      {categories?.map((category) => (
                        <SelectItem key={category.id} value={category.id} className="text-white">
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status" className="text-slate-200">Status</Label>
                  <Select 
                    value={formData.status || 'active'} 
                    onValueChange={(value) => setFormData({ ...formData, status: value as any })}
                  >
                    <SelectTrigger id="status" className="bg-slate-700/50 border-slate-600/50 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700">
                      <SelectItem value="active" className="text-white">Ativo</SelectItem>
                      <SelectItem value="inactive" className="text-white">Inativo</SelectItem>
                      <SelectItem value="pending" className="text-white">Pendente</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-slate-200">Descrição</Label>
                <Textarea
                  id="description"
                  value={formData.description || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Descreva o produto..."
                  className="bg-slate-700/50 border-slate-600/50 text-white placeholder-slate-400 min-h-[100px]"
                />
              </div>
            </div>

            {/* Preços e Comissões */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <span className="w-6 h-6 rounded bg-green-500/20 flex items-center justify-center">
                  <DollarSign className="h-3 w-3 text-green-400" />
                </span>
                Preços e Comissões
              </h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price" className="text-slate-200">Preço (R$) *</Label>
                  <Input
                    id="price"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                    placeholder="0.00"
                    className="bg-slate-700/50 border-slate-600/50 text-white placeholder-slate-400"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="commission" className="text-slate-200">Taxa de Comissão (%) *</Label>
                  <Input
                    id="commission"
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                    value={formData.commission_rate}
                    onChange={(e) => setFormData({ ...formData, commission_rate: parseFloat(e.target.value) || 0 })}
                    placeholder="10.00"
                    className="bg-slate-700/50 border-slate-600/50 text-white placeholder-slate-400"
                  />
                </div>
              </div>
            </div>

            {/* Links e Mídia com upload de imagem */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <span className="w-6 h-6 rounded bg-blue-500/20 flex items-center justify-center">
                  <ImageIcon className="h-3 w-3 text-blue-400" />
                </span>
                Links e Mídia
              </h3>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="affiliate_link" className="text-slate-200">Link de Afiliado *</Label>
                  <div className="relative">
                    <Link className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                    <Input
                      id="affiliate_link"
                      type="url"
                      value={formData.affiliate_link || ''}
                      onChange={(e) => setFormData({ ...formData, affiliate_link: e.target.value })}
                      placeholder="https://exemplo.com/produto"
                      className="pl-10 bg-slate-700/50 border-slate-600/50 text-white placeholder-slate-400"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-slate-200">Imagem do Produto</Label>
                  <ImageUpload
                    value={formData.thumbnail_url || ''}
                    onChange={(url) => setFormData({ ...formData, thumbnail_url: url })}
                    bucket="product-images"
                    folder="products"
                    label="Enviar imagem do produto"
                    placeholder="Clique para enviar ou arraste uma imagem"
                    maxWidth={800}
                    maxHeight={600}
                    className="h-40"
                  />
                  <p className="text-xs text-slate-400">
                    Tamanho recomendado: 800x600px. Formatos: JPG, PNG, WEBP
                  </p>
                </div>
              </div>
            </div>

            {/* Configurações Avançadas */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <span className="w-6 h-6 rounded bg-purple-500/20 flex items-center justify-center">
                  <span className="text-purple-400 text-sm">⚙️</span>
                </span>
                Configurações
              </h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-2 p-3 bg-slate-700/30 rounded-lg border border-slate-600/30">
                  <Switch
                    id="is_featured"
                    checked={formData.is_featured || false}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_featured: checked })}
                  />
                  <Label htmlFor="is_featured" className="text-slate-200">Produto em destaque</Label>
                </div>
                
                <div className="flex items-center space-x-2 p-3 bg-slate-700/30 rounded-lg border border-slate-600/30">
                  <Switch
                    id="is_exclusive"
                    checked={formData.is_exclusive || false}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_exclusive: checked })}
                  />
                  <Label htmlFor="is_exclusive" className="text-slate-200">Produto exclusivo</Label>
                </div>
              </div>
            </div>
          </div>
          
          <DialogFooter className="gap-3">
            <Button 
              variant="outline" 
              onClick={handleCloseDialog}
              className="border-slate-600 text-slate-300 hover:bg-slate-700"
            >
              Cancelar
            </Button>
            <Button 
              onClick={handleSave}
              disabled={saveMutation.isPending}
              className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-400 hover:to-orange-500 text-white"
            >
              {saveMutation.isPending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Salvando...
                </>
              ) : (
                <>
                  <Package className="h-4 w-4 mr-2" />
                  {editingProduct ? 'Atualizar Produto' : 'Criar Produto'}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ManageProducts; 