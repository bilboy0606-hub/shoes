<?php

namespace App\Models;

use PDO;

class PromoCode
{
    private PDO $db;

    public function __construct(PDO $db)
    {
        $this->db = $db;
    }

    /**
     * Find a promo code by its code string
     */
    public function findByCode(string $code): ?array
    {
        $stmt = $this->db->prepare(
            'SELECT * FROM promo_codes WHERE code = :code LIMIT 1'
        );
        $stmt->execute(['code' => $code]);
        $promo = $stmt->fetch();

        return $promo ?: null;
    }

    /**
     * Validate a promo code for use
     */
    public function validate(string $code, float $orderTotal): array
    {
        $promo = $this->findByCode($code);

        if (!$promo) {
            return ['valid' => false, 'error' => 'Code promo invalide'];
        }

        if (!$promo['is_active']) {
            return ['valid' => false, 'error' => 'Ce code promo n\'est plus actif'];
        }

        // Check expiration
        if ($promo['expires_at'] && strtotime($promo['expires_at']) < time()) {
            return ['valid' => false, 'error' => 'Ce code promo a expiré'];
        }

        // Check max uses
        if ($promo['max_uses'] !== null && $promo['current_uses'] >= $promo['max_uses']) {
            return ['valid' => false, 'error' => 'Ce code promo a atteint son nombre maximum d\'utilisations'];
        }

        // Check minimum order amount
        if ($orderTotal < $promo['min_order_amount']) {
            return [
                'valid' => false,
                'error' => sprintf(
                    'Commande minimum de %.2f€ requise pour ce code',
                    $promo['min_order_amount']
                )
            ];
        }

        return ['valid' => true, 'promo' => $promo];
    }

    /**
     * Calculate discount amount
     */
    public function calculateDiscount(array $promo, float $orderTotal): float
    {
        if ($promo['type'] === 'percentage') {
            return round(($orderTotal * $promo['value']) / 100, 2);
        } else {
            // Fixed amount
            return min($promo['value'], $orderTotal);
        }
    }

    /**
     * Increment usage count
     */
    public function incrementUsage(int $promoId): bool
    {
        $stmt = $this->db->prepare(
            'UPDATE promo_codes SET current_uses = current_uses + 1 WHERE id = :id'
        );
        return $stmt->execute(['id' => $promoId]);
    }

    /**
     * Get all promo codes (for admin)
     */
    public function findAll(): array
    {
        $stmt = $this->db->query(
            'SELECT * FROM promo_codes ORDER BY created_at DESC'
        );
        return $stmt->fetchAll();
    }

    /**
     * Create a new promo code
     */
    public function create(array $data): ?array
    {
        $stmt = $this->db->prepare(
            'INSERT INTO promo_codes (code, type, value, min_order_amount, max_uses, expires_at, is_active)
             VALUES (:code, :type, :value, :min_order_amount, :max_uses, :expires_at, :is_active)'
        );

        $result = $stmt->execute([
            'code' => strtoupper($data['code']),
            'type' => $data['type'],
            'value' => $data['value'],
            'min_order_amount' => $data['min_order_amount'] ?? 0,
            'max_uses' => $data['max_uses'] ?? null,
            'expires_at' => $data['expires_at'] ?? null,
            'is_active' => $data['is_active'] ?? 1,
        ]);

        if (!$result) {
            return null;
        }

        return $this->findByCode(strtoupper($data['code']));
    }

    /**
     * Update a promo code
     */
    public function update(int $id, array $data): bool
    {
        $fields = [];
        $params = ['id' => $id];

        if (isset($data['is_active'])) {
            $fields[] = 'is_active = :is_active';
            $params['is_active'] = $data['is_active'];
        }

        if (isset($data['max_uses'])) {
            $fields[] = 'max_uses = :max_uses';
            $params['max_uses'] = $data['max_uses'];
        }

        if (isset($data['expires_at'])) {
            $fields[] = 'expires_at = :expires_at';
            $params['expires_at'] = $data['expires_at'];
        }

        if (empty($fields)) {
            return false;
        }

        $sql = 'UPDATE promo_codes SET ' . implode(', ', $fields) . ' WHERE id = :id';
        $stmt = $this->db->prepare($sql);

        return $stmt->execute($params);
    }

    /**
     * Delete a promo code
     */
    public function delete(int $id): bool
    {
        $stmt = $this->db->prepare('DELETE FROM promo_codes WHERE id = :id');
        return $stmt->execute(['id' => $id]);
    }
}
