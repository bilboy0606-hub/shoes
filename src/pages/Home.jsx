import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Filter, ChevronDown, Truck, Shield, RotateCcw, Package } from "lucide-react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import ProductCard from "../components/ProductCard";
import ProductQuickView from "../components/ProductQuickView";
import CartDrawer from "../components/CartDrawer";
import productService from "../services/productService";

const categories = [
  { id: "all", name: "Tous" },
  { id: "sneakers", name: "Sneakers" },
  { id: "running", name: "Running" },
  { id: "lifestyle", name: "Lifestyle" },
  { id: "basketball", name: "Basketball" },
];

const features = [
  { icon: Truck, title: "Livraison gratuite", desc: "Dès 100€ d'achat" },
  { icon: RotateCcw, title: "Retours gratuits", desc: "Sous 30 jours" },
  { icon: Shield, title: "Paiement sécurisé", desc: "SSL 256-bit" },
  { icon: Package, title: "Click & Collect", desc: "En 2h en magasin" },
];

export default function Home() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [wishlist, setWishlist] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    productService
      .getProducts()
      .then((data) => {
        if (data.products && data.products.length > 0) {
          setProducts(data.products);
        } else {
          setError("Aucun produit disponible");
        }
      })
      .catch((err) => {
        setError("Impossible de charger les produits");
        console.error("Error loading products:", err);
      })
      .finally(() => setLoading(false));
  }, []);

  const filteredProducts =
    activeCategory === "all"
      ? products
      : products.filter((p) => p.category === activeCategory);

  const toggleWishlist = (productId) => {
    setWishlist((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    );
  };

  return (
    <div className="min-h-screen bg-[#fafafa] text-zinc-900">
      <Header
        activeCategory={activeCategory}
        setActiveCategory={setActiveCategory}
        wishlistCount={wishlist.length}
      />

      {/* Hero */}
      <section className="relative bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 text-white overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1556906781-9a412961c28c?w=1920')] bg-cover bg-center opacity-20" />
        <div className="relative max-w-7xl mx-auto px-4 py-20 md:py-32">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl"
          >
            <span className="inline-block px-4 py-1 bg-white/20 backdrop-blur rounded-full text-sm mb-6">
              Nouvelle collection 2025
            </span>
            <h1 className="text-4xl md:text-6xl font-black mb-6 leading-tight">
              Trouvez votre
              <br />
              <span className="text-yellow-300">style parfait</span>
            </h1>
            <p className="text-lg text-white/80 mb-8 max-w-lg">
              Découvrez les dernières tendances en sneakers. Des classiques
              intemporels aux éditions limitées.
            </p>
            <div className="flex flex-wrap gap-4">
              <button
                onClick={() => {
                  setActiveCategory("all");
                  document
                    .getElementById("products")
                    ?.scrollIntoView({ behavior: "smooth" });
                }}
                className="px-8 py-4 bg-white text-zinc-900 font-bold rounded-full hover:bg-zinc-100 transition-colors"
              >
                Voir la collection
              </button>
              <button
                onClick={() => {
                  setActiveCategory("all");
                  document
                    .getElementById("products")
                    ?.scrollIntoView({ behavior: "smooth" });
                }}
                className="px-8 py-4 border-2 border-white/50 font-bold rounded-full hover:bg-white/10 transition-colors"
              >
                Nouveautés
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-white border-b border-zinc-200">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {features.map((feature, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-violet-100 flex items-center justify-center flex-shrink-0">
                  <feature.icon className="w-6 h-6 text-violet-600" />
                </div>
                <div>
                  <p className="font-semibold text-sm">{feature.title}</p>
                  <p className="text-xs text-zinc-500">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Products */}
      <section id="products" className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <h2 className="text-3xl font-bold">Nos produits</h2>
              <p className="text-zinc-500">{filteredProducts.length} articles</p>
            </div>

            {/* Mobile Categories */}
            <div className="flex gap-2 overflow-x-auto pb-2 md:hidden">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                    activeCategory === cat.id
                      ? "bg-zinc-900 text-white"
                      : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>

            <button className="hidden md:flex items-center gap-2 px-4 py-2 border border-zinc-200 rounded-lg hover:bg-zinc-50">
              <Filter className="w-4 h-4" />
              Filtres
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>

          {error ? (
            <div className="text-center py-20">
              <Package className="w-16 h-16 text-zinc-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-zinc-700 mb-2">{error}</h3>
              <p className="text-zinc-500">Veuillez réessayer plus tard ou contacter le support.</p>
            </div>
          ) : loading ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className="bg-white rounded-2xl overflow-hidden border border-zinc-100 animate-pulse"
                >
                  <div className="aspect-square bg-zinc-200" />
                  <div className="p-4 space-y-3">
                    <div className="h-3 bg-zinc-200 rounded w-1/3" />
                    <div className="h-4 bg-zinc-200 rounded w-2/3" />
                    <div className="h-3 bg-zinc-200 rounded w-1/2" />
                    <div className="h-5 bg-zinc-200 rounded w-1/4" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <motion.div
              layout
              className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6"
            >
              <AnimatePresence mode="popLayout">
                {filteredProducts.map((product, index) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    index={index}
                    isWishlisted={wishlist.includes(product.id)}
                    onToggleWishlist={toggleWishlist}
                    onQuickAdd={setSelectedProduct}
                  />
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </div>
      </section>

      {/* Newsletter */}
      <section className="bg-zinc-900 text-white py-16 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Rejoignez le club</h2>
          <p className="text-zinc-400 mb-8">
            Inscrivez-vous et recevez -10% sur votre première commande + les
            dernières nouveautés
          </p>
          <form
            className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
            onSubmit={(e) => e.preventDefault()}
          >
            <input
              type="email"
              placeholder="Votre email"
              className="flex-1 px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-full text-white placeholder-zinc-500 focus:outline-none focus:border-violet-500"
            />
            <button className="px-6 py-3 bg-violet-600 hover:bg-violet-700 font-semibold rounded-full transition-colors">
              S&apos;inscrire
            </button>
          </form>
        </div>
      </section>

      <Footer />

      {/* Cart Drawer */}
      <CartDrawer />

      {/* Product Quick View Modal */}
      {selectedProduct && (
        <ProductQuickView
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      )}
    </div>
  );
}
