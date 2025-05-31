import React from 'react';
import { Button } from '@/components/ui/button';
import { FileText, Download, FileVideo, FileImage, File } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Material {
  id: string;
  title: string;
  file_url: string;
  file_type: string | null;
  file_size: number | null;
}

interface MaterialDownloadButtonProps {
  material: Material;
}

const MaterialDownloadButton: React.FC<MaterialDownloadButtonProps> = ({ material }) => {
  const { toast } = useToast();

  const getFileIcon = (fileType: string | null) => {
    if (!fileType) return <File className="h-4 w-4" />;
    
    if (fileType.includes('pdf')) return <FileText className="h-4 w-4" />;
    if (fileType.includes('video')) return <FileVideo className="h-4 w-4" />;
    if (fileType.includes('image')) return <FileImage className="h-4 w-4" />;
    
    return <File className="h-4 w-4" />;
  };

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return '';
    
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    
    return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`;
  };

  const handleDownload = async () => {
    try {
      // Abrir o link de download em uma nova aba
      window.open(material.file_url, '_blank');
      
      toast({
        title: "Download iniciado",
        description: `O download de "${material.title}" foi iniciado.`,
      });
    } catch (error) {
      toast({
        title: "Erro no download",
        description: "Não foi possível iniciar o download. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  return (
    <Button
      variant="outline"
      className="w-full justify-between group hover:border-orange-500 hover:text-orange-600"
      onClick={handleDownload}
    >
      <div className="flex items-center gap-3">
        {getFileIcon(material.file_type)}
        <div className="text-left">
          <p className="font-medium">{material.title}</p>
          {material.file_size && (
            <p className="text-xs text-muted-foreground">
              {formatFileSize(material.file_size)}
            </p>
          )}
        </div>
      </div>
      <Download className="h-4 w-4 group-hover:text-orange-600 transition-colors" />
    </Button>
  );
};

export default MaterialDownloadButton; 