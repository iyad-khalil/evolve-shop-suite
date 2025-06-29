
import { useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export const useVendorOrdersRealtime = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [realTimeChannel, setRealTimeChannel] = useState<any>(null);

  useEffect(() => {
    if (!user) {
      console.log('🔌 No user, skipping realtime setup');
      return;
    }

    console.log('🔄 === REALTIME SETUP ===');
    console.log('🔄 Setting up real-time channel for vendor:', user.id);

    const channel = supabase
      .channel('vendor-orders-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'vendor_orders',
          filter: `vendor_id=eq.${user.id}`
        },
        (payload) => {
          console.log('🔔 === REALTIME UPDATE ===');
          console.log('🔔 Real-time update received:', payload);
          console.log('🔔 Event type:', payload.eventType);
          console.log('🔔 New record:', payload.new);
          console.log('🔔 Old record:', payload.old);
          
          queryClient.invalidateQueries({ queryKey: ['vendor-orders', user.id] as const });
          
          if (payload.eventType === 'INSERT') {
            console.log('🎉 New vendor order received via realtime!');
            toast({
              title: "Nouvelle commande !",
              description: "Une nouvelle commande vient d'arriver",
            });
          }
        }
      )
      .subscribe((status) => {
        console.log('📡 === REALTIME STATUS ===');
        console.log('📡 Real-time subscription status:', status);
        
        if (status === 'SUBSCRIBED') {
          console.log('✅ Realtime successfully connected');
        } else if (status === 'CHANNEL_ERROR') {
          console.error('❌ Realtime channel error');
        } else if (status === 'TIMED_OUT') {
          console.error('⏰ Realtime connection timed out');
        } else if (status === 'CLOSED') {
          console.log('🔒 Realtime connection closed');
        }
      });

    setRealTimeChannel(channel);

    return () => {
      console.log('🔌 === REALTIME CLEANUP ===');
      console.log('🔌 Cleaning up real-time channel');
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [user, queryClient, toast]);

  return { realTimeChannel };
};
