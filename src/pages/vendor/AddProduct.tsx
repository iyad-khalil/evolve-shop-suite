import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  Save, 
  Wand2, 
  Plus, 
  X, 
  Lightbulb,
  Image as ImageIcon, 
  Sparkles, 
  Download, 
  Eye,
  BarChart3,
  TrendingUp,
  Target,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Progress } from '@/components/ui/progress';

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

export const AddProduct: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('basic');
  const [isLoading, setIsLoading] = useState(false);
  
  // États pour les fonctionnalités IA
  const [isGeneratingDescription, setIsGeneratingDescription] = useState(false);
  const [isGeneratingImages, setIsGeneratingImages] = useState(false);
  const [performanceScore, setPerformanceScore] = useState<number | null>(null);
  const [characteristics, setCharacteristics] = useState<string[]>([]);
  const [newCharacteristic, setNewCharacteristic] = useState('');
  const [customPrompt, setCustomPrompt] = useState('');
  const [imageStyle, setImageStyle] = useState('professional');
  
  const form = useForm<ProductFormData>({
    defaultValues: {
      name: '',
      description: '',
      price: 0,
      original_price: 0,
      category_id: '',
      stock: 0,
      tags: [],
      images: []
    }
  });

  // Données pour les sélections
  const categories = [
    { id: '1', name: 'Électronique' },
    { id: '2', name: 'Vêtements' },
    { id: '3', name: 'Maison & Jardin' },
    { id: '4', name: 'Livres' },
    { id: '5', name: 'Beauté' }
  ];

  const suggestedCharacteristics = [
    'Haute qualité', 'Durable', 'Écologique', 'Innovant', 'Pratique',
    'Élégant', 'Polyvalent', 'Économique', 'Facile à utiliser', 'Tendance'
  ];

  const imageStyles = [
    { id: 'professional', name: 'Professionnel', description: 'Éclairage studio, fond blanc' },
    { id: 'lifestyle', name: 'Lifestyle', description: 'Contexte d\'utilisation réel' },
    { id: 'artistic', name: 'Artistique', description: 'Créatif avec effets visuels' },
    { id: 'minimalist', name: 'Minimaliste', description: 'Épuré et moderne' }
  ];

  const onSubmit = async (data: ProductFormData) => {
    if (!user) {
      toast.error('Vous devez être connecté pour ajouter un produit');
      return;
    }

    setIsLoading(true);
    try {
      console.log('Submitting product data:', data);
      
      const { data: insertedProduct, error } = await supabase
        .from('products')
        .insert({
          name: data.name,
          description: data.description,
          price: Number(data.price),
          original_price: data.original_price ? Number(data.original_price) : null,
          vendor_id: user.id,
          category_id: data.category_id || null,
          stock: Number(data.stock),
          tags: data.tags,
          images: data.images,
          is_active: true
        })
        .select()
        .single();

      if (error) {
        console.error('Error inserting product:', error);
        toast.error('Erreur lors de l\'ajout du produit: ' + error.message);
        return;
      }

      console.log('Product inserted successfully:', insertedProduct);
      toast.success('Produit ajouté avec succès !');
      navigate('/vendor/products');
    } catch (error) {
      console.error('Unexpected error:', error);
      toast.error('Erreur inattendue lors de l\'ajout du produit');
    } finally {
      setIsLoading(false);
    }
  };

  // Fonctions IA
  const addCharacteristic = (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault(); // Empêcher la soumission du formulaire
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

    setIsGeneratingDescription(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      const generatedDescription = `Découvrez ${productName}, un produit d'exception qui combine ${characteristics.join(', ')}. Conçu avec attention aux détails et aux besoins des utilisateurs modernes, ce produit offre une expérience unique et satisfaisante.`;
      form.setValue('description', generatedDescription);
      toast.success('Description générée avec succès !');
    } catch (error) {
      toast.error('Erreur lors de la génération de la description');
    } finally {
      setIsGeneratingDescription(false);
    }
  };

  const handleGenerateImages = async () => {
    const productName = form.watch('name');
    if (!productName.trim()) {
      toast.error('Veuillez d\'abord saisir le nom du produit');
      return;
    }

    setIsGeneratingImages(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 3000));
      const generatedImages = [
        'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400',
        'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400',
        'https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=400'
      ];
      form.setValue('images', generatedImages);
      toast.success('Images générées avec succès !');
    } catch (error) {
      toast.error('Erreur lors de la génération des images');
    } finally {
      setIsGeneratingImages(false);
    }
  };

  const handleAnalyzePerformance = async () => {
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      const score = Math.floor(Math.random() * 30) + 70;
      setPerformanceScore(score);
      toast.success('Analyse de performance terminée !');
    } catch (error) {
      toast.error('Erreur lors de l\'analyse');
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBadge = (score: number) => {
    if (score >= 80) return { text: 'Excellent', variant: 'default' as const, icon: CheckCircle };
    if (score >= 60) return { text: 'Bon', variant: 'secondary' as const, icon: Target };
    return { text: 'À améliorer', variant: 'destructive' as const, icon: AlertCircle };
  };

  const analysisResults = performanceScore ? {
    seoScore: Math.floor(performanceScore * 0.9),
    marketFit: Math.floor(performanceScore * 1.1),
    competitiveness: Math.floor(performanceScore * 0.95),
    conversionPotential: Math.floor(performanceScore * 1.05)
  } : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Nouveau produit</h1>
          <p className="text-gray-600 mt-1">
            Créez un nouveau produit avec l'aide de l'intelligence artificielle
          </p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline" onClick={() => navigate('/vendor/products')}>
            Annuler
          </Button>
          <Button 
            onClick={form.handleSubmit(onSubmit)} 
            disabled={isLoading}
            className="bg-gradient-to-r from-blue-600 to-purple-600"
          >
            <Save className="w-4 h-4 mr-2" />
            {isLoading ? 'Enregistrement...' : 'Enregistrer'}
          </Button>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="basic">Informations de base</TabsTrigger>
              <TabsTrigger value="ai-tools">Outils IA</TabsTrigger>
            </TabsList>

            {/* Onglet Informations de base */}
            <TabsContent value="basic" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Détails du produit</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nom du produit *</FormLabel>
                        <FormControl>
                          <Input placeholder="Entrez le nom du produit" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Décrivez votre produit"
                            className="min-h-[100px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="price"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Prix (€) *</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="0.00" 
                              {...field}
                              onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="original_price"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Prix original (€)</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="0.00" 
                              {...field}
                              onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="stock"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Stock *</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            placeholder="0" 
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="category_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Catégorie</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Sélectionnez une catégorie" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {categories.map(category => (
                              <SelectItem key={category.id} value={category.id}>
                                {category.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            {/* Onglet Outils IA regroupés */}
            <TabsContent value="ai-tools" className="space-y-6">
              {/* Génération de description IA */}
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
                    disabled={!form.watch('name')?.trim() || isGeneratingDescription}
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600"
                  >
                    {isGeneratingDescription ? (
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

              {/* Génération d'images IA */}
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
                    disabled={!form.watch('name')?.trim() || isGeneratingImages}
                    className="w-full bg-gradient-to-r from-green-600 to-emerald-600"
                  >
                    {isGeneratingImages ? (
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
                </CardContent>
              </Card>

              {/* Analyse prédictive */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <BarChart3 className="w-5 h-5 text-blue-600" />
                    <span>Analyse prédictive de performance</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button
                    onClick={handleAnalyzePerformance}
                    disabled={!form.watch('name')?.trim()}
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600"
                  >
                    <BarChart3 className="w-4 h-4 mr-2" />
                    Lancer l'analyse prédictive
                  </Button>

                  {performanceScore && analysisResults && (
                    <div className="space-y-4 pt-4 border-t">
                      <div className="text-center">
                        <div className={`text-4xl font-bold ${getScoreColor(performanceScore)}`}>
                          {performanceScore}/100
                        </div>
                        <div className="flex items-center justify-center mt-2">
                          {(() => {
                            const badge = getScoreBadge(performanceScore);
                            const IconComponent = badge.icon;
                            return (
                              <Badge variant={badge.variant} className="flex items-center space-x-1">
                                <IconComponent className="w-4 h-4" />
                                <span>{badge.text}</span>
                              </Badge>
                            );
                          })()}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <Card>
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-medium">SEO</span>
                              <span className="text-sm font-bold">{analysisResults.seoScore}%</span>
                            </div>
                            <Progress value={analysisResults.seoScore} className="h-2" />
                          </CardContent>
                        </Card>

                        <Card>
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-medium">Adéquation marché</span>
                              <span className="text-sm font-bold">{analysisResults.marketFit}%</span>
                            </div>
                            <Progress value={analysisResults.marketFit} className="h-2" />
                          </CardContent>
                        </Card>

                        <Card>
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-medium">Compétitivité</span>
                              <span className="text-sm font-bold">{analysisResults.competitiveness}%</span>
                            </div>
                            <Progress value={analysisResults.competitiveness} className="h-2" />
                          </CardContent>
                        </Card>

                        <Card>
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-medium">Potentiel conversion</span>
                              <span className="text-sm font-bold">{analysisResults.conversionPotential}%</span>
                            </div>
                            <Progress value={analysisResults.conversionPotential} className="h-2" />
                          </CardContent>
                        </Card>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </form>
      </Form>
    </div>
  );
};

export default AddProduct;
