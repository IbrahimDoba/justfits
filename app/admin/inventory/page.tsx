"use client";

import { Fragment, useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Boxes,
  Plus,
  Minus,
  Search,
  Pencil,
  Trash2,
  X,
  Loader2,
  DownloadCloud,
  Package,
  Layers,
  Wallet,
  ChevronRight,
  ChevronDown,
} from "lucide-react";

type Category = "CAP" | "SHIRT" | "OTHER";
const CATEGORY_LABELS: Record<Category, string> = {
  CAP: "Caps",
  SHIRT: "Shirts",
  OTHER: "Other",
};
const CATEGORY_ORDER: Category[] = ["CAP", "SHIRT", "OTHER"];
const guessCategory = (name: string): Category =>
  /shirt|polo|tee|jersey/i.test(name)
    ? "SHIRT"
    : /cap|hat/i.test(name)
      ? "CAP"
      : "OTHER";

interface InventoryItem {
  id: string;
  name: string;
  brand: string | null;
  category: Category;
  size: string | null;
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
  const [category, setCategory] = useState<"ALL" | Category>("ALL");
  const [groupBy, setGroupBy] = useState<"none" | "brand" | "category">("none");
  const [importing, setImporting] = useState(false);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [modal, setModal] = useState<{
    open: boolean;
    edit?: InventoryItem;
    preset?: Partial<InventoryItem>;
  }>({ open: false });

  const toggleGroup = (name: string) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
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
    const byCategory =
      category === "ALL" ? items : items.filter((i) => i.category === category);
    if (!q) return byCategory;
    return byCategory.filter(
      (i) =>
        i.name.toLowerCase().includes(q) ||
        (i.brand || "").toLowerCase().includes(q) ||
        (i.size || "").toLowerCase().includes(q) ||
        (i.sku || "").toLowerCase().includes(q)
    );
  }, [items, search, category]);

  // Units per category for the filter pills (whole inventory, not filtered).
  const categoryUnits = useMemo(() => {
    const u: Record<"ALL" | Category, number> = { ALL: 0, CAP: 0, SHIRT: 0, OTHER: 0 };
    for (const i of items) {
      u.ALL += i.quantity;
      u[i.category] += i.quantity;
    }
    return u;
  }, [items]);

  // Group items that share a name (e.g. a shirt across sizes) into one
  // expandable group; single one-size items (caps) render as plain rows.
  const groups = useMemo(() => {
    const map = new Map<string, InventoryItem[]>();
    for (const i of filtered) {
      const arr = map.get(i.name) ?? [];
      arr.push(i);
      map.set(i.name, arr);
    }
    return Array.from(map.entries()).map(([name, groupItems]) => {
      const totalQty = groupItems.reduce((s, i) => s + i.quantity, 0);
      const totalValue = groupItems.reduce(
        (s, i) => s + i.quantity * (i.sellingPrice ?? i.costPrice ?? 0),
        0
      );
      const prices = Array.from(
        new Set(groupItems.map((i) => i.sellingPrice ?? 0))
      );
      const grouped = groupItems.length > 1 || groupItems[0].size != null;
      return {
        name,
        items: groupItems,
        brand: groupItems[0].brand,
        category: groupItems[0].category,
        totalQty,
        totalValue,
        prices,
        grouped,
      };
    });
  }, [filtered]);

  // Optional section headers: by brand, or by category (Caps / Shirts / Other).
  const sections = useMemo(() => {
    if (groupBy === "none")
      return [{ key: "all", label: "", groups, units: 0, value: 0 }];
    const map = new Map<string, typeof groups>();
    for (const g of groups) {
      const key =
        groupBy === "brand" ? g.brand || "Unbranded" : CATEGORY_LABELS[g.category];
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(g);
    }
    const rank = (k: string) =>
      groupBy === "category"
        ? CATEGORY_ORDER.findIndex((c) => CATEGORY_LABELS[c] === k)
        : 0;
    return Array.from(map.entries())
      .sort(([a], [b]) => rank(a) - rank(b) || a.localeCompare(b))
      .map(([key, gs]) => ({
        key,
        label: key,
        groups: gs,
        units: gs.reduce((s, g) => s + g.totalQty, 0),
        value: gs.reduce((s, g) => s + g.totalValue, 0),
      }));
  }, [groups, groupBy]);

  const stats = useMemo(() => {
    const totalUnits = items.reduce((s, i) => s + i.quantity, 0);
    const stockValue = items.reduce(
      (s, i) => s + i.quantity * (i.sellingPrice ?? i.costPrice ?? 0),
      0
    );
    const outOfStock = items.filter((i) => i.quantity <= 0).length;
    const products = new Set(items.map((i) => i.name)).size;
    return { products, lines: items.length, totalUnits, stockValue, outOfStock };
  }, [items]);

  // Optimistic atomic add/deduct (clamped at 0 on the server).
  const adjust = async (item: InventoryItem, delta: number) => {
    if (item.quantity + delta < 0) return;
    setItems((prev) =>
      prev.map((i) =>
        i.id === item.id ? { ...i, quantity: Math.max(0, i.quantity + delta) } : i
      )
    );
    try {
      const res = await fetch(`/api/admin/inventory/${item.id}/adjust`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ delta }),
      });
      const data = await res.json();
      if (res.ok && data.item) {
        setItems((prev) =>
          prev.map((i) =>
            i.id === item.id ? { ...i, quantity: data.item.quantity } : i
          )
        );
      } else {
        load();
      }
    } catch {
      load();
    }
  };

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
        <StatCard label="Products" value={String(stats.products)} sub={`${stats.lines} stock lines`} icon={<Package className="text-blue-600" size={20} />} />
        <StatCard label="Total units" value={String(stats.totalUnits)} icon={<Layers className="text-purple-600" size={20} />} />
        <StatCard label="Stock value" value={naira(stats.stockValue)} sub="at selling price" icon={<Wallet className="text-green-600" size={20} />} />
        <StatCard label="Out of stock" value={String(stats.outOfStock)} icon={<Boxes className="text-amber-600" size={20} />} />
      </div>

      {/* Toolbar: search · category filter · group by */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <div className="relative w-full sm:w-72">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search inventory…"
            className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-black/10"
          />
        </div>
        <div className="flex items-center gap-1 rounded-lg border border-gray-200 bg-white p-1">
          {(["ALL", ...CATEGORY_ORDER] as const).map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                category === c
                  ? "bg-black text-white"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              {c === "ALL" ? "All" : CATEGORY_LABELS[c]}
              <span className={`ml-1.5 tabular-nums ${category === c ? "text-gray-300" : "text-gray-400"}`}>
                {categoryUnits[c]}
              </span>
            </button>
          ))}
        </div>
        <label className="flex items-center gap-2 text-xs text-gray-500">
          Group by
          <select
            value={groupBy}
            onChange={(e) => setGroupBy(e.target.value as typeof groupBy)}
            className="px-2.5 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-black/10"
          >
            <option value="none">Product</option>
            <option value="brand">Brand</option>
            <option value="category">Caps / Shirts</option>
          </select>
        </label>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64 text-gray-400">
          <Loader2 className="animate-spin" size={28} />
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white border border-dashed border-gray-200 rounded-xl p-10 text-center text-gray-400 text-sm">
          {search || category !== "ALL"
            ? "No items match this filter."
            : "No inventory items. Add one or import from your products."}
        </div>
      ) : (
        <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-gray-500 border-b border-gray-100">
                <th className="px-4 py-3 font-medium">Item</th>
                <th className="px-4 py-3 font-medium">Brand</th>
                <th className="px-4 py-3 font-medium">Size</th>
                <th className="px-4 py-3 font-medium text-right">Cost</th>
                <th className="px-4 py-3 font-medium text-right">Price</th>
                <th className="px-4 py-3 font-medium text-center">Stock</th>
                <th className="px-4 py-3 font-medium text-right">Value</th>
                <th className="px-4 py-3 font-medium" />
              </tr>
            </thead>
            <tbody>
              {sections.map((sec) => (
                <Fragment key={sec.key}>
                  {groupBy !== "none" && (
                    <tr className="bg-gray-100/80 border-b border-gray-200">
                      <td colSpan={5} className="px-4 py-2 text-[11px] font-semibold uppercase tracking-wide text-gray-600">
                        {sec.label}
                        <span className="ml-2 font-normal normal-case tracking-normal text-gray-400">
                          {sec.groups.length} product{sec.groups.length === 1 ? "" : "s"}
                        </span>
                      </td>
                      <td className="px-4 py-2 text-center text-xs font-semibold tabular-nums text-gray-700">
                        {sec.units}
                      </td>
                      <td className="px-4 py-2 text-right text-xs font-semibold tabular-nums text-gray-700">
                        {naira(sec.value)}
                      </td>
                      <td />
                    </tr>
                  )}
                  {sec.groups.map((g) => {
                // Single one-size item (cap): plain row.
                if (!g.grouped) {
                  const i = g.items[0];
                  return (
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
                      <td className="px-4 py-3 text-gray-600">
                        {i.brand || "—"}
                      </td>
                      <td className="px-4 py-3 text-gray-400">—</td>
                      <td className="px-4 py-3 text-right text-gray-600">
                        {naira(i.costPrice)}
                      </td>
                      <td className="px-4 py-3 text-right text-gray-900">
                        {naira(i.sellingPrice)}
                      </td>
                      <StockCell item={i} onAdjust={adjust} />
                      <td className="px-4 py-3 text-right text-gray-600 tabular-nums">
                        {naira(i.quantity * (i.sellingPrice ?? i.costPrice ?? 0))}
                      </td>
                      <ActionsCell
                        onEdit={() => setModal({ open: true, edit: i })}
                        onDelete={() => remove(i.id)}
                      />
                    </tr>
                  );
                }

                // Grouped product (e.g. shirt across sizes): expandable.
                const isOpen = expanded.has(g.name);
                const priceLabel =
                  g.prices.length === 1
                    ? naira(g.prices[0])
                    : `${naira(Math.min(...g.prices))}–${naira(
                        Math.max(...g.prices)
                      )}`;
                return (
                  <Fragment key={g.name}>
                    <tr
                      className="border-b border-gray-50 hover:bg-gray-50 cursor-pointer bg-gray-50/40"
                      onClick={() => toggleGroup(g.name)}
                    >
                      <td className="px-4 py-3 font-medium text-gray-900">
                        <div className="flex items-center gap-1.5">
                          {isOpen ? (
                            <ChevronDown size={15} className="text-gray-400" />
                          ) : (
                            <ChevronRight size={15} className="text-gray-400" />
                          )}
                          {g.name}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {g.brand || "—"}
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-block px-2 py-0.5 rounded-full bg-gray-200 text-xs font-medium text-gray-700">
                          {g.items.length} size{g.items.length === 1 ? "" : "s"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right text-gray-400">—</td>
                      <td className="px-4 py-3 text-right text-gray-900">
                        {priceLabel}
                      </td>
                      <td className="px-4 py-3 text-center font-semibold tabular-nums text-gray-900">
                        {g.totalQty}
                      </td>
                      <td className="px-4 py-3 text-right font-medium text-gray-800 tabular-nums">
                        {naira(g.totalValue)}
                      </td>
                      <td className="px-4 py-3" />
                    </tr>

                    {isOpen &&
                      g.items.map((i) => (
                        <tr
                          key={i.id}
                          className={`border-b border-gray-50 bg-white ${
                            !i.isActive ? "opacity-50" : ""
                          }`}
                        >
                          <td className="pl-10 pr-4 py-2.5 text-gray-500 text-xs">
                            ↳ {i.name}
                          </td>
                          <td className="px-4 py-2.5 text-gray-500 text-xs">
                            {i.brand || ""}
                          </td>
                          <td className="px-4 py-2.5">
                            <span className="inline-block px-2 py-0.5 rounded bg-gray-100 text-xs font-medium text-gray-700">
                              {i.size || "—"}
                            </span>
                          </td>
                          <td className="px-4 py-2.5 text-right text-gray-600">
                            {naira(i.costPrice)}
                          </td>
                          <td className="px-4 py-2.5 text-right text-gray-900">
                            {naira(i.sellingPrice)}
                          </td>
                          <StockCell item={i} onAdjust={adjust} compact />
                          <td className="px-4 py-2.5 text-right text-gray-600 tabular-nums">
                            {naira(
                              i.quantity * (i.sellingPrice ?? i.costPrice ?? 0)
                            )}
                          </td>
                          <ActionsCell
                            onEdit={() => setModal({ open: true, edit: i })}
                            onDelete={() => remove(i.id)}
                          />
                        </tr>
                      ))}

                    {isOpen && (
                      <tr className="border-b border-gray-100 bg-white">
                        <td colSpan={8} className="pl-10 pr-4 py-2">
                          <button
                            onClick={() =>
                              setModal({
                                open: true,
                                preset: {
                                  name: g.name,
                                  brand: g.brand,
                                  sellingPrice: g.prices[0] || null,
                                },
                              })
                            }
                            className="text-xs font-medium text-gray-500 hover:text-gray-900 flex items-center gap-1"
                          >
                            <Plus size={13} /> Add size
                          </button>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
                  })}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modal.open && (
        <ItemModal
          edit={modal.edit}
          preset={modal.preset}
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

function StockCell({
  item,
  onAdjust,
  compact,
}: {
  item: InventoryItem;
  onAdjust: (i: InventoryItem, delta: number) => void;
  compact?: boolean;
}) {
  return (
    <td className={`px-4 ${compact ? "py-2.5" : "py-3"}`}>
      <div className="flex items-center justify-center gap-1.5">
        <button
          onClick={() => onAdjust(item, -1)}
          disabled={item.quantity <= 0}
          title="Deduct 1"
          className="w-6 h-6 flex items-center justify-center rounded border border-gray-200 text-gray-500 hover:bg-gray-100 hover:text-gray-900 disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <Minus size={13} />
        </button>
        <span
          className={`w-8 text-center font-semibold tabular-nums ${
            item.quantity <= 0
              ? "text-red-600"
              : item.quantity <= 5
                ? "text-amber-600"
                : "text-gray-900"
          }`}
        >
          {item.quantity}
        </span>
        <button
          onClick={() => onAdjust(item, 1)}
          title="Add 1"
          className="w-6 h-6 flex items-center justify-center rounded border border-gray-200 text-gray-500 hover:bg-gray-100 hover:text-gray-900"
        >
          <Plus size={13} />
        </button>
      </div>
    </td>
  );
}

function ActionsCell({
  onEdit,
  onDelete,
}: {
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <td className="px-4 py-3">
      <div className="flex items-center gap-1 justify-end">
        <button
          onClick={onEdit}
          className="p-1.5 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded"
        >
          <Pencil size={15} />
        </button>
        <button
          onClick={onDelete}
          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
        >
          <Trash2 size={15} />
        </button>
      </div>
    </td>
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
  preset,
  onClose,
  onSaved,
}: {
  edit?: InventoryItem;
  preset?: Partial<InventoryItem>;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState({
    name: edit?.name ?? preset?.name ?? "",
    brand: edit?.brand ?? preset?.brand ?? "",
    category:
      edit?.category ?? preset?.category ?? guessCategory(preset?.name ?? ""),
    size: edit?.size ?? preset?.size ?? "",
    sku: edit?.sku ?? "",
    costPrice: edit?.costPrice ?? "",
    sellingPrice: edit?.sellingPrice ?? preset?.sellingPrice ?? "",
    quantity: edit?.quantity ?? 0,
    notes: edit?.notes ?? "",
    isActive: edit?.isActive ?? true,
  });
  const [saving, setSaving] = useState(false);
  const [categoryTouched, setCategoryTouched] = useState(!!edit);
  const set = (k: string, v: unknown) => setForm((f) => ({ ...f, [k]: v }));
  // New items: follow the name until the user picks a category themselves.
  const setName = (name: string) =>
    setForm((f) => ({
      ...f,
      name,
      category: categoryTouched ? f.category : guessCategory(name),
    }));

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
                  onChange={(e) => setName(e.target.value)}
                  className={inputCls}
                />
              </Field>
            </div>
            <Field label="Category">
              <select
                value={form.category}
                onChange={(e) => {
                  setCategoryTouched(true);
                  set("category", e.target.value);
                }}
                className={inputCls}
              >
                {CATEGORY_ORDER.map((c) => (
                  <option key={c} value={c}>
                    {CATEGORY_LABELS[c]}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Brand">
              <input
                value={form.brand}
                onChange={(e) => set("brand", e.target.value)}
                placeholder="Benz / BMW / Ferrari"
                className={inputCls}
              />
            </Field>
            <Field label="Size">
              <input
                value={form.size}
                onChange={(e) => set("size", e.target.value)}
                placeholder="L / XL / XXL (blank for caps)"
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
