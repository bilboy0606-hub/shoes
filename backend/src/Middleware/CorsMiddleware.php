<?php

namespace App\Middleware;

class CorsMiddleware
{
    public static function handle(): void
    {
        $allowedOrigin = $_ENV['FRONTEND_URL'] ?? 'http://localhost:5176';

        // In development, allow any localhost port
        if (($_ENV['APP_ENV'] ?? 'production') === 'development') {
            $origin = $_SERVER['HTTP_ORIGIN'] ?? '';
            if (preg_match('/^http:\/\/localhost(:\d+)?$/', $origin)) {
                $allowedOrigin = $origin;
            }
        }

        header("Access-Control-Allow-Origin: $allowedOrigin");
        header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
        header('Access-Control-Allow-Headers: Content-Type, Authorization');
        header('Access-Control-Allow-Credentials: true');
        header('Content-Type: application/json; charset=utf-8');

        // Handle preflight OPTIONS request
        if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
            http_response_code(200);
            exit;
        }
    }
}
