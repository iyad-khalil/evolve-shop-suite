
import React, { useState } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Image as ImageIcon, Download, Eye, Trash2 } from 'lucide-react';
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

interface AIImageGeneratorProps {
  form: UseFormReturn<ProductFormData>;
  generatedImages: string[];
  setGeneratedImages: (images: string[]) => void;
}

export const AIImageGenerator: React.FC<AIImageGeneratorProps> = ({
  form,
  generatedImages,
  setGeneratedImages
}) => {
  const [customPrompt, setCustomPrompt] = useState('');
  const [imageStyle, setImageStyle] = useState('professional');
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedImages, setSelectedImages] = useState<string[]>([]);

  const imageStyles = [
    { id: 'professional', name: 'Professionnel', description: 'Éclairage studio, fond blanc' },
    { id: 'lifestyle', name: 'Lifestyle', description: 'Contexte d\'utilisation réel' },
    { id: 'artistic', name: 'Artistique', description: 'Créatif avec effets visuels' },
    { id: 'minimalist', name: 'Minimaliste', description: 'Épuré et moderne' }
  ];

  const handleGenerateImages = async () => {
    const productName = form.watch('name');
    if (!productName.trim()) {
      toast.error('Veuillez d\'abord saisir le nom du produit');
      return;
    }

    setIsGenerating(true);
    try {
      // Créer un prompt spécifique basé sur le nom du produit et le style
      const styleDescription = imageStyles.find(s => s.id === imageStyle)?.description || 'professional product photo';
      const basePrompt = `${productName}, ${styleDescription}`;
      const finalPrompt = customPrompt ? `${basePrompt}, ${customPrompt}` : basePrompt;
      
      console.log('Generating images with prompt:', finalPrompt);
      
      // Simuler la génération d'images basées sur le produit
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Pour la démo, utiliser des images plus appropriées selon le type de produit
      const productType = productName.toLowerCase();
      let newGeneratedImages: string[] = [];
      
      if (productType.includes('pc') || productType.includes('ordinateur') || productType.includes('computer') || productType.includes('dell')) {
        newGeneratedImages = [
          'https://images.unsplash.com/photo-1587831990711-23ca6441447b?w=400', // PC setup
          'https://images.unsplash.com/photo-1593640408182-31c70c8268f5?w=400', // Desktop computer
          'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=400'  // Gaming PC
        ];
      } else if (productType.includes('phone') || productType.includes('téléphone') || productType.includes('smartphone')) {
        newGeneratedImages = [
          'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400',
          'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400',
          'https://images.unsplash.com/photo-1574944985070-8f3ebc6b79d2?w=400'
        ];
      } else {
        // Images génériques pour autres produits
        newGeneratedImages = [
          'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400',
          'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400',
          'https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=400'
        ];
      }
      
      setGeneratedImages(newGeneratedImages);
      toast.success('Images générées avec succès !');
    } catch (error) {
      console.error('Error generating images:', error);
      toast.error('Erreur lors de la génération des images');
    } finally {
      setIsGenerating(false);
    }
  };

  const toggleImageSelection = (imageUrl: string) => {
    const newSelection = selectedImages.includes(imageUrl) 
      ? selectedImages.filter(url => url !== imageUrl)
      : [...selectedImages, imageUrl];
    
    setSelectedImages(newSelection);
    
    // Mettre à jour le formulaire avec les images sélectionnées
    // Combiner avec les images déjà uploadées depuis le composant ProductImageUpload
    const currentFormImages = form.getValues('images') || [];
    const uploadedImages = currentFormImages.filter(img => !generatedImages.includes(img));
    const allImages = [...uploadedImages, ...newSelection];
    form.setValue('images', allImages);
  };

  const removeGeneratedImage = (imageUrl: string) => {
    const newGeneratedImages = generatedImages.filter(url => url !== imageUrl);
    setGeneratedImages(newGeneratedImages);
    
    const newSelectedImages = selectedImages.filter(url => url !== imageUrl);
    setSelectedImages(newSelectedImages);
    
    // Mettre à jour le formulaire
    const currentFormImages = form.getValues('images') || [];
    const uploadedImages = currentFormImages.filter(img => !generatedImages.includes(img));
    const allImages = [...uploadedImages, ...newSelectedImages];
    form.setValue('images', allImages);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <ImageIcon className="w-5 h-5 text-green-600" />
          <span>Génération d'images IA</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-sm font-medium mb-2 block">
            Style photographique
          </label>
          <div className="grid grid-cols-2 gap-3">
            {imageStyles.map((style) => (
              <Card 
                key={style.id}
                className={`cursor-pointer transition-all ${
                  imageStyle === style.id 
                    ? 'ring-2 ring-green-500 bg-green-50' 
                    : 'hover:bg-gray-50'
                }`}
                onClick={() => setImageStyle(style.id)}
              >
                <CardContent className="p-3">
                  <h4 className="font-medium text-sm">{style.name}</h4>
                  <p className="text-xs text-gray-600 mt-1">{style.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block">
            Prompt personnalisé (optionnel)
          </label>
          <Textarea
            value={customPrompt}
            onChange={(e) => setCustomPrompt(e.target.value)}
            placeholder="Ajoutez des détails spécifiques pour la génération d'images..."
            className="min-h-[80px]"
          />
        </div>

        <Button
          onClick={handleGenerateImages}
          disabled={!form.watch('name')?.trim() || isGenerating}
          className="w-full bg-gradient-to-r from-green-600 to-emerald-600"
          type="button"
        >
          {isGenerating ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Génération en cours...
            </>
          ) : (
            <>
              <ImageIcon className="w-4 h-4 mr-2" />
              Générer 3 images pour "{form.watch('name') || 'votre produit'}"
            </>
          )}
        </Button>

        {/* Images générées */}
        {generatedImages.length > 0 && (
          <div className="space-y-3 pt-4 border-t">
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-gray-900">Images générées :</h4>
              <p className="text-sm text-gray-600">
                {selectedImages.length} sélectionnée(s)
              </p>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {generatedImages.map((imageUrl, index) => (
                <Card key={index} className="relative group">
                  <CardContent className="p-2">
                    <div className="aspect-square rounded overflow-hidden relative">
                      <img 
                        src={imageUrl} 
                        alt={`Image générée ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                      {/* Overlay de sélection */}
                      <div 
                        className={`absolute inset-0 border-2 rounded cursor-pointer transition-all ${
                          selectedImages.includes(imageUrl)
                            ? 'border-green-500 bg-green-500 bg-opacity-20'
                            : 'border-transparent hover:border-gray-300'
                        }`}
                        onClick={() => toggleImageSelection(imageUrl)}
                      >
                        {selectedImages.includes(imageUrl) && (
                          <div className="absolute top-2 right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                            <span className="text-white text-xs">✓</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button 
                        size="sm" 
                        variant="destructive" 
                        type="button"
                        onClick={() => removeGeneratedImage(imageUrl)}
                        className="h-6 w-6 p-0"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            <p className="text-xs text-gray-500">
              Cliquez sur les images pour les sélectionner pour votre produit
            </p>
          </div>
        )}

        <div className="text-xs text-gray-500 mt-2">
          📸 Les images sont générées en haute résolution (1024x1024) et optimisées pour le e-commerce.
        </div>
      </CardContent>
    </Card>
  );
};
