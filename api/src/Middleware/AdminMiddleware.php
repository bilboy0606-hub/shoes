<?php

namespace App\Middleware;

use App\Models\User;

class AdminMiddleware
{
    public static function require(): int
    {
        $userId = AuthMiddleware::require();

        $userModel = new User();
        $user = $userModel->findById($userId);

        if (!$user || !$user['is_admin']) {
            http_response_code(403);
            echo json_encode(['error' => 'Accès réservé aux administrateurs.']);
            exit;
        }

        return $userId;
    }
}
