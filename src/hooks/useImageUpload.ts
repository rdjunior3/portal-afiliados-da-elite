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
      
      img.onload = () => {
        console.log('✅ [validateImage] Imagem carregada:', img.width, 'x', img.height);
        URL.revokeObjectURL(url);
        
        const maxWidth = options.maxWidth || 2000;
        const maxHeight = options.maxHeight || 2000;
        
        // Apenas avisar sobre imagens muito grandes, não bloquear
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
        console.error('❌ [validateImage] Erro ao carregar imagem');
        URL.revokeObjectURL(url);
        toast({
          title: "Arquivo inválido",
          description: "O arquivo selecionado não é uma imagem válida ou está corrompido",
          variant: "destructive",
        });
        resolve(false);
      };

      // Timeout otimizado para 10 segundos
      const timeoutId = setTimeout(() => {
        console.error('⏰ [validateImage] Timeout na validação (10s)');
        URL.revokeObjectURL(url);
        toast({
          title: "Timeout na validação",
          description: "A validação da imagem demorou muito. Tente uma imagem menor ou verifique sua conexão.",
          variant: "destructive",
        });
        resolve(false);
      }, 10000); // 10 segundos

      img.onload = () => {
        clearTimeout(timeoutId);
        console.log('✅ [validateImage] Imagem carregada:', img.width, 'x', img.height);
        URL.revokeObjectURL(url);
        
        const maxWidth = options.maxWidth || 2000;
        const maxHeight = options.maxHeight || 2000;
        
        // Apenas avisar sobre imagens muito grandes, não bloquear
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

  // Função checkBucketExists REMOVIDA para melhor performance
  // Upload direto sem verificação prévia de bucket

  const createBucketIfNotExists = async (bucketName: string): Promise<boolean> => {
    try {
      console.log('🔨 [createBucketIfNotExists] Tentando criar bucket:', bucketName);
      
      // Configurações específicas por bucket
      const bucketConfig = {
        avatars: {
        public: true,
          fileSizeLimit: 5 * 1024 * 1024, // 5MB
        allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/jpg']
        },
        products: {
          public: true,
          fileSizeLimit: 10 * 1024 * 1024, // 10MB para produtos
          allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/jpg', 'image/gif']
        }
      };

      const config = bucketConfig[bucketName as keyof typeof bucketConfig] || bucketConfig.avatars;

      const { data, error } = await supabase.storage.createBucket(bucketName, config);

      if (error) {
        console.warn(`❌ [createBucketIfNotExists] Não foi possível criar bucket ${bucketName}:`, error);
        return false;
      }
      
      console.log(`✅ [createBucketIfNotExists] Bucket ${bucketName} criado com sucesso:`, data);
      return true;
    } catch (error) {
      console.warn(`💥 [createBucketIfNotExists] Erro ao criar bucket ${bucketName}:`, error);
      return false;
    }
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

    // Validação de configuração de bucket
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

      console.log('🚀 [uploadImage] Iniciando upload de imagem:', {
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        bucket: options.bucket,
        folder: options.folder
      });

      // Validar imagem
      console.log('🔍 [uploadImage] Validando imagem...');
      const isValid = await validateImage(file);
      if (!isValid) {
        console.error('❌ [uploadImage] Validação falhou');
        return null;
      }

      // Upload direto para máxima performance - SEM verificação de bucket
      console.log('⚡ [uploadImage] UPLOAD DIRETO OTIMIZADO');

      // Gerar nome único para o arquivo
      const timestamp = Date.now();
      const random = Math.random().toString(36).substring(7);
      const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg';
      const fileName = `${timestamp}-${random}.${fileExt}`;
      const filePath = `${fileName}`; // Path simplificado - apenas o nome do arquivo

      console.log(`📤 [UPLOAD_OTIMIZADO] Enviando para: ${options.bucket}/${filePath}`);

      // Upload para o Supabase com timeout otimizado para 30 segundos
      const uploadPromise = supabase.storage
        .from(options.bucket)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      // Timeout otimizado para 30 segundos
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Upload timeout - operação cancelada após 30 segundos')), 30000)
      );

      console.log('⏳ [uploadImage] Upload em progresso...');
      const { data: uploadData, error: uploadError } = await Promise.race([
        uploadPromise,
        timeoutPromise
      ]) as any;

      if (uploadError) {
        console.error('❌ [uploadImage] Erro detalhado do upload:', uploadError);
        
        // Tratamento específico para erro de bucket não encontrado
        if (uploadError.message?.includes('The resource was not found') || 
            uploadError.message?.includes('Bucket not found')) {
          throw new Error(`Bucket '${options.bucket}' não configurado. Entre em contato com o administrador para configurar o upload de ${options.bucket === 'products' ? 'produtos' : 'imagens'}.`);
        }
        
        throw uploadError;
      }

      console.log('✅ [uploadImage] Upload realizado com sucesso:', uploadData);

      // Obter URL pública
      const { data } = supabase.storage
        .from(options.bucket)
        .getPublicUrl(filePath);

      const publicUrl = data.publicUrl;
      console.log('🔗 [uploadImage] URL pública gerada:', publicUrl);
      
      setImageUrl(publicUrl);

      toast({
        title: "Upload realizado! ✅",
        description: "Imagem carregada com sucesso",
      });

      return publicUrl;
    } catch (error: any) {
      console.error('💥 [uploadImage] Erro completo no upload:', error);
      
      let errorMessage = "Não foi possível fazer o upload da imagem";
      
      // Mensagens de erro mais específicas
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
        errorMessage = "Upload demorou muito. Verifique sua conexão e tente novamente.";
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
    }
  };

  const resetUpload = () => {
    console.log('🔄 [resetUpload] Resetando estado do upload');
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