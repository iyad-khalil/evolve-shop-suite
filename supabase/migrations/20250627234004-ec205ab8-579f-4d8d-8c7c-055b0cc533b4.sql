
-- Supprimer les objets existants s'ils existent pour éviter les conflits
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();
DROP TYPE IF EXISTS public.user_role CASCADE;

-- Créer le type user_role
CREATE TYPE public.user_role AS ENUM ('customer', 'vendor', 'admin');

-- Recréer la fonction handle_new_user
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
  
  -- Si l'utilisateur est un vendeur, créer un enregistrement vendeur
  IF (NEW.raw_user_meta_data->>'role' = 'vendor') THEN
    INSERT INTO public.vendors (id, business_name)
    VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'business_name', 'Mon entreprise'));
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recréer le trigger
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
