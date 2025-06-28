
export interface VendorInfo {
  id: string;
  business_name: string;
  business_description?: string;
  business_address?: string;
  is_verified: boolean;
  rating: number;
  total_sales: number;
}

export interface VendorOrderItem {
  id: string;
  vendor_id: string;
  vendor_info: VendorInfo;
  items: Array<{
    productId: string;
    productName: string;
    productImage?: string;
    price: number;
    quantity: number;
    variant?: {
      id: string;
      name: string;
      value: string;
    };
  }>;
  total_amount: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  created_at: string;
  updated_at: string;
}

export interface MultiVendorOrder {
  id: string;
  customer_id: string;
  customer_email: string;
  customer_name: string;
  shipping_address: any;
  vendor_orders: VendorOrderItem[];
  total_amount: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  created_at: string;
  updated_at: string;
}
