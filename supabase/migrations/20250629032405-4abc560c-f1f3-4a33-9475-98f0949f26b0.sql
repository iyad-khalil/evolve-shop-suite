
-- Supprimer tous les utilisateurs de l'authentification Supabase
-- Ceci supprimera automatiquement les profils associés grâce aux contraintes CASCADE
DELETE FROM auth.users;
