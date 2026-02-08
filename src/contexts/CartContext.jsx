import { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useAuth } from './AuthContext';
import cartService from '../services/cartService';

const CartContext = createContext(null);

const CART_STORAGE_KEY = 'kickstore_cart';
const PENDING_PAYMENT_KEY = 'kickstore_pending_payment';

function loadCartFromStorage() {
  try {
    const saved = localStorage.getItem(CART_STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

export function CartProvider({ children }) {
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const { isAuthenticated, token } = useAuth();
  const prevAuth = useRef(false);
  const isLoading = useRef(true);

  // On mount: load cart from appropriate source
  useEffect(() => {
    // If a payment is pending (returning from Stripe), don't load cart
    // OrderSuccess will clear it and remove the flag
    if (localStorage.getItem(PENDING_PAYMENT_KEY)) {
      setCart([]);
      isLoading.current = false;
      return;
    }

    if (isAuthenticated && token) {
      const justLoggedIn = !prevAuth.current;
      prevAuth.current = true;

      if (justLoggedIn) {
        // Fresh login: sync local cart to DB then load DB cart
        const localCart = loadCartFromStorage();
        if (localCart.length > 0) {
          const items = localCart.map((item) => ({
            product_id: item.id,
            size: item.size,
            quantity: item.quantity,
          }));
          cartService.syncCart(items)
            .then((dbCart) => {
              const formatted = formatDbCart(dbCart);
              setCart(formatted);
              localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(formatted));
              isLoading.current = false;
            })
            .catch(() => {
              loadFromDb();
            });
        } else {
          loadFromDb();
        }
      } else {
        // Already authenticated (page reload) - DB is source of truth
        loadFromDb();
      }
    } else {
      prevAuth.current = false;
      // Not authenticated - load from localStorage
      setCart(loadCartFromStorage());
      isLoading.current = false;
    }
  }, [isAuthenticated, token]);

  function loadFromDb() {
    cartService.getCart()
      .then((dbCart) => {
        const formatted = formatDbCart(dbCart);
        setCart(formatted);
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(formatted));
      })
      .catch(() => {
        setCart(loadCartFromStorage());
      })
      .finally(() => {
        isLoading.current = false;
      });
  }

  // Save to localStorage when cart changes (only after initial load)
  useEffect(() => {
    if (!isLoading.current) {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    }
  }, [cart]);

  // Convert DB cart format to local cart format
  function formatDbCart(dbCart) {
    if (!Array.isArray(dbCart)) return [];
    return dbCart.map((item) => ({
      id: item.product_id,
      name: item.product_name || item.name,
      brand: item.product_brand || item.brand,
      price: parseFloat(item.product_price || item.price),
      image: item.product_image || item.image_url || item.image,
      size: item.size,
      quantity: item.quantity,
    }));
  }

  const addToCart = (product, size) => {
    setCart((prev) => {
      const existing = prev.find(
        (item) => item.id === product.id && item.size === size
      );
      if (existing) {
        return prev.map((item) =>
          item.id === product.id && item.size === size
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [
        ...prev,
        {
          id: product.id,
          name: product.name,
          brand: product.brand,
          price: parseFloat(product.price),
          image: product.image_url || product.image,
          size,
          quantity: 1,
        },
      ];
    });
    setIsCartOpen(true);

    if (isAuthenticated) {
      cartService.addItem(product.id, size, 1).catch(() => {});
    }
  };

  const removeFromCart = (productId, size) => {
    setCart((prev) =>
      prev.filter((item) => !(item.id === productId && item.size === size))
    );

    if (isAuthenticated) {
      cartService.removeItem(productId, size).catch(() => {});
    }
  };

  const updateQuantity = (productId, size, delta) => {
    let newQuantity = 0;
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.id === productId && item.size === size) {
            newQuantity = item.quantity + delta;
            return newQuantity > 0 ? { ...item, quantity: newQuantity } : null;
          }
          return item;
        })
        .filter(Boolean)
    );

    if (isAuthenticated) {
      if (newQuantity > 0) {
        cartService.updateItem(productId, size, newQuantity).catch(() => {});
      } else {
        cartService.removeItem(productId, size).catch(() => {});
      }
    }
  };

  const clearCart = () => {
    setCart([]);
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify([]));

    if (isAuthenticated) {
      cartService.clearCart().catch(() => {});
    }
  };

  const cartTotal = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const getCartItemsForAPI = () =>
    cart.map((item) => ({
      product_id: item.id,
      product_name: item.name,
      product_brand: item.brand,
      product_image: item.image,
      size: item.size,
      quantity: item.quantity,
      price: item.price,
    }));

  return (
    <CartContext.Provider
      value={{
        cart,
        isCartOpen,
        setIsCartOpen,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartTotal,
        cartCount,
        getCartItemsForAPI,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}

export default CartContext;
