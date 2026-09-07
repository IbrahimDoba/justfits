"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Loader2,
  Trash2,
  Upload,
  Image as ImageIcon,
  Save,
} from "lucide-react";

interface Item {
  id: string;
  name: string;
  brand: string | null;
  category: "CAP" | "SHIRT" | "OTHER";
  size: string | null;
  sku: string | null;
  imageUrl: string | null;
  costPrice: number | null;
  sellingPrice: number | null;
  quantity: number;
  notes: string | null;
  isActive: boolean;
}

interface Sibling {
  id: string;
  size: string | null;
  quantity: number;
  sellingPrice: number | null;
}

async function uploadToCloudinary(file: File): Promise<string> {
  const timestamp = Math.round(Date.now() / 1000);
  const folder = "justfits/inventory";
  const paramsToSign = { timestamp, folder };
  const sigRes = await fetch("/api/admin/upload/sign", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ paramsToSign }),
  });
  if (!sigRes.ok) throw new Error("Failed to sign upload");
  const { signature } = await sigRes.json();
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY;
  if (!cloudName || !apiKey) throw new Error("Cloudinary not configured");
  const fd = new FormData();
  fd.append("file", file);
  fd.append("api_key", apiKey);
  fd.append("timestamp", String(timestamp));
  fd.append("signature", signature);
  fd.append("folder", folder);
  const up = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, { method: "POST", body: fd });
  if (!up.ok) throw new Error("Upload failed");
  const data = await up.json();
  return data.secure_url as string;
}

const inputCls =
  "w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-black/10";

export default function InventoryItemPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [item, setItem] = useState<Item | null>(null);
  const [siblings, setSiblings] = useState<Sibling[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dirty, setDirty] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/inventory/${id}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Not found");
      setItem(data.item);
      setSiblings(data.siblings || []);
      setDirty(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  const set = <K extends keyof Item>(k: K, v: Item[K]) => {
    setItem((it) => (it ? { ...it, [k]: v } : it));
    setDirty(true);
  };

  const onUpload = async (file?: File) => {
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadToCloudinary(file);
      set("imageUrl", url);
    } catch (e) {
      alert(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const save = async () => {
    if (!item) return;
    if (!item.name.trim()) {
      alert("Name is required.");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/inventory/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(item),
      });
      if (!res.ok) throw new Error("Save failed");
      await load();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    if (!confirm("Delete this item? This cannot be undone.")) return;
    await fetch(`/api/admin/inventory/${id}`, { method: "DELETE" });
    router.push("/admin/inventory");
  };

  if (loading) {
    return (
      <div className="light-theme min-h-[60vh] flex items-center justify-center text-gray-400">
        <Loader2 className="animate-spin" size={28} />
      </div>
    );
  }
  if (error || !item) {
    return (
      <div className="light-theme min-h-[60vh] flex flex-col items-center justify-center gap-3 text-gray-500">
        <p>{error || "Item not found"}</p>
        <Link href="/admin/inventory" className="text-sm font-medium text-black hover:underline">
          Back to inventory
        </Link>
      </div>
    );
  }

  return (
    <div className="light-theme p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 mb-6">
        <Link
          href="/admin/inventory"
          className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-black"
        >
          <ArrowLeft size={16} /> Inventory
        </Link>
        <button
          onClick={remove}
          className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg"
        >
          <Trash2 size={15} /> Delete
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] gap-6">
        {/* Image column */}
        <div>
          <div className="aspect-square w-full rounded-xl border border-gray-200 bg-gray-50 overflow-hidden flex items-center justify-center">
            {item.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
            ) : (
              <ImageIcon size={48} className="text-gray-300" />
            )}
          </div>

          <label className="mt-3 flex items-center justify-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 cursor-pointer">
            {uploading ? (
              <Loader2 size={15} className="animate-spin" />
            ) : (
              <Upload size={15} />
            )}
            {uploading ? "Uploading…" : "Upload new image"}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => onUpload(e.target.files?.[0])}
            />
          </label>

          <div className="mt-2">
            <label className="text-[11px] font-medium text-gray-500">
              …or paste an image URL
            </label>
            <input
              value={item.imageUrl ?? ""}
              onChange={(e) => set("imageUrl", e.target.value || null)}
              placeholder="https://…"
              className={`${inputCls} mt-1`}
            />
          </div>
          <p className="text-[11px] text-gray-400 mt-2">
            The image is shared across all sizes of this product.
          </p>
        </div>

        {/* Details column */}
        <div className="space-y-4">
          <div>
            <h1 className="text-xl font-bold text-gray-900">{item.name}</h1>
            <p className="text-sm text-gray-500">
              {item.category}
              {item.size ? ` · ${item.size}` : ""} · {item.quantity} in stock
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Name" full>
              <input value={item.name} onChange={(e) => set("name", e.target.value)} className={inputCls} />
            </Field>
            <Field label="Brand">
              <input value={item.brand ?? ""} onChange={(e) => set("brand", e.target.value || null)} className={inputCls} />
            </Field>
            <Field label="Category">
              <select
                value={item.category}
                onChange={(e) => set("category", e.target.value as Item["category"])}
                className={inputCls}
              >
                <option value="CAP">CAP</option>
                <option value="SHIRT">SHIRT</option>
                <option value="OTHER">OTHER</option>
              </select>
            </Field>
            <Field label="Size">
              <input value={item.size ?? ""} onChange={(e) => set("size", e.target.value || null)} placeholder="e.g. L, XL (blank for caps)" className={inputCls} />
            </Field>
            <Field label="SKU">
              <input value={item.sku ?? ""} onChange={(e) => set("sku", e.target.value || null)} className={inputCls} />
            </Field>
            <Field label="Cost price (₦)">
              <input type="number" value={item.costPrice ?? ""} onChange={(e) => set("costPrice", e.target.value === "" ? null : Number(e.target.value))} className={inputCls} />
            </Field>
            <Field label="Selling price (₦)">
              <input type="number" value={item.sellingPrice ?? ""} onChange={(e) => set("sellingPrice", e.target.value === "" ? null : Number(e.target.value))} className={inputCls} />
            </Field>
            <Field label="Quantity">
              <input type="number" min={0} value={item.quantity} onChange={(e) => set("quantity", Math.max(0, Number(e.target.value)))} className={inputCls} />
            </Field>
            <Field label="Status">
              <select value={item.isActive ? "active" : "inactive"} onChange={(e) => set("isActive", e.target.value === "active")} className={inputCls}>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </Field>
            <Field label="Notes" full>
              <input value={item.notes ?? ""} onChange={(e) => set("notes", e.target.value || null)} className={inputCls} />
            </Field>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={save}
              disabled={saving || !dirty}
              className="flex items-center gap-2 px-4 py-2 bg-black text-white text-sm font-medium rounded-lg hover:bg-gray-800 disabled:opacity-50"
            >
              {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
              Save changes
            </button>
            {dirty && <span className="text-xs text-amber-600">Unsaved changes</span>}
          </div>

          {/* Sibling sizes */}
          {siblings.length > 1 && (
            <div className="pt-4 border-t border-gray-100">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                Other sizes of this product
              </h3>
              <div className="flex flex-wrap gap-2">
                {siblings.map((s) => (
                  <Link
                    key={s.id}
                    href={`/admin/inventory/${s.id}`}
                    className={`px-3 py-1.5 rounded-lg border text-sm ${
                      s.id === item.id
                        ? "border-black bg-black text-white"
                        : "border-gray-200 text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    {s.size || "One size"} · {s.quantity}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  full,
  children,
}: {
  label: string;
  full?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className={`block ${full ? "col-span-2" : ""}`}>
      <span className="text-xs font-medium text-gray-600">{label}</span>
      <div className="mt-1">{children}</div>
    </label>
  );
}
