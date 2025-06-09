import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface UseMaterialUploadProps {
  productId?: string;
  onUploadComplete?: (material: any) => void;
}

interface UploadProgress {
  percentage: number;
  status: 'uploading' | 'processing' | 'completed' | 'error';
  message: string;
}

export const useMaterialUpload = ({ productId, onUploadComplete }: UseMaterialUploadProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [uploadProgress, setUploadProgress] = useState<UploadProgress | null>(null);
  const [materialData, setMaterialData] = useState({
    title: '',
    description: '',
    type: 'image',
    tags: '',
    license: 'exclusive',
    instructions: ''
  });
  const [externalLink, setExternalLink] = useState('');

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
  };

  const uploadFileMutation = useMutation({
    mutationFn: async (file: File) => {
      if (!user) throw new Error('Usuário não autenticado');
      
      setUploadProgress({
        percentage: 0,
        status: 'uploading',
        message: 'Iniciando upload...'
      });

      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `materials/${user.id}/${fileName}`;

      setUploadProgress({
        percentage: 50,
        status: 'uploading',
        message: 'Enviando arquivo...'
      });

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('uploads')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      setUploadProgress({
        percentage: 90,
        status: 'processing',
        message: 'Processando arquivo...'
      });

      const { data: { publicUrl } } = supabase.storage
        .from('uploads')
        .getPublicUrl(filePath);

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
      queryClient.invalidateQueries({ queryKey: ['materials', productId] });
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

  const addExternalLinkMutation = useMutation({
    mutationFn: async (url: string) => {
      if (!user) throw new Error('Usuário não autenticado');
      
      let uploadSource = 'external';
      if (url.includes('drive.google.com')) uploadSource = 'google_drive';
      if (url.includes('dropbox.com')) uploadSource = 'dropbox';
      if (url.includes('onedrive.com')) uploadSource = 'onedrive';

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
      queryClient.invalidateQueries({ queryKey: ['materials', productId] });
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

  return {
    uploadProgress,
    materialData,
    setMaterialData,
    externalLink,
    setExternalLink,
    uploadFile: uploadFileMutation.mutate,
    isUploading: uploadFileMutation.isPending,
    addExternalLink: addExternalLinkMutation.mutate,
    isAddingLink: addExternalLinkMutation.isPending,
    resetForm,
  };
}; 