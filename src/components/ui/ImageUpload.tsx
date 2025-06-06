import React, { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Upload, Image as ImageIcon, X, Crop } from 'lucide-react';
import { useImageUpload } from '@/hooks/useImageUpload';
import { ImageCropper } from './ImageCropper';
import { cn } from '@/lib/utils';

interface ImageUploadProps {
  value?: string;
  onChange: (url: string) => void;
  bucket: string;
  folder: string;
  label?: string;
  placeholder?: string;
  className?: string;
  maxWidth?: number;
  maxHeight?: number;
  enableCrop?: boolean;
  cropAspect?: number;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
  value,
  onChange,
  bucket,
  folder,
  label = "Imagem",
  placeholder = "Selecione uma imagem",
  className,
  maxWidth = 500,
  maxHeight = 500,
  enableCrop = true,
  cropAspect = 1
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [showCropper, setShowCropper] = useState(false);
  
  const { uploadImage, uploading, resetUpload } = useImageUpload({
    bucket,
    folder,
    maxWidth,
    maxHeight,
    maxSizeInMB: 2
  });

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validar tipo de arquivo
    if (!file.type.startsWith('image/')) {
      return;
    }

    setSelectedFile(file);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);

    if (enableCrop) {
      setShowCropper(true);
    } else {
      // Upload direto sem recorte
      const uploadedUrl = await uploadImage(file);
      if (uploadedUrl) {
        onChange(uploadedUrl);
      }
    }

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleCropComplete = async (croppedBlob: Blob) => {
    // Converter blob para file
    const croppedFile = new File([croppedBlob], selectedFile?.name || 'cropped-image.jpg', {
      type: 'image/jpeg',
      lastModified: Date.now(),
    });

    const uploadedUrl = await uploadImage(croppedFile);
    if (uploadedUrl) {
      onChange(uploadedUrl);
    }

    // Cleanup
    setShowCropper(false);
    setSelectedFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl('');
    }
  };

  const handleCropCancel = () => {
    setShowCropper(false);
    setSelectedFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl('');
    }
  };

  const handleRemoveImage = () => {
    onChange('');
    resetUpload();
  };

  return (
    <div className={cn("space-y-4", className)}>
      <Label className="text-slate-200 font-medium">{label}</Label>
      
      {/* Preview da imagem */}
      {value && (
        <div className="relative w-32 h-32 rounded-lg overflow-hidden border border-slate-600 bg-slate-700">
          <img
            src={value}
            alt="Preview"
            className="w-full h-full object-cover"
          />
          <Button
            type="button"
            variant="destructive"
            size="sm"
            className="absolute top-1 right-1 h-6 w-6 p-0"
            onClick={handleRemoveImage}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      )}

      {/* Área de upload */}
      <div className="space-y-3">
        <div 
          className={cn(
            "border-2 border-dashed rounded-lg p-6 text-center transition-colors",
            value ? "border-green-500/50 bg-green-500/10" : "border-slate-600 bg-slate-700/30",
            "hover:border-orange-500/50 hover:bg-orange-500/5"
          )}
        >
          <div className="flex flex-col items-center gap-3">
            <div className={cn(
              "w-12 h-12 rounded-full flex items-center justify-center",
              value ? "bg-green-500/20" : "bg-slate-600/50"
            )}>
              {value ? (
                <ImageIcon className="h-6 w-6 text-green-400" />
              ) : (
                <Upload className="h-6 w-6 text-slate-400" />
              )}
            </div>
            
            <div>
              <p className="text-sm font-medium text-white mb-1">
                {value ? "Imagem carregada com sucesso" : placeholder}
              </p>
              <p className="text-xs text-slate-400">
                Máximo {maxWidth}x{maxHeight}px, 2MB - PNG, JPG, JPEG
                {enableCrop && <><br />🔄 Recorte automático disponível</>}
              </p>
            </div>
            
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={uploading}
              onClick={() => fileInputRef.current?.click()}
              className="border-slate-600 text-slate-300 hover:border-orange-500 hover:text-orange-300"
            >
              {uploading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-orange-500 mr-2" />
                  Carregando...
                </>
              ) : (
                <>
                  {enableCrop ? <Crop className="h-4 w-4 mr-2" /> : <Upload className="h-4 w-4 mr-2" />}
                  {value ? (enableCrop ? "Alterar e Recortar" : "Alterar Imagem") : (enableCrop ? "Selecionar e Recortar" : "Selecionar Imagem")}
                </>
              )}
            </Button>
          </div>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpg,image/jpeg"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      {/* Image Cropper Modal */}
      {showCropper && previewUrl && (
        <ImageCropper
          isOpen={showCropper}
          imageUrl={previewUrl}
          onClose={handleCropCancel}
          onCropComplete={handleCropComplete}
          aspect={cropAspect}
        />
      )}
    </div>
  );
}; 