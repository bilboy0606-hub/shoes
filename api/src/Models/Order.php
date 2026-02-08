<?php

namespace App\Models;

use App\Config\Database;
use PDO;

class Order
{
    private PDO $db;

    public function __construct()
    {
        $this->db = Database::getConnection();
    }

    public function create(
        int $userId,
        float $total,
        array $items,
        array $shipping,
        ?string $promoCode = null,
        ?float $discountAmount = null,
        ?float $originalTotal = null
    ): int {
        $this->db->beginTransaction();

        try {
            // Create order
            $stmt = $this->db->prepare(
                'INSERT INTO orders (user_id, total, status, shipping_name, shipping_address, shipping_city, shipping_postal_code, shipping_country, promo_code, discount_amount, original_total)
                 VALUES (:user_id, :total, :status, :shipping_name, :shipping_address, :shipping_city, :shipping_postal_code, :shipping_country, :promo_code, :discount_amount, :original_total)'
            );
            $stmt->execute([
                'user_id' => $userId,
                'total' => $total,
                'status' => 'pending',
                'shipping_name' => $shipping['name'] ?? '',
                'shipping_address' => $shipping['address'] ?? '',
                'shipping_city' => $shipping['city'] ?? '',
                'shipping_postal_code' => $shipping['postal_code'] ?? '',
                'shipping_country' => $shipping['country'] ?? 'France',
                'promo_code' => $promoCode,
                'discount_amount' => $discountAmount,
                'original_total' => $originalTotal,
            ]);

            $orderId = (int) $this->db->lastInsertId();

            // Create order items
            $stmt = $this->db->prepare(
                'INSERT INTO order_items (order_id, product_id, product_name, product_brand, product_image, size, quantity, price)
                 VALUES (:order_id, :product_id, :product_name, :product_brand, :product_image, :size, :quantity, :price)'
            );

            foreach ($items as $item) {
                $stmt->execute([
                    'order_id' => $orderId,
                    'product_id' => $item['product_id'],
                    'product_name' => $item['product_name'],
                    'product_brand' => $item['product_brand'] ?? '',
                    'product_image' => $item['product_image'] ?? '',
                    'size' => $item['size'],
                    'quantity' => $item['quantity'],
                    'price' => $item['price'],
                ]);
            }

            $this->db->commit();
            return $orderId;
        } catch (\Exception $e) {
            $this->db->rollBack();
            throw $e;
        }
    }

    public function findByUserId(int $userId): array
    {
        $stmt = $this->db->prepare(
            'SELECT * FROM orders WHERE user_id = :user_id ORDER BY created_at DESC'
        );
        $stmt->execute(['user_id' => $userId]);
        $orders = $stmt->fetchAll();

        foreach ($orders as &$order) {
            $order['items'] = $this->getOrderItems((int) $order['id']);
            $order['items_count'] = count($order['items']);
        }

        return $orders;
    }

    public function findAll(): array
    {
        $stmt = $this->db->query(
            'SELECT o.*, u.name AS user_name, u.email AS user_email
             FROM orders o
             LEFT JOIN users u ON o.user_id = u.id
             ORDER BY o.created_at DESC'
        );
        $orders = $stmt->fetchAll();

        foreach ($orders as &$order) {
            $order['items'] = $this->getOrderItems((int) $order['id']);
            $order['items_count'] = count($order['items']);
        }

        return $orders;
    }

    public function findById(int $orderId, ?int $userId = null): ?array
    {
        $sql = 'SELECT * FROM orders WHERE id = :id';
        $params = ['id' => $orderId];

        if ($userId !== null) {
            $sql .= ' AND user_id = :user_id';
            $params['user_id'] = $userId;
        }

        $stmt = $this->db->prepare($sql . ' LIMIT 1');
        $stmt->execute($params);
        $order = $stmt->fetch();

        if (!$order) {
            return null;
        }

        $order['items'] = $this->getOrderItems($orderId);
        return $order;
    }

    private function getOrderItems(int $orderId): array
    {
        $stmt = $this->db->prepare(
            'SELECT * FROM order_items WHERE order_id = :order_id'
        );
        $stmt->execute(['order_id' => $orderId]);
        return $stmt->fetchAll();
    }

    public function updateStatus(int $orderId, string $status): bool
    {
        $stmt = $this->db->prepare(
            'UPDATE orders SET status = :status WHERE id = :id'
        );
        return $stmt->execute(['id' => $orderId, 'status' => $status]);
    }

    public function setStripeSession(int $orderId, string $sessionId): bool
    {
        $stmt = $this->db->prepare(
            'UPDATE orders SET stripe_session_id = :session_id WHERE id = :id'
        );
        return $stmt->execute(['id' => $orderId, 'session_id' => $sessionId]);
    }

    public function setStripePaymentIntent(int $orderId, string $paymentIntent): bool
    {
        $stmt = $this->db->prepare(
            'UPDATE orders SET stripe_payment_intent = :payment_intent WHERE id = :id'
        );
        return $stmt->execute(['id' => $orderId, 'payment_intent' => $paymentIntent]);
    }

    public function findByStripeSession(string $sessionId): ?array
    {
        $stmt = $this->db->prepare(
            'SELECT * FROM orders WHERE stripe_session_id = :session_id LIMIT 1'
        );
        $stmt->execute(['session_id' => $sessionId]);
        $order = $stmt->fetch();

        if (!$order) {
            return null;
        }

        $order['items'] = $this->getOrderItems((int) $order['id']);
        return $order;
    }
}
