<?php

namespace App\Middleware;

use Firebase\JWT\JWT;
use Firebase\JWT\Key;
use Firebase\JWT\ExpiredException;

class AuthMiddleware
{
    /**
     * Validate JWT token and return user_id.
     * Returns null if token is invalid or missing.
     */
    public static function authenticate(): ?int
    {
        $headers = getallheaders();
        $authHeader = $headers['Authorization'] ?? $headers['authorization'] ?? '';

        if (empty($authHeader) || !str_starts_with($authHeader, 'Bearer ')) {
            return null;
        }

        $token = substr($authHeader, 7);

        try {
            $decoded = JWT::decode($token, new Key($_ENV['JWT_SECRET'], 'HS256'));
            return (int) $decoded->user_id;
        } catch (ExpiredException $e) {
            return null;
        } catch (\Exception $e) {
            return null;
        }
    }

    /**
     * Require authentication - sends 401 if not authenticated.
     * Returns user_id if authenticated.
     */
    public static function require(): int
    {
        $userId = self::authenticate();

        if ($userId === null) {
            http_response_code(401);
            echo json_encode(['error' => 'Non autorisé. Token invalide ou expiré.']);
            exit;
        }

        return $userId;
    }

    /**
     * Generate a JWT token for a user.
     */
    public static function generateToken(int $userId): string
    {
        $issuedAt = time();
        $expiration = $issuedAt + (int) ($_ENV['JWT_EXPIRATION'] ?? 86400);

        $payload = [
            'iss' => $_ENV['API_URL'] ?? 'kickstore-api',
            'iat' => $issuedAt,
            'exp' => $expiration,
            'user_id' => $userId,
        ];

        return JWT::encode($payload, $_ENV['JWT_SECRET'], 'HS256');
    }
}
