import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Package, LogOut, ShoppingBag, Users, Tag, Plus, Edit2, Trash2,
  CheckCircle, XCircle, Loader2, Calendar, TrendingUp, Percent,
} from "lucide-react";
import { useAdminAuth } from "../contexts/AdminAuthContext";
import adminService from "../services/adminService";

export default function AdminPromos() {
  const { admin, logout } = useAdminAuth();
  const navigate = useNavigate();
  const [promos, setPromos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState({
    code: "",
    type: "percentage",
    value: "",
    min_order_amount: "0",
    max_uses: "",
    expires_at: "",
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadPromos();
  }, []);

  const loadPromos = async () => {
    try {
      const data = await adminService.getPromos();
      setPromos(data.promos || []);
    } catch (error) {
      console.error("Failed to load promos:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePromo = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      await adminService.createPromo({
        ...formData,
        value: parseFloat(formData.value),
        min_order_amount: parseFloat(formData.min_order_amount) || 0,
        max_uses: formData.max_uses ? parseInt(formData.max_uses) : null,
        expires_at: formData.expires_at || null,
      });

      setMessage("Code promo créé avec succès");
      setTimeout(() => setMessage(""), 3000);
      setShowCreateModal(false);
      setFormData({
        code: "",
        type: "percentage",
        value: "",
        min_order_amount: "0",
        max_uses: "",
        expires_at: "",
      });
      loadPromos();
    } catch (error) {
      setMessage(error.response?.data?.error || "Erreur lors de la création");
      setTimeout(() => setMessage(""), 3000);
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleActive = async (id, currentStatus) => {
    try {
      await adminService.updatePromo(id, { is_active: !currentStatus });
      setPromos((prev) =>
        prev.map((p) => (p.id === id ? { ...p, is_active: !currentStatus } : p))
      );
      setMessage("Statut mis à jour");
      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      setMessage("Erreur lors de la mise à jour");
      setTimeout(() => setMessage(""), 3000);
    }
  };

  const handleDeletePromo = async (id) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce code promo ?")) return;

    try {
      await adminService.deletePromo(id);
      setPromos((prev) => prev.filter((p) => p.id !== id));
      setMessage("Code promo supprimé");
      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      setMessage("Erreur lors de la suppression");
      setTimeout(() => setMessage(""), 3000);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/admin-connect");
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
          <button
            onClick={() => navigate("/admin")}
            className="w-full px-3 py-2 text-zinc-400 hover:text-white hover:bg-zinc-700 rounded-xl text-sm font-medium flex items-center gap-3 transition-colors"
          >
            <Package className="w-4 h-4" />
            Commandes
          </button>
          <div className="px-3 py-2 bg-violet-600/10 border border-violet-500/20 rounded-xl text-violet-400 text-sm font-medium flex items-center gap-3">
            <Tag className="w-4 h-4" />
            Codes promo
          </div>
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
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-white">Codes promo</h2>
              <p className="text-sm text-zinc-400">
                Créez et gérez les codes de réduction
              </p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-violet-600 text-white rounded-xl hover:bg-violet-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Créer un code
            </button>
          </div>
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

        {/* Promo codes list */}
        <div className="px-8 py-6">
          <div className="bg-zinc-800 border border-zinc-700 rounded-xl overflow-hidden">
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 text-violet-500 animate-spin" />
              </div>
            ) : promos.length === 0 ? (
              <div className="text-center py-20">
                <Tag className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
                <p className="text-zinc-400">Aucun code promo pour le moment</p>
              </div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-zinc-700">
                    <th className="text-left px-6 py-4 text-xs font-medium text-zinc-400 uppercase tracking-wider">
                      Code
                    </th>
                    <th className="text-left px-6 py-4 text-xs font-medium text-zinc-400 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="text-left px-6 py-4 text-xs font-medium text-zinc-400 uppercase tracking-wider">
                      Valeur
                    </th>
                    <th className="text-left px-6 py-4 text-xs font-medium text-zinc-400 uppercase tracking-wider">
                      Utilisations
                    </th>
                    <th className="text-left px-6 py-4 text-xs font-medium text-zinc-400 uppercase tracking-wider">
                      Expiration
                    </th>
                    <th className="text-left px-6 py-4 text-xs font-medium text-zinc-400 uppercase tracking-wider">
                      Statut
                    </th>
                    <th className="text-left px-6 py-4 text-xs font-medium text-zinc-400 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-700">
                  {promos.map((promo) => (
                    <tr
                      key={promo.id}
                      className="hover:bg-zinc-750 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <span className="text-white font-mono font-semibold">
                          {promo.code}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5 text-sm text-zinc-300">
                          {promo.type === "percentage" ? (
                            <>
                              <Percent className="w-3.5 h-3.5" />
                              Pourcentage
                            </>
                          ) : (
                            <>
                              <TrendingUp className="w-3.5 h-3.5" />
                              Fixe
                            </>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-white font-medium">
                        {promo.type === "percentage"
                          ? `${promo.value}%`
                          : `${promo.value}€`}
                      </td>
                      <td className="px-6 py-4 text-sm text-zinc-300">
                        {promo.current_uses}
                        {promo.max_uses ? ` / ${promo.max_uses}` : " / ∞"}
                      </td>
                      <td className="px-6 py-4 text-sm text-zinc-300">
                        {promo.expires_at ? (
                          <div className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5" />
                            {new Date(promo.expires_at).toLocaleDateString(
                              "fr-FR"
                            )}
                          </div>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {promo.is_active ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-emerald-100 text-emerald-700">
                            <CheckCircle className="w-3.5 h-3.5" />
                            Actif
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-red-100 text-red-700">
                            <XCircle className="w-3.5 h-3.5" />
                            Inactif
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() =>
                              handleToggleActive(promo.id, promo.is_active)
                            }
                            className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-700 rounded-lg transition-colors"
                            title={
                              promo.is_active ? "Désactiver" : "Activer"
                            }
                          >
                            {promo.is_active ? (
                              <XCircle className="w-4 h-4" />
                            ) : (
                              <CheckCircle className="w-4 h-4" />
                            )}
                          </button>
                          <button
                            onClick={() => handleDeletePromo(promo.id)}
                            className="p-2 text-zinc-400 hover:text-red-400 hover:bg-zinc-700 rounded-lg transition-colors"
                            title="Supprimer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {/* Create promo modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-zinc-800 rounded-2xl border border-zinc-700 p-6 w-full max-w-lg"
          >
            <h3 className="text-xl font-bold text-white mb-4">
              Créer un code promo
            </h3>

            <form onSubmit={handleCreatePromo} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Code
                </label>
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) =>
                    setFormData({ ...formData, code: e.target.value.toUpperCase() })
                  }
                  required
                  placeholder="SUMMER2026"
                  className="w-full px-4 py-2.5 bg-zinc-700 border border-zinc-600 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-violet-500 uppercase"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">
                    Type
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) =>
                      setFormData({ ...formData, type: e.target.value })
                    }
                    className="w-full px-4 py-2.5 bg-zinc-700 border border-zinc-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
                  >
                    <option value="percentage">Pourcentage</option>
                    <option value="fixed">Montant fixe</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">
                    Valeur
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.value}
                    onChange={(e) =>
                      setFormData({ ...formData, value: e.target.value })
                    }
                    required
                    placeholder={formData.type === "percentage" ? "20" : "10.00"}
                    className="w-full px-4 py-2.5 bg-zinc-700 border border-zinc-600 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-violet-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Montant minimum de commande (€)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.min_order_amount}
                  onChange={(e) =>
                    setFormData({ ...formData, min_order_amount: e.target.value })
                  }
                  placeholder="0.00"
                  className="w-full px-4 py-2.5 bg-zinc-700 border border-zinc-600 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Nombre maximum d'utilisations (optionnel)
                </label>
                <input
                  type="number"
                  value={formData.max_uses}
                  onChange={(e) =>
                    setFormData({ ...formData, max_uses: e.target.value })
                  }
                  placeholder="Illimité"
                  className="w-full px-4 py-2.5 bg-zinc-700 border border-zinc-600 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Date d'expiration (optionnel)
                </label>
                <input
                  type="datetime-local"
                  value={formData.expires_at}
                  onChange={(e) =>
                    setFormData({ ...formData, expires_at: e.target.value })
                  }
                  className="w-full px-4 py-2.5 bg-zinc-700 border border-zinc-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-2.5 bg-zinc-700 text-white rounded-xl hover:bg-zinc-600 transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 px-4 py-2.5 bg-violet-600 text-white rounded-xl hover:bg-violet-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Création...
                    </>
                  ) : (
                    "Créer"
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
