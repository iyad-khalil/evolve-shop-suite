
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
        customerEmail: order.customer_email,
        customerName: order.customer_name,
        items: order.items as OrderItem[],
        totalAmount: Number(order.total_amount),
        shippingAddress: order.shipping_address as ShippingAddress,
        status: order.status,
        createdAt: order.created_at,
        updatedAt: order.updated_at
      })) as Order[];
    },
    enabled: !!user
  });

  // Créer une commande
  const createOrder = async (shippingAddress: ShippingAddress): Promise<string> => {
    if (!user) {
      throw new Error('Vous devez être connecté pour passer une commande');
    }

    if (items.length === 0) {
      throw new Error('Votre panier est vide');
    }

    setIsCreatingOrder(true);

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

      // Insérer la commande
      const { data, error } = await supabase
        .from('orders')
        .insert({
          customer_id: user.id,
          customer_email: shippingAddress.email,
          customer_name: `${shippingAddress.firstName} ${shippingAddress.lastName}`,
          items: orderItems,
          total_amount: totalAmount,
          shipping_address: shippingAddress,
          status: 'pending'
        })
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
    } finally {
      setIsCreatingOrder(false);
    }
  };

  return {
    orders,
    isLoading,
    createOrder,
    isCreatingOrder
  };
};
