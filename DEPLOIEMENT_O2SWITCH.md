# 🚀 Guide de Déploiement KickFlow sur O2Switch

## 📁 Structure sur O2Switch

```
public_html/
├── index.html                 # Frontend (build Vite)
├── assets/                    # CSS/JS compilés
├── api/                       # Backend PHP
│   ├── public/
│   │   └── index.php
│   ├── src/
│   ├── vendor/
│   └── .env
└── .htaccess                  # Redirection et configuration
```

---

## 🔧 ÉTAPE 1 : Préparer les fichiers en local

### 1.1 Build du Frontend

```bash
# Dans le dossier racine du projet
npm run build
```

Cela créera un dossier `dist/` avec tous les fichiers compilés.

### 1.2 Modifier .env.production

Éditez `.env.production` avec vos vraies URLs :

```env
VITE_API_URL=https://kickflow.fr/api
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_VOTRE_CLE_STRIPE
```

Puis rebuild :

```bash
npm run build
```

---

## 🗄️ ÉTAPE 2 : Configurer la base de données

### 2.1 Connexion à cPanel

1. Allez sur `https://cpanel.votre-domaine.fr`
2. Identifiants reçus par email O2Switch

### 2.2 Créer la base de données MySQL

1. **MySQL Database Wizard** (ou Bases de données MySQL)
2. Nom : `kickflow` (ou `votre_user_kickflow`)
3. Créer un utilisateur MySQL :
   - Username: `kickflow_user`
   - Mot de passe: **GÉNÉREZ UN MOT DE PASSE FORT**
   - Notez-le bien !
4. Assignez tous les privilèges à cet utilisateur

### 2.3 Importer le schéma

1. Ouvrez **phpMyAdmin** dans cPanel
2. Sélectionnez votre base de données
3. Onglet **Importer**
4. Uploadez `database/setup_complete.sql`
5. Cliquez sur **Exécuter**

### 2.4 Créer le compte admin

Dans phpMyAdmin, exécutez cette requête SQL :

```sql
-- Créer un utilisateur admin
INSERT INTO users (email, password, name, is_admin, created_at)
VALUES (
    'votre-email@example.com',
    '$2y$10$HASH_A_REMPLACER',  -- On le fera après upload
    'Admin',
    1,
    NOW()
);
```

**Note** : Le mot de passe sera hashé après l'upload, via un script.

---

## 📤 ÉTAPE 3 : Uploader les fichiers

### 3.1 Via FTP (FileZilla recommandé)

**Connexion FTP :**
- Hôte : `ftp.votre-domaine.fr`
- Utilisateur : votre username cPanel
- Mot de passe : votre mot de passe cPanel
- Port : 21 (ou 22 pour SFTP)

### 3.2 Structure d'upload

**Frontend (dossier `dist/`)** ➜ Uploadez TOUT le contenu dans `public_html/`

```
dist/index.html        ➜  public_html/index.html
dist/assets/*          ➜  public_html/assets/*
```

**Backend (dossier `backend/`)** ➜ Uploadez dans `public_html/api/`

```
backend/public/        ➜  public_html/api/public/
backend/src/           ➜  public_html/api/src/
backend/composer.json  ➜  public_html/api/composer.json
backend/composer.lock  ➜  public_html/api/composer.lock
backend/.env.example   ➜  public_html/api/.env.example
```

**⚠️ NE PAS uploader :**
- `node_modules/`
- `backend/vendor/`
- `.git/`
- `.env` (vous le créerez sur le serveur)

---

## ⚙️ ÉTAPE 4 : Configuration sur le serveur

### 4.1 Créer le fichier .env backend

Via **Gestionnaire de fichiers** cPanel :

1. Allez dans `public_html/api/`
2. Créez un nouveau fichier `.env`
3. Copiez le contenu de `.env.example` et modifiez :

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_NAME=votre_user_kickflow
DB_USER=kickflow_user
DB_PASSWORD=VOTRE_MOT_DE_PASSE_SQL

# JWT Configuration
JWT_SECRET=GÉNÉREZ_UNE_CLÉ_ALÉATOIRE_TRÈS_LONGUE_64_CARACTÈRES_MINIMUM
JWT_EXPIRATION=86400

# Stripe Configuration (PRODUCTION)
STRIPE_SECRET_KEY=sk_live_VOTRE_CLE_STRIPE_SECRETE
STRIPE_PUBLISHABLE_KEY=pk_live_VOTRE_CLE_STRIPE_PUBLIQUE
STRIPE_WEBHOOK_SECRET=whsec_VOTRE_SECRET_WEBHOOK

# URLs
FRONTEND_URL=https://kickflow.fr
API_URL=https://kickflow.fr/api

# Environment
APP_ENV=production
```

### 4.2 Installer Composer

Via **Terminal SSH** dans cPanel :

```bash
cd public_html/api
php composer.phar install --no-dev --optimize-autoloader
```

**OU** si composer n'est pas installé, utilisez le gestionnaire de fichiers pour uploader `vendor/` compilé localement.

### 4.3 Créer .htaccess racine

`public_html/.htaccess` :

```apache
# Force HTTPS
RewriteEngine On
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]

# API Routing
RewriteRule ^api/(.*)$ api/public/index.php [QSA,L]

# Frontend Routing (React Router)
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteCond %{REQUEST_URI} !^/api
RewriteRule . /index.html [L]
```

### 4.4 Créer .htaccess API

`public_html/api/public/.htaccess` :

```apache
RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^ index.php [QSA,L]

# Security headers
Header set X-Content-Type-Options "nosniff"
Header set X-Frame-Options "SAMEORIGIN"
Header set X-XSS-Protection "1; mode=block"

# CORS (si nécessaire)
Header set Access-Control-Allow-Origin "*"
Header set Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS"
Header set Access-Control-Allow-Headers "Content-Type, Authorization"
```

---

## 🔐 ÉTAPE 5 : Sécurité

### 5.1 Permissions des fichiers

Via SSH ou Gestionnaire de fichiers :

```bash
# Fichiers en lecture seule pour le serveur
find public_html/ -type f -exec chmod 644 {} \;

# Dossiers accessibles
find public_html/ -type d -exec chmod 755 {} \;

# .env doit être protégé
chmod 600 public_html/api/.env
```

### 5.2 Créer le premier admin avec mot de passe hashé

Créez un fichier temporaire `public_html/api/create_admin.php` :

```php
<?php
require_once __DIR__ . '/vendor/autoload.php';

$dotenv = Dotenv\Dotenv::createImmutable(__DIR__);
$dotenv->load();

$db = new PDO(
    "mysql:host={$_ENV['DB_HOST']};dbname={$_ENV['DB_NAME']}",
    $_ENV['DB_USER'],
    $_ENV['DB_PASSWORD']
);

$email = 'votre-email@example.com';
$password = password_hash('VotreMotDePasseAdmin123!', PASSWORD_BCRYPT);
$name = 'Admin KickFlow';

$stmt = $db->prepare("INSERT INTO users (email, password, name, is_admin) VALUES (?, ?, ?, 1)");
$stmt->execute([$email, $password, $name]);

echo "Admin créé avec succès !";
```

Accédez à `https://kickflow.fr/api/create_admin.php`

**⚠️ SUPPRIMEZ CE FICHIER IMMÉDIATEMENT APRÈS !**

---

## 🌐 ÉTAPE 6 : Configuration du domaine

### 6.1 Pointer le domaine

Dans votre registrar (OVH, Gandi, etc.) :

**Type A :**
- `@` ➜ IP du serveur O2Switch (fournie par O2Switch)
- `www` ➜ IP du serveur O2Switch

**Propagation DNS** : 24-48h max

### 6.2 Activer SSL (Let's Encrypt)

1. cPanel ➜ **SSL/TLS Status**
2. Sélectionnez votre domaine
3. Cliquez sur **Run AutoSSL**
4. Attendez la génération (~2 min)

---

## 🔔 ÉTAPE 7 : Configurer Stripe Webhooks

1. Allez sur **Stripe Dashboard** ➜ Developers ➜ Webhooks
2. Ajoutez un endpoint :
   - URL : `https://kickflow.fr/api/stripe/webhook`
   - Événements : `checkout.session.completed`, `checkout.session.expired`
3. Copiez le **Webhook Secret** (whsec_...)
4. Ajoutez-le dans `public_html/api/.env` :
   ```env
   STRIPE_WEBHOOK_SECRET=whsec_VOTRE_SECRET
   ```

---

## ✅ ÉTAPE 8 : Tests de production

### 8.1 Checklist

- [ ] Frontend charge : `https://kickflow.fr`
- [ ] Inscription fonctionne
- [ ] Connexion fonctionne
- [ ] Produits s'affichent
- [ ] Ajout au panier fonctionne
- [ ] Checkout Stripe fonctionne
- [ ] Codes promo fonctionnent
- [ ] Admin accessible : `https://kickflow.fr/admin-connect`
- [ ] Dashboard admin affiche les commandes
- [ ] Modification de statut fonctionne

### 8.2 Mode test Stripe

Pour tester en production SANS vraies transactions :

1. Gardez les clés **test** dans `.env` temporairement
2. Testez tout le flow
3. Remplacez par les clés **live** quand prêt

---

## 🐛 Dépannage

### Erreur 500 - Internal Server Error

- Vérifiez les logs PHP : cPanel ➜ Error Logs
- Permissions incorrectes sur `.env` ou dossiers
- Composer vendor/ manquant

### API ne répond pas

- Vérifiez `.htaccess` dans `public_html/`
- Vérifiez que `api/public/index.php` existe
- Testez directement : `https://kickflow.fr/api/public/index.php`

### Base de données ne se connecte pas

- Vérifiez `DB_HOST`, `DB_NAME`, `DB_USER`, `DB_PASSWORD` dans `.env`
- Vérifiez que l'utilisateur MySQL a bien les privilèges

### Frontend blanc (page vide)

- Vérifiez que `VITE_API_URL` est correct dans le build
- Ouvrez la console navigateur (F12) pour voir les erreurs
- Vérifiez que `index.html` et `assets/` sont bien uploadés

---

## 📊 Maintenance

### Logs

- **PHP Errors** : cPanel ➜ Metrics ➜ Errors
- **Access Logs** : cPanel ➜ Raw Access

### Backups

- **Base de données** : cPanel ➜ phpMyAdmin ➜ Export
- **Fichiers** : cPanel ➜ Backup ➜ Download Full Backup

---

## 🎉 Félicitations !

Votre site KickFlow est maintenant en ligne ! 🚀

Pour toute question : support@o2switch.fr
