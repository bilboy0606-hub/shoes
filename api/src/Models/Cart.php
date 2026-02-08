<?php

namespace App\Models;

use App\Config\Database;
use PDO;

class Cart
{
    private PDO $db;

    public function __construct()
    {
        $this->db = Database::getConnection();
    }

    public function getByUserId(int $userId): array
    {
        $stmt = $this->db->prepare(
            'SELECT c.id, c.product_id, c.size, c.quantity,
                    p.name, p.brand, p.price, p.image_url
             FROM cart c
             JOIN products p ON c.product_id = p.id
             WHERE c.user_id = :user_id
             ORDER BY c.created_at DESC'
        );
        $stmt->execute(['user_id' => $userId]);
        return $stmt->fetchAll();
    }

    public function addItem(int $userId, int $productId, int $size, int $quantity = 1): array
    {
        // Use INSERT ... ON DUPLICATE KEY UPDATE to handle upsert
        $stmt = $this->db->prepare(
            'INSERT INTO cart (user_id, product_id, size, quantity)
             VALUES (:user_id, :product_id, :size, :quantity)
             ON DUPLICATE KEY UPDATE quantity = quantity + :add_qty'
        );
        $stmt->execute([
            'user_id' => $userId,
            'product_id' => $productId,
            'size' => $size,
            'quantity' => $quantity,
            'add_qty' => $quantity,
        ]);

        return $this->getByUserId($userId);
    }

    public function updateItem(int $userId, int $productId, int $size, int $quantity): array
    {
        if ($quantity <= 0) {
            return $this->removeItem($userId, $productId, $size);
        }

        $stmt = $this->db->prepare(
            'UPDATE cart SET quantity = :quantity
             WHERE user_id = :user_id AND product_id = :product_id AND size = :size'
        );
        $stmt->execute([
            'user_id' => $userId,
            'product_id' => $productId,
            'size' => $size,
            'quantity' => $quantity,
        ]);

        return $this->getByUserId($userId);
    }

    public function removeItem(int $userId, int $productId, int $size): array
    {
        $stmt = $this->db->prepare(
            'DELETE FROM cart
             WHERE user_id = :user_id AND product_id = :product_id AND size = :size'
        );
        $stmt->execute([
            'user_id' => $userId,
            'product_id' => $productId,
            'size' => $size,
        ]);

        return $this->getByUserId($userId);
    }

    public function clear(int $userId): void
    {
        $stmt = $this->db->prepare('DELETE FROM cart WHERE user_id = :user_id');
        $stmt->execute(['user_id' => $userId]);
    }

    public function syncFromLocal(int $userId, array $items): array
    {
        foreach ($items as $item) {
            // Use REPLACE semantics: set quantity (not add)
            $stmt = $this->db->prepare(
                'INSERT INTO cart (user_id, product_id, size, quantity)
                 VALUES (:user_id, :product_id, :size, :quantity)
                 ON DUPLICATE KEY UPDATE quantity = :set_qty'
            );
            $stmt->execute([
                'user_id' => $userId,
                'product_id' => (int) $item['product_id'],
                'size' => (int) $item['size'],
                'quantity' => (int) $item['quantity'],
                'set_qty' => (int) $item['quantity'],
            ]);
        }
        return $this->getByUserId($userId);
    }
}
