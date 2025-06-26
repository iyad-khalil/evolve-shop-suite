
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Wand2, Plus, X, Lightbulb } from 'lucide-react';

interface AIDescriptionGeneratorProps {
  onGenerate: (productName: string, characteristics: string[]) => void;
  isGenerating: boolean;
  productName: string;
}

export const AIDescriptionGenerator: React.FC<AIDescriptionGeneratorProps> = ({
  onGenerate,
  isGenerating,
  productName
}) => {
  const [characteristics, setCharacteristics] = useState<string[]>([]);
  const [newCharacteristic, setNewCharacteristic] = useState('');

  const addCharacteristic = () => {
    if (newCharacteristic.trim() && !characteristics.includes(newCharacteristic.trim())) {
      setCharacteristics([...characteristics, newCharacteristic.trim()]);
      setNewCharacteristic('');
    }
  };

  const removeCharacteristic = (index: number) => {
    setCharacteristics(characteristics.filter((_, i) => i !== index));
  };

  const handleGenerate = () => {
    if (productName.trim()) {
      onGenerate(productName, characteristics);
    }
  };

  const suggestedCharacteristics = [
    'Haute qualité', 'Durable', 'Écologique', 'Innovant', 'Pratique',
    'Élégant', 'Polyvalent', 'Économique', 'Facile à utiliser', 'Tendance'
  ];

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
            Nom du produit
          </label>
          <p className="text-gray-600 text-sm">
            {productName || 'Veuillez d\'abord saisir le nom du produit dans l\'onglet "Informations de base"'}
          </p>
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block">
            Caractéristiques du produit
          </label>
          <div className="flex space-x-2 mb-3">
            <Input
              value={newCharacteristic}
              onChange={(e) => setNewCharacteristic(e.target.value)}
              placeholder="Ajouter une caractéristique"
              onKeyPress={(e) => e.key === 'Enter' && addCharacteristic()}
            />
            <Button onClick={addCharacteristic} size="sm" variant="outline">
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
          onClick={handleGenerate}
          disabled={!productName.trim() || isGenerating}
          className="w-full bg-gradient-to-r from-purple-600 to-pink-600"
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

        <div className="text-xs text-gray-500 mt-2">
          💡 L'IA analysera le nom et les caractéristiques pour créer une description optimisée pour le SEO et les ventes.
        </div>
      </CardContent>
    </Card>
  );
};
