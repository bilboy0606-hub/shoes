import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  User, Package, Settings, LogOut, ChevronRight, Mail, Phone,
  Calendar, Eye, AlertCircle, Check, Lock, Edit3, Save, X, MapPin, Tag,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import orderService from "../services/orderService";
import Header from "../components/Header";
import Footer from "../components/Footer";
import CartDrawer from "../components/CartDrawer";
import OrderTrackingBar from "../components/OrderTrackingBar";

const tabs = [
  { id: "profile", label: "Mon profil", icon: User },
  { id: "orders", label: "Mes commandes", icon: Package },
  { id: "settings", label: "Paramètres", icon: Settings },
];

const statusLabels = {
  pending: { label: "En attente", color: "bg-yellow-100 text-yellow-700" },
  paid: { label: "Payée", color: "bg-emerald-100 text-emerald-700" },
  processing: { label: "En préparation", color: "bg-blue-100 text-blue-700" },
  shipped: { label: "Expédiée", color: "bg-purple-100 text-purple-700" },
  delivered: { label: "Livrée", color: "bg-green-100 text-green-700" },
  cancelled: { label: "Annulée", color: "bg-red-100 text-red-700" },
};

function ProfileTab() {
  const { user, updateProfile } = useAuth();
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
  });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
      });
    }
  }, [user]);

  const handleSave = async () => {
    setSaving(true);
    setError("");
    setMessage("");
    try {
      await updateProfile(formData);
      setMessage("Profil mis à jour avec succès.");
      setEditing(false);
    } catch (err) {
      setError(
        err.response?.data?.error || "Erreur lors de la mise à jour du profil."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Mon profil</h2>
        {!editing ? (
          <button
            onClick={() => setEditing(true)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-violet-600 hover:bg-violet-50 rounded-lg transition-colors"
          >
            <Edit3 className="w-4 h-4" />
            Modifier
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={() => {
                setEditing(false);
                setFormData({
                  name: user?.name || "",
                  email: user?.email || "",
                  phone: user?.phone || "",
                });
              }}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-100 rounded-lg"
            >
              <X className="w-4 h-4" />
              Annuler
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-violet-600 hover:bg-violet-700 rounded-lg disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {saving ? "Enregistrement..." : "Enregistrer"}
            </button>
          </div>
        )}
      </div>

      {message && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 p-4 mb-6 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 text-sm"
        >
          <Check className="w-5 h-5" />
          {message}
        </motion.div>
      )}

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 p-4 mb-6 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm"
        >
          <AlertCircle className="w-5 h-5" />
          {error}
        </motion.div>
      )}

      <div className="bg-white rounded-2xl border border-zinc-100 overflow-hidden">
        {/* Avatar section */}
        <div className="p-6 border-b border-zinc-100 flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-violet-100 flex items-center justify-center">
            <User className="w-8 h-8 text-violet-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">{user?.name}</h3>
            <p className="text-sm text-zinc-500">
              Membre depuis le{" "}
              {user?.created_at
                ? new Date(user.created_at).toLocaleDateString("fr-FR", {
                    month: "long",
                    year: "numeric",
                  })
                : "..."}
            </p>
          </div>
        </div>

        {/* Fields */}
        <div className="divide-y divide-zinc-100">
          <div className="p-6 flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-zinc-100 flex items-center justify-center">
              <User className="w-5 h-5 text-zinc-500" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-zinc-500">Nom complet</p>
              {editing ? (
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full mt-1 px-3 py-2 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
              ) : (
                <p className="font-medium">{user?.name || "Non renseigné"}</p>
              )}
            </div>
          </div>

          <div className="p-6 flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-zinc-100 flex items-center justify-center">
              <Mail className="w-5 h-5 text-zinc-500" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-zinc-500">Email</p>
              {editing ? (
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="w-full mt-1 px-3 py-2 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
              ) : (
                <p className="font-medium">{user?.email}</p>
              )}
            </div>
          </div>

          <div className="p-6 flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-zinc-100 flex items-center justify-center">
              <Phone className="w-5 h-5 text-zinc-500" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-zinc-500">Téléphone</p>
              {editing ? (
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  placeholder="+33 6 12 34 56 78"
                  className="w-full mt-1 px-3 py-2 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
              ) : (
                <p className="font-medium">
                  {user?.phone || "Non renseigné"}
                </p>
              )}
            </div>
          </div>

          <div className="p-6 flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-zinc-100 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-zinc-500" />
            </div>
            <div>
              <p className="text-sm text-zinc-500">Date d&apos;inscription</p>
              <p className="font-medium">
                {user?.created_at
                  ? new Date(user.created_at).toLocaleDateString("fr-FR", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })
                  : "..."}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function OrdersTab() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    orderService
      .getOrders()
      .then((data) => setOrders(data.orders || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div>
        <h2 className="text-2xl font-bold mb-6">Mes commandes</h2>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-white rounded-2xl border border-zinc-100 p-6 animate-pulse"
            >
              <div className="flex justify-between mb-4">
                <div className="h-5 bg-zinc-200 rounded w-32" />
                <div className="h-5 bg-zinc-200 rounded w-20" />
              </div>
              <div className="h-4 bg-zinc-200 rounded w-48" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Mes commandes</h2>

      {orders.length === 0 ? (
        <div className="bg-white rounded-2xl border border-zinc-100 p-12 text-center">
          <Package className="w-16 h-16 text-zinc-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Aucune commande</h3>
          <p className="text-zinc-500 mb-6">
            Vous n&apos;avez pas encore passé de commande.
          </p>
          <Link
            to="/"
            className="inline-flex px-6 py-3 bg-zinc-900 text-white font-semibold rounded-full hover:bg-zinc-800"
          >
            Découvrir nos produits
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const status = statusLabels[order.status] || statusLabels.pending;
            return (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl border border-zinc-100 p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                  <div>
                    <div className="flex items-center gap-3">
                      <h3 className="font-semibold">
                        Commande #{order.id}
                      </h3>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${status.color}`}
                      >
                        {status.label}
                      </span>
                    </div>
                    <p className="text-sm text-zinc-500 mt-1">
                      {new Date(order.created_at).toLocaleDateString("fr-FR", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold">
                      {parseFloat(order.total).toFixed(2)}€
                    </p>
                    {order.promo_code && order.discount_amount > 0 && (
                      <div className="flex items-center justify-end gap-1.5 mt-1">
                        <Tag className="w-3.5 h-3.5 text-emerald-600" />
                        <p className="text-xs text-emerald-600 font-medium">
                          {order.promo_code} (-{parseFloat(order.discount_amount).toFixed(2)}€)
                        </p>
                      </div>
                    )}
                    {order.original_total && order.promo_code && (
                      <p className="text-xs text-zinc-400 line-through mt-0.5">
                        {parseFloat(order.original_total).toFixed(2)}€
                      </p>
                    )}
                    <p className="text-sm text-zinc-500 mt-1">
                      {order.items_count || order.items?.length || 0} article(s)
                    </p>
                  </div>
                </div>

                {/* Order items preview */}
                {order.items && order.items.length > 0 && (
                  <div className="flex gap-3 mb-4 overflow-x-auto pb-2">
                    {order.items.map((item, i) => (
                      <div
                        key={i}
                        className="flex-shrink-0 flex items-center gap-3 bg-zinc-50 rounded-xl p-2 pr-4"
                      >
                        {item.product_image && (
                          <img
                            src={item.product_image}
                            alt={item.product_name}
                            className="w-12 h-12 rounded-lg object-cover"
                          />
                        )}
                        <div>
                          <p className="text-sm font-medium">
                            {item.product_name}
                          </p>
                          <p className="text-xs text-zinc-500">
                            Taille {item.size} &middot; x{item.quantity}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Shipping info */}
                {order.shipping_address && (
                  <div className="flex items-center gap-2 text-sm text-zinc-500">
                    <MapPin className="w-4 h-4" />
                    <span>
                      {order.shipping_name} - {order.shipping_address},{" "}
                      {order.shipping_postal_code} {order.shipping_city}
                    </span>
                  </div>
                )}

                <button
                  onClick={() =>
                    setSelectedOrder(
                      selectedOrder?.id === order.id ? null : order
                    )
                  }
                  className="mt-4 flex items-center gap-2 text-sm text-violet-600 hover:text-violet-700 font-medium"
                >
                  <Eye className="w-4 h-4" />
                  {selectedOrder?.id === order.id
                    ? "Masquer le suivi"
                    : "Voir le suivi"}
                </button>

                {/* Order tracking expanded */}
                {selectedOrder?.id === order.id && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="mt-4 pt-4 border-t border-zinc-100"
                  >
                    <OrderTrackingBar status={order.status} />
                  </motion.div>
                )}
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function SettingsTab() {
  const { updatePassword } = useAuth();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (newPassword !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }
    if (newPassword.length < 6) {
      setError("Le nouveau mot de passe doit contenir au moins 6 caractères.");
      return;
    }

    setSaving(true);
    try {
      await updatePassword(currentPassword, newPassword);
      setMessage("Mot de passe mis à jour avec succès.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setError(
        err.response?.data?.error ||
          "Erreur lors du changement de mot de passe."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Paramètres</h2>

      {/* Change password */}
      <div className="bg-white rounded-2xl border border-zinc-100 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-zinc-100 flex items-center justify-center">
            <Lock className="w-5 h-5 text-zinc-500" />
          </div>
          <div>
            <h3 className="font-semibold">Changer le mot de passe</h3>
            <p className="text-sm text-zinc-500">
              Mettez à jour votre mot de passe de connexion.
            </p>
          </div>
        </div>

        {message && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 p-4 mb-6 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 text-sm"
          >
            <Check className="w-5 h-5" />
            {message}
          </motion.div>
        )}

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 p-4 mb-6 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm"
          >
            <AlertCircle className="w-5 h-5" />
            {error}
          </motion.div>
        )}

        <form onSubmit={handlePasswordChange} className="space-y-4 max-w-md">
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-2">
              Mot de passe actuel
            </label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
              className="w-full px-4 py-3 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-2">
              Nouveau mot de passe
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              className="w-full px-4 py-3 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-2">
              Confirmer le nouveau mot de passe
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="w-full px-4 py-3 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
          </div>
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-3 bg-zinc-900 text-white font-semibold rounded-xl hover:bg-zinc-800 disabled:opacity-50"
          >
            {saving ? "Mise à jour..." : "Mettre à jour le mot de passe"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("profile");
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const renderTab = () => {
    switch (activeTab) {
      case "profile":
        return <ProfileTab />;
      case "orders":
        return <OrdersTab />;
      case "settings":
        return <SettingsTab />;
      default:
        return <ProfileTab />;
    }
  };

  return (
    <div className="min-h-screen bg-[#fafafa] text-zinc-900">
      <Header />
      <CartDrawer />

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <div className="lg:w-64 flex-shrink-0">
            <div className="bg-white rounded-2xl border border-zinc-100 overflow-hidden sticky top-28">
              {/* User info */}
              <div className="p-6 border-b border-zinc-100">
                <div className="w-12 h-12 rounded-full bg-violet-100 flex items-center justify-center mb-3">
                  <User className="w-6 h-6 text-violet-600" />
                </div>
                <h3 className="font-semibold">{user?.name}</h3>
                <p className="text-sm text-zinc-500">{user?.email}</p>
              </div>

              {/* Nav */}
              <nav className="p-2">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                      activeTab === tab.id
                        ? "bg-violet-50 text-violet-700"
                        : "text-zinc-600 hover:bg-zinc-50"
                    }`}
                  >
                    <tab.icon className="w-5 h-5" />
                    {tab.label}
                    <ChevronRight
                      className={`w-4 h-4 ml-auto transition-transform ${
                        activeTab === tab.id ? "rotate-90" : ""
                      }`}
                    />
                  </button>
                ))}

                <hr className="my-2 border-zinc-100" />

                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
                >
                  <LogOut className="w-5 h-5" />
                  Déconnexion
                </button>
              </nav>
            </div>
          </div>

          {/* Main content */}
          <div className="flex-1 min-w-0">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.2 }}
            >
              {renderTab()}
            </motion.div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
