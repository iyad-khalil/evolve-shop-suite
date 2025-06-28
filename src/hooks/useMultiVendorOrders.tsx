
import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { ShippingAddress } from '@/types/order';
import { CartItem } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { MultiVendorOrder, VendorOrderItem } from '@/types/vendor';

export const useMultiVendorOrders = () => {
  const { user } = useAuth();
  const { items, clearCart } = useCart();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  // Récupérer les commandes de l'utilisateur
  const { data: orders = [], isLoading } = useQuery({
    queryKey: ['multi-vendor-orders', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('customer_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching orders:', error);
        throw error;
      }

      return data.map(order => ({
        id: order.id,
        customer_id: order.customer_id,
        customer_email: order.customer_email || '',
        customer_name: order.customer_name || '',
        shipping_address: order.shipping_address,
        total_amount: Number(order.total_amount),
        status: order.status as any,
        created_at: order.created_at || '',
        updated_at: order.updated_at || '',
        vendor_orders: [] // Pour l'instant, on garde la structure simple
      })) as MultiVendorOrder[];
    },
    enabled: !!user
  });

  // Grouper les items du panier par vendeur
  const groupItemsByVendor = (cartItems: CartItem[]) => {
    const vendorGroups: { [vendorId: string]: CartItem[] } = {};
    
    cartItems.forEach(item => {
      const vendorId = item.product.vendor_id || 'unknown';
      if (!vendorGroups[vendorId]) {
        vendorGroups[vendorId] = [];
      }
      vendorGroups[vendorId].push(item);
    });
    
    return vendorGroups;
  };

  // Créer une commande multi-vendeurs avec paiement
  const createMultiVendorOrderAndPayment = async (
    shippingAddress: ShippingAddress, 
    currency: 'usd' | 'eur' | 'mad' = 'usd'
  ): Promise<void> => {
    if (!user) {
      throw new Error('Vous devez être connecté pour passer une commande');
    }

    if (items.length === 0) {
      throw new Error('Votre panier est vide');
    }

    setIsCreatingOrder(true);

    try {
      console.log('🚀 Creating multi-vendor order with items:', items);

      // Grouper les items par vendeur
      const vendorGroups = groupItemsByVendor(items);
      console.log('📦 Vendor groups:', vendorGroups);

      // Calculer le total général
      const totalAmount = items.reduce((sum, item) => 
        sum + ((item.variant?.price || item.product.price) * item.quantity), 0
      );

      // Créer les OrderItems pour la commande principale
      const orderItems = items.map((item: CartItem) => ({
        productId: item.product.id,
        productName: item.product.name,
        productImage: item.product.image,
        price: item.variant?.price || item.product.price,
        quantity: item.quantity,
        vendor_id: item.product.vendor_id,
        variant: item.variant ? {
          id: item.variant.id,
          name: item.variant.name,
          value: item.variant.value
        } : undefined
      }));

      console.log('💰 Total amount:', totalAmount);
      console.log('📝 Order items:', orderItems);

      // Créer la commande principale en base
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert({
          customer_id: user.id,
          customer_email: shippingAddress.email,
          customer_name: `${shippingAddress.firstName} ${shippingAddress.lastName}`,
          items: orderItems as any,
          total_amount: totalAmount,
          shipping_address: shippingAddress as any,
          status: 'pending'
        } as any)
        .select()
        .single();

      if (orderError) {
        console.error('❌ Error creating order:', orderError);
        throw new Error(`Erreur lors de la création de la commande: ${orderError.message}`);
      }

      console.log('✅ Multi-vendor order created successfully:', orderData.id);

      setIsProcessingPayment(true);

      // Créer la session de paiement
      console.log('💳 Creating payment session for order:', orderData.id);
      
      const { data: paymentData, error: paymentError } = await supabase.functions.invoke('create-payment', {
        body: { orderId: orderData.id, currency }
      });

      if (paymentError) {
        console.error('💥 Payment session error:', paymentError);
        throw new Error(`Erreur lors de la création du paiement: ${paymentError.message}`);
      }

      if (!paymentData?.url) {
        throw new Error('URL de paiement non reçue');
      }

      console.log('✅ Payment session created, redirecting to:', paymentData.url);

      // Ouvrir Stripe Checkout dans un nouvel onglet
      window.open(paymentData.url, '_blank');
      
      toast({
        title: "Commande créée avec succès !",
        description: `Votre commande avec ${Object.keys(vendorGroups).length} vendeur(s) a été créée. Une nouvelle fenêtre s'est ouverte pour finaliser votre paiement.`,
      });

      // Invalider les requêtes pour rafraîchir les données
      queryClient.invalidateQueries({ queryKey: ['multi-vendor-orders'] });

    } catch (error) {
      console.error('💥 Error in createMultiVendorOrderAndPayment:', error);
      toast({
        title: "Erreur lors de la commande",
        description: error instanceof Error ? error.message : "Une erreur inattendue s'est produite",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsCreatingOrder(false);
      setIsProcessingPayment(false);
    }
  };

  return {
    orders,
    isLoading,
    createMultiVendorOrderAndPayment,
    isCreatingOrder,
    isProcessingPayment,
    groupItemsByVendor
  };
};
