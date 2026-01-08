"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, X, Plus, Trash2, Save, Wand2, Loader2 } from "lucide-react";
import ImageUpload from "@/components/admin/ImageUpload";
import AiImageGeneratorModal from "@/components/admin/AiImageGeneratorModal";

interface Category {
  id: string;
  name: string;
}

interface ProductVariant {
  id: string;
  size: string;
  color: string;
  sku: string;
  price: number;
  stock: number;
}

const sizes = ["XS", "S", "M", "L", "XL", "XXL"];

export default function NewProductPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);

  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    basePrice: "",
    compareAtPrice: "",
    categoryId: "",
    tags: "",
    status: "draft",
    metaTitle: "",
    metaDescription: "",
  });

  const [variants, setVariants] = useState<ProductVariant[]>([
    { id: "1", size: "M", color: "Black", sku: "", price: 0, stock: 0 },
  ]);

  const [images, setImages] = useState<string[]>([]);

  // AI Generation State
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [isGeneratingDetails, setIsGeneratingDetails] = useState(false);

  const handleAiPrefill = async () => {
    if (!formData.name.trim()) {
      alert("Please enter a product name first");
      return;
    }

    setIsGeneratingDetails(true);
    try {
      const response = await fetch("/api/admin/generate-product-details", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productName: formData.name }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate details");
      }

      const data = await response.json();
      setFormData((prev) => ({
        ...prev,
        slug: data.slug || prev.slug,
        description: data.description || prev.description,
      }));
    } catch (err) {
      console.error("AI prefill error:", err);
      alert("Failed to generate details. Please try again.");
    } finally {
      setIsGeneratingDetails(false);
    }
  };

  useEffect(() => {
    // Fetch categories for dropdown
    const fetchCategories = async () => {
      try {
        const response = await fetch("/api/admin/categories");
        if (response.ok) {
          const data = await response.json();
          setCategories(data.categories);
        }
      } catch (err) {
        console.error("Error fetching categories:", err);
      }
    };
    fetchCategories();
  }, []);

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  };

  const handleNameChange = (name: string) => {
    setFormData({
      ...formData,
      name,
      slug: !formData.slug ? generateSlug(name) : formData.slug,
    });
  };

  const addVariant = () => {
    setVariants([
      ...variants,
      {
        id: String(Date.now()),
        size: "M",
        color: "",
        sku: "",
        price: Number(formData.basePrice) || 0,
        stock: 0,
      },
    ]);
  };

  const removeVariant = (id: string) => {
    if (variants.length > 1) {
      setVariants(variants.filter((v) => v.id !== id));
    }
  };

  const updateVariant = (
    id: string,
    field: keyof ProductVariant,
    value: string | number
  ) => {
    setVariants(
      variants.map((v) => (v.id === id ? { ...v, [field]: value } : v))
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const payload = {
        ...formData,
        basePrice: Number(formData.basePrice),
        compareAtPrice: formData.compareAtPrice
          ? Number(formData.compareAtPrice)
          : null,
        variants: variants.map(({ id, ...rest }) => rest), // Remove temp ID
        images: images.filter((img) => img.length > 0), // Only valid images
      };

      const response = await fetch("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create product");
      }

      router.push("/admin/products");
    } catch (err) {
      console.error("Error creating product:", err);
      alert(err instanceof Error ? err.message : "Failed to create product");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAiImageGenerated = (imageUrl: string) => {
    setImages([...images, imageUrl]);
    // Note to user in app: These expire after 1 hour unless saved (submission saves them depending on backend logic)
  };

  return (
    <div className="p-6 lg:p-8">
      {/* AI Modal */}
      <AiImageGeneratorModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        productName={formData.name}
        existingImages={images}
        onImageGenerated={handleAiImageGenerated}
      />

      {/* Header */}
      <div className="mb-8">
        <Link
          href="/admin/products"
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 mb-4"
        >
          <ArrowLeft size={16} />
          Back to Products
        </Link>
        <h1 className="text-3xl font-display tracking-tight text-gray-900">
          New Product
        </h1>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">
                  Basic Information
                </h2>
                <button
                  type="button"
                  onClick={handleAiPrefill}
                  disabled={isGeneratingDetails || !formData.name.trim()}
                  className="inline-flex items-center gap-2 text-sm text-purple-600 hover:text-purple-800 bg-purple-50 px-3 py-1.5 rounded-lg transition-colors border border-purple-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isGeneratingDetails ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Wand2 size={16} />
                      AI Prefill
                    </>
                  )}
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Product Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent text-gray-900 bg-white"
                    placeholder="e.g., Mercedes Classic Cap"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    URL Slug
                  </label>
                  <div className="flex items-center">
                    <span className="text-gray-400 text-sm mr-2">
                      /products/
                    </span>
                    <input
                      type="text"
                      value={formData.slug}
                      onChange={(e) =>
                        setFormData({ ...formData, slug: e.target.value })
                      }
                      className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent font-mono text-sm text-gray-900 bg-white"
                    />
                  </div>
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
                    rows={4}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent resize-none text-gray-900 bg-white"
                    placeholder="Describe your product..."
                  />
                </div>
              </div>
            </motion.div>

            {/* Images */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Images</h2>
                <button
                  type="button"
                  onClick={() => setIsAiModalOpen(true)}
                  className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 bg-blue-50 px-3 py-1.5 rounded-lg transition-colors border border-blue-100"
                >
                  <Wand2 size={16} />
                  Generate with AI
                </button>
              </div>

              <ImageUpload
                value={images}
                onChange={(newImages) => setImages(newImages)}
                onRemove={(url) =>
                  setImages(images.filter((img) => img !== url))
                }
              />

              <p className="text-xs text-gray-500 mt-4">
                First image will be the primary image. Images are uploaded to
                Cloudinary.
              </p>
            </motion.div>

            {/* Variants */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">
                  Variants
                </h2>
                <button
                  type="button"
                  onClick={addVariant}
                  className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800"
                >
                  <Plus size={16} />
                  Add Variant
                </button>
              </div>
              <div className="space-y-4">
                {variants.map((variant, index) => (
                  <div
                    key={variant.id}
                    className="p-4 bg-gray-50 rounded-xl space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">
                        Variant {index + 1}
                      </span>
                      {variants.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeVariant(variant.id)}
                          className="p-1 text-red-500 hover:bg-red-50 rounded"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                      <select
                        value={variant.size}
                        onChange={(e) =>
                          updateVariant(variant.id, "size", e.target.value)
                        }
                        className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black text-gray-900 bg-white"
                      >
                        {sizes.map((size) => (
                          <option key={size} value={size}>
                            {size}
                          </option>
                        ))}
                      </select>
                      <input
                        type="text"
                        value={variant.color}
                        onChange={(e) =>
                          updateVariant(variant.id, "color", e.target.value)
                        }
                        className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black text-gray-900 bg-white"
                        placeholder="Color"
                      />
                      <input
                        type="text"
                        value={variant.sku}
                        onChange={(e) =>
                          updateVariant(variant.id, "sku", e.target.value)
                        }
                        className="px-3 py-2 border border-gray-200 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-black text-gray-900 bg-white"
                        placeholder="SKU"
                      />
                      <input
                        type="number"
                        value={variant.price || ""}
                        onChange={(e) =>
                          updateVariant(
                            variant.id,
                            "price",
                            Number(e.target.value)
                          )
                        }
                        className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black text-gray-900 bg-white"
                        placeholder="Price"
                      />
                      <input
                        type="number"
                        value={variant.stock || ""}
                        onChange={(e) =>
                          updateVariant(
                            variant.id,
                            "stock",
                            Number(e.target.value)
                          )
                        }
                        className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black text-gray-900 bg-white"
                        placeholder="Stock"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Status */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
            >
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Status
              </h2>
              <select
                value={formData.status}
                onChange={(e) =>
                  setFormData({ ...formData, status: e.target.value })
                }
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent text-gray-900 bg-white"
              >
                <option value="draft">Draft</option>
                <option value="active">Active</option>
                <option value="archived">Archived</option>
              </select>
            </motion.div>

            {/* Pricing */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
            >
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Pricing
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Base Price (₦)
                  </label>
                  <input
                    type="number"
                    value={formData.basePrice}
                    onChange={(e) =>
                      setFormData({ ...formData, basePrice: e.target.value })
                    }
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent text-gray-900 bg-white"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Compare at Price (₦)
                  </label>
                  <input
                    type="number"
                    value={formData.compareAtPrice}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        compareAtPrice: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent text-gray-900 bg-white"
                    placeholder="0"
                  />
                </div>
              </div>
            </motion.div>

            {/* Category */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
            >
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Category
              </h2>
              <select
                value={formData.categoryId}
                onChange={(e) =>
                  setFormData({ ...formData, categoryId: e.target.value })
                }
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent text-gray-900 bg-white"
              >
                <option value="">Select category</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </motion.div>

            {/* Tags */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
            >
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Tags</h2>
              <input
                type="text"
                value={formData.tags}
                onChange={(e) =>
                  setFormData({ ...formData, tags: e.target.value })
                }
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent text-gray-900 bg-white"
                placeholder="luxury, premium, limited"
              />
              <p className="text-xs text-gray-500 mt-2">
                Separate tags with commas
              </p>
            </motion.div>

            {/* Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="flex gap-3"
            >
              <Link
                href="/admin/products"
                className="flex-1 px-4 py-3 text-center border border-gray-200 rounded-xl font-medium text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 bg-black text-white rounded-xl font-medium hover:bg-gray-800 transition-colors disabled:opacity-50"
              >
                <Save size={18} />
                {isSubmitting ? "Saving..." : "Save Product"}
              </button>
            </motion.div>
          </div>
        </div>
      </form>
    </div>
  );
}
