
-- Ajouter les colonnes manquantes à la table orders
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS customer_email TEXT NOT NULL DEFAULT '',
ADD COLUMN IF NOT EXISTS customer_name TEXT NOT NULL DEFAULT '',
ADD COLUMN IF NOT EXISTS items JSONB NOT NULL DEFAULT '[]'::jsonb;

-- Mettre à jour les colonnes existantes qui pourraient avoir des valeurs par défaut
UPDATE public.orders 
SET customer_email = COALESCE(customer_email, '')
WHERE customer_email IS NULL OR customer_email = '';

UPDATE public.orders 
SET customer_name = COALESCE(customer_name, '')
WHERE customer_name IS NULL OR customer_name = '';

UPDATE public.orders 
SET items = COALESCE(items, '[]'::jsonb)
WHERE items IS NULL;
