-- Migration script to add 'rating' and 'review_count' to products table

ALTER TABLE public.products ADD COLUMN IF NOT EXISTS rating DECIMAL DEFAULT 4.8;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS review_count INTEGER DEFAULT 15;
