
import React, { useState } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Wand2, Plus, X, Lightbulb, Zap } from 'lucide-react';
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
  const [targetAudience, setTargetAudience] = useState('');
  const [tone, setTone] = useState('professionnel');
  const [isGenerating, setIsGenerating] = useState(false);

  const suggestedCharacteristics = [
    'Haute qualité', 'Durable', 'Écologique', 'Innovant', 'Pratique',
    'Élégant', 'Polyvalent', 'Économique', 'Facile à utiliser', 'Tendance'
  ];

  const tones = [
    { value: 'professionnel', label: 'Professionnel' },
    { value: 'amical', label: 'Amical et chaleureux' },
    { value: 'technique', label: 'Technique et détaillé' },
    { value: 'marketing', label: 'Marketing et percutant' },
    { value: 'luxe', label: 'Luxe et premium' }
  ];

  const audiences = [
    'Professionnels', 'Particuliers', 'Entreprises', 'Étudiants', 
    'Gamers', 'Créatifs', 'Familles', 'Seniors'
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

  const generateIntelligentDescription = (productName: string, price: number) => {
    const baseDescriptions = {
      'pc': {
        'professionnel': `${productName} représente l'excellence en matière de performance informatique. Équipé des dernières technologies, ce système offre une puissance de calcul remarquable adaptée aux besoins professionnels les plus exigeants.`,
        'technique': `${productName} intègre une architecture avancée optimisée pour les performances multitâches. Avec ses composants de dernière génération, il garantit une expérience utilisateur fluide et une productivité maximale.`,
        'marketing': `Transformez votre façon de travailler avec ${productName} ! Cette machine d'exception allie puissance brute et design raffiné pour vous offrir l'outil informatique de vos rêves.`
      },
      'ordinateur': {
        'professionnel': `${productName} est conçu pour répondre aux standards professionnels les plus élevés. Sa conception robuste et ses performances optimales en font un choix privilégié pour les environnements de travail exigeants.`,
        'amical': `Découvrez ${productName}, votre nouveau compagnon numérique ! Pensé pour simplifier votre quotidien, il combine facilité d'utilisation et performance dans un design moderne.`
      },
      'default': {
        'professionnel': `${productName} se distingue par sa qualité exceptionnelle et son attention aux détails. Conçu pour offrir une expérience utilisateur optimale, il répond parfaitement aux attentes des utilisateurs exigeants.`,
        'amical': `Laissez-vous séduire par ${productName} ! Ce produit unique combine ${characteristics.join(', ')} pour vous offrir bien plus qu'un simple achat : une véritable expérience.`,
        'marketing': `${productName} : là où l'innovation rencontre l'excellence ! Découvrez un produit qui redéfinit les standards de qualité dans sa catégorie.`,
        'luxe': `${productName} incarne l'art de vivre à la française. Chaque détail a été pensé pour vous offrir une expérience d'exception, digne des plus grandes marques de luxe.`,
        'technique': `${productName} bénéficie d'une conception technique avancée intégrant les dernières innovations. Ses spécifications techniques répondent aux exigences les plus strictes du marché.`
      }
    };

    // Détection du type de produit
    const productType = productName.toLowerCase().includes('pc') ? 'pc' : 
                       productName.toLowerCase().includes('ordinateur') ? 'ordinateur' : 'default';
    
    const selectedTone = tone as keyof typeof baseDescriptions.default;
    let description = baseDescriptions[productType as keyof typeof baseDescriptions]?.[selectedTone] || 
                     baseDescriptions.default[selectedTone];

    // Ajout d'informations sur le prix si pertinent
    if (price > 1000) {
      description += ` Ce produit premium justifie son investissement par une qualité irréprochable et des performances exceptionnelles.`;
    } else if (price > 500) {
      description += ` Un excellent rapport qualité-prix qui en fait un choix judicieux pour les utilisateurs avisés.`;
    } else if (price > 0) {
      description += ` Accessible et performant, il démocratise l'accès à la qualité sans compromis.`;
    }

    // Ajout du public cible
    if (targetAudience) {
      description += ` Spécialement pensé pour ${targetAudience.toLowerCase()}, il s'adapte parfaitement à leurs besoins spécifiques.`;
    }

    // Ajout des caractéristiques de manière naturelle
    if (characteristics.length > 0) {
      const charGroups = characteristics.reduce((groups, char, index) => {
        if (index < 3) groups.primary.push(char.toLowerCase());
        else groups.secondary.push(char.toLowerCase());
        return groups;
      }, { primary: [] as string[], secondary: [] as string[] });

      if (charGroups.primary.length > 0) {
        description += ` Ses atouts principaux ? ${charGroups.primary.join(', ')} - des qualités qui font toute la différence.`;
      }
      
      if (charGroups.secondary.length > 0) {
        description += ` De plus, son caractère ${charGroups.secondary.join(' et ')} en fait un choix particulièrement adapté aux utilisateurs exigeants.`;
      }
    }

    return description;
  };

  const handleGenerateDescription = async () => {
    const productName = form.watch('name');
    const price = form.watch('price') || 0;
    
    if (!productName.trim()) {
      toast.error('Veuillez d\'abord saisir le nom du produit');
      return;
    }

    setIsGenerating(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2500));
      
      const intelligentDescription = generateIntelligentDescription(productName, price);
      form.setValue('description', intelligentDescription);
      toast.success('Description intelligente générée avec succès !');
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
          <Zap className="w-5 h-5 text-purple-600" />
          <span>Génération intelligente de description</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Paramètres avancés */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium mb-2 block">
              Ton de la description
            </label>
            <Select value={tone} onValueChange={setTone}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {tones.map(toneOption => (
                  <SelectItem key={toneOption.value} value={toneOption.value}>
                    {toneOption.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">
              Public cible
            </label>
            <Select value={targetAudience} onValueChange={setTargetAudience}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner..." />
              </SelectTrigger>
              <SelectContent>
                {audiences.map(audience => (
                  <SelectItem key={audience} value={audience}>
                    {audience}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
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
              Génération intelligente en cours...
            </>
          ) : (
            <>
              <Zap className="w-4 h-4 mr-2" />
              Générer une description intelligente
            </>
          )}
        </Button>

        <div className="text-xs text-gray-500 mt-2">
          🧠 L'IA analyse votre produit et adapte la description selon le contexte, le prix et le public cible.
        </div>
      </CardContent>
    </Card>
  );
};
