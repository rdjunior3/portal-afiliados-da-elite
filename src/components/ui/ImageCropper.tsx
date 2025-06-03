import React, { useState, useRef, useCallback } from 'react';
import ReactCrop, { Crop, PixelCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Crop as CropIcon, RotateCcw, X } from 'lucide-react';

interface ImageCropperProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  onCropComplete: (croppedImageBlob: Blob) => void;
  aspect?: number;
}

const ImageCropper: React.FC<ImageCropperProps> = ({
  isOpen,
  onClose,
  imageUrl,
  onCropComplete,
  aspect = 1 // Default to square crop
}) => {
  const [crop, setCrop] = useState<Crop>({
    unit: '%',
    width: 80,
    height: 80,
    x: 10,
    y: 10
  });
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const imgRef = useRef<HTMLImageElement>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);

  const onImageLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    const { width, height } = e.currentTarget;
    
    // Center the crop
    const newCrop: Crop = {
      unit: '%',
      width: 80,
      height: 80,
      x: 10,
      y: 10
    };
    
    setCrop(newCrop);
  }, []);

  const generateCroppedImage = useCallback(
    (canvas: HTMLCanvasElement, pixelCrop: PixelCrop) => {
      const ctx = canvas.getContext('2d');
      if (!ctx || !imgRef.current) {
        throw new Error('No 2d context');
      }

      const image = imgRef.current;
      const { naturalWidth, naturalHeight } = image;
      
      // Set canvas size to the crop size
      canvas.width = pixelCrop.width;
      canvas.height = pixelCrop.height;

      // Calculate the scale factor between displayed and natural image size
      const scaleX = naturalWidth / image.width;
      const scaleY = naturalHeight / image.height;

      // Draw the cropped image
      ctx.drawImage(
        image,
        pixelCrop.x * scaleX,
        pixelCrop.y * scaleY,
        pixelCrop.width * scaleX,
        pixelCrop.height * scaleY,
        0,
        0,
        pixelCrop.width,
        pixelCrop.height
      );
    },
    []
  );

  const handleCropComplete = useCallback(() => {
    if (!completedCrop || !imgRef.current || !previewCanvasRef.current) {
      return;
    }

    const canvas = previewCanvasRef.current;
    generateCroppedImage(canvas, completedCrop);

    canvas.toBlob(
      (blob) => {
        if (blob) {
          onCropComplete(blob);
          onClose();
        }
      },
      'image/jpeg',
      0.95
    );
  }, [completedCrop, generateCroppedImage, onCropComplete, onClose]);

  const resetCrop = () => {
    setCrop({
      unit: '%',
      width: 80,
      height: 80,
      x: 10,
      y: 10
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] bg-slate-900 border-slate-700">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-2">
            <CropIcon className="w-5 h-5 text-orange-400" />
            Recortar Imagem
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Cropper Area */}
          <div className="flex justify-center">
            <ReactCrop
              crop={crop}
              onChange={(newCrop) => setCrop(newCrop)}
              onComplete={(c) => setCompletedCrop(c)}
              aspect={aspect}
              className="max-w-full max-h-96"
            >
              <img
                ref={imgRef}
                alt="Crop me"
                src={imageUrl}
                onLoad={onImageLoad}
                className="max-w-full max-h-96 object-contain"
              />
            </ReactCrop>
          </div>

          {/* Preview Canvas (hidden) */}
          <canvas
            ref={previewCanvasRef}
            className="hidden"
          />

          {/* Controls */}
          <div className="flex justify-between items-center pt-4 border-t border-slate-700">
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={resetCrop}
                className="border-slate-600 text-slate-300 hover:border-orange-500"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Resetar
              </Button>
            </div>

            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="border-slate-600 text-slate-300 hover:border-slate-500"
              >
                <X className="w-4 h-4 mr-2" />
                Cancelar
              </Button>
              <Button
                type="button"
                onClick={handleCropComplete}
                disabled={!completedCrop}
                className="bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-500 hover:to-orange-600 text-white"
              >
                <CropIcon className="w-4 h-4 mr-2" />
                Aplicar Recorte
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export { ImageCropper }; 