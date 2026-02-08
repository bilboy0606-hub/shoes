<?php

namespace App\Controllers;

use App\Models\User;
use App\Middleware\AuthMiddleware;

class AuthController
{
    private User $userModel;

    public function __construct()
    {
        $this->userModel = new User();
    }

    public function register(): void
    {
        $data = json_decode(file_get_contents('php://input'), true);

        // Validation
        $errors = [];
        if (empty($data['email'])) {
            $errors[] = 'L\'email est requis.';
        } elseif (!filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
            $errors[] = 'L\'email n\'est pas valide.';
        }
        if (empty($data['password'])) {
            $errors[] = 'Le mot de passe est requis.';
        } elseif (strlen($data['password']) < 6) {
            $errors[] = 'Le mot de passe doit contenir au moins 6 caractères.';
        }
        if (empty($data['name'])) {
            $errors[] = 'Le nom est requis.';
        }

        if (!empty($errors)) {
            http_response_code(422);
            echo json_encode(['errors' => $errors]);
            return;
        }

        // Check if email already exists
        if ($this->userModel->emailExists($data['email'])) {
            http_response_code(409);
            echo json_encode(['error' => 'Un compte avec cet email existe déjà.']);
            return;
        }

        // Create user
        $user = $this->userModel->create($data['email'], $data['password'], $data['name']);
        $token = AuthMiddleware::generateToken($user['id']);

        http_response_code(201);
        echo json_encode([
            'message' => 'Compte créé avec succès.',
            'user' => $user,
            'token' => $token,
        ]);
    }

    public function login(): void
    {
        $data = json_decode(file_get_contents('php://input'), true);

        // Validation
        if (empty($data['email']) || empty($data['password'])) {
            http_response_code(422);
            echo json_encode(['error' => 'Email et mot de passe requis.']);
            return;
        }

        // Find user
        $user = $this->userModel->findByEmail($data['email']);

        if (!$user || !$this->userModel->verifyPassword($data['password'], $user['password'])) {
            http_response_code(401);
            echo json_encode(['error' => 'Email ou mot de passe incorrect.']);
            return;
        }

        $token = AuthMiddleware::generateToken($user['id']);

        // Remove password from response
        unset($user['password']);

        echo json_encode([
            'message' => 'Connexion réussie.',
            'user' => $user,
            'token' => $token,
        ]);
    }

    public function me(): void
    {
        $userId = AuthMiddleware::require();
        $user = $this->userModel->findById($userId);

        if (!$user) {
            http_response_code(404);
            echo json_encode(['error' => 'Utilisateur non trouvé.']);
            return;
        }

        echo json_encode(['user' => $user]);
    }

    public function updateProfile(): void
    {
        $userId = AuthMiddleware::require();
        $data = json_decode(file_get_contents('php://input'), true);

        // Validate email uniqueness if changed
        if (isset($data['email']) && $this->userModel->emailExists($data['email'], $userId)) {
            http_response_code(409);
            echo json_encode(['error' => 'Cet email est déjà utilisé.']);
            return;
        }

        $allowedFields = ['name', 'email', 'phone'];
        $updateData = array_intersect_key($data, array_flip($allowedFields));

        $user = $this->userModel->update($userId, $updateData);

        echo json_encode([
            'message' => 'Profil mis à jour.',
            'user' => $user,
        ]);
    }

    public function updatePassword(): void
    {
        $userId = AuthMiddleware::require();
        $data = json_decode(file_get_contents('php://input'), true);

        if (empty($data['current_password']) || empty($data['new_password'])) {
            http_response_code(422);
            echo json_encode(['error' => 'Mot de passe actuel et nouveau mot de passe requis.']);
            return;
        }

        if (strlen($data['new_password']) < 6) {
            http_response_code(422);
            echo json_encode(['error' => 'Le nouveau mot de passe doit contenir au moins 6 caractères.']);
            return;
        }

        // Verify current password
        $user = $this->userModel->findByEmail(
            $this->userModel->findById($userId)['email']
        );

        if (!$user || !$this->userModel->verifyPassword($data['current_password'], $user['password'])) {
            http_response_code(401);
            echo json_encode(['error' => 'Mot de passe actuel incorrect.']);
            return;
        }

        $this->userModel->updatePassword($userId, $data['new_password']);

        echo json_encode(['message' => 'Mot de passe mis à jour avec succès.']);
    }
}
