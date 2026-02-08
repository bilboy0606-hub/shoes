<?php

namespace App\Controllers;

use App\Models\Order;
use App\Models\Product;
use App\Models\PromoCode;
use App\Middleware\AuthMiddleware;
use Stripe\Stripe;
use Stripe\Checkout\Session;
use Stripe\Webhook;

class StripeController
{
    private Order $orderModel;
    private Product $productModel;
    private PromoCode $promoModel;

    public function __construct()
    {
        $this->orderModel = new Order();
        $this->productModel = new Product();
        $this->promoModel = new PromoCode($GLOBALS['pdo']);
    }

    public function createCheckoutSession(): void
    {
        $userId = AuthMiddleware::require();
        $data = json_decode(file_get_contents('php://input'), true);

        // Validation
        if (empty($data['items']) || !is_array($data['items'])) {
            http_response_code(422);
            echo json_encode(['error' => 'Les articles sont requis.']);
            return;
        }
        if (empty($data['shipping'])) {
            http_response_code(422);
            echo json_encode(['error' => 'Les informations de livraison sont requises.']);
            return;
        }

        // Check if Stripe is configured
        // TEMPORARY: Hardcoded key for testing - env vars not loading in web context
        $stripeKey = 'sk_test_51Sh8WqJOyiavn3rADOZfdNRlqhEMHaffVLR1d8As2JY2AUWHUCM4jaQ0OpAcjDksWjFqN5EffvRXxmwc03nOtNPk00iSGXB1DE';
        // $stripeKey = getenv('STRIPE_SECRET_KEY') ?: ($_ENV['STRIPE_SECRET_KEY'] ?? '');
        if (empty($stripeKey) || str_starts_with($stripeKey, 'sk_test_REPLACE') || $stripeKey === 'sk_test_') {
            http_response_code(503);
            echo json_encode([
                'error' => 'Les paiements sont momentanément indisponibles. Veuillez réessayer plus tard.',
            ]);
            return;
        }

        // Validate and apply promo code if provided first
        $promoCode = $data['promoCode'] ?? null;
        $discount = 0;
        $originalTotal = 0;
        $discountMultiplier = 1.0;

        // Calculate original total first
        foreach ($data['items'] as $item) {
            $product = $this->productModel->getById((int) $item['product_id']);
            if (!$product) {
                http_response_code(404);
                echo json_encode(['error' => "Produit #{$item['product_id']} non trouvé."]);
                return;
            }
            $originalTotal += (float) $product['price'] * $item['quantity'];
        }

        if ($promoCode) {
            $validation = $this->promoModel->validate($promoCode, $originalTotal);
            if ($validation['valid']) {
                $discount = $this->promoModel->calculateDiscount($validation['promo'], $originalTotal);
                // Calculate discount multiplier (e.g., 0.9 for 10% off)
                $discountMultiplier = 1 - ($discount / $originalTotal);
            }
        }

        // Build line items for Stripe with discounted prices
        $lineItems = [];
        $total = 0;

        foreach ($data['items'] as $item) {
            $product = $this->productModel->getById((int) $item['product_id']);
            if (!$product) {
                http_response_code(404);
                echo json_encode(['error' => "Produit #{$item['product_id']} non trouvé."]);
                return;
            }

            $originalPrice = (float) $product['price'];
            $discountedPrice = $originalPrice * $discountMultiplier;
            $total += $discountedPrice * $item['quantity'];

            // Build product name with discount info if applicable
            $productName = $product['brand'] . ' ' . $product['name'];
            if ($discount > 0) {
                $productName .= " (Code: {$promoCode})";
            }

            $lineItems[] = [
                'price_data' => [
                    'currency' => 'eur',
                    'product_data' => [
                        'name' => $productName,
                        'description' => "Taille: {$item['size']}",
                        'images' => [$product['image_url']],
                    ],
                    'unit_amount' => (int) round($discountedPrice * 100),
                ],
                'quantity' => (int) $item['quantity'],
            ];
        }

        // Create Stripe Checkout Session (NO order created yet)
        Stripe::setApiKey($stripeKey);
        $frontendUrl = getenv('FRONTEND_URL') ?: ($_ENV['FRONTEND_URL'] ?? 'http://kota1639.odns.fr/shoes');
        try {
            $session = Session::create([
                'payment_method_types' => ['card'],
                'line_items' => $lineItems,
                'mode' => 'payment',
                'success_url' => $frontendUrl . '/order-success?session_id={CHECKOUT_SESSION_ID}',
                'cancel_url' => $frontendUrl . '/checkout',
                'metadata' => [
                    'user_id' => $userId,
                    'items' => json_encode($data['items']),
                    'shipping' => json_encode($data['shipping']),
                    'email' => $data['email'] ?? '',
                    'promo_code' => $promoCode ?? '',
                    'discount_amount' => (string) $discount,
                    'original_total' => (string) $originalTotal,
                ],
                'customer_email' => $data['email'] ?? null,
            ]);

            echo json_encode([
                'url' => $session->url,
                'session_id' => $session->id,
            ]);
        } catch (\Stripe\Exception\ApiErrorException $e) {
            http_response_code(503);
            echo json_encode(['error' => 'Les paiements sont momentanément indisponibles. Veuillez réessayer plus tard.']);
        }
    }

    public function verifySession(): void
    {
        $userId = AuthMiddleware::require();
        $sessionId = $_GET['session_id'] ?? '';

        if (empty($sessionId)) {
            http_response_code(422);
            echo json_encode(['error' => 'session_id est requis.']);
            return;
        }

        $stripeKey = $_ENV['STRIPE_SECRET_KEY'] ?? '';
        Stripe::setApiKey($stripeKey);

        try {
            $session = Session::retrieve($sessionId);

            // Check this session belongs to the user
            $sessionUserId = (int) ($session->metadata->user_id ?? 0);
            if ($sessionUserId !== $userId) {
                http_response_code(403);
                echo json_encode(['error' => 'Accès non autorisé.']);
                return;
            }

            // Check if order already exists for this session
            $existingOrder = $this->orderModel->findByStripeSession($sessionId);
            if ($existingOrder) {
                echo json_encode(['order' => $existingOrder]);
                return;
            }

            // Only create order if payment is confirmed
            if ($session->payment_status !== 'paid') {
                http_response_code(402);
                echo json_encode(['error' => 'Le paiement n\'a pas été confirmé.']);
                return;
            }

            // Decode items and shipping from metadata
            $items = json_decode($session->metadata->items ?? '[]', true);
            $shipping = json_decode($session->metadata->shipping ?? '{}', true);
            $promoCode = $session->metadata->promo_code ?? null;
            $discountAmount = (float) ($session->metadata->discount_amount ?? 0);
            $originalTotal = (float) ($session->metadata->original_total ?? 0);

            // Enrich items with product data from DB
            $orderItems = [];
            $total = 0;
            foreach ($items as $item) {
                $product = $this->productModel->getById((int) $item['product_id']);
                if (!$product) {
                    continue;
                }
                $price = (float) $product['price'];
                $total += $price * (int) $item['quantity'];

                $orderItems[] = [
                    'product_id' => $item['product_id'],
                    'product_name' => $product['brand'] . ' ' . $product['name'],
                    'product_brand' => $product['brand'],
                    'product_image' => $product['image_url'],
                    'size' => $item['size'],
                    'quantity' => $item['quantity'],
                    'price' => $price,
                ];
            }

            // Apply discount if promo code was used
            if ($discountAmount > 0) {
                $total = max(0, $total - $discountAmount);
            }

            // Create order with status 'paid' directly
            $orderId = $this->orderModel->create(
                $userId,
                $total,
                $orderItems,
                $shipping,
                $promoCode,
                $discountAmount,
                $originalTotal > 0 ? $originalTotal : null
            );
            $this->orderModel->updateStatus($orderId, 'paid');
            $this->orderModel->setStripeSession($orderId, $sessionId);

            // Increment promo code usage if used
            if ($promoCode) {
                $promo = $this->promoModel->findByCode($promoCode);
                if ($promo) {
                    $this->promoModel->incrementUsage((int) $promo['id']);
                }
            }

            if (!empty($session->payment_intent)) {
                $this->orderModel->setStripePaymentIntent($orderId, $session->payment_intent);
            }

            $order = $this->orderModel->findById($orderId, $userId);
            echo json_encode(['order' => $order]);
        } catch (\Stripe\Exception\ApiErrorException $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Impossible de vérifier le paiement.']);
        }
    }

    public function handleWebhook(): void
    {
        $payload = file_get_contents('php://input');
        $sigHeader = $_SERVER['HTTP_STRIPE_SIGNATURE'] ?? '';

        try {
            $event = Webhook::constructEvent(
                $payload,
                $sigHeader,
                $_ENV['STRIPE_WEBHOOK_SECRET']
            );
        } catch (\UnexpectedValueException $e) {
            http_response_code(400);
            echo json_encode(['error' => 'Invalid payload']);
            return;
        } catch (\Stripe\Exception\SignatureVerificationException $e) {
            http_response_code(400);
            echo json_encode(['error' => 'Invalid signature']);
            return;
        }

        switch ($event->type) {
            case 'checkout.session.completed':
                $session = $event->data->object;

                // Check if order already created (via verifySession)
                $existingOrder = $this->orderModel->findByStripeSession($session->id);
                if ($existingOrder) {
                    // Just make sure status is paid
                    if ($existingOrder['status'] === 'pending') {
                        $this->orderModel->updateStatus((int) $existingOrder['id'], 'paid');
                    }
                    break;
                }

                // Create order from webhook (backup if verifySession didn't run)
                $userId = (int) ($session->metadata->user_id ?? 0);
                if ($userId > 0 && $session->payment_status === 'paid') {
                    $items = json_decode($session->metadata->items ?? '[]', true);
                    $shipping = json_decode($session->metadata->shipping ?? '{}', true);

                    $orderItems = [];
                    $total = 0;
                    foreach ($items as $item) {
                        $product = $this->productModel->getById((int) $item['product_id']);
                        if (!$product) continue;
                        $price = (float) $product['price'];
                        $total += $price * (int) $item['quantity'];
                        $orderItems[] = [
                            'product_id' => $item['product_id'],
                            'product_name' => $product['brand'] . ' ' . $product['name'],
                            'product_brand' => $product['brand'],
                            'product_image' => $product['image_url'],
                            'size' => $item['size'],
                            'quantity' => $item['quantity'],
                            'price' => $price,
                        ];
                    }

                    if (!empty($orderItems)) {
                        $orderId = $this->orderModel->create($userId, $total, $orderItems, $shipping);
                        $this->orderModel->updateStatus($orderId, 'paid');
                        $this->orderModel->setStripeSession($orderId, $session->id);
                        if (!empty($session->payment_intent)) {
                            $this->orderModel->setStripePaymentIntent($orderId, $session->payment_intent);
                        }
                    }
                }
                break;

            case 'checkout.session.expired':
                // Nothing to do - no order was created
                break;
        }

        http_response_code(200);
        echo json_encode(['received' => true]);
    }
}
