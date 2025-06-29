
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { VendorOrder, OrderStatusHistory } from '@/types/vendorOrder';

export const useVendorOrdersMutations = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Récupérer l'historique des statuts pour une commande
  const getOrderHistory = async (vendorOrderId: string): Promise<OrderStatusHistory[]> => {
    console.log('📜 Getting order history for:', vendorOrderId);
    
    const { data, error } = await supabase
      .from('order_status_history')
      .select('*')
      .eq('vendor_order_id', vendorOrderId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Error fetching order history:', error);
      throw error;
    }

    console.log('✅ Order history retrieved:', data?.length || 0, 'entries');
    return data as OrderStatusHistory[];
  };

  // Mutation pour mettre à jour le statut d'une commande
  const updateOrderStatusMutation = useMutation({
    mutationFn: async ({ 
      orderId, 
      status, 
      trackingNumber, 
      shippingCarrier, 
      notes 
    }: {
      orderId: string;
      status: VendorOrder['status'];
      trackingNumber?: string;
      shippingCarrier?: string;
      notes?: string;
    }) => {
      console.log('🔄 Updating order status:', { orderId, status, trackingNumber, shippingCarrier, notes });
      
      const updateData: any = { status };
      
      if (trackingNumber !== undefined) updateData.tracking_number = trackingNumber;
      if (shippingCarrier !== undefined) updateData.shipping_carrier = shippingCarrier;
      if (notes !== undefined) updateData.notes = notes;

      const { data, error } = await supabase
        .from('vendor_orders')
        .update(updateData)
        .eq('id', orderId)
        .eq('vendor_id', user?.id)
        .select()
        .single();

      if (error) {
        console.error('❌ Update order error:', error);
        throw error;
      }
      
      console.log('✅ Order updated successfully:', data);
      return data;
    },
    onSuccess: (data) => {
      console.log('🎉 Order update success:', data);
      queryClient.invalidateQueries({ queryKey: ['vendor-orders', user?.id] as const });
      toast({
        title: "Commande mise à jour",
        description: `Le statut a été changé vers "${data.status}"`,
      });
    },
    onError: (error) => {
      console.error('❌ Order update error:', error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour la commande",
        variant: "destructive",
      });
    }
  });

  return {
    updateOrderStatus: updateOrderStatusMutation.mutate,
    isUpdatingStatus: updateOrderStatusMutation.isPending,
    getOrderHistory
  };
};
