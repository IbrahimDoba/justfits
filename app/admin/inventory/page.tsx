"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Boxes,
  Plus,
  Search,
  Pencil,
  Trash2,
  X,
  Loader2,
  DownloadCloud,
  Package,
  Layers,
  Wallet,
} from "lucide-react";

interface InventoryItem {
  id: string;
  name: string;
  brand: string | null;
  sku: string | null;
  costPrice: number | null;
  sellingPrice: number | null;
  quantity: number;
  notes: string | null;
  productId: string | null;
  isActive: boolean;
}

const naira = (n: number | null | undefined) =>
  n === null || n === undefined
    ? "—"
    : new Intl.NumberFormat("en-NG", {
        style: "currency",
        currency: "NGN",
        minimumFractionDigits: 0,
      }).format(n);

export default function InventoryPage() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [importing, setImporting] = useState(false);
  const [modal, setModal] = useState<{ open: boolean; edit?: InventoryItem }>({
    open: false,
  });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/inventory");
      const data = await res.json();
      setItems(Array.isArray(data.items) ? data.items : []);
    } catch (e) {
      console.error("Failed to load inventory", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return items;
    return items.filter(
      (i) =>
        i.name.toLowerCase().includes(q) ||
        (i.brand || "").toLowerCase().includes(q) ||
        (i.sku || "").toLowerCase().includes(q)
    );
  }, [items, search]);

  const stats = useMemo(() => {
    const totalUnits = items.reduce((s, i) => s + i.quantity, 0);
    const stockValue = items.reduce(
      (s, i) => s + i.quantity * (i.costPrice ?? i.sellingPrice ?? 0),
      0
    );
    const outOfStock = items.filter((i) => i.quantity <= 0).length;
    return { count: items.length, totalUnits, stockValue, outOfStock };
  }, [items]);

  const importFromProducts = async () => {
    setImporting(true);
    try {
      const res = await fetch("/api/admin/inventory/import", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Import failed");
      alert(data.message || "Done");
      await load();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Import failed");
    } finally {
      setImporting(false);
    }
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this inventory item? This cannot be undone.")) return;
    await fetch(`/api/admin/inventory/${id}`, { method: "DELETE" });
    load();
  };

  return (
    <div className="light-theme p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Boxes size={26} /> Inventory
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Stock you can draw from when recording sales
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={importFromProducts}
            disabled={importing}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-900 text-sm font-medium rounded-lg hover:bg-gray-200 disabled:opacity-50"
          >
            {importing ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <DownloadCloud size={16} />
            )}
            Import from products
          </button>
          <button
            onClick={() => setModal({ open: true })}
            className="flex items-center gap-2 px-4 py-2 bg-black text-white text-sm font-medium rounded-lg hover:bg-gray-800"
          >
            <Plus size={16} /> Item
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Items" value={String(stats.count)} icon={<Package className="text-blue-600" size={20} />} />
        <StatCard label="Total units" value={String(stats.totalUnits)} icon={<Layers className="text-purple-600" size={20} />} />
        <StatCard label="Stock value" value={naira(stats.stockValue)} sub="at cost (or price)" icon={<Wallet className="text-green-600" size={20} />} />
        <StatCard label="Out of stock" value={String(stats.outOfStock)} icon={<Boxes className="text-amber-600" size={20} />} />
      </div>

      {/* Search */}
      <div className="relative mb-4 max-w-sm">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search inventory…"
          className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-black/10"
        />
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64 text-gray-400">
          <Loader2 className="animate-spin" size={28} />
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white border border-dashed border-gray-200 rounded-xl p-10 text-center text-gray-400 text-sm">
          No inventory items. Add one or import from your products.
        </div>
      ) : (
        <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-gray-500 border-b border-gray-100">
                <th className="px-4 py-3 font-medium">Item</th>
                <th className="px-4 py-3 font-medium">Brand</th>
                <th className="px-4 py-3 font-medium">SKU</th>
                <th className="px-4 py-3 font-medium text-right">Cost</th>
                <th className="px-4 py-3 font-medium text-right">Price</th>
                <th className="px-4 py-3 font-medium text-right">Qty</th>
                <th className="px-4 py-3 font-medium" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((i) => (
                <tr
                  key={i.id}
                  className={`border-b border-gray-50 hover:bg-gray-50 ${
                    !i.isActive ? "opacity-50" : ""
                  }`}
                >
                  <td className="px-4 py-3 font-medium text-gray-900">
                    {i.name}
                    {!i.isActive && (
                      <span className="ml-2 text-[10px] uppercase text-gray-400">
                        inactive
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{i.brand || "—"}</td>
                  <td className="px-4 py-3 text-gray-500">{i.sku || "—"}</td>
                  <td className="px-4 py-3 text-right text-gray-600">
                    {naira(i.costPrice)}
                  </td>
                  <td className="px-4 py-3 text-right text-gray-900">
                    {naira(i.sellingPrice)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span
                      className={`font-medium ${
                        i.quantity <= 0
                          ? "text-red-600"
                          : i.quantity <= 5
                            ? "text-amber-600"
                            : "text-gray-900"
                      }`}
                    >
                      {i.quantity}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1 justify-end">
                      <button
                        onClick={() => setModal({ open: true, edit: i })}
                        className="p-1.5 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded"
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        onClick={() => remove(i.id)}
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modal.open && (
        <ItemModal
          edit={modal.edit}
          onClose={() => setModal({ open: false })}
          onSaved={() => {
            setModal({ open: false });
            load();
          }}
        />
      )}
    </div>
  );
}

function StatCard({
  label,
  value,
  sub,
  icon,
}: {
  label: string;
  value: string;
  sub?: string;
  icon: React.ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm"
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-gray-500">{label}</span>
        {icon}
      </div>
      <div className="mt-2 text-xl font-bold text-gray-900">{value}</div>
      {sub && <div className="text-xs text-gray-400 mt-1">{sub}</div>}
    </motion.div>
  );
}

const inputCls =
  "w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-black/10";

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="text-xs font-medium text-gray-600">{label}</span>
      <div className="mt-1">{children}</div>
    </label>
  );
}

function ItemModal({
  edit,
  onClose,
  onSaved,
}: {
  edit?: InventoryItem;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState({
    name: edit?.name ?? "",
    brand: edit?.brand ?? "",
    sku: edit?.sku ?? "",
    costPrice: edit?.costPrice ?? "",
    sellingPrice: edit?.sellingPrice ?? "",
    quantity: edit?.quantity ?? 0,
    notes: edit?.notes ?? "",
    isActive: edit?.isActive ?? true,
  });
  const [saving, setSaving] = useState(false);
  const set = (k: string, v: unknown) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async () => {
    if (!form.name.trim()) {
      alert("Name is required.");
      return;
    }
    setSaving(true);
    try {
      const url = edit
        ? `/api/admin/inventory/${edit.id}`
        : "/api/admin/inventory";
      const res = await fetch(url, {
        method: edit ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Save failed");
      onSaved();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40">
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 sticky top-0 bg-white">
          <h3 className="font-semibold text-gray-900">
            {edit ? "Edit item" : "Add item"}
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded"
          >
            <X size={18} />
          </button>
        </div>
        <div className="p-5">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <Field label="Name">
                <input
                  value={form.name}
                  onChange={(e) => set("name", e.target.value)}
                  className={inputCls}
                />
              </Field>
            </div>
            <Field label="Brand">
              <input
                value={form.brand}
                onChange={(e) => set("brand", e.target.value)}
                placeholder="Benz / BMW / Ferrari"
                className={inputCls}
              />
            </Field>
            <Field label="SKU">
              <input
                value={form.sku}
                onChange={(e) => set("sku", e.target.value)}
                className={inputCls}
              />
            </Field>
            <Field label="Cost price (₦)">
              <input
                type="number"
                value={form.costPrice}
                onChange={(e) => set("costPrice", e.target.value)}
                className={inputCls}
              />
            </Field>
            <Field label="Selling price (₦)">
              <input
                type="number"
                value={form.sellingPrice}
                onChange={(e) => set("sellingPrice", e.target.value)}
                className={inputCls}
              />
            </Field>
            <Field label="Quantity in stock">
              <input
                type="number"
                min={0}
                value={form.quantity}
                onChange={(e) => set("quantity", Number(e.target.value))}
                className={inputCls}
              />
            </Field>
            <Field label="Status">
              <select
                value={form.isActive ? "active" : "inactive"}
                onChange={(e) => set("isActive", e.target.value === "active")}
                className={inputCls}
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </Field>
            <div className="col-span-2">
              <Field label="Notes">
                <input
                  value={form.notes}
                  onChange={(e) => set("notes", e.target.value)}
                  className={inputCls}
                />
              </Field>
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-5">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              onClick={submit}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 bg-black text-white text-sm font-medium rounded-lg hover:bg-gray-800 disabled:opacity-50"
            >
              {saving && <Loader2 size={15} className="animate-spin" />}
              Save
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
