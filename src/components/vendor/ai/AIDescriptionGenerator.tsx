
import React, { useState } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Wand2, Plus, X, Lightbulb } from 'lucide-react';
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

interface AIDescriptionGeneratorProps {
  form: UseFormReturn<ProductFormData>;
}

export const AIDescriptionGenerator: React.FC<AIDescriptionGeneratorProps> = ({ form }) => {
  const [characteristics, setCharacteristics] = useState<string[]>([]);
  const [newCharacteristic, setNewCharacteristic] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const suggestedCharacteristics = [
    'Haute qualité', 'Durable', 'Écologique', 'Innovant', 'Pratique',
    'Élégant', 'Polyvalent', 'Économique', 'Facile à utiliser', 'Tendance'
  ];

  const addCharacteristic = (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }
    if (newCharacteristic.trim() && !characteristics.includes(newCharacteristic.trim())) {
      setCharacteristics([...characteristics, newCharacteristic.trim()]);
      setNewCharacteristic('');
    }
  };

  const removeCharacteristic = (index: number) => {
    setCharacteristics(characteristics.filter((_, i) => i !== index));
  };

  const handleGenerateDescription = async () => {
    const productName = form.watch('name');
    if (!productName.trim()) {
      toast.error('Veuillez d\'abord saisir le nom du produit');
      return;
    }

    setIsGenerating(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      const generatedDescription = `Découvrez ${productName}, un produit d'exception qui combine ${characteristics.join(', ')}. Conçu avec attention aux détails et aux besoins des utilisateurs modernes, ce produit offre une expérience unique et satisfaisante.`;
      form.setValue('description', generatedDescription);
      toast.success('Description générée avec succès !');
    } catch (error) {
      toast.error('Erreur lors de la génération de la description');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Wand2 className="w-5 h-5 text-purple-600" />
          <span>Génération automatique de description</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-sm font-medium mb-2 block">
            Caractéristiques du produit
          </label>
          <div className="flex space-x-2 mb-3">
            <Input
              value={newCharacteristic}
              onChange={(e) => setNewCharacteristic(e.target.value)}
              placeholder="Ajouter une caractéristique"
              onKeyPress={(e) => e.key === 'Enter' && addCharacteristic(e)}
            />
            <Button 
              onClick={addCharacteristic} 
              size="sm" 
              variant="outline"
              type="button"
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
          
          {characteristics.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {characteristics.map((char, index) => (
                <Badge key={index} variant="secondary" className="flex items-center space-x-1">
                  <span>{char}</span>
                  <X 
                    className="w-3 h-3 cursor-pointer" 
                    onClick={() => removeCharacteristic(index)}
                  />
                </Badge>
              ))}
            </div>
          )}

          <div className="border-t pt-3">
            <p className="text-sm text-gray-600 mb-2 flex items-center">
              <Lightbulb className="w-4 h-4 mr-1" />
              Suggestions :
            </p>
            <div className="flex flex-wrap gap-2">
              {suggestedCharacteristics.map((suggestion) => (
                <Badge 
                  key={suggestion}
                  variant="outline" 
                  className="cursor-pointer hover:bg-purple-50"
                  onClick={() => {
                    if (!characteristics.includes(suggestion)) {
                      setCharacteristics([...characteristics, suggestion]);
                    }
                  }}
                >
                  {suggestion}
                </Badge>
              ))}
            </div>
          </div>
        </div>

        <Button
          onClick={handleGenerateDescription}
          disabled={!form.watch('name')?.trim() || isGenerating}
          className="w-full bg-gradient-to-r from-purple-600 to-pink-600"
          type="button"
        >
          {isGenerating ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Génération en cours...
            </>
          ) : (
            <>
              <Wand2 className="w-4 h-4 mr-2" />
              Générer la description
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};
