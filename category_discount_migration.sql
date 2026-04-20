-- Migration script to add 'discount_percent' to categories table

-- Add discount_percent column to the categories table
ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS discount_percent INTEGER DEFAULT 0;

-- Ensure discount is between 0 and 100
ALTER TABLE public.categories ADD CONSTRAINT check_discount_percent CHECK (discount_percent >= 0 AND discount_percent <= 100);
