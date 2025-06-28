
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Product, ElectronicsSpecifications } from '@/types';
import { toast } from 'sonner';
import ProductBreadcrumb from '@/components/product/ProductBreadcrumb';
import ProductImageGallery from '@/components/product/ProductImageGallery';
import ProductInfo from '@/components/product/ProductInfo';
import ProductActions from '@/components/product/ProductActions';
import ProductTabs from '@/components/product/ProductTabs';

const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { user } = useAuth();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    if (id) {
      fetchProduct(id);
    }
  }, [id]);

  const fetchProduct = async (productId: string) => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          categories (
            id,
            name,
            description
          )
        `)
        .eq('id', productId)
        .eq('is_active', true)
        .single();

      if (error) {
        console.error('Error fetching product:', error);
        toast.error('Erreur lors du chargement du produit');
        navigate('/products');
        return;
      }

      if (data) {
        // Type assertion pour gérer les propriétés qui pourraient ne pas être dans les types générés
        const productData = data as any;
        
        const formattedProduct: Product = {
          id: productData.id,
          name: productData.name,
          description: productData.description || '',
          price: productData.price,
          originalPrice: productData.original_price,
          image: productData.images?.[0] || '/placeholder.svg',
          images: productData.images || ['/placeholder.svg'],
          category: productData.categories?.name || 'Électronique',
          stock: productData.stock,
          rating: productData.rating || 4.5,
          reviews: productData.reviews_count || 0,
          tags: productData.tags || [],
          createdAt: new Date(productData.created_at),
          updatedAt: new Date(productData.updated_at),
          specifications: (productData.specifications as ElectronicsSpecifications) || {}
        };
        setProduct(formattedProduct);
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Erreur lors du chargement du produit');
      navigate('/products');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    if (product && product.stock > 0) {
      addToCart(product);
      toast.success('Produit ajouté au panier !');
    }
  };

  const handleToggleFavorite = () => {
    setIsFavorite(!isFavorite);
    toast.success(isFavorite ? 'Retiré des favoris' : 'Ajouté aux favoris');
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: product?.name,
        text: `Découvrez ce produit : ${product?.name}`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Lien copié dans le presse-papiers');
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="aspect-square bg-gray-200 rounded-lg"></div>
            <div className="space-y-4">
              <div className="h-8 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-6 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Produit non trouvé</h1>
        <Button onClick={() => navigate('/products')}>
          Retour aux produits
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <ProductBreadcrumb
        productName={product.name}
        category={product.category}
        onNavigateBack={() => navigate('/products')}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <ProductImageGallery
          images={product.images || [product.image]}
          productName={product.name}
          selectedImage={selectedImage}
          onImageSelect={setSelectedImage}
        />

        <div className="space-y-6">
          <ProductInfo product={product} />
          <ProductActions
            product={product}
            isFavorite={isFavorite}
            onAddToCart={handleAddToCart}
            onToggleFavorite={handleToggleFavorite}
            onShare={handleShare}
          />
        </div>
      </div>

      <ProductTabs product={product} user={user} />
    </div>
  );
};

export default ProductDetail;
