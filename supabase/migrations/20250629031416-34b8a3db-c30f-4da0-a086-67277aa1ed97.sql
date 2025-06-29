
-- Supprimer toutes les commandes vendeur existantes
DELETE FROM vendor_orders;

-- Supprimer tous les produits existants
DELETE FROM products;

-- Supprimer tous les profils vendeur
DELETE FROM profiles WHERE role = 'vendor';

-- Supprimer tous les vendeurs
DELETE FROM vendors;
