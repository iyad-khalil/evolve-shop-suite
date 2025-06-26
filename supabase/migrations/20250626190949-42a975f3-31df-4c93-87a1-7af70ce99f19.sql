
-- Create enum for user roles
CREATE TYPE public.user_role AS ENUM ('customer', 'vendor', 'admin');

-- Create profiles table for additional user information
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  first_name TEXT,
  last_name TEXT,
  phone TEXT,
  role user_role NOT NULL DEFAULT 'customer',
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create vendors table for vendor-specific information
CREATE TABLE public.vendors (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  business_name TEXT NOT NULL,
  business_description TEXT,
  business_address TEXT,
  tax_number TEXT,
  is_verified BOOLEAN DEFAULT FALSE,
  rating DECIMAL(3,2) DEFAULT 0,
  total_sales INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create categories table
CREATE TABLE public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create products table
CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  category_id UUID REFERENCES public.categories(id),
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL CHECK (price > 0),
  original_price DECIMAL(10,2),
  stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
  images TEXT[] DEFAULT '{}',
  tags TEXT[] DEFAULT '{}',
  is_active BOOLEAN DEFAULT TRUE,
  rating DECIMAL(3,2) DEFAULT 0,
  reviews_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create orders table
CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'shipped', 'delivered', 'cancelled')),
  total_amount DECIMAL(10,2) NOT NULL,
  shipping_address JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create order_items table
CREATE TABLE public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  vendor_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit_price DECIMAL(10,2) NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- RLS Policies for vendors
CREATE POLICY "Anyone can view verified vendors" ON public.vendors
  FOR SELECT USING (is_verified = true);

CREATE POLICY "Vendors can view their own data" ON public.vendors
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Vendors can update their own data" ON public.vendors
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Vendors can insert their own data" ON public.vendors
  FOR INSERT WITH CHECK (auth.uid() = id);

-- RLS Policies for categories
CREATE POLICY "Anyone can view categories" ON public.categories
  FOR SELECT TO authenticated, anon USING (true);

-- RLS Policies for products
CREATE POLICY "Anyone can view active products" ON public.products
  FOR SELECT TO authenticated, anon USING (is_active = true);

CREATE POLICY "Vendors can view their own products" ON public.products
  FOR SELECT USING (auth.uid() = vendor_id);

CREATE POLICY "Vendors can insert their own products" ON public.products
  FOR INSERT WITH CHECK (auth.uid() = vendor_id);

CREATE POLICY "Vendors can update their own products" ON public.products
  FOR UPDATE USING (auth.uid() = vendor_id);

CREATE POLICY "Vendors can delete their own products" ON public.products
  FOR DELETE USING (auth.uid() = vendor_id);

-- RLS Policies for orders
CREATE POLICY "Customers can view their own orders" ON public.orders
  FOR SELECT USING (auth.uid() = customer_id);

CREATE POLICY "Customers can insert their own orders" ON public.orders
  FOR INSERT WITH CHECK (auth.uid() = customer_id);

CREATE POLICY "Customers can update their own orders" ON public.orders
  FOR UPDATE USING (auth.uid() = customer_id);

-- RLS Policies for order_items
CREATE POLICY "Customers can view their order items" ON public.order_items
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM public.orders 
    WHERE orders.id = order_items.order_id 
    AND orders.customer_id = auth.uid()
  ));

CREATE POLICY "Vendors can view their order items" ON public.order_items
  FOR SELECT USING (auth.uid() = vendor_id);

-- Function to automatically create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, first_name, last_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'first_name',
    NEW.raw_user_meta_data->>'last_name',
    COALESCE(NEW.raw_user_meta_data->>'role', 'customer')::user_role
  );
  
  -- If user is a vendor, create vendor record
  IF (NEW.raw_user_meta_data->>'role' = 'vendor') THEN
    INSERT INTO public.vendors (id, business_name)
    VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'business_name', 'Mon entreprise'));
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to call the function on user creation
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Insert some default categories
INSERT INTO public.categories (name, description) VALUES
('Électronique', 'Téléphones, ordinateurs, électroménager'),
('Mode', 'Vêtements, chaussures, accessoires'),
('Maison & Jardin', 'Meubles, décoration, jardinage'),
('Sport & Loisirs', 'Équipements sportifs, jeux, loisirs'),
('Livres & Médias', 'Livres, films, musique'),
('Beauté & Santé', 'Cosmétiques, soins, bien-être');
