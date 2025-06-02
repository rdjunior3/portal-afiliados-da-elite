import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

interface ImageUploadOptions {
  bucket: string;
  folder: string;
  maxWidth?: number;
  maxHeight?: number;
  maxSizeInMB?: number;
}

export const useImageUpload = (options: ImageUploadOptions) => {
  const [uploading, setUploading] = useState(false);
  const [imageUrl, setImageUrl] = useState<string>('');
  const { toast } = useToast();

  const validateImage = (file: File): Promise<boolean> => {
    return new Promise((resolve) => {
      const img = new Image();
      const url = URL.createObjectURL(file);
      
      img.onload = () => {
        URL.revokeObjectURL(url);
        
        // Verificar tamanho do arquivo
        const maxSize = (options.maxSizeInMB || 5) * 1024 * 1024;
        if (file.size > maxSize) {
          toast({
            title: "Arquivo muito grande",
            description: `O arquivo deve ter no máximo ${options.maxSizeInMB || 5}MB`,
            variant: "destructive",
          });
          resolve(false);
          return;
        }

        // Verificar dimensões
        const maxWidth = options.maxWidth || 500;
        const maxHeight = options.maxHeight || 500;
        
        if (img.width > maxWidth || img.height > maxHeight) {
          toast({
            title: "Dimensões incorretas",
            description: `A imagem deve ter no máximo ${maxWidth}x${maxHeight} pixels. Tamanho atual: ${img.width}x${img.height}`,
            variant: "destructive",
          });
          resolve(false);
          return;
        }

        resolve(true);
      };

      img.onerror = () => {
        URL.revokeObjectURL(url);
        toast({
          title: "Arquivo inválido",
          description: "O arquivo selecionado não é uma imagem válida",
          variant: "destructive",
        });
        resolve(false);
      };

      img.src = url;
    });
  };

  const uploadImage = async (file: File): Promise<string | null> => {
    try {
      setUploading(true);

      // Validar imagem
      const isValid = await validateImage(file);
      if (!isValid) {
        return null;
      }

      // Gerar nome único para o arquivo
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `${options.folder}/${fileName}`;

      // Upload para o Supabase
      const { error: uploadError } = await supabase.storage
        .from(options.bucket)
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      // Obter URL pública
      const { data } = supabase.storage
        .from(options.bucket)
        .getPublicUrl(filePath);

      const publicUrl = data.publicUrl;
      setImageUrl(publicUrl);

      toast({
        title: "Upload realizado! ✅",
        description: "Imagem carregada com sucesso",
      });

      return publicUrl;
    } catch (error: any) {
      console.error('Erro no upload:', error);
      toast({
        title: "Erro no upload",
        description: error.message || "Não foi possível fazer o upload da imagem",
        variant: "destructive",
      });
      return null;
    } finally {
      setUploading(false);
    }
  };

  const resetUpload = () => {
    setImageUrl('');
  };

  return {
    uploadImage,
    uploading,
    imageUrl,
    setImageUrl,
    resetUpload
  };
}; 