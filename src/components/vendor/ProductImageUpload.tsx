
import React, { useState } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';

interface ProductFormData {
  name: string;
  description: string;
  price: number;
  original_price?: number;
  category_id: string;
  stock: number;
  tags: string[];
  images: string[];
}

interface ProductImageUploadProps {
  form: UseFormReturn<ProductFormData>;
}

export const ProductImageUpload: React.FC<ProductImageUploadProps> = ({ form }) => {
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    try {
      const newImages: string[] = [];
      
      for (const file of Array.from(files)) {
        // Vérifier le type de fichier
        if (!file.type.startsWith('image/')) {
          toast.error(`${file.name} n'est pas une image valide`);
          continue;
        }

        // Vérifier la taille (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
          toast.error(`${file.name} est trop volumineux (max 5MB)`);
          continue;
        }

        // Convertir en base64 pour la démo
        const reader = new FileReader();
        const imageUrl = await new Promise<string>((resolve) => {
          reader.onload = (e) => resolve(e.target?.result as string);
          reader.readAsDataURL(file);
        });
        
        newImages.push(imageUrl);
      }

      const updatedImages = [...uploadedImages, ...newImages];
      setUploadedImages(updatedImages);
      
      // Mettre à jour le formulaire avec toutes les images uploadées
      const currentFormImages = form.getValues('images') || [];
      const allImages = [...currentFormImages.filter(img => !uploadedImages.includes(img)), ...updatedImages];
      form.setValue('images', allImages);
      
      toast.success(`${newImages.length} image(s) uploadée(s) avec succès !`);
    } catch (error) {
      console.error('Error uploading images:', error);
      toast.error('Erreur lors de l\'upload des images');
    } finally {
      setIsUploading(false);
    }
  };

  const removeUploadedImage = (imageUrl: string) => {
    const updatedImages = uploadedImages.filter(url => url !== imageUrl);
    setUploadedImages(updatedImages);
    
    // Mettre à jour le formulaire
    const currentFormImages = form.getValues('images') || [];
    const filteredImages = currentFormImages.filter(img => img !== imageUrl);
    form.setValue('images', filteredImages);
    
    toast.success('Image supprimée');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Upload className="w-5 h-5 text-blue-600" />
          <span>Upload d'images personnelles</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">
            Ajouter vos propres images
          </label>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
              id="image-upload"
              disabled={isUploading}
            />
            <label htmlFor="image-upload" className="cursor-pointer">
              <div className="flex flex-col items-center space-y-2">
                <ImageIcon className="w-8 h-8 text-gray-400" />
                <p className="text-sm text-gray-600">
                  {isUploading ? 'Upload en cours...' : 'Cliquez pour sélectionner des images'}
                </p>
                <p className="text-xs text-gray-500">
                  PNG, JPG, JPEG (max 5MB par image)
                </p>
              </div>
            </label>
          </div>
        </div>

        {/* Images uploadées */}
        {uploadedImages.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-medium text-gray-900">Images uploadées :</h4>
            <div className="grid grid-cols-3 gap-3">
              {uploadedImages.map((imageUrl, index) => (
                <Card key={index} className="relative group">
                  <CardContent className="p-2">
                    <div className="aspect-square rounded overflow-hidden">
                      <img 
                        src={imageUrl} 
                        alt={`Image uploadée ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <Button
                      size="sm"
                      variant="destructive"
                      type="button"
                      onClick={() => removeUploadedImage(imageUrl)}
                      className="absolute top-2 right-2 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        <div className="text-xs text-gray-500">
          💡 Vous pouvez combiner vos images uploadées avec les images générées par IA
        </div>
      </CardContent>
    </Card>
  );
};
