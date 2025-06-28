
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
import { AIImageGenerator } from '@/components/vendor/ai/AIImageGenerator';
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
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
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

    setIsLoading(true);
    try {
      console.log('Submitting product data:', data);
      
      // Inclure les images générées dans les données
      const productData = {
        ...data,
        images: generatedImages.length > 0 ? generatedImages : data.images
      };
      
      const { data: insertedProduct, error } = await supabase
        .from('products')
        .insert({
          name: productData.name,
          description: productData.description,
          price: Number(productData.price),
          original_price: productData.original_price ? Number(productData.original_price) : null,
          vendor_id: user.id,
          category_id: productData.category_id || null,
          stock: Number(productData.stock),
          tags: productData.tags,
          images: productData.images,
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
              <ProductBasicInfo form={form} />
            </TabsContent>

            {/* Onglet Outils IA */}
            <TabsContent value="ai-tools" className="space-y-6">
              <AIDescriptionGenerator form={form} />
              
              <AIImageGenerator 
                form={form}
                generatedImages={generatedImages}
                setGeneratedImages={setGeneratedImages}
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
