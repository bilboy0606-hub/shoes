<?php
/**
 * Script temporaire pour créer le premier admin en production
 * ⚠️ SUPPRIMEZ CE FICHIER APRÈS UTILISATION !
 */

require_once __DIR__ . '/vendor/autoload.php';

// Load environment variables
$dotenv = Dotenv\Dotenv::createImmutable(__DIR__);
$dotenv->load();

try {
    // Database connection
    $db = new PDO(
        "mysql:host={$_ENV['DB_HOST']};port={$_ENV['DB_PORT']};dbname={$_ENV['DB_NAME']}",
        $_ENV['DB_USER'],
        $_ENV['DB_PASSWORD'],
        [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]
    );

    // Admin credentials - MODIFIEZ CES VALEURS !
    $email = 'bilboy0606@gmail.com';
    $password = 'VotreMotDePasseAdmin123!'; // CHANGEZ-MOI !
    $name = 'Admin KickFlow';

    // Check if admin already exists
    $check = $db->prepare("SELECT id FROM users WHERE email = ?");
    $check->execute([$email]);

    if ($check->fetch()) {
        die("❌ Un utilisateur avec cet email existe déjà !");
    }

    // Hash password
    $hashedPassword = password_hash($password, PASSWORD_BCRYPT);

    // Insert admin
    $stmt = $db->prepare("
        INSERT INTO users (email, password, name, is_admin, created_at, updated_at)
        VALUES (?, ?, ?, 1, NOW(), NOW())
    ");

    $stmt->execute([$email, $hashedPassword, $name]);

    echo "✅ Admin créé avec succès !<br>";
    echo "Email: {$email}<br>";
    echo "ID: " . $db->lastInsertId() . "<br><br>";
    echo "<strong>⚠️ IMPORTANT : Supprimez ce fichier immédiatement !</strong>";

} catch (PDOException $e) {
    die("❌ Erreur : " . $e->getMessage());
}
