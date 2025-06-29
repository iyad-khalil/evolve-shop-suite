
export interface VendorOrder {
  id: string;
  vendor_id: string;
  order_id: string;
  items: any[];
  subtotal: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  tracking_number?: string;
  shipping_carrier?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  // Données de la commande principale
  customer_name: string;
  customer_email: string;
  shipping_address: any;
}

export interface OrderStatusHistory {
  id: string;
  vendor_order_id: string;
  old_status?: string;
  new_status: string;
  changed_by: string;
  notes?: string;
  created_at: string;
}

export interface OrderStats {
  total: number;
  pending: number;
  processing: number;
  shipped: number;
  delivered: number;
  cancelled: number;
  totalRevenue: number;
}
