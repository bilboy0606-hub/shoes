<?php

namespace App\Models;

use App\Config\Database;
use PDO;

class Product
{
    private PDO $db;

    public function __construct()
    {
        $this->db = Database::getConnection();
    }

    public function getAll(?string $category = null, ?string $brand = null): array
    {
        $sql = 'SELECT * FROM products WHERE 1=1';
        $params = [];

        if ($category && $category !== 'all') {
            $sql .= ' AND category = :category';
            $params['category'] = $category;
        }
        if ($brand) {
            $sql .= ' AND brand = :brand';
            $params['brand'] = $brand;
        }

        $sql .= ' ORDER BY created_at DESC';

        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);
        $products = $stmt->fetchAll();

        // Attach colors and sizes to each product
        foreach ($products as &$product) {
            $product['colors'] = $this->getColors((int) $product['id']);
            $product['sizes'] = $this->getSizes((int) $product['id']);
            $product['is_new'] = (bool) $product['is_new'];
        }

        return $products;
    }

    public function getById(int $id): ?array
    {
        $stmt = $this->db->prepare('SELECT * FROM products WHERE id = :id LIMIT 1');
        $stmt->execute(['id' => $id]);
        $product = $stmt->fetch();

        if (!$product) {
            return null;
        }

        $product['colors'] = $this->getColors($id);
        $product['sizes'] = $this->getSizes($id);
        $product['is_new'] = (bool) $product['is_new'];

        return $product;
    }

    private function getColors(int $productId): array
    {
        $stmt = $this->db->prepare(
            'SELECT color_hex FROM product_colors WHERE product_id = :product_id'
        );
        $stmt->execute(['product_id' => $productId]);
        return array_column($stmt->fetchAll(), 'color_hex');
    }

    private function getSizes(int $productId): array
    {
        $stmt = $this->db->prepare(
            'SELECT size, stock FROM product_sizes WHERE product_id = :product_id ORDER BY size ASC'
        );
        $stmt->execute(['product_id' => $productId]);
        return $stmt->fetchAll();
    }

    public function getCategories(): array
    {
        $stmt = $this->db->query(
            'SELECT DISTINCT category FROM products ORDER BY category ASC'
        );
        return array_column($stmt->fetchAll(), 'category');
    }

    public function getBrands(): array
    {
        $stmt = $this->db->query(
            'SELECT DISTINCT brand FROM products ORDER BY brand ASC'
        );
        return array_column($stmt->fetchAll(), 'brand');
    }
}
