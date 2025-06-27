
-- Ajouter la colonne role à la table profiles si elle n'existe pas
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS role public.user_role NOT NULL DEFAULT 'customer';
