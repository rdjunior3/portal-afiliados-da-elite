import { useState } from 'react';
import { supabase, supabaseWithTimeout, withRetry } from '@/integrations/supabase/client';
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
      console.log('🔍 [validateImage] Iniciando validação de:', file.name);
      
      // Validar tipo de arquivo primeiro
      if (!file.type.startsWith('image/')) {
        console.error('❌ [validateImage] Tipo de arquivo inválido:', file.type);
        toast({
          title: "Arquivo inválido",
          description: "Por favor, selecione apenas arquivos de imagem (PNG, JPG, JPEG, WEBP)",
          variant: "destructive",
        });
        resolve(false);
        return;
      }

      // Validar tamanho do arquivo
      const maxSize = (options.maxSizeInMB || 5) * 1024 * 1024;
      if (file.size > maxSize) {
        console.error('❌ [validateImage] Arquivo muito grande:', file.size, 'bytes');
        toast({
          title: "Arquivo muito grande",
          description: `O arquivo deve ter no máximo ${options.maxSizeInMB || 5}MB`,
          variant: "destructive",
        });
        resolve(false);
        return;
      }

      console.log('⏳ [validateImage] Validando dimensões da imagem...');

      // Validar dimensões da imagem
      const img = new Image();
      const url = URL.createObjectURL(file);
      
      // TIMEOUT AUMENTADO para validação - 20 segundos
      const timeoutId = setTimeout(() => {
        console.error('⏰ [validateImage] Timeout na validação (20s)');
        URL.revokeObjectURL(url);
        toast({
          title: "Timeout na validação",
          description: "A validação da imagem demorou muito. Tente uma imagem menor ou verifique sua conexão.",
          variant: "destructive",
        });
        resolve(false);
      }, 20000); // Aumentado para 20 segundos

      img.onload = () => {
        clearTimeout(timeoutId);
        console.log('✅ [validateImage] Imagem carregada:', img.width, 'x', img.height);
        URL.revokeObjectURL(url);
        
        const maxWidth = options.maxWidth || 2000;
        const maxHeight = options.maxHeight || 2000;
        
        if (img.width > maxWidth || img.height > maxHeight) {
          console.warn('⚠️ [validateImage] Imagem grande detectada');
          toast({
            title: "Imagem grande detectada",
            description: `Recomendamos imagens até ${options.maxWidth || 500}x${options.maxHeight || 500}px para melhor performance. A imagem será otimizada automaticamente.`,
            variant: "default",
          });
        }

        console.log('✅ [validateImage] Validação concluída com sucesso');
        resolve(true);
      };

      img.onerror = () => {
        clearTimeout(timeoutId);
        console.error('❌ [validateImage] Erro ao carregar imagem');
        URL.revokeObjectURL(url);
        toast({
          title: "Arquivo inválido",
          description: "O arquivo selecionado não é uma imagem válida ou está corrompido",
          variant: "destructive",
        });
        resolve(false);
      };

      img.src = url;
    });
  };

  const uploadImage = async (file: File): Promise<string | null> => {
    if (uploading) {
      console.warn('⚠️ [uploadImage] Upload já em andamento');
      toast({
        title: "Upload em andamento",
        description: "Aguarde o upload atual terminar antes de enviar outra imagem.",
        variant: "default",
      });
      return null;
    }

    if (!options.bucket) {
      console.error('❌ [uploadImage] Bucket não configurado');
      toast({
        title: "Erro de configuração",
        description: "Bucket de storage não configurado. Entre em contato com o administrador.",
        variant: "destructive",
      });
      return null;
    }

    try {
      setUploading(true);
      setUploadProgress(0);

      console.log('🚀 [uploadImage] Iniciando upload com timeout estendido:', {
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        bucket: options.bucket,
        folder: options.folder
      });

      // Validar imagem
      console.log('🔍 [uploadImage] Validando imagem...');
      setUploadProgress(10);
      
      const isValid = await validateImage(file);
      if (!isValid) {
        console.error('❌ [uploadImage] Validação falhou');
        return null;
      }

      setUploadProgress(25);
      console.log('⚡ [uploadImage] UPLOAD COM TIMEOUT ESTENDIDO');

      // Gerar nome único para o arquivo
      const timestamp = Date.now();
      const random = Math.random().toString(36).substring(7);
      const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg';
      const fileName = `${timestamp}-${random}.${fileExt}`;
      const filePath = options.folder ? `${options.folder}/${fileName}` : fileName;

      console.log(`📤 [Enhanced Upload] Enviando para: ${options.bucket}/${filePath}`);
      setUploadProgress(50);

      // Usar a nova função com timeout estendido e retry
      const response = await withRetry(async () => {
        setUploadProgress(prev => Math.min(prev + 10, 90));
        return await supabaseWithTimeout.storage.upload(options.bucket, filePath, file, {
          cacheControl: '3600',
          upsert: false
        });
      }, 3, 2000); // 3 retries, 2s delay

      if (response.error) {
        console.error('❌ [uploadImage] Erro detalhado do upload:', response.error);
        
        if (response.error.message?.includes('The resource was not found') || 
            response.error.message?.includes('Bucket not found')) {
          throw new Error(`Bucket '${options.bucket}' não configurado. Entre em contato com o administrador para configurar o upload de ${options.bucket === 'products' ? 'produtos' : 'imagens'}.`);
        }
        
        throw response.error;
      }

      console.log('✅ [uploadImage] Upload realizado com sucesso:', response.data);
      setUploadProgress(95);

      // Obter URL pública
      const { data } = supabase.storage
        .from(options.bucket)
        .getPublicUrl(filePath);

      const publicUrl = data.publicUrl;
      console.log('🔗 [uploadImage] URL pública gerada:', publicUrl);
      
      setImageUrl(publicUrl);
      setUploadProgress(100);

      toast({
        title: "Upload realizado! ✅",
        description: "Imagem carregada com sucesso",
      });

      return publicUrl;
    } catch (error: any) {
      console.error('💥 [uploadImage] Erro completo no upload:', error);
      
      let errorMessage = "Não foi possível fazer o upload da imagem";
      
      if (error.message?.includes('Bucket not found')) {
        errorMessage = `Bucket '${options.bucket}' não encontrado. Verifique as configurações do Supabase Storage.`;
      } else if (error.message?.includes('The resource was not found')) {
        errorMessage = `Serviço de storage não configurado para ${options.bucket}. Verifique as configurações do projeto Supabase.`;
      } else if (error.message?.includes('JWT') || error.message?.includes('authentication')) {
        errorMessage = "Erro de autenticação. Faça login novamente.";
      } else if (error.message?.includes('permission') || error.message?.includes('unauthorized')) {
        errorMessage = `Sem permissão para upload em ${options.bucket}. Verifique as políticas de storage.`;
      } else if (error.message?.includes('size') || error.message?.includes('large')) {
        errorMessage = "Arquivo muito grande para upload.";
      } else if (error.message?.includes('timeout')) {
        errorMessage = "Upload demorou muito. Sua conexão pode estar lenta. Tente uma imagem menor ou verifique sua internet.";
      } else if (error.message?.includes('network') || error.message?.includes('fetch')) {
        errorMessage = "Erro de conexão. Verifique sua internet e tente novamente.";
      } else if (error.message?.includes('mime') || error.message?.includes('type')) {
        errorMessage = "Tipo de arquivo não permitido. Use apenas imagens PNG, JPG ou WEBP.";
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
    console.log('🔄 [resetUpload] Resetando estado do upload');
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