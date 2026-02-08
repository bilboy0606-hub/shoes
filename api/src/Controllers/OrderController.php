<?php

namespace App\Controllers;

use App\Models\Order;
use App\Middleware\AuthMiddleware;

class OrderController
{
    private Order $orderModel;

    public function __construct()
    {
        $this->orderModel = new Order();
    }

    public function index(): void
    {
        $userId = AuthMiddleware::require();
        $orders = $this->orderModel->findByUserId($userId);

        echo json_encode([
            'orders' => $orders,
            'count' => count($orders),
        ]);
    }

    public function show(int $id): void
    {
        $userId = AuthMiddleware::require();
        $order = $this->orderModel->findById($id, $userId);

        if (!$order) {
            http_response_code(404);
            echo json_encode(['error' => 'Commande non trouvée.']);
            return;
        }

        echo json_encode(['order' => $order]);
    }

    public function create(): void
    {
        $userId = AuthMiddleware::require();
        $data = json_decode(file_get_contents('php://input'), true);

        // Validation
        $errors = [];
        if (empty($data['items']) || !is_array($data['items'])) {
            $errors[] = 'Les articles sont requis.';
        }
        if (empty($data['shipping']['name'])) {
            $errors[] = 'Le nom de livraison est requis.';
        }
        if (empty($data['shipping']['address'])) {
            $errors[] = 'L\'adresse de livraison est requise.';
        }
        if (empty($data['shipping']['city'])) {
            $errors[] = 'La ville est requise.';
        }
        if (empty($data['shipping']['postal_code'])) {
            $errors[] = 'Le code postal est requis.';
        }

        if (!empty($errors)) {
            http_response_code(422);
            echo json_encode(['errors' => $errors]);
            return;
        }

        // Calculate total
        $total = 0;
        foreach ($data['items'] as $item) {
            $total += $item['price'] * $item['quantity'];
        }

        try {
            $orderId = $this->orderModel->create(
                $userId,
                $total,
                $data['items'],
                $data['shipping']
            );

            $order = $this->orderModel->findById($orderId, $userId);

            http_response_code(201);
            echo json_encode([
                'message' => 'Commande créée avec succès.',
                'order' => $order,
            ]);
        } catch (\Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Erreur lors de la création de la commande.']);
        }
    }
}
