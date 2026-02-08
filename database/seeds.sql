-- KickStore Database Seeds
-- Données de test et produits initiaux

-- Insertion des produits (8 produits existants)
INSERT INTO products (name, brand, price, original_price, image_url, category, rating, reviews_count, badge, is_new, stock) VALUES
('Air Max 90', 'Nike', 149.99, 179.99, 'https://images.unsplash.com/photo-1605348532760-6753d2c43329?w=500', 'sneakers', 4.8, 234, 'Promo', FALSE, 50),
('UltraBoost 22', 'Adidas', 189.99, NULL, 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=500', 'running', 4.9, 456, NULL, TRUE, 45),
('RS-X³', 'Puma', 119.99, NULL, 'https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9eb?w=500', 'lifestyle', 4.6, 189, NULL, FALSE, 60),
('Jordan 1 Retro', 'Nike', 179.99, NULL, 'https://images.unsplash.com/photo-1597045566677-8cf032ed6634?w=500', 'basketball', 4.9, 892, 'Best-seller', FALSE, 30),
('990v5', 'New Balance', 199.99, NULL, 'https://images.unsplash.com/photo-1539185441755-769473a23570?w=500', 'lifestyle', 4.7, 312, NULL, TRUE, 40),
('Gel-Kayano 29', 'Asics', 169.99, 189.99, 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=500', 'running', 4.8, 567, 'Promo', FALSE, 55),
('Club C 85', 'Reebok', 89.99, NULL, 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=500', 'lifestyle', 4.5, 234, NULL, FALSE, 70),
('Zoom Freak 4', 'Nike', 139.99, NULL, 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500', 'basketball', 4.7, 178, NULL, TRUE, 38);

-- Insertion des couleurs pour chaque produit
-- Air Max 90 (id=1)
INSERT INTO product_colors (product_id, color_hex) VALUES
(1, '#1a1a1a'),
(1, '#ffffff'),
(1, '#dc2626');

-- UltraBoost 22 (id=2)
INSERT INTO product_colors (product_id, color_hex) VALUES
(2, '#1a1a1a'),
(2, '#3b82f6');

-- RS-X³ (id=3)
INSERT INTO product_colors (product_id, color_hex) VALUES
(3, '#ffffff'),
(3, '#f59e0b'),
(3, '#8b5cf6');

-- Jordan 1 Retro (id=4)
INSERT INTO product_colors (product_id, color_hex) VALUES
(4, '#dc2626'),
(4, '#1a1a1a'),
(4, '#3b82f6');

-- 990v5 (id=5)
INSERT INTO product_colors (product_id, color_hex) VALUES
(5, '#6b7280'),
(5, '#1e40af');

-- Gel-Kayano 29 (id=6)
INSERT INTO product_colors (product_id, color_hex) VALUES
(6, '#1a1a1a'),
(6, '#22c55e'),
(6, '#f97316');

-- Club C 85 (id=7)
INSERT INTO product_colors (product_id, color_hex) VALUES
(7, '#ffffff'),
(7, '#1a1a1a');

-- Zoom Freak 4 (id=8)
INSERT INTO product_colors (product_id, color_hex) VALUES
(8, '#8b5cf6'),
(8, '#ec4899'),
(8, '#1a1a1a');

-- Insertion des tailles pour chaque produit
-- Air Max 90 (id=1)
INSERT INTO product_sizes (product_id, size, stock) VALUES
(1, 39, 10), (1, 40, 10), (1, 41, 10), (1, 42, 10), (1, 43, 10), (1, 44, 5), (1, 45, 5);

-- UltraBoost 22 (id=2)
INSERT INTO product_sizes (product_id, size, stock) VALUES
(2, 40, 8), (2, 41, 10), (2, 42, 12), (2, 43, 10), (2, 44, 5);

-- RS-X³ (id=3)
INSERT INTO product_sizes (product_id, size, stock) VALUES
(3, 39, 10), (3, 40, 12), (3, 41, 12), (3, 42, 12), (3, 43, 10), (3, 44, 8), (3, 45, 6), (3, 46, 5);

-- Jordan 1 Retro (id=4)
INSERT INTO product_sizes (product_id, size, stock) VALUES
(4, 40, 5), (4, 41, 8), (4, 42, 10), (4, 43, 8), (4, 44, 5), (4, 45, 4);

-- 990v5 (id=5)
INSERT INTO product_sizes (product_id, size, stock) VALUES
(5, 40, 8), (5, 41, 10), (5, 42, 10), (5, 43, 8), (5, 44, 6), (5, 45, 4);

-- Gel-Kayano 29 (id=6)
INSERT INTO product_sizes (product_id, size, stock) VALUES
(6, 39, 10), (6, 40, 12), (6, 41, 15), (6, 42, 12), (6, 43, 10), (6, 44, 6);

-- Club C 85 (id=7)
INSERT INTO product_sizes (product_id, size, stock) VALUES
(7, 38, 10), (7, 39, 12), (7, 40, 15), (7, 41, 15), (7, 42, 12), (7, 43, 10), (7, 44, 8), (7, 45, 5);

-- Zoom Freak 4 (id=8)
INSERT INTO product_sizes (product_id, size, stock) VALUES
(8, 40, 8), (8, 41, 10), (8, 42, 10), (8, 43, 8), (8, 44, 6), (8, 45, 4), (8, 46, 2);

-- Création d'un utilisateur de test
-- Mot de passe : password123 (hash bcrypt)
INSERT INTO users (email, password, name, phone) VALUES
('test@kickstore.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Utilisateur Test', '+33 6 12 34 56 78');

-- Note: Le mot de passe "password123" est hashé avec password_hash() de PHP
-- Pour créer un nouveau hash, utilisez en PHP : password_hash('votre_password', PASSWORD_DEFAULT)
