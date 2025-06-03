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
      // Validar tipo de arquivo primeiro
      if (!file.type.startsWith('image/')) {
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
        toast({
          title: "Arquivo muito grande",
          description: `O arquivo deve ter no máximo ${options.maxSizeInMB || 5}MB`,
          variant: "destructive",
        });
        resolve(false);
        return;
      }

      // Validar dimensões da imagem
      const img = new Image();
      const url = URL.createObjectURL(file);
      
      img.onload = () => {
        URL.revokeObjectURL(url);
        
        const maxWidth = options.maxWidth || 2000;
        const maxHeight = options.maxHeight || 2000;
        
        // Apenas avisar sobre imagens muito grandes, não bloquear
        if (img.width > maxWidth || img.height > maxHeight) {
          toast({
            title: "Imagem grande detectada",
            description: `Recomendamos imagens até ${options.maxWidth || 500}x${options.maxHeight || 500}px para melhor performance. A imagem será otimizada automaticamente.`,
            variant: "default",
          });
        }

        resolve(true);
      };

      img.onerror = () => {
        URL.revokeObjectURL(url);
        toast({
          title: "Arquivo inválido",
          description: "O arquivo selecionado não é uma imagem válida ou está corrompido",
          variant: "destructive",
        });
        resolve(false);
      };

      // Timeout para evitar travamento
      setTimeout(() => {
        URL.revokeObjectURL(url);
        toast({
          title: "Erro na validação",
          description: "Não foi possível validar a imagem. Tente novamente.",
          variant: "destructive",
        });
        resolve(false);
      }, 10000);

      img.src = url;
    });
  };

  const checkBucketExists = async (bucketName: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase.storage.getBucket(bucketName);
      if (error) {
        console.warn(`Bucket ${bucketName} não encontrado:`, error);
        return false;
      }
      return !!data;
    } catch (error) {
      console.warn(`Erro ao verificar bucket ${bucketName}:`, error);
      return false;
    }
  };

  const createBucketIfNotExists = async (bucketName: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase.storage.createBucket(bucketName, {
        public: true,
        fileSizeLimit: 10 * 1024 * 1024, // 10MB
        allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/jpg']
      });

      if (error) {
        console.warn(`Não foi possível criar bucket ${bucketName}:`, error);
        return false;
      }
      
      console.log(`Bucket ${bucketName} criado com sucesso:`, data);
      return true;
    } catch (error) {
      console.warn(`Erro ao criar bucket ${bucketName}:`, error);
      return false;
    }
  };

  const uploadImage = async (file: File): Promise<string | null> => {
    if (uploading) {
      toast({
        title: "Upload em andamento",
        description: "Aguarde o upload atual terminar antes de enviar outra imagem.",
        variant: "default",
      });
      return null;
    }

    try {
      setUploading(true);

      console.log('🔄 Iniciando upload de imagem:', {
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        bucket: options.bucket,
        folder: options.folder
      });

      // Validar imagem
      const isValid = await validateImage(file);
      if (!isValid) {
        return null;
      }

      // Verificar se bucket existe, senão tentar criar
      const bucketExists = await checkBucketExists(options.bucket);
      if (!bucketExists) {
        console.log(`Tentando criar bucket ${options.bucket}...`);
        
        toast({
          title: "Configurando storage...",
          description: "Preparando o sistema de upload pela primeira vez.",
        });

        const bucketCreated = await createBucketIfNotExists(options.bucket);
        if (!bucketCreated) {
          throw new Error(`Bucket '${options.bucket}' não existe e não pode ser criado. Verifique as configurações do Supabase Storage.`);
        }
      }

      // Gerar nome único para o arquivo
      const timestamp = Date.now();
      const random = Math.random().toString(36).substring(7);
      const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg';
      const fileName = `${timestamp}-${random}.${fileExt}`;
      const filePath = `${options.folder}/${fileName}`;

      console.log(`📤 Fazendo upload para: ${options.bucket}/${filePath}`);

      // Upload para o Supabase com timeout
      const uploadPromise = supabase.storage
        .from(options.bucket)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      // Timeout de 30 segundos para upload
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Upload timeout - operação cancelada')), 30000)
      );

      const { data: uploadData, error: uploadError } = await Promise.race([
        uploadPromise,
        timeoutPromise
      ]) as any;

      if (uploadError) {
        console.error('Erro detalhado do upload:', uploadError);
        throw uploadError;
      }

      console.log('✅ Upload realizado com sucesso:', uploadData);

      // Obter URL pública
      const { data } = supabase.storage
        .from(options.bucket)
        .getPublicUrl(filePath);

      const publicUrl = data.publicUrl;
      console.log('🔗 URL pública gerada:', publicUrl);
      
      setImageUrl(publicUrl);

      toast({
        title: "Upload realizado! ✅",
        description: "Imagem carregada com sucesso",
      });

      return publicUrl;
    } catch (error: any) {
      console.error('💥 Erro completo no upload:', error);
      
      let errorMessage = "Não foi possível fazer o upload da imagem";
      
      // Mensagens de erro mais específicas
      if (error.message?.includes('Bucket not found')) {
        errorMessage = `Bucket '${options.bucket}' não encontrado. Verifique as configurações do Supabase Storage.`;
      } else if (error.message?.includes('The resource was not found')) {
        errorMessage = `Serviço de storage não configurado. Verifique as configurações do projeto Supabase.`;
      } else if (error.message?.includes('JWT') || error.message?.includes('authentication')) {
        errorMessage = "Erro de autenticação. Faça login novamente.";
      } else if (error.message?.includes('permission') || error.message?.includes('unauthorized')) {
        errorMessage = "Sem permissão para upload. Verifique as políticas de storage.";
      } else if (error.message?.includes('size') || error.message?.includes('large')) {
        errorMessage = "Arquivo muito grande para upload.";
      } else if (error.message?.includes('timeout')) {
        errorMessage = "Upload demorou muito. Verifique sua conexão e tente novamente.";
      } else if (error.message?.includes('network') || error.message?.includes('fetch')) {
        errorMessage = "Erro de conexão. Verifique sua internet e tente novamente.";
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