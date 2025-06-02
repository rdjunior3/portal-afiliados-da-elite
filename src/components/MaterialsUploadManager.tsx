import React, { useState, useRef } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { 
  Upload, 
  Link,
  Cloud,
  FileImage,
  FileVideo,
  FileText,
  File,
  X,
  Check,
  AlertCircle,
  ExternalLink,
  Download,
  Eye,
  Trash2
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface MaterialUploadManagerProps {
  productId?: string;
  onUploadComplete?: (material: any) => void;
}

interface UploadProgress {
  percentage: number;
  status: 'uploading' | 'processing' | 'completed' | 'error';
  message: string;
}

const MaterialsUploadManager: React.FC<MaterialUploadManagerProps> = ({ 
  productId, 
  onUploadComplete 
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [uploadProgress, setUploadProgress] = useState<UploadProgress | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [externalLink, setExternalLink] = useState('');
  const [materialData, setMaterialData] = useState({
    title: '',
    description: '',
    type: 'image',
    tags: '',
    license: 'exclusive',
    instructions: ''
  });

  // Mutation para upload direto
  const uploadFileMutation = useMutation({
    mutationFn: async (file: File) => {
      if (!user) throw new Error('Usuário não autenticado');
      
      setUploadProgress({
        percentage: 0,
        status: 'uploading',
        message: 'Iniciando upload...'
      });

      // Gerar nome único para o arquivo
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `materials/${user.id}/${fileName}`;

      setUploadProgress({
        percentage: 50,
        status: 'uploading',
        message: 'Enviando arquivo...'
      });

      // Upload para Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('uploads')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      setUploadProgress({
        percentage: 90,
        status: 'processing',
        message: 'Processando arquivo...'
      });

      // Obter URL pública
      const { data: { publicUrl } } = supabase.storage
        .from('uploads')
        .getPublicUrl(filePath);

      // Salvar metadados no banco
      const { data: fileUpload, error: fileError } = await supabase
        .from('file_uploads')
        .insert({
          user_id: user.id,
          original_filename: file.name,
          stored_filename: fileName,
          file_path: filePath,
          file_size: file.size,
          mime_type: file.type,
          upload_source: 'direct',
          is_public: true,
          processing_status: 'completed'
        })
        .select()
        .single();

      if (fileError) throw fileError;

      // Criar material criativo
      const { data: creative, error: creativeError } = await supabase
        .from('creatives')
        .insert({
          product_id: productId,
          title: materialData.title || file.name,
          description: materialData.description,
          type: materialData.type,
          file_url: publicUrl,
          file_upload_id: fileUpload.id,
          usage_instructions: materialData.instructions,
          license_type: materialData.license,
          tags: materialData.tags ? materialData.tags.split(',').map(t => t.trim()) : [],
          file_size_bytes: file.size,
          file_format: fileExt,
          is_active: true
        })
        .select()
        .single();

      if (creativeError) throw creativeError;

      setUploadProgress({
        percentage: 100,
        status: 'completed',
        message: 'Upload concluído com sucesso!'
      });

      return creative;
    },
    onSuccess: (data) => {
      toast({
        title: "Upload concluído!",
        description: "Material criativo foi adicionado com sucesso.",
      });
      onUploadComplete?.(data);
      resetForm();
      setTimeout(() => setUploadProgress(null), 2000);
    },
    onError: (error) => {
      setUploadProgress({
        percentage: 0,
        status: 'error',
        message: 'Erro no upload. Tente novamente.'
      });
      toast({
        title: "Erro no upload",
        description: "Não foi possível fazer o upload do arquivo.",
        variant: "destructive",
      });
      setTimeout(() => setUploadProgress(null), 3000);
    }
  });

  // Mutation para link externo
  const addExternalLinkMutation = useMutation({
    mutationFn: async (url: string) => {
      if (!user) throw new Error('Usuário não autenticado');
      
      // Detectar tipo de link
      let uploadSource = 'external';
      if (url.includes('drive.google.com')) uploadSource = 'google_drive';
      if (url.includes('dropbox.com')) uploadSource = 'dropbox';
      if (url.includes('onedrive.com')) uploadSource = 'onedrive';

      // Criar material criativo com link externo
      const { data: creative, error } = await supabase
        .from('creatives')
        .insert({
          product_id: productId,
          title: materialData.title,
          description: materialData.description,
          type: materialData.type,
          external_link: url,
          usage_instructions: materialData.instructions,
          license_type: materialData.license,
          tags: materialData.tags ? materialData.tags.split(',').map(t => t.trim()) : [],
          is_active: true
        })
        .select()
        .single();

      if (error) throw error;
      return creative;
    },
    onSuccess: (data) => {
      toast({
        title: "Link adicionado!",
        description: "Material criativo foi adicionado com sucesso.",
      });
      onUploadComplete?.(data);
      resetForm();
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Não foi possível adicionar o link.",
        variant: "destructive",
      });
    }
  });

  const resetForm = () => {
    setMaterialData({
      title: '',
      description: '',
      type: 'image',
      tags: '',
      license: 'exclusive',
      instructions: ''
    });
    setExternalLink('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleFileSelect = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    
    const file = files[0];
    
    // Validar tipo de arquivo
    const allowedTypes = ['image/', 'video/', 'application/pdf'];
    const isAllowed = allowedTypes.some(type => file.type.startsWith(type));
    
    if (!isAllowed) {
      toast({
        title: "Tipo de arquivo não permitido",
        description: "Apenas imagens, vídeos e PDFs são aceitos.",
        variant: "destructive",
      });
      return;
    }
    
    // Validar tamanho (10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "Arquivo muito grande",
        description: "O arquivo deve ter no máximo 10MB.",
        variant: "destructive",
      });
      return;
    }

    // Auto-detectar tipo
    if (file.type.startsWith('image/')) {
      setMaterialData(prev => ({ ...prev, type: 'image' }));
    } else if (file.type.startsWith('video/')) {
      setMaterialData(prev => ({ ...prev, type: 'video' }));
    } else {
      setMaterialData(prev => ({ ...prev, type: 'document' }));
    }

    // Auto-preencher título se vazio
    if (!materialData.title) {
      setMaterialData(prev => ({ 
        ...prev, 
        title: file.name.replace(/\.[^/.]+$/, '') 
      }));
    }

    uploadFileMutation.mutate(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'image': return <FileImage className="h-5 w-5" />;
      case 'video': return <FileVideo className="h-5 w-5" />;
      case 'document': return <FileText className="h-5 w-5" />;
      default: return <File className="h-5 w-5" />;
    }
  };

  const getSourceBadge = (source: string) => {
    const sourceConfig = {
      google_drive: { label: 'Google Drive', color: 'bg-blue-500' },
      dropbox: { label: 'Dropbox', color: 'bg-blue-600' },
      onedrive: { label: 'OneDrive', color: 'bg-blue-700' },
      direct: { label: 'Upload Direto', color: 'bg-green-500' },
      external: { label: 'Link Externo', color: 'bg-gray-500' }
    };

    const config = sourceConfig[source as keyof typeof sourceConfig] || sourceConfig.external;
    
    return (
      <Badge className={`${config.color} text-white text-xs`}>
        {config.label}
      </Badge>
    );
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="gradient-orange">
          <Upload className="h-4 w-4 mr-2" />
          Adicionar Material
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Cloud className="h-5 w-5 text-orange-500" />
            Gerenciar Materiais Criativos
          </DialogTitle>
          <DialogDescription>
            Faça upload de arquivos ou adicione links externos para materiais criativos
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="upload" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="upload">
              <Upload className="h-4 w-4 mr-2" />
              Upload Direto
            </TabsTrigger>
            <TabsTrigger value="external">
              <Link className="h-4 w-4 mr-2" />
              Link Externo
            </TabsTrigger>
          </TabsList>

          {/* Upload Progress */}
          {uploadProgress && (
            <Card className="mt-4">
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{uploadProgress.message}</span>
                    {uploadProgress.status === 'completed' && (
                      <Check className="h-5 w-5 text-green-500" />
                    )}
                    {uploadProgress.status === 'error' && (
                      <AlertCircle className="h-5 w-5 text-red-500" />
                    )}
                  </div>
                  <Progress 
                    value={uploadProgress.percentage} 
                    className={uploadProgress.status === 'error' ? 'bg-red-100' : ''}
                  />
                </div>
              </CardContent>
            </Card>
          )}

          <TabsContent value="upload" className="space-y-6">
            {/* Drop Zone */}
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                dragOver 
                  ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20' 
                  : 'border-muted-foreground/25 hover:border-orange-400'
              }`}
              onDrop={handleDrop}
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
            >
              <div className="space-y-4">
                <div className="mx-auto w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center">
                  <Upload className="h-6 w-6 text-orange-500" />
                </div>
                <div>
                  <p className="text-lg font-medium">
                    Arraste arquivos aqui ou{' '}
                    <button
                      type="button"
                      className="text-orange-500 hover:text-orange-600 underline"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      selecione do seu computador
                    </button>
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Suporte para imagens, vídeos e PDFs (máximo 10MB)
                  </p>
                </div>
                
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  accept="image/*,video/*,.pdf"
                  onChange={(e) => handleFileSelect(e.target.files)}
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="external" className="space-y-6">
            {/* External Link */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Link Externo</CardTitle>
                <CardDescription>
                  Adicione links do Google Drive, Dropbox, OneDrive ou outros serviços
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="external-link">URL do Material</Label>
                  <Input
                    id="external-link"
                    placeholder="https://drive.google.com/file/d/..."
                    value={externalLink}
                    onChange={(e) => setExternalLink(e.target.value)}
                  />
                </div>
                
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline" className="text-blue-600">
                    <ExternalLink className="h-3 w-3 mr-1" />
                    Google Drive
                  </Badge>
                  <Badge variant="outline" className="text-blue-600">
                    <Cloud className="h-3 w-3 mr-1" />
                    Dropbox
                  </Badge>
                  <Badge variant="outline" className="text-blue-600">
                    <Cloud className="h-3 w-3 mr-1" />
                    OneDrive
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Material Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Informações do Material</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Título *</Label>
                  <Input
                    id="title"
                    placeholder="Nome do material criativo"
                    value={materialData.title}
                    onChange={(e) => setMaterialData(prev => ({ ...prev, title: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="type">Tipo</Label>
                  <Select 
                    value={materialData.type} 
                    onValueChange={(value) => setMaterialData(prev => ({ ...prev, type: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="image">
                        <div className="flex items-center gap-2">
                          <FileImage className="h-4 w-4" />
                          Imagem
                        </div>
                      </SelectItem>
                      <SelectItem value="video">
                        <div className="flex items-center gap-2">
                          <FileVideo className="h-4 w-4" />
                          Vídeo
                        </div>
                      </SelectItem>
                      <SelectItem value="document">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4" />
                          Documento
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  placeholder="Descreva o material e como pode ser usado"
                  value={materialData.description}
                  onChange={(e) => setMaterialData(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="tags">Tags (separadas por vírgula)</Label>
                  <Input
                    id="tags"
                    placeholder="banner, social media, promocional"
                    value={materialData.tags}
                    onChange={(e) => setMaterialData(prev => ({ ...prev, tags: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="license">Licença</Label>
                  <Select 
                    value={materialData.license} 
                    onValueChange={(value) => setMaterialData(prev => ({ ...prev, license: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="exclusive">Uso Exclusivo</SelectItem>
                      <SelectItem value="royalty_free">Royalty Free</SelectItem>
                      <SelectItem value="attribution">Com Atribuição</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="instructions">Instruções de Uso</Label>
                <Textarea
                  id="instructions"
                  placeholder="Como usar este material de forma efetiva"
                  value={materialData.instructions}
                  onChange={(e) => setMaterialData(prev => ({ ...prev, instructions: e.target.value }))}
                  rows={2}
                />
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={resetForm}>
              Cancelar
            </Button>
            <Button 
              className="gradient-orange"
              disabled={!materialData.title || uploadFileMutation.isPending || addExternalLinkMutation.isPending}
              onClick={() => {
                if (externalLink) {
                  addExternalLinkMutation.mutate(externalLink);
                } else {
                  fileInputRef.current?.click();
                }
              }}
            >
              {uploadFileMutation.isPending || addExternalLinkMutation.isPending ? (
                'Processando...'
              ) : externalLink ? (
                'Adicionar Link'
              ) : (
                'Selecionar Arquivo'
              )}
            </Button>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default MaterialsUploadManager; 