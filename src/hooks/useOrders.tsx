import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { ShippingAddress, Order, OrderItem } from '@/types/order';
import { CartItem } from '@/types';
import { useToast } from '@/hooks/use-toast';

export const useOrders = () => {
  const { user } = useAuth();
  const { items, clearCart } = useCart();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  // Récupérer les commandes de l'utilisateur
  const { data: orders = [], isLoading } = useQuery({
    queryKey: ['orders', user?.id],
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
        customerId: order.customer_id,
        customerEmail: order.customer_email || '',
        customerName: order.customer_name || '',
        items: (order.items as unknown as OrderItem[]) || [],
        totalAmount: Number(order.total_amount),
        shippingAddress: order.shipping_address as unknown as ShippingAddress,
        status: order.status as Order['status'],
        createdAt: order.created_at || '',
        updatedAt: order.updated_at || ''
      })) as Order[];
    },
    enabled: !!user
  });

  // Analyser les items du panier pour identifier les vendeurs
  const analyzeCartVendors = () => {
    const vendorGroups: { [vendorId: string]: CartItem[] } = {};
    const vendorInfo: { [vendorId: string]: { name: string; count: number; total: number } } = {};
    
    items.forEach(item => {
      const vendorId = item.product.vendor_id || 'unknown';
      if (!vendorGroups[vendorId]) {
        vendorGroups[vendorId] = [];
      }
      vendorGroups[vendorId].push(item);
      
      if (!vendorInfo[vendorId]) {
        vendorInfo[vendorId] = { name: `Vendeur ${vendorId.slice(0, 8)}`, count: 0, total: 0 };
      }
      vendorInfo[vendorId].count += item.quantity;
      vendorInfo[vendorId].total += (item.variant?.price || item.product.price) * item.quantity;
    });

    return { vendorGroups, vendorInfo };
  };

  // Vérifier le statut du paiement
  const verifyPayment = async (sessionId: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('verify-payment', {
        body: { sessionId }
      });

      if (error) {
        throw error;
      }

      if (data.status === 'paid') {
        // Vider le panier après paiement réussi
        clearCart();
        
        // Invalider les requêtes
        queryClient.invalidateQueries({ queryKey: ['orders'] });
        
        toast({
          title: "Paiement confirmé !",
          description: "Votre commande a été payée avec succès.",
        });
      }

      return data;
    } catch (error) {
      console.error('Error verifying payment:', error);
      toast({
        title: "Erreur de vérification",
        description: "Impossible de vérifier le statut du paiement",
        variant: "destructive",
      });
      throw error;
    }
  };

  // Créer une commande ET créer le paiement en une seule action
  const createOrderAndPayment = async (
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

      // Analyser les vendeurs impliqués
      const { vendorGroups, vendorInfo } = analyzeCartVendors();
      const vendorCount = Object.keys(vendorGroups).length;
      
      console.log('🏪 Vendors involved:', vendorCount, vendorInfo);

      // Créer les OrderItems avec informations vendeur
      const orderItems: OrderItem[] = items.map((item: CartItem) => ({
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

      const totalAmount = orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

      console.log('💰 Order total:', totalAmount);
      console.log('🏪 Number of vendors:', vendorCount);

      // Créer la commande en base
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
      console.log('🎯 Order created, trigger should automatically call process-vendor-orders');

      // Attendre un peu pour que le trigger fasse son travail
      await new Promise(resolve => setTimeout(resolve, 2000));

      setIsProcessingPayment(true);

      // Créer la session de paiement avec l'ID de commande
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
        description: `Votre commande impliquant ${vendorCount} vendeur${vendorCount > 1 ? 's' : ''} a été créée. Un trigger automatique traite les commandes vendeur.`,
      });

      // Invalider les requêtes pour rafraîchir les données
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['vendor-orders'] });

    } catch (error) {
      console.error('💥 Error in createOrderAndPayment:', error);
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
    createOrderAndPayment,
    isCreatingOrder,
    isProcessingPayment,
    analyzeCartVendors,
    verifyPayment
  };
};
