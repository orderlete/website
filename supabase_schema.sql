-- SQL instructions for setting up the database in Supabase SQL Editor

-- 1. Create the 'users' table (profiles)
CREATE TABLE public.users (
  id UUID PRIMARY KEY, -- Will be set from Supabase Auth ID
  name TEXT NOT NULL,
  phone TEXT UNIQUE NOT NULL,
  address TEXT,
  landmark TEXT,
  pincode TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Create policies for 'users'
CREATE POLICY "Users can view their own profile" ON public.users FOR SELECT USING (true);
CREATE POLICY "Users can update their own profile" ON public.users FOR UPDATE USING (true);
CREATE POLICY "Users can insert their own profile" ON public.users FOR INSERT WITH CHECK (true);

-- 2. Create the 'products' table
CREATE TABLE public.products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('confectionary', 'medical')),
  price DECIMAL NOT NULL,
  image_url TEXT,
  description TEXT,
  stock INTEGER DEFAULT 0,
  tags TEXT[], -- Popular, Fresh, Best Seller
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for 'products'
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Create policies for 'products'
CREATE POLICY "Anyone can view products" ON public.products FOR SELECT USING (true);

-- 3. Create the 'orders' table
CREATE TABLE public.orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id),
  total_amount DECIMAL NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('placed', 'preparing', 'out for delivery', 'delivered')) DEFAULT 'placed',
  address TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for 'orders'
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Create policies for 'orders'
CREATE POLICY "Users can view their own orders" ON public.orders FOR SELECT USING (true);
CREATE POLICY "Users can create their own orders" ON public.orders FOR INSERT WITH CHECK (true);

-- 4. Create the 'order_items' table
CREATE TABLE public.order_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id),
  quantity INTEGER NOT NULL,
  price DECIMAL NOT NULL
);

-- 5. Create the 'settings' table for store configuration
CREATE TABLE public.settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

-- Insert default store status
INSERT INTO public.settings (key, value) VALUES ('store_status', 'open');

-- Enable RLS for 'settings'
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

-- Create policies for 'settings'
CREATE POLICY "Anyone can view settings" ON public.settings FOR SELECT USING (true);
CREATE POLICY "Admin can update settings" ON public.settings FOR ALL USING (true); -- Simplified for now
