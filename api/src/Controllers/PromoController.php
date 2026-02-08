<?php

namespace App\Controllers;

use App\Models\PromoCode;
use PDO;

class PromoController
{
    private PromoCode $promoModel;

    public function __construct(PDO $db)
    {
        $this->promoModel = new PromoCode($db);
    }

    /**
     * Validate a promo code
     * POST /promo/validate
     * Body: { "code": "BIENVENUE10", "orderTotal": 150.00 }
     */
    public function validate(): void
    {
        $data = json_decode(file_get_contents('php://input'), true);

        if (!isset($data['code']) || !isset($data['orderTotal'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Code et montant de commande requis']);
            return;
        }

        $code = trim(strtoupper($data['code']));
        $orderTotal = (float) $data['orderTotal'];

        $validation = $this->promoModel->validate($code, $orderTotal);

        if (!$validation['valid']) {
            http_response_code(400);
            echo json_encode(['error' => $validation['error']]);
            return;
        }

        $promo = $validation['promo'];
        $discount = $this->promoModel->calculateDiscount($promo, $orderTotal);
        $newTotal = max(0, $orderTotal - $discount);

        echo json_encode([
            'valid' => true,
            'promo' => [
                'code' => $promo['code'],
                'type' => $promo['type'],
                'value' => (float) $promo['value'],
            ],
            'discount' => $discount,
            'newTotal' => $newTotal,
            'originalTotal' => $orderTotal,
        ]);
    }

    /**
     * Get all promo codes (admin only)
     * GET /admin/promos
     */
    public function list(): void
    {
        $promos = $this->promoModel->findAll();

        echo json_encode([
            'promos' => array_map(function ($promo) {
                return [
                    'id' => (int) $promo['id'],
                    'code' => $promo['code'],
                    'type' => $promo['type'],
                    'value' => (float) $promo['value'],
                    'min_order_amount' => (float) $promo['min_order_amount'],
                    'max_uses' => $promo['max_uses'] ? (int) $promo['max_uses'] : null,
                    'current_uses' => (int) $promo['current_uses'],
                    'expires_at' => $promo['expires_at'],
                    'is_active' => (bool) $promo['is_active'],
                    'created_at' => $promo['created_at'],
                ];
            }, $promos),
        ]);
    }

    /**
     * Create a new promo code (admin only)
     * POST /admin/promos
     * Body: { "code": "SUMMER20", "type": "percentage", "value": 20, ... }
     */
    public function create(): void
    {
        $data = json_decode(file_get_contents('php://input'), true);

        // Validation
        if (!isset($data['code']) || !isset($data['type']) || !isset($data['value'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Code, type et valeur requis']);
            return;
        }

        if (!in_array($data['type'], ['percentage', 'fixed'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Type invalide (percentage ou fixed)']);
            return;
        }

        if ($data['type'] === 'percentage' && ($data['value'] < 0 || $data['value'] > 100)) {
            http_response_code(400);
            echo json_encode(['error' => 'Pourcentage doit être entre 0 et 100']);
            return;
        }

        if ($data['value'] <= 0) {
            http_response_code(400);
            echo json_encode(['error' => 'Valeur doit être positive']);
            return;
        }

        try {
            $promo = $this->promoModel->create($data);

            if (!$promo) {
                http_response_code(500);
                echo json_encode(['error' => 'Erreur lors de la création du code promo']);
                return;
            }

            http_response_code(201);
            echo json_encode(['promo' => $promo]);
        } catch (\PDOException $e) {
            if ($e->getCode() === '23000') {
                http_response_code(409);
                echo json_encode(['error' => 'Ce code promo existe déjà']);
            } else {
                http_response_code(500);
                echo json_encode(['error' => 'Erreur serveur']);
            }
        }
    }

    /**
     * Update a promo code (admin only)
     * PUT /admin/promos/{id}
     * Body: { "is_active": false, "max_uses": 200, ... }
     */
    public function update(int $id): void
    {
        $data = json_decode(file_get_contents('php://input'), true);

        $result = $this->promoModel->update($id, $data);

        if (!$result) {
            http_response_code(400);
            echo json_encode(['error' => 'Aucune modification effectuée']);
            return;
        }

        echo json_encode(['success' => true, 'message' => 'Code promo mis à jour']);
    }

    /**
     * Delete a promo code (admin only)
     * DELETE /admin/promos/{id}
     */
    public function delete(int $id): void
    {
        $result = $this->promoModel->delete($id);

        if (!$result) {
            http_response_code(404);
            echo json_encode(['error' => 'Code promo introuvable']);
            return;
        }

        echo json_encode(['success' => true, 'message' => 'Code promo supprimé']);
    }
}
