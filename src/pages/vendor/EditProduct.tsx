
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { Save, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { ProductBasicInfo } from '@/components/vendor/ProductBasicInfo';

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

export const EditProduct: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [loadingProduct, setLoadingProduct] = useState(true);
  
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

  useEffect(() => {
    if (id) {
      fetchProduct(id);
    }
  }, [id]);

  const fetchProduct = async (productId: string) => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', productId)
        .eq('vendor_id', user?.id)
        .single();

      if (error) {
        console.error('Error fetching product:', error);
        toast.error('Erreur lors du chargement du produit');
        navigate('/vendor/products');
        return;
      }

      if (data) {
        form.reset({
          name: data.name,
          description: data.description || '',
          price: data.price,
          original_price: data.original_price || 0,
          category_id: data.category_id || '',
          stock: data.stock,
          tags: data.tags || [],
          images: data.images || []
        });
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Erreur lors du chargement du produit');
      navigate('/vendor/products');
    } finally {
      setLoadingProduct(false);
    }
  };

  const onSubmit = async (data: ProductFormData) => {
    if (!user || !id) {
      toast.error('Erreur d\'authentification');
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
      console.log('Updating product data:', data);
      
      const { error } = await supabase
        .from('products')
        .update({
          name: data.name.trim(),
          description: data.description?.trim() || null,
          price: Number(data.price),
          original_price: data.original_price && data.original_price > 0 ? Number(data.original_price) : null,
          category_id: data.category_id || null,
          stock: Number(data.stock),
          tags: data.tags || [],
          images: data.images || [],
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .eq('vendor_id', user.id);

      if (error) {
        console.error('Error updating product:', error);
        toast.error('Erreur lors de la modification du produit: ' + error.message);
        return;
      }

      console.log('Product updated successfully');
      toast.success('Produit modifié avec succès !');
      navigate('/vendor/products');
    } catch (error) {
      console.error('Unexpected error:', error);
      toast.error('Erreur inattendue lors de la modification du produit');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    form.handleSubmit(onSubmit)(e);
  };

  if (loadingProduct) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded mb-4 w-1/3"></div>
          <div className="space-y-4">
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => navigate('/vendor/products')}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Modifier le produit</h1>
            <p className="text-gray-600 mt-1">
              Modifiez les informations de votre produit
            </p>
          </div>
        </div>
        <div className="flex space-x-3">
          <Button 
            variant="outline" 
            onClick={() => navigate('/vendor/products')}
            disabled={isLoading}
          >
            Annuler
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={isLoading}
          >
            <Save className="w-4 h-4 mr-2" />
            {isLoading ? 'Enregistrement...' : 'Enregistrer'}
          </Button>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={handleSubmit}>
          <ProductBasicInfo form={form} />
        </form>
      </Form>
    </div>
  );
};

export default EditProduct;
