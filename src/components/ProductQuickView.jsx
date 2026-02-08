import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Star, ShoppingBag } from "lucide-react";
import { useCart } from "../contexts/CartContext";

export default function ProductQuickView({ product, onClose }) {
  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedColor, setSelectedColor] = useState(0);
  const { addToCart } = useCart();

  if (!product) return null;

  const handleAddToCart = () => {
    if (selectedSize) {
      addToCart(product, selectedSize);
      onClose();
    }
  };

  const sizes = product.sizes || [];
  const colors = product.colors || [];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/50 z-50"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
      >
        <div className="relative w-full max-w-2xl max-h-[85vh] bg-white rounded-2xl overflow-hidden shadow-2xl">
          <div className="flex flex-col md:flex-row max-h-[85vh] overflow-auto">
            <div className="md:w-1/2 h-64 md:h-auto bg-zinc-100 flex-shrink-0">
              <img
                src={product.image_url || product.image}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="md:w-1/2 p-6 flex flex-col">
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 bg-white hover:bg-zinc-100 rounded-full shadow-md z-10"
              >
                <X className="w-5 h-5" />
              </button>

              <p className="text-sm text-zinc-400 uppercase">{product.brand}</p>
              <h3 className="text-2xl font-bold mt-1">{product.name}</h3>

              <div className="flex items-center gap-2 mt-2">
                <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                <span className="font-medium">{product.rating}</span>
                <span className="text-zinc-400">
                  ({product.reviews_count || product.reviews} avis)
                </span>
              </div>

              <div className="flex items-center gap-2 mt-4">
                <span className="text-2xl font-bold">{product.price}€</span>
                {product.original_price && (
                  <span className="text-lg text-zinc-400 line-through">
                    {product.original_price}€
                  </span>
                )}
              </div>

              {/* Colors */}
              {colors.length > 0 && (
                <div className="mt-6">
                  <p className="text-sm font-medium mb-2">Couleur</p>
                  <div className="flex gap-2">
                    {colors.map((color, i) => {
                      const hex = typeof color === 'string' ? color : color.color_hex;
                      return (
                        <button
                          key={i}
                          onClick={() => setSelectedColor(i)}
                          className={`w-8 h-8 rounded-full border-2 ${
                            selectedColor === i
                              ? "border-violet-600"
                              : "border-zinc-200"
                          }`}
                          style={{ backgroundColor: hex }}
                        />
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Sizes */}
              <div className="mt-6 flex-1">
                <p className="text-sm font-medium mb-2">Taille</p>
                <div className="flex flex-wrap gap-2">
                  {sizes.map((sizeItem) => {
                    const sizeValue = typeof sizeItem === 'object' ? sizeItem.size : sizeItem;
                    return (
                      <button
                        key={sizeValue}
                        onClick={() => setSelectedSize(sizeValue)}
                        className={`w-12 h-10 border rounded-lg font-medium transition-colors ${
                          selectedSize === sizeValue
                            ? "border-violet-600 bg-violet-600 text-white"
                            : "border-zinc-200 hover:border-zinc-300"
                        }`}
                      >
                        {sizeValue}
                      </button>
                    );
                  })}
                </div>
              </div>

              <button
                onClick={handleAddToCart}
                disabled={!selectedSize}
                className={`w-full py-3 mt-6 font-semibold rounded-full flex items-center justify-center gap-2 transition-colors ${
                  selectedSize
                    ? "bg-zinc-900 text-white hover:bg-zinc-800"
                    : "bg-zinc-200 text-zinc-400 cursor-not-allowed"
                }`}
              >
                <ShoppingBag className="w-5 h-5" />
                {selectedSize
                  ? "Ajouter au panier"
                  : "Sélectionnez une taille"}
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
