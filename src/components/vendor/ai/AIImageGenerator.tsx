
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Image as ImageIcon, Sparkles, Download, Eye, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface AIImageGeneratorProps {
  onGenerate: (productName: string, description: string) => void;
  isGenerating: boolean;
  productName: string;
  description: string;
}

export const AIImageGenerator: React.FC<AIImageGeneratorProps> = ({
  onGenerate,
  isGenerating,
  productName,
  description
}) => {
  const [customPrompt, setCustomPrompt] = useState('');
  const [imageStyle, setImageStyle] = useState('professional');
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);

  const imageStyles = [
    { id: 'professional', name: 'Professionnel', description: 'Éclairage studio, fond blanc' },
    { id: 'lifestyle', name: 'Lifestyle', description: 'Contexte d\'utilisation réel' },
    { id: 'artistic', name: 'Artistique', description: 'Créatif avec effets visuels' },
    { id: 'minimalist', name: 'Minimaliste', description: 'Épuré et moderne' }
  ];

  const handleGenerate = () => {
    if (!productName.trim()) {
      toast.error('Veuillez d\'abord saisir le nom du produit');
      return;
    }
    onGenerate(productName, description);
  };

  const handleStyleChange = (styleId: string) => {
    setImageStyle(styleId);
  };

  const removeImage = (index: number) => {
    setGeneratedImages(generatedImages.filter((_, i) => i !== index));
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
            Produit à photographier
          </label>
          <p className="text-gray-600 text-sm bg-gray-50 p-2 rounded">
            {productName || 'Nom du produit non défini'}
          </p>
        </div>

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
                onClick={() => handleStyleChange(style.id)}
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
          <p className="text-xs text-gray-500 mt-1">
            Ex: "avec des reflets dorés", "sur une table en bois", "avec des accessoires"
          </p>
        </div>

        <div className="bg-blue-50 p-3 rounded-lg">
          <h4 className="font-medium text-sm mb-2 flex items-center">
            <Sparkles className="w-4 h-4 mr-1 text-blue-600" />
            Aperçu du prompt IA :
          </h4>
          <p className="text-sm text-gray-700">
            "Professional product photography of {productName}, {imageStyles.find(s => s.id === imageStyle)?.description.toLowerCase()}, 
            high quality, commercial style{customPrompt ? `, ${customPrompt}` : ''}"
          </p>
        </div>

        <Button
          onClick={handleGenerate}
          disabled={!productName.trim() || isGenerating}
          className="w-full bg-gradient-to-r from-green-600 to-emerald-600"
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

        {/* Images générées simulées */}
        {!isGenerating && (
          <div className="space-y-3 pt-4 border-t">
            <h4 className="font-medium text-gray-900">Images générées :</h4>
            <div className="grid grid-cols-3 gap-3">
              {[1, 2, 3].map((index) => (
                <Card key={index} className="relative group">
                  <CardContent className="p-2">
                    <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 rounded flex items-center justify-center">
                      <ImageIcon className="w-8 h-8 text-gray-400" />
                    </div>
                    <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity rounded flex items-center justify-center space-x-2">
                      <Button size="sm" variant="secondary">
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="secondary">
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
