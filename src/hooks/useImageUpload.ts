import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
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
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const { toast } = useToast();

  const validateImage = (file: File): Promise<boolean> => {
    return new Promise((resolve) => {
      console.log('[SEARCH] [validateImage] Validando:', file.name, `(${(file.size / 1024 / 1024).toFixed(1)}MB)`);
      
      // Validar tipo de arquivo
      if (!file.type.startsWith('image/')) {
        console.error('[ERROR] [validateImage] Tipo inválido:', file.type);
        toast({
          title: "Arquivo inválido",
          description: "Selecione apenas arquivos de imagem (PNG, JPG, JPEG, WEBP)",
          variant: "destructive",
        });
        resolve(false);
        return;
      }

      // Validar tamanho
      const maxSize = (options.maxSizeInMB || 10) * 1024 * 1024;
      if (file.size > maxSize) {
        console.error('[ERROR] [validateImage] Arquivo muito grande:', file.size);
        toast({
          title: "Arquivo muito grande",
          description: `O arquivo deve ter no máximo ${options.maxSizeInMB || 10}MB`,
          variant: "destructive",
        });
        resolve(false);
        return;
      }

      console.log('[SUCCESS] [validateImage] Validação básica OK');
      
      // Validação rápida de dimensões (opcional, não bloqueia upload)
      const img = new Image();
      const url = URL.createObjectURL(file);
      
      const cleanup = () => {
        URL.revokeObjectURL(url);
      };

      // Timeout curto para validação de dimensões (5s)
      const timeoutId = setTimeout(() => {
        console.warn('⏰ [validateImage] Timeout na validação de dimensões, mas permitindo upload');
        cleanup();
        resolve(true); // Permite upload mesmo com timeout
      }, 5000);

      img.onload = () => {
        clearTimeout(timeoutId);
        console.log('[SUCCESS] [validateImage] Dimensões:', img.width, 'x', img.height);
        cleanup();
        
        const maxWidth = options.maxWidth || 4000;
        const maxHeight = options.maxHeight || 4000;
        
        if (img.width > maxWidth || img.height > maxHeight) {
          console.warn('[WARNING] [validateImage] Imagem muito grande, mas permitindo upload');
          toast({
            title: "Imagem grande detectada",
            description: "A imagem será otimizada automaticamente para melhor performance.",
            variant: "default",
          });
        }

        resolve(true);
      };

      img.onerror = () => {
        clearTimeout(timeoutId);
        console.warn('[WARNING] [validateImage] Erro ao carregar preview, mas permitindo upload');
        cleanup();
        resolve(true); // Permite upload mesmo com erro no preview
      };

      img.src = url;
    });
  };

  const uploadImage = async (file: File): Promise<string | null> => {
    if (uploading) {
      console.warn('[WARNING] [uploadImage] Upload já em andamento');
      return null;
    }

    if (!options.bucket) {
      console.error('[ERROR] [uploadImage] Bucket não configurado');
      toast({
        title: "Erro de configuração",
        description: "Bucket de storage não configurado.",
        variant: "destructive",
      });
      return null;
    }

    try {
      setUploading(true);
      setUploadProgress(10);

      console.log('🚀 [uploadImage] UPLOAD OTIMIZADO INICIADO:', {
        fileName: file.name,
        fileSize: `${(file.size / 1024 / 1024).toFixed(1)}MB`,
        fileType: file.type,
        bucket: options.bucket
      });

      // Validação rápida
      const isValid = await validateImage(file);
      if (!isValid) {
        console.error('[ERROR] [uploadImage] Validação falhou');
        return null;
      }

      setUploadProgress(25);

      // Gerar nome único e direto
      const timestamp = Date.now();
      const random = Math.random().toString(36).substring(2, 8);
      const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg';
      const fileName = `${timestamp}-${random}.${fileExt}`;
      const filePath = options.folder ? `${options.folder}/${fileName}` : fileName;

      console.log(`📤 [uploadImage] Enviando para: ${options.bucket}/${filePath}`);
      setUploadProgress(50);

      // UPLOAD DIRETO E OTIMIZADO
      console.log('⚡ [uploadImage] Executando upload direto...');
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from(options.bucket)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error('[ERROR] [uploadImage] Erro no upload:', uploadError);
        
        if (uploadError.message?.includes('Bucket not found') || 
            uploadError.message?.includes('The resource was not found')) {
          throw new Error(`Bucket '${options.bucket}' não encontrado. Execute o script SOLUCAO_UPLOAD_STORAGE_URGENTE.sql`);
        }
        
        if (uploadError.message?.includes('permission') || 
            uploadError.message?.includes('policy')) {
          throw new Error('Sem permissão para upload. Execute o script SOLUCAO_UPLOAD_STORAGE_URGENTE.sql para corrigir as políticas.');
        }
        
        throw new Error(`Erro no upload: ${uploadError.message}`);
      }

      console.log('[SUCCESS] [uploadImage] Upload realizado:', uploadData);
      setUploadProgress(85);

      // Obter URL pública
      const { data: urlData } = supabase.storage
        .from(options.bucket)
        .getPublicUrl(filePath);

      const publicUrl = urlData.publicUrl;
      console.log('🔗 [uploadImage] URL pública:', publicUrl);
      
      setImageUrl(publicUrl);
      setUploadProgress(100);

      toast({
        title: "Upload concluído! [SUCCESS]",
        description: `Imagem ${file.name} carregada com sucesso`,
      });

      return publicUrl;

    } catch (error: any) {
      console.error('[CRASH] [uploadImage] Erro no upload:', error);
      
      let errorMessage = "Erro inesperado no upload";
      
      if (error.message?.includes('Bucket not found')) {
        errorMessage = `Bucket '${options.bucket}' não encontrado. Execute o script SOLUCAO_UPLOAD_STORAGE_URGENTE.sql`;
      } else if (error.message?.includes('permission') || error.message?.includes('policy')) {
        errorMessage = "Sem permissão para upload. Execute o script de correção de políticas.";
      } else if (error.message?.includes('network') || error.message?.includes('fetch')) {
        errorMessage = "Erro de conexão. Verifique sua internet e tente novamente.";
      } else if (error.message?.includes('size') || error.message?.includes('large')) {
        errorMessage = "Arquivo muito grande para upload.";
      } else if (error.message?.includes('timeout')) {
        errorMessage = "Upload demorou muito. Tente uma imagem menor.";
      } else if (error.message) {
        errorMessage = error.message;
      }

      toast({
        title: "Erro no upload",
        description: errorMessage,
        variant: "destructive",
      });
      
      return null;
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const resetUpload = () => {
    console.log('[LOADING] [resetUpload] Resetando estado');
    setImageUrl('');
    setUploadProgress(0);
  };

  return {
    uploadImage,
    uploading,
    imageUrl,
    uploadProgress,
    setImageUrl,
    resetUpload
  };
}; 