import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShoppingBag, Heart, Search, User, Menu, X, ChevronRight, LogOut,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { useCart } from "../contexts/CartContext";

const categories = [
  { id: "all", name: "Tous" },
  { id: "sneakers", name: "Sneakers" },
  { id: "running", name: "Running" },
  { id: "lifestyle", name: "Lifestyle" },
  { id: "basketball", name: "Basketball" },
];

export default function Header({ activeCategory, setActiveCategory, wishlistCount = 0 }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const { isAuthenticated, user, logout } = useAuth();
  const { cartCount, setIsCartOpen } = useCart();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-white border-b border-zinc-200">
        {/* Top bar */}
        <div className="bg-zinc-900 text-white text-xs py-2 px-4 text-center">
          <span>🎉 Soldes d&apos;hiver : -20% sur tout le site avec le code WINTER20</span>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-4">
            {/* Logo */}
            <Link to="/" className="text-2xl font-black tracking-tight">
              KICK<span className="text-violet-600">STORE</span>
            </Link>

            {/* Desktop Nav */}
            {setActiveCategory && (
              <nav className="hidden lg:flex items-center gap-8">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id)}
                    className={`text-sm font-medium transition-colors ${
                      activeCategory === cat.id
                        ? "text-violet-600"
                        : "text-zinc-600 hover:text-zinc-900"
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </nav>
            )}

            {/* Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setSearchOpen(true)}
                className="p-2 hover:bg-zinc-100 rounded-full transition-colors"
              >
                <Search className="w-5 h-5" />
              </button>
              <button className="p-2 hover:bg-zinc-100 rounded-full transition-colors relative">
                <Heart className="w-5 h-5" />
                {wishlistCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-violet-600 text-white text-xs rounded-full flex items-center justify-center">
                    {wishlistCount}
                  </span>
                )}
              </button>
              <button
                onClick={() => setIsCartOpen(true)}
                className="p-2 hover:bg-zinc-100 rounded-full transition-colors relative"
              >
                <ShoppingBag className="w-5 h-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-violet-600 text-white text-xs rounded-full flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </button>

              {/* Auth buttons */}
              {isAuthenticated ? (
                <div className="hidden md:flex items-center gap-2">
                  <Link
                    to="/dashboard"
                    className="flex items-center gap-2 px-3 py-2 hover:bg-zinc-100 rounded-full transition-colors"
                  >
                    <User className="w-5 h-5" />
                    <span className="text-sm font-medium">{user?.name?.split(' ')[0]}</span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="p-2 hover:bg-zinc-100 rounded-full transition-colors text-zinc-400 hover:text-zinc-600"
                    title="Déconnexion"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <Link
                  to="/login"
                  className="hidden md:flex items-center gap-2 px-4 py-2 bg-zinc-900 text-white rounded-full hover:bg-zinc-800 transition-colors text-sm font-medium"
                >
                  <User className="w-4 h-4" />
                  Connexion
                </Link>
              )}

              <button
                onClick={() => setIsMenuOpen(true)}
                className="lg:hidden p-2 hover:bg-zinc-100 rounded-full transition-colors"
              >
                <Menu className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMenuOpen(false)}
              className="fixed inset-0 bg-black/50 z-50"
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "tween", duration: 0.3 }}
              className="fixed top-0 left-0 bottom-0 w-80 bg-white z-50"
            >
              <div className="flex items-center justify-between p-4 border-b">
                <span className="text-lg font-bold">Menu</span>
                <button
                  onClick={() => setIsMenuOpen(false)}
                  className="p-2 hover:bg-zinc-100 rounded-full"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Auth section mobile */}
              <div className="p-4 border-b">
                {isAuthenticated ? (
                  <div className="space-y-2">
                    <Link
                      to="/dashboard"
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 bg-zinc-50 rounded-lg"
                    >
                      <User className="w-5 h-5 text-violet-600" />
                      <div>
                        <p className="font-medium">{user?.name}</p>
                        <p className="text-xs text-zinc-500">{user?.email}</p>
                      </div>
                    </Link>
                    <button
                      onClick={() => {
                        handleLogout();
                        setIsMenuOpen(false);
                      }}
                      className="flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg w-full"
                    >
                      <LogOut className="w-5 h-5" />
                      Déconnexion
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <Link
                      to="/login"
                      onClick={() => setIsMenuOpen(false)}
                      className="flex-1 py-2 text-center bg-zinc-900 text-white rounded-lg font-medium text-sm"
                    >
                      Connexion
                    </Link>
                    <Link
                      to="/register"
                      onClick={() => setIsMenuOpen(false)}
                      className="flex-1 py-2 text-center border border-zinc-300 rounded-lg font-medium text-sm"
                    >
                      Inscription
                    </Link>
                  </div>
                )}
              </div>

              <nav className="p-4 space-y-2">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => {
                      if (setActiveCategory) setActiveCategory(cat.id);
                      setIsMenuOpen(false);
                      navigate('/');
                    }}
                    className="w-full text-left px-4 py-3 rounded-lg hover:bg-zinc-100 font-medium flex items-center justify-between"
                  >
                    {cat.name}
                    <ChevronRight className="w-5 h-5 text-zinc-400" />
                  </button>
                ))}
              </nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Search Modal */}
      <AnimatePresence>
        {searchOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSearchOpen(false)}
              className="fixed inset-0 bg-black/50 z-50"
            />
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="fixed top-0 left-0 right-0 bg-white z-50 p-4"
            >
              <div className="max-w-2xl mx-auto">
                <div className="flex items-center gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
                    <input
                      type="text"
                      placeholder="Rechercher un produit..."
                      autoFocus
                      className="w-full pl-12 pr-4 py-3 bg-zinc-100 rounded-full focus:outline-none focus:ring-2 focus:ring-violet-500"
                    />
                  </div>
                  <button
                    onClick={() => setSearchOpen(false)}
                    className="p-2 hover:bg-zinc-100 rounded-full"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
