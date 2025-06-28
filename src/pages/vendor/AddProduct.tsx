import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Save } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { ProductBasicInfo } from '@/components/vendor/ProductBasicInfo';
import { AIDescriptionGenerator } from '@/components/vendor/ai/AIDescriptionGenerator';
import { AIImageEnhancer } from '@/components/vendor/ai/AIImageEnhancer';
import { AIPerformanceAnalysis } from '@/components/vendor/ai/AIPerformanceAnalysis';
import { AITranslation } from '@/components/vendor/ai/AITranslation';

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
  const [enhancedImages, setEnhancedImages] = useState<string[]>([]);
  const [performanceScore, setPerformanceScore] = useState<number | null>(null);
  
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

  const onSubmit = async (data: ProductFormData) => {
    if (!user) {
      toast.error('Vous devez être connecté pour ajouter un produit');
      return;
    }

    // Validation des champs requis
    if (!data.name.trim()) {
      toast.error('Le nom du produit est requis');
      return;
    }

    if (data.price <= 0) {
      toast.error('Le prix doit être supérieur à 0');
      return;
    }

    if (data.stock < 0) {
      toast.error('Le stock ne peut pas être négatif');
      return;
    }

    setIsLoading(true);
    try {
      console.log('Submitting product data:', data);
      
      const { data: insertedProduct, error } = await supabase
        .from('products')
        .insert({
          name: data.name.trim(),
          description: data.description?.trim() || null,
          price: Number(data.price),
          original_price: data.original_price && data.original_price > 0 ? Number(data.original_price) : null,
          vendor_id: user.id,
          category_id: data.category_id || null,
          stock: Number(data.stock),
          tags: data.tags || [],
          images: data.images || [],
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    form.handleSubmit(onSubmit)(e);
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
          <Button 
            variant="outline" 
            onClick={() => navigate('/vendor/products')}
            disabled={isLoading}
            type="button"
          >
            Annuler
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={isLoading}
            className="bg-gradient-to-r from-blue-600 to-purple-600"
            type="button"
          >
            <Save className="w-4 h-4 mr-2" />
            {isLoading ? 'Enregistrement...' : 'Enregistrer'}
          </Button>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={handleSubmit} className="space-y-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="basic">Informations de base</TabsTrigger>
              <TabsTrigger value="ai-tools">Outils IA</TabsTrigger>
            </TabsList>

            {/* Onglet Informations de base */}
            <TabsContent value="basic" className="space-y-6">
              <ProductBasicInfo form={form} />
            </TabsContent>

            {/* Onglet Outils IA */}
            <TabsContent value="ai-tools" className="space-y-6">
              <AIDescriptionGenerator form={form} />
              
              <AIImageEnhancer 
                onImagesProcessed={(images) => {
                  setEnhancedImages(images);
                  // Combiner avec les images existantes du formulaire
                  const currentImages = form.getValues('images') || [];
                  form.setValue('images', [...currentImages, ...images]);
                }}
              />

              <AIPerformanceAnalysis 
                form={form}
                performanceScore={performanceScore}
                setPerformanceScore={setPerformanceScore}
              />

              <AITranslation 
                originalText={form.watch('description')} 
                onTranslationComplete={(translations) => {
                  console.log('Translations completed:', translations);
                }}
              />
            </TabsContent>
          </Tabs>
        </form>
      </Form>
    </div>
  );
};

export default AddProduct;
