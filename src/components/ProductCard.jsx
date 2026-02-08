import { motion } from "framer-motion";
import { Heart, ShoppingBag, Star } from "lucide-react";

export default function ProductCard({
  product,
  index = 0,
  isWishlisted = false,
  onToggleWishlist,
  onQuickAdd,
}) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className="group bg-white rounded-2xl overflow-hidden border border-zinc-100 hover:shadow-xl hover:shadow-zinc-200/50 transition-all"
    >
      {/* Image */}
      <div className="relative aspect-square bg-zinc-100 overflow-hidden">
        <img
          src={product.image_url || product.image}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {product.is_new && (
            <span className="px-2 py-1 bg-emerald-500 text-white text-xs font-bold rounded">
              NEW
            </span>
          )}
          {product.badge && (
            <span
              className={`px-2 py-1 text-white text-xs font-bold rounded ${
                product.badge === "Promo" ? "bg-red-500" : "bg-violet-600"
              }`}
            >
              {product.badge}
            </span>
          )}
        </div>

        {/* Wishlist */}
        {onToggleWishlist && (
          <button
            onClick={() => onToggleWishlist(product.id)}
            className="absolute top-3 right-3 w-9 h-9 bg-white rounded-full flex items-center justify-center shadow-md hover:scale-110 transition-transform"
          >
            <Heart
              className={`w-5 h-5 ${
                isWishlisted
                  ? "fill-red-500 text-red-500"
                  : "text-zinc-400"
              }`}
            />
          </button>
        )}

        {/* Quick add */}
        {onQuickAdd && (
          <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => onQuickAdd(product)}
              className="w-full py-2 bg-white text-zinc-900 font-semibold rounded-lg hover:bg-zinc-100 transition-colors text-sm flex items-center justify-center gap-2"
            >
              <ShoppingBag className="w-4 h-4" />
              Ajouter au panier
            </button>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-4">
        <p className="text-xs text-zinc-400 uppercase tracking-wide">
          {product.brand}
        </p>
        <h3 className="font-semibold mt-1 group-hover:text-violet-600 transition-colors">
          {product.name}
        </h3>

        {/* Rating */}
        <div className="flex items-center gap-1 mt-2">
          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
          <span className="text-sm font-medium">{product.rating}</span>
          <span className="text-xs text-zinc-400">
            ({product.reviews_count || product.reviews})
          </span>
        </div>

        {/* Colors */}
        {product.colors && (
          <div className="flex gap-1 mt-3">
            {product.colors.map((color, i) => (
              <div
                key={i}
                className="w-4 h-4 rounded-full border border-zinc-200"
                style={{ backgroundColor: typeof color === 'string' ? color : color.color_hex }}
              />
            ))}
          </div>
        )}

        {/* Price */}
        <div className="flex items-center gap-2 mt-3">
          <span className="text-lg font-bold">{product.price}€</span>
          {product.original_price && (
            <span className="text-sm text-zinc-400 line-through">
              {product.original_price}€
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}
