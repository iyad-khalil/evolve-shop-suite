
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  original_price?: number;
  image: string;
  images?: string[];
  category: string;
  category_id?: string;
  stock: number;
  rating: number;
  reviews: number;
  reviews_count?: number;
  tags: string[];
  variants?: ProductVariant[];
  createdAt: Date;
  updatedAt: Date;
  created_at?: string;
  updated_at?: string;
  vendor_id?: string;
  is_active?: boolean;
  specifications?: ElectronicsSpecifications;
}

export interface ElectronicsSpecifications {
  brand?: string;
  model?: string;
  processor?: string;
  ram?: string;
  storage?: string;
  screen_size?: string;
  screen_resolution?: string;
  operating_system?: string;
  battery_life?: string;
  weight?: string;
  connectivity?: string[];
  warranty?: string;
  color?: string;
  dimensions?: string;
  ports?: string[];
  graphics?: string;
  camera?: string;
  sound?: string;
  material?: string;
  special_features?: string[];
}

export interface ProductVariant {
  id: string;
  name: string;
  value: string;
  price?: number;
  stock: number;
}

export interface Order {
  id: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  items: OrderItem[];
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  createdAt: Date;
  shippingAddress: Address;
}

export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  variant?: string;
}

export interface Address {
  street: string;
  city: string;
  postalCode: string;
  country: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  variant?: ProductVariant;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'vendor' | 'customer';
  avatar?: string;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  created_at?: string;
}
