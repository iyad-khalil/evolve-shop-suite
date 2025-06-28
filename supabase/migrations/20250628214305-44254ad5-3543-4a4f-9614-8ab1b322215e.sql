
-- Insérer plusieurs catégories pour diversifier la plateforme
INSERT INTO public.categories (name, description) VALUES
('Mode & Vêtements', 'Vêtements, chaussures et accessoires de mode'),
('Maison & Jardin', 'Décoration, meubles, outils de jardinage'),
('Sport & Loisirs', 'Équipements sportifs, jeux et loisirs'),
('Beauté & Santé', 'Cosmétiques, soins personnels et produits de santé'),
('Livres & Médias', 'Livres, musique, films et contenus numériques'),
('Automobile', 'Pièces auto, accessoires et équipements véhicules')
ON CONFLICT (name) DO NOTHING;

-- Créer plusieurs profils vendeurs avec des entreprises différentes
INSERT INTO auth.users (
    instance_id, 
    id, 
    aud, 
    role, 
    email, 
    encrypted_password, 
    email_confirmed_at, 
    created_at, 
    updated_at,
    raw_user_meta_data
) VALUES 
(
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    'vendeur.tech@example.com',
    crypt('password123', gen_salt('bf')),
    now(),
    now(),
    now(),
    '{"first_name": "TechStore", "last_name": "Vendeur", "role": "vendor", "business_name": "TechStore Pro"}'::jsonb
),
(
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    'vendeur.mode@example.com',
    crypt('password123', gen_salt('bf')),
    now(),
    now(),
    now(),
    '{"first_name": "FashionHub", "last_name": "Vendeur", "role": "vendor", "business_name": "FashionHub Store"}'::jsonb
),
(
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    'vendeur.maison@example.com',
    crypt('password123', gen_salt('bf')),
    now(),
    now(),
    now(),
    '{"first_name": "HomeDecor", "last_name": "Vendeur", "role": "vendor", "business_name": "HomeDecor Plus"}'::jsonb
),
(
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    'vendeur.sport@example.com',
    crypt('password123', gen_salt('bf')),
    now(),
    now(),
    now(),
    '{"first_name": "SportZone", "last_name": "Vendeur", "role": "vendor", "business_name": "SportZone Pro"}'::jsonb
),
(
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    'vendeur.beaute@example.com',
    crypt('password123', gen_salt('bf')),
    now(),
    now(),
    now(),
    '{"first_name": "BeautyWorld", "last_name": "Vendeur", "role": "vendor", "business_name": "BeautyWorld Store"}'::jsonb
);

-- Insérer des produits dans différentes catégories avec différents vendeurs
-- Mode & Vêtements
INSERT INTO public.products (vendor_id, category_id, name, description, price, original_price, stock, images, tags, rating, reviews_count) VALUES
((SELECT id FROM auth.users WHERE email = 'vendeur.mode@example.com' LIMIT 1), (SELECT id FROM categories WHERE name = 'Mode & Vêtements' LIMIT 1), 'Jean Slim Fit Premium', 'Jean en denim de qualité supérieure, coupe slim moderne, disponible en plusieurs tailles', 89.99, 109.99, 45, ARRAY['https://images.unsplash.com/photo-1542272604-787c3835535d?w=500'], ARRAY['jean', 'mode', 'denim', 'slim'], 4.3, 67),
((SELECT id FROM auth.users WHERE email = 'vendeur.mode@example.com' LIMIT 1), (SELECT id FROM categories WHERE name = 'Mode & Vêtements' LIMIT 1), 'Robe d''été Florale', 'Robe légère et élégante parfaite pour l''été, motifs floraux tendance', 65.99, 79.99, 32, ARRAY['https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=500'], ARRAY['robe', 'été', 'floral', 'femme'], 4.6, 89),
((SELECT id FROM auth.users WHERE email = 'vendeur.mode@example.com' LIMIT 1), (SELECT id FROM categories WHERE name = 'Mode & Vêtements' LIMIT 1), 'Sneakers Sport Urban', 'Baskets tendance alliant confort et style urbain, semelle amortissante', 129.99, 149.99, 28, ARRAY['https://images.unsplash.com/photo-1549298916-b41d501d3772?w=500'], ARRAY['baskets', 'sport', 'urban', 'confort'], 4.5, 124),
((SELECT id FROM auth.users WHERE email = 'vendeur.mode@example.com' LIMIT 1), (SELECT id FROM categories WHERE name = 'Mode & Vêtements' LIMIT 1), 'Chemise Business Classique', 'Chemise élégante pour le bureau, coton de qualité, plusieurs coloris disponibles', 49.99, NULL, 67, ARRAY['https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=500'], ARRAY['chemise', 'business', 'coton', 'classique'], 4.2, 43);

-- Maison & Jardin
INSERT INTO public.products (vendor_id, category_id, name, description, price, original_price, stock, images, tags, rating, reviews_count) VALUES
((SELECT id FROM auth.users WHERE email = 'vendeur.maison@example.com' LIMIT 1), (SELECT id FROM categories WHERE name = 'Maison & Jardin' LIMIT 1), 'Canapé 3 Places Scandinave', 'Canapé confortable au design nordique, tissu de qualité, pieds en bois', 899.99, 1199.99, 8, ARRAY['https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=500'], ARRAY['canapé', 'scandinave', 'salon', 'confort'], 4.7, 156),
((SELECT id FROM auth.users WHERE email = 'vendeur.maison@example.com' LIMIT 1), (SELECT id FROM categories WHERE name = 'Maison & Jardin' LIMIT 1), 'Set d''Outils de Jardinage', 'Kit complet pour le jardinage avec bêche, râteau, sécateur et gants', 79.99, 99.99, 25, ARRAY['https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=500'], ARRAY['jardinage', 'outils', 'kit', 'extérieur'], 4.4, 92),
((SELECT id FROM auth.users WHERE email = 'vendeur.maison@example.com' LIMIT 1), (SELECT id FROM categories WHERE name = 'Maison & Jardin' LIMIT 1), 'Lampe de Table Design', 'Lampe élégante avec abat-jour en lin, base en céramique artisanale', 159.99, 189.99, 15, ARRAY['https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500'], ARRAY['lampe', 'design', 'éclairage', 'décoration'], 4.6, 78),
((SELECT id FROM auth.users WHERE email = 'vendeur.maison@example.com' LIMIT 1), (SELECT id FROM categories WHERE name = 'Maison & Jardin' LIMIT 1), 'Coussin Décoratif Velours', 'Coussin luxueux en velours, plusieurs couleurs, parfait pour le salon', 34.99, 44.99, 52, ARRAY['https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=500'], ARRAY['coussin', 'velours', 'décoration', 'salon'], 4.3, 134);

-- Sport & Loisirs
INSERT INTO public.products (vendor_id, category_id, name, description, price, original_price, stock, images, tags, rating, reviews_count) VALUES
((SELECT id FROM auth.users WHERE email = 'vendeur.sport@example.com' LIMIT 1), (SELECT id FROM categories WHERE name = 'Sport & Loisirs' LIMIT 1), 'Vélo VTT Tout Terrain', 'VTT robuste avec suspension avant, 21 vitesses, parfait pour les sentiers', 599.99, 749.99, 12, ARRAY['https://images.unsplash.com/photo-1544191696-15693072b7a7?w=500'], ARRAY['vélo', 'VTT', 'sport', 'outdoor'], 4.8, 203),
((SELECT id FROM auth.users WHERE email = 'vendeur.sport@example.com' LIMIT 1), (SELECT id FROM categories WHERE name = 'Sport & Loisirs' LIMIT 1), 'Tapis de Yoga Premium', 'Tapis antidérapant en matériau écologique, épaisseur optimale pour le confort', 49.99, 69.99, 87, ARRAY['https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=500'], ARRAY['yoga', 'fitness', 'tapis', 'écologique'], 4.5, 167),
((SELECT id FROM auth.users WHERE email = 'vendeur.sport@example.com' LIMIT 1), (SELECT id FROM categories WHERE name = 'Sport & Loisirs' LIMIT 1), 'Raquette de Tennis Pro', 'Raquette professionnelle, cadre en graphite, cordage haute performance', 229.99, 279.99, 18, ARRAY['https://images.unsplash.com/photo-1622163642998-1ea32b0bbc88?w=500'], ARRAY['tennis', 'raquette', 'sport', 'pro'], 4.7, 89),
((SELECT id FROM auth.users WHERE email = 'vendeur.sport@example.com' LIMIT 1), (SELECT id FROM categories WHERE name = 'Sport & Loisirs' LIMIT 1), 'Ballon de Football Official', 'Ballon de football officiel, cuir synthétique de qualité FIFA', 39.99, 49.99, 45, ARRAY['https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=500'], ARRAY['football', 'ballon', 'sport', 'FIFA'], 4.4, 112);

-- Beauté & Santé
INSERT INTO public.products (vendor_id, category_id, name, description, price, original_price, stock, images, tags, rating, reviews_count) VALUES
((SELECT id FROM auth.users WHERE email = 'vendeur.beaute@example.com' LIMIT 1), (SELECT id FROM categories WHERE name = 'Beauté & Santé' LIMIT 1), 'Sérum Anti-Âge Premium', 'Sérum concentré avec acide hyaluronique et vitamine C, résultats visibles', 89.99, 119.99, 34, ARRAY['https://images.unsplash.com/photo-1556228720-195a672e8a03?w=500'], ARRAY['sérum', 'anti-âge', 'skincare', 'premium'], 4.6, 278),
((SELECT id FROM auth.users WHERE email = 'vendeur.beaute@example.com' LIMIT 1), (SELECT id FROM categories WHERE name = 'Beauté & Santé' LIMIT 1), 'Palette Maquillage Complète', 'Palette professionnelle avec 48 couleurs, fards à paupières et blush inclus', 79.99, 99.99, 26, ARRAY['https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=500'], ARRAY['maquillage', 'palette', 'beauté', 'couleurs'], 4.3, 156),
((SELECT id FROM auth.users WHERE email = 'vendeur.beaute@example.com' LIMIT 1), (SELECT id FROM categories WHERE name = 'Beauté & Santé' LIMIT 1), 'Brosse Nettoyante Visage', 'Brosse électrique pour nettoyage en profondeur, 3 vitesses, étanche', 149.99, 199.99, 19, ARRAY['https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=500'], ARRAY['brosse', 'nettoyage', 'visage', 'électrique'], 4.5, 89),
((SELECT id FROM auth.users WHERE email = 'vendeur.beaute@example.com' LIMIT 1), (SELECT id FROM categories WHERE name = 'Beauté & Santé' LIMIT 1), 'Huile Essentielle Bio Lavande', 'Huile essentielle 100% pure et bio, parfaite pour relaxation et aromathérapie', 24.99, 29.99, 78, ARRAY['https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=500'], ARRAY['huile', 'essentielle', 'bio', 'lavande'], 4.7, 234);

-- Livres & Médias
INSERT INTO public.products (vendor_id, category_id, name, description, price, original_price, stock, images, tags, rating, reviews_count) VALUES
((SELECT id FROM auth.users WHERE email = 'vendeur.tech@example.com' LIMIT 1), (SELECT id FROM categories WHERE name = 'Livres & Médias' LIMIT 1), 'Guide du Développement Web', 'Manuel complet pour apprendre HTML, CSS, JavaScript et React', 45.99, 59.99, 67, ARRAY['https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=500'], ARRAY['livre', 'développement', 'web', 'programming'], 4.8, 145),
((SELECT id FROM auth.users WHERE email = 'vendeur.tech@example.com' LIMIT 1), (SELECT id FROM categories WHERE name = 'Livres & Médias' LIMIT 1), 'Roman Bestseller 2024', 'Le livre le plus vendu de l''année, histoire captivante et personnages attachants', 22.99, 27.99, 123, ARRAY['https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500'], ARRAY['roman', 'bestseller', 'fiction', 'lecture'], 4.6, 892),
((SELECT id FROM auth.users WHERE email = 'vendeur.tech@example.com' LIMIT 1), (SELECT id FROM categories WHERE name = 'Livres & Médias' LIMIT 1), 'Vinyle Classic Rock Collection', 'Album vinyle collector, remasterisé, pochette gatefold', 39.99, 49.99, 28, ARRAY['https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=500'], ARRAY['vinyle', 'musique', 'rock', 'collector'], 4.7, 67);

-- Automobile
INSERT INTO public.products (vendor_id, category_id, name, description, price, original_price, stock, images, tags, rating, reviews_count) VALUES
((SELECT id FROM auth.users WHERE email = 'vendeur.tech@example.com' LIMIT 1), (SELECT id FROM categories WHERE name = 'Automobile' LIMIT 1), 'Chargeur Auto USB-C Rapide', 'Chargeur voiture 65W avec ports USB-A et USB-C, charge rapide pour tous appareils', 34.99, 44.99, 89, ARRAY['https://images.unsplash.com/photo-1609592242717-421b67ee61f9?w=500'], ARRAY['chargeur', 'auto', 'USB-C', 'rapide'], 4.4, 156),
((SELECT id FROM auth.users WHERE email = 'vendeur.tech@example.com' LIMIT 1), (SELECT id FROM categories WHERE name = 'Automobile' LIMIT 1), 'Support Téléphone Magnétique', 'Support smartphone magnétique pour tableau de bord, rotation 360°', 29.99, 39.99, 156, ARRAY['https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500'], ARRAY['support', 'téléphone', 'magnétique', 'voiture'], 4.3, 234),
((SELECT id FROM auth.users WHERE email = 'vendeur.tech@example.com' LIMIT 1), (SELECT id FROM categories WHERE name = 'Automobile' LIMIT 1), 'Kit de Nettoyage Auto Premium', 'Kit complet avec shampooing, cire, microfibre et accessoires de détailing', 79.99, 99.99, 23, ARRAY['https://images.unsplash.com/photo-1520340356049-f10bf7adf300?w=500'], ARRAY['nettoyage', 'auto', 'kit', 'détailing'], 4.6, 78);
