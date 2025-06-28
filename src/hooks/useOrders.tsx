
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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
        customerEmail: (order as any).customer_email || '',
        customerName: (order as any).customer_name || '',
        items: (order as any).items as OrderItem[] || [],
        totalAmount: Number(order.total_amount),
        shippingAddress: order.shipping_address as unknown as ShippingAddress,
        status: order.status as Order['status'],
        createdAt: order.created_at || '',
        updatedAt: order.updated_at || ''
      })) as Order[];
    },
    enabled: !!user
  });

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
      console.log('🚀 Creating order and payment with items:', items);

      // Étape 1: Créer d'abord la commande
      const orderItems: OrderItem[] = items.map((item: CartItem) => ({
        productId: item.product.id,
        productName: item.product.name,
        productImage: item.product.image,
        price: item.variant?.price || item.product.price,
        quantity: item.quantity,
        variant: item.variant ? {
          id: item.variant.id,
          name: item.variant.name,
          value: item.variant.value
        } : undefined
      }));

      const totalAmount = orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

      console.log('💰 Order total:', totalAmount);

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

      console.log('✅ Order created successfully:', orderData.id);

      setIsProcessingPayment(true);

      // Étape 2: Créer la session de paiement avec l'ID de commande
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
        description: "Une nouvelle fenêtre s'est ouverte pour finaliser votre paiement.",
      });

      // Invalider les requêtes pour rafraîchir les données
      queryClient.invalidateQueries({ queryKey: ['orders'] });

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

  // Créer une commande (fonction séparée si besoin)
  const createOrder = async (shippingAddress: ShippingAddress): Promise<string> => {
    if (!user) {
      throw new Error('Vous devez être connecté pour passer une commande');
    }

    if (items.length === 0) {
      throw new Error('Votre panier est vide');
    }

    try {
      // Convertir les items du panier en OrderItem
      const orderItems: OrderItem[] = items.map((item: CartItem) => ({
        productId: item.product.id,
        productName: item.product.name,
        productImage: item.product.image,
        price: item.variant?.price || item.product.price,
        quantity: item.quantity,
        variant: item.variant ? {
          id: item.variant.id,
          name: item.variant.name,
          value: item.variant.value
        } : undefined
      }));

      // Calculer le total
      const totalAmount = orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

      // Insérer la commande avec les types corrects
      const { data, error } = await supabase
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

      if (error) {
        console.error('Error creating order:', error);
        throw error;
      }

      // Vider le panier après la commande
      clearCart();

      // Invalider les requêtes pour rafraîchir les données
      queryClient.invalidateQueries({ queryKey: ['orders'] });

      toast({
        title: "Commande créée avec succès !",
        description: `Votre commande #${data.id.slice(0, 8)} a été enregistrée.`,
      });

      return data.id;
    } catch (error) {
      console.error('Error in createOrder:', error);
      toast({
        title: "Erreur lors de la création de la commande",
        description: error instanceof Error ? error.message : "Une erreur inattendue s'est produite",
        variant: "destructive",
      });
      throw error;
    }
  };

  // Créer une session de paiement Stripe (fonction indépendante)
  const createPaymentSession = async (orderId: string, currency: 'usd' | 'eur' | 'mad' = 'usd') => {
    try {
      const { data, error } = await supabase.functions.invoke('create-payment', {
        body: { orderId, currency }
      });

      if (error) {
        console.error('Payment session error:', error);
        throw error;
      }

      if (data.url) {
        // Ouvrir Stripe Checkout dans un nouvel onglet
        window.open(data.url, '_blank');
      }

      return data;
    } catch (error) {
      console.error('Error creating payment session:', error);
      toast({
        title: "Erreur de paiement",
        description: error instanceof Error ? error.message : "Impossible de créer la session de paiement",
        variant: "destructive",
      });
      throw error;
    }
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

  return {
    orders,
    isLoading,
    createOrder,
    createOrderAndPayment,
    createPaymentSession,
    verifyPayment,
    isCreatingOrder,
    isProcessingPayment
  };
};
