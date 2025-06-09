import React, { useRef, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import {
  Upload,
  Link,
  Cloud,
  Check,
  AlertCircle,
} from 'lucide-react';
import { useMaterialUpload } from '@/hooks/useMaterialUpload';

interface MaterialUploadManagerProps {
  productId?: string;
  onUploadComplete?: (material: any) => void;
}

const MaterialsUploadManager: React.FC<MaterialUploadManagerProps> = ({
  productId,
  onUploadComplete,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const {
    uploadProgress,
    materialData,
    setMaterialData,
    externalLink,
    setExternalLink,
    uploadFile,
    isUploading,
    addExternalLink,
    isAddingLink,
    resetForm,
  } = useMaterialUpload({ productId, onUploadComplete });

  const [dragOver, setDragOver] = useState(false);

  const handleFileSelect = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    if (!materialData.title) {
      setMaterialData(prev => ({ ...prev, title: file.name.replace(/\.[^/.]+$/, '') }));
    }
    uploadFile(file, {
      onSuccess: () => {
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    });
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const handleAddLink = () => {
    if (externalLink && materialData.title) {
      addExternalLink(externalLink);
    }
  };

  const isSubmitDisabled = isUploading || isAddingLink;

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-lg border-2 border-slate-800 bg-slate-900/80">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-orange-500/10 rounded-lg">
            <Cloud className="w-6 h-6 text-orange-400" />
          </div>
          <div>
            <CardTitle className="text-xl font-bold text-white">Gerenciador de Materiais</CardTitle>
            <CardDescription className="text-slate-400">
              Faça upload de arquivos ou adicione links externos para seus produtos.
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="upload" className="w-full" onValueChange={resetForm}>
          <TabsList className="grid w-full grid-cols-2 bg-slate-800 border border-slate-700">
            <TabsTrigger value="upload" className="gap-2 data-[state=active]:bg-orange-500 data-[state=active]:text-slate-900">
              <Upload className="w-4 h-4" /> Upload de Arquivo
            </TabsTrigger>
            <TabsTrigger value="link" className="gap-2 data-[state=active]:bg-orange-500 data-[state=active]:text-slate-900">
              <Link className="w-4 h-4" /> Link Externo
            </TabsTrigger>
          </TabsList>
          
          <div className="mt-6 space-y-4">
            <div>
              <Label htmlFor="material-title" className="text-slate-300">Título do Material</Label>
              <Input
                id="material-title"
                placeholder="Ex: Banner para Facebook Ads"
                className="bg-slate-800 border-slate-700 text-white"
                value={materialData.title}
                onChange={(e) => setMaterialData(prev => ({ ...prev, title: e.target.value }))}
                disabled={isSubmitDisabled}
              />
            </div>
            <div>
              <Label htmlFor="material-description" className="text-slate-300">Descrição</Label>
              <Textarea
                id="material-description"
                placeholder="Descreva o material, seu propósito e onde usá-lo."
                className="bg-slate-800 border-slate-700 text-white"
                value={materialData.description}
                onChange={(e) => setMaterialData(prev => ({ ...prev, description: e.target.value }))}
                disabled={isSubmitDisabled}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div>
                <Label htmlFor="material-type" className="text-slate-300">Tipo de Material</Label>
                <Select
                  value={materialData.type}
                  onValueChange={(value) => setMaterialData(prev => ({...prev, type: value}))}
                  disabled={isSubmitDisabled}
                >
                  <SelectTrigger className="w-full bg-slate-800 border-slate-700 text-white">
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700 text-white">
                    <SelectItem value="image">Imagem (Banner, Post)</SelectItem>
                    <SelectItem value="video">Vídeo (Anúncio, Review)</SelectItem>
                    <SelectItem value="document">Documento (PDF, E-book)</SelectItem>
                    <SelectItem value="audio">Áudio (Podcast, Depoimento)</SelectItem>
                    <SelectItem value="other">Outro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="material-tags" className="text-slate-300">Tags (separadas por vírgula)</Label>
                <Input
                  id="material-tags"
                  placeholder="Ex: facebook, ads, banner"
                  className="bg-slate-800 border-slate-700 text-white"
                  value={materialData.tags}
                  onChange={(e) => setMaterialData(prev => ({...prev, tags: e.target.value}))}
                  disabled={isSubmitDisabled}
                />
              </div>
            </div>
          </div>

          <TabsContent value="upload" className="mt-6">
            <div
              className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors duration-300
                ${dragOver ? 'border-orange-500 bg-slate-800/50' : 'border-slate-700 hover:border-orange-500/50'}
                ${isSubmitDisabled ? 'cursor-not-allowed opacity-50' : ''}`}
              onDragOver={isSubmitDisabled ? undefined : handleDragOver}
              onDragLeave={isSubmitDisabled ? undefined : handleDragLeave}
              onDrop={isSubmitDisabled ? undefined : handleDrop}
            >
              <div className="flex flex-col items-center justify-center space-y-4">
                <div className="p-3 bg-slate-700/50 rounded-full">
                  <Upload className="w-8 h-8 text-slate-400" />
                </div>
                <p className="text-slate-400">
                  <span className={`font-semibold text-orange-400 ${isSubmitDisabled ? '' : 'cursor-pointer'}`}
                    onClick={() => !isSubmitDisabled && fileInputRef.current?.click()}>
                    Clique para fazer upload
                  </span> ou arraste e solte o arquivo aqui.
                </p>
                <p className="text-xs text-slate-500">Tamanho máximo: 10MB</p>
              </div>
              <Input
                ref={fileInputRef}
                type="file"
                className="hidden"
                onChange={(e) => handleFileSelect(e.target.files)}
                disabled={isSubmitDisabled}
              />
            </div>
          </TabsContent>

          <TabsContent value="link" className="mt-6 space-y-4">
            <div>
              <Label htmlFor="external-link" className="text-slate-300">URL do Material Externo</Label>
              <Input
                id="external-link"
                placeholder="https://drive.google.com/..."
                className="bg-slate-800 border-slate-700 text-white"
                value={externalLink}
                onChange={(e) => setExternalLink(e.target.value)}
                disabled={isSubmitDisabled}
              />
            </div>
            <Button onClick={handleAddLink} disabled={isSubmitDisabled || !externalLink || !materialData.title}>
              {isAddingLink ? 'Adicionando...' : 'Adicionar Link'}
            </Button>
          </TabsContent>

          {uploadProgress && (
            <div className="mt-6 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-slate-300">{uploadProgress.message}</span>
                <span className={`text-sm font-bold ${
                  uploadProgress.status === 'error' ? 'text-red-500' :
                  uploadProgress.status === 'completed' ? 'text-green-500' : 'text-orange-400'
                }`}>
                  {uploadProgress.percentage}%
                </span>
              </div>
              <Progress
                value={uploadProgress.percentage}
                className={`w-full [&>*]:bg-gradient-to-r ${
                  uploadProgress.status === 'error' ? '[&>*]:from-red-500 [&>*]:to-red-700' :
                  uploadProgress.status === 'completed' ? '[&>*]:from-green-500 [&>*]:to-green-700' :
                  '[&>*]:from-orange-500 [&>*]:to-orange-700'
                }`}
              />
              {uploadProgress.status === 'error' && (
                <div className="flex items-center gap-2 text-red-500 text-sm">
                  <AlertCircle className="w-4 h-4" />
                  <span>Ocorreu um erro. Verifique o console ou tente novamente.</span>
                </div>
              )}
               {uploadProgress.status === 'completed' && (
                <div className="flex items-center gap-2 text-green-500 text-sm">
                  <Check className="w-4 h-4" />
                  <span>Material adicionado com sucesso!</span>
                </div>
              )}
            </div>
          )}
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default MaterialsUploadManager; 