"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Plus,
  Edit,
  Trash2,
  FolderTree,
  X,
  Loader2,
  Image as ImageIcon,
} from "lucide-react";

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  productCount: number;
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchCategories = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/admin/categories");
      if (!response.ok) throw new Error("Failed to fetch categories");
      const data = await response.json();
      setCategories(data.categories);
    } catch (err) {
      console.error("Error fetching categories:", err);
      setError("Failed to load categories");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const openCreateModal = () => {
    setEditingCategory(null);
    setFormData({ name: "", slug: "", description: "" });
    setShowModal(true);
  };

  const openEditModal = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      slug: category.slug,
      description: category.description || "",
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const method = editingCategory ? "PUT" : "POST";
      const body = editingCategory
        ? { ...formData, id: editingCategory.id }
        : formData;

      const response = await fetch("/api/admin/categories", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!response.ok) throw new Error("Failed to save category");

      await fetchCategories();
      setShowModal(false);
    } catch (err) {
      console.error("Error saving category:", err);
      alert("Failed to save category");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this category?")) return;

    try {
      const response = await fetch(`/api/admin/categories?id=${id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete category");

      await fetchCategories();
    } catch (err) {
      console.error("Error deleting category:", err);
      alert("Failed to delete category");
    }
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  };

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-display tracking-tight text-gray-900">
            Categories
          </h1>
          <p className="text-gray-500 mt-1">
            Organize your products into categories
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-black text-white rounded-xl font-medium hover:bg-gray-800 transition-colors"
        >
          <Plus size={20} />
          Add Category
        </button>
      </div>

      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
        </div>
      ) : error ? (
        <div className="text-center text-red-500 py-12">{error}</div>
      ) : (
        /* Categories Grid */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {categories.map((category, index) => (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center overflow-hidden">
                  {category.image ? (
                    <img
                      src={category.image}
                      alt={category.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <FolderTree size={24} className="text-gray-500" />
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => openEditModal(category)}
                    className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <Edit size={16} className="text-gray-500" />
                  </button>
                  <button
                    onClick={() => handleDelete(category.id)}
                    className="p-2 rounded-lg hover:bg-red-50 transition-colors"
                  >
                    <Trash2 size={16} className="text-red-500" />
                  </button>
                </div>
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">
                {category.name}
              </h3>
              <p className="text-sm text-gray-500 font-mono">
                /{category.slug}
              </p>
              <p className="text-sm text-gray-400 mt-2">
                {category.productCount} products
              </p>
            </motion.div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl w-full max-w-md p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                {editingCategory ? "Edit Category" : "New Category"}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <X size={20} className="text-gray-500" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => {
                    setFormData({
                      ...formData,
                      name: e.target.value,
                      slug: generateSlug(e.target.value),
                    });
                  }}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                  placeholder="e.g., Limited Edition"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Slug
                </label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) =>
                    setFormData({ ...formData, slug: e.target.value })
                  }
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent font-mono"
                  placeholder="e.g., limited-edition"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                  placeholder="Description..."
                  rows={3}
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl font-medium text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2.5 bg-black text-white rounded-xl font-medium hover:bg-gray-800 transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
