
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
import { Progress } from '@/components/ui/progress';
import { 
  Save, 
  Sparkles, 
  Languages, 
  Image as ImageIcon, 
  BarChart3, 
  Upload,
  Wand2,
  Eye,
  Lightbulb,
  TrendingUp
} from 'lucide-react';
import { toast } from 'sonner';
import { AITranslation } from '@/components/vendor/ai/AITranslation';
import { AIDescriptionGenerator } from '@/components/vendor/ai/AIDescriptionGenerator';
import { AIImageGenerator } from '@/components/vendor/ai/AIImageGenerator';
import { AIPerformanceAnalysis } from '@/components/vendor/ai/AIPerformanceAnalysis';

interface ProductFormData {
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  category: string;
  stock: number;
  tags: string[];
  images: string[];
}

export const AddProduct: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('basic');
  const [isGeneratingDescription, setIsGeneratingDescription] = useState(false);
  const [isGeneratingImages, setIsGeneratingImages] = useState(false);
  const [performanceScore, setPerformanceScore] = useState<number | null>(null);
  
  const form = useForm<ProductFormData>({
    defaultValues: {
      name: '',
      description: '',
      price: 0,
      originalPrice: 0,
      category: '',
      stock: 0,
      tags: [],
      images: []
    }
  });

  const onSubmit = async (data: ProductFormData) => {
    try {
      // Simulation d'ajout du produit
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Produit ajouté avec succès !');
      navigate('/vendor/products');
    } catch (error) {
      toast.error('Erreur lors de l\'ajout du produit');
    }
  };

  const handleGenerateDescription = async (productName: string, characteristics: string[]) => {
    setIsGeneratingDescription(true);
    try {
      // Simulation de génération IA
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

  const handleGenerateImages = async (productName: string, description: string) => {
    setIsGeneratingImages(true);
    try {
      // Simulation de génération d'images IA
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
      // Simulation d'analyse prédictive
      await new Promise(resolve => setTimeout(resolve, 2000));
      const score = Math.floor(Math.random() * 30) + 70; // Score entre 70-100
      setPerformanceScore(score);
      toast.success('Analyse de performance terminée !');
    } catch (error) {
      toast.error('Erreur lors de l\'analyse');
    }
  };

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
          <Button onClick={form.handleSubmit(onSubmit)} className="bg-gradient-to-r from-blue-600 to-purple-600">
            <Save className="w-4 h-4 mr-2" />
            Enregistrer
          </Button>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="basic">Informations de base</TabsTrigger>
              <TabsTrigger value="ai-content">Contenu IA</TabsTrigger>
              <TabsTrigger value="ai-images">Images IA</TabsTrigger>
              <TabsTrigger value="analytics">Analyse Prédictive</TabsTrigger>
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
                        <FormLabel>Nom du produit</FormLabel>
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
                          <FormLabel>Prix (€)</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="0.00" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="stock"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Stock</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="0" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="category"
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
                            <SelectItem value="electronics">Électronique</SelectItem>
                            <SelectItem value="clothing">Vêtements</SelectItem>
                            <SelectItem value="home">Maison & Jardin</SelectItem>
                            <SelectItem value="books">Livres</SelectItem>
                            <SelectItem value="beauty">Beauté</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            {/* Onglet Contenu IA */}
            <TabsContent value="ai-content" className="space-y-6">
              <AIDescriptionGenerator 
                onGenerate={handleGenerateDescription}
                isGenerating={isGeneratingDescription}
                productName={form.watch('name')}
              />
              
              <AITranslation 
                originalText={form.watch('description')}
                onTranslationComplete={(translations) => {
                  console.log('Translations:', translations);
                  toast.success('Traductions générées !');
                }}
              />
            </TabsContent>

            {/* Onglet Images IA */}
            <TabsContent value="ai-images" className="space-y-6">
              <AIImageGenerator 
                onGenerate={handleGenerateImages}
                isGenerating={isGeneratingImages}
                productName={form.watch('name')}
                description={form.watch('description')}
              />
            </TabsContent>

            {/* Onglet Analyse Prédictive */}
            <TabsContent value="analytics" className="space-y-6">
              <AIPerformanceAnalysis 
                productData={{
                  name: form.watch('name'),
                  description: form.watch('description'),
                  price: form.watch('price'),
                  category: form.watch('category')
                }}
                onAnalyze={handleAnalyzePerformance}
                performanceScore={performanceScore}
              />
            </TabsContent>
          </Tabs>
        </form>
      </Form>
    </div>
  );
};

export default AddProduct;
