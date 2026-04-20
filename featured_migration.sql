-- Migration script to add 'featured' and 'sales_count' functionality to Orderlete

-- 1. Update the 'products' table
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS featured_priority INTEGER DEFAULT 0;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS sales_count INTEGER DEFAULT 0;

-- 2. Update the 'categories' table
ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false;
ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS featured_priority INTEGER DEFAULT 0;
