<?php

namespace App\Controllers;

use App\Models\Cart;
use App\Middleware\AuthMiddleware;

class CartController
{
    private Cart $cartModel;

    public function __construct()
    {
        $this->cartModel = new Cart();
    }

    public function index(): void
    {
        $userId = AuthMiddleware::require();
        $items = $this->cartModel->getByUserId($userId);

        echo json_encode(['cart' => $items]);
    }

    public function add(): void
    {
        $userId = AuthMiddleware::require();
        $data = json_decode(file_get_contents('php://input'), true);

        if (empty($data['product_id']) || empty($data['size'])) {
            http_response_code(422);
            echo json_encode(['error' => 'product_id et size sont requis.']);
            return;
        }

        $cart = $this->cartModel->addItem(
            $userId,
            (int) $data['product_id'],
            (int) $data['size'],
            (int) ($data['quantity'] ?? 1)
        );

        echo json_encode(['cart' => $cart]);
    }

    public function update(): void
    {
        $userId = AuthMiddleware::require();
        $data = json_decode(file_get_contents('php://input'), true);

        if (empty($data['product_id']) || empty($data['size']) || !isset($data['quantity'])) {
            http_response_code(422);
            echo json_encode(['error' => 'product_id, size et quantity sont requis.']);
            return;
        }

        $cart = $this->cartModel->updateItem(
            $userId,
            (int) $data['product_id'],
            (int) $data['size'],
            (int) $data['quantity']
        );

        echo json_encode(['cart' => $cart]);
    }

    public function remove(): void
    {
        $userId = AuthMiddleware::require();
        $data = json_decode(file_get_contents('php://input'), true);

        if (empty($data['product_id']) || empty($data['size'])) {
            http_response_code(422);
            echo json_encode(['error' => 'product_id et size sont requis.']);
            return;
        }

        $cart = $this->cartModel->removeItem(
            $userId,
            (int) $data['product_id'],
            (int) $data['size']
        );

        echo json_encode(['cart' => $cart]);
    }

    public function clear(): void
    {
        $userId = AuthMiddleware::require();
        $this->cartModel->clear($userId);

        echo json_encode(['cart' => []]);
    }

    public function sync(): void
    {
        $userId = AuthMiddleware::require();
        $data = json_decode(file_get_contents('php://input'), true);

        if (empty($data['items']) || !is_array($data['items'])) {
            http_response_code(422);
            echo json_encode(['error' => 'items est requis.']);
            return;
        }

        $cart = $this->cartModel->syncFromLocal($userId, $data['items']);

        echo json_encode(['cart' => $cart]);
    }
}
