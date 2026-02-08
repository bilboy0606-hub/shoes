<?php

/**
 * KickStore API - Main Router
 * All API requests are routed through this file.
 */

// Autoloader Composer
require_once __DIR__ . '/../vendor/autoload.php';

// Load environment variables
$dotenv = Dotenv\Dotenv::createImmutable(__DIR__ . '/..');
$dotenv->load();

// Apply CORS middleware
\App\Middleware\CorsMiddleware::handle();

// Database connection
$pdo = \App\Config\Database::getConnection();
$GLOBALS['pdo'] = $pdo;

// Get request method and URI
$method = $_SERVER['REQUEST_METHOD'];
$uri = $_SERVER['REQUEST_URI'];

// Remove query string and clean URI
$uri = parse_url($uri, PHP_URL_PATH);
$uri = rtrim($uri, '/');

// Remove /shoes/api prefix if present (for O2Switch subdirectory deployment)
$uri = preg_replace('#^/shoes/api#', '', $uri);
// Also handle /api prefix for backward compatibility
$uri = preg_replace('#^/api#', '', $uri);

// Simple router
try {
    // ============ AUTH ROUTES ============
    if ($method === 'POST' && $uri === '/auth/register') {
        (new \App\Controllers\AuthController())->register();
    }
    elseif ($method === 'POST' && $uri === '/auth/login') {
        (new \App\Controllers\AuthController())->login();
    }
    elseif ($method === 'GET' && $uri === '/auth/me') {
        (new \App\Controllers\AuthController())->me();
    }
    elseif ($method === 'PUT' && $uri === '/auth/profile') {
        (new \App\Controllers\AuthController())->updateProfile();
    }
    elseif ($method === 'PUT' && $uri === '/auth/password') {
        (new \App\Controllers\AuthController())->updatePassword();
    }

    // ============ PRODUCT ROUTES ============
    elseif ($method === 'GET' && $uri === '/products') {
        (new \App\Controllers\ProductController())->index();
    }
    elseif ($method === 'GET' && preg_match('#^/products/(\d+)$#', $uri, $matches)) {
        (new \App\Controllers\ProductController())->show((int) $matches[1]);
    }
    elseif ($method === 'GET' && $uri === '/products/categories') {
        (new \App\Controllers\ProductController())->categories();
    }
    elseif ($method === 'GET' && $uri === '/products/brands') {
        (new \App\Controllers\ProductController())->brands();
    }

    // ============ ORDER ROUTES ============
    elseif ($method === 'GET' && $uri === '/orders') {
        (new \App\Controllers\OrderController())->index();
    }
    elseif ($method === 'POST' && $uri === '/orders') {
        (new \App\Controllers\OrderController())->create();
    }
    elseif ($method === 'GET' && preg_match('#^/orders/(\d+)$#', $uri, $matches)) {
        (new \App\Controllers\OrderController())->show((int) $matches[1]);
    }

    // ============ CART ROUTES ============
    elseif ($method === 'GET' && $uri === '/cart') {
        (new \App\Controllers\CartController())->index();
    }
    elseif ($method === 'POST' && $uri === '/cart') {
        (new \App\Controllers\CartController())->add();
    }
    elseif ($method === 'PUT' && $uri === '/cart') {
        (new \App\Controllers\CartController())->update();
    }
    elseif ($method === 'DELETE' && $uri === '/cart') {
        (new \App\Controllers\CartController())->remove();
    }
    elseif ($method === 'DELETE' && $uri === '/cart/clear') {
        (new \App\Controllers\CartController())->clear();
    }
    elseif ($method === 'POST' && $uri === '/cart/sync') {
        (new \App\Controllers\CartController())->sync();
    }

    // ============ STRIPE ROUTES ============
    elseif ($method === 'POST' && $uri === '/stripe/create-checkout-session') {
        (new \App\Controllers\StripeController())->createCheckoutSession();
    }
    elseif ($method === 'GET' && $uri === '/stripe/verify-session') {
        (new \App\Controllers\StripeController())->verifySession();
    }
    elseif ($method === 'POST' && $uri === '/stripe/webhook') {
        (new \App\Controllers\StripeController())->handleWebhook();
    }

    // ============ PROMO CODE ROUTES ============
    elseif ($method === 'POST' && $uri === '/promo/validate') {
        (new \App\Controllers\PromoController($pdo))->validate();
    }

    // ============ ADMIN ROUTES ============
    elseif ($method === 'POST' && $uri === '/admin/login') {
        (new \App\Controllers\AdminController())->login();
    }
    elseif ($method === 'GET' && $uri === '/admin/me') {
        (new \App\Controllers\AdminController())->me();
    }
    elseif ($method === 'GET' && $uri === '/admin/orders') {
        (new \App\Controllers\AdminController())->orders();
    }
    elseif ($method === 'PUT' && preg_match('#^/admin/orders/(\d+)/status$#', $uri, $matches)) {
        (new \App\Controllers\AdminController())->updateOrderStatus((int) $matches[1]);
    }
    elseif ($method === 'GET' && $uri === '/admin/promos') {
        (new \App\Controllers\PromoController($pdo))->list();
    }
    elseif ($method === 'POST' && $uri === '/admin/promos') {
        (new \App\Controllers\PromoController($pdo))->create();
    }
    elseif ($method === 'PUT' && preg_match('#^/admin/promos/(\d+)$#', $uri, $matches)) {
        (new \App\Controllers\PromoController($pdo))->update((int) $matches[1]);
    }
    elseif ($method === 'DELETE' && preg_match('#^/admin/promos/(\d+)$#', $uri, $matches)) {
        (new \App\Controllers\PromoController($pdo))->delete((int) $matches[1]);
    }

    // ============ HEALTH CHECK ============
    elseif ($method === 'GET' && ($uri === '' || $uri === '/')) {
        echo json_encode([
            'name' => 'KickStore API',
            'version' => '1.0.0',
            'status' => 'ok',
        ]);
    }

    // ============ 404 ============
    else {
        http_response_code(404);
        echo json_encode(['error' => 'Route non trouvée.']);
    }
} catch (\Exception $e) {
    http_response_code(500);
    $response = ['error' => 'Erreur interne du serveur.'];

    // Show detailed error in development
    if (($_ENV['APP_ENV'] ?? 'production') === 'development') {
        $response['message'] = $e->getMessage();
        $response['file'] = $e->getFile();
        $response['line'] = $e->getLine();
    }

    echo json_encode($response);
}
