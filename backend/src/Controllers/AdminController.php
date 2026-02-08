<?php

namespace App\Controllers;

use App\Models\Order;
use App\Models\User;
use App\Middleware\AuthMiddleware;
use App\Middleware\AdminMiddleware;

class AdminController
{
    private Order $orderModel;
    private User $userModel;

    public function __construct()
    {
        $this->orderModel = new Order();
        $this->userModel = new User();
    }

    public function login(): void
    {
        $data = json_decode(file_get_contents('php://input'), true);

        if (empty($data['email']) || empty($data['password'])) {
            http_response_code(422);
            echo json_encode(['error' => 'Email et mot de passe requis.']);
            return;
        }

        $user = $this->userModel->findByEmail($data['email']);

        if (!$user || !$this->userModel->verifyPassword($data['password'], $user['password'])) {
            http_response_code(401);
            echo json_encode(['error' => 'Email ou mot de passe incorrect.']);
            return;
        }

        if (!$user['is_admin']) {
            http_response_code(403);
            echo json_encode(['error' => 'Accès réservé aux administrateurs.']);
            return;
        }

        $token = AuthMiddleware::generateToken($user['id']);
        unset($user['password']);

        echo json_encode([
            'message' => 'Connexion admin réussie.',
            'user' => $user,
            'token' => $token,
        ]);
    }

    public function me(): void
    {
        $userId = AdminMiddleware::require();
        $user = $this->userModel->findById($userId);

        if (!$user) {
            http_response_code(404);
            echo json_encode(['error' => 'Utilisateur non trouvé.']);
            return;
        }

        echo json_encode(['user' => $user]);
    }

    public function orders(): void
    {
        AdminMiddleware::require();
        $orders = $this->orderModel->findAll();

        echo json_encode([
            'orders' => $orders,
            'count' => count($orders),
        ]);
    }

    public function updateOrderStatus(int $orderId): void
    {
        AdminMiddleware::require();
        $data = json_decode(file_get_contents('php://input'), true);

        $validStatuses = ['pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled'];

        if (empty($data['status']) || !in_array($data['status'], $validStatuses)) {
            http_response_code(422);
            echo json_encode(['error' => 'Statut invalide.']);
            return;
        }

        $order = $this->orderModel->findById($orderId);
        if (!$order) {
            http_response_code(404);
            echo json_encode(['error' => 'Commande non trouvée.']);
            return;
        }

        $this->orderModel->updateStatus($orderId, $data['status']);
        $updatedOrder = $this->orderModel->findById($orderId);

        echo json_encode([
            'message' => 'Statut mis à jour.',
            'order' => $updatedOrder,
        ]);
    }
}
