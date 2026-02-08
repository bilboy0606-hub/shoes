import { useState, useEffect } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
  CheckCircle, Package, ArrowRight, MapPin, CreditCard,
} from "lucide-react";
import orderService from "../services/orderService";
import api from "../services/api";
import { useCart } from "../contexts/CartContext";
import Header from "../components/Header";
import Footer from "../components/Footer";
import CartDrawer from "../components/CartDrawer";

const statusLabels = {
  pending: "En attente de paiement",
  paid: "Payée",
  processing: "En préparation",
  shipped: "Expédiée",
  delivered: "Livrée",
  cancelled: "Annulée",
};

export default function OrderSuccess() {
  const { orderId } = useParams();
  const [searchParams] = useSearchParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const { clearCart } = useCart();

  useEffect(() => {
    const sessionId = searchParams.get('session_id');

    if (sessionId) {
      // Coming back from Stripe - verify session and create order
      api.get(`/stripe/verify-session?session_id=${sessionId}`)
        .then(({ data }) => {
          setOrder(data.order);
          // Payment confirmed - clear cart and remove pending flag
          if (localStorage.getItem('kickstore_pending_payment')) {
            clearCart();
            localStorage.removeItem('kickstore_pending_payment');
          }
        })
        .catch(() => {})
        .finally(() => setLoading(false));
    } else if (orderId) {
      // Direct access with orderId (from dashboard link etc.)
      orderService
        .getOrderById(orderId)
        .then((data) => setOrder(data.order))
        .catch(() => {})
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [orderId, searchParams]);

  return (
    <div className="min-h-screen bg-[#fafafa]">
      <Header />
      <CartDrawer />

      <div className="max-w-2xl mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-6"
          >
            <CheckCircle className="w-10 h-10 text-emerald-600" />
          </motion.div>

          <h1 className="text-3xl font-bold mb-3">Commande confirmée !</h1>
          <p className="text-zinc-500 text-lg">
            Merci pour votre commande. Vous recevrez un email de confirmation.
          </p>
        </motion.div>

        {loading ? (
          <div className="bg-white rounded-2xl border border-zinc-100 p-8 text-center">
            <div className="w-12 h-12 border-4 border-violet-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-zinc-500">Chargement des détails...</p>
          </div>
        ) : order ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-2xl border border-zinc-100 overflow-hidden"
          >
            {/* Order header */}
            <div className="p-6 border-b border-zinc-100 flex items-center justify-between">
              <div>
                <p className="text-sm text-zinc-500">Commande</p>
                <p className="text-xl font-bold">#{order.id}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-zinc-500">Statut</p>
                <p className="font-semibold text-emerald-600">
                  {statusLabels[order.status] || order.status}
                </p>
              </div>
            </div>

            {/* Order items */}
            <div className="p-6 border-b border-zinc-100">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Package className="w-5 h-5" />
                Articles commandés
              </h3>
              <div className="space-y-3">
                {order.items?.map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    {item.product_image && (
                      <img
                        src={item.product_image}
                        alt={item.product_name}
                        className="w-16 h-16 rounded-lg object-cover"
                      />
                    )}
                    <div className="flex-1">
                      <p className="font-medium">{item.product_name}</p>
                      <p className="text-sm text-zinc-500">
                        Taille {item.size} &middot; Qté: {item.quantity}
                      </p>
                    </div>
                    <p className="font-semibold">
                      {(parseFloat(item.price) * item.quantity).toFixed(2)}€
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Shipping address */}
            {order.shipping_address && (
              <div className="p-6 border-b border-zinc-100">
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  Adresse de livraison
                </h3>
                <p className="text-zinc-600">
                  {order.shipping_name}
                  <br />
                  {order.shipping_address}
                  <br />
                  {order.shipping_postal_code} {order.shipping_city}
                  <br />
                  {order.shipping_country}
                </p>
              </div>
            )}

            {/* Total */}
            <div className="p-6 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-zinc-400" />
                <span className="text-zinc-500">Total payé</span>
              </div>
              <span className="text-2xl font-bold">
                {parseFloat(order.total).toFixed(2)}€
              </span>
            </div>
          </motion.div>
        ) : (
          <div className="bg-white rounded-2xl border border-zinc-100 p-8 text-center">
            <p className="text-zinc-500">
              Votre commande a été enregistrée avec succès.
            </p>
          </div>
        )}

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex flex-col sm:flex-row gap-4 mt-8 justify-center"
        >
          <Link
            to="/dashboard"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-zinc-900 text-white font-semibold rounded-full hover:bg-zinc-800"
          >
            Voir mes commandes
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            to="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-zinc-300 font-semibold rounded-full hover:bg-zinc-50"
          >
            Continuer mes achats
          </Link>
        </motion.div>
      </div>

      <Footer />
    </div>
  );
}
