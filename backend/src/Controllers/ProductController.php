<?php

namespace App\Controllers;

use App\Models\Product;

class ProductController
{
    private Product $productModel;

    public function __construct()
    {
        $this->productModel = new Product();
    }

    public function index(): void
    {
        $category = $_GET['category'] ?? null;
        $brand = $_GET['brand'] ?? null;

        $products = $this->productModel->getAll($category, $brand);

        echo json_encode([
            'products' => $products,
            'count' => count($products),
        ]);
    }

    public function show(int $id): void
    {
        $product = $this->productModel->getById($id);

        if (!$product) {
            http_response_code(404);
            echo json_encode(['error' => 'Produit non trouvé.']);
            return;
        }

        echo json_encode(['product' => $product]);
    }

    public function categories(): void
    {
        $categories = $this->productModel->getCategories();
        echo json_encode(['categories' => $categories]);
    }

    public function brands(): void
    {
        $brands = $this->productModel->getBrands();
        echo json_encode(['brands' => $brands]);
    }
}
