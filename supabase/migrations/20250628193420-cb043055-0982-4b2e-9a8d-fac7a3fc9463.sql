
-- Supprimer tous les profils existants (cela supprimera automatiquement les utilisateurs auth grâce à la cascade)
DELETE FROM public.profiles;
DELETE FROM public.vendors;

-- Supprimer les produits existants car ils référencent des utilisateurs qui n'existeront plus
DELETE FROM public.products;

-- Note: Les utilisateurs dans auth.users seront supprimés automatiquement 
-- grâce aux contraintes de clé étrangère avec CASCADE
