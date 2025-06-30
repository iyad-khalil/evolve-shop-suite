
import React, { useState } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, X, Image as ImageIcon, Plus } from 'lucide-react';
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

interface ProductImageManagerProps {
  form: UseFormReturn<ProductFormData>;
}

export const ProductImageManager: React.FC<ProductImageManagerProps> = ({ form }) => {
  const [isUploading, setIsUploading] = useState(false);
  const currentImages = form.watch('images') || [];

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

        // Convertir en base64
        const reader = new FileReader();
        const imageUrl = await new Promise<string>((resolve) => {
          reader.onload = (e) => resolve(e.target?.result as string);
          reader.readAsDataURL(file);
        });
        
        newImages.push(imageUrl);
      }

      if (newImages.length > 0) {
        const updatedImages = [...currentImages, ...newImages];
        form.setValue('images', updatedImages);
        toast.success(`${newImages.length} image(s) ajoutée(s) avec succès !`);
      }
    } catch (error) {
      console.error('Error uploading images:', error);
      toast.error('Erreur lors de l\'upload des images');
    } finally {
      setIsUploading(false);
    }
  };

  const removeImage = (index: number) => {
    const updatedImages = currentImages.filter((_, i) => i !== index);
    form.setValue('images', updatedImages);
    toast.success('Image supprimée');
  };

  const moveImage = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= currentImages.length) return;
    
    const updatedImages = [...currentImages];
    const [movedImage] = updatedImages.splice(fromIndex, 1);
    updatedImages.splice(toIndex, 0, movedImage);
    
    form.setValue('images', updatedImages);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <ImageIcon className="w-5 h-5 text-blue-600" />
          <span>Gestion des images du produit</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Images actuelles */}
        {currentImages.length > 0 && (
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <h4 className="font-medium text-gray-900">
                Images actuelles ({currentImages.length})
              </h4>
              {currentImages.length > 0 && (
                <span className="text-xs text-gray-500">
                  La première image sera l'image principale
                </span>
              )}
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {currentImages.map((imageUrl, index) => (
                <Card key={index} className="relative group">
                  <CardContent className="p-2">
                    <div className="aspect-square rounded overflow-hidden relative">
                      <img 
                        src={imageUrl} 
                        alt={`Image ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                      {index === 0 && (
                        <div className="absolute top-1 left-1 bg-blue-500 text-white text-xs px-2 py-1 rounded">
                          Principale
                        </div>
                      )}
                    </div>
                    
                    {/* Actions sur l'image */}
                    <div className="flex justify-between items-center mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="flex space-x-1">
                        {index > 0 && (
                          <Button
                            size="sm"
                            variant="outline"
                            type="button"
                            onClick={() => moveImage(index, index - 1)}
                            className="h-6 w-6 p-0 text-xs"
                            title="Déplacer vers la gauche"
                          >
                            ←
                          </Button>
                        )}
                        {index < currentImages.length - 1 && (
                          <Button
                            size="sm"
                            variant="outline"
                            type="button"
                            onClick={() => moveImage(index, index + 1)}
                            className="h-6 w-6 p-0 text-xs"
                            title="Déplacer vers la droite"
                          >
                            →
                          </Button>
                        )}
                      </div>
                      <Button
                        size="sm"
                        variant="destructive"
                        type="button"
                        onClick={() => removeImage(index)}
                        className="h-6 w-6 p-0"
                        title="Supprimer l'image"
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Zone d'upload */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Ajouter de nouvelles images
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
                <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-full">
                  {isUploading ? (
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                  ) : (
                    <Plus className="w-6 h-6 text-gray-400" />
                  )}
                </div>
                <p className="text-sm text-gray-600">
                  {isUploading ? 'Upload en cours...' : 'Cliquez pour ajouter des images'}
                </p>
                <p className="text-xs text-gray-500">
                  PNG, JPG, JPEG (max 5MB par image)
                </p>
              </div>
            </label>
          </div>
        </div>

        {/* Informations utiles */}
        <div className="bg-blue-50 p-3 rounded-lg">
          <h5 className="text-sm font-medium text-blue-900 mb-2">💡 Conseils pour vos images :</h5>
          <ul className="text-xs text-blue-700 space-y-1">
            <li>• La première image sera affichée en tant qu'image principale</li>
            <li>• Utilisez des images de haute qualité (min 800x800 pixels)</li>
            <li>• Montrez le produit sous différents angles</li>
            <li>• Vous pouvez réorganiser l'ordre avec les flèches</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};
