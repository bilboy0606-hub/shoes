import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  X, ShoppingBag, Minus, Plus, Trash2, CreditCard,
} from "lucide-react";
import { useCart } from "../contexts/CartContext";
import { useAuth } from "../contexts/AuthContext";

export default function CartDrawer() {
  const {
    cart,
    isCartOpen,
    setIsCartOpen,
    removeFromCart,
    updateQuantity,
    cartTotal,
    cartCount,
  } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleCheckout = () => {
    setIsCartOpen(false);
    if (isAuthenticated) {
      navigate("/checkout");
    } else {
      navigate("/login?redirect=/checkout");
    }
  };

  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsCartOpen(false)}
            className="fixed inset-0 bg-black/50 z-50"
          />
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "tween", duration: 0.3 }}
            className="fixed top-0 right-0 bottom-0 w-full max-w-md bg-white z-50 flex flex-col"
          >
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-bold">Panier ({cartCount})</h2>
              <button
                onClick={() => setIsCartOpen(false)}
                className="p-2 hover:bg-zinc-100 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {cart.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                <ShoppingBag className="w-16 h-16 text-zinc-300 mb-4" />
                <p className="text-zinc-500">Votre panier est vide</p>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="mt-4 px-6 py-2 bg-zinc-900 text-white rounded-full"
                >
                  Continuer mes achats
                </button>
              </div>
            ) : (
              <>
                <div className="flex-1 overflow-auto p-4 space-y-4">
                  {cart.map((item) => (
                    <div
                      key={`${item.id}-${item.size}`}
                      className="flex gap-4 bg-zinc-50 rounded-xl p-3"
                    >
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-20 h-20 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <div className="flex justify-between">
                          <div>
                            <p className="font-semibold">{item.name}</p>
                            <p className="text-sm text-zinc-500">
                              Taille: {item.size}
                            </p>
                          </div>
                          <button
                            onClick={() => removeFromCart(item.id, item.size)}
                            className="p-1 hover:bg-zinc-200 rounded"
                          >
                            <Trash2 className="w-4 h-4 text-zinc-400" />
                          </button>
                        </div>
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center gap-2 bg-white rounded-lg border">
                            <button
                              onClick={() =>
                                updateQuantity(item.id, item.size, -1)
                              }
                              className="p-1 hover:bg-zinc-100"
                            >
                              <Minus className="w-4 h-4" />
                            </button>
                            <span className="w-8 text-center text-sm">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() =>
                                updateQuantity(item.id, item.size, 1)
                              }
                              className="p-1 hover:bg-zinc-100"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>
                          <p className="font-bold">
                            {(item.price * item.quantity).toFixed(2)}€
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="p-4 border-t bg-zinc-50">
                  <div className="flex justify-between mb-2">
                    <span className="text-zinc-500">Sous-total</span>
                    <span className="font-semibold">
                      {cartTotal.toFixed(2)}€
                    </span>
                  </div>
                  <div className="flex justify-between mb-4">
                    <span className="text-zinc-500">Livraison</span>
                    <span className="font-semibold text-emerald-600">
                      {cartTotal >= 100 ? "Gratuite" : "4.99€"}
                    </span>
                  </div>
                  <div className="flex justify-between text-lg mb-4">
                    <span className="font-bold">Total</span>
                    <span className="font-bold">
                      {(cartTotal + (cartTotal >= 100 ? 0 : 4.99)).toFixed(2)}€
                    </span>
                  </div>
                  <button
                    onClick={handleCheckout}
                    className="w-full py-3 bg-zinc-900 text-white font-semibold rounded-full hover:bg-zinc-800 flex items-center justify-center gap-2"
                  >
                    <CreditCard className="w-5 h-5" />
                    Passer commande
                  </button>
                </div>
              </>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
