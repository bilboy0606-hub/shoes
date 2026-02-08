import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft, CreditCard, MapPin, Truck, Shield, AlertCircle, Loader2, Tag, CheckCircle2,
} from "lucide-react";
import { useCart } from "../contexts/CartContext";
import { useAuth } from "../contexts/AuthContext";
import orderService from "../services/orderService";
import api from "../services/api";
import Header from "../components/Header";
import Footer from "../components/Footer";
import CartDrawer from "../components/CartDrawer";

export default function Checkout() {
  const { cart, cartTotal, cartCount, getCartItemsForAPI, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [shipping, setShipping] = useState({
    name: user?.name || "",
    address: "",
    city: "",
    postal_code: "",
    country: "France",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Promo code state
  const [promoCode, setPromoCode] = useState("");
  const [promoData, setPromoData] = useState(null);
  const [promoLoading, setPromoLoading] = useState(false);
  const [promoError, setPromoError] = useState("");

  // If user cancelled from Stripe and came back, remove the pending flag
  useEffect(() => {
    localStorage.removeItem('kickstore_pending_payment');
  }, []);

  const shippingCost = cartTotal >= 100 ? 0 : 4.99;
  const discount = promoData?.discount || 0;
  const total = cartTotal + shippingCost - discount;

  const applyPromoCode = async () => {
    if (!promoCode.trim()) {
      setPromoError("Veuillez saisir un code promo");
      return;
    }

    setPromoLoading(true);
    setPromoError("");

    try {
      const response = await api.post("/promo/validate", {
        code: promoCode.trim().toUpperCase(),
        orderTotal: cartTotal,
      });

      setPromoData(response.data);
      setPromoError("");
    } catch (err) {
      setPromoData(null);
      setPromoError(
        err.response?.data?.error || "Code promo invalide"
      );
    } finally {
      setPromoLoading(false);
    }
  };

  const removePromoCode = () => {
    setPromoCode("");
    setPromoData(null);
    setPromoError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const checkoutData = {
        items: getCartItemsForAPI(),
        shipping,
        email: user?.email,
        promoCode: promoData?.promo?.code || null,
      };

      const data = await orderService.createCheckoutSession(checkoutData);

      if (data.url) {
        // Flag that payment is in progress - cart will be cleared on return
        localStorage.setItem('kickstore_pending_payment', 'true');
        window.location.href = data.url;
      }
    } catch (err) {
      const message =
        err.response?.data?.error ||
        err.response?.data?.errors?.[0] ||
        "Erreur lors de la création de la commande. Veuillez réessayer.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-[#fafafa]">
        <Header />
        <CartDrawer />
        <div className="max-w-2xl mx-auto px-4 py-20 text-center">
          <CreditCard className="w-16 h-16 text-zinc-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Votre panier est vide</h2>
          <p className="text-zinc-500 mb-6">
            Ajoutez des articles pour passer commande.
          </p>
          <Link
            to="/"
            className="inline-flex px-6 py-3 bg-zinc-900 text-white font-semibold rounded-full hover:bg-zinc-800"
          >
            Continuer mes achats
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fafafa]">
      <Header />
      <CartDrawer />

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Back link */}
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-900 mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Continuer mes achats
        </Link>

        <h1 className="text-3xl font-bold mb-8">Passer commande</h1>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 p-4 mb-6 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm"
          >
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            {error}
          </motion.div>
        )}

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left - Form */}
          <div className="flex-1">
            <form onSubmit={handleSubmit} id="checkout-form">
              {/* Shipping address */}
              <div className="bg-white rounded-2xl border border-zinc-100 p-6 mb-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-lg bg-violet-100 flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-violet-600" />
                  </div>
                  <div>
                    <h2 className="font-semibold text-lg">
                      Adresse de livraison
                    </h2>
                    <p className="text-sm text-zinc-500">
                      Où souhaitez-vous recevoir votre commande ?
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-zinc-700 mb-2">
                      Nom complet
                    </label>
                    <input
                      type="text"
                      value={shipping.name}
                      onChange={(e) =>
                        setShipping({ ...shipping, name: e.target.value })
                      }
                      required
                      placeholder="Jean Dupont"
                      className="w-full px-4 py-3 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-zinc-700 mb-2">
                      Adresse
                    </label>
                    <input
                      type="text"
                      value={shipping.address}
                      onChange={(e) =>
                        setShipping({ ...shipping, address: e.target.value })
                      }
                      required
                      placeholder="12 rue de la Paix"
                      className="w-full px-4 py-3 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 mb-2">
                      Ville
                    </label>
                    <input
                      type="text"
                      value={shipping.city}
                      onChange={(e) =>
                        setShipping({ ...shipping, city: e.target.value })
                      }
                      required
                      placeholder="Paris"
                      className="w-full px-4 py-3 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 mb-2">
                      Code postal
                    </label>
                    <input
                      type="text"
                      value={shipping.postal_code}
                      onChange={(e) =>
                        setShipping({
                          ...shipping,
                          postal_code: e.target.value,
                        })
                      }
                      required
                      placeholder="75001"
                      className="w-full px-4 py-3 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-zinc-700 mb-2">
                      Pays
                    </label>
                    <select
                      value={shipping.country}
                      onChange={(e) =>
                        setShipping({ ...shipping, country: e.target.value })
                      }
                      className="w-full px-4 py-3 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500"
                    >
                      <option value="France">France</option>
                      <option value="Belgique">Belgique</option>
                      <option value="Suisse">Suisse</option>
                      <option value="Luxembourg">Luxembourg</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Security notice */}
              <div className="bg-white rounded-2xl border border-zinc-100 p-6">
                <div className="flex items-center gap-3">
                  <Shield className="w-5 h-5 text-emerald-600" />
                  <div>
                    <p className="font-medium text-sm">Paiement sécurisé</p>
                    <p className="text-xs text-zinc-500">
                      Vous serez redirigé vers Stripe pour effectuer votre
                      paiement de manière sécurisée.
                    </p>
                  </div>
                </div>
              </div>
            </form>
          </div>

          {/* Right - Order summary */}
          <div className="lg:w-96">
            <div className="bg-white rounded-2xl border border-zinc-100 p-6 sticky top-28">
              <h2 className="font-semibold text-lg mb-4">
                Récapitulatif ({cartCount} article{cartCount > 1 ? "s" : ""})
              </h2>

              {/* Cart items */}
              <div className="space-y-4 mb-6 max-h-64 overflow-auto">
                {cart.map((item) => (
                  <div
                    key={`${item.id}-${item.size}`}
                    className="flex gap-3"
                  >
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-16 h-16 rounded-lg object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">
                        {item.name}
                      </p>
                      <p className="text-xs text-zinc-500">
                        Taille {item.size} &middot; Qté: {item.quantity}
                      </p>
                    </div>
                    <p className="font-semibold text-sm">
                      {(item.price * item.quantity).toFixed(2)}€
                    </p>
                  </div>
                ))}
              </div>

              <hr className="border-zinc-100 mb-4" />

              {/* Promo code section */}
              {!promoData ? (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-zinc-700 mb-2">
                    Code promo
                  </label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                      <input
                        type="text"
                        value={promoCode}
                        onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                        placeholder="BIENVENUE10"
                        className="w-full pl-10 pr-4 py-2.5 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 text-sm uppercase"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={applyPromoCode}
                      disabled={promoLoading || !promoCode.trim()}
                      className="px-4 py-2.5 bg-violet-600 text-white font-medium rounded-xl hover:bg-violet-700 transition-colors disabled:opacity-50 text-sm"
                    >
                      {promoLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        "Appliquer"
                      )}
                    </button>
                  </div>
                  {promoError && (
                    <p className="text-xs text-red-500 mt-1.5">{promoError}</p>
                  )}
                </div>
              ) : (
                <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <div>
                        <p className="text-sm font-medium text-emerald-700">
                          Code {promoData.promo.code} appliqué
                        </p>
                        <p className="text-xs text-emerald-600">
                          -{promoData.discount.toFixed(2)}€
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={removePromoCode}
                      className="text-xs text-emerald-600 hover:text-emerald-700 font-medium"
                    >
                      Retirer
                    </button>
                  </div>
                </div>
              )}

              {/* Totals */}
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-500">Sous-total</span>
                  <span>{cartTotal.toFixed(2)}€</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-500 flex items-center gap-1">
                    <Truck className="w-4 h-4" />
                    Livraison
                  </span>
                  <span className={shippingCost === 0 ? "text-emerald-600 font-medium" : ""}>
                    {shippingCost === 0 ? "Gratuite" : `${shippingCost.toFixed(2)}€`}
                  </span>
                </div>
                {promoData && (
                  <div className="flex justify-between text-sm">
                    <span className="text-emerald-600">Réduction</span>
                    <span className="text-emerald-600 font-medium">
                      -{promoData.discount.toFixed(2)}€
                    </span>
                  </div>
                )}
              </div>

              <hr className="border-zinc-100 mb-4" />

              <div className="flex justify-between text-lg font-bold mb-6">
                <span>Total</span>
                <span>{total.toFixed(2)}€</span>
              </div>

              <button
                type="submit"
                form="checkout-form"
                disabled={loading}
                className="w-full py-4 bg-zinc-900 text-white font-semibold rounded-xl hover:bg-zinc-800 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Traitement en cours...
                  </>
                ) : (
                  <>
                    <CreditCard className="w-5 h-5" />
                    Payer {total.toFixed(2)}€
                  </>
                )}
              </button>

              {cartTotal < 100 && (
                <p className="text-xs text-zinc-500 text-center mt-3">
                  Plus que {(100 - cartTotal).toFixed(2)}€ pour la livraison
                  gratuite
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
