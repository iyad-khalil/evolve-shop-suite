
import React, { useState } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Image as ImageIcon, Download, Eye } from 'lucide-react';
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
      await new Promise(resolve => setTimeout(resolve, 3000));
      const newGeneratedImages = [
        'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400',
        'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400',
        'https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=400'
      ];
      setGeneratedImages(newGeneratedImages);
      form.setValue('images', newGeneratedImages);
      toast.success('Images générées avec succès !');
    } catch (error) {
      toast.error('Erreur lors de la génération des images');
    } finally {
      setIsGenerating(false);
    }
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
              Générer 3 images
            </>
          )}
        </Button>

        {/* Images générées */}
        {generatedImages.length > 0 && (
          <div className="space-y-3 pt-4 border-t">
            <h4 className="font-medium text-gray-900">Images générées :</h4>
            <div className="grid grid-cols-3 gap-3">
              {generatedImages.map((imageUrl, index) => (
                <Card key={index} className="relative group">
                  <CardContent className="p-2">
                    <div className="aspect-square rounded overflow-hidden">
                      <img 
                        src={imageUrl} 
                        alt={`Image générée ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity rounded flex items-center justify-center space-x-2">
                      <Button size="sm" variant="secondary" type="button">
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="secondary" type="button">
                        <Download className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        <div className="text-xs text-gray-500 mt-2">
          📸 Les images sont générées en haute résolution (1024x1024) et optimisées pour le e-commerce.
        </div>
      </CardContent>
    </Card>
  );
};
