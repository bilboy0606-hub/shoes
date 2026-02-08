import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Package, LogOut, ShoppingBag, Users, Eye, ChevronDown,
  CheckCircle, Clock, Truck, Home, XCircle, CreditCard, Loader2, Tag,
} from "lucide-react";
import { useAdminAuth } from "../contexts/AdminAuthContext";
import adminService from "../services/adminService";

const statusConfig = {
  pending: { label: "En attente", color: "bg-yellow-100 text-yellow-700", icon: Clock },
  paid: { label: "Payée", color: "bg-emerald-100 text-emerald-700", icon: CreditCard },
  processing: { label: "En préparation", color: "bg-blue-100 text-blue-700", icon: Package },
  shipped: { label: "Expédiée", color: "bg-purple-100 text-purple-700", icon: Truck },
  delivered: { label: "Livrée", color: "bg-green-100 text-green-700", icon: Home },
  cancelled: { label: "Annulée", color: "bg-red-100 text-red-700", icon: XCircle },
};

export default function AdminDashboard() {
  const { admin, logout } = useAdminAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingOrderId, setUpdatingOrderId] = useState(null);
  const [message, setMessage] = useState("");
  const [expandedOrder, setExpandedOrder] = useState(null);

  useEffect(() => {
    adminService.getOrders()
      .then((data) => setOrders(data.orders || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleStatusChange = async (orderId, newStatus) => {
    setUpdatingOrderId(orderId);
    try {
      const data = await adminService.updateOrderStatus(orderId, newStatus);
      setOrders((prev) =>
        prev.map((o) => (o.id === data.order.id ? data.order : o))
      );
      setMessage(`Commande #${orderId} mise à jour.`);
      setTimeout(() => setMessage(""), 3000);
    } catch {
      setMessage("Erreur lors de la mise à jour.");
      setTimeout(() => setMessage(""), 3000);
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/admin-connect");
  };

  const stats = {
    total: orders.length,
    pending: orders.filter((o) => o.status === "pending" || o.status === "paid").length,
    processing: orders.filter((o) => o.status === "processing" || o.status === "shipped").length,
    delivered: orders.filter((o) => o.status === "delivered").length,
  };

  return (
    <div className="min-h-screen bg-zinc-900 flex">
      {/* Sidebar */}
      <div className="w-64 bg-zinc-800 border-r border-zinc-700 flex flex-col">
        <div className="p-6 border-b border-zinc-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-violet-600 flex items-center justify-center">
              <ShoppingBag className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-white text-sm">KickStore</h1>
              <p className="text-xs text-zinc-400">Administration</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          <div className="px-3 py-2 bg-violet-600/10 border border-violet-500/20 rounded-xl text-violet-400 text-sm font-medium flex items-center gap-3">
            <Package className="w-4 h-4" />
            Commandes
          </div>
          <button
            onClick={() => navigate("/admin/promos")}
            className="w-full px-3 py-2 text-zinc-400 hover:text-white hover:bg-zinc-700 rounded-xl text-sm font-medium flex items-center gap-3 transition-colors"
          >
            <Tag className="w-4 h-4" />
            Codes promo
          </button>
        </nav>

        <div className="p-4 border-t border-zinc-700">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-lg bg-zinc-700 flex items-center justify-center">
              <Users className="w-4 h-4 text-zinc-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {admin?.name || "Admin"}
              </p>
              <p className="text-xs text-zinc-500 truncate">{admin?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-zinc-400 hover:text-white hover:bg-zinc-700 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Déconnexion
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-auto">
        {/* Top bar */}
        <div className="bg-zinc-800 border-b border-zinc-700 px-8 py-4">
          <h2 className="text-xl font-bold text-white">Gestion des commandes</h2>
          <p className="text-sm text-zinc-400">
            Gérez et suivez toutes les commandes clients
          </p>
        </div>

        {/* Toast notification */}
        {message && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mx-8 mt-4 flex items-center gap-2 px-4 py-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 text-sm"
          >
            <CheckCircle className="w-4 h-4" />
            {message}
          </motion.div>
        )}

        {/* Stats cards */}
        <div className="grid grid-cols-4 gap-4 px-8 py-6">
          {[
            { label: "Total commandes", value: stats.total, color: "text-white", bg: "bg-zinc-800" },
            { label: "En attente", value: stats.pending, color: "text-yellow-400", bg: "bg-zinc-800" },
            { label: "En cours", value: stats.processing, color: "text-blue-400", bg: "bg-zinc-800" },
            { label: "Livrées", value: stats.delivered, color: "text-emerald-400", bg: "bg-zinc-800" },
          ].map((stat) => (
            <div
              key={stat.label}
              className={`${stat.bg} border border-zinc-700 rounded-xl p-4`}
            >
              <p className="text-sm text-zinc-400">{stat.label}</p>
              <p className={`text-2xl font-bold mt-1 ${stat.color}`}>
                {stat.value}
              </p>
            </div>
          ))}
        </div>

        {/* Orders table */}
        <div className="px-8 pb-8">
          <div className="bg-zinc-800 border border-zinc-700 rounded-xl overflow-hidden">
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 text-violet-500 animate-spin" />
              </div>
            ) : orders.length === 0 ? (
              <div className="text-center py-20">
                <Package className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
                <p className="text-zinc-400">Aucune commande pour le moment</p>
              </div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-zinc-700">
                    <th className="text-left px-6 py-4 text-xs font-medium text-zinc-400 uppercase tracking-wider">
                      Commande
                    </th>
                    <th className="text-left px-6 py-4 text-xs font-medium text-zinc-400 uppercase tracking-wider">
                      Client
                    </th>
                    <th className="text-left px-6 py-4 text-xs font-medium text-zinc-400 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="text-left px-6 py-4 text-xs font-medium text-zinc-400 uppercase tracking-wider">
                      Total
                    </th>
                    <th className="text-left px-6 py-4 text-xs font-medium text-zinc-400 uppercase tracking-wider">
                      Articles
                    </th>
                    <th className="text-left px-6 py-4 text-xs font-medium text-zinc-400 uppercase tracking-wider">
                      Statut
                    </th>
                    <th className="text-left px-6 py-4 text-xs font-medium text-zinc-400 uppercase tracking-wider">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-700">
                  {orders.map((order) => {
                    const config = statusConfig[order.status] || statusConfig.pending;
                    const StatusIcon = config.icon;
                    return (
                      <tr
                        key={order.id}
                        className="hover:bg-zinc-750 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <span className="text-white font-semibold">
                            #{order.id}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <p className="text-sm text-white">
                              {order.user_name || "—"}
                            </p>
                            <p className="text-xs text-zinc-500">
                              {order.user_email || "—"}
                            </p>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-zinc-300">
                          {new Date(order.created_at).toLocaleDateString("fr-FR", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col gap-0.5">
                            {order.promo_code && order.original_total ? (
                              <>
                                <span className="text-xs text-zinc-500 line-through">
                                  {parseFloat(order.original_total).toFixed(2)}€
                                </span>
                                <span className="text-white font-semibold">
                                  {parseFloat(order.total).toFixed(2)}€
                                </span>
                                <span className="text-xs text-emerald-400 flex items-center gap-1">
                                  <Tag className="w-3 h-3" />
                                  {order.promo_code}
                                </span>
                              </>
                            ) : (
                              <span className="text-white font-semibold">
                                {parseFloat(order.total).toFixed(2)}€
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() =>
                              setExpandedOrder(
                                expandedOrder === order.id ? null : order.id
                              )
                            }
                            className="flex items-center gap-1 text-sm text-zinc-400 hover:text-white transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                            {order.items_count || order.items?.length || 0}
                            <ChevronDown
                              className={`w-3 h-3 transition-transform ${
                                expandedOrder === order.id ? "rotate-180" : ""
                              }`}
                            />
                          </button>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium ${config.color}`}
                          >
                            <StatusIcon className="w-3.5 h-3.5" />
                            {config.label}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <select
                            value={order.status}
                            onChange={(e) =>
                              handleStatusChange(order.id, e.target.value)
                            }
                            disabled={updatingOrderId === order.id}
                            className="px-3 py-1.5 bg-zinc-700 border border-zinc-600 rounded-lg text-sm text-white focus:ring-2 focus:ring-violet-500 focus:border-transparent disabled:opacity-50 cursor-pointer"
                          >
                            {Object.entries(statusConfig).map(
                              ([value, { label }]) => (
                                <option key={value} value={value}>
                                  {label}
                                </option>
                              )
                            )}
                          </select>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}

            {/* Expanded order items */}
            {expandedOrder && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="border-t border-zinc-700 bg-zinc-850 px-6 py-4"
              >
                {(() => {
                  const order = orders.find((o) => o.id === expandedOrder);
                  return (
                    <>
                      <p className="text-xs font-medium text-zinc-400 uppercase mb-3">
                        Articles de la commande #{expandedOrder}
                      </p>
                      <div className="space-y-2 mb-4">
                        {order?.items?.map((item, i) => (
                          <div
                            key={i}
                            className="flex items-center gap-3 bg-zinc-800 rounded-lg p-3"
                          >
                            {item.product_image && (
                              <img
                                src={item.product_image}
                                alt={item.product_name}
                                className="w-10 h-10 rounded-lg object-cover"
                              />
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="text-sm text-white truncate">
                                {item.product_name}
                              </p>
                              <p className="text-xs text-zinc-500">
                                Taille {item.size} · Qté: {item.quantity}
                              </p>
                            </div>
                            <p className="text-sm text-white font-medium">
                              {(parseFloat(item.price) * item.quantity).toFixed(2)}€
                            </p>
                          </div>
                        ))}
                      </div>

                      {/* Order summary with promo */}
                      {order && (
                        <div className="border-t border-zinc-700 pt-3 space-y-2">
                          {order.promo_code && order.original_total ? (
                            <>
                              <div className="flex justify-between text-sm">
                                <span className="text-zinc-400">Sous-total</span>
                                <span className="text-zinc-300">
                                  {parseFloat(order.original_total).toFixed(2)}€
                                </span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span className="text-emerald-400 flex items-center gap-1.5">
                                  <Tag className="w-3.5 h-3.5" />
                                  Réduction ({order.promo_code})
                                </span>
                                <span className="text-emerald-400">
                                  -{parseFloat(order.discount_amount || 0).toFixed(2)}€
                                </span>
                              </div>
                              <div className="flex justify-between text-base font-semibold border-t border-zinc-700 pt-2">
                                <span className="text-white">Total</span>
                                <span className="text-white">
                                  {parseFloat(order.total).toFixed(2)}€
                                </span>
                              </div>
                            </>
                          ) : (
                            <div className="flex justify-between text-base font-semibold">
                              <span className="text-white">Total</span>
                              <span className="text-white">
                                {parseFloat(order.total).toFixed(2)}€
                              </span>
                            </div>
                          )}
                        </div>
                      )}
                    </>
                  );
                })()}
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
